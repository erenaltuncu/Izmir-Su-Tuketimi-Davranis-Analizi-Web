import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { EXPLORER_PAGE_SIZE } from "../lib/constants";
import { formatConsumption, formatNumber, formatTwoDecimals } from "../lib/format";
import type { SortDirection, SortKey } from "../types/water";
import { ExplorerPagination } from "../components/ExplorerPagination";
import { SegmentBadge } from "../components/SegmentBadge";
import { Card, FadeIn, Section } from "../components/ui";

const PIE_ALL_DISTRICTS = "__ALL__";

const SEGMENT_COMPARE_ROW_CLASS = "flex h-full min-h-[420px] flex-col";

const ImagePanel = ({
  fileName,
  title,
  aspectClass = "aspect-[16/9]",
  onOpen,
  fillBody = false,
  cardClassName
}: {
  fileName: string;
  title: string;
  aspectClass?: string;
  onOpen: (image: { src: string; title: string }) => void;
  /** İki sütunlu grafik satırında kart yüksekliğini eşitlemek için: gövde flex ile dolar, aspect oranı kullanılmaz. */
  fillBody?: boolean;
  cardClassName?: string;
}) => (
  <Card className={clsx(fillBody && SEGMENT_COMPARE_ROW_CLASS, cardClassName)}>
    <button
      type="button"
      onClick={() => onOpen({ src: `/images/${fileName}`, title })}
      className={clsx(
        "w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
        fillBody ? "flex min-h-0 flex-1 flex-col" : "block"
      )}
      aria-label={`${title} görselini büyüt`}
    >
      <p className="mb-3 shrink-0 text-sm font-semibold text-slate-200">{title}</p>
      <div
        className={clsx(
          "overflow-hidden rounded-xl border border-white/10 bg-slate-950/80",
          fillBody ? "min-h-0 flex-1" : aspectClass
        )}
      >
        <img
          src={`/images/${fileName}`}
          alt={title}
          className="h-full w-full object-contain transition duration-300 hover:scale-[1.01]"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.insertAdjacentHTML(
              "afterend",
              "<div class='flex h-full items-center justify-center rounded-xl border border-dashed border-white/20 p-8 text-center text-sm text-slate-300'>Bu görsel bulunamadı. `public/images` altına ekleyin.</div>"
            );
          }}
        />
      </div>
    </button>
  </Card>
);

