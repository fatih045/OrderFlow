import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DeliveryHeroService } from '../services/DeliveryHeroService';
import { broadcastStatusUpdate, broadcastOrderAccepted, broadcastOrderRejected } from '../ws/websocket';

const prisma = new PrismaClient();
const deliveryHeroService = new DeliveryHeroService();

export class DeliveryHeroController {
    // 1. Sipariş durumunu güncelle (ör: order_accepted, order_rejected, order_picked_up)
    async updateOrderStatus(req: Request, res: Response) {
        const { orderToken } = req.params;
        const statusPayload = req.body;
        try {
            console.log(`Sipariş durumu güncelleme isteği: ${orderToken}`, statusPayload);

            const order = await prisma.order.findUnique({ where: { token: orderToken } });
            if (!order) {
                console.log(`Sipariş bulunamadı: ${orderToken}`);
                return res.status(404).json({ success: false, error: 'Sipariş bulunamadı' });
            }

            console.log(`Sipariş bulundu: ${order.id}, mevcut status: ${order.status}`);

            // Callback URL seçimi: status tipine göre
            let callbackUrl: string | undefined;
            switch (statusPayload.status) {
                case 'order_accepted':
                    callbackUrl = order.orderAcceptedUrl || undefined;
                    break;
                case 'order_rejected':
                    callbackUrl = order.orderRejectedUrl || undefined;
                    break;
                case 'order_picked_up':
                    callbackUrl = order.orderPickedUpUrl || undefined;
                    break;
                case 'order_preparing':
                case 'order_ready':
                case 'order_delivered':
                case 'order_prepared':
                    // Bu durumlar için callback URL kontrolü yapmıyoruz
                    callbackUrl = undefined;
                    break;
                default:
                    console.log(`Geçersiz status tipi: ${statusPayload.status}`);
                    return res.status(400).json({ success: false, error: 'Geçersiz status tipi' });
            }

            // Eğer callback URL varsa, external service'e istek gönder
            if (callbackUrl) {
                console.log(`Callback URL bulundu: ${callbackUrl}`);
                try {
                    const result = await deliveryHeroService.updateOrderStatus(order, statusPayload, callbackUrl);
                    if (!result.success) {
                        console.error(`External service hatası: ${result.error}`);
                        // External service hatası olsa bile local güncellemeyi yapalım
                        console.log(`External service hatası var ama local güncelleme yapılıyor`);
                    } else {
                        console.log(`External service başarılı`);
                    }
                } catch (error) {
                    console.error(`External service exception:`, error);
                    // Exception olsa bile local güncellemeyi yapalım
                }
            } else {
                console.log(`Callback URL yok, sadece local güncelleme yapılıyor`);
            }

            // DB'de status alanını güncelle
            await prisma.order.update({
                where: { token: orderToken },
                data: { status: statusPayload.status }
            });

            // WebSocket'e durum güncellemesi gönder
            broadcastStatusUpdate(order.id, statusPayload.status, order.code);

            // Özel durumlar için ek broadcast'ler
            if (statusPayload.status === 'order_accepted') {
                broadcastOrderAccepted(order);
            } else if (statusPayload.status === 'order_rejected') {
                broadcastOrderRejected(order);
            }

            console.log(`Sipariş durumu başarıyla güncellendi: ${statusPayload.status}`);
            return res.status(200).json({ success: true, message: 'Sipariş durumu güncellendi' });
        } catch (err) {
            console.error('Sipariş durumu güncelleme hatası:', err);
            return res.status(500).json({ success: false, error: 'Sunucu hatası' });
        }
    }

    // 2. Siparişi "hazırlandı" olarak işaretle (sadece Delivery Hero kuryesi için)
    async markOrderPrepared(req: Request, res: Response) {
        const { orderToken } = req.params;
        try {
            const order = await prisma.order.findUnique({ where: { token: orderToken } });
            if (!order) {
                return res.status(404).json({ success: false, error: 'Sipariş bulunamadı' });
            }
            // Sadece Delivery Hero kuryesiyle teslim edilen siparişlerde ve callback varsa
            if (!order.orderPreparedUrl) {
                return res.status(400).json({ success: false, error: 'orderPreparedUrl yok, istek atlanmadı.' });
            }
            // Teslimat tipi kontrolü (ör: sadece delivery ve riderPickupTime varsa)
            if (order.expeditionType !== 'delivery') {
                return res.status(400).json({ success: false, error: 'Bu endpoint sadece Delivery Hero kuryesiyle teslimat için kullanılabilir.' });
            }
            // İsteği gönder
            const result = await deliveryHeroService.markOrderPrepared(order, order.orderPreparedUrl);
            if (!result.success) {
                return res.status(500).json({ success: false, error: result.error });
            }
            // DB'de de status alanını 'order_prepared' olarak güncelle
            await prisma.order.update({
                where: { token: orderToken },
                data: { status: 'order_prepared' }
            });
            return res.status(200).json({ success: true, data: result.data });
        } catch (err) {
            return res.status(500).json({ success: false, error: 'Sunucu hatası' });
        }
    }
} 