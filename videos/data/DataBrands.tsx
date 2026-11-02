// Test : statistiques animées avec des logos de marques (style n° 1 « plat »).
// Données FICTIVES (sauf les années de création de la frise), pour montrer les animations possibles.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as SI from 'simple-icons';
import {CL, FONT, K, T} from '../flat/flat';
import {CONTINENTS} from '../flat/FlatHook';

type Icon = {hex: string; path: string};
const B: Record<string, Icon> = {
  apple: SI.siApple, netflix: SI.siNetflix, spotify: SI.siSpotify, youtube: SI.siYoutube, nike: SI.siNike,
  cocacola: SI.siCocacola, mcdonalds: SI.siMcdonalds, tesla: SI.siTesla, playstation: SI.siPlaystation,
  nintendo: SI.siNintendo, starbucks: SI.siStarbucks, ferrari: SI.siFerrari, samsung: SI.siSamsung,
  google: SI.siGoogle, amazon: SI.siAmazon, airbnb: SI.siAirbnb,
};
const NAME: Record<string, string> = {
  apple: 'APPLE', netflix: 'NETFLIX', spotify: 'SPOTIFY', youtube: 'YOUTUBE', nike: 'NIKE', cocacola: 'COCA-COLA',
  mcdonalds: "McDONALD'S", tesla: 'TESLA', playstation: 'PLAYSTATION', nintendo: 'NINTENDO', starbucks: 'STARBUCKS',
  ferrari: 'FERRARI', samsung: 'SAMSUNG', google: 'GOOGLE', amazon: 'AMAZON', airbnb: 'AIRBNB',
};
const col = (b: string) => (['apple', 'nike'].includes(b) ? '#e8e4dc' : `#${B[b].hex}`);

const BG = '#101b30';
const PANEL = '#1a2944';
const GRID = '#2a3a58';
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Pastille blanche avec le logo (lisible sur fond sombre)
const Badge: React.FC<{b: string; x: number; y: number; r: number; scale?: number}> = ({b, x, y, r, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle r={r} fill="#fbf7ee" />
    <svg x={-r * 0.62} y={-r * 0.62} width={r * 1.24} height={r * 1.24} viewBox="0 0 24 24">
      <path d={B[b].path} fill={`#${B[b].hex}`} />
    </svg>
  </g>
);

// En-tête de scène : étiquette de chapitre + titre en majuscules
const Head: React.FC<{n: string; title: string; accent: string; note?: string}> = ({n, title, accent, note = 'ILLUSTRATIVE DATA'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 16}});
  return (
    <>
      <div style={{position: 'absolute', left: 80, top: 60, transform: `translateX(${(1 - s) * -60}px)`, opacity: s}}>
        <div style={{display: 'inline-block', fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: BG, background: K.accent, padding: '6px 14px', borderRadius: 6}}>{n}</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 58, color: K.white, marginTop: 12, letterSpacing: 1}}>
          {title} <span style={{color: K.accent2}}>{accent}</span>
        </div>
      </div>
      <div style={{position: 'absolute', right: 60, bottom: 40, fontFamily: FONT, fontWeight: 600, fontSize: 18, letterSpacing: 3, color: K.dim, opacity: 0.8}}>{note}</div>
    </>
  );
};

const Fade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10, dur - 10, dur], [0, 1, 1, 0], CL);
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>{children}</svg>
);

// ---------------------------------------------------------------------------
// 0. Ouverture
// ---------------------------------------------------------------------------
const S0: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const list = Object.keys(B);
  return (
    <Fade dur={T(3)}>
      <Svg>
        {list.map((b, i) => {
          const a = (i / list.length) * Math.PI * 2 + f * 0.01;
          const s = spring({frame: f - i * 2, fps, config: {damping: 10}});
          return <Badge key={b} b={b} x={960 + Math.cos(a) * 640} y={540 + Math.sin(a) * 330} r={52} scale={s} />;
        })}
      </Svg>
      <div style={{position: 'absolute', top: 430, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 96, color: K.white,
        transform: `scale(${spring({frame: f - 8, fps, config: {damping: 12}})})`, lineHeight: 1.05}}>
        BRANDS <span style={{color: K.accent2}}>BY THE</span><br />NUMBERS
      </div>
    </Fade>
  );
};

