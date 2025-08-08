
## 🍔 OrderFlow - DeliveryHero/Yemeksepeti Entegrasyonlu Gerçek Zamanlı Sipariş Takip Sistemi

OrderFlow; gelen siparişleri alır, doğrular, dönüştürüp PostgreSQL veritabanına kaydeder ve frontend’e WebSocket ile yayınlar. Ayrıca sipariş durum değişikliklerinde gerekli callback URL’lerine istek atar.

## ⚙️ Teknolojiler

| **Teknoloji** | **Amaç** |
| --- | --- |
| Node.js, Express.js | HTTP sunucusu ve routing |
| TypeScript | Tip güvenliği |
| Prisma ORM | DB erişimi |
| PostgreSQL | Kalıcı veri |
| ws (WebSocket) | Gerçek zamanlı yayın |

## 📁 Proje Yapısı (Backend: `main-server`)

```
main-server/
├── server.ts                 → HTTP + WebSocket başlangıcı
├── app.ts                    → Express app, route mount noktaları
├── prisma/
│   └── schema.prisma         → DB şeması (PostgreSQL)
└── src/
    ├── controllers/
    │   ├── orderController.ts        → Sipariş ve durum webhook’ları
    │   └── DeliveryHeroController.ts → DeliveryHero status & prepared akışları
    ├── routes/
    │   ├── orderRoutes.ts            → `/orders/*`
    │   └── deliveryHeroRoutes.ts     → `/delivery-hero/*`
    ├── services/
    │   ├── OrderService.ts
    │   └── DeliveryHeroService.ts
    ├── utils/
    │   ├── orderValidator.ts         → Doğrulama
    │   └── orderTransformer.ts       → Dönüştürme & kaydetme
    ├── ws/
    │   └── websocket.ts              → ws tabanlı yayın (NEW_ORDER vb.)
    └── types/
        └── order.types.ts            → Dış sistem sipariş tipleri
```

## 🔄 Akış (Özet)

1) POST `/orders/order/:remoteId`
- `OrderController.receiveOrder` → `OrderValidator` ile doğrula → `OrderTransformer.transformAndSave` ile veriyi DB formatına dönüştür ve kaydet (transaction).
- Kaydedilen siparişi ilişkileriyle beraber tekrar alır ve `broadcastNewOrder` ile WebSocket’ten yayınlar.

2) POST `/orders/remoteId/:remoteId/remoteOrder/:remoteOrderId/posOrderStatus`
- `OrderController.receiveStatusUpdate` → `OrderService.updatePosOrderStatus` siparişi `token|code|shortCode` üzerinden arar.
- POS durumunu `Order.extraParameters.posStatus` alanında saklar, zaman damgasını günceller.

3) PUT `/delivery-hero/order/status/:orderToken`
- `DeliveryHeroController.updateOrderStatus` siparişi `token` ile bulur.
- Gönderilen `status` değerine göre ilgili callback URL’ini seçer ve (varsa) HTTP isteği atar:
  - `order_accepted` → `orderAcceptedUrl`
  - `order_rejected` → `orderRejectedUrl`
  - `order_picked_up` → `orderPickedUpUrl`
  - Diğer durumlarda callback gönderilmez (örn. `order_preparing`, `order_ready`, `order_delivered`, `order_prepared`).
- Lokal DB’de `Order.status` güncellenir ve WebSocket ile durum yayını yapılır. `order_accepted` ve `order_rejected` için ek yayınlar gönderilir.

4) POST `/delivery-hero/orders/:orderToken/preparation-completed`
- `DeliveryHeroController.markOrderPrepared` yalnızca teslimat (`delivery`) siparişlerinde ve `orderPreparedUrl` varsa çalışır.
- Dış servise POST atar, ardından lokal DB’de `status = 'order_prepared'` olarak günceller.

## 🚪 Gerçek Endpoint’ler

Base path’ler `app.ts` üzerinde tanımlıdır:
- `app.use('/orders', orderRoutes)`
- `app.use('/delivery-hero', deliveryHeroRoutes)`

| **Method** | **URL** | **Açıklama** |
| --- | --- | --- |
| POST | `/orders/order/:remoteId` | Yeni sipariş webhook’u (validate → transform → save → WS yayın) |
| POST | `/orders/remoteId/:remoteId/remoteOrder/:remoteOrderId/posOrderStatus` | POS durum güncelleme (extraParameters.posStatus) |
| PUT | `/delivery-hero/order/status/:orderToken` | Sipariş durumu güncelle + uygun callback URL’ine isteği ilet |
| POST | `/delivery-hero/orders/:orderToken/preparation-completed` | “Hazırlandı” bildirimi (yalnızca delivery + callback varsa) |

Önemli notlar:
- Mevcut kodda “sipariş listeleme/güncelleme/silme” gibi genel REST endpoint’leri yoktur. README’den çıkarılmıştır.
- Eski `webhook/*` path’leri ve “istatistik” (stats) uçları projede bulunmadığı için kaldırılmıştır.

## 🔌 WebSocket (ws)

- Sunucu: `ws` kütüphanesi ile HTTP sunucusuna bağlanır (`initWebSocket`).
- Bağlantı: `ws://localhost:3000`
- Sunucu → İstemci mesaj tipleri (`src/ws/websocket.ts`):
  - `NEW_ORDER`
  - `ORDER_STATUS_UPDATE`
  - `ORDER_ACCEPTED`
  - `ORDER_REJECTED`

Örnek mesaj (NEW_ORDER):

```json
{
  "type": "NEW_ORDER",
  "payload": { "id": "...", "token": "...", "code": "...", "customer": { ... }, "products": [ ... ] }
}
```

## 🧩 Doğrulama ve Dönüşüm Katmanı

- `OrderValidator` (temel alan kontrolleri, tip ve format doğrulamaları)
- `OrderTransformer` (dış sistem modelini Prisma şemasına dönüştürür ve ilişkileriyle birlikte transaction içinde kaydeder)
- Callback URL alanları `Order` tablosunda saklanır: `orderAcceptedUrl`, `orderRejectedUrl`, `orderProductModificationUrl`, `orderPickedUpUrl`, `orderPreparedUrl`, `orderPreparationTimeAdjustmentUrl`

## 🗄️ Veritabanı

- Sağlayıcı: PostgreSQL (`schema.prisma → datasource db.provider = postgresql`)
- Önemli tablolar: `orders`, `customers`, `payments`, `prices`, `deliveries`, `pickups`, `products`, `toppings`, `discounts`, `delivery_fees`

## ⚙️ Backend Kurulum & Çalıştırma (main-server)

Gereksinimler: Node.js 18+, PostgreSQL

1) Bağımlılıklar
```bash
cd main-server
npm install
```

2) .env
```env
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
```

3) Prisma
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4) Geliştirme Sunucusu
```bash
npm run dev
# http://localhost:3000
```

## 🖥️ Frontend Kurulum & Çalıştırma (orderflow-frontend)

Gereksinimler: Node.js 18+

```bash
cd orderflow-frontend
npm install
npm start
# http://localhost:4200
```

Bağlantılar:
- Backend HTTP: `http://localhost:3000`
- WebSocket: `ws://localhost:3000`

## 🧪 Örnek İstekler

1) Yeni sipariş (Webhook simülasyonu)
```bash
curl -X POST http://localhost:3000/orders/order/RESTAURANT_123 \
  -H "Content-Type: application/json" \
  -d '{
    "token": "...",
    "code": "...",
    "createdAt": "2025-07-25T10:00:00Z",
    "expiryDate": "2025-07-25T10:30:00Z",
    "expeditionType": "delivery",
    "customer": {"email": "hash@example.com"},
    "localInfo": {"countryCode": "TR", "currencySymbol": "₺", "platform": "YS", "platformKey": "ys"},
    "platformRestaurant": {"id": "YS-REST-1"},
    "payment": {"status": "paid", "type": "card"},
    "price": {"grandTotal": "250.00", "totalNet": "210.00", "vatTotal": "40.00", "deliveryFees": []},
    "products": [],
    "PreparationTimeAdjustments": {"maxPickUpTimestamp": "2025-07-25T10:40:00Z", "preparationTimeChangeIntervalsInMinutes": []}
  }'
```

2) POS durum güncelleme
```bash
curl -X POST http://localhost:3000/orders/remoteId/RESTAURANT_123/remoteOrder/ORDER_TOKEN/posOrderStatus \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted", "timestamp": "2025-07-25T10:05:00Z"}'
```

3) DeliveryHero sipariş durumu (callback tetiklemeli)
```bash
curl -X PUT http://localhost:3000/delivery-hero/order/status/ORDER_TOKEN \
  -H "Content-Type: application/json" \
  -d '{"status": "order_accepted"}'
```

4) DeliveryHero hazırlık tamamlandı
```bash
curl -X POST http://localhost:3000/delivery-hero/orders/ORDER_TOKEN/preparation-completed
```

## 📄 Lisans

MIT Lisansı — dilediğiniz gibi kullanabilirsiniz.
