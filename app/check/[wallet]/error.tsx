"use client";

export default function CheckError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main>
      <h1>paper hands calculator</h1>
      <div className="bar" />
      <p className="error">this wallet took too long or something broke. very active wallets are hard to read.</p>
      <div className="actions">
        <button onClick={() => reset()}>try again</button>
        <a className="btn ghost" href="/">check another</a>
      </div>
    </main>
  );
}
