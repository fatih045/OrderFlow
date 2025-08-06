import axios from 'axios';
import { Order } from '@prisma/client';

export class DeliveryHeroService {
    // 1. Sipariş durumunu güncelle (PUT)
    async updateOrderStatus(order: Order, statusPayload: any, callbackUrl?: string): Promise<{ success: boolean; data?: any; error?: any }> {
        if (!callbackUrl) {
            return { success: false, error: 'Callback URL yok, istek atlanıyor.' };
        }
        try {
            console.log(`External service'e istek gönderiliyor: ${callbackUrl}`, statusPayload);
            
            const response = await axios.put(callbackUrl, statusPayload, {
                // headers: { Authorization: `Bearer ${token}` }, // Şimdilik token yok
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000, // 10 saniye timeout
            });
            
            console.log(`External service yanıtı:`, response.status, response.data);
            return { success: true, data: response.data };
        } catch (error: any) {
            console.error(`External service hatası:`, error.message);
            if (error.response) {
                console.error(`Response status: ${error.response.status}`);
                console.error(`Response data:`, error.response.data);
            }
            return { 
                success: false, 
                error: error?.response?.data || error.message || 'Unknown error' 
            };
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