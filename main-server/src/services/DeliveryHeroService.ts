import axios from 'axios';
import { Order } from '@prisma/client';

export class DeliveryHeroService {
    // 1. Sipariş durumunu güncelle (PUT)
    async updateOrderStatus(order: Order, statusPayload: any, callbackUrl?: string): Promise<{ success: boolean; data?: any; error?: any }> {
        if (!callbackUrl) {
            return { success: false, error: 'Callback URL yok, istek atlanıyor.' };
        }
        try {
            const response = await axios.put(callbackUrl, statusPayload, {
                // headers: { Authorization: `Bearer ${token}` }, // Şimdilik token yok
                headers: { 'Content-Type': 'application/json' },
            });
            return { success: true, data: response.data };
        } catch (error: any) {
            return { success: false, error: error?.response?.data || error.message };
        }
    }

    // 2. Siparişi "hazırlandı" olarak işaretle (POST)
    async markOrderPrepared(order: Order, callbackUrl?: string): Promise<{ success: boolean; data?: any; error?: any }> {
        if (!callbackUrl) {
            return { success: false, error: 'Callback URL yok, istek atlanıyor.' };
        }
        try {
            const response = await axios.post(callbackUrl, {}, {
                // headers: { Authorization: `Bearer ${token}` },
                headers: { 'Content-Type': 'application/json' },
            });
            return { success: true, data: response.data };
        } catch (error: any) {
            return { success: false, error: error?.response?.data || error.message };
        }
    }
} 