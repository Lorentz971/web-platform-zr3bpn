// Pack 10 : 12 autres styles visuels (échantillons de ~4,5 s), tout en code, sans IA.
import React from 'react';
import '@fontsource/special-elite/400.css';
import '@fontsource/patrick-hand/400.css';
import '@fontsource/playfair-display/700.css';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Badge, CL, FONT, K, Pack1, PackTitle, rnd, Scene, Svg, T, total, Txt, useSp} from './k1';

const TYPE = '"Special Elite", monospace';
const HAND = '"Patrick Hand", cursive';
const SERIF = '"Playfair Display", serif';
const Tag: React.FC<{n: string; label: string; dark?: boolean}> = ({n, label, dark}) => (
  <div style={{position: 'absolute', left: 60, bottom: 50, fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: dark ? '#101b30' : '#fff', background: dark ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.45)', padding: '8px 16px', borderRadius: 6}}>
    {n} · {label}
  </div>
);
const Bg: React.FC<{c: string}> = ({c}) => <AbsoluteFill style={{background: c}} />;

// A. Infographie (affiche claire)
const A: React.FC = () => {
  const f = useCurrentFrame();
  const stats: [string, string, string][] = [['8.4', 'HOURS', 'AVERAGE DAILY SCREEN TIME'], ['96', 'TIMES', 'PHONE UNLOCKS PER DAY'], ['3', 'HOURS', 'ON SOCIAL MEDIA']];
  return (
    <>
      <Bg c="#f4efe6" />
      <Svg>
        <Txt x={120} y={170} s={70} w={900} c="#1d2b4f">YOUR DAY,</Txt>
        <Txt x={120} y={250} s={70} w={900} c="#e2574c">IN SCREENS</Txt>
        <rect x={120} y={280} width={interpolate(f, [5, 30], [0, 300], CL)} height={10} fill="#f2b33d" />
        {stats.map(([v, u, d], i) => {
          const s = useSp(10 + i * 10, 13);
          const x = 120 + i * 580;
          return (
            <g key={i} opacity={s} transform={`translate(0 ${(1 - s) * 40})`}>
              <rect x={x} y={380} width={520} height={480} rx={30} fill={['#1d2b4f', '#e2574c', '#2a9d8f'][i]} />
              <Txt x={x + 40} y={560} s={150} w={900} c="#fff">{v}</Txt>
              <Txt x={x + 44} y={620} s={36} w={800} c="#f2b33d">{u}</Txt>
              <Txt x={x + 44} y={700} s={24} w={600} c="#fff">{d}</Txt>
              {Array.from({length: 10}).map((_, k) => <rect key={k} x={x + 44 + k * 44} y={760} width={34} height={50} rx={6} fill="#fff" opacity={k < [8, 10, 3][i] * interpolate(f, [30, 70], [0, 1], CL) ? 0.9 : 0.2} />)}
            </g>
          );
        })}
      </Svg>
      <Tag n="A" label="INFOGRAPHIC POSTER" dark />
    </>
  );
};

// B. Tableau d'enquête en couleur (liège)
const B: React.FC = () => {
  const f = useCurrentFrame();
  const P: [number, number, string, string][] = [[380, 330, '#f1c7a0', 'SUSPECT'], [960, 280, '#9ec5d6', 'THE CAR'], [1540, 340, '#c7e0b4', 'THE BANK'], [600, 770, '#f6e7a1', '9:42 PM'], [1320, 760, '#e8b4b8', 'WITNESS']];
  const L: [number, number][] = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 2], [1, 4]];
  const cam = interpolate(f, [0, T(4.5)], [1.08, 1], CL);
  return (
    <>
      <Bg c="#b5835a" />
      <Svg>
        <g transform={`translate(960 540) scale(${cam}) translate(-960 -540)`}>
          {Array.from({length: 400}).map((_, i) => <circle key={i} cx={rnd(i) * 1920} cy={rnd(i + 3) * 1080} r={2 + rnd(i + 5) * 3} fill="#8f6440" opacity={0.6} />)}
          {L.map(([a, b], i) => {
            const t = interpolate(f, [20 + i * 8, 34 + i * 8], [0, 1], CL);
            const [x1, y1] = P[a], [x2, y2] = P[b];
            return <line key={i} x1={x1} y1={y1 - 120} x2={x1 + (x2 - x1) * t} y2={y1 - 120 + (y2 - y1) * t} stroke="#c8102e" strokeWidth={4} />;
          })}
          {P.map(([x, y, c, n], i) => {
            const s = useSp(i * 4, 12);
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${(rnd(i) - 0.5) * 12}) scale(${s})`}>
                <rect x={-130} y={-140} width={260} height={290} fill="#fbf7ee" />
                <rect x={-110} y={-120} width={220} height={190} fill={c} />
                {i === 0 && <><circle cx={0} cy={-50} r={34} fill="#5a3e2b" /><rect x={-50} y={-15} width={100} height={85} rx={30} fill="#3d5a80" /></>}
                {i === 1 && <><rect x={-80} y={-40} width={160} height={50} rx={18} fill="#e2574c" /><circle cx={-45} cy={15} r={18} fill="#222" /><circle cx={45} cy={15} r={18} fill="#222" /></>}
                {i === 2 && <><path d="M-80,-50 L0,-100 L80,-50 Z" fill="#888" /><rect x={-70} y={-50} width={140} height={110} fill="#bbb" />{[-45, -15, 15, 45].map((xx) => <rect key={xx} x={xx - 8} y={-40} width={16} height={90} fill="#999" />)}</>}
                {i === 3 && <><circle cx={0} cy={-25} r={70} fill="#fff" stroke="#333" strokeWidth={5} /><line x1={0} y1={-25} x2={0} y2={-80} stroke="#333" strokeWidth={5} /><line x1={0} y1={-25} x2={40} y2={-5} stroke="#333" strokeWidth={5} /></>}
                {i === 4 && <><circle cx={0} cy={-50} r={34} fill="#d9a77f" /><rect x={-50} y={-15} width={100} height={85} rx={30} fill="#81b29a" /></>}
                <text x={0} y={120} textAnchor="middle" fontFamily={HAND} fontSize={38} fill="#222">{n}</text>
                <circle cx={0} cy={-120} r={12} fill="#c8102e" />
              </g>
            );
          })}
          <g transform={`translate(960 600) rotate(4) scale(${useSp(T(2.8), 9)})`}>
            <rect x={-120} y={-80} width={240} height={160} fill="#fff27a" />
            <text x={0} y={-10} textAnchor="middle" fontFamily={HAND} fontSize={44} fill="#222">WHO DRIVES</text>
            <text x={0} y={40} textAnchor="middle" fontFamily={HAND} fontSize={44} fill="#c8102e">THE CAR??</text>
          </g>
        </g>
      </Svg>
      <Tag n="B" label="INVESTIGATION BOARD (COLOUR)" />
    </>
  );
};

// C. Archives caviardées
const C: React.FC = () => {
  const f = useCurrentFrame();
  const lines = ['MEMORANDUM FOR THE DIRECTOR', 'SUBJECT: OPERATION ██████████', '', 'On 14 March 1962 the agency met with', 'representatives of ████████ to discuss', 'the transfer of ██ crates to the base at', '██████████. The meeting lasted 4 hours.', 'No minutes were kept. All copies of this', 'document must be destroyed after reading.'];
  let budget = Math.floor(f * 2.4);
  return (
    <>
      <Bg c="#3a3128" />
      <Svg>
        <g transform={`rotate(-2 960 540) translate(0 ${interpolate(f, [0, T(4.5)], [10, -10])})`}>
          <rect x={460} y={110} width={1000} height={900} fill="#efe3c6" />
          <rect x={460} y={110} width={1000} height={900} fill="url(#age)" opacity={0.5} />
          <defs><radialGradient id="age"><stop offset="0.5" stopColor="#fff" stopOpacity={0} /><stop offset="1" stopColor="#a07a45" stopOpacity={0.8} /></radialGradient></defs>
          <path d="M1380,90 q30,0 30,30 v120 q0,20 -20,20 q-20,0 -20,-20 v-100" fill="none" stroke="#999" strokeWidth={6} />
          {lines.map((l, i) => {
            const show = l.slice(0, Math.max(0, Math.min(l.length, budget)));
            budget -= l.length + 3;
            return (
              <text key={i} x={540} y={220 + i * 70} fontFamily={TYPE} fontSize={i < 2 ? 34 : 30} fill="#222" style={{whiteSpace: 'pre'}}>
                {show.split('').map((ch, k) => <tspan key={k} fill={ch === '█' ? '#111' : '#222'}>{ch}</tspan>)}
              </text>
            );
          })}
          {f > T(3.2) && (
            <g transform={`translate(1150 880) rotate(-14) scale(${interpolate(f, [T(3.2), T(3.4)], [2, 1], CL)})`} opacity={0.85}>
              <rect x={-230} y={-60} width={460} height={110} fill="none" stroke="#b3261e" strokeWidth={8} />
              <text x={0} y={22} textAnchor="middle" fontFamily={TYPE} fontSize={64} fill="#b3261e">TOP SECRET</text>
            </g>
          )}
        </g>
      </Svg>
      <Tag n="C" label="REDACTED ARCHIVES" />
    </>
  );
};

// D. Isométrique 2.5D
const iso = (x: number, y: number, z = 0) => [960 + (x - y) * 70, 420 + (x + y) * 40 - z];
const Box: React.FC<{x: number; y: number; h: number; c: [string, string, string]}> = ({x, y, h, c}) => {
  const P = (a: number, b: number, z: number) => iso(a, b, z).join(',');
  return (
    <g>
      <polygon points={`${P(x, y + 1, 0)} ${P(x + 1, y + 1, 0)} ${P(x + 1, y + 1, h)} ${P(x, y + 1, h)}`} fill={c[1]} />
      <polygon points={`${P(x + 1, y, 0)} ${P(x + 1, y + 1, 0)} ${P(x + 1, y + 1, h)} ${P(x + 1, y, h)}`} fill={c[2]} />
      <polygon points={`${P(x, y, h)} ${P(x + 1, y, h)} ${P(x + 1, y + 1, h)} ${P(x, y + 1, h)}`} fill={c[0]} />
    </g>
  );
};
const D: React.FC = () => {
  const f = useCurrentFrame();
  const cells: [number, number][] = [];
  for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) if (x !== 2 && y !== 3) cells.push([x, y]);
  const pal: [string, string, string][] = [['#ffd166', '#e0a93a', '#c88f22'], ['#9ec5d6', '#6f9fb3', '#55889c'], ['#e8b4b8', '#c98a90', '#b06f76'], ['#c7e0b4', '#97bf7f', '#7ea867']];
  const carT = (f % 90) / 90;
  return (
    <>
      <Bg c="#20304f" />
      <Svg>
        {Array.from({length: 7}).map((_, i) => <g key={i}><line x1={iso(i, 0)[0]} y1={iso(i, 0)[1]} x2={iso(i, 6)[0]} y2={iso(i, 6)[1]} stroke="#2e4470" strokeWidth={2} /><line x1={iso(0, i)[0]} y1={iso(0, i)[1]} x2={iso(6, i)[0]} y2={iso(6, i)[1]} stroke="#2e4470" strokeWidth={2} /></g>)}
        <polygon points={[iso(2, 0), iso(3, 0), iso(3, 6), iso(2, 6)].map((p) => p.join(',')).join(' ')} fill="#3b4a66" />
        <polygon points={[iso(0, 3), iso(6, 3), iso(6, 4), iso(0, 4)].map((p) => p.join(',')).join(' ')} fill="#3b4a66" />
        {cells.sort((a, b) => a[0] + a[1] - (b[0] + b[1])).map(([x, y], i) => {
          const g = interpolate(f, [5 + (x + y) * 5, 25 + (x + y) * 5], [0, 1], {...CL, easing: Easing.out(Easing.back(1.5))});
          const h = (30 + rnd(i) * 160) * g;
          return <Box key={i} x={x} y={y} h={h} c={pal[i % 4]} />;
        })}
        {(() => {
          const [cx, cy] = iso(2.5, carT * 6, 6);
          return <g><rect x={cx - 14} y={cy - 12} width={28} height={20} rx={5} fill="#e2574c" /></g>;
        })()}
        {(() => {
          const [cx, cy] = iso((1 - carT) * 6, 3.5, 6);
          return <g><rect x={cx - 14} y={cy - 12} width={28} height={20} rx={5} fill="#fff" /></g>;
        })()}
      </Svg>
      <Tag n="D" label="ISOMETRIC 2.5D" />
    </>
  );
};

// E. Ordinateur rétro (bureau années 90)
const Win: React.FC<{x: number; y: number; w: number; h: number; title: string; s: number; children?: React.ReactNode}> = ({x, y, w, h, title, s, children}) => (
  <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${s}) translate(${-w / 2} ${-h / 2})`}>
    <rect width={w} height={h} fill="#c0c0c0" stroke="#fff" strokeWidth={3} />
    <rect x={3} y={3} width={w - 3} height={h - 3} fill="none" stroke="#404040" strokeWidth={3} />
    <rect x={6} y={6} width={w - 12} height={34} fill="#000080" />
    <text x={16} y={30} fontFamily="DejaVu Sans, sans-serif" fontWeight={700} fontSize={20} fill="#fff">{title}</text>
    <rect x={w - 40} y={10} width={28} height={26} fill="#c0c0c0" /><text x={w - 26} y={30} textAnchor="middle" fontSize={20} fontWeight={700}>×</text>
    {children}
  </g>
);
const E: React.FC = () => {
  const f = useCurrentFrame();
  const prog = interpolate(f, [20, T(3)], [0, 1], CL);
  const errS = useSp(T(3.1), 9);
  const cx = interpolate(f, [0, 40, 80, 120], [300, 700, 980, 1090], CL), cy = interpolate(f, [0, 40, 80, 120], [900, 400, 640, 690], CL);
  return (
    <>
      <Bg c="#008080" />
      <Svg>
        {['MY COMPUTER', 'RECYCLE BIN', 'BRANDS.XLS'].map((n, i) => <g key={n}><rect x={60} y={60 + i * 140} width={64} height={54} fill="#c0c0c0" stroke="#000" /><text x={92} y={140 + i * 140} textAnchor="middle" fontFamily="DejaVu Sans" fontSize={16} fill="#fff">{n}</text></g>)}
        <rect x={0} y={1030} width={1920} height={50} fill="#c0c0c0" />
        <rect x={6} y={1036} width={120} height={38} fill="#c0c0c0" stroke="#404040" strokeWidth={2} /><text x={66} y={1062} textAnchor="middle" fontFamily="DejaVu Sans" fontWeight={700} fontSize={20}>Start</text>
        <Win x={420} y={200} w={760} h={420} title="Analyzing brands..." s={useSp(5, 12)}>
          <text x={30} y={110} fontFamily="DejaVu Sans" fontSize={22}>Loading BRANDS.XLS ({Math.round(prog * 100)}%)</text>
          <rect x={30} y={140} width={700} height={40} fill="#fff" stroke="#404040" strokeWidth={2} />
          {Array.from({length: Math.floor(prog * 28)}).map((_, i) => <rect key={i} x={34 + i * 25} y={144} width={21} height={32} fill="#000080" />)}
          {['apple', 'google', 'amazon', 'tesla'].map((b, i) => <g key={b} opacity={prog > (i + 1) / 5 ? 1 : 0}><Badge b={b} x={80 + i * 170} y={280} r={40} /></g>)}
        </Win>
        {f > T(3.1) && (
          <Win x={900} y={520} w={520} h={230} title="Error" s={errS}>
            <circle cx={70} cy={120} r={34} fill="#e00" /><text x={70} y={134} textAnchor="middle" fill="#fff" fontSize={44} fontWeight={700}>×</text>
            <text x={130} y={115} fontFamily="DejaVu Sans" fontSize={22}>Too many brands.</text>
            <text x={130} y={145} fontFamily="DejaVu Sans" fontSize={22}>Please buy more RAM.</text>
            <rect x={200} y={170} width={120} height={40} fill="#c0c0c0" stroke="#000" /><text x={260} y={197} textAnchor="middle" fontFamily="DejaVu Sans" fontSize={20}>OK</text>
          </Win>
        )}
        <path d={`M${cx},${cy} l0,34 l9,-9 l7,15 l6,-3 l-7,-15 l12,0 Z`} fill="#fff" stroke="#000" strokeWidth={2} />
      </Svg>
      <Tag n="E" label="RETRO COMPUTER UI" />
    </>
  );
};

// F. Plan technique (blueprint)
const F: React.FC = () => {
  const f = useCurrentFrame();
  const d = (a: number, b: number) => interpolate(f, [a, b], [1, 0], CL);
  const L = {stroke: '#e6f1ff', strokeWidth: 3, fill: 'none', pathLength: 1, strokeDasharray: 1} as const;
  return (
    <>
      <Bg c="#1a4a8a" />
      <Svg>
        {Array.from({length: 49}).map((_, i) => <line key={i} x1={i * 40} x2={i * 40} y1={0} y2={1080} stroke="#2b5ea3" strokeWidth={i % 5 ? 1 : 2} />)}
        {Array.from({length: 28}).map((_, i) => <line key={i} x1={0} x2={1920} y1={i * 40} y2={i * 40} stroke="#2b5ea3" strokeWidth={i % 5 ? 1 : 2} />)}
        <path d="M960,160 Q1040,260 1040,420 L1040,760 L880,760 L880,420 Q880,260 960,160 Z" {...L} strokeDashoffset={d(5, 50)} />
        <path d="M880,640 L780,800 L880,760 M1040,640 L1140,800 L1040,760" {...L} strokeDashoffset={d(30, 70)} />
        <circle cx={960} cy={400} r={46} {...L} strokeDashoffset={d(40, 75)} />
        <path d="M900,760 L920,840 L1000,840 L1020,760" {...L} strokeDashoffset={d(55, 85)} />
        <g opacity={interpolate(f, [70, 90], [0, 1], CL)} stroke="#e6f1ff" strokeWidth={2}>
          <line x1={1200} x2={1200} y1={160} y2={760} /><line x1={1185} x2={1215} y1={160} y2={160} /><line x1={1185} x2={1215} y1={760} y2={760} />
          <line x1={880} x2={1040} y1={880} y2={880} /><line x1={880} x2={880} y1={865} y2={895} /><line x1={1040} x2={1040} y1={865} y2={895} />
          <line x1={1006} y1={370} x2={1300} y2={300} />
        </g>
        <g opacity={interpolate(f, [80, 100], [0, 1], CL)} fontFamily="DejaVu Sans Mono" fill="#e6f1ff">
          <text x={1220} y={470} fontSize={26}>H = 42.0 M</text>
          <text x={960} y={930} fontSize={26} textAnchor="middle">Ø 3.7 M</text>
          <text x={1310} y={300} fontSize={24}>PORTHOLE · TEMPERED GLASS</text>
          <text x={120} y={980} fontSize={22}>DWG NO. R-07 · SCALE 1:100 · REV C</text>
        </g>
      </Svg>
      <Tag n="F" label="BLUEPRINT" />
    </>
  );
};

// G. Ombres chinoises
const G: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, T(4.5)], [300, 1300], CL);
  const step = Math.sin(f * 0.35);
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 70%, #ffd27a 0%, #f08a3c 35%, #b13a2a 70%, #3a0f12 100%)'}} />
      <Svg>
        <path d="M0,800 L200,640 L380,760 L620,560 L860,760 L1100,600 L1400,780 L1650,620 L1920,760 L1920,1080 L0,1080 Z" fill="#5a1a14" opacity={0.6} />
        <path d="M0,880 Q480,820 960,880 T1920,860 L1920,1080 L0,1080 Z" fill="#000" />
        {[260, 1600].map((tx, i) => <g key={i} fill="#000"><rect x={tx - 8} y={700} width={16} height={200} /><circle cx={tx} cy={660} r={90} /><circle cx={tx - 60} cy={720} r={60} /><circle cx={tx + 60} cy={720} r={60} /></g>)}
        <g transform={`translate(${x} 870)`} fill="#000">
          <circle cx={0} cy={-230} r={26} />
          <path d="M-8,-206 L8,-206 L22,-90 L-22,-90 Z" />
          <rect x={-6} y={-95} width={12} height={95} transform={`rotate(${step * 25} 0 -95)`} />
          <rect x={-6} y={-95} width={12} height={95} transform={`rotate(${-step * 25} 0 -95)`} />
          <rect x={-5} y={-200} width={10} height={90} transform={`rotate(${-step * 30} 0 -200)`} />
          <line x1={0} y1={-150} x2={60} y2={-40} stroke="#000" strokeWidth={6} transform={`rotate(${step * 10} 0 -150)`} />
        </g>
        {Array.from({length: 5}).map((_, i) => {
          const bx = ((f * 4 + i * 260) % 2200) - 140, by = 260 + i * 40 + Math.sin(f * 0.1 + i) * 20;
          const w = Math.sin(f * 0.6 + i) * 14;
          return <path key={i} d={`M${bx - 24},${by + w} Q${bx - 10},${by - 4} ${bx},${by} Q${bx + 10},${by - 4} ${bx + 24},${by + w}`} stroke="#000" strokeWidth={5} fill="none" />;
        })}
      </Svg>
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: SERIF, fontSize: 64, color: '#2a0a08', opacity: interpolate(f, [10, 30], [0, 1], CL)}}>The Traveller of the Red Hills</div>
      <Tag n="G" label="SHADOW PUPPETS" />
    </>
  );
};

