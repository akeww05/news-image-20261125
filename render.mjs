// render.mjs — deterministic 1024x1024 PNG renderer for news-image-20261125.
// Node stdlib only (node:fs + node:zlib). No network, no downloaded assets.
// Every glyph below is a hand-written 5x7 bitmap drawn by this file.
// Masthead: WEDNESDAY 25 NOVEMBER 2026 (25 Nov 2026 is a Wednesday).
// Slate: 50 stories across 11 sections, each with a source tag and a
// confidence mark (filled circle = high, half circle = medium). See README.
// Headlines are condensed to fit one line per story at scale 2; the lead
// story and the By the Numbers box carry the fuller detail.

import fs from "node:fs";
import zlib from "node:zlib";

const W = 1024;
const H = 1024;

// ---- palette ---------------------------------------------------------------
const PAPER = [247, 243, 232];
const INK = [20, 20, 20];
const NAVY = [22, 35, 63];
const NAVY_LIGHT = [38, 56, 92];
const RED = [178, 34, 34];
const GOLD = [176, 141, 60];
const GREY = [90, 90, 86];
const RULE = [200, 192, 172];
const WHITE = [255, 255, 255];
const LEAD_BG = [255, 255, 255];

// ---- canvas ----------------------------------------------------------------
const px = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  px[i * 3] = PAPER[0];
  px[i * 3 + 1] = PAPER[1];
  px[i * 3 + 2] = PAPER[2];
}
function setPix(x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}
function fillRect(x, y, w, h, c) {
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) setPix(i, j, c);
  }
}
function hline(x, y, w, c) {
  for (let i = x; i < x + w; i++) setPix(i, y, c);
}
function rectBorder(x, y, w, h, c, t = 1) {
  fillRect(x, y, w, t, c);
  fillRect(x, y + h - t, w, t, c);
  fillRect(x, y, t, h, c);
  fillRect(x + w - t, y, t, h, c);
}

