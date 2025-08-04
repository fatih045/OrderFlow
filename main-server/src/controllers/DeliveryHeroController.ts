import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DeliveryHeroService } from '../services/DeliveryHeroService';

const prisma = new PrismaClient();
const deliveryHeroService = new DeliveryHeroService();

export class DeliveryHeroController {
    // 1. Sipariş durumunu güncelle (ör: order_accepted, order_rejected, order_picked_up)
    async updateOrderStatus(req: Request, res: Response) {
        const { orderToken } = req.params;
        const statusPayload = req.body;
        try {
            const order = await prisma.order.findUnique({ where: { token: orderToken } });
            if (!order) {
                return res.status(404).json({ success: false, error: 'Sipariş bulunamadı' });
            }
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
                default:
                    return res.status(400).json({ success: false, error: 'Geçersiz status tipi' });
            }
            if (!callbackUrl) {
                return res.status(400).json({ success: false, error: 'Callback URL yok, istek atlanmadı.' });
            }
            const result = await deliveryHeroService.updateOrderStatus(order, statusPayload, callbackUrl);
            if (!result.success) {
                return res.status(500).json({ success: false, error: result.error });
            }
            // DB'de de status alanını güncelle
            await prisma.order.update({
                where: { token: orderToken },
                data: { status: statusPayload.status }
            });
            return res.status(200).json({ success: true, data: result.data });
        } catch (err) {
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