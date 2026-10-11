# Piano Studio (Piyano Simülasyonu)

Kişisel piyano stüdyosu: Bilgisayar klavyesiyle düşük gecikmeli piyano çalma, akan notalarla (Synthesia tarzı) parça öğrenme ve yapay zeka (MCP) ile kütüphaneyi genişletme platformu.

---

## 🎹 Özellikler

1. **Çalınabilirlik ve Düşük Gecikme:**
   - Web Audio API + Tone.js akustik sentez ve Salamander Grand Piano örnekleri ile **< 30 ms** gecikme süresi.
   - Türkçe / İngilizce klavye düzeninden bağımsız donanım seviyesinde (`KeyboardEvent.code`) tuş eşlemesi.
   - Tuş tekrarlama parazitleri (`e.repeat`) tamamen engellenmiştir.
   - Sustain pedalı (`Space`) ve oktav kaydırma (`Z` / `X`).
   - Klavye ghosting (eşzamanlı tuş algılama) ve anlık gecikme ölçüm aracı.

2. **Akan Notalar ile Öğrenme Modu (Learn):**
   - 60 FPS Canvas 2D render motoru.
   - **Bekleyen Mod (Wait Mode):** Kullanıcı doğru tuşa basmadan müzik ve notalar ilerlemez.
   - **Sağ / Sol El Ayrı Çalışma:** Çift el, sadece sağ el veya sadece sol el filtresi.
   - **Hız Ayarı:** 0.50x, 0.75x, 1.00x, 1.25x tempo çarpanları.
   - **Bölüm Döngüsü (A-B Loop):** Zorlanılan ölçüleri döngüye alarak tekrar etme.
   - Anlık isabet oranı, puanlama ve seri (combo) sayacı.

3. **Repertuar & Kütüphane:**
   - Yüklü klasik başyapıtlar: *Für Elise*, *Moonlight Sonata*, *Canon in D*, *River Flows in You*.
   - **MIDI İçe Aktarma:** `.mid` veya `.midi` dosyalarını sürükleyip bırakarak kütüphaneye parça ekleme.
   - **Onay Akışı (Pending Approval):** Yapay zeka veya OMR ile eklenen parçaları önceden dinleme, doğrulama raporunu inceleme ve kütüphaneye onaylama.

4. **Kayıt ve MIDI Dışa Aktarma (Review):**
   - Performansı zaman damgalı olay günlüğü (event log) olarak kaydetme.
   - Çalınan performansları tarayıcıda geri dinleme.
   - Tek tıkla standart `.mid` dosyası olarak bilgisayara indirme.

5. **Görsel Tasarım & Sinematik Kimlik:**
   - Three.js WebGL procedurally-generated koyu ambiyans shader arka planı (`#09090b` zemin).
   - "Çerçeve içinde çerçeve" modern tasarım dili.
   - Cam efektli (liquid glass) butonlar ve nabız atan durum göstergeleri.
   - Tuşlara basıldığında renkli ışık yayılımı ve neon vuruş parçacıkları.
   - Sekme arka plana geçtiğinde shader otomatik duraklatılarak performans korunur.

6. **Model Context Protocol (MCP) Sunucusu:**
   - Claude Desktop veya yerel AI ajanlarının doğrudan bağlanabileceği yerel MCP sunucusu (`server/mcp-server.js`).
   - Desteklenen araçlar: `list_pieces`, `get_piece`, `add_piece`, `validate_piece`, `split_sections`, `import_pdf`.

---

## ⌨️ Klavye Tuş Eşlemesi

| Tuş | Eşleşen Nota | Tip |
| :--- | :--- | :--- |
| **A** | C4 (Do) | Beyaz Tuş |
| **W** | C#4 (Do Diyez) | Siyah Tuş |
| **S** | D4 (Re) | Beyaz Tuş |
| **E** | D#4 (Re Diyez) | Siyah Tuş |
| **D** | E4 (Mi) | Beyaz Tuş |
| **F** | F4 (Fa) | Beyaz Tuş |
| **T** | F#4 (Fa Diyez) | Siyah Tuş |
| **G** | G4 (Sol) | Beyaz Tuş |
| **Y** | G#4 (Sol Diyez) | Siyah Tuş |
| **H** | A4 (La) | Beyaz Tuş |
| **U** | A#4 (La Diyez) | Siyah Tuş |
| **J** | B4 (Si) | Beyaz Tuş |
| **K** | C5 (Do) | Beyaz Tuş |
| **O** | C#5 (Do Diyez) | Siyah Tuş |
| **L** | D5 (Re) | Beyaz Tuş |
| **P** | D#5 (Re Diyez) | Siyah Tuş |
| **;** | E5 (Mi) | Beyaz Tuş |
| **'** | F5 (Fa) | Beyaz Tuş |
| **Space** | Sustain Pedalı | Basılı tutulabilir veya aç/kapa |
| **Z / X** | Oktav Kaydırma | -2 ile +2 oktav aralığı |

---

## 🚀 Çalıştırma

### Geliştirme Sunucusunu Başlatma:
```bash
npm run dev
```
Uygulama tarayıcınızda açılacaktır: **http://localhost:5173/**

### MCP Sunucusunu Başlatma:
```bash
npm run mcp
```
