// The paper hands math: for every coin the wallet sold, what are those exact tokens
// worth today, compared to what the wallet got for them?
// Both sides are valued in USD at today's prices (SOL received counts at today's SOL price),
// so the number shows the cost of selling the coin instead of holding it.
import { unstable_cache } from "next/cache";
import { fetchOwnTrades } from "./helius-gtfa";
import { fetchPrices, SOL_MINT } from "./prices";

const MAX_COINS = 60; // biggest sells by SOL received, keeps price lookups fast
const MIN_DIFF = 5; // USD, smaller moves are noise

export type Coin = {
  mint: string;
  symbol: string;
  soldSol: number; // SOL received for it
  soldUsd: number; // that SOL at today's price
  worthNow: number; // the sold tokens at today's price
  diff: number; // worthNow - soldUsd, > 0 means paper handed
  dead: boolean; // no market found, counted as worth 0
};

export type Result = {
  wallet: string;
  sells: number;
  coins: number;
  solUsd: number;
  leftOnTable: number; // sum of positive diffs, USD
  dodged: number; // sum of what you saved by selling coins that dumped, USD
  regrets: Coin[]; // top 5 paper hands
  bestExit: Coin | null;
  updatedAt: number;
};

async function compute(wallet: string): Promise<Result> {
  const swaps = await fetchOwnTrades(wallet);

  const sold = new Map<string, { tokens: number; sol: number }>();
  let sells = 0;
  for (const s of swaps) {
    if (s.tokenDelta >= 0 || s.solDelta <= 0) continue;
    sells++;
    const c = sold.get(s.mint) ?? { tokens: 0, sol: 0 };
    c.tokens += -s.tokenDelta;
    c.sol += s.solDelta;
    sold.set(s.mint, c);
  }

  const mints = [...sold.entries()]
    .sort((a, b) => b[1].sol - a[1].sol)
    .slice(0, MAX_COINS)
    .map(([m]) => m);
  const prices = await fetchPrices([SOL_MINT, ...mints]);
  const solUsd = prices.get(SOL_MINT)?.usd ?? 0;
  if (!solUsd) throw new Error("no SOL price");

  const coins: Coin[] = mints.map((mint) => {
    const c = sold.get(mint)!;
    const p = prices.get(mint);
    const soldUsd = c.sol * solUsd;
    const worthNow = p ? c.tokens * p.usd : 0;
    return {
      mint,
      symbol: p?.symbol ? `$${p.symbol}` : `${mint.slice(0, 4)}…`,
      soldSol: c.sol,
      soldUsd,
      worthNow,
      diff: worthNow - soldUsd,
      dead: !p,
    };
  });

  const regrets = coins.filter((c) => c.diff >= MIN_DIFF).sort((a, b) => b.diff - a.diff);
  const exits = coins.filter((c) => c.diff <= -MIN_DIFF).sort((a, b) => a.diff - b.diff);

  return {
    wallet,
    sells,
    coins: coins.length,
    solUsd,
    leftOnTable: regrets.reduce((n, c) => n + c.diff, 0),
    dodged: exits.reduce((n, c) => n - c.diff, 0),
    regrets: regrets.slice(0, 5),
    bestExit: exits[0] ?? null,
    updatedAt: Date.now(),
  };
}

// one calculation per wallet every 10 minutes, the page and the share card reuse it
export const getPaperHands = (wallet: string) =>
  unstable_cache(() => compute(wallet), ["paper-hands", wallet], { revalidate: 600 })();

export function usd(n: number): string {
  const a = Math.abs(n);
  const s = a >= 1e6 ? `${(a / 1e6).toFixed(2)}M` : a >= 1e4 ? `${(a / 1e3).toFixed(1)}k` : a.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return `${n < 0 ? "-" : ""}$${s}`;
}

// nothing worth sharing on the table? then the story is how much selling saved you
export function isSaver(r: Result): boolean {
  return r.leftOnTable < 50 && r.dodged > r.leftOnTable;
}

export function verdict(left: number, saved = 0): string {
  if (saved > 0) {
    if (saved >= 10_000) return "certified exit god";
    if (saved >= 1_000) return "sniper exits";
    return "sold before the rug";
  }
  if (left >= 100_000) return "generational paper hands";
  if (left >= 10_000) return "paper hands hall of fame";
  if (left >= 1_000) return "certified paper hands";
  if (left >= 100) return "slightly crumpled";
  return "diamond hands (or just lucky)";
}
