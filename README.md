# Sandalye Kapmaca

Phaser 3 ve TypeScript kullanılarak geliştirilmiş mobil sandalye kapmaca oyunu.

## Özellikler

- 🎮 3 farklı seviye (giderek zorlaşan bot AI)
- 🎵 Ses efektleri ve arka plan müziği
- 📱 iOS ve Android desteği (Capacitor ile)
- 🎨 Responsive tasarım
- ⌨️ Klavye kontrolleri (WASD / Ok tuşları)

## Geliştirme

### Gereksinimler

- Node.js (v18+)
- npm

### Kurulum

```bash
npm install
```

### Web Üzerinde Çalıştırma

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

### Build

```bash
npm run build
```

## Mobil (iOS/Android)

### iOS

1. Build ve sync:
```bash
npm run sync:ios
```

2. Xcode'u aç:
```bash
npm run open:ios
```

3. Xcode'da uygulamayı simulator veya gerçek cihazda çalıştırın.

**Not:** İlk açılışta CocoaPods hatası alırsanız:
```bash
cd ios/App
pod install
```

### Android

1. Build ve sync:
```bash
npm run sync:android
```

2. Android Studio'yu aç:
```bash
npm run open:android
```

3. Android Studio'da uygulamayı emulator veya gerçek cihazda çalıştırın.

### Tüm Platformları Sync Etme

```bash
npm run sync
```

## Oyun Kontrolleri

- **WASD** veya **Ok Tuşları**: Hareket
- **Amaç**: Müzik durduğunda bir sandalyeye otur!

## Oyun Mekaniği

1. Round başlar, müzik çalmaya başlar (15 saniye)
2. Oyuncular sandalyelerin etrafında döner
3. Müzik durduğunda herkes boş bir sandalyeye oturmaya çalışır
4. Ayakta kalan oyuncu elenir
5. Son kalan oyuncu kazanır!

## Proje Yapısı

```
sandalye-kapmaca/
├── src/
│   ├── scenes/          # Oyun sahneleri (Preload, Menu, Game)
│   ├── entities/        # Oyun varlıkları (Player, BotPlayer, Chair)
│   ├── managers/        # Yönetici sınıflar (AudioManager)
│   ├── config/          # Konfigürasyon dosyaları
│   └── main.ts          # Ana entry point
├── assets/
│   ├── audio/           # Ses dosyaları
│   ├── images/          # Görseller
│   └── fonts/           # Fontlar
├── ios/                 # iOS native projesi
├── android/             # Android native projesi
└── dist/                # Build çıktısı
```

## Teknolojiler

- **Phaser 3**: Oyun motoru
- **TypeScript**: Programlama dili
- **Vite**: Build tool
- **Capacitor**: Mobil wrapper

## Lisans

ISC
