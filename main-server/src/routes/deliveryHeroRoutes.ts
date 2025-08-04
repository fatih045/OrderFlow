import express from 'express';
import { DeliveryHeroController } from '../controllers/DeliveryHeroController';

const router = express.Router();
const controller = new DeliveryHeroController();

// 1. Sipariş durumunu güncelle (PUT)
router.put('/order/status/:orderToken', controller.updateOrderStatus.bind(controller));

// 2. Siparişi "hazırlandı" olarak işaretle (POST)
router.post('/orders/:orderToken/preparation-completed', controller.markOrderPrepared.bind(controller));

export default router; 