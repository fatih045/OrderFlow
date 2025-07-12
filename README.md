# Yemeksepeti Entegrasyonu - Sistem Dokümantasyonu

# 🍔 Yemeksepeti Entegrasyonu - Sipariş Dashboard Sistemi

Gerçek zamanlı sipariş takibi için geliştirilen bu sistem, **Node.js**, **Webhook**, **WebSocket**, ve **Angular** teknolojilerini kullanarak Yemeksepeti benzeri bir senaryoyu simüle eder.

> 🔄 Proje hem **Mock API** hem de **Gerçek API** entegrasyonuna uygun olacak şekilde iki katmanlı yapıdadır.


## Webhook vs WebSocket Açıklaması

### Webhook (HTTP POST Request)
- **Tanım:** Bir olay gerçekleştiğinde otomatik HTTP POST isteği gönderme mekanizması
- **Çalışma Şekli:** Mock API → HTTP POST → Ana Sistem
- **Protokol:** HTTP/HTTPS
- **Yön:** Tek yönlü (sadece gönderici → alıcı)
- **Kullanım:** Sipariş bildirimleri, ödeme bildirimleri, durum güncellemeleri

### WebSocket (Real-time İletişim)
- **Tanım:** İki yönlü, gerçek zamanlı iletişim kanalı
- **Çalışma Şekli:** Ana Sistem ↔ Angular Frontend
- **Protokol:** WebSocket (WS/WSS)
- **Yön:** İki yönlü (client ↔ server)
- **Kullanım:** Dashboard güncellemeleri, anlık bildirimler

---

## Sistem Mimarisi

### Genel Akış Şeması
```
┌─────────────────┐    HTTP POST     ┌─────────────────┐    WebSocket     ┌─────────────────┐
│   Mock API      │ ─────────────→   │   Ana Sistem    │ ←─────────────→  │  Angular        │
│   (Port: 3001)  │    (Webhook)     │   (Port: 3000)  │  (Real-time)     │  Dashboard      │
│                 │                  │                 │                  │                 │
│ • Sahte veri    │                  │ • Webhook alıcı │                  │ • Sipariş listesi│
│ • Otomatik      │                  │ • Veri saklama  │                  │ • Real-time     │
│   sipariş       │                  │ • REST API      │                  │   güncellemeler │
│ • Webhook       │                  │ • WebSocket     │                  │ • İstatistikler │
│   gönderici     │                  │   server        │                  │ • Sipariş yönetimi│
└─────────────────┘                  └─────────────────┘                  └─────────────────┘
```

### Detaylı Akış Şeması
```
1. MOCK API (Sahte Veri Üretimi)
   ┌─────────────────────────────────────────────────────────────┐
   │                                                             │
   │  Otomatik Timer (45 saniye)                                │
   │         ↓                                                   │
   │  Sahte Sipariş Oluştur                                     │
   │         ↓                                                   │
   │  HTTP POST Webhook Gönder                                  │
   │         ↓                                                   │
   │  http://localhost:3000/webhook/new-order                   │
   │                                                             │
   └─────────────────────────────────────────────────────────────┘
                              ↓
2. ANA SİSTEM (Webhook Alıcı + API)
   ┌─────────────────────────────────────────────────────────────┐
   │                                                             │
   │  Webhook Endpoint (/webhook/new-order)                     │
   │         ↓                                                   │
   │  Sipariş Verisini Al ve Kaydet                             │
   │         ↓                                                   │
   │  WebSocket ile Frontend'e Bildirim Gönder                  │
   │         ↓                                                   │
   │  socket.emit('new-order', orderData)                       │
   │                                                             │
   └─────────────────────────────────────────────────────────────┘
                              ↓
3. ANGULAR FRONTEND (Dashboard)
   ┌─────────────────────────────────────────────────────────────┐
   │                                                             │
   │  WebSocket Listener (socket.on('new-order'))               │
   │         ↓                                                   │
   │  Sipariş Listesini Güncelle                                │
   │         ↓                                                   │
   │  UI'da Anlık Göster + Bildirim                             │
   │         ↓                                                   │
   │  İstatistikleri Güncelle                                   │
   │                                                             │
   └─────────────────────────────────────────────────────────────┘
```

---

## Proje Yapısı

