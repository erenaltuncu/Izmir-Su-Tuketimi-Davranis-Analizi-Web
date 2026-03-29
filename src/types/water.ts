export type SegmentName =
  | "Standart Sakinler"
  | "Yazlikci / Mevsimsel"
  | "Yuksek Gelir / Cok Tuketen"
  | "ANOMALI (Asiri Tuketim)";

export interface WaterRecord {
  ILCE: string;
  MAHALLE: string;
  Ortalama_Tuketim: number;
  Standart_Sapma: number;
  Yaz_Ortalama: number;
  Kis_Ortalama: number;
  Yazlikci_Skoru: number;
  Kume_No: number;
  Segment_Adi: SegmentName;
}

export type SortKey = "Ortalama_Tuketim" | "Yazlikci_Skoru" | "Standart_Sapma";
export type SortDirection = "asc" | "desc";