// H. Typographie animée
const H: React.FC = () => {
  const f = useCurrentFrame();
  const words: [string, string, number][] = [['YOU', '#fff', 0], ['SCROLL', '#ffd166', 14], ['FOR', '#fff', 26], ['3', '#e2574c', 36], ['HOURS', '#e2574c', 44], ['A', '#fff', 64], ['DAY.', '#5aa9ff', 72]];
  return (
    <>
      <Bg c="#111" />
      <div style={{position: 'absolute', left: 160, top: 180, display: 'flex', flexDirection: 'column', gap: 10}}>
        {[[0, 1, 2], [3, 4], [5, 6]].map((row, r) => (
          <div key={r} style={{display: 'flex', gap: 40, alignItems: 'baseline'}}>
            {row.map((i) => {
              const [w, c, at] = words[i];
              const s = useSp(at, 9);
              const big = w === '3' || w === 'HOURS';
              return <div key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: big ? 280 : 160, lineHeight: 1, color: c, opacity: f < at ? 0 : 1, transform: `scale(${f < at ? 0 : s}) rotate(${(1 - s) * (i % 2 ? 12 : -12)}deg)`, letterSpacing: -4}}>{w}</div>;
            })}
          </div>
        ))}
      </div>
      <Tag n="H" label="KINETIC TYPOGRAPHY" />
    </>
  );
};

