import { PrismaClient } from '@prisma/client';
import { OrderTransformer, TransformResult } from '../utils/orderTransformer';
import { Order } from '../types/order.types';
import {broadcastNewOrder} from "../ws/websocket";

export interface OrderResponse {
    success: boolean;
    orderId?: string;
    data?: any;
    error?: string;
}

export interface StatusUpdateResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export class OrderService {
    private prisma: PrismaClient;
    private orderTransformer: OrderTransformer;

    constructor() {
        this.prisma = new PrismaClient();
        this.orderTransformer = new OrderTransformer(this.prisma);
    }

    /**
     * POST /order/{remoteId}
     * Creates a new order from incoming order data
     */
    async createOrder(remoteId: string, orderData: Order): Promise<OrderResponse> {
        try {
            console.log(`Creating order for remoteId: ${remoteId}`);

            // Validate that we have required data
            if (!orderData || !orderData.token) {
                return {
                    success: false,
                    error: 'Invalid order data: missing required fields'
                };
            }

            // Check if order already exists
            const existingOrder = await this.prisma.order.findUnique({
                where: { token: orderData.token }
            });

            if (existingOrder) {
                console.log(`Order with token ${orderData.token} already exists`);
                return {
                    success: false,
                    error: 'Order already exists'
                };
            }

            // Transform and save the order
            const result: TransformResult = await this.orderTransformer.transformAndSave(orderData);

            if (!result.success) {
                console.error('Failed to transform and save order:', result.error);
                return {
                    success: false,
                    error: result.error || 'Failed to create order'
                };
            }

            console.log(`Order created successfully with ID: ${result.data.id}`);


            // Broadcast the new order to WebSocket client
            broadcastNewOrder(result.data);

            return {
                success: true,
                orderId: result.data.id,
                data: {
                    id: result.data.id,
                    token: result.data.token,
                    code: result.data.code,
                    createdAt: result.data.createdAt
                }
            };

        } catch (error) {
            console.error('Error in createOrder:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * PUT /remoteId/{remoteId}/remoteOrder/{remoteOrderId}/posOrderStatus
     * Updates the POS status of an existing order
     */
    /**
     * PUT /remoteId/{remoteId}/remoteOrder/{remoteOrderId}/posOrderStatus
     * Updates the POS status of an existing order
     */
    async updatePosOrderStatus(
        remoteId: string,
        remoteOrderId: string,
        statusData: { status: string; timestamp?: string }
    ): Promise<StatusUpdateResponse> {
        try {
            console.log(`Updating POS status for remoteId: ${remoteId}, remoteOrderId: ${remoteOrderId}`);

            if (!statusData || !statusData.status) {
                return {
                    success: false,
                    error: 'Invalid status data: missing status field'
                };
            }

            // First, try to find order by remoteOrderId (if we store it)
            // Since the current schema doesn't have remoteOrderId field, we'll search by token or code
            let order = await this.prisma.order.findFirst({
                where: {
                    OR: [
                        { token: remoteOrderId },
                        { code: remoteOrderId },
                        { shortCode: remoteOrderId }
                    ]
                },
                select: {
                    id: true,
                    token: true,
                    code: true,
                    expeditionType: true, // Mevcut expedition type'ı da alalım
                }
            });

            if (!order) {
                console.log(`Order not found for remoteOrderId: ${remoteOrderId}`);
                return {
                    success: false,
                    error: 'Order not found'
                };
            }

            // Map the status to your internal status format
            const mappedStatus = this.mapPosStatus(statusData.status);

            // expeditionType'ı değiştirmek yerine, status'u başka bir yerde saklayın
            // Örneğin extraParameters JSON field'ında:
            const updatedOrder = await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    // expeditionType'ı değiştirmeyin - o pickup/delivery için
                    extraParameters: {
                        ...(order as any).extraParameters, // Mevcut extra parameters'ı koru
                        posStatus: mappedStatus, // Status'u burada sakla
                        lastStatusUpdate: statusData.timestamp || new Date().toISOString()
                    }
                }
            });

            console.log(`Order ${order.id} POS status updated to: ${mappedStatus}`);

            return {
                success: true,
                message: `Order POS status updated successfully to ${mappedStatus}`
            };

        } catch (error) {
            console.error('Error in updatePosOrderStatus:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update order status'
            };
        }
    }

    /**
     * Helper method to map external POS status to internal status
     *
     *
     *
     */
    /**
     * Helper method to get basic order details (for debugging/logging)
     */
    // async getOrderDetails(identifier: string) {
    //   try {
    //     const order = await this.prisma.order.findFirst({
    //       where: {
    //         OR: [
    //           { token: identifier },
    //           { code: identifier },
    //           { id: identifier }
    //         ]
    //       },
    //       include: {
    //         customer: true,
    //
    //         price: true,
    //         delivery: true,
    //         pickup: true,
    //         products: true, // Sadece temel product bilgileri
    //         discounts: true // Sadece temel discount bilgileri
    //       }
    //     });
    //
    //     return order;
    //   } catch (error) {
    //     console.error('Error getting order details:', error);
    //     return null;
    //   }
    // }
    private mapPosStatus(externalStatus: string): string {
        const statusMap: { [key: string]: string } = {
            // Add your status mappings here
            'received': 'RECEIVED',
            'accepted': 'ACCEPTED',
            'rejected': 'REJECTED',
            'preparing': 'PREPARING',
            'ready': 'READY',
            'picked_up': 'PICKED_UP',
            'delivered': 'DELIVERED',
            'cancelled': 'CANCELLED'
        };

        const mapped = statusMap[externalStatus.toLowerCase()];
        if (!mapped) {
            console.warn(`Unknown status: ${externalStatus}, using as-is`);
            return externalStatus.toUpperCase();
        }

        return mapped;
    }
    /**
     * Helper method to get order details (for debugging/logging)
     */


    /**
     * Cleanup method to close Prisma connection
     */
    async disconnect() {
        await this.prisma.$disconnect();
    }
}