import type { SortDirection, SortKey, WaterRecord } from "../types/water";

export const uniqueDistricts = (records: WaterRecord[]) =>
  [...new Set(records.map((x) => x.ILCE))].sort((a, b) => a.localeCompare(b, "tr"));

export const uniqueSegments = (records: WaterRecord[]) =>
  [...new Set(records.map((x) => x.Segment_Adi))];

export const average = (values: number[]) =>
  values.length ? values.reduce((acc, item) => acc + item, 0) / values.length : 0;

export const buildKpis = (records: WaterRecord[]) => {
  const topConsumption = [...records].sort((a, b) => b.Ortalama_Tuketim - a.Ortalama_Tuketim)[0];
  const topSummerScore = [...records].sort((a, b) => b.Yazlikci_Skoru - a.Yazlikci_Skoru)[0];
  const segmentCounts = records.reduce<Record<string, number>>((acc, item) => {
    acc[item.Segment_Adi] = (acc[item.Segment_Adi] ?? 0) + 1;
    return acc;
  }, {});

  return {
    districtCount: uniqueDistricts(records).length,
    neighborhoodCount: records.length,
    averageConsumption: average(records.map((x) => x.Ortalama_Tuketim)),
    topConsumption,
    topSummerScore,
    segmentCounts
  };
};

export const filterAndSort = (
  records: WaterRecord[],
  district: string,
  segment: string,
  query: string,
  sortKey: SortKey,
  direction: SortDirection
) => {
  const lowered = query.trim().toLocaleLowerCase("tr");
  const filtered = records.filter((item) => {
    const districtOk = district === "Tüm İlçeler" || item.ILCE === district;
    const segmentOk = segment === "Tüm Segmentler" || item.Segment_Adi === segment;
    const searchOk = lowered.length === 0 || item.MAHALLE.toLocaleLowerCase("tr").includes(lowered);
    return districtOk && segmentOk && searchOk;
  });

  return filtered.sort((a, b) => {
    const coeff = direction === "asc" ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * coeff;
  });
};

export const byDistrictSummary = (records: WaterRecord[]) => {
  const map = new Map<string, WaterRecord[]>();
  records.forEach((row) => {
    if (!map.has(row.ILCE)) map.set(row.ILCE, []);
    map.get(row.ILCE)?.push(row);
  });

  return [...map.entries()]
    .map(([district, items]) => ({
      district,
      ortalamaTuketim: average(items.map((x) => x.Ortalama_Tuketim)),
      ortalamaYazlikciSkoru: average(items.map((x) => x.Yazlikci_Skoru)),
      segmentCounts: items.reduce<Record<string, number>>((acc, item) => {
        acc[item.Segment_Adi] = (acc[item.Segment_Adi] ?? 0) + 1;
        return acc;
      }, {})
    }))
    .sort((a, b) => b.ortalamaTuketim - a.ortalamaTuketim);
};
