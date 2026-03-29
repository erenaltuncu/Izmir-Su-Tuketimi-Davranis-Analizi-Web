import { BarChart3, Droplets, FlaskConical, Radar, Search, Target } from "lucide-react";
import { Container } from "./ui";

const items = [
  { id: "hero", label: "Genel Bakis", icon: Droplets },
  { id: "explorer", label: "Kesif", icon: Search },
  { id: "segments", label: "Segmentler", icon: Radar },
  { id: "districts", label: "Ilce Karsilastirma", icon: BarChart3 },
  { id: "method", label: "Yontem", icon: FlaskConical },
  { id: "ml", label: "Tahmin", icon: Target }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur">
      <Container>
        <nav className="flex h-14 items-center gap-2 overflow-x-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <Icon size={14} />
                {item.label}
              </a>
            );
          })}
        </nav>
      </Container>
    </header>
  );
}
