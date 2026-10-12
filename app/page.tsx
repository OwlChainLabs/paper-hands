"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isValidWallet } from "@/lib/validate";

export default function Home() {
  const router = useRouter();
  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const w = wallet.trim();
    if (!isValidWallet(w)) {
      setError("that does not look like a solana address.");
      return;
    }
    setError("");
    setLoading(true);
    router.push(`/check/${w}`);
  }

  return (
    <main className="landing">
      <section className="hero">
        <span className="pill">OPEN SOURCE · SOLANA · NO LOGIN</span>
        <h1>
          how much did you
          <br />
          <span>leave on the table?</span>
        </h1>
        <p className="sub">
          paste any solana wallet. we check every coin you sold and what those exact tokens are worth today.
        </p>
        <form onSubmit={submit}>
          <label htmlFor="wallet" style={{ position: "absolute", left: -9999 }}>
            solana wallet address
          </label>
          <input
            id="wallet"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="paste a solana wallet address…"
            spellCheck={false}
            autoComplete="off"
          />
          <button type="submit" disabled={loading}>
            {loading ? "counting…" : "show me the pain"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="note">read only. no connect, no signing, no private keys. ever.</p>
      </section>

      <section className="how">
        <h2>how it works</h2>
        <div className="steps">
          <div>
            <i>01</i>
            <h3>we find your sells</h3>
            <p>every coin the wallet sold for SOL, read from public on-chain data.</p>
          </div>
          <div>
            <i>02</i>
            <h3>we check today&apos;s price</h3>
            <p>what the exact tokens you sold would be worth right now, compared to what you got.</p>
          </div>
          <div>
            <i>03</i>
            <h3>you share the pain</h3>
            <p>one number, your biggest regrets and your best exit. made for x.</p>
          </div>
        </div>
      </section>

      <p className="foot">
        <span>
          open source · <a href="https://github.com/OwlChainLabs/paper-hands">github</a> · more tools at{" "}
          <a href="https://owlchainlabs.xyz">owlchainlabs.xyz</a>
        </span>
        <span>for entertainment only. not financial advice.</span>
      </p>
    </main>
  );
}
