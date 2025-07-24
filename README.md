
# 🍔 OrderFlow - Yemeksepeti Entegrasyonlu Gerçek Zamanlı Sipariş Takip Sistemi

OrderFlow, restoranların Yemeksepeti'nden gelen siparişleri **anlık olarak takip etmesini**, **durum güncellemelerini** yapmasını ve **istatistikleri** izlemesini sağlayan tam entegre bir backend sistemidir.

## ✨ Proje Amacı

* Yemeksepeti tarafından gelen sipariş verilerini webhook ile al.
* Veriyi doğrula, dönüştür, veritabanına kaydet.
* Angular tabanlı frontend'e WebSocket ile güncel siparişleri aktar.
* Sipariş durumu güncellemelerini hem Yemeksepeti'ne hem frontend'e ilet.

---

## ⚙️ Kullanılan Teknolojiler

| Teknoloji   | Amaç                              |
| ----------- | --------------------------------- |
| Node.js     | Sunucu tarafı çalışma ortamı      |
| Express.js  | HTTP sunucusu ve routing          |
| Prisma ORM  | Veritabanı işlemleri (MySQL)      |
| MySQL       | Kalıcı veri saklama               |
| WebSocket   | Gerçek zamanlı iletim (Socket.IO) |
| TypeScript  | Tip güvenli backend geliştirme    |
| Ngrok (dev) | Webhook testleri için tünelleme   |

---

## 🔄 Sistem İletişim Yapısı

| Kaynak             | Hedef    | Protokol  | Amaç                          |
| ------------------ | -------- | --------- | ----------------------------- |
| Yemeksepeti        | Backend  | Webhook   | Yeni sipariş, durum bildirimi |
| Frontend (Angular) | Backend  | REST      | Sipariş sorgu ve güncelleme   |
| Backend            | Frontend | WebSocket | Gerçek zamanlı sipariş akışı  |

---

## 📁 Dosya Yapısı (Katmanlı Mimari)

```
src/
├── controllers/        → HTTP isteklerini karşılar
│   ├── orderController.ts
│   └── statusController.ts
├── services/          → İş mantığını yönetir
│   ├── orderService.ts
│   └── statusService.ts
├── repositories/      → DB işlemleri (Prisma)
│   ├── orderRepository.ts
│   └── restaurantRepository.ts
├── routes/            → Express router tanımları
│   ├── orderRoutes.ts
│   └── statusRoutes.ts
├── sockets/           → WebSocket olay yönetimi
│   └── socketHandler.ts
├── middleware/        → Hata ve auth yönetimi
│   ├── errorHandler.ts
│   └── authMiddleware.ts
├── prisma/            → Prisma schema ve client
│   └── schema.prisma
├── utils/             → Yardımcı fonksiyonlar
│   └── formatter.ts
└── index.ts           → Uygulama girişi (Express + WebSocket)
```

---

## 🚪 API Endpoint Listesi

### ✨ Webhook

| Method | URL                           | Açıklama                    |
| ------ | ----------------------------- | --------------------------- |
| POST   | `/webhook/yemeksepeti-order`  | Yeni sipariş webhook'u      |
| POST   | `/webhook/yemeksepeti-status` | Sipariş durumu güncellemesi |

### 🍔 Order API

| Method | URL               | Açıklama                 |
| ------ | ----------------- | ------------------------ |
| GET    | `/api/orders`     | Tüm siparişleri listeler |
| GET    | `/api/orders/:id` | Belirli siparişi getirir |
| PUT    | `/api/orders/:id` | Siparişi günceller       |
| DELETE | `/api/orders/:id` | Siparişi siler           |

### ⚖️ Status API

| Method | URL                          | Açıklama                            |
| ------ | ---------------------------- | ----------------------------------- |
| PUT    | `/api/orders/:id/status`     | Sipariş durumu güncelle             |
| GET    | `/api/orders/status/:status` | Belirli statüdeki siparişleri getir |

### 📊 Stats API

| Method | URL          | Açıklama                    |
| ------ | ------------ | --------------------------- |
| GET    | `/api/stats` | Sipariş sayıları, gelir vs. |

---

## 🔌 WebSocket Eventleri

### Server → Client

* `order:new` → Yeni sipariş geldi
* `order:statusUpdated` → Sipariş durumu güncellendi
* `stats:update` → İstatistik verileri güncellendi

### Client → Server

* `order:updateStatus` → Kullanıcı sipariş durumu güncelledi

---

## 🌐 Genel Akış Şemasi

```
[Yemeksepeti] --(POST Webhook)-->
   /webhook/yemeksepeti-order
         ↓
   OrderService.validateAndSave()
         ↓
   Prisma (MySQL)
         ↓
   WebSocket.emit("order:new")
         → Angular dashboard
```

---

## ⚡ Kurulum ve Çalıştırma

```bash
git clone https://github.com/your-username/orderflow-backend.git
cd orderflow-backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Webhook test etmek için:

```bash
npx ngrok http 3000
# Yemeksepeti'ne webhook URL olarak: https://xxxxx.ngrok.io/webhook/yemeksepeti-order
```

---

## 🚀 Katkıda Bulun

Pull request, issue ve geliştirme önerileri için katkılarınızı bekliyoruz!

---

## 📄 Lisans

MIT Lisansı — dilediğiniz gibi kullanabilirsiniz.
