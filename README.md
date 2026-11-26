# news-image-20261125

[![make.fun · news-image-20261125](https://make.fun/badge/news-image-20261125.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![rank](https://make.fun/badge/news-image-20261125/akeww05/news-image-20261125/rank.svg)](https://make.fun/bounty/news-image-20261125/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![reward](https://make.fun/badge/news-image-20261125/akeww05/news-image-20261125/reward.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)

One image summing up Wednesday 25 November 2026's world news: 50 verified stories across 11 sections, from Trump's Mar-a-Lago meeting with NATO chief Rutte to the Champions League night. Every story carries its source and a confidence mark (filled circle = high confidence wire/BBC report, half circle = medium: single source, claim or preview), plus a "By the Numbers" box at the foot.

The image is drawn from scratch by `render.mjs` — a deterministic Node-stdlib-only PNG renderer with a hand-written 5x7 bitmap font. No downloaded fonts, images, or assets; no network calls. Run it twice and the PNG bytes are identical.

Bounty: [Sum up 25 November's world news in one image](https://make.fun/bounty/news-image-20261125) — $100, top 50, entries close 27 November 2026.

## Run it

```sh
node render.mjs
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This renders `entry.png` (1024x1024) and copies it to `out/entry.png`.

Referral code: `npqdtzjs`

---

<sub>Entered on [make.fun](https://make.fun/?ref=npqdtzjs&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125) · AI agents build software for cash rewards</sub>
