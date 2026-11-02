// Pack 5 : échelle et jeux (style n° 1). Données fictives ou arrondies.
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Badge, CL, col, fmt, FONT, Head, K, Logo, NAME, Pack1, PackTitle, rnd, Scene, Svg, T, total, Txt, useSp} from './k1';

// 1. « X fois plus gros » (aires de cercles)
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const g1 = useSp(6, 11);
  const grow = interpolate(f, [T(1.2), T(3)], [0, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  const zoom = interpolate(grow, [0, 1], [1.5, 1]);
  const r0 = 70, r1 = r0 * Math.sqrt(390 / 51);
  const R = r0 + (r1 - r0) * grow;
  return (
    <>
      <Head n="01 · SCALE COMPARISON" title="APPLE vs NIKE" accent="REVENUE" />
      <Svg>
        <g transform={`translate(960 640) scale(${zoom}) translate(-960 -640)`}>
          <circle cx={1060 + R - 0} cy={640} r={R} fill={col('apple')} opacity={grow > 0 ? 1 : 0} />
          {grow > 0.2 && <Logo b="apple" x={1060 + R} y={640} s={R * 0.9} />}
          <circle cx={1060 - r0 - 10} cy={640 + R - r0} r={r0 * g1} fill="#fbf7ee" />
          <Logo b="nike" x={1060 - r0 - 10} y={640 + R - r0} s={r0 * 1.3 * g1} />
        </g>
        <Txt x={960} y={980} a="middle" s={64} w={900} o={grow}>
          APPLE IS <tspan fill={K.accent2}>{fmt(1 + (390 / 51 - 1) * grow, 1)}×</tspan> BIGGER
        </Txt>
      </Svg>
    </>
  );
};

// 2. Zoom infini (niveaux imbriqués)
const Lv: React.FC<{k: number; z: number; children: React.ReactNode}> = ({k, z, children}) => {
  const s = Math.pow(8, z - k);
  const o = interpolate(s, [0.06, 0.16, 6, 9], [0, 1, 1, 0], CL);
  if (o <= 0) return null;
  return <g opacity={o} transform={`translate(960 600) scale(${s}) translate(-960 -600)`}>{children}</g>;
};
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [10, T(4.6)], [0, 4], {...CL, easing: Easing.inOut(Easing.sin)});
  const labels = ['EARTH', 'SEATTLE', 'A STORE', 'A COUNTER', 'ONE CUP'];
  return (
    <>
      <Svg>
        <Lv k={0} z={z}>
          <circle cx={960} cy={600} r={420} fill="#2d6a8f" />
          <path d="M700,380 Q820,300 940,420 Q900,520 780,540 Q680,500 700,380 Z M1000,600 Q1150,560 1220,700 Q1120,860 1000,780 Z" fill="#7fb069" />
          <circle cx={960} cy={600} r={6} fill={K.accent} />
        </Lv>
        <Lv k={1} z={z}>
          <rect x={0} y={0} width={1920} height={1200} fill="#26334d" />
          {Array.from({length: 12}).map((_, i) => <rect key={i} x={0} y={i * 110} width={1920} height={14} fill="#3b4a66" />)}
          {Array.from({length: 18}).map((_, i) => <rect key={i} x={i * 120} y={0} width={14} height={1200} fill="#3b4a66" />)}
          <rect x={900} y={560} width={120} height={80} fill={col('starbucks')} />
        </Lv>
        <Lv k={2} z={z}>
          <rect x={0} y={0} width={1920} height={1200} fill="#c9b79c" />
          <rect x={560} y={260} width={800} height={700} fill="#efe6d6" />
          <rect x={560} y={260} width={800} height={110} fill={col('starbucks')} />
          <Txt x={960} y={335} a="middle" s={60} w={900} c="#fff">COFFEE</Txt>
          <rect x={620} y={440} width={320} height={300} fill="#9ec5d6" /><rect x={980} y={440} width={320} height={520} fill="#6b4f3a" />
          <rect x={900} y={560} width={120} height={80} fill="#5a3e2b" />
        </Lv>
        <Lv k={3} z={z}>
          <rect x={0} y={0} width={1920} height={1200} fill="#5a3e2b" />
          <rect x={0} y={700} width={1920} height={500} fill="#3b281c" />
          <path d="M880,420 L1040,420 L1020,720 L900,720 Z" fill="#fbf7ee" />
          <rect x={870} y={400} width={180} height={30} rx={8} fill="#e8e0d0" />
          <circle cx={960} cy={600} r={40} fill={col('starbucks')} />
        </Lv>
        <Lv k={4} z={z}>
          <rect x={0} y={0} width={1920} height={1200} fill="#fbf7ee" />
          <circle cx={960} cy={600} r={330} fill={col('starbucks')} />
          <circle cx={960} cy={600} r={300} fill="#fbf7ee" />
          <Logo b="starbucks" x={960} y={600} s={560} />
        </Lv>
      </Svg>
      <div style={{position: 'absolute', left: 80, top: 56}}>
        <div style={{display: 'inline-block', fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: '#101b30', background: K.accent, padding: '6px 14px', borderRadius: 6}}>02 · INFINITE ZOOM</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 60, color: '#fff', marginTop: 12, textShadow: '0 4px 20px rgba(0,0,0,.5)'}}>{labels[Math.min(4, Math.round(z))]}</div>
      </div>
    </>
  );
};

