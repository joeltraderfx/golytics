import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "palpites", label: "Palpites" },
  { id: "jogos", label: "Jogos" },
  { id: "classificacao", label: "Classificação" },
  { id: "calculadora", label: "Calculadora" },
];

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-[0_4px_24px_-8px] shadow-black/50"
          : "bg-background/60 backdrop-blur-sm border-b border-border/30"
      )}
    >
      <div className="container flex flex-col gap-3 py-3">
        {/* Logo row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Golytics"
                className="w-11 h-11 rounded-xl object-cover ring-1 ring-primary/20"
              />
              <div className="absolute -inset-0.5 bg-primary/10 rounded-xl blur-md -z-10" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-2xl tracking-tight leading-none">
                GOL<span className="text-primary">Y</span>TICS
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-0.5 font-medium">
                Dados que viram gols
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-muted/30 border border-border/50">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-medium">Brasileirão Série A · 2026</span>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap",
                "active:scale-[0.97]",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-[0_0_16px_-4px] shadow-primary/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
