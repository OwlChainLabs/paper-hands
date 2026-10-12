import { ImageResponse } from "next/og";
import { getPaperHands, usd, verdict } from "@/lib/paperhands";
import { isValidWallet, shortAddr } from "@/lib/validate";

export const maxDuration = 60;

type Ctx = { params: Promise<{ wallet: string }> };

// 1200x630 share card shown when a result link is posted on X.
export async function GET(_req: Request, { params }: Ctx) {
  const { wallet } = await params;
  if (!isValidWallet(wallet)) return new Response("bad wallet", { status: 400 });

  let left = 0;
  let top = "";
  try {
    const r = await getPaperHands(wallet);
    left = r.leftOnTable;
    top = r.regrets[0] ? `biggest regret: ${r.regrets[0].symbol}, worth ${usd(r.regrets[0].worthNow)} today` : "";
  } catch {
    // fall back to a generic card
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 64, color: "#f2f2f5",
          background: "linear-gradient(135deg, #070a16, #1d1450)",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#9aa0b8" }}>{`paper hands calculator · ${shortAddr(wallet)}`}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, color: "#9aa0b8" }}>i left on the table</div>
          <div style={{ fontSize: 150, fontWeight: 800, color: "#14f195", lineHeight: 1.05 }}>{usd(left)}</div>
          <div style={{ fontSize: 30, color: "#c9cce0", marginTop: 8 }}>{top}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: "#9945ff", border: "3px solid #9945ff", padding: "8px 16px", borderRadius: 10 }}>
            {verdict(left).toUpperCase()}
          </div>
          <div style={{ fontSize: 26, color: "#9aa0b8" }}>@OwlChainLabs</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "cache-control": "public, max-age=3600" } }
  );
}