// I. Trait unique
const I: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [5, T(3.8)], [1, 0], {...CL, easing: Easing.inOut(Easing.quad)});
  const d = 'M200,800 C400,800 420,600 560,600 C700,600 640,820 760,820 L760,520 L960,360 L1160,520 L1160,820 L1060,820 L1060,680 L980,680 L980,820 C1100,860 1240,700 1320,620 C1380,560 1460,560 1480,620 C1500,700 1400,740 1380,680 C1360,600 1480,480 1560,500 C1660,520 1640,800 1760,800';
  return (
    <>
      <Bg c="#f6f1e7" />
      <Svg>
        <path d={d} fill="none" stroke="#1d2b4f" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={p} />
        <text x={960} y={980} textAnchor="middle" fontFamily={SERIF} fontSize={44} fill="#1d2b4f" opacity={interpolate(f, [T(3.6), T(4.1)], [0, 1], CL)}>Home is one line away.</text>
      </Svg>
      <Tag n="I" label="ONE-LINE DRAWING" dark />
    </>
  );
};

// J. Frise documentaire (sépia)
const J: React.FC = () => {
  const f = useCurrentFrame();
  const pan = interpolate(f, [0, T(4.5)], [0, 1500], {...CL, easing: Easing.inOut(Easing.sin)});
  const ev: [string, string][] = [['1903', 'FIRST FLIGHT'], ['1927', 'ATLANTIC CROSSED'], ['1947', 'SOUND BARRIER'], ['1969', 'MOON LANDING'], ['1981', 'SPACE SHUTTLE']];
  return (
    <>
      <AbsoluteFill style={{background: '#2a2118'}} />
      <Svg>
        <g transform={`translate(${-pan} 0)`}>
          <line x1={0} x2={4000} y1={760} y2={760} stroke="#d9c39a" strokeWidth={4} />
          {ev.map(([y, n], i) => {
            const x = 500 + i * 600;
            return (
              <g key={y}>
                <rect x={x - 220} y={250} width={440} height={400} fill="#e9dcc0" />
                <rect x={x - 200} y={270} width={400} height={300} fill="#8a7458" />
                {i === 0 && <path d={`M${x - 150},420 L${x + 150},420 M${x - 60},380 L${x - 60},460 M${x + 60},380 L${x + 60},460`} stroke="#e9dcc0" strokeWidth={10} />}
                {i === 1 && <path d={`M${x - 160},430 L${x + 160},410 M${x - 20},360 L${x + 10},480 M${x + 130},400 l20,-30`} stroke="#e9dcc0" strokeWidth={10} />}
                {i === 2 && <path d={`M${x - 160},450 L${x + 120},390 L${x + 160},380 M${x - 40},400 L${x + 20},470`} stroke="#e9dcc0" strokeWidth={10} />}
                {i === 3 && <><circle cx={x} cy={420} r={100} fill="#d9c9a3" /><circle cx={x - 30} cy={400} r={18} fill="#b5a47f" /><circle cx={x + 40} cy={450} r={12} fill="#b5a47f" /></>}
                {i === 4 && <path d={`M${x - 30},520 L${x - 30},350 Q${x},300 ${x + 30},350 L${x + 30},520 Z`} fill="#e9dcc0" />}
                <text x={x} y={620} textAnchor="middle" fontFamily={TYPE} fontSize={30} fill="#3a2e22">{n}</text>
                <circle cx={x} cy={760} r={14} fill="#d9c39a" />
                <text x={x} y={840} textAnchor="middle" fontFamily={SERIF} fontSize={64} fill="#d9c39a">{y}</text>
              </g>
            );
          })}
        </g>
        {Array.from({length: 30}).map((_, i) => <rect key={i} x={rnd(i + f * 13) * 1920} y={0} width={1.5} height={1080} fill="#fff" opacity={rnd(i + f) > 0.92 ? 0.25 : 0} />)}
      </Svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.65) 100%)', mixBlendMode: 'multiply'}} />
      <Tag n="J" label="DOCUMENTARY TIMELINE (SEPIA)" />
    </>
  );
};