// ---- hand-written 5x7 bitmap font -----------------------------------------
// Each glyph: 7 rows of 5 bits, "1" = ink. Written from scratch for this entry.
const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  a: ["00000", "01110", "00001", "01111", "10001", "01111", "00000"],
  b: ["10000", "10000", "10110", "11001", "10001", "10001", "11110"],
  c: ["00000", "01110", "10001", "10000", "10000", "10001", "01110"],
  d: ["00001", "00001", "01101", "10011", "10001", "10001", "01111"],
  e: ["00000", "01110", "10001", "11111", "10000", "10001", "01110"],
  f: ["00110", "01000", "01000", "11110", "01000", "01000", "01000"],
  g: ["00000", "01111", "10001", "10001", "01111", "00001", "01110"],
  h: ["10000", "10000", "10110", "11001", "10001", "10001", "10001"],
  i: ["00100", "00000", "01100", "00100", "00100", "00100", "01110"],
  j: ["00010", "00000", "00110", "00010", "00010", "10010", "01100"],
  k: ["10000", "10000", "10010", "10100", "11000", "10100", "10010"],
  l: ["01100", "00100", "00100", "00100", "00100", "00100", "01110"],
  m: ["00000", "11010", "10101", "10101", "10101", "10101", "10101"],
  n: ["00000", "10110", "11001", "10001", "10001", "10001", "10001"],
  o: ["00000", "01110", "10001", "10001", "10001", "10001", "01110"],
  p: ["00000", "11110", "10001", "10001", "11110", "10000", "10000"],
  q: ["00000", "01101", "10011", "10001", "01111", "00001", "00001"],
  r: ["00000", "10110", "11001", "10000", "10000", "10000", "10000"],
  s: ["00000", "01111", "10000", "01110", "00001", "00001", "11110"],
  t: ["01000", "01000", "11110", "01000", "01000", "01001", "00110"],
  u: ["00000", "10001", "10001", "10001", "10001", "10011", "01101"],
  v: ["00000", "10001", "10001", "10001", "10001", "01010", "00100"],
  w: ["00000", "10001", "10001", "10101", "10101", "10101", "01010"],
  x: ["00000", "10001", "10001", "01010", "00100", "01010", "10001"],
  y: ["00000", "10001", "10001", "10001", "01111", "00001", "01110"],
  z: ["00000", "11111", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  '"': ["01010", "01010", "01010", "00000", "00000", "00000", "00000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  $: ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "/": ["00001", "00001", "00010", "00100", "01000", "10000", "10000"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  "#": ["01010", "01010", "11111", "01010", "11111", "01010", "01010"],
  "*": ["00000", "00100", "10101", "01110", "10101", "00100", "00000"],
  "@": ["01110", "10001", "10111", "10101", "10110", "10000", "01110"],
  "[": ["01110", "01000", "01000", "01000", "01000", "01000", "01110"],
  "]": ["01110", "00010", "00010", "00010", "00010", "00010", "01110"],
  _: ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
  "~": ["00000", "00000", "01010", "10101", "00000", "00000", "00000"],
  "\u2022": ["00000", "00100", "01110", "01110", "01110", "00100", "00000"],
};

function drawChar(ch, x, y, scale, color) {
  const g = FONT[ch] || FONT["?"];
  for (let r = 0; r < 7; r++) {
    const row = g[r];
    for (let c = 0; c < 5; c++) {
      if (row[c] === "1") fillRect(x + c * scale, y + r * scale, scale, scale, color);
    }
  }
}
function textWidth(s, scale) {
  return s.length * (5 * scale + scale) - scale;
}
function drawText(s, x, y, scale, color, bold = false) {
  let cx = x;
  for (const ch of s) {
    drawChar(ch, cx, y, scale, color);
    if (bold) drawChar(ch, cx + 1, y, scale, color);
    cx += 5 * scale + scale;
  }
}
function drawTextCentered(s, cx, y, scale, color, bold = false) {
  drawText(s, cx - Math.floor(textWidth(s, scale) / 2), y, scale, color, bold);
}
function wrapText(s, maxWidth, scale) {
  const words = s.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (textWidth(test, scale) <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Confidence marks: filled disc = high, left-half disc = medium.
function drawConfidence(cx, cy, conf, color) {
  const r = 5;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const d2 = dx * dx + dy * dy;
      if (d2 > r * r) continue;
      if (conf === "high") {
        setPix(cx + dx, cy + dy, color);
      } else {
        // medium: filled left half, ring on the right half
        if (dx < 0) setPix(cx + dx, cy + dy, color);
        else if (d2 >= (r - 1) * (r - 1) && d2 <= r * r) setPix(cx + dx, cy + dy, color);
      }
    }
  }
}

// ---- slate: 50 stories, 11 sections (condensed headlines, faithful) --------
const SECTIONS = [
  {
    title: "UKRAINE WAR",
    stories: [
      { n: 2, t: "US freezes Russia deals", src: "PAGENEWS", conf: "medium" },
      { n: 3, t: "Russian grid strikes kill 5", src: "REUTERS", conf: "high" },
      { n: 4, t: "Putin: retaliation inevitable", src: "ALJAZ", conf: "high" },
      { n: 5, t: "Ukraine says 5 jets hit at base", src: "BBC", conf: "medium" },
      { n: 6, t: "War dead near 500,000: records", src: "BBC", conf: "high" },
      { n: 7, t: "MI5 warns UK firms of sabotage", src: "BBC", conf: "high" },
    ],
  },
  {
    title: "MIDDLE EAST",
    stories: [
      { n: 8, t: "Judges: drop Netanyahu charges", src: "BBC", conf: "high" },
      { n: 9, t: "Strike kills Hamas chief, family", src: "BBC", conf: "high" },
      { n: 10, t: "IS kills 2 Syrian security men", src: "REUTERS", conf: "high" },
      { n: 11, t: "Houthis say Saudi refinery hit", src: "REUTERS", conf: "high" },
      { n: 12, t: "Houthi drone hits Riyadh tower", src: "REUTERS", conf: "high" },
      { n: 13, t: "Houthis within 60km of Aden", src: "REUTERS", conf: "high" },
      { n: 14, t: "Landmine kills boy, 11, in Homs", src: "BBC", conf: "medium" },
      { n: 15, t: "Cairo tanker crash fire kills 31", src: "BBC", conf: "high" },
    ],
  },
  {
    title: "ASIA-PACIFIC & CHINA",
    stories: [
      { n: 16, t: "Xi probe hits Shanghai chief", src: "REUTERS", conf: "high" },
      { n: 17, t: "Pakistan's 1st astronaut in space", src: "AP", conf: "high" },
      { n: 18, t: "Huawei guilty of secrets theft", src: "AP", conf: "high" },
      { n: 19, t: "Huang firms tied to AI servers", src: "REUTERS", conf: "medium" },
      { n: 20, t: "N. Korea expels Swiss diplomat", src: "BBC", conf: "high" },
      { n: 21, t: "Australia, Solomons sign pact", src: "GUARDIAN", conf: "medium" },
    ],
  },
  {
    title: "EUROPE & AFRICA",
    stories: [
      { n: 22, t: "Spain votes; far right may govern", src: "BBC", conf: "medium" },
      { n: 23, t: "France faces presidential rout", src: "BBC", conf: "medium" },
      { n: 24, t: "UK consults on consent age", src: "BBC", conf: "medium" },
      { n: 25, t: "$227m meth lab: 5 Mexicans held", src: "BBC", conf: "high" },
    ],
  },
  {
    title: "THE AMERICAS",
    stories: [
      { n: 26, t: "76 hostages freed in Colombia", src: "BBC", conf: "high" },
      { n: 27, t: "Canada PM roasts Trump, lookalike", src: "AP", conf: "medium" },
      { n: 28, t: "Al Gore to own Tennessee newspaper", src: "AP", conf: "medium" },
    ],
  },
  {
    title: "UNITED STATES",
    stories: [
      { n: 29, t: "Abrego Garcia leaves US for Spain", src: "AP", conf: "high" },
      { n: 30, t: "Army bomb-chemical blast succeeds", src: "AP", conf: "high" },
      { n: 31, t: "Crash off Mississippi kills 6", src: "AP", conf: "high" },
      { n: 32, t: "King tides wreck Pacifica pier", src: "AP", conf: "medium" },
      { n: 33, t: "Judge blocks FCC review of ABC", src: "AP", conf: "medium" },
    ],
  },
  {
    title: "ECONOMY & MARKETS",
    stories: [
      { n: 34, t: "US tariff plan hits 14 nations", src: "REUTERS", conf: "high" },
      { n: 35, t: "US confidence near 2-year high", src: "AP", conf: "high" },
      { n: 36, t: "Q3 growth revised up to 4.3%", src: "REUTERS", conf: "high" },
      { n: 37, t: "Mortgage rate eases to 7.21%", src: "AP", conf: "high" },
      { n: 38, t: "Wall St recoups after AI sell-off", src: "AP", conf: "high" },
    ],
  },
  {
    title: "TECHNOLOGY & AI",
    stories: [
      { n: 39, t: "Anthropic below $83 IPO price", src: "REUTERS", conf: "high" },
      { n: 40, t: "Nvidia down 3.9% to $149.30", src: "REUTERS", conf: "high" },
      { n: 41, t: "Microsoft declares 'Code Red'", src: "REUTERS", conf: "high" },
      { n: 42, t: "Anthropic launches Claude Ship", src: "TECHMEME", conf: "medium" },
      { n: 43, t: "'Siren': agents rarely escape", src: "WIRED", conf: "medium" },
    ],
  },
  {
    title: "SCIENCE, HEALTH & SPACE",
    stories: [
      { n: 44, t: "US OKs SpaceX 1m-satellite plan", src: "BBC", conf: "high" },
      { n: 45, t: "NASA: stadium-sized aftermath", src: "BBC", conf: "medium" },
      { n: 46, t: "Baby welcomed from space station", src: "BBC", conf: "medium" },
      { n: 47, t: "25 polio cases in Afghanistan", src: "WHO", conf: "medium" },
    ],
  },
  {
    title: "CULTURE & SPORT",
    stories: [
      { n: 48, t: "Jolie, Pitt settle winery battle", src: "BBC", conf: "high" },
      { n: 49, t: "Duran Duran's Taylor dies, 65", src: "BBC", conf: "high" },
      { n: 50, t: "PSG held; Barca, Liverpool win", src: "UEFA", conf: "high" },
    ],
  },
];

const LEAD = {
  n: 1,
  headline: "Trump hosts NATO chief Rutte at Mar-a-Lago",
  detail:
    "White House confirms Trump meets NATO chief Mark Rutte on Wednesday at Mar-a-Lago, Florida. Talks follow Trump's Asia meetings with Putin and Xi; Ukraine war, defence spending and tariffs on the agenda.",
  src: "REUTERS",
  conf: "high",
};

const BY_NUMBERS = [
  "~490,000 Russian war dead",
  "31 killed in Cairo tanker",
  "76 freed in Colombia siege",
  "4.3% US Q3 growth revised",
  "$2.3T off Nvidia peak",
  "1,000,000 SpaceX satellites",
  "44 Nvidia trades by Trump",
  "Huawei guilty on 10 of 12",
  "7.21% US 30-year mortgage",
];

// ---- layout ----------------------------------------------------------------
const M = 14; // margin
const GUT = 16; // gutter between columns
const COL_W = Math.floor((W - M * 2 - GUT) / 2); // 490
const COL_X = [M, M + COL_W + GUT];

// Masthead
fillRect(0, 0, W, 92, NAVY);
fillRect(0, 92, W, 3, GOLD);
drawTextCentered("WEDNESDAY 25 NOVEMBER 2026", W / 2, 16, 5, WHITE, true);
drawTextCentered("THE WORLD IN ONE PAGE  -  50 STORIES, 11 SECTIONS", W / 2, 58, 1, [200, 205, 220]);

// Lead box
const leadY = 104;
const leadH = 110;
fillRect(M, leadY, W - M * 2, leadH, LEAD_BG);
rectBorder(M, leadY, W - M * 2, leadH, NAVY, 2);
drawText("1  -  THE LEAD", M + 12, leadY + 8, 1, RED, true);
drawText(LEAD.headline, M + 12, leadY + 26, 3, NAVY, true);
const leadLines = wrapText(LEAD.detail, W - M * 2 - 24, 2);
drawText(leadLines[0] || "", M + 12, leadY + 54, 2, INK);
drawText(leadLines[1] || "", M + 12, leadY + 72, 2, INK);
drawText(leadLines[2] || "", M + 12, leadY + 90, 2, INK);
// lead source tag + confidence, right aligned on the label row
const leadTagX = W - M - 12 - textWidth(LEAD.src, 1) - 22;
drawText(LEAD.src, leadTagX, leadY + 8, 1, GREY);
drawConfidence(W - M - 12 - 6, leadY + 11, LEAD.conf, NAVY);

// Legend line
const legY = 224;
drawConfidence(M + 8, legY + 5, "high", NAVY);
drawText("HIGH = wire / BBC direct report", M + 20, legY, 1, GREY);
drawConfidence(M + 20 + textWidth("HIGH = wire / BBC direct report", 1) + 18, legY + 5, "medium", NAVY);
drawText(
  "MEDIUM = single source, claim or preview",
  M + 20 + textWidth("HIGH = wire / BBC direct report", 1) + 30,
  legY,
  1,
  GREY
);
hline(M, legY + 14, W - M * 2, RULE);

// Sections, two columns: left = sections 0..4, right = sections 5..9
function drawSectionColumn(sections, colX, startY) {
  let y = startY;
  for (const sec of sections) {
    fillRect(colX, y, COL_W, 20, NAVY_LIGHT);
    drawText(sec.title, colX + 8, y + 3, 2, WHITE, true);
    y += 24;
    for (const st of sec.stories) {
      const label = st.n + ". ";
      const tagW = textWidth(st.src, 1);
      const circleX = colX + COL_W - 7;
      const tagX = circleX - 12 - tagW;
      // headline, truncated with "..." if it would collide with the tag
      let head = label + st.t;
      while (textWidth(head, 2) > tagX - 4 - colX && head.length > 4) {
        head = head.slice(0, -4) + "...";
      }
      drawText(head, colX + 2, y, 2, INK);
      drawText(st.src, tagX, y + 3, 1, GREY);
      drawConfidence(circleX, y + 7, st.conf, NAVY);
      y += 17;
    }
    y += 6; // gap between sections
  }
  return y;
}
const secTop = 246;
drawSectionColumn(SECTIONS.slice(0, 5), COL_X[0], secTop);
drawSectionColumn(SECTIONS.slice(5), COL_X[1], secTop);

// By the Numbers box
const numY = 900;
const numH = 96;
fillRect(M, numY, W - M * 2, numH, LEAD_BG);
rectBorder(M, numY, W - M * 2, numH, NAVY, 2);
drawText("BY THE NUMBERS", M + 12, numY + 8, 2, RED, true);
const cellW = Math.floor((W - M * 2 - 24) / 3);
for (let i = 0; i < BY_NUMBERS.length; i++) {
  const cx = M + 12 + (i % 3) * cellW;
  const cy = numY + 32 + Math.floor(i / 3) * 20;
  fillRect(cx, cy + 3, 7, 7, GOLD); // square marker, not a font bullet
  drawText(BY_NUMBERS[i], cx + 12, cy, 2, INK);
}

// Footer
drawTextCentered(
  "Sources: Reuters, AP, BBC, Al Jazeera, Guardian, UEFA, Techmeme, Wired, WHO. Compiled 26 Nov 2026.",
  W / 2,
  1008,
  1,
  GREY
);

// ---- PNG encode (deterministic: no timestamps, fixed settings) -------------
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // colour type RGB
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;
const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0; // filter: none
  px.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
}
const idat = zlib.deflateSync(raw, { level: 9 });
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", idat),
  chunk("IEND", Buffer.alloc(0)),
]);
fs.writeFileSync("entry.png", png);
console.log("wrote entry.png", png.length, "bytes");
