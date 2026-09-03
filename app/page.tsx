import { Header } from "@/components/terminal/Header";
import { AssetSummary } from "@/components/terminal/AssetSummary";
import { ChartPanel } from "@/components/terminal/ChartPanel";
import { IndicatorControls } from "@/components/terminal/IndicatorControls";
import { MarketDataTable } from "@/components/terminal/MarketDataTable";
import { NewsPanel } from "@/components/terminal/NewsPanel";
import { MacroPanel } from "@/components/terminal/MacroPanel";
import { SentimentPanel } from "@/components/terminal/SentimentPanel";
import { EventsPanel } from "@/components/terminal/EventsPanel";
import { TerminalProvider } from "@/components/terminal/TerminalProvider";
import { AssetSelector } from "@/components/terminal/AssetSelector";

// Section order matches spec section 8:
// header -> asset summary -> chart -> indicator controls -> market data
// -> news -> macro -> sentiment -> upcoming events.
export default function TerminalPage() {
  return (
    <TerminalProvider>
      <Header />
      <main className="flex flex-1 flex-col gap-2 p-2">
        <AssetSummary />
        <ChartPanel />
        <IndicatorControls />
        <MarketDataTable />
        <NewsPanel />
        <MacroPanel />
        <SentimentPanel />
        <EventsPanel />
      </main>
      <AssetSelector />
    </TerminalProvider>
  );
}
