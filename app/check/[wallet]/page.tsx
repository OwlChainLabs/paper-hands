import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { getPaperHands, isSaver, usd, verdict } from "@/lib/paperhands";
import { isValidWallet, shortAddr, shortHash } from "@/lib/validate";

export const maxDuration = 60;

type Props = { params: Promise<{ wallet: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { wallet } = await params;
  const title = `paper hands · ${shortAddr(wallet)}`;
  let v = "0";
  try {
    v = shortHash(String(Math.round((await getPaperHands(wallet)).leftOnTable)));
  } catch {}
  const image = `/api/og/${wallet}?v=${v}`;
  return {
    title,
    openGraph: { title, images: [image] },
    twitter: { card: "summary_large_image", title, images: [image] },
  };
}

export default async function CheckPage({ params }: Props) {
  const { wallet } = await params;
  if (!isValidWallet(wallet)) notFound();

  let r;
  try {
    r = await getPaperHands(wallet);
  } catch (err) {
    console.error("paper hands failed", wallet, err);
    return (
      <main>
        <h1>paper hands calculator</h1>
        <p className="error">something broke while reading this wallet. try again in a minute.</p>
        <a className="btn ghost" href="/">back</a>
      </main>
    );
  }

  if (r.sells === 0) {
    return (
      <main>
        <h1>no sells found</h1>
        <p className="sub">this wallet never sold a coin for SOL. either diamond hands or it never traded.</p>
        <a className="btn" href="/">check another wallet</a>
      </main>
    );
  }

  const top = r.regrets[0];
  const saver = isSaver(r);
  const shareText = saver
    ? `selling saved me ${usd(r.dodged)}. everything i sold went lower 😎\n\ncheck yours 👉 ${SITE_URL.replace("https://", "")}\nby @OwlChainLabs\n\n`
    : top
    ? `i left ${usd(r.leftOnTable)} on the table by paper handing ${top.symbol} and friends 💀\n\ncheck yours 👉 ${SITE_URL.replace("https://", "")}\nby @OwlChainLabs\n\n`
    : `i never paper handed a winner. apparently i sell at the right time 😎\n\ncheck yours 👉 ${SITE_URL.replace("https://", "")}\nby @OwlChainLabs\n\n`;
  const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(`${SITE_URL}/check/${wallet}?r=${shortHash(String(Math.round(r.leftOnTable)))}`)}`;

  return (
    <main className="rp">
      <section className="rp-roast">
        <span className="addr">{shortAddr(wallet)}</span>
        <div className="ph-k">{saver ? "selling saved you" : "you left on the table"}</div>
        <div className="ph-big">{usd(saver ? r.dodged : r.leftOnTable)}</div>
        <div className="verdict ph-verdict">{saver ? verdict(0, r.dodged) : verdict(r.leftOnTable)}</div>

        {r.regrets.length > 0 && (
          <>
            <h2 className="ph-h">biggest regrets</h2>
            <ol className="ph-list">
              {r.regrets.map((c) => (
                <li key={c.mint}>
                  <span className="sym">{c.symbol}</span>
                  <span className="was">sold for {usd(c.soldUsd)}</span>
                  <span className="now">worth {usd(c.worthNow)} today</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>

      <aside className="rp-side">
        <div className="rp-grid">
          <div className="stat"><div className="k">coins sold</div><div className="v">{r.coins}</div></div>
          <div className="stat"><div className="k">sells</div><div className="v">{r.sells}</div></div>
          {saver ? (
            <div className="stat"><div className="k">left on the table</div><div className="v">{usd(r.leftOnTable)}</div></div>
          ) : (
            <div className="stat"><div className="k">saved by selling</div><div className="v pos">{usd(r.dodged)}</div></div>
          )}
          <div className="stat"><div className="k">biggest regret</div><div className="v neg">{top ? `${top.symbol} +${usd(top.diff)}` : "none"}</div></div>
          {r.bestExit && (
            <div className="stat" style={{ gridColumn: "1 / -1" }}>
              <div className="k">best exit</div>
              <div className="v pos">{`${r.bestExit.symbol} · saved ${usd(-r.bestExit.diff)}${r.bestExit.dead ? " (it died)" : ""}`}</div>
            </div>
          )}
        </div>

        <a className="share" href={shareUrl} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          {saver ? "share your exits" : "share the pain"}
        </a>
        <a className="again" href="/">check another wallet</a>
        <a className="again" href="https://roast.owlchainlabs.xyz">get this wallet roasted →</a>
      </aside>

      <p className="rp-foot">
        {`last ${r.sells} sells, top ${r.coins} coins · today's prices from dexscreener, sol at ${usd(r.solUsd)} · coins without a market count as dead · for fun, not financial advice · `}
        <a href="https://github.com/OwlChainLabs/paper-hands">open source</a>
      </p>
    </main>
  );
}
