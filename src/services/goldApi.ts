import axios from 'axios';

const BASE_URL = 'https://www.goldapi.io/api';
const API_KEY = process.env.EXPO_PUBLIC_GOLD_API_KEY || '';

const goldApiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-access-token': API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface LivePriceData {
  metal: string;
  currency: string;
  price: number;
  prev_close_price: number;
  ch: number;       // absolute change
  chp: number;      // change percentage
  timestamp: number;
  open_price: number;
  high_price: number;
  low_price: number;
}

// ---------- Session-level cache (invalidated on hard reload) ----------
const _cache: Map<string, { data: LivePriceData; fetchedAt: number }> = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — conserves the 100 req/day free quota

export const getLivePrice = async (
  metal: string,
  currency: string = 'INR'
): Promise<LivePriceData> => {

  if (!API_KEY) {
    throw new Error(
      'No Gold API key found. Add EXPO_PUBLIC_GOLD_API_KEY to your .env file.'
    );
  }

  const cacheKey = `${metal}_${currency}`;
  const cached = _cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    console.log(`[GoldApi] Serving ${metal} from cache (age: ${Math.round((Date.now() - cached.fetchedAt) / 1000)}s)`);
    return cached.data;
  }

  try {
    console.log(`[GoldApi] Fetching live price for ${metal}/${currency}…`);
    const response = await goldApiClient.get<LivePriceData>(`/${metal}/${currency}`);
    const data = response.data;
    _cache.set(cacheKey, { data, fetchedAt: Date.now() });
    return data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 403) {
      throw new Error(
        `API key rejected or daily limit reached (403). ` +
        `Free tier allows 100 requests/day on goldapi.io.`
      );
    }
    if (status === 401) {
      throw new Error('Invalid API key (401). Check your .env file.');
    }
    throw new Error(`Failed to fetch ${metal} price: ${error?.message ?? 'Unknown error'}`);
  }
};

/**
 * Mocks the 7-day historical prices because goldapi.io historical fetches
 * cost 1 call per day (7 calls × 3 metals = 21 calls per screen load).
 * This keeps historical charts free without exhausting the daily quota.
 */
export const getHistoricalMockData = (currentPrice: number, days: number = 7): number[] => {
  const data = [];
  let price = currentPrice;
  for (let i = 0; i < days; i++) {
    data.unshift(price);
    const variance = (Math.random() - 0.5) * 0.03;
    price = price * (1 + variance);
  }
  return data;
};

// ---------- Candlestick OHLC data ----------
export interface OHLCData {
  open: number;
  high: number;
  low: number;
  close: number;
  label: string;
}

export const getHistoricalOHLCMockData = (currentPrice: number, days: number = 7): OHLCData[] => {
  const data: OHLCData[] = [];
  let close = currentPrice;

  const dayLabels = ['-6d', '-5d', '-4d', '-3d', '-2d', 'yest', 'now'];

  for (let i = days - 1; i >= 0; i--) {
    const dailyRange = close * (0.005 + Math.random() * 0.015); // 0.5–2% daily range
    const open = close * (1 + (Math.random() - 0.5) * 0.01);
    const high = Math.max(open, close) + Math.random() * dailyRange;
    const low = Math.min(open, close) - Math.random() * dailyRange;

    data.unshift({
      open,
      high,
      low,
      close,
      label: dayLabels[i] ?? `${-i}d`,
    });

    // step backwards
    const variance = (Math.random() - 0.5) * 0.025;
    close = close * (1 + variance);
  }

  return data;
};

// ---------- Currency conversion via Frankfurter API (free, no key) ----------
let _cachedRate: { rate: number; fetchedAt: number } | null = null;
const RATE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

export const getExchangeRate = async (): Promise<number> => {
  if (_cachedRate && Date.now() - _cachedRate.fetchedAt < RATE_CACHE_TTL) {
    return _cachedRate.rate;
  }

  try {
    const response = await axios.get(
      'https://api.frankfurter.app/latest?base=USD&symbols=INR'
    );
    const rate = response.data.rates.INR; // e.g. 84.5
    _cachedRate = { rate, fetchedAt: Date.now() };
    console.log(`[Exchange] Fetched USD→INR rate: ${rate}`);
    return rate;
  } catch (error) {
    console.warn('[Exchange] Failed to fetch rate, using fallback 84.0');
    return 84.0; // Safe fallback
  }
};