// ---------------------------------------------------------------------------
// 1. Compteur + anneau
// ---------------------------------------------------------------------------
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(f, [15, T(3.6)], [0, 1], {...CL, easing: Easing.out(Easing.cubic)});
  const C = 2 * Math.PI * 190;
  return (
    <Fade dur={T(5)}>
      <Head n="01 · COUNTER" title="ONE NUMBER," accent="BIG IMPACT" />
      <Svg>
        <circle cx={560} cy={590} r={190} fill="none" stroke={GRID} strokeWidth={26} />
        <circle cx={560} cy={590} r={190} fill="none" stroke={col('netflix')} strokeWidth={26} strokeLinecap="round"
          strokeDasharray={`${C * p * 0.82} ${C}`} transform="rotate(-90 560 590)" />
        <Badge b="netflix" x={560} y={590} r={130} scale={spring({frame: f, fps, config: {damping: 11}})} />
      </Svg>
      <div style={{position: 'absolute', left: 860, top: 440, fontFamily: FONT}}>
        <div style={{fontWeight: 900, fontSize: 150, color: K.white, fontVariantNumeric: 'tabular-nums', letterSpacing: -2}}>{fmt(p * 280_000_000)}</div>
        <div style={{fontWeight: 800, fontSize: 40, letterSpacing: 6, color: K.accent2, opacity: interpolate(f, [T(1.5), T(2)], [0, 1], CL)}}>SUBSCRIBERS WORLDWIDE</div>
      </div>
    </Fade>
  );
};

// ---------------------------------------------------------------------------
// 2. Barres verticales
// ---------------------------------------------------------------------------
const BARS: [string, number][] = [['apple', 390], ['samsung', 230], ['tesla', 97], ['nike', 51], ['netflix', 34], ['spotify', 15]];
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const base = 930;
  const maxH = 560;
  return (
    <Fade dur={T(6)}>
      <Head n="02 · BAR CHART" title="REVENUE" accent="($ BILLIONS)" />
      <Svg>
        {[0, 100, 200, 300, 400].map((v) => (
          <g key={v}>
            <line x1={260} x2={1700} y1={base - (v / 400) * maxH} y2={base - (v / 400) * maxH} stroke={GRID} strokeWidth={2} />
            <text x={240} y={base - (v / 400) * maxH + 8} textAnchor="end" fontFamily={FONT} fontWeight={600} fontSize={22} fill={K.dim}>{v}</text>
          </g>
        ))}
        {BARS.map(([b, v], i) => {
          const g = spring({frame: f - 12 - i * 7, fps, config: {damping: 15, mass: 1.2}});
          const h = (v / 400) * maxH * g;
          const x = 340 + i * 225;
          return (
            <g key={b}>
              <rect x={x} y={base - h} width={150} height={h} rx={10} fill={col(b)} />
              <Badge b={b} x={x + 75} y={base - h - 62} r={44} scale={Math.min(1, g * 1.5)} />
              <text x={x + 75} y={base - h - 122} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={K.white} opacity={g}>{fmt(v * g)}</text>
            </g>
          );
        })}
        <line x1={260} x2={1700} y1={base} y2={base} stroke={K.white} strokeWidth={4} />
      </Svg>
    </Fade>
  );
};

