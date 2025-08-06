import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './services/notification.service';

interface Order {
  id: string;
  code: string;
  status: 'pending' | 'accepted' | 'rejected' | 'preparing' | 'ready' | 'prepared' | 'delivered' | 'picked_up' | 'order_accepted' | 'order_preparing' | 'order_ready' | 'order_prepared' | 'order_delivered' | 'order_picked_up';
  customer?: {
    name: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  createdAt: Date;
  delivery?: {
    type: 'delivery' | 'pickup';
    address?: string;
  };
  token?: string;
  // Callback URL'ler
  orderAcceptedUrl?: string;
  orderRejectedUrl?: string;
  orderPickedUpUrl?: string;
  orderPreparedUrl?: string;
  orderProductModificationUrl?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  private notificationService = inject(NotificationService);

  activeOrders = signal<Order[]>([]);

  constructor() {
    // Main content'ten siparişleri almak için event listener
    window.addEventListener('orderAccepted', ((event: CustomEvent) => {
      console.log('Sidebar: Sipariş kabul edildi eventi alındı:', event.detail.id);
      console.log('Sipariş detayları:', event.detail);

      this.activeOrders.update(orders => {
        const exists = orders.find(order => order.id === event.detail.id);
        if (!exists) {
          return [event.detail, ...orders];
        }
        return orders;
      });
    }) as EventListener);

    // WebSocket mesajlarını dinle
    window.addEventListener('message', ((event: MessageEvent) => {
      if (event.data && typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (e) {
          // WebSocket mesajı değil, yoksay
        }
      }
    }) as EventListener);
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'ORDER_STATUS_UPDATE':
        this.handleStatusUpdate(data.payload);
        break;
    }
  }

  private handleStatusUpdate(updateData: any) {
    console.log('Sidebar durum güncelleme:', updateData);

    this.activeOrders.update(orders =>
      orders.map(order =>
        order.id === updateData.orderId
          ? { ...order, status: updateData.status.replace('order_', '') as any }
          : order
      )
    );
  }

  // Callback URL kontrol metodları
  hasCallbackUrl(order: Order, urlType: string): boolean {
    switch (urlType) {
      case 'orderAcceptedUrl':
        return !!order.orderAcceptedUrl;
      case 'orderRejectedUrl':
        return !!order.orderRejectedUrl;
      case 'orderPickedUpUrl':
        return !!order.orderPickedUpUrl;
      case 'orderPreparedUrl':
        return !!order.orderPreparedUrl;
      case 'orderProductModificationUrl':
        return !!order.orderProductModificationUrl;
      default:
        return false;
    }
  }

  getCallbackUrlsInfo(order: Order): string {
    // Callback URL'lerin bilgisini döndür
    const urls = [];
    if (this.hasCallbackUrl(order, 'orderAcceptedUrl')) urls.push('Kabul');
    if (this.hasCallbackUrl(order, 'orderRejectedUrl')) urls.push('Red');
    if (this.hasCallbackUrl(order, 'orderPickedUpUrl')) urls.push('Kurye Aldı');
    if (this.hasCallbackUrl(order, 'orderPreparedUrl')) urls.push('Yemek Hazır');
    if (this.hasCallbackUrl(order, 'orderProductModificationUrl')) urls.push('Ürün Değiştir');

    return urls.length > 0 ? urls.join(', ') : 'Callback URL yok';
  }

