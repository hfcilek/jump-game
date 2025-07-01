# jump-game


Klasik Doodle Jump oyununa benzer bir web tabanlı platform atlama oyunu.

## Özellikler

### 🎮 Oynanış
- Karakter sürekli zıplayarak yukarı çıkar
- Sol/sağ ok tuşları veya A/D tuşları ile yatay hareket
- Platform üzerine düştüğünde karakter tekrar zıplar
- Ekranın altına düşerse oyun biter
- Kamera karakteri takip eder

### 🏗️ Platform Tipleri
- **Normal Platformlar** (Yeşil) - Standart zıplama
- **Kırılabilir Platformlar** (Kahverengi) - Üzerine basınca yok olur
- **Yaylı Platformlar** (Mavi) - Ekstra yüksek zıplama
- **Hareketli Platformlar** (Kırmızı) - Sağa sola hareket eder

### 📊 Skor Sistemi
- Yükseklik bazlı skor hesaplama
- En yüksek skor kaydetme (localStorage)
- Canlı skor gösterimi

## Kontroller

### 🖥️ Masaüstü
- **← →** veya **A D**: Sağa/sola hareket
- **SPACE**: Oyunu başlat/tekrar başlat

### 📱 Mobil
- Ekranda görünen sol/sağ butonlar
- Dokunmatik kontroller

## Kurulum ve Çalıştırma

1. Tüm dosyaları bir klasöre kaydedin:
```
/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── game.js
│   ├── player.js
│   ├── platform.js
│   └── utils.js
└── README.md
```

2. `index.html` dosyasını bir web tarayıcısında açın

3. Oyunu başlatmak için "Oyunu Başlat" butonuna tıklayın veya SPACE tuşuna basın

## Teknik Detaylar

### 🛠️ Teknolojiler
- HTML5 Canvas
- Vanilla JavaScript (ES6+)
- CSS3 (Flexbox, Grid, Animations)
- Local Storage (High Score)

### ⚡ Performans
- 60 FPS oyun döngüsü
- Optimized rendering (sadece görünür objeler)
- Efficient collision detection
- Memory management (platform cleanup)

### 📱 Responsive Tasarım
- Farklı ekran boyutlarına uyum
- Mobil dokunmatik kontroller
- Canvas otomatik boyutlandırma

## Oyun Mekanikleri

### 🏃‍♂️ Karakter Fiziği
- Yerçekimi simülasyonu
- Realistic jump physics
- Horizontal momentum
- Screen wrapping (kenarlardan geçiş)

### 🎯 Çarpışma Sistemi
- Pixel-perfect collision detection
- Platform-specific behaviors
- Optimized collision boxes

### 📈 Zorluk Sistemi
- Platform yoğunluğu otomatik ayarlanır
- Yükseldikçe artan zorluk
- Rastgele platform dağılımı

## Geliştirici Notları

### 🔧 Customization
- Platform renklerini `Platform.setColor()` fonksiyonunda değiştirebilirsiniz
- Oyun fizik değerlerini `Player` constructor'ında ayarlayabilirsiniz
- Yeni platform tipleri eklemek için `Platform` sınıfını genişletebilirsiniz

### 🐛 Debugging
- Browser Developer Tools'da console logları kontrol edin
- `Game.gameState` değişkeni ile oyun durumunu takip edebilirsiniz

## Lisans

Bu proje eğitim amaçlı olarak geliştirilmiştir. Özgürce kullanabilir ve değiştirebilirsiniz.

## Katkıda Bulunma

Oyunu geliştirmek için fikirlerinizi paylaşabilir veya kod katkılarında bulunabilirsiniz.

Keyifli oyunlar! 🎮