```
orderflow-dual-backend/
├── 📁 mock-server/                     # Mock API (Port: 3001)
│   ├── 📄 server.js                    # Mock server ana dosyası
│   ├── 📄 package.json
│   ├── 📄 package-lock.json
│   ├── 📁 routes/
│   │   ├── 📄 generate.js              # Sipariş oluşturma routes
│   │   └── 📄 health.js                # Health check routes
│   ├── 📁 services/
│   │   ├── 📄 orderGenerator.js        # Sahte sipariş oluşturucu
│   │   └── 📄 webhookSender.js         # Webhook gönderici
│   ├── 📁 config/
│   │   ├── 📄 restaurants.json         # Restoran verileri
│   │   ├── 📄 customers.json           # Müşteri verileri
│   │   └── 📄 menuItems.json           # Menü öğeleri
│   ├── 📁 utils/
│   │   ├── 📄 logger.js                # Loglama
│   │   └── 📄 scheduler.js             # Otomatik sipariş zamanlayıcı
│   └── 📄 .env
├── 📁 main-server/                     # Ana Sistem (Port: 3000)
│   ├── 📄 server.js                    # Ana server dosyası
│   ├── 📄 package.json
│   ├── 📄 package-lock.json
│   ├── 📁 routes/
│   │   ├── 📄 webhook.js               # Webhook alıcı routes
│   │   ├── 📄 orders.js                # Sipariş yönetimi routes
│   │   ├── 📄 stats.js                 # İstatistik routes
│   │   └── 📄 auth.js                  # Authentication routes (YENİ)
│   ├── 📁 models/
│   │   ├── 📄 Order.js                 # Sipariş modeli
│   │   └── 📄 User.js                  # Kullanıcı modeli (YENİ)
│   ├── 📁 services/
│   │   ├── 📄 orderService.js          # Sipariş iş mantığı
│   │   ├── 📄 websocketService.js      # WebSocket yönetimi
│   │   ├── 📄 authService.js           # Authentication servisi (YENİ)
│   │   └── 📄 emailService.js          # Email bildirimleri
│   ├── 📁 middleware/
│   │   ├── 📄 auth.js                  # JWT doğrulama (YENİ)
│   │   ├── 📄 validation.js            # Input validation
│   │   ├── 📄 rateLimit.js             # Rate limiting
│   │   └── 📄 cors.js                  # CORS ayarları
│   ├── 📁 utils/
│   │   ├── 📄 logger.js                # Loglama
│   │   ├── 📄 encryption.js            # Şifreleme (YENİ)
│   │   └── 📄 validators.js            # Doğrulama fonksiyonları
│   ├── 📁 config/
│   │   ├── 📄 database.js              # Veritabanı ayarları
│   │   ├── 📄 jwt.js                   # JWT ayarları (YENİ)
│   │   └── 📄 email.js                 # Email ayarları
│   └── 📄 .env


```

---

## API Dokümantasyonu

### Mock API Endpoints (Port: 3001)

#### POST /generate-order
Manuel sahte sipariş oluşturur ve ana sisteme webhook gönderir.

**Response:**
```json
{
  "message": "Sahte sipariş oluşturuldu ve ana sisteme gönderildi",
  "order": {
    "id": 1678901234567,
    "restaurant": "Burger Palace",
    "customer": "Ahmet Yılmaz",
    "items": ["Big Burger", "Patates", "Kola"],
    "total": 65.50,
    "status": "new",
    "orderTime": "2024-07-10T10:30:00.000Z",
    "address": "Muratpaşa/Antalya"
  }
}
```

#### GET /health
Mock API'nin durumunu kontrol eder.

**Response:**
```json
{
  "status": "healthy",
  "uptime": "00:15:32",
  "ordersGenerated": 45
}
```

---

### Ana Sistem API Endpoints (Port: 3000)

#### POST /webhook/new-order
Mock API'den gelen sipariş bildirimlerini alır.

**Request Body:**
```json
{
  "id": 1678901234567,
  "restaurant": "Burger Palace",
  "customer": "Ahmet Yılmaz",
  "items": ["Big Burger", "Patates", "Kola"],
  "total": 65.50,
  "status": "new",
  "orderTime": "2024-07-10T10:30:00.000Z",
  "address": "Muratpaşa/Antalya"
}
```

**Response:**
```json
{
  "message": "Sipariş başarıyla alındı",
  "orderId": 1678901234567
}
```

#### GET /api/orders
Tüm siparişleri listeler.

**Query Parameters:**
- `status`: Sipariş durumu filtresi (new, preparing, ready, delivered)
- `limit`: Sayfa başına sipariş sayısı
- `page`: Sayfa numarası