// K. Échelle (comparaison de tailles)
const KITEMS: [string, number, number, string][] = [['ANT', 0.005, 0.012, '#333'], ['HUMAN', 1.8, 0.5, '#e2574c'], ['GIRAFFE', 5.5, 2.5, '#e0a93a'], ['BLUE WHALE', 30, 30, '#3d5a80'], ['EIFFEL TOWER', 330, 125, '#6b4f3a'], ['BURJ KHALIFA', 828, 90, '#9aa5b5']];
const KX = KITEMS.reduce<number[]>((acc, it, i) => [...acc, i ? acc[i - 1] + KITEMS[i - 1][2] / 2 + it[2] / 2 + it[1] * 0.25 : 0], []);
const Kk: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [10, T(4.2)], [0, 5], {...CL, easing: Easing.inOut(Easing.cubic)});
  const i0 = Math.floor(Math.min(z, 4.999)), u = z - i0;
  const lh = Math.log(KITEMS[i0][1]) * (1 - u) + Math.log(KITEMS[i0 + 1][1]) * u;
  const scale = 520 / Math.exp(lh);
  const fx = KX[i0] * (1 - u) + KX[i0 + 1] * u;
  return (
    <>
      <Bg c="#cfe7f5" />
      <Svg>
        <rect x={0} y={900} width={1920} height={180} fill="#7fb069" />
        {KITEMS.map(([n, h, w, c], i) => {
          const cx = 960 + (KX[i] - fx) * scale, px = h * scale, pw = w * scale;
          if (cx + pw < -200 || cx - pw > 2200) return null;
          return (
            <g key={n}>
              {n === 'BLUE WHALE' ? <ellipse cx={cx} cy={900 - px * 0.15} rx={pw / 2} ry={px * 0.15} fill={c} /> :
                n === 'EIFFEL TOWER' ? <path d={`M${cx - pw / 2},900 L${cx},${900 - px} L${cx + pw / 2},900 Z`} fill={c} /> :
                <rect x={cx - pw / 2} y={900 - px} width={pw} height={px} rx={Math.min(pw, px) * 0.2} fill={c} />}
              {px > 30 && px < 1400 && <text x={cx} y={Math.max(70, 900 - (n === 'BLUE WHALE' ? px * 0.3 : px) - 24)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill="#1d2b4f">{n} · {h < 1 ? '5 MM' : `${h} M`}</text>}
            </g>
          );
        })}
      </Svg>
      <Tag n="K" label="SIZE SCALE COMPARISON" dark />
    </>
  );
};

