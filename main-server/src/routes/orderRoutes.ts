import express from 'express';
import { OrderController } from '../controllers/orderController';

const router = express.Router();
const controller = new OrderController();

// Yemeksepeti sipariş webhook'u
router.post('/order/:remoteId', controller.receiveOrder.bind(controller));

// Yemeksepeti durum webhook'u
router.post('/remoteId/:remoteId/remoteOrder/:remoteOrderId/posOrderStatus', controller.receiveStatusUpdate.bind(controller));



export default router;
