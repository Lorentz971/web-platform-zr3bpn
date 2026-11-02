// Pack 1 : comparer et les chiffres (style n° 1). Données fictives.
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Badge, col, fmt, FONT, GRID, Head, K, MUTED, NAME, Pack1, PackTitle, rnd, Scene, Svg, T, total, Txt, useSp, CL} from './k1';

// 1. Barres groupées → empilées
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const br = ['youtube', 'tiktok', 'twitch'];
  const yrs = ['2022', '2023', '2024', '2025'];
  const v = [[40, 70, 10], [45, 85, 14], [48, 100, 18], [52, 115, 22]];
  const m = interpolate(f, [T(3), T(4)], [0, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  const base = 900, sc = interpolate(m, [0, 1], [4.4, 2.6]);
  return (
    <>
      <Head n="01 · GROUPED → STACKED BARS" title="HOURS WATCHED" accent={m > 0.5 ? '(STACKED)' : '(GROUPED)'} />
      <Svg>
        {yrs.map((y, i) => {
          const gx = 380 + i * 340;
          let acc = 0;
          return (
            <g key={y}>
              {br.map((b, j) => {
                const g = useSp(10 + i * 6 + j * 3, 15);
                const h = v[i][j] * sc * g;
                const x = interpolate(m, [0, 1], [gx + j * 80, gx + 80]);
                const y0 = base - interpolate(m, [0, 1], [0, acc]);
                acc += h;
                return <rect key={b} x={x} y={y0 - h} width={interpolate(m, [0, 1], [70, 110])} height={h} fill={col(b)} rx={4} />;
              })}
              <Txt x={gx + 135} y={950} a="middle" c={K.dim}>{y}</Txt>
            </g>
          );
        })}
        <line x1={320} x2={1700} y1={base} y2={base} stroke={K.white} strokeWidth={3} />
        {br.map((b, j) => (
          <g key={b}><Badge b={b} x={1100 + j * 220} y={210} r={26} /><rect x={1135 + j * 220} y={198} width={24} height={24} rx={4} fill={col(b)} /><Txt x={1170 + j * 220} y={219} s={22}>{NAME[b]}</Txt></g>
        ))}
      </Svg>
    </>
  );
};

// 2. Barres miroir
const S2: React.FC = () => {
  const rows: [string, number, number][] = [['apple', 62, 38], ['tesla', 48, 52], ['mcdonalds', 55, 45], ['tiktok', 41, 59], ['ikea', 78, 22], ['x', 30, 70]];
  return (
    <>
      <Head n="02 · MIRROR BARS" title="LOVE IT" accent="OR HATE IT?" />
      <Svg>
        <Txt x={760} y={240} a="end" c="#e5484d" s={30}>◀ HATE</Txt>
        <Txt x={1160} y={240} c="#2ec27e" s={30}>LOVE ▶</Txt>
        {rows.map(([b, love, hate], i) => {
          const g = useSp(8 + i * 4, 16);
          const y = 290 + i * 110;
          return (
            <g key={b}>
              <rect x={960 - 70 - hate * 8 * g} y={y} width={hate * 8 * g} height={70} rx={8} fill="#e5484d" />
              <rect x={960 + 70} y={y} width={love * 8 * g} height={70} rx={8} fill="#2ec27e" />
              <Badge b={b} x={960} y={y + 35} r={44} scale={g} />
              <Txt x={960 - 90 - hate * 8 * g} y={y + 47} a="end" s={30} o={g}>{Math.round(hate * g)}%</Txt>
              <Txt x={960 + 90 + love * 8 * g} y={y + 47} s={30} o={g}>{Math.round(love * g)}%</Txt>
            </g>
          );
        })}
      </Svg>
    </>
  );
};

// 3. Haltères (avant / après)
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const rows: [string, string, number, number][] = [['netflix', 'MONTHLY PLAN', 9.99, 17.99], ['spotify', 'PREMIUM', 9.99, 11.99], ['mcdonalds', 'BIG MEAL', 6.5, 10.9], ['starbucks', 'LATTE', 3.6, 5.4], ['playstation', 'NEW CONSOLE', 399, 499]];
  const p = interpolate(f, [T(1.2), T(3)], [0, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  return (
    <>
      <Head n="03 · DUMBBELL" title="PRICES" accent="2015 → 2025" />
      <Svg>
        <Txt x={700} y={250} c={K.dim} a="middle">2015</Txt><Txt x={1500} y={250} c={K.accent2} a="middle">2025</Txt>
        {rows.map(([b, lab, a, z], i) => {
          const y = 320 + i * 125;
          const pct = (z / a - 1) * 100;
          const x0 = 700, x1 = 700 + (pct / 80) * 800 * p;
          const g = useSp(4 + i * 4);
          return (
            <g key={b} opacity={g}>
              <Badge b={b} x={300} y={y} r={40} />
              <Txt x={360} y={y - 4} s={24}>{NAME[b]}</Txt><Txt x={360} y={y + 26} s={18} c={K.dim} w={600}>{lab}</Txt>
              <line x1={x0} x2={x1} y1={y} y2={y} stroke={GRID} strokeWidth={14} strokeLinecap="round" />
              <line x1={x0} x2={x1} y1={y} y2={y} stroke={K.accent} strokeWidth={6} strokeLinecap="round" />
              <circle cx={x0} cy={y} r={18} fill={K.dim} />
              <circle cx={x1} cy={y} r={22} fill={K.accent2} />
              <Txt x={x1 + 40} y={y + 10} s={30} o={p}>+{Math.round(pct * p)}%</Txt>
            </g>
          );
        })}
      </Svg>
    </>
  );
};

// 4. Lollipop
const S4: React.FC = () => {
  const rows: [string, number][] = [['facebook', 3.0], ['youtube', 2.5], ['instagram', 2.0], ['tiktok', 1.6], ['snapchat', 0.85], ['x', 0.6], ['twitch', 0.24]];
  return (
    <>
      <Head n="04 · LOLLIPOP" title="MONTHLY USERS" accent="(BILLIONS)" />
      <Svg>
        {rows.map(([b, v], i) => {
          const g = useSp(8 + i * 4, 18);
          const y = 270 + i * 100;
          const x = 520 + (v / 3) * 1100 * g;
          return (
            <g key={b}>
              <Txt x={490} y={y + 9} a="end" s={26}>{NAME[b]}</Txt>
              <line x1={520} x2={x} y1={y} y2={y} stroke={col(b)} strokeWidth={6} />
              <Badge b={b} x={x} y={y} r={36} scale={useSp(14 + i * 4, 9)} />
              <Txt x={x + 54} y={y + 10} s={30} o={g}>{fmt(v * g, 2)}</Txt>
            </g>
          );
        })}
      </Svg>
    </>
  );
};

// 5. Pictogrammes à l'échelle (voitures)
const Car: React.FC<{x: number; y: number; s: number; c: string}> = ({x, y, s, c}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-100,0 L-100,-30 Q-95,-45 -70,-48 L-40,-75 Q-30,-82 0,-82 L35,-82 Q55,-80 70,-50 L95,-44 Q105,-40 105,-25 L105,0 Z" fill={c} />
    <path d="M-30,-70 L0,-72 L0,-50 L-50,-50 Z M10,-72 L35,-72 Q48,-70 58,-50 L10,-50 Z" fill="#cfe3f5" opacity={0.85} />
    <circle cx={-55} cy={0} r={20} fill="#1b1b1b" /><circle cx={60} cy={0} r={20} fill="#1b1b1b" />
    <circle cx={-55} cy={0} r={8} fill="#aaa" /><circle cx={60} cy={0} r={8} fill="#aaa" />
  </g>
);
const S5: React.FC = () => {
  const rows: [string, number][] = [['tesla', 1800], ['porsche', 320], ['ferrari', 14], ['lamborghini', 10]];
  return (
    <>
      <Head n="05 · SCALED PICTOGRAMS" title="CARS BUILT" accent="PER YEAR (THOUSANDS)" />
      <Svg>
        <line x1={150} x2={1770} y1={820} y2={820} stroke={GRID} strokeWidth={4} />
        {rows.map(([b, v], i) => {
          const g = useSp(10 + i * 8, 11);
          const s = Math.sqrt(v / 1800) * 3.6 * g;
          const x = [500, 1060, 1380, 1620][i];
          return (
            <g key={b}>
              <Car x={x} y={800} s={Math.max(0.01, s)} c={col(b)} />
              <Badge b={b} x={x} y={890} r={34} scale={g} />
              <Txt x={x} y={970} a="middle" s={36} o={g}>{fmt(v * g)}</Txt>
            </g>
          );
        })}
      </Svg>
    </>
  );
};

// 6. Podium
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const P: [string, number, number, string][] = [['apple', 960, 360, '1'], ['google', 620, 260, '2'], ['amazon', 1300, 190, '3']];
  return (
    <>
      <Head n="06 · PODIUM" title="TOP 3" accent="BRANDS" />
      <Svg>
        {P.map(([b, x, h, n], i) => {
          const order = [2, 1, 0][i];
          const g = useSp(8 + order * 12, 15);
          const drop = useSp(20 + order * 12, 9);
          const hh = h * g;
          return (
            <g key={b}>
              <rect x={x - 150} y={940 - hh} width={300} height={hh} fill={['#ffd166', '#c9d1dc', '#d9895b'][i]} />
              <rect x={x - 150} y={940 - hh} width={300} height={16} fill="#fff" opacity={0.25} />
              <Txt x={x} y={940 - hh + 110} a="middle" s={100} w={900} c="#101b30" o={g}>{n}</Txt>
              <Badge b={b} x={x} y={940 - hh - 90 - (1 - drop) * 500} r={70} />
            </g>
          );
        })}
        {f > 50 && Array.from({length: 60}).map((_, i) => {
          const t = f - 50 - rnd(i) * 20;
          if (t < 0) return null;
          return <rect key={i} x={300 + rnd(i + 1) * 1320 + Math.sin(t * 0.2 + i) * 30} y={-20 + t * (6 + rnd(i + 2) * 5)} width={14} height={8}
            fill={[K.accent, K.accent2, '#2ec27e', '#5aa9ff', '#e5484d'][i % 5]} transform={`rotate(${t * 9 + i * 40} ${300 + rnd(i + 1) * 1320} ${-20 + t * 7})`} />;
        })}
      </Svg>
    </>
  );
};

// 7. Cartes de score
const Spark: React.FC<{x: number; y: number; seed: number; up: boolean; p: number}> = ({x, y, seed, up, p}) => {
  const pts = Array.from({length: 12}, (_, i) => [x + i * 26, y - (up ? i * 4 : -i * 3) - rnd(seed + i) * 26]).filter((_, i) => i / 11 <= p);
  return <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke={up ? '#2ec27e' : '#e5484d'} strokeWidth={4} />;
};
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const cards: [string, number, string, number, boolean][] = [['LISTENERS', 640, 'M', 11, true], ['SUBSCRIBERS', 260, 'M', 8, true], ['SONGS', 100, 'M', 5, true], ['CHURN', 3.1, '%', -0.4, false]];
  return (
    <>
      <Head n="07 · SCORECARDS" title="SPOTIFY" accent="Q3 DASHBOARD" />
      <Svg>
        <Badge b="spotify" x={1760} y={110} r={60} scale={useSp(0, 10)} />
        {cards.map(([lab, v, u, d, up], i) => {
          const g = useSp(8 + i * 6, 13);
          const x = 120 + i * 430, y = 330;
          const p = interpolate(f, [15 + i * 6, 60 + i * 6], [0, 1], {...CL, easing: Easing.out(Easing.cubic)});
          return (
            <g key={lab} transform={`translate(${x + 190} ${y + 260}) scale(${g}) translate(${-190} ${-260})`}>
              <rect width={380} height={520} rx={24} fill="#1f3152" />
              <Txt x={34} y={70} s={24} c={K.dim} ls={3}>{lab}</Txt>
              <Txt x={34} y={190} s={96} w={900}>{v < 10 ? fmt(v * p, 1) : fmt(v * p)}<tspan fontSize={48} fill={K.accent2}>{u}</tspan></Txt>
              <rect x={34} y={230} width={170} height={52} rx={26} fill={up ? '#1f6f4a' : '#7a2a2e'} />
              <Txt x={119} y={265} a="middle" s={26} c={up ? '#7cf0b1' : '#ffb1b4'}>{d > 0 ? '▲ +' : '▼ '}{d}{u === '%' ? ' PT' : '%'}</Txt>
              <Spark x={34} y={440} seed={i * 20} up={up} p={p} />
            </g>
          );
        })}
      </Svg>
    </>
  );
};

