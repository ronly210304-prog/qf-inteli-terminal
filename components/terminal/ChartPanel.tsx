"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  LineStyle,
  UTCTimestamp,
} from "lightweight-charts";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchDataState } from "@/lib/fetch-data-state";
import { bollingerBands, macd, relativeStrengthIndex, simpleMovingAverage } from "@/lib/indicators";
import { cx } from "@/lib/utils";
import { DataState, OhlcSeries, Timeframe } from "@/types/market";
import { useTerminal } from "./TerminalProvider";

const TIMEFRAMES: Timeframe[] = ["15m", "1h", "1D"];

// QF Inteli Terminal chart palette — deliberately distinct from
// TradingView/Bloomberg defaults, drawn from the same design tokens
// as the rest of the UI (see tailwind.config.ts).
const COLORS = {
  bg: "#14181C",
  grid: "#1B1F23",
  text: "#6B7280",
  up: "#4E9E6E",
  down: "#C4553F",
  ma20: "#C6A344",
  ma60: "#4C97A3",
  ma99: "#E7E9EC",
  bbLine: "#3F454C",
  rsiLine: "#C6A344",
  macdLine: "#4C97A3",
  macdSignal: "#C6A344",
  macdHistUp: "#4E9E6E",
  macdHistDown: "#C4553F",
};

function toChartTime(bars: { time: number }[]) {
  return bars as unknown as { time: UTCTimestamp }[];
}

/**
 * Real OHLC chart (STEP 4), MA/BB overlays and RSI/MACD sub-panels
 * (STEP 5), and a CSS-based fullscreen mode (more reliable than the
 * Fullscreen API on mobile Safari). Renders lightweight-charts with
 * QF Inteli Terminal's own palette — no TradingView chrome or branding.
 */
