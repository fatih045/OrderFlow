// =============================================================================
// CONTROLLER LAYER
// =============================================================================

import { Request, Response } from 'express';
import { OrderValidator } from '../utils/orderValidator';
import { OrderTransformer } from '../utils/orderTransformer';


import {OrderService} from "../services/OrderService";

export interface OrderStatusUpdatePayload {
  status: string;
  timestamp?: string;
  remoteOrderId: string;
}

export class OrderController {
  private orderService = new OrderService()



  // 1. Yemeksepeti sipariş webhook'u
  async receiveOrder(req: Request, res: Response) {
    try {
      const {remoteId} = req.params;
      const orderPayload = req.body;

      console.log(`[${remoteId}] Yeni sipariş:`, orderPayload.code);

      // Doğrulama
      const validator = new OrderValidator();
      const validation = validator.validate(orderPayload);
      if (!validation.isValid) {
        return res.status(400).json({success: false, errors: validation.errors});
      }

      // OrderService'in createOrder metoduna remoteId ve orderData parametreleri gönderiliyor
      const result = await this.orderService.createOrder(remoteId, orderPayload);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }




      return res.status(200).json({
        success: true,
        remoteOrderId: result.orderId,
        message: 'Sipariş başarıyla alındı',
        data: result.data
      });
    } catch (err) {
      console.error('Sipariş işleme hatası:', err);
      return res.status(500).json({success: false, error: 'Sunucu hatası'});
    }
  }

  // 2. Yemeksepeti durum güncelleme webhook'u
  async receiveStatusUpdate(req: Request, res: Response) {
    try {
      const {remoteId, remoteOrderId} = req.params;
      const statusUpdate: OrderStatusUpdatePayload = req.body;

      console.log(`[${remoteId}] ${remoteOrderId} durumu:`, statusUpdate.status);

      // Basit doğrulama
      if (!statusUpdate.status) {
        return res.status(400).json({
          success: false,
          errors: [{field: 'status', message: 'Status is required'}]
        });
      }

      const result = await this.orderService.updatePosOrderStatus(
          remoteId,
          remoteOrderId,
          {
            status: statusUpdate.status,
            timestamp: statusUpdate.timestamp
          }
      );

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error || 'Sipariş bulunamadı'
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message || 'Durum güncellendi'
      });
    } catch (err) {
      console.error('Durum güncelleme hatası:', err);
      return res.status(500).json({success: false, error: 'Sunucu hatası'});
    }
  }

}