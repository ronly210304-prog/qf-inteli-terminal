import { OhlcBar } from "@/types/market";

/**
 * Local technical-indicator calculations. All inputs are real OHLC
 * bars from services/market — nothing here invents price data, it
 * only derives numbers from bars that were actually fetched.
 */

export interface LinePoint {
  time: number;
  value: number;
}

export function simpleMovingAverage(bars: OhlcBar[], period: number): LinePoint[] {
  if (bars.length < period) return [];
  const points: LinePoint[] = [];
  let sum = 0;
  for (let i = 0; i < bars.length; i++) {
    sum += bars[i].close;
    if (i >= period) sum -= bars[i - period].close;
    if (i >= period - 1) {
      points.push({ time: bars[i].time, value: sum / period });
    }
  }
  return points;
}

export interface BollingerBands {
  upper: LinePoint[];
  middle: LinePoint[];
  lower: LinePoint[];
}

export function bollingerBands(bars: OhlcBar[], period = 20, stdDevMultiplier = 2): BollingerBands {
  const middle = simpleMovingAverage(bars, period);
  const upper: LinePoint[] = [];
  const lower: LinePoint[] = [];

  for (let i = period - 1; i < bars.length; i++) {
    const window = bars.slice(i - period + 1, i + 1).map((b) => b.close);
    const mean = window.reduce((a, b) => a + b, 0) / period;
    const variance = window.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
    const stdDev = Math.sqrt(variance);
    const time = bars[i].time;
    upper.push({ time, value: mean + stdDevMultiplier * stdDev });
    lower.push({ time, value: mean - stdDevMultiplier * stdDev });
  }

  return { upper, middle, lower };
}

export function relativeStrengthIndex(bars: OhlcBar[], period = 14): LinePoint[] {
  if (bars.length < period + 1) return [];
  const points: LinePoint[] = [];
  let gainSum = 0;
  let lossSum = 0;

  for (let i = 1; i <= period; i++) {
    const change = bars[i].close - bars[i - 1].close;
    if (change >= 0) gainSum += change;
    else lossSum -= change;
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  points.push({ time: bars[period].time, value: rsiFromAverages(avgGain, avgLoss) });

  for (let i = period + 1; i < bars.length; i++) {
    const change = bars[i].close - bars[i - 1].close;
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    points.push({ time: bars[i].time, value: rsiFromAverages(avgGain, avgLoss) });
  }

  return points;
}

function rsiFromAverages(avgGain: number, avgLoss: number): number {
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function exponentialMovingAverage(values: LinePoint[], period: number): LinePoint[] {
  if (values.length < period) return [];
  const k = 2 / (period + 1);
  const points: LinePoint[] = [];
  let emaPrev = values.slice(0, period).reduce((a, b) => a + b.value, 0) / period;
  points.push({ time: values[period - 1].time, value: emaPrev });
  for (let i = period; i < values.length; i++) {
    const ema = values[i].value * k + emaPrev * (1 - k);
    points.push({ time: values[i].time, value: ema });
    emaPrev = ema;
  }
  return points;
}

export interface Macd {
  macdLine: LinePoint[];
  signalLine: LinePoint[];
  histogram: LinePoint[];
}

export function macd(bars: OhlcBar[], fast = 12, slow = 26, signal = 9): Macd {
  const closes: LinePoint[] = bars.map((b) => ({ time: b.time, value: b.close }));
  const emaFast = exponentialMovingAverage(closes, fast);
  const emaSlow = exponentialMovingAverage(closes, slow);

  // Align by time — emaSlow starts later than emaFast.
  const slowByTime = new Map(emaSlow.map((p) => [p.time, p.value]));
  const macdLine: LinePoint[] = emaFast
    .filter((p) => slowByTime.has(p.time))
    .map((p) => ({ time: p.time, value: p.value - slowByTime.get(p.time)! }));

  const signalLine = exponentialMovingAverage(macdLine, signal);
  const signalByTime = new Map(signalLine.map((p) => [p.time, p.value]));
  const histogram: LinePoint[] = macdLine
    .filter((p) => signalByTime.has(p.time))
    .map((p) => ({ time: p.time, value: p.value - signalByTime.get(p.time)! }));

  return { macdLine, signalLine, histogram };
}