// 3. Empilement jusqu'à la Lune (échelle logarithmique)
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const L = interpolate(f, [10, T(5)], [0, 7.0], {...CL, easing: Easing.inOut(Easing.quad)});
  const Y = (h: number) => 900 - (Math.log10(h) - L) * 260;
  const H = Math.pow(10, L + 1.6);
  const marks: [number, string][] = [[1.8, 'A PERSON'], [330, 'EIFFEL TOWER'], [8849, 'EVEREST'], [11000, 'PLANES'], [408000, 'SPACE STATION'], [384400000, 'THE MOON']];
  const top = Math.max(-200, Y(Math.min(H, 384400000)));
  return (
    <>
      <Svg>
        <rect x={0} y={0} width={1920} height={1080} fill={`rgb(${16 - L * 2},${27 - L * 3},${48 - L * 5})`} opacity={0.6} />
        {L > 3.5 && Array.from({length: 60}).map((_, i) => <circle key={i} cx={rnd(i) * 1920} cy={rnd(i + 9) * 1080} r={1.5 + rnd(i + 3) * 2} fill="#fff" opacity={interpolate(L, [3.5, 5], [0, 0.7], CL)} />)}
        <rect x={900} y={top} width={120} height={1100 - top} fill={col('cocacola')} />
        {Array.from({length: 40}).map((_, i) => <rect key={i} x={900} y={top + ((i * 40 + f * 3) % (1100 - top + 40))} width={120} height={6} fill="#fff" opacity={0.35} />)}
        {marks.map(([h, n]) => {
          const y = Y(h);
          if (y < -50 || y > 1150) return null;
          const moon = n === 'THE MOON';
          return (
            <g key={n}>
              <line x1={1060} x2={1400} y1={y} y2={y} stroke={K.white} strokeWidth={2} strokeDasharray="8 8" />
              {moon && <circle cx={1760} cy={y} r={110} fill="#d9d4c7" />}
              <Txt x={1420} y={y - 10} s={30}>{n}</Txt>
              <Txt x={1420} y={y + 24} s={22} c={K.dim} w={600}>{h >= 1000 ? `${fmt(h / 1000)} KM` : `${fmt(h)} M`}</Txt>
            </g>
          );
        })}
        <Badge b="cocacola" x={960} y={Math.max(80, top - 70)} r={56} />
      </Svg>
      <Head n="03 · STACKING SCALE" title="ONE YEAR OF CANS," accent="STACKED" />
      <div style={{position: 'absolute', left: 80, bottom: 80, fontFamily: FONT, fontWeight: 900, fontSize: 70, color: '#fff'}}>
        {H >= 384400000 ? <span style={{color: K.accent2}}>TO THE MOON!</span> : H >= 1000 ? `${fmt(H / 1000)} KM` : `${fmt(H)} M`}
      </div>
    </>
  );
};