export function PageSections() {
  const kpis = useMemo(() => buildKpis(waterData), []);
  const districts = useMemo(() => ["Tüm İlçeler", ...uniqueDistricts(waterData)], []);
  const segments = useMemo(() => ["Tüm Segmentler", ...uniqueSegments(waterData)], []);
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

  const [district, setDistrict] = useState("Tüm İlçeler");
  const [segment, setSegment] = useState("Tüm Segmentler");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("Ortalama_Tuketim");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [cardView, setCardView] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string } | null>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [pieDistrictFilter, setPieDistrictFilter] = useState<string>(PIE_ALL_DISTRICTS);
  const [explorerPage, setExplorerPage] = useState(1);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
    setImageNaturalSize(null);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeModal]);

  const filtered = useMemo(
    () => filterAndSort(waterData, district, segment, query, sortKey, sortDirection),
    [district, segment, query, sortKey, sortDirection]
  );

  const explorerTotalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / EXPLORER_PAGE_SIZE)),
    [filtered.length]
  );

  const explorerSafePage = Math.min(explorerPage, explorerTotalPages);

  const explorerPaginated = useMemo(
    () =>
      filtered.slice(
        (explorerSafePage - 1) * EXPLORER_PAGE_SIZE,
        explorerSafePage * EXPLORER_PAGE_SIZE
      ),
    [filtered, explorerSafePage]
  );

  useEffect(() => {
    setExplorerPage(1);
  }, [district, segment, query, sortKey, sortDirection]);

  useEffect(() => {
    if (explorerPage > explorerTotalPages) {
      setExplorerPage(explorerTotalPages);
    }
  }, [explorerPage, explorerTotalPages]);

  const segmentPieData = useMemo(() => {
    const counts =
      pieDistrictFilter === PIE_ALL_DISTRICTS
        ? kpis.segmentCounts
        : districtSummary.find((row) => row.district === pieDistrictFilter)?.segmentCounts ?? {};
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [pieDistrictFilter, kpis.segmentCounts, districtSummary]);

  return (
    <>
      <section id="hero" className="relative overflow-hidden border-b border-white/10 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.15),_transparent_40%),radial-gradient(circle_at_top_left,_rgba(168,85,247,0.14),_transparent_35%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">İzmir Su Tüketimi Hikayesi</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl">
              İzmir'de Su Tüketimini Mahalle Ölçeğinde Keşfedin
            </h1>
            <p className="mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
              Statik veri setiyle hazırlanan bu anlatım; belediye, araştırmacı ve yönetici ekipler için tüketim desenlerini, segmentleri ve tahmin yaklaşımını tek sayfada birleştirir.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#explorer" className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">Veriyi İncele</a>
              <a href="#segments" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10">Segmentleri Gör</a>
              <a href="#ml" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10">Tahmin Modeli</a>
            </div>
          </FadeIn>
        </div>
      </section>

      <Section id="kpi" title="Üst Düzey KPI Kartları">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card><p className="text-sm text-slate-300">Toplam İlçe</p><p className="mt-2 text-3xl font-bold text-white">{kpis.districtCount}</p></Card>
          <Card><p className="text-sm text-slate-300">Toplam Mahalle</p><p className="mt-2 text-3xl font-bold text-white">{kpis.neighborhoodCount}</p></Card>
          <Card><p className="text-sm text-slate-300">Ortalama Tüketim Ortalaması</p><p className="mt-2 text-3xl font-bold text-white">{formatConsumption(kpis.averageConsumption)}</p></Card>
          <Card><p className="text-sm text-slate-300">En Yüksek Ortalama</p><p className="mt-2 text-lg font-semibold text-white">{kpis.topConsumption.MAHALLE} ({kpis.topConsumption.ILCE})</p></Card>
          <Card><p className="text-sm text-slate-300">En Yüksek Yazlıkçı Skoru</p><p className="mt-2 text-lg font-semibold text-white">{kpis.topSummerScore.MAHALLE} ({kpis.topSummerScore.Yazlikci_Skoru})</p></Card>
          <Card><p className="text-sm text-slate-300">Segment Dağılımı</p><p className="mt-2 text-sm text-slate-100">{Object.entries(kpis.segmentCounts).map(([s, c]) => `${s}: ${c}`).join(" | ")}</p></Card>
        </div>
      </Section>

      <Section id="dataset" title="Veri Seti Hakkında" subtitle="Bu veri; ilçe-mahalle bazında tüketim ortalaması, oynaklık ve mevsimsellik etkisini birlikte okumayı sağlar.">
        <Card>
          <ul className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
            <li><strong>Ortalama Tüketim:</strong> Mahallenin temel su kullanımı seviyesi.</li>
            <li><strong>Standart Sapma:</strong> Tüketimdeki oynaklığı ve dalgalanmayı gösterir.</li>
            <li><strong>Yaz/Kış Ortalaması:</strong> Sezonsal talep farkını ölçer.</li>
            <li><strong>Yazlıkçı Skoru:</strong> Mevsimsel nüfus ve yaz etkisini temsil eder.</li>
            <li><strong>Segment/Küme:</strong> Benzer davranışa sahip mahallelerin gruplanmış halidir.</li>
            <li><strong>Nasıl Okunur?</strong> Yüksek ortalama + yüksek sapma genelde kritik takip alanıdır.</li>
          </ul>
        </Card>
      </Section>

      <Section id="explorer" title="Etkileşimli Keşif Alanı">
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
          <button onClick={() => setCardView((v) => !v)} className="rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10">{cardView ? "Tablo Görünümü" : "Kart Görünümü"}</button>
        </Card>

        {cardView ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {explorerPaginated.map((item) => (
              <Card key={`${item.ILCE}-${item.MAHALLE}`}>
                <p className="text-xs text-slate-300">{item.ILCE}</p>
                <h4 className="mt-1 text-lg font-semibold text-white">{item.MAHALLE}</h4>
                <p className="mt-2 text-sm text-slate-200">Ortalama: {formatConsumption(item.Ortalama_Tuketim)} | Std: {item.Standart_Sapma}</p>
                <p className="mt-1 text-sm text-slate-200">Yaz/Kış: {item.Yaz_Ortalama}/{item.Kis_Ortalama}</p>
                <p className="mt-1 text-sm text-slate-200">Yazlıkçı: {item.Yazlikci_Skoru}</p>
                <div className="mt-3"><SegmentBadge segment={item.Segment_Adi} /></div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm text-slate-200">
              <thead><tr className="text-left text-slate-300"><th>İlçe</th><th>Mahalle</th><th>Ort.</th><th>Yaz</th><th>Kış</th><th>Skor</th><th>Segment</th></tr></thead>
              <tbody>{explorerPaginated.map((item) => <tr key={`${item.ILCE}-${item.MAHALLE}`} className="border-t border-white/10"><td>{item.ILCE}</td><td>{item.MAHALLE}</td><td>{item.Ortalama_Tuketim}</td><td>{item.Yaz_Ortalama}</td><td>{item.Kis_Ortalama}</td><td>{item.Yazlikci_Skoru}</td><td><SegmentBadge segment={item.Segment_Adi} /></td></tr>)}</tbody>
            </table>
          </Card>
        )}

        <div className="mt-4">
          <ExplorerPagination
            page={explorerSafePage}
            totalPages={explorerTotalPages}
            totalItems={filtered.length}
            pageSize={EXPLORER_PAGE_SIZE}
            onPageChange={setExplorerPage}
          />
        </div>
      </Section>

      <Section id="segments" title="Segment Analizi">
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          {Object.entries(segmentDescriptions).map(([name, info]) => (
            <Card key={name}>
              <p className="text-base font-semibold text-white">{name}</p>
              <p className="mt-2 text-sm text-slate-300">{info.description}</p>
              <p className="mt-2 text-sm text-slate-200">Davranış: {info.behavior}</p>
              <p className="mt-1 text-sm text-slate-200">Yorum: {info.interpretation}</p>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <ImagePanel fileName="scatter_plot.png" title="Hazır Segment Dağılım Görseli" onOpen={setSelectedImage} fillBody />
          <Card className={clsx(SEGMENT_COMPARE_ROW_CLASS)}>
            <p className="mb-2 shrink-0 text-sm font-semibold text-slate-200">Canlı Scatter (Tooltip Destekli)</p>
            <div className="min-h-0 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 12, right: 12, left: 0, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="Yazlikci_Skoru" name="Yazlıkçı Skoru" stroke="#cbd5e1" />
                  <YAxis dataKey="Ortalama_Tuketim" name="Ortalama Tüketim" stroke="#cbd5e1" />
                  <Tooltip cursor={{ strokeDasharray: "4 4" }} />
                  <Scatter data={waterData}>
                    {waterData.map((entry) => <Cell key={`${entry.ILCE}-${entry.MAHALLE}`} fill={segmentDescriptions[entry.Segment_Adi].color} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </Section>

      <Section id="districts" title="İlçe Karşılaştırma">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="h-[320px]">
            <p className="mb-2 text-sm font-semibold text-slate-200">İlçeye Göre Ortalama Tüketim</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="district" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip
                  formatter={(value) => [formatTwoDecimals(Number(value)), "Ortalama tüketim"]}
                />
                <Bar dataKey="ortalamaTuketim" name="Ortalama tüketim" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="h-[320px]">
            <p className="mb-2 text-sm font-semibold text-slate-200">İlçeye Göre Ortalama Yazlıkçı Skoru</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="district" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip
                  formatter={(value) => [formatTwoDecimals(Number(value)), "Ortalama yazlıkçı skoru"]}
                />
                <Bar dataKey="ortalamaYazlikciSkoru" name="Ortalama yazlıkçı skoru" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="h-[320px]">
            <p className="mb-2 text-sm font-semibold text-slate-200">Top 10 Yüksek Tüketimli Mahalle</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topConsumption}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="MAHALLE" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip formatter={(value) => [formatTwoDecimals(Number(value)), "Ortalama tüketim"]} />
                <Bar dataKey="Ortalama_Tuketim" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="h-[320px]">
            <p className="mb-2 text-sm font-semibold text-slate-200">Top 10 Yüksek Yazlıkçı Skorlu Mahalle</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSummer}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="MAHALLE" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip formatter={(value) => [formatTwoDecimals(Number(value)), "Yazlıkçı skoru"]} />
                <Bar dataKey="Yazlikci_Skoru" fill="#fb7185" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="lg:col-span-2">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-200">İlçe bazlı segment dağılımı</p>
                <p className="mt-1 text-xs text-slate-400">
                  Dilimler mahalle sayısını gösterir. Tüm veri seti: tüm ilçeler birlikte; tek ilçe: yalnız o ilçedeki mahalleler.
                </p>
              </div>
              <label className="flex flex-col gap-1 text-xs text-slate-400 sm:min-w-[200px]">
                <span className="sr-only">İlçe seçimi</span>
                <select
                  value={pieDistrictFilter}
                  onChange={(e) => setPieDistrictFilter(e.target.value)}
                  className="rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  aria-label="Segment grafiği için ilçe filtresi"
                >
                  <option value={PIE_ALL_DISTRICTS}>Tüm veri seti (tüm ilçeler)</option>
                  {districts
                    .filter((d) => d !== "Tüm İlçeler")
                    .map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            {segmentPieData.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">Bu seçim için görüntülenecek veri yok.</p>
            ) : (
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={segmentPieData} dataKey="value" nameKey="name" outerRadius={120}>
                      {segmentPieData.map((entry) => (
                        <Cell key={entry.name} fill={segmentDescriptions[entry.name as keyof typeof segmentDescriptions].color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} mahalle`, "Adet"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </Section>

      <Section id="method" title="Kümeleme / Analitik Yöntem">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="text-sm text-slate-200">Elbow yöntemi, farklı küme sayılarında model hatasının nasıl değiştiğine bakarak optimum segment sayısını seçmeye yardımcı olur. Segment sayısı fazla olursa yorum zorlaşır, az olursa farklı davranışlar tek grupta erir.</p>
            <p className="mt-3 text-sm text-slate-200">Bu çalışmada <strong>Kume_No</strong>, teknik model çıktısını; <strong>Segment_Adi</strong> ise yönetsel kararlar için yorumlanabilir etiketi temsil eder.</p>
          </Card>
          <ImagePanel fileName="elbow_method.png" title="Elbow Yöntemi" aspectClass="aspect-[16/9]" onOpen={setSelectedImage} />
        </div>
      </Section>

      <Section id="ml" title="Makine Öğrenmesi / Tahmin Bölümü">
        <div className="grid gap-4 lg:grid-cols-3">
          <ImagePanel fileName="model_comparison_graph.png" title="Model Karşılaştırma" aspectClass="aspect-[16/9]" onOpen={setSelectedImage} />
          <ImagePanel fileName="scatter_pred_vs_actual.png" title="Gerçek vs Tahmin" aspectClass="aspect-[16/9]" onOpen={setSelectedImage} />
          <ImagePanel fileName="feature_importance.png" title="Özellik Önemi" aspectClass="aspect-[16/9]" onOpen={setSelectedImage} />
        </div>
        <Card className="mt-4">
          <p className="text-sm text-slate-200">Tahmin modeli, mahalle bazında gelecekteki tüketim seviyesini öngörmeyi amaçlar. <strong>R2</strong>, modelin verideki değişimin ne kadarını açıkladığını gösteren temel başarı ölçüsüdür.</p>
          <p className="mt-2 text-sm text-slate-200"><strong>Lag_12</strong>: geçen yılın aynı dönemi etkisi, <strong>Lag_1</strong>: bir önceki dönem etkisi, <strong>Yaz sezonu</strong>: mevsimsel talep şifti. Bu değişkenler birlikte kullanıldığında planlama güvenilirliği artar.</p>
        </Card>
      </Section>

      <Section id="insights" title="İçgörüler / Öne Çıkan Bulgular">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card><p className="text-sm text-slate-300">En yüksek ortalama tüketim</p><p className="mt-2 font-semibold text-white">{insights.high.MAHALLE} ({insights.high.ILCE})</p></Card>
          <Card><p className="text-sm text-slate-300">En düşük ortalama tüketim</p><p className="mt-2 font-semibold text-white">{insights.low.MAHALLE} ({insights.low.ILCE})</p></Card>
          <Card><p className="text-sm text-slate-300">Yaz etkisi en yüksek mahalleler</p><p className="mt-2 text-sm text-slate-100">{insights.summerEffect.map((x) => x.MAHALLE).join(", ")}</p></Card>
          <Card><p className="text-sm text-slate-300">Oynaklığı en yüksek mahalleler</p><p className="mt-2 text-sm text-slate-100">{insights.volatility.map((x) => x.MAHALLE).join(", ")}</p></Card>
          <Card><p className="text-sm text-slate-300">Anomali segmentindeki mahalleler</p><p className="mt-2 text-sm text-slate-100">{insights.anomaly.map((x) => x.MAHALLE).join(", ")}</p></Card>
          <Card><p className="text-sm text-slate-300">Yazlıkçı davranışı belirgin</p><p className="mt-2 text-sm text-slate-100">{insights.seasonal.map((x) => `${x.MAHALLE} (${formatNumber(x.Yazlikci_Skoru)})`).join(", ")}</p></Card>
        </div>
      </Section>

      <Section id="methodology" title="Metodoloji">
        <Card>
          <p className="text-sm text-slate-200">
            Veri alanı olarak ilçe, mahalle, ortalama tüketim, standart sapma, yaz/kış ortalamaları, yazlıkçı skoru ve küme etiketleri kullanılmıştır. Segmentasyon, benzer tüketim davranışını gruplandırmaya odaklanır. Tahmin görselleri model performansını ve özellik etkisini açıklamak için eklenmiştir. Bu site, keşif ve karar destek sunumu amaçlı statik bir demonstrasyondur.
          </p>
        </Card>
      </Section>

      <footer id="about" className="border-t border-white/10 py-10">
        <div className="mx-auto max-w-7xl px-4 text-sm text-slate-300 sm:px-6 lg:px-8">
          <p className="font-semibold text-slate-100">İzmir Su Tüketimi Veri Hikayesi</p>
          <p className="mt-2 max-w-2xl">Veri odaklı şehir analizi için hazırlanmış, tamamen istemci tarafında çalışan statik bir sunum sitesidir.</p>
          <div className="mt-6 border-t border-white/10 pt-6 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Eren Altuncu. Tüm hakları saklıdır.</p>
            <p className="mt-1">Bu sitedeki gösterimler ve yorumlar bilgilendirme amaçlıdır; resmi karar alma yerine geçmez.</p>
          </div>
        </div>
      </footer>

      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-[95vw] rounded-2xl border border-white/15 bg-slate-900/95 p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 rounded-lg border border-white/20 bg-slate-900/80 px-3 py-1 text-xs text-slate-100 hover:bg-slate-800"
              onClick={closeModal}
            >
              Kapat
            </button>
            <p className="mb-2 pr-16 text-sm font-semibold text-slate-100">{selectedImage.title}</p>
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              className="h-auto max-h-[90vh] w-auto max-w-[95vw] rounded-lg object-contain"
              onLoad={(event) =>
                setImageNaturalSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight
                })
              }
            />
            {imageNaturalSize && (
              <p className="mt-2 text-xs text-slate-300">
                Orijinal çözünürlük: {imageNaturalSize.width} x {imageNaturalSize.height}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
