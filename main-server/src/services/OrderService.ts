import {create} from "node:domain";
import {orderRepository} from "../repositories/orderRepositories";


// src/services/orderService.ts


export const orderService = {
async createOrder (orderData: {
    restaurantId: number;
    customerName: string;
    items: object;
    totalPrice: number;
})  {
    if (orderData.totalPrice<=0) {
        throw  new Error("Toplam fiyat 0'dan büyük olmalıdır");
    }



    const savedOrder = await orderRepository.createOrder(orderData);

    return savedOrder;

},

async getOrdersByRestaurantId(restaurantId: number) {
    if (restaurantId <= 0) {
        throw new Error("Geçersiz restoran ID");
    }
    const orders = await orderRepository.findOrdersByRestaurant(restaurantId);
    return orders;

}

}

