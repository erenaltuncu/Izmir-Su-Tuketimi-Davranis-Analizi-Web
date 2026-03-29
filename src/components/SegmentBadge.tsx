import { segmentDescriptions } from "../data/waterData";
import type { SegmentName } from "../types/water";

export function SegmentBadge({ segment }: { segment: SegmentName }) {
  const color = segmentDescriptions[segment].color;
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-slate-900" style={{ backgroundColor: color }}>
      {segment}
    </span>
  );
}
