// Current token prices from DexScreener (free, no key needed).
// For every mint we take the pair with the most liquidity, so a dead side pool
// does not set the price.

export const SOL_MINT = "So11111111111111111111111111111111111111112";

export type TokenPrice = { usd: number; symbol: string; name: string };

type Pair = {
  baseToken: { address: string; symbol: string; name: string };
  priceUsd?: string;
  liquidity?: { usd?: number };
};

const BATCH = 30; // dexscreener limit per call

export async function fetchPrices(mints: string[]): Promise<Map<string, TokenPrice>> {
  const out = new Map<string, TokenPrice>();
  const best = new Map<string, number>(); // mint -> liquidity of the chosen pair
  const batches: string[][] = [];
  for (let i = 0; i < mints.length; i += BATCH) batches.push(mints.slice(i, i + BATCH));

  await Promise.all(
    batches.map(async (batch) => {
      const res = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${batch.join(",")}`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8_000),
      }).catch(() => null);
      if (!res || !res.ok) return;
      const pairs: Pair[] = await res.json().catch(() => []);
      for (const p of Array.isArray(pairs) ? pairs : []) {
        const mint = p.baseToken?.address;
        const usd = Number(p.priceUsd);
        if (!mint || !Number.isFinite(usd)) continue;
        const liq = p.liquidity?.usd ?? 0;
        if (best.has(mint) && (best.get(mint) ?? 0) >= liq) continue;
        best.set(mint, liq);
        out.set(mint, { usd, symbol: p.baseToken.symbol, name: p.baseToken.name });
      }
    })
  );
  return out;
}
