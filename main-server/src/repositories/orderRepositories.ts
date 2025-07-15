// src/repositories/orderRepository.ts



import { Order } from "@prisma/client";

import prisma from "../../prisma/client";


export  const orderRepository = {


    async createOrder(data: {
        restaurantId: number;
        customerName: string;
        items: object;
        totalPrice: number;
    }): Promise<Order> {
        return prisma.order.create({
            data: {
                restaurantId: data.restaurantId,
                customerName: data.customerName,
                items: data.items,
                totalPrice: data.totalPrice,
            },
        });
    },

    // promise dönmek bu işlem bitince sonuç order tipinde oluyor

    async findOrdersByRestaurant(restaurantId: number): Promise<Order[]> {
        return  prisma.order.findMany({
            where: { restaurantId },
            orderBy: { createdAt: "desc" },
        });
    }



}








































// export const orderRepository = {
//     async createOrder(data: {
//         restaurantId: number;
//         customerName: string;
//         items: object;
//         totalPrice: number;
//     }): Promise<Order> {
//         return prisma.order.create({
//             data: {
//                 restaurantId: data.restaurantId,
//                 customerName: data.customerName,
//                 items: data.items,
//                 totalPrice: data.totalPrice,
//             },
//         });
//     },
//
//     async findOrdersByRestaurant(restaurantId: number): Promise<Order[]> {
//         return prisma.order.findMany({
//             where: { restaurantId },
//             orderBy: { createdAt: "desc" },
//         });
//     },
// };
