import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { segmentDescriptions, waterData } from "../data/waterData";
import { buildKpis, byDistrictSummary, filterAndSort, uniqueDistricts, uniqueSegments } from "../lib/analytics";
import { formatConsumption, formatNumber } from "../lib/format";
import type { SortDirection, SortKey } from "../types/water";
import { SegmentBadge } from "../components/SegmentBadge";
import { Card, FadeIn, Section } from "../components/ui";

const imageNames = [
  "elbow_method.png",
  "feature_importance.png",
  "model_comparison_graph.png",
  "scatter_plot.png",
  "scatter_pred_vs_actual.png"
];

const ImagePanel = ({ fileName, title }: { fileName: string; title: string }) => (
  <Card>
    <p className="mb-3 text-sm font-semibold text-slate-200">{title}</p>
    <img
      src={`/images/${fileName}`}
      alt={title}
      className="h-auto w-full rounded-xl border border-white/10 object-cover"
      onError={(event) => {
        event.currentTarget.style.display = "none";
        event.currentTarget.insertAdjacentHTML("afterend", "<div class='rounded-xl border border-dashed border-white/20 p-8 text-sm text-slate-300'>Bu gorsel bulunamadi. `public/images` altina ekleyin.</div>");
      }}
    />
  </Card>
);