  // Debug için sipariş durumunu logla
  private logOrderStatus(order: Order) {
    console.log(`Sipariş ${order.id} durumu:`, order.status);
    console.log('Buton koşulları:');
    console.log('- Hazırlanıyor:', order.status === 'accepted' || order.status === 'order_accepted');
    console.log('- Hazır:', order.status === 'preparing' || order.status === 'order_preparing');
    console.log('- Teslim Edildi:', order.status === 'ready' || order.status === 'prepared' || order.status === 'accepted' || order.status === 'order_ready' || order.status === 'order_prepared' || order.status === 'order_accepted');
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'accepted': 'Kabul Edildi',
      'preparing': 'Hazırlanıyor',
      'ready': 'Hazır',
      'prepared': 'Kurye Bildirildi',
      'delivered': 'Teslim Edildi',
      'picked_up': 'Kurye Aldı',
      'order_accepted': 'Kabul Edildi',
      'order_preparing': 'Hazırlanıyor',
      'order_ready': 'Hazır',
      'order_prepared': 'Kurye Bildirildi',
      'order_delivered': 'Teslim Edildi',
      'order_picked_up': 'Kurye Aldı'
    };
    return statusMap[status] || status;
  }

  getProgressPercentage(status: string): number {
    const progressMap: Record<string, number> = {
      'accepted': 25,
      'preparing': 50,
      'ready': 75,
      'prepared': 90,
      'delivered': 100,
      'picked_up': 60,
      'order_accepted': 25,
      'order_preparing': 50,
      'order_ready': 75,
      'order_prepared': 90,
      'order_delivered': 100,
      'order_picked_up': 60
    };
    return progressMap[status] || 0;
  }

  async updateOrderStatus(order: Order, newStatus: string) {
    try {
      console.log(`Sipariş durumu güncelleniyor: ${order.id} -> ${newStatus}`);

      const response = await fetch(`http://localhost:3000/delivery-hero/order/status/${order.token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.ok) {
        console.log(`Sipariş durumu başarıyla güncellendi: ${newStatus}`);

        // Sipariş durumunu güncelle
        this.activeOrders.update(orders =>
          orders.map(o =>
            o.id === order.id
              ? { ...o, status: newStatus.replace('order_', '') as any }
              : o
          )
        );

        // Bildirim gönder
        this.notificationService.addNotification({
          title: 'Durum Güncellendi',
          message: `#${order.code} siparişi ${this.getStatusText(newStatus.replace('order_', ''))}`,
          time: new Date(),
          type: 'status_update'
        });

        // Eğer teslim edildiyse listeden çıkar
        if (newStatus === 'order_delivered') {
          setTimeout(() => {
            this.activeOrders.update(orders =>
              orders.filter(o => o.id !== order.id)
            );
          }, 3000);
        }
      } else {
        console.error('Durum güncelleme hatası:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
    }
  }

  async markOrderPrepared(order: Order) {
    try {
      console.log(`Yemek hazır bildiriliyor: ${order.id}`);

      const response = await fetch(`http://localhost:3000/delivery-hero/order/status/${order.token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'order_prepared'
        })
      });

      if (response.ok) {
        console.log(`Yemek hazır başarıyla bildirildi`);

        // Sipariş durumunu güncelle
        this.activeOrders.update(orders =>
          orders.map(o =>
            o.id === order.id
              ? { ...o, status: 'order_prepared' }
              : o
          )
        );

        // Bildirim gönder
        this.notificationService.addNotification({
          title: 'Yemek Hazır',
          message: `#${order.code} siparişi hazırlandı`,
          time: new Date(),
          type: 'status_update'
        });
      } else {
        console.error('Yemek hazır bildirme hatası:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Yemek hazır bildirme hatası:', error);
    }
  }

  async modifyProduct(order: Order) {
    try {
      // Ürün modifikasyonu için örnek payload
      const modificationPayload = {
        items: [
          {
            id: "item1",
            quantity: 2,
            modifications: ["extra cheese", "no onions"]
          }
        ]
      };

      const response = await fetch(`http://localhost:3000/delivery-hero/orders/${order.token}/product-modification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modificationPayload)
      });

      if (response.ok) {
        // Bildirim gönder
        this.notificationService.addNotification({
          title: 'Ürün Değiştirildi',
          message: `#${order.code} siparişi ürünleri güncellendi`,
          time: new Date(),
          type: 'status_update'
        });
      } else {
        console.error('Ürün modifikasyon hatası');
      }
    } catch (error) {
      console.error('Ürün modifikasyon hatası:', error);
    }
  }
}
