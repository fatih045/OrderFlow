import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './services/notification.service';

interface Order {
  id: string;
  code: string;
  status: 'pending' | 'accepted' | 'rejected' | 'preparing' | 'ready' | 'prepared' | 'delivered';
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
      this.activeOrders.update(orders => [event.detail, ...orders]);
    }) as EventListener);
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'accepted': 'Kabul Edildi',
      'preparing': 'Hazırlanıyor',
      'ready': 'Hazır',
      'prepared': 'Kurye Bildirildi',
      'delivered': 'Teslim Edildi'
    };
    return statusMap[status] || status;
  }

  getProgressPercentage(status: string): number {
    const progressMap: Record<string, number> = {
      'accepted': 25,
      'preparing': 50,
      'ready': 75,
      'prepared': 90,
      'delivered': 100
    };
    return progressMap[status] || 0;
  }

  async updateOrderStatus(order: Order, newStatus: string) {
    try {
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
        console.error('Durum güncelleme hatası');
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
    }
  }

  async markOrderPrepared(order: Order) {
    try {
      const response = await fetch(`http://localhost:3000/delivery-hero/orders/${order.token}/preparation-completed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Sipariş durumunu güncelle
        this.activeOrders.update(orders =>
          orders.map(o =>
            o.id === order.id
              ? { ...o, status: 'prepared' }
              : o
          )
        );

        // Bildirim gönder
        this.notificationService.addNotification({
          title: 'Kurye Bildirildi',
          message: `#${order.code} siparişi kurye için hazır`,
          time: new Date(),
          type: 'status_update'
        });
      } else {
        console.error('Kurye bildirme hatası');
      }
    } catch (error) {
      console.error('Kurye bildirme hatası:', error);
    }
  }
}