// ---------------------------------------------------------------------------
// 3. Courbes qui se tracent
// ---------------------------------------------------------------------------
const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const LINES: [string, number[]][] = [
  ['netflix', [70, 89, 110, 139, 167, 204, 222, 231, 260, 290, 310]],
  ['spotify', [28, 48, 71, 96, 124, 155, 180, 205, 236, 263, 280]],
];
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [15, T(4.6)], [0, YEARS.length - 1], {...CL, easing: Easing.inOut(Easing.quad)});
  const X = (i: number) => 300 + i * 130;
  const Y = (v: number) => 930 - (v / 320) * 600;
  return (
    <Fade dur={T(6)}>
      <Head n="03 · LINE CHART" title="SUBSCRIBERS" accent="(MILLIONS)" />
      <Svg>
        {YEARS.map((y, i) => (
          <text key={y} x={X(i)} y={980} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={22} fill={i <= p ? K.white : K.dim}>{y}</text>
        ))}
        {[0, 100, 200, 300].map((v) => <line key={v} x1={280} x2={1640} y1={Y(v)} y2={Y(v)} stroke={GRID} strokeWidth={2} />)}
        {LINES.map(([b, vals]) => {
          const n = Math.floor(p);
          const pts = vals.slice(0, n + 1).map((v, i) => [X(i), Y(v)]);
          const fr = p - n;
          const tip = n < vals.length - 1 ? [X(n + fr), Y(vals[n] + (vals[n + 1] - vals[n]) * fr)] : pts[pts.length - 1];
          if (n < vals.length - 1) pts.push(tip);
          const d = 'M' + pts.map((q) => q.join(',')).join(' L');
          return (
            <g key={b}>
              <path d={`${d} L${tip[0]},930 L${X(0)},930 Z`} fill={col(b)} opacity={0.14} />
              <path d={d} fill="none" stroke={col(b)} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
              <Badge b={b} x={tip[0]} y={tip[1]} r={40} />
              <text x={tip[0] + 56} y={tip[1] + 12} fontFamily={FONT} fontWeight={900} fontSize={34} fill={K.white}>
                {fmt(vals[Math.min(n, vals.length - 1)] + (n < vals.length - 1 ? (vals[n + 1] - vals[n]) * fr : 0))}M
              </text>
            </g>
          );
        })}
      </Svg>
    </Fade>
  );
};

// ---------------------------------------------------------------------------
// 4. Anneau (parts de marché)
// ---------------------------------------------------------------------------
const SHARE: [string, number][] = [['spotify', 31], ['apple', 15], ['amazon', 13], ['youtube', 9], ['', 32]];
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(f, [12, T(3)], [0, 100], {...CL, easing: Easing.inOut(Easing.cubic)});
  let start = 0;
  return (
    <Fade dur={T(5.5)}>
      <Head n="04 · DONUT CHART" title="MUSIC STREAMING" accent="MARKET SHARE" />
      <Svg>
        <g transform="translate(640 600) rotate(-90)">
          {SHARE.map(([b, v], i) => {
            const vis = Math.max(0, Math.min(v, p - start));
            const el = (
              <circle key={i} r={250} fill="none" stroke={b ? col(b) : '#3b4a66'} strokeWidth={110} pathLength={100}
                strokeDasharray={`${Math.max(0, vis - 0.4)} ${100}`} strokeDashoffset={-start} />
            );
            start += v;
            return el;
          })}
        </g>
        <text x={640} y={590} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={K.white}>{fmt(p * 6.2)}M</text>
        <text x={640} y={640} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={24} letterSpacing={4} fill={K.dim}>LISTENERS</text>
        {SHARE.map(([b, v], i) => {
          const s = spring({frame: f - 20 - i * 8, fps, config: {damping: 14}});
          const y = 330 + i * 130;
          return (
            <g key={i} opacity={s} transform={`translate(${(1 - s) * 80} 0)`}>
              {b ? <Badge b={b} x={1130} y={y} r={46} /> : <circle cx={1130} cy={y} r={46} fill="#3b4a66" />}
              <text x={1200} y={y + 14} fontFamily={FONT} fontWeight={800} fontSize={40} fill={K.white}>{b ? NAME[b] : 'OTHERS'}</text>
              <text x={1640} y={y + 16} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={52} fill={b ? col(b) : K.dim}>{v}%</text>
            </g>
          );
        })}
      </Svg>
    </Fade>
  );
};