export function ChartPanel() {
  const { asset, timeframe, setTimeframe, indicators } = useTerminal();
  const [state, setState] = useState<DataState<OhlcSeries>>({ status: "loading" });
  const [fullscreen, setFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const macdContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const overlaySeriesRef = useRef<ISeriesApi<"Line">[]>([]);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const macdChartRef = useRef<IChartApi | null>(null);

  // Fetch OHLC whenever asset or timeframe changes.
  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchDataState<OhlcSeries>(
      `/api/market/ohlc?symbol=${encodeURIComponent(asset.symbol)}&timeframe=${timeframe}`
    ).then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [asset.symbol, timeframe]);

  // Build/rebuild the main chart whenever bars or indicator toggles change.
  useEffect(() => {
    if (state.status !== "ok" || !containerRef.current) return;
    const bars = state.data.bars;
    const el = containerRef.current;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: COLORS.bg },
        textColor: COLORS.text,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: COLORS.grid },
        horzLines: { color: COLORS.grid },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: COLORS.grid },
      timeScale: { borderColor: COLORS.grid, timeVisible: true },
      width: el.clientWidth,
      height: el.clientHeight,
    });
    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: COLORS.up,
      downColor: COLORS.down,
      borderUpColor: COLORS.up,
      borderDownColor: COLORS.down,
      wickUpColor: COLORS.up,
      wickDownColor: COLORS.down,
    });
    candleSeries.setData(toChartTime(bars) as never);
    candleSeriesRef.current = candleSeries;

    const overlays: ISeriesApi<"Line">[] = [];

    if (indicators.ma20) {
      const s = chart.addLineSeries({ color: COLORS.ma20, lineWidth: 1, title: "MA20" });
      s.setData(toChartTime(simpleMovingAverage(bars, 20)) as never);
      overlays.push(s);
    }
    if (indicators.ma60) {
      const s = chart.addLineSeries({ color: COLORS.ma60, lineWidth: 1, title: "MA60" });
      s.setData(toChartTime(simpleMovingAverage(bars, 60)) as never);
      overlays.push(s);
    }
    if (indicators.ma99) {
      const s = chart.addLineSeries({ color: COLORS.ma99, lineWidth: 1, title: "MA99" });
      s.setData(toChartTime(simpleMovingAverage(bars, 99)) as never);
      overlays.push(s);
    }
    if (indicators.bb) {
      const bands = bollingerBands(bars, 20, 2);
      const upper = chart.addLineSeries({
        color: COLORS.bbLine,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: "BB U",
      });
      upper.setData(toChartTime(bands.upper) as never);
      const lower = chart.addLineSeries({
        color: COLORS.bbLine,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: "BB L",
      });
      lower.setData(toChartTime(bands.lower) as never);
      overlays.push(upper, lower);
    }

    overlaySeriesRef.current = overlays;
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    });
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      overlaySeriesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, indicators.ma20, indicators.ma60, indicators.ma99, indicators.bb, fullscreen]);

  // RSI sub-panel.
  useEffect(() => {
    if (!indicators.rsi || state.status !== "ok" || !rsiContainerRef.current) return;
    const el = rsiContainerRef.current;
    const bars = state.data.bars;
    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: COLORS.bg },
        textColor: COLORS.text,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: 10,
      },
      grid: { vertLines: { color: COLORS.grid }, horzLines: { color: COLORS.grid } },
      rightPriceScale: { borderColor: COLORS.grid },
      timeScale: { borderColor: COLORS.grid, timeVisible: true },
      width: el.clientWidth,
      height: el.clientHeight,
    });
    rsiChartRef.current = chart;
    const rsiSeries = chart.addLineSeries({ color: COLORS.rsiLine, lineWidth: 1, title: "RSI" });
    rsiSeries.setData(toChartTime(relativeStrengthIndex(bars, 14)) as never);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    });
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      rsiChartRef.current = null;
    };
  }, [indicators.rsi, state, fullscreen]);

  // MACD sub-panel.
  useEffect(() => {
    if (!indicators.macd || state.status !== "ok" || !macdContainerRef.current) return;
    const el = macdContainerRef.current;
    const bars = state.data.bars;
    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: COLORS.bg },
        textColor: COLORS.text,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: 10,
      },
      grid: { vertLines: { color: COLORS.grid }, horzLines: { color: COLORS.grid } },
      rightPriceScale: { borderColor: COLORS.grid },
      timeScale: { borderColor: COLORS.grid, timeVisible: true },
      width: el.clientWidth,
      height: el.clientHeight,
    });
    macdChartRef.current = chart;
    const { macdLine, signalLine, histogram } = macd(bars, 12, 26, 9);

    const histSeries = chart.addHistogramSeries({ color: COLORS.macdHistUp });
    histSeries.setData(
      histogram.map((p) => ({
        time: p.time as unknown as UTCTimestamp,
        value: p.value,
        color: p.value >= 0 ? COLORS.macdHistUp : COLORS.macdHistDown,
      }))
    );
    const macdSeries = chart.addLineSeries({ color: COLORS.macdLine, lineWidth: 1, title: "MACD" });
    macdSeries.setData(toChartTime(macdLine) as never);
    const signalSeries = chart.addLineSeries({ color: COLORS.macdSignal, lineWidth: 1, title: "SIGNAL" });
    signalSeries.setData(toChartTime(signalLine) as never);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    });
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      macdChartRef.current = null;
    };
  }, [indicators.macd, state, fullscreen]);

  return (
    <Panel
      noPadding
      className={cx("flex flex-col", fullscreen && "fixed inset-0 z-30")}
    >
      <div className="flex items-center justify-between border-b border-term-borderdim px-2.5 py-1.5">
        <div className="flex gap-1.5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={cx(
                "px-1.5 font-mono text-micro",
                tf === timeframe ? "text-term-white" : "text-term-graydim"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setFullscreen((v) => !v)}
          className="font-mono text-micro text-term-gray"
          aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {fullscreen ? "✕" : "⤢"}
        </button>
      </div>

      <div ref={wrapperRef} className="flex flex-1 flex-col">
        {state.status === "loading" && (
          <div className="flex h-[320px] items-center justify-center">
            <StatusBadge kind="loading" />
          </div>
        )}
        {(state.status === "unavailable" || state.status === "error") && (
          <div className="flex h-[320px] items-center justify-center">
            <StatusBadge
              kind={state.status === "error" && state.message === "OFFLINE" ? "offline" : "unavailable"}
              detail={state.status === "unavailable" ? state.reason : undefined}
            />
          </div>
        )}
        {state.status === "ok" && (
          <>
            <div
              ref={containerRef}
              className={fullscreen ? "flex-1" : "h-[320px]"}
            />
            {indicators.rsi && <div ref={rsiContainerRef} className="h-[110px] border-t border-term-borderdim" />}
            {indicators.macd && <div ref={macdContainerRef} className="h-[110px] border-t border-term-borderdim" />}
          </>
        )}
      </div>
    </Panel>
  );
}
