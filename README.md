# paper hands calculator

paste any solana wallet and see what the coins you sold would be worth today.

**live:** https://paperhands.owlchainlabs.xyz

- reads only public on-chain data. no wallet connect, no signing, no private keys. ever.
- sells come from the wallet's own transactions (helius `getTransactionsForAddress`)
- today's prices from dexscreener, coins without a market count as dead
- both sides are valued at today's prices: the sold tokens vs. the SOL you got for them

## run it

```bash
cp .env.example .env.local   # add your helius key
npm install
npm run dev
```

built in public by [@OwlChainLabs](https://x.com/OwlChainLabs). more tools at [owlchainlabs.xyz](https://owlchainlabs.xyz).