// L. Pictogrammes en couleur (horreur en aplats colorés)
const Lc: React.FC = () => {
  const f = useCurrentFrame();
  const eyes = interpolate(f, [T(2), T(2.4)], [0, 1], CL);
  const blink = Math.floor(f / 40) % 4 === 3 ? 0.1 : 1;
  return (
    <>
      <AbsoluteFill style={{background: 'linear-gradient(#1b1440, #3b2a6b 60%, #5a3f7a)'}} />
      <Svg>
        <circle cx={1500} cy={220} r={90} fill="#f6e7a1" />
        {Array.from({length: 9}).map((_, i) => <path key={i} d={`M${100 + i * 200},900 l-90,0 l90,-${300 + rnd(i) * 200} l90,${300 + rnd(i) * 200} Z`} fill={i % 2 ? '#14102e' : '#1f1846'} />)}
        <rect x={0} y={880} width={1920} height={200} fill="#2a5a3e" />
        <g transform="translate(1180 880)">
          <rect x={-170} y={-240} width={340} height={240} fill="#e8b4b8" /><path d="M-200,-240 L0,-400 L200,-240 Z" fill="#b06f76" />
          <rect x={-120} y={-190} width={90} height={80} fill="#ffcf5a" /><rect x={30} y={-140} width={70} height={140} fill="#6b4f3a" />
        </g>
        <g transform={`translate(${interpolate(f, [0, T(4.5)], [700, 860])} 900)`}>
          <circle cy={-160} r={24} fill="#f6f1e7" /><rect x={-28} y={-132} width={56} height={80} rx={14} fill="#5aa9ff" /><rect x={-24} y={-56} width={20} height={56} rx={8} fill="#26334d" /><rect x={4} y={-56} width={20} height={56} rx={8} fill="#26334d" />
        </g>
        {[[260, 640], [420, 700], [560, 610]].map(([x, y], i) => <g key={i} opacity={eyes * blink}><ellipse cx={x - 14} cy={y} rx={9} ry={5} fill="#ff3b30" /><ellipse cx={x + 14} cy={y} rx={9} ry={5} fill="#ff3b30" /></g>)}
        <g transform={`translate(1500 600) scale(${useSp(T(3), 11)})`}>
          <rect x={-230} y={-90} width={460} height={180} rx={14} fill="#f6f1e7" />
          <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#e2574c">RULE 3</text>
          <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#1b1440">DON'T LOOK AT</text>
          <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#1b1440">THE TREES.</text>
        </g>
      </Svg>
      <Tag n="L" label="COLOUR PICTOGRAM HORROR" />
    </>
  );
};

const SCENES: Scene[] = [
  [PackTitle('PACK 10 · VISUAL STYLES', '12 MORE STYLES', '100% CODE · NO AI'), T(2.5)],
  [A, T(4.5)], [B, T(4.6)], [C, T(4.6)], [D, T(4.2)], [E, T(4.6)], [F, T(4.2)], [G, T(4.4)], [H, T(4)], [I, T(4.4)], [J, T(4.6)], [Kk, T(4.6)], [Lc, T(4.6)],
];
export const PACK10_FRAMES = total(SCENES);
export const PackTen: React.FC = () => <Pack1 scenes={SCENES} />;
void K;
