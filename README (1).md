# İzmir Su Tüketimi — Davranış Analizi Web

İzmir ilçe–mahalle ölçeğinde su tüketimi verilerini; KPI’lar, segment açıklamaları, etkileşimli keşif alanı ve Recharts grafikleriyle sunan tek sayfalık bir **statik** web uygulamasıdır. Veri istemci tarafında gömülüdür; ayrı bir backend gerektirmez.

**Teknoloji:** React 19, TypeScript, Vite 8, Tailwind CSS 4, Recharts, Framer Motion.

## Özellikler

- Üst düzey özet kartları ve mahalle keşif alanı (filtre, sıralama, sayfalama)
- Segment dağılımı, ilçe karşılaştırmaları ve scatter grafikleri
- Makine öğrenmesi / kümeleme görselleri (PNG) ve metodoloji bölümü
- Tamamen istemci tarafında çalışır; üretimde statik dosya olarak yayınlanabilir

## Gereksinimler

- **Node.js** 20 veya üzeri (LTS önerilir)
- **npm** 10+ (veya uyumlu bir paket yöneticisi)

Sürümleri kontrol etmek için:

```bash
node -v
npm -v
```

## Nasıl çalıştırılır (How to run)

### 1. Bağımlılıkları yükleyin

Proje kökünde:

```bash
npm install
```

### 2. Geliştirme sunucusu

Tarayıcıda canlı yenileme ile yerel geliştirme:

```bash
npm run dev
```

Vite genelde `http://localhost:5173` adresinde açılır; terminal çıktısındaki URL’yi kullanın.

### 3. Üretim derlemesi

TypeScript kontrolü ve optimize edilmiş statik çıktı:

```bash
npm run build
```

Çıktı `dist/` klasörüne yazılır.

### 4. Üretim önizlemesi (isteğe bağlı)

Derlenen siteyi yerelde test etmek için:

```bash
npm run preview
```

## Görseller

Analiz bölümlerinde kullanılan PNG dosyaları `public/images/` altında tutulur. Eksik dosya listesi ve isimlendirme için bkz. [public/images/README.md](public/images/README.md).

## Proje yapısı (kısa)

| Yol | Açıklama |
|-----|----------|
| `src/App.tsx` | Ana düzen |
| `src/sections/PageSections.tsx` | Sayfa bölümleri, grafikler ve keşif arayüzü |
| `src/data/waterData.ts` | Mahalle veri seti ve segment meta bilgisi |
| `src/lib/` | KPI, filtreleme ve format yardımcıları |
| `public/` | Statik varlıklar (görseller, favicon) |

## Lisans ve kullanım

Proje özel (`private`) bir depo olarak yapılandırılmıştır. Gösterim ve metinler bilgilendirme amaçlıdır; resmi karar alma yerine geçmez.