// ---------------------------------------------------------------------------
// 5. Course de barres (classement qui bouge dans le temps)
// ---------------------------------------------------------------------------
const RACE: [string, number, number, number][] = [
  // marque, valeur 2015, valeur 2025, courbure
  ['apple', 150, 520, 1], ['google', 120, 410, 1.1], ['amazon', 40, 340, 0.8], ['samsung', 45, 100, 1],
  ['cocacola', 85, 62, 1], ['mcdonalds', 42, 55, 1], ['nike', 22, 58, 1], ['tesla', 3, 130, 2.6],
  ['netflix', 6, 64, 1.5], ['youtube', 12, 80, 1.2], ['playstation', 18, 40, 1],
];
const valAt = (r: (typeof RACE)[number], y: number) => {
  const t = Math.max(0, Math.min(1, (y - 2015) / 10));
  return r[1] + (r[2] - r[1]) * Math.pow(t, r[3]) + Math.sin(y * 2.1 + r[1]) * r[2] * 0.02 * t;
};
const yearAt = (f: number) => interpolate(f, [20, T(9)], [2015, 2025], CL);
const ranksAt = (f: number) => {
  const y = yearAt(f);
  const s = RACE.map((r) => ({b: r[0], v: valAt(r, y)})).sort((a, c) => c.v - a.v);
  const m: Record<string, number> = {};
  s.forEach((e, i) => (m[e.b] = i));
  return m;
};
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const y = yearAt(f);
  const max = Math.max(...RACE.map((r) => valAt(r, y)));
  // rang lissé : moyenne des rangs sur les 8 dernières images
  const smooth: Record<string, number> = {};
  for (let k = 0; k < 8; k++) {
    const m = ranksAt(f - k);
    for (const b in m) smooth[b] = (smooth[b] ?? 0) + m[b] / 8;
  }
  return (
    <Fade dur={T(10.5)}>
      <Head n="05 · BAR CHART RACE" title="MOST VALUABLE" accent="BRANDS ($B)" />
      <Svg>
        {RACE.map((r) => {
          const rank = smooth[r[0]];
          if (rank > 8.5) return null;
          const v = valAt(r, y);
          const yy = 250 + rank * 88;
          const w = (v / max) * 1180;
          return (
            <g key={r[0]} opacity={interpolate(rank, [7.5, 8.5], [1, 0], CL)}>
              <rect x={330} y={yy} width={w} height={70} rx={8} fill={col(r[0])} />
              <text x={310} y={yy + 47} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={28} fill={K.white}>{NAME[r[0]]}</text>
              <Badge b={r[0]} x={330 + w + 40} y={yy + 35} r={33} />
              <text x={330 + w + 90} y={yy + 47} fontFamily={FONT} fontWeight={900} fontSize={32} fill={K.white}>{fmt(v)}</text>
            </g>
          );
        })}
      </Svg>
      <div style={{position: 'absolute', right: 90, bottom: 90, fontFamily: FONT, fontWeight: 900, fontSize: 200, color: K.white, opacity: 0.18}}>{Math.floor(y)}</div>
    </Fade>
  );
};

// ---------------------------------------------------------------------------
// 6. Comparaison en icônes (1 sur 4)
// ---------------------------------------------------------------------------
const PersonIcon: React.FC<{x: number; y: number; c: string; s: number}> = ({x, y, c, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cy={-22} r={11} fill={c} />
    <path d="M-17 18 L-17 0 Q-17 -9 -8 -9 L8 -9 Q17 -9 17 0 L17 18 Z" fill={c} />
  </g>
);
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lit = Math.floor(interpolate(f, [T(1.2), T(3)], [0, 25], CL));
  return (
    <Fade dur={T(5)}>
      <Head n="06 · ICON COMPARISON" title="1 IN 4 PEOPLE" accent="USE IT DAILY" />
      <Svg>
        {Array.from({length: 100}).map((_, i) => {
          const s = spring({frame: f - (i % 20) - Math.floor(i / 20) * 2, fps, config: {damping: 14}});
          const on = i < lit;
          return <PersonIcon key={i} x={300 + (i % 20) * 62} y={420 + Math.floor(i / 20) * 105} c={on ? col('spotify') : '#3b4a66'} s={s * (on ? 1.12 : 1)} />;
        })}
        <Badge b="spotify" x={1660} y={630} r={90} scale={spring({frame: f - 10, fps, config: {damping: 10}})} />
      </Svg>
      <div style={{position: 'absolute', left: 300, top: 930, fontFamily: FONT, fontWeight: 900, fontSize: 56, color: col('spotify')}}>
        {lit}<span style={{color: K.white}}> / 100</span>
      </div>
    </Fade>
  );
};

