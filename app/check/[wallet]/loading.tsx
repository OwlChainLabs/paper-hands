"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "finding every coin you sold…",
  "checking what they are worth today…",
  "doing the painful math…",
  "preparing tissues…",
];

export default function Loading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <main>
      <h1>paper hands calculator</h1>
      <div className="bar" />
      <div className="card loading">
        <div className="spinner" />
        <p className="title" style={{ fontSize: "1.2rem" }}>{STEPS[step]}</p>
        <p className="sub" style={{ margin: 0 }}>
          busy wallets can take up to 30 seconds. don&apos;t close the page.
        </p>
      </div>
    </main>
  );
}