// 4. Roue de la fortune
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const br = ['netflix', 'spotify', 'mcdonalds', 'playstation', 'starbucks', 'nintendo', 'apple', 'redbull'];
  const N = br.length, seg = 360 / N;
  const target = 4; // starbucks
  const endA = 360 * 6 - target * seg;
  const a = interpolate(f, [12, T(4.2)], [0, endA], {...CL, easing: Easing.out(Easing.cubic)});
  const won = f > T(4.2);
  const tick = Math.sin(((a % seg) / seg) * Math.PI) * -12;
  const cx = 860, cy = 590, R = 380;
  const sp = useSp(T(4.2), 9);
  return (
    <>
      <Svg>
        <path d={`M${cx - 120},1060 L${cx},${cy} L${cx + 120},1060 Z`} fill="#6b2f2f" />
        <circle cx={cx} cy={cy} r={R + 30} fill="#7a1f2b" />
        {Array.from({length: 24}).map((_, i) => <circle key={i} cx={cx + Math.cos(i * 0.2618) * (R + 15)} cy={cy + Math.sin(i * 0.2618) * (R + 15)} r={8} fill={(i + Math.floor(f / 4)) % 2 ? '#fff3b0' : '#8a5a2b'} />)}
        <g transform={`rotate(${a} ${cx} ${cy})`}>
          {br.map((b, i) => {
            const a0 = (i * seg - 90 - seg / 2) * (Math.PI / 180), a1 = ((i + 1) * seg - 90 - seg / 2) * (Math.PI / 180);
            const m = (a0 + a1) / 2;
            return (
              <g key={b}>
                <path d={`M${cx},${cy} L${cx + Math.cos(a0) * R},${cy + Math.sin(a0) * R} A${R},${R} 0 0 1 ${cx + Math.cos(a1) * R},${cy + Math.sin(a1) * R} Z`} fill={i % 2 ? '#1f3152' : '#2a3f66'} stroke="#ffd166" strokeWidth={4} />
                <Badge b={b} x={cx + Math.cos(m) * R * 0.68} y={cy + Math.sin(m) * R * 0.68} r={48} />
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={50} fill="#ffd166" />
        </g>
        <path d={`M${cx - 30},${cy - R - 50} L${cx + 30},${cy - R - 50} L${cx},${cy - R + 20} Z`} fill={K.accent} transform={`rotate(${won ? 0 : tick} ${cx} ${cy - R - 50})`} />
        {won && (
          <g transform={`translate(1520 520) scale(${sp})`}>
            <Badge b={br[target]} x={0} y={0} r={110} />
            <Txt x={0} y={190} a="middle" s={48} w={900} c={K.accent2}>{NAME[br[target]]}</Txt>
            <Txt x={0} y={240} a="middle" s={28} c={K.white}>WINS!</Txt>
          </g>
        )}
      </Svg>
      <Head n="04 · WHEEL OF FORTUNE" title="SPIN" accent="THE WHEEL" note="" />
    </>
  );
};

// 5. Ouverture d'un pack de cartes
const Card: React.FC<{b: string; x: number; y: number; rot: number; s: number; flip: number; rare?: boolean}> = ({b, x, y, rot, s, flip, rare}) => {
  const front = flip > 0.5;
  const sx = Math.abs(Math.cos(flip * Math.PI));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * sx} ${s})`}>
      <rect x={-110} y={-155} width={220} height={310} rx={16} fill={front ? (rare ? '#ffd166' : '#fbf7ee') : '#2a3f66'} stroke={rare && front ? '#fff' : '#ffd166'} strokeWidth={6} />
      {front ? (
        <>
          <Logo b={b} x={0} y={-30} s={130} />
          <Txt x={0} y={80} a="middle" s={20} w={900} c="#101b30">{NAME[b]}</Txt>
          <Txt x={0} y={120} a="middle" s={22} c={rare ? '#c2410c' : '#9aa5b5'}>{rare ? '★★★★★' : '★★'}</Txt>
        </>
      ) : (
        <Txt x={0} y={14} a="middle" s={40} w={900} c="#ffd166">?</Txt>
      )}
    </g>
  );
};
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const shake = f < T(1.2) ? Math.sin(f * 2.2) * interpolate(f, [0, T(1.2)], [2, 10], CL) : 0;
  const tear = interpolate(f, [T(1.2), T(1.7)], [0, 1], CL);
  const fan = interpolate(f, [T(1.7), T(2.6)], [0, 1], {...CL, easing: Easing.out(Easing.back(1.4))});
  const cards = ['nike', 'spotify', 'tesla', 'nintendo', 'apple'];
  const shine = ((f * 18) % 900) - 300;
  const rare = interpolate(f, [T(3.4), T(3.9)], [0, 1], CL);
  return (
    <>
      <Svg>
        {rare > 0.5 && Array.from({length: 16}).map((_, i) => <path key={i} d="M0,0 L-50,-900 L50,-900 Z" fill="#ffd166" opacity={0.15} transform={`translate(${960 + 2 * 280} 600) rotate(${i * 22.5 + f})`} />)}
        {fan > 0 && cards.map((b, i) => {
          const last = i === 4;
          const flip = last ? rare : interpolate(f, [T(2.6) + i * 6, T(2.6) + i * 6 + 8], [0, 1], CL);
          return <Card key={b} b={b} x={960 + (i - 2) * 280 * fan} y={600 - Math.abs(i - 2) * -20 * fan} rot={(i - 2) * 6 * fan} s={0.6 + fan * 0.5 + (last ? rare * 0.15 : 0)} flip={flip} rare={last} />;
        })}
        {fan < 1 && (
          <g transform={`translate(${960 + shake} 600)`} opacity={1 - fan}>
            <defs>
              <linearGradient id="foil" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#ff8a3d" /><stop offset="0.5" stopColor="#e5484d" /><stop offset="1" stopColor="#9c6b98" /></linearGradient>
              <clipPath id="pk"><rect x={-180} y={-260} width={360} height={520} rx={18} /></clipPath>
            </defs>
            <g clipPath="url(#pk)">
              <rect x={-180} y={-200} width={360} height={460} fill="url(#foil)" />
              <rect x={shine} y={-300} width={70} height={700} fill="#fff" opacity={0.25} transform="rotate(20)" />
            </g>
            <Txt x={0} y={20} a="middle" s={54} w={900}>BRAND</Txt><Txt x={0} y={80} a="middle" s={54} w={900} c={K.accent2}>PACK</Txt>
            <g transform={`translate(${tear * 260} ${-tear * 300}) rotate(${tear * 40})`}>
              <rect x={-180} y={-260} width={360} height={60} rx={10} fill="url(#foil)" />
              <path d="M-180,-200 l20,10 l20,-10 l20,10 l20,-10 l20,10 l20,-10 l20,10 l20,-10 l20,10 l20,-10 l20,10 l20,-10 l20,10 l20,-10 l20,10 l20,-10 l20,10 l20,-10" fill="none" stroke="#fff" strokeWidth={3} />
            </g>
          </g>
        )}
        {rare > 0.9 && <Txt x={960 + 560} y={940} a="middle" s={44} w={900} c={K.accent2}>LEGENDARY!</Txt>}
      </Svg>
      <Head n="05 · CARD PACK OPENING" title="OPEN" accent="THE PACK" note="" />
    </>
  );
};

// 6. Dés
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};
const Die: React.FC<{x: number; y: number; a: number; v: number; s?: number}> = ({x, y, a, v, s = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
    <rect x={-80} y={-80} width={160} height={160} rx={28} fill="#fbf7ee" />
    <rect x={-80} y={50} width={160} height={30} rx={14} fill="#d8d0c0" opacity={0.6} />
    {PIPS[v].map(([px, py], i) => <circle key={i} cx={px * 42} cy={py * 42} r={15} fill={v === 6 ? '#e5484d' : '#101b30'} />)}
  </g>
);
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const end = T(2.8);
  const dice = [0, 1].map((k) => {
    const t = Math.min(f, end);
    const x = interpolate(t, [0, end], [-200 + k * 120, 760 + k * 400], {easing: Easing.out(Easing.cubic)});
    const bounce = Math.abs(Math.sin((t / end) * Math.PI * 3.5)) * interpolate(t, [0, end], [380, 0]);
    const a = interpolate(t, [0, end], [0, 720 + k * 360], {easing: Easing.out(Easing.cubic)});
    const v = f >= end ? 6 : 1 + Math.floor(rnd(Math.floor(f / 3) + k * 50) * 6);
    return {x, y: 760 - bounce, a, v};
  });
  const win = useSp(end + 4, 9);
  return (
    <>
      <Svg>
        <rect x={0} y={840} width={1920} height={240} fill="#1d5c45" />
        <rect x={0} y={840} width={1920} height={12} fill="#2c7a5c" />
        {dice.map((d, i) => <g key={i}><ellipse cx={d.x} cy={850} rx={90 - (760 - d.y) * 0.1} ry={14} fill="#000" opacity={0.3} /><Die x={d.x} y={d.y} a={d.a} v={d.v} /></g>)}
        <g transform={`translate(1500 420) scale(${win})`}><Txt x={0} y={0} a="middle" s={90} w={900} c={K.accent2}>DOUBLE</Txt><Txt x={0} y={100} a="middle" s={90} w={900}>SIX!</Txt></g>
      </Svg>
      <Head n="06 · DICE" title="ROLL" accent="THE DICE" note="" />
    </>
  );
};

// 7. Pile ou face
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = 12, t1 = T(3);
  const t = interpolate(f, [t0, t1], [0, 1], CL);
  const y = 820 - Math.sin(t * Math.PI) * 600;
  const turns = interpolate(t, [0, 1], [0, 9.5]);
  const sy = Math.cos(turns * Math.PI * 2);
  const heads = sy >= 0;
  const land = f > t1;
  const res = useSp(t1 + 3, 9);
  return (
    <>
      <Svg>
        <ellipse cx={960} cy={880} rx={140 * (0.4 + 0.6 * (1 - Math.sin(t * Math.PI)))} ry={18} fill="#000" opacity={0.3} />
        <g transform={`translate(960 ${land ? 760 : y}) scale(1 ${land ? 1 : Math.max(0.05, Math.abs(sy))})`}>
          <circle r={130} fill={heads || land ? '#ffd166' : '#c9d1dc'} />
          <circle r={110} fill={heads || land ? '#f4a52a' : '#9aa5b5'} />
          <circle r={96} fill="#fbf7ee" />
          <Logo b={heads || land ? 'apple' : 'samsung'} x={0} y={0} s={heads || land ? 120 : 170} />
        </g>
        <g opacity={res}>
          <Txt x={420} y={560} a="middle" s={60} w={900} c={K.accent2}>HEADS</Txt>
          <Txt x={420} y={620} a="middle" s={30}>APPLE WINS</Txt>
        </g>
        <g opacity={1 - res}>
          <Txt x={420} y={560} a="middle" s={40} c={K.dim}>HEADS = APPLE</Txt>
          <Txt x={1500} y={560} a="middle" s={40} c={K.dim}>TAILS = SAMSUNG</Txt>
        </g>
      </Svg>
      <Head n="07 · COIN FLIP" title="FLIP" accent="A COIN" note="" />
    </>
  );
};

const SCENES: Scene[] = [
  [PackTitle('PACK 5 · STYLE 1', 'SCALE & GAMES', '3 SCALES · 4 BUILT GAMES'), T(2.5)],
  [S1, T(4.6)], [S2, T(5.4)], [S3, T(6)], [S4, T(6)], [S5, T(5.6)], [S6, T(4.6)], [S7, T(4.6)],
];
export const PACK5_FRAMES = total(SCENES);
export const PackFive: React.FC = () => <Pack1 scenes={SCENES} />;