// 8. Face-à-face VS
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const slide = useSp(0, 16);
  const vs = useSp(14, 7);
  const rows: [string, number, number, string][] = [['RESTAURANTS', 41000, 19000, ''], ['COUNTRIES', 118, 100, ''], ['BURGERS / DAY', 6.5, 2.4, 'M'], ['FOUNDED', 1940, 1954, '']];
  return (
    <>
      <Svg>
        <rect x={-960 + slide * 960} y={0} width={960} height={1080} fill="#c8102e" />
        <rect x={1920 - slide * 960} y={0} width={960} height={1080} fill="#502314" />
        <Badge b="mcdonalds" x={480 - (1 - slide) * 900} y={250} r={110} />
        <Badge b="burgerking" x={1440 + (1 - slide) * 900} y={250} r={110} />
        <g transform={`translate(960 250) scale(${vs}) rotate(${-8 + Math.sin(f * 0.3) * 2})`}>
          <path d="M-20,-120 L60,-120 L10,-10 L70,-10 L-40,140 L0,20 L-60,20 Z" fill={K.accent2} />
          <Txt x={0} y={30} a="middle" s={110} w={900} c="#101b30">VS</Txt>
        </g>
        {rows.map(([lab, a, b, u], i) => {
          const g = useSp(28 + i * 8, 15);
          const y = 520 + i * 120;
          const mx = Math.max(a, b);
          const isYear = lab === 'FOUNDED';
          const wa = isYear ? 260 : (a / mx) * 380, wb = isYear ? 260 : (b / mx) * 380;
          const win = isYear ? a < b : a > b;
          return (
            <g key={lab} opacity={g}>
              <Txt x={960} y={y - 18} a="middle" s={22} c="#fff" ls={4}>{lab}</Txt>
              <rect x={930 - wa * g} y={y} width={wa * g} height={56} rx={8} fill={win ? K.accent2 : '#ffffff55'} />
              <rect x={990} y={y} width={wb * g} height={56} rx={8} fill={!win ? K.accent2 : '#ffffff55'} />
              <Txt x={910 - wa * g} y={y + 42} a="end" s={36}>{isYear ? a : fmt(a * g, u ? 1 : 0)}{u}</Txt>
              <Txt x={1010 + wb * g} y={y + 42} s={36}>{isYear ? b : fmt(b * g, u ? 1 : 0)}{u}</Txt>
            </g>
          );
        })}
      </Svg>
      <div style={{position: 'absolute', right: 60, bottom: 36, fontFamily: FONT, fontWeight: 600, fontSize: 18, letterSpacing: 3, color: '#fff', opacity: 0.7}}>08 · VS FACE-OFF · ILLUSTRATIVE DATA</div>
    </>
  );
};

const SCENES: Scene[] = [
  [PackTitle('PACK 1 · STYLE 1', 'COMPARE & NUMBERS', '8 NEW CHARTS'), T(2.5)],
  [S1, T(6)], [S2, T(4.5)], [S3, T(5)], [S4, T(4.5)], [S5, T(4.5)], [S6, T(5)], [S7, T(5)], [S8, T(6)],
];
export const PACK1_FRAMES = total(SCENES);
export const PackOne: React.FC = () => <Pack1 scenes={SCENES} />;
void MUTED;
