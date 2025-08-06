import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './services/notification.service';

interface Order {
  id: string;
  code: string;
  status: 'pending' | 'accepted' | 'rejected' | 'preparing' | 'ready' | 'delivered' | 'prepared' | 'picked_up' | 'order_accepted' | 'order_preparing' | 'order_ready' | 'order_prepared' | 'order_delivered' | 'order_picked_up';
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

  private handleNewOrder(orderData: any) {
    console.log('Backend\'den gelen ham veri:', orderData);

    // Backend'den gelen veriyi frontend formatına çevir
    const newOrder: Order = {
      id: orderData.id,
      code: orderData.code,
      status: 'pending',
      customer: {
        name: orderData.customer ? `${orderData.customer.firstName || ''} ${orderData.customer.lastName || ''}`.trim() : 'Müşteri',
        phone: orderData.customer?.mobilePhone || 'Telefon yok'
      },
      items: orderData.products?.map((product: any) => ({
        name: product.name || 'Ürün',
        quantity: parseInt(product.quantity) || 1,
        price: parseFloat(product.paidPrice) || 0
      })) || [],
      totalAmount: parseFloat(orderData.price?.grandTotal) || 0,
      createdAt: new Date(orderData.createdAt),
      delivery: {
        type: orderData.expeditionType || 'delivery',
        address: orderData.delivery ?
          `${orderData.delivery.street || ''} ${orderData.delivery.number || ''}, ${orderData.delivery.city || ''}`.trim() :
          undefined
      },
      token: orderData.token,
      // Callback URL'ler
      orderAcceptedUrl: orderData.orderAcceptedUrl,
      orderRejectedUrl: orderData.orderRejectedUrl,
      orderPickedUpUrl: orderData.orderPickedUpUrl,
      orderPreparedUrl: orderData.orderPreparedUrl,
      orderProductModificationUrl: orderData.orderProductModificationUrl
    };

    console.log('Frontend\'e çevrilen veri:', newOrder);
    console.log('Müşteri adı:', newOrder.customer?.name);
    console.log('Telefon:', newOrder.customer?.phone);
    console.log('Toplam tutar:', newOrder.totalAmount);
    console.log('Ürünler:', newOrder.items);

    this.pendingOrders.update(orders => [newOrder, ...orders]);

    // Bildirim gönder
    this.notificationService.addNotification({
      title: 'Yeni Sipariş',
      message: `#${orderData.code} siparişi geldi - ${newOrder.customer?.name}`,
      time: new Date(),
      type: 'new_order'
    });

    // Ses bildirimi
    this.playNotificationSound();
  }

  private handleStatusUpdate(updateData: any) {
    console.log('Durum güncelleme alındı:', updateData);

    // Sidebar'daki siparişlerin durumunu güncelle
    this.acceptedOrders.update(orders =>
      orders.map(order =>
        order.id === updateData.orderId
          ? { ...order, status: updateData.status.replace('order_', '') }
          : order
      )
    );

    // Pending siparişlerde de güncelleme yap
    this.pendingOrders.update(orders =>
      orders.map(order =>
        order.id === updateData.orderId
          ? { ...order, status: updateData.status.replace('order_', '') }
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
    console.log('Sipariş kabul edildi:', orderData.id);

    // Pending'den accepted'e taşı
    this.pendingOrders.update(orders =>
      orders.filter(order => order.id !== orderData.id)
    );

    // Accepted orders'a ekle (eğer yoksa) - status'u accepted olarak set et
    const acceptedOrder = { ...orderData, status: 'accepted' as any };
    this.acceptedOrders.update(orders => {
      const exists = orders.find(order => order.id === orderData.id);
      if (!exists) {
        return [acceptedOrder, ...orders];
      }
      return orders;
    });

    // Sidebar'a bildir - status'u accepted olarak gönder
    window.dispatchEvent(new CustomEvent('orderAccepted', { detail: acceptedOrder }));
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