**Response:**
```json
{
  "orders": [
    {
      "id": 1678901234567,
      "restaurant": "Burger Palace",
      "customer": "Ahmet Yılmaz",
      "items": ["Big Burger", "Patates", "Kola"],
      "total": 65.50,
      "status": "preparing",
      "orderTime": "2024-07-10T10:30:00.000Z",
      "address": "Muratpaşa/Antalya"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

#### PUT /api/orders/:id/status
Sipariş durumunu günceller.

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Response:**
```json
{
  "message": "Sipariş durumu güncellendi",
  "orderId": 1678901234567,
  "newStatus": "preparing"
}
```

#### GET /api/stats
Dashboard istatistiklerini döner.

**Response:**
```json
{
  "totalOrders": 156,
  "activeOrders": 12,
  "dailyRevenue": 2450.75,
  "ordersByStatus": {
    "new": 3,
    "preparing": 5,
    "ready": 4,
    "delivered": 144
  },
  "topRestaurants": [
    {
      "name": "Burger Palace",
      "orderCount": 45,
      "revenue": 1250.50
    }
  ]
}
```

---

## WebSocket Events

### Server → Client (Ana Sistem → Angular)

#### new-order
Yeni sipariş geldiğinde gönderilir.
```typescript
socket.on('new-order', (orderData: Order) => {
  // Sipariş listesini güncelle
  // Bildirim göster
});
```


```

### Client → Server (Angular → Ana Sistem)

#### join-dashboard
Dashboard'a katılım bildirimi.
```typescript
socket.emit('join-dashboard', { userId: 'admin' });
```

#### update-order-status
Sipariş durumu güncelleme isteği.
```typescript
socket.emit('update-order-status', { orderId: 123, status: 'preparing' });
```

---

## Angular Entegrasyonu

### Gerekli Paketler
```json
{
  "dependencies": {
    "@angular/core": "^16.0.0",
    "@angular/common": "^16.0.0",
    "@angular/router": "^16.0.0",
    "@angular/forms": "^16.0.0",
    "@angular/material": "^16.0.0",
    "socket.io-client": "^4.7.2",
    "rxjs": "^7.8.0",
    "chart.js": "^4.3.0",
    "ng2-charts": "^5.0.0"
  }
}
```

### Angular Servis Yapısı

#### Order Service
```typescript
// order.service.ts
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api';
  
  getOrders(): Observable<Order[]>
  updateOrderStatus(id: number, status: string): Observable<any>
  getStats(): Observable<Stats>
}
```

#### WebSocket Service
```typescript
// websocket.service.ts
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket = io('http://localhost:3000');
  
  onNewOrder(): Observable<Order>
  onOrderStatusUpdated(): Observable<{id: number, status: string}>
  onStatsUpdated(): Observable<Stats>
  
  joinDashboard(): void
  updateOrderStatus(orderId: number, status: string): void
}
```

---

## Sistem Akış Senaryoları

### Senaryo 1: Otomatik Sipariş Gelişi
```
1. Mock API timer tetiklenir (45 saniye)
2. Sahte sipariş verisi oluşturulur
3. HTTP POST webhook gönderilir → Ana Sistem
4. Ana Sistem sipariş verisini alır ve saklar
5. WebSocket ile Angular'a 'new-order' eventi gönderilir
6. Angular dashboard'da yeni sipariş görüntülenir
7. Bildirim gösterilir
8. İstatistikler güncellenir
```

---

## Deployment ve Çalıştırma

### Geliştirme Ortamı
```bash
# 1. Mock API'yi başlat
cd mock-server
npm install
npm start

# 2. Ana Sistemi başlat
cd main-server
npm install
npm start

# 3. Angular uygulamasını başlat
cd angular-dashboard
npm install
ng serve
```

### Erişim URL'leri
- **Angular Dashboard:** http://localhost:4200
- **Ana Sistem API:** http://localhost:3000
- **Mock API:** http://localhost:3001

---



### Yapılandırma
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  websocketUrl: 'http://localhost:3000',
  mockApiUrl: 'http://localhost:3001', // Geliştirme için
  yemeksepetiWebhookUrl: 'https://api.yemeksepeti.com/webhook' // Gerçek API
};
```

---

## Güvenlik Önlemleri

### Webhook Güvenliği
- **HTTPS kullanımı**
- **IP whitelist**
- **Signature verification**
- **Rate limiting**

### API Güvenliği
- **CORS ayarları**
- **Authentication token**
- **Input validation**
- **Error handling**