// ---------------------------------------------------------------------------
// 7. Jauge
// ---------------------------------------------------------------------------
const arc = (r: number, a0: number, a1: number) => {
  const p = (a: number) => [960 + r * Math.cos(a), 760 + r * Math.sin(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`;
};
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const target = 87;
  const s = spring({frame: f - 15, fps, config: {damping: 7, mass: 1.4}});
  const v = target * s + (s > 0.95 ? Math.sin(f * 1.7) * 0.8 : 0);
  const ang = Math.PI + (v / 100) * Math.PI;
  const zones: [number, number, string][] = [[0, 40, '#2a9d8f'], [40, 70, '#ffd166'], [70, 100, '#e5484d']];
  return (
    <Fade dur={T(5)}>
      <Head n="07 · GAUGE" title="HYPE" accent="METER" />
      <Svg>
        {zones.map(([a, b, c]) => (
          <path key={a} d={arc(420, Math.PI + (a / 100) * Math.PI + 0.01, Math.PI + (b / 100) * Math.PI - 0.01)} fill="none" stroke={c} strokeWidth={70} />
        ))}
        {Array.from({length: 11}).map((_, i) => {
          const a = Math.PI + (i / 10) * Math.PI;
          return <line key={i} x1={960 + 340 * Math.cos(a)} y1={760 + 340 * Math.sin(a)} x2={960 + 365 * Math.cos(a)} y2={760 + 365 * Math.sin(a)} stroke={K.dim} strokeWidth={4} />;
        })}
        <line x1={960} y1={760} x2={960 + 330 * Math.cos(ang)} y2={760 + 330 * Math.sin(ang)} stroke={K.white} strokeWidth={14} strokeLinecap="round" />
        <Badge b="tesla" x={960} y={760} r={78} />
        <text x={960} y={960} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={90} fill={K.white}>
          {Math.round(v)}<tspan fill={K.dim} fontSize={44}> / 100</tspan>
        </text>
      </Svg>
    </Fade>
  );
};

// ---------------------------------------------------------------------------
// 8. Carte du monde avec des bulles
// ---------------------------------------------------------------------------
const MW = 1500, MH = 750, MX = 210, MY = 250;
const proj = (lon: number, lat: number) => [MX + ((lon + 180) / 360) * MW, MY + ((90 - lat) / 180) * MH];
const shape = (pts: number[][]) => 'M' + pts.map(([lo, la]) => proj(lo, la).map((v) => v.toFixed(0)).join(',')).join(' L') + ' Z';
const STORES: [string, number, number, number][] = [
  ['NORTH AMERICA', -98, 40, 18000], ['CHINA', 105, 34, 7000], ['EUROPE', 10, 50, 3500], ['JAPAN', 139, 37, 1900], ['LATIN AMERICA', -60, -12, 1300],
];
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <Fade dur={T(6)}>
      <Head n="08 · DATA MAP" title="STORES" accent="AROUND THE WORLD" />
      <Svg>
        <rect x={MX} y={MY - 40} width={MW} height={MH - 60} rx={24} fill="#18485a" />
        {CONTINENTS.map((c, i) => <path key={i} d={shape(c as number[][])} fill="#d9c9a3" />)}
        {STORES.map(([n, lon, lat, v], i) => {
          const [x, y] = proj(lon, lat);
          const s = spring({frame: f - 15 - i * 10, fps, config: {damping: 9}});
          const r = Math.sqrt(v) * 0.85 * s;
          return (
            <g key={n}>
              <circle cx={x} cy={y} r={r} fill={col('starbucks')} opacity={0.85} stroke="#fbf7ee" strokeWidth={4} />
              <text x={x} y={y + 12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.max(22, r * 0.38)} fill="#fff" opacity={s}>{fmt(v * s)}</text>
              <text x={x} y={y + r + 30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} letterSpacing={2} fill="#fbf7ee" opacity={s}>{n}</text>
            </g>
          );
        })}
        <Badge b="starbucks" x={1760} y={150} r={70} scale={spring({frame: f, fps, config: {damping: 11}})} />
      </Svg>
    </Fade>
  );
};

// ---------------------------------------------------------------------------
// 9. Frise chronologique (vraies années de création)
// ---------------------------------------------------------------------------
const TL: [string, number][] = [
  ['cocacola', 1886], ['nintendo', 1889], ['samsung', 1938], ['mcdonalds', 1940], ['nike', 1964], ['starbucks', 1971], ['apple', 1976],
  ['amazon', 1994], ['playstation', 1994], ['netflix', 1997], ['google', 1998], ['tesla', 2003], ['youtube', 2005], ['spotify', 2006],
];
const S9: React.FC = () => {
  const f = useCurrentFrame();
  const GAP = 320;
  const total = (TL.length - 1) * GAP;
  const pan = interpolate(f, [20, T(7.2)], [0, total - 1150], {...CL, easing: Easing.inOut(Easing.cubic)});
  const head = 360 + pan + 1150 + interpolate(f, [0, 20], [-1150, 0], CL);
  return (
    <Fade dur={T(8)}>
      <Svg>
        <g transform={`translate(${-pan} 0)`}>
          <line x1={200} x2={360 + total + 200} y1={600} y2={600} stroke={GRID} strokeWidth={6} strokeDasharray="4 18" strokeLinecap="round" />
          <line x1={200} x2={Math.min(head, 360 + total + 200)} y1={600} y2={600} stroke={K.white} strokeWidth={6} strokeLinecap="round" />
          {TL.map(([b, y], i) => {
            const x = 360 + i * GAP;
            const up = i % 2 === 0;
            const sv = interpolate(head - x, [0, 140], [0, 1], {...CL, easing: Easing.out(Easing.back(2))});
            return (
              <g key={b} opacity={Math.min(1, sv * 2)}>
                <circle cx={x} cy={600} r={16 * sv} fill={K.accent} />
                <line x1={x} x2={x} y1={600} y2={up ? 600 - 120 * sv : 600 + 120 * sv} stroke={K.dim} strokeWidth={3} />
                <Badge b={b} x={x} y={up ? 420 : 780} r={62} scale={sv} />
                <text x={x} y={up ? 310 : 900} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={K.accent2} opacity={sv}>{y}</text>
              </g>
            );
          })}
        </g>
      </Svg>
      <Head n="09 · TIMELINE" title="WHEN THEY" accent="WERE FOUNDED" note="FOUNDING YEARS (REAL DATA)" />
    </Fade>
  );
};

// ---------------------------------------------------------------------------
const SCENES: [React.FC, number][] = [[S0, T(3)], [S1, T(5)], [S2, T(6)], [S3, T(6)], [S4, T(5.5)], [S5, T(10.5)], [S6, T(5)], [S7, T(5)], [S8, T(6)], [S9, T(8)]];
export const DATA_FRAMES = SCENES.reduce((a, [, d]) => a + d, 0);

export const DataBrands: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, ${PANEL} 0%, ${BG} 70%)`}}>
      <Audio src={staticFile('data/bed.wav')} volume={0.6} />
      {SCENES.map(([C, d], i) => {
        const from = at;
        at += d;
        return (
          <React.Fragment key={i}>
            <Sequence from={from} durationInFrames={d}><C /></Sequence>
            <Sequence from={Math.max(0, from - 6)} durationInFrames={20}><Audio src={staticFile('data/whoosh.wav')} volume={0.35} /></Sequence>
            <Sequence from={from + 12} durationInFrames={10}><Audio src={staticFile('data/pop.wav')} volume={0.5} /></Sequence>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