export function PageSections() {
  const kpis = useMemo(() => buildKpis(waterData), []);
  const districts = useMemo(() => ["Tum Ilceler", ...uniqueDistricts(waterData)], []);
  const segments = useMemo(() => ["Tum Segmentler", ...uniqueSegments(waterData)], []);
  const districtSummary = useMemo(() => byDistrictSummary(waterData), []);
  const topConsumption = useMemo(() => [...waterData].sort((a, b) => b.Ortalama_Tuketim - a.Ortalama_Tuketim).slice(0, 10), []);
  const topSummer = useMemo(() => [...waterData].sort((a, b) => b.Yazlikci_Skoru - a.Yazlikci_Skoru).slice(0, 10), []);
  const insights = useMemo(() => {
    const sortedByAvg = [...waterData].sort((a, b) => b.Ortalama_Tuketim - a.Ortalama_Tuketim);
    const sortedByStd = [...waterData].sort((a, b) => b.Standart_Sapma - a.Standart_Sapma);
    const sortedBySummerGap = [...waterData].sort((a, b) => b.Yaz_Ortalama - b.Kis_Ortalama - (a.Yaz_Ortalama - a.Kis_Ortalama));
    return {
      high: sortedByAvg[0],
      low: sortedByAvg[sortedByAvg.length - 1],
      volatility: sortedByStd.slice(0, 3),
      summerEffect: sortedBySummerGap.slice(0, 3),
      anomaly: waterData.filter((x) => x.Segment_Adi === "ANOMALI (Asiri Tuketim)").slice(0, 4),
      seasonal: [...waterData].sort((a, b) => b.Yazlikci_Skoru - a.Yazlikci_Skoru).slice(0, 3)
    };
  }, []);

  const [district, setDistrict] = useState("Tum Ilceler");
  const [segment, setSegment] = useState("Tum Segmentler");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("Ortalama_Tuketim");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [cardView, setCardView] = useState(true);

  const filtered = useMemo(
    () => filterAndSort(waterData, district, segment, query, sortKey, sortDirection),
    [district, segment, query, sortKey, sortDirection]
  );

  return (
    <>
      <section id="hero" className="relative overflow-hidden border-b border-white/10 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.15),_transparent_40%),radial-gradient(circle_at_top_left,_rgba(168,85,247,0.14),_transparent_35%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">Izmir Su Tuketimi Hikayesi</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl">
              Izmir'de Su Tuketimini Mahalle Olceginde Kesfedin
            </h1>
            <p className="mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
              Statik veri setiyle hazirlanan bu anlatim; belediye, arastirmaci ve yonetici ekipler icin tuketim desenlerini, segmentleri ve tahmin yaklasimini tek sayfada birlestirir.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#explorer" className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">Veriyi Incele</a>
              <a href="#segments" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10">Segmentleri Gor</a>
              <a href="#ml" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10">Tahmin Modeli</a>
            </div>
          </FadeIn>
        </div>
      </section>

      <Section id="kpi" title="Ust Duzey KPI Kartlari">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card><p className="text-sm text-slate-300">Toplam Ilce</p><p className="mt-2 text-3xl font-bold text-white">{kpis.districtCount}</p></Card>
          <Card><p className="text-sm text-slate-300">Toplam Mahalle</p><p className="mt-2 text-3xl font-bold text-white">{kpis.neighborhoodCount}</p></Card>
          <Card><p className="text-sm text-slate-300">Ortalama Tuketim Ortalamasi</p><p className="mt-2 text-3xl font-bold text-white">{formatConsumption(kpis.averageConsumption)}</p></Card>
          <Card><p className="text-sm text-slate-300">En Yuksek Ortalama</p><p className="mt-2 text-lg font-semibold text-white">{kpis.topConsumption.MAHALLE} ({kpis.topConsumption.ILCE})</p></Card>
          <Card><p className="text-sm text-slate-300">En Yuksek Yazlikci Skoru</p><p className="mt-2 text-lg font-semibold text-white">{kpis.topSummerScore.MAHALLE} ({kpis.topSummerScore.Yazlikci_Skoru})</p></Card>
          <Card><p className="text-sm text-slate-300">Segment Dagilimi</p><p className="mt-2 text-sm text-slate-100">{Object.entries(kpis.segmentCounts).map(([s, c]) => `${s}: ${c}`).join(" | ")}</p></Card>
        </div>
      </Section>

      <Section id="dataset" title="Veri Seti Hakkinda" subtitle="Bu veri; ilce-mahalle bazinda tuketim ortalamasi, oynaklik ve mevsimsellik etkisini birlikte okumayi saglar.">
        <Card>
          <ul className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
            <li><strong>Ortalama Tuketim:</strong> Mahallenin temel su kullanimi seviyesi.</li>
            <li><strong>Standart Sapma:</strong> Tuketimdeki oynakligi ve dalgalanmayi gosterir.</li>
            <li><strong>Yaz/Kis Ortalamasi:</strong> Sezonsal talep farkini olcer.</li>
            <li><strong>Yazlikci Skoru:</strong> Mevsimsel nufus ve yaz etkisini temsil eder.</li>
            <li><strong>Segment/Kume:</strong> Benzer davranisa sahip mahallelerin gruplanmis halidir.</li>
            <li><strong>Nasil Okunur?</strong> Yuksek ortalama + yuksek sapma genelde kritik takip alanidir.</li>
          </ul>
        </Card>
      </Section>

      <Section id="explorer" title="Etkilesimli Kesif Alani">
        <Card className="mb-4 grid gap-3 lg:grid-cols-6">
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className="rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-sm">{districts.map((d) => <option key={d}>{d}</option>)}</select>
          <select value={segment} onChange={(e) => setSegment(e.target.value)} className="rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-sm">{segments.map((s) => <option key={s}>{s}</option>)}</select>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Mahalle ara..." className="rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-sm" />
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-sm">
            <option value="Ortalama_Tuketim">Ortalama_Tuketim</option><option value="Yazlikci_Skoru">Yazlikci_Skoru</option><option value="Standart_Sapma">Standart_Sapma</option>
          </select>
          <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value as SortDirection)} className="rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-sm">
            <option value="desc">Azalan</option><option value="asc">Artan</option>
          </select>
          <button onClick={() => setCardView((v) => !v)} className="rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10">{cardView ? "Tablo Gorunumu" : "Kart Gorunumu"}</button>
        </Card>

        {cardView ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <Card key={`${item.ILCE}-${item.MAHALLE}`}>
                <p className="text-xs text-slate-300">{item.ILCE}</p>
                <h4 className="mt-1 text-lg font-semibold text-white">{item.MAHALLE}</h4>
                <p className="mt-2 text-sm text-slate-200">Ortalama: {formatConsumption(item.Ortalama_Tuketim)} | Std: {item.Standart_Sapma}</p>
                <p className="mt-1 text-sm text-slate-200">Yaz/Kis: {item.Yaz_Ortalama}/{item.Kis_Ortalama}</p>
                <p className="mt-1 text-sm text-slate-200">Yazlikci: {item.Yazlikci_Skoru}</p>
                <div className="mt-3"><SegmentBadge segment={item.Segment_Adi} /></div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm text-slate-200">
              <thead><tr className="text-left text-slate-300"><th>Ilce</th><th>Mahalle</th><th>Ort.</th><th>Yaz</th><th>Kis</th><th>Skor</th><th>Segment</th></tr></thead>
              <tbody>{filtered.map((item) => <tr key={`${item.ILCE}-${item.MAHALLE}`} className="border-t border-white/10"><td>{item.ILCE}</td><td>{item.MAHALLE}</td><td>{item.Ortalama_Tuketim}</td><td>{item.Yaz_Ortalama}</td><td>{item.Kis_Ortalama}</td><td>{item.Yazlikci_Skoru}</td><td><SegmentBadge segment={item.Segment_Adi} /></td></tr>)}</tbody>
            </table>
          </Card>
        )}
      </Section>

      <Section id="segments" title="Segment Analizi">
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          {Object.entries(segmentDescriptions).map(([name, info]) => (
            <Card key={name}>
              <p className="text-base font-semibold text-white">{name}</p>
              <p className="mt-2 text-sm text-slate-300">{info.description}</p>
              <p className="mt-2 text-sm text-slate-200">Davranis: {info.behavior}</p>
              <p className="mt-1 text-sm text-slate-200">Yorum: {info.interpretation}</p>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ImagePanel fileName="scatter_plot.png" title="Hazir Segment Dagilim Gorseli" />
          <Card className="h-[360px]">
            <p className="mb-2 text-sm font-semibold text-slate-200">Canli Scatter (Tooltip Destekli)</p>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 12, right: 12, left: 0, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="Yazlikci_Skoru" name="Yazlikci Skoru" stroke="#cbd5e1" />
                <YAxis dataKey="Ortalama_Tuketim" name="Ortalama Tuketim" stroke="#cbd5e1" />
                <Tooltip cursor={{ strokeDasharray: "4 4" }} />
                <Scatter data={waterData}>
                  {waterData.map((entry) => <Cell key={`${entry.ILCE}-${entry.MAHALLE}`} fill={segmentDescriptions[entry.Segment_Adi].color} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </Section>

      <Section id="districts" title="Ilce Karsilastirma">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="h-[320px]">
            <p className="mb-2 text-sm font-semibold text-slate-200">Ilceye Gore Ortalama Tuketim</p>
            <ResponsiveContainer width="100%" height="100%"><BarChart data={districtSummary}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="district" stroke="#cbd5e1" /><YAxis stroke="#cbd5e1" /><Tooltip /><Bar dataKey="avgConsumption" fill="#22d3ee" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>
          </Card>
          <Card className="h-[320px]">
            <p className="mb-2 text-sm font-semibold text-slate-200">Ilceye Gore Ortalama Yazlikci Skoru</p>
            <ResponsiveContainer width="100%" height="100%"><BarChart data={districtSummary}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="district" stroke="#cbd5e1" /><YAxis stroke="#cbd5e1" /><Tooltip /><Bar dataKey="avgSummerScore" fill="#f59e0b" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>
          </Card>
          <Card className="h-[320px]">
            <p className="mb-2 text-sm font-semibold text-slate-200">Top 10 Yuksek Tuketimli Mahalle</p>
            <ResponsiveContainer width="100%" height="100%"><BarChart data={topConsumption}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="MAHALLE" stroke="#cbd5e1" /><YAxis stroke="#cbd5e1" /><Tooltip /><Bar dataKey="Ortalama_Tuketim" fill="#10b981" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>
          </Card>
          <Card className="h-[320px]">
            <p className="mb-2 text-sm font-semibold text-slate-200">Top 10 Yuksek Yazlikci Skorlu Mahalle</p>
            <ResponsiveContainer width="100%" height="100%"><BarChart data={topSummer}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="MAHALLE" stroke="#cbd5e1" /><YAxis stroke="#cbd5e1" /><Tooltip /><Bar dataKey="Yazlikci_Skoru" fill="#fb7185" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>
          </Card>
          <Card className="h-[340px] lg:col-span-2">
            <p className="mb-2 text-sm font-semibold text-slate-200">Ilce Bazli Segment Dagilimi (Toplam)</p>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={Object.entries(kpis.segmentCounts).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" outerRadius={120}>
                  {Object.keys(kpis.segmentCounts).map((name) => <Cell key={name} fill={segmentDescriptions[name as keyof typeof segmentDescriptions].color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </Section>

      <Section id="method" title="Kumeleme / Analitik Yontem">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="text-sm text-slate-200">Elbow yontemi, farkli kume sayilarinda model hatasinin nasil degistigine bakarak optimum segment sayisini secmeye yardimci olur. Segment sayisi fazla olursa yorum zorlasir, az olursa farkli davranislar tek grupta erir.</p>
            <p className="mt-3 text-sm text-slate-200">Bu calismada <strong>Kume_No</strong>, teknik model ciktisini; <strong>Segment_Adi</strong> ise yonetsel kararlar icin yorumlanabilir etiketi temsil eder.</p>
          </Card>
          <ImagePanel fileName="elbow_method.png" title="Elbow Yontemi" />
        </div>
      </Section>

      <Section id="ml" title="Makine Ogrenmesi / Tahmin Bolumu">
        <div className="grid gap-4 lg:grid-cols-3">
          <ImagePanel fileName="model_comparison_graph.png" title="Model Karsilastirma" />
          <ImagePanel fileName="scatter_pred_vs_actual.png" title="Gercek vs Tahmin" />
          <ImagePanel fileName="feature_importance.png" title="Ozellik Onemi" />
        </div>
        <Card className="mt-4">
          <p className="text-sm text-slate-200">Tahmin modeli, mahalle bazinda gelecekteki tuketim seviyesini ongormeyi amaclar. <strong>R2</strong>, modelin verideki degisimin ne kadarini acikladigini gosteren temel basari olcusudur.</p>
          <p className="mt-2 text-sm text-slate-200"><strong>Lag_12</strong>: gecen yilin ayni donemi etkisi, <strong>Lag_1</strong>: bir onceki donem etkisi, <strong>Yaz sezonu</strong>: mevsimsel talep sifti. Bu degiskenler birlikte kullanildiginda planlama guvenilirligi artar.</p>
        </Card>
      </Section>

      <Section id="insights" title="Icgoruler / One Cikan Bulgular">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card><p className="text-sm text-slate-300">En yuksek ortalama tuketim</p><p className="mt-2 font-semibold text-white">{insights.high.MAHALLE} ({insights.high.ILCE})</p></Card>
          <Card><p className="text-sm text-slate-300">En dusuk ortalama tuketim</p><p className="mt-2 font-semibold text-white">{insights.low.MAHALLE} ({insights.low.ILCE})</p></Card>
          <Card><p className="text-sm text-slate-300">Yaz etkisi en yuksek mahalleler</p><p className="mt-2 text-sm text-slate-100">{insights.summerEffect.map((x) => x.MAHALLE).join(", ")}</p></Card>
          <Card><p className="text-sm text-slate-300">Oynakligi en yuksek mahalleler</p><p className="mt-2 text-sm text-slate-100">{insights.volatility.map((x) => x.MAHALLE).join(", ")}</p></Card>
          <Card><p className="text-sm text-slate-300">Anomali segmenti mahalleleri</p><p className="mt-2 text-sm text-slate-100">{insights.anomaly.map((x) => x.MAHALLE).join(", ")}</p></Card>
          <Card><p className="text-sm text-slate-300">Yazlikci davranisi belirgin</p><p className="mt-2 text-sm text-slate-100">{insights.seasonal.map((x) => `${x.MAHALLE} (${formatNumber(x.Yazlikci_Skoru)})`).join(", ")}</p></Card>
        </div>
      </Section>

      <Section id="methodology" title="Metodoloji">
        <Card>
          <p className="text-sm text-slate-200">
            Veri alani olarak ilce, mahalle, ortalama tuketim, standart sapma, yaz/kis ortalamalari, yazlikci skoru ve kume etiketleri kullanilmistir. Segmentasyon, benzer tuketim davranisini gruplandirmaya odaklanir. Tahmin gorselleri model performansini ve ozellik etkisini aciklamak icin eklenmistir. Bu site, kesif ve karar destek sunumu amacli statik bir demonstrasyondur.
          </p>
        </Card>
      </Section>

      <footer id="about" className="border-t border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-4 text-sm text-slate-300 sm:px-6 lg:px-8">
          <p className="font-semibold text-slate-100">Izmir Su Tuketimi Veri Hikayesi</p>
          <p className="mt-2">Veri odakli sehir analizi icin hazirlanmis, tamamen client-side statik bir sunum sitesidir.</p>
          <p className="mt-2 text-xs text-slate-400">Beklenen gorsel dosyalari: {imageNames.join(", ")}</p>
        </div>
      </footer>
    </>
  );
}
