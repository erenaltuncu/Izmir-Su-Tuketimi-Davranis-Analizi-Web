## Gorsel Denetim Ozeti

Bu dosya, bolum bazli gorsel kullanimini ve uygulanan kalite iyilestirmesini dokumante eder.

### Bolum Eslesmesi

- `segments`: `scatter_plot.png` (2 kolon alanda kullaniliyor)
- `method`: `elbow_method.png` (2 kolon alanda kullaniliyor)
- `ml`: `model_comparison_graph.png`, `scatter_pred_vs_actual.png`, `feature_importance.png` (3 kolon alanda kullaniliyor)

### Siniflandirma (Uygun / Resize / Yeniden Uret)

- `model_comparison_graph.png`: Uygun + optimize
- `scatter_plot.png`: Resize + oran normalizasyonu
- `elbow_method.png`: Resize + oran normalizasyonu
- `feature_importance.png`: Resize + oran normalizasyonu
- `scatter_pred_vs_actual.png`: Yeniden uretilmis tuval (1600x900), kaynak gorsel korunarak yeniden kadrajlandi

### Uygulanan Islem

- Tum PNG dosyalari `1600x900` hedef tuvale alindi.
- Kaynagi bozmadan `object-contain` mantigina uygun sekilde yeniden olceklendirildi.
- Netlik icin hafif keskinlestirme uygulandi.
- Orijinal dosyalar `public/images/originals` altinda yedeklendi.
