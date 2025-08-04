# OrderFlow Frontend Dashboard

Modern ve kullanıcı dostu bir sipariş yönetim dashboard'u.

## 🚀 Özellikler

### 📊 **Ana Sayfa (Main Page)**
- **Gelen Siparişler Kuyruğu**: Yemeksepeti'nden gelen yeni siparişler
- **Kabul/Red Butonları**: Her sipariş için anında karar verme
- **Gerçek Zamanlı Güncellemeler**: WebSocket ile anlık bildirimler
- **Ses Bildirimleri**: Yeni sipariş geldiğinde ses uyarısı
- **Responsive Tasarım**: Mobil ve tablet uyumlu

### 📋 **Sidebar (Aktif Siparişler)**
- **Durum Güncellemeleri**: Sipariş hazırlama sürecini takip
- **Progress Bar**: Sipariş durumunu görsel olarak göster
- **Durum Butonları**: 
  - 👨‍🍳 Hazırlanıyor
  - ✅ Hazır
  - 🚚 Kurye Bildir
  - 🎉 Teslim Edildi

### 🔔 **Bildirim Sistemi**
- **Header Bildirimleri**: Tüm önemli olaylar için bildirimler
- **Bildirim Geçmişi**: Son 10 bildirim
- **Okunmamış Bildirim Sayacı**: Kırmızı badge ile gösterim

### 📱 **Responsive Tasarım**
- **Desktop**: Tam ekran dashboard
- **Tablet**: Sidebar üstte, main content altta
- **Mobile**: Tek sütun düzen

## 🛠️ Teknolojiler

- **Angular 20**: Modern component-based framework
- **TypeScript**: Type-safe development
- **WebSocket**: Gerçek zamanlı iletişim
- **CSS Grid & Flexbox**: Modern layout
- **Signal API**: Reactive state management

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+ 
- npm veya yarn

### Kurulum
```bash
# Dependency'leri yükle
npm install

# Development server'ı başlat
npm start
```

### Backend Bağlantısı
Frontend otomatik olarak `http://localhost:3000` adresindeki backend'e bağlanır.

## 📡 API Endpoint'leri

### WebSocket Bağlantısı
- **URL**: `ws://localhost:3000`
- **Mesaj Tipleri**:
  - `NEW_ORDER`: Yeni sipariş
  - `ORDER_STATUS_UPDATE`: Durum güncellemesi
  - `ORDER_ACCEPTED`: Sipariş kabul edildi
  - `ORDER_REJECTED`: Sipariş reddedildi

### HTTP Endpoint'leri
- **PUT** `/delivery-hero/order/status/:orderToken`: Sipariş durumu güncelle
- **POST** `/delivery-hero/orders/:orderToken/preparation-completed`: Kurye bildirimi

## 🎨 Tasarım Özellikleri

### Renk Paleti
- **Primary**: #667eea (Mavi-Mor gradient)
- **Success**: #2ed573 (Yeşil)
- **Warning**: #ffcc02 (Sarı)
- **Error**: #ff4757 (Kırmızı)
- **Info**: #1976d2 (Mavi)

### Animasyonlar
- **Hover Effects**: Buton ve kart hover animasyonları
- **Transitions**: Smooth geçişler
- **Loading States**: Yükleme durumları

## 📱 Kullanım Senaryoları

### 1. Yeni Sipariş Geldiğinde
1. Ses bildirimi çalar
2. Header'da bildirim sayısı artar
3. Main page'de sipariş kartı görünür
4. Kabul/Red butonları aktif olur

### 2. Sipariş Kabul Edildiğinde
1. Main page'den sipariş kaybolur
2. Sidebar'a taşınır
3. Durum "Kabul Edildi" olur
4. Progress bar %25'e çıkar

### 3. Sipariş Hazırlandığında
1. Sidebar'da "Hazırlanıyor" butonu görünür
2. Tıklandığında durum güncellenir
3. Progress bar %50'ye çıkar
4. Bildirim gönderilir

### 4. Sipariş Hazır Olduğunda
1. "Hazır" butonu görünür
2. Progress bar %75'e çıkar
3. Teslimat tipine göre kurye bildirimi

## 🔧 Geliştirme

### Component Yapısı
```
app/
├── header/          # Bildirimler ve bağlantı durumu
├── main-content/    # Gelen siparişler kuyruğu
├── sidebar/         # Aktif siparişler ve durum güncellemeleri
└── footer/          # Saat ve bağlantı durumu
```

### State Management
- **Signal API**: Angular 20'nin yeni reactive state management'ı
- **Component Communication**: Event-based iletişim
- **WebSocket Integration**: Gerçek zamanlı veri akışı

## 🐛 Sorun Giderme

### WebSocket Bağlantı Sorunu
- Backend'in çalıştığından emin olun
- `http://localhost:3000` adresine erişilebilir olmalı
- Browser console'da hata mesajlarını kontrol edin

### Bildirimler Çalışmıyor
- Browser'ın bildirim iznini kontrol edin
- HTTPS gerekliliği olabilir (production'da)

### Responsive Sorunları
- Browser developer tools ile test edin
- CSS media query'leri kontrol edin

## 📈 Gelecek Özellikler

- [ ] **Dark Mode**: Karanlık tema desteği
- [ ] **Ses Ayarları**: Bildirim sesi kontrolü
- [ ] **Filtreler**: Sipariş durumuna göre filtreleme
- [ ] **İstatistikler**: Günlük/haftalık raporlar
- [ ] **Çoklu Restoran**: Birden fazla restoran desteği
- [ ] **PWA**: Progressive Web App özellikleri

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**OrderFlow Dashboard** - Modern sipariş yönetim sistemi 🍽️
