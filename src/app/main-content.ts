import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './services/notification.service';

interface Order {
  id: string;
  code: string;
  status: 'pending' | 'accepted' | 'rejected' | 'preparing' | 'ready' | 'delivered';
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
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-content.html',
  styleUrl: './main-content.css'
})
export class MainContent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);

  pendingOrders = signal<Order[]>([]);
  acceptedOrders = signal<Order[]>([]);
  private ws: WebSocket | null = null;

  ngOnInit() {
    this.connectWebSocket();
  }

  ngOnDestroy() {
    if (this.ws) {
      this.ws.close();
    }
  }

  private connectWebSocket() {
    this.ws = new WebSocket('ws://localhost:3000');

    this.ws.onopen = () => {
      console.log('WebSocket bağlantısı kuruldu');
      this.notificationService.setOnlineStatus(true);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      } catch (e) {
        console.error('WebSocket mesaj hatası:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket bağlantısı kapandı');
      this.notificationService.setOnlineStatus(false);
      // Yeniden bağlanma denemesi
      setTimeout(() => this.connectWebSocket(), 5000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket hatası:', error);
      this.notificationService.setOnlineStatus(false);
    };
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'NEW_ORDER':
        this.handleNewOrder(data.payload);
        break;
      case 'ORDER_STATUS_UPDATE':
        this.handleStatusUpdate(data.payload);
        break;
      case 'ORDER_ACCEPTED':
        this.handleOrderAccepted(data.payload);
        break;
      case 'ORDER_REJECTED':
        this.handleOrderRejected(data.payload);
        break;
    }
  }

  private handleNewOrder(orderData: Order) {
    const newOrder: Order = {
      ...orderData,
      status: 'pending',
      createdAt: new Date()
    };

    this.pendingOrders.update(orders => [newOrder, ...orders]);

    // Bildirim gönder
    this.notificationService.addNotification({
      title: 'Yeni Sipariş',
      message: `#${orderData.code} siparişi geldi`,
      time: new Date(),
      type: 'new_order'
    });

    // Ses bildirimi
    this.playNotificationSound();
  }

  private handleStatusUpdate(updateData: any) {
    // Sidebar'daki siparişlerin durumunu güncelle
    this.acceptedOrders.update(orders =>
      orders.map(order =>
        order.id === updateData.orderId
          ? { ...order, status: updateData.status }
          : order
      )
    );

    // Bildirim gönder
    this.notificationService.addNotification({
      title: 'Durum Güncellendi',
      message: `#${updateData.code} siparişi ${this.getStatusText(updateData.status)}`,
      time: new Date(),
      type: 'status_update'
    });
  }

  private handleOrderAccepted(orderData: Order) {
    // Pending'den accepted'e taşı
    this.pendingOrders.update(orders =>
      orders.filter(order => order.id !== orderData.id)
    );

    this.acceptedOrders.update(orders => [orderData, ...orders]);

    // Sidebar'a bildir
    window.dispatchEvent(new CustomEvent('orderAccepted', { detail: orderData }));
  }

  private handleOrderRejected(orderData: Order) {
    // Pending'den çıkar
    this.pendingOrders.update(orders =>
      orders.filter(order => order.id !== orderData.id)
    );
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'order_accepted': 'kabul edildi',
      'order_rejected': 'reddedildi',
      'order_preparing': 'hazırlanıyor',
      'order_ready': 'hazır',
      'order_picked_up': 'kurye aldı',
      'order_delivered': 'teslim edildi'
    };
    return statusMap[status] || status;
  }

  private playNotificationSound() {
    // Basit ses bildirimi (tarayıcı izni gerekebilir)
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.play().catch(() => {
      // Ses çalınamazsa sessiz kal
    });
  }

  async acceptOrder(order: Order) {
    try {
      // Backend'e kabul isteği gönder
      const response = await fetch(`http://localhost:3000/delivery-hero/order/status/${order.token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'order_accepted'
        })
      });

      if (response.ok) {
        // Başarılı kabul
        this.handleOrderAccepted(order);

        this.notificationService.addNotification({
          title: 'Sipariş Kabul Edildi',
          message: `#${order.code} siparişi kabul edildi`,
          time: new Date(),
          type: 'status_update'
        });
      } else {
        console.error('Sipariş kabul hatası');
      }
    } catch (error) {
      console.error('Sipariş kabul hatası:', error);
    }
  }

  async rejectOrder(order: Order) {
    try {
      // Backend'e red isteği gönder
      const response = await fetch(`http://localhost:3000/delivery-hero/order/status/${order.token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'order_rejected'
        })
      });

      if (response.ok) {
        // Başarılı red
        this.handleOrderRejected(order);

        this.notificationService.addNotification({
          title: 'Sipariş Reddedildi',
          message: `#${order.code} siparişi reddedildi`,
          time: new Date(),
          type: 'status_update'
        });
      } else {
        console.error('Sipariş red hatası');
      }
    } catch (error) {
      console.error('Sipariş red hatası:', error);
    }
  }
}
