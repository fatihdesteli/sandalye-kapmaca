# Sprite Klasör Yapısı

Bu klasör oyundaki tüm sprite'ları içerir.

## Klasör Yapısı

### `/characters/`
Oyuncu ve bot karakterlerin sprite'ları
- `player/` - Ana oyuncu sprite'ları (idle, walk, death, fall, hit, jumpStart, jumpEnd, roll)
- `bot1/` - Bot 1 sprite'ları
- `bot2/` - Bot 2 sprite'ları
- `bot3/` - Bot 3 sprite'ları
- `bot4/` - Bot 4 sprite'ları

**Mevcut animasyonlar:**
- `idle_0.png` - `idle_5.png` (6 frame)
- `walk_0.png` - `walk_7.png` (8 frame)
- `death_0.png` - `death_9.png` (10 frame)
- `fall_0.png` - `fall_4.png` (5 frame)
- `hit_0.png` - `hit_2.png` (3 frame)
- `jumpStart_0.png` - `jumpStart_2.png` (3 frame)
- `jumpEnd_0.png` - `jumpEnd_2.png` (3 frame)
- `roll_0.png` - `roll_4.png` (5 frame)

### `/objects/`
Oyun objeleri için sprite'lar
- `chair.png` - Sandalye sprite'ı (şu an kod ile çiziliyor)
- `coin.png` - Bonus objeler için (gelecekte)
- `powerup.png` - Power-up'lar için (gelecekte)

### `/environment/`
Arka plan ve zemin sprite'ları
- `floor/` - Farklı zemin pattern'leri
- `background/` - Arka plan görselleri
- `decorations/` - Dekoratif elementler

### `/ui/`
Kullanıcı arayüz sprite'ları
- `buttons/` - Buton sprite'ları
- `icons/` - İkonlar
- `joystick/` - Virtual joystick grafikleri

## Sprite Özellikleri

**Karakter Sprite'ları:**
- Format: PNG (RGBA)
- Boyut: 2048x2048 piksel
- Scale: Oyunda 0.03 ile ölçeklendiriliyor (~61 piksel)

**Gelecek Geliştirmeler:**
1. Sandalye sprite'ı eklenecek (şu an kod ile çiziliyor)
2. Zemin pattern sprite'ları eklenecek
3. Arka plan görselleri eklenecek
4. UI elementleri için sprite'lar eklenecek

## Sprite Ekleme

Yeni bir sprite eklemek için:

1. Uygun klasöre sprite dosyasını koyun
2. `src/scenes/PreloadScene.ts` dosyasında sprite'ı yükleyin:
   ```typescript
   this.load.image('sprite-key', 'assets/sprites/path/to/sprite.png');
   ```
3. İlgili entity/scene'de sprite'ı kullanın

## Animasyon Ekleme

Yeni bir animasyon eklemek için:

1. Tüm frame'leri uygun klasöre ekleyin (örn: `myanimation_0.png`, `myanimation_1.png`, ...)
2. PreloadScene'de frame'leri yükleyin
3. Entity constructor'ında animasyonu oluşturun:
   ```typescript
   scene.anims.create({
     key: 'animation-key',
     frames: Array.from({ length: frameCount }, (_, i) => ({
       key: `sprite-key-${i}`,
     })),
     frameRate: 10,
     repeat: -1,
   });
   ```
