// Test : statistiques et machines « construites » dans le style n° 7 (horreur analogique).
// Univers original (Municipal Bureau of Night Conditions). Toutes les données sont fictives.
import React from 'react';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const FPS = 30;
const T = (s: number) => Math.round(s * FPS);
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FONT = '"Montserrat", "DejaVu Sans", sans-serif';
const MONO = '"DejaVu Sans Mono", monospace';
const W = '#f2f2f2';
const DIM = 'rgba(242,242,242,.35)';
const FAINT = 'rgba(242,242,242,.13)';
const RED = '#e5302a';
const WARM = '#ffcf5a';
const GLOW = 'drop-shadow(0 0 6px rgba(255,255,255,.55)) drop-shadow(0 0 18px rgba(255,255,255,.18))';
const RGLOW = 'drop-shadow(0 0 8px rgba(229,48,42,.9))';
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Scènes : [composant, durée]
type Sc = [React.FC, number, string];
let GLITCHES: number[] = [];

// ---------------------------------------------------------------------------
// VHS, aberration chromatique, bandeau
// ---------------------------------------------------------------------------
const glitchAt = (f: number) => (GLITCHES.some((g) => f >= g - 3 && f < g + 4) ? 1 : rnd(Math.floor(f / 2)) > 0.97 ? 0.35 : 0);

const VHS: React.FC = () => {
  const f = useCurrentFrame();
  const g = glitchAt(f);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0px, rgba(0,0,0,.28) 2px, transparent 2px, transparent 4px)'}} />
      <Img src={staticFile(`grain${(Math.floor(f / 2) % 8) + 1}.png`)} style={{position: 'absolute', width: '100%', height: '100%', opacity: 0.07, mixBlendMode: 'screen'}} />
      {Array.from({length: g > 0 ? 7 : 2}, (_, i) => {
        const y = rnd(f * 3 + i * 17) * 1080;
        const w = 200 + rnd(f + i) * 1400;
        return <div key={i} style={{position: 'absolute', left: rnd(f * 7 + i) * (1920 - w), top: y, width: w, height: 1 + rnd(i + f) * (g ? 5 : 2), background: 'rgba(255,255,255,.35)'}} />;
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.7) 100%)'}} />
    </AbsoluteFill>
  );
};

const Chroma: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const g = glitchAt(f);
  if (!g) return <AbsoluteFill>{children}</AbsoluteFill>;
  const off = g * 8;
  return (
    <AbsoluteFill style={{transform: `translateX(${(rnd(f) - 0.5) * 30 * g}px)`}}>
      <AbsoluteFill style={{transform: `translateX(${-off}px)`, mixBlendMode: 'screen', filter: 'sepia(1) saturate(8) hue-rotate(-50deg)', opacity: 0.7}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${off}px)`, mixBlendMode: 'screen', filter: 'sepia(1) saturate(8) hue-rotate(140deg)', opacity: 0.7}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{mixBlendMode: 'screen'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const HUD: React.FC = () => {
  const f = useCurrentFrame();
  const s = Math.floor(f / FPS);
  const tc = `00:00:${String(s).padStart(2, '0')}:${String(f % FPS).padStart(2, '0')}`;
  return (
    <div style={{position: 'absolute', top: 26, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 18, color: 'rgba(242,242,242,.55)', letterSpacing: 2}}>
      <div>MBNC · STATISTICAL BULLETIN 07</div>
      <div>
        <span style={{color: RED, opacity: Math.floor(f / 15) % 2 ? 1 : 0.2}}>●</span> REC {tc}
      </div>
    </div>
  );
};

// Titre de figure + sous-titre
const Fig: React.FC<{n: string; title: string; cap?: string}> = ({n, title, cap}) => {
  const f = useCurrentFrame();
  const typed = title.slice(0, Math.floor(f / 1.2));
  return (
    <>
      <div style={{position: 'absolute', left: 80, top: 90, fontFamily: MONO, color: W, filter: GLOW}}>
        <div style={{fontSize: 20, letterSpacing: 4, color: DIM}}>{n}</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 46, letterSpacing: 3, marginTop: 6}}>
          {typed}
          <span style={{opacity: Math.floor(f / 8) % 2}}>▌</span>
        </div>
      </div>
      {cap && (
        <div style={{position: 'absolute', bottom: 56, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: W,
          textShadow: '0 0 10px rgba(255,255,255,.35)', opacity: interpolate(f, [12, 22], [0, 1], CL)}}>{cap}</div>
      )}
    </>
  );
};

const Svg: React.FC<{children: React.ReactNode; glow?: boolean}> = ({children, glow = true}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', filter: glow ? GLOW : undefined}}>{children}</svg>
);
const Txt: React.FC<{x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; children: React.ReactNode; o?: number; mono?: boolean}> = ({x, y, s = 22, c = W, a = 'start', children, o = 1, mono = true}) => (
  <text x={x} y={y} fontSize={s} fill={c} textAnchor={a} opacity={o} fontFamily={mono ? MONO : FONT} fontWeight={mono ? 400 : 900} letterSpacing={2}>{children}</text>
);

const House: React.FC<{x: number; y: number; s?: number; lit?: number}> = ({x, y, s = 1, lit = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-170,0 L-170,-200 L0,-320 L170,-200 L170,0 Z" stroke={W} strokeWidth={10} fill="#0a0a0a" strokeLinejoin="round" />
    <rect x={-110} y={-170} width={80} height={70} fill={WARM} opacity={lit} />
  </g>
);

// ---------------------------------------------------------------------------
// 0. Titre
// ---------------------------------------------------------------------------
const S0: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily: MONO, color: W, filter: GLOW, textAlign: 'center'}}>
      <div style={{fontSize: 24, letterSpacing: 8, color: DIM}}>MUNICIPAL BUREAU OF NIGHT CONDITIONS</div>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, letterSpacing: 6, marginTop: 20, opacity: interpolate(f, [8, 14], [0, 1], CL)}}>
        THE VOICE IN THE TREES
      </div>
      <div style={{fontSize: 30, letterSpacing: 6, marginTop: 18, color: RED, filter: RGLOW, opacity: interpolate(f, [24, 30], [0, 1], CL)}}>STATISTICAL BULLETIN 07 · FOR PUBLIC USE</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 1. MACHINE : sismographe (le stylet trace l'activité sur le papier qui défile)
// ---------------------------------------------------------------------------
const SPIKE = T(3.1);
const sig = (t: number) => {
  const base = Math.sin(t * 1.3) * 10 + Math.sin(t * 3.7) * 6 + (rnd(Math.floor(t)) - 0.5) * 14;
  const k = Math.exp(-Math.pow((t - SPIKE) / 9, 2));
  return base * (1 + k * 14) + k * Math.sin(t * 2.3) * 60;
};
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const PEN = 1340, SPD = 7, CY = 560;
  const pts: string[] = [];
  const red: string[] = [];
  for (let x = 120; x <= PEN; x += 3) {
    const t = f - (PEN - x) / SPD;
    if (t < 0) continue;
    const p = `${x},${(CY - sig(t)).toFixed(1)}`;
    pts.push(p);
    if (Math.abs(t - SPIKE) < 22) red.push(p);
  }
  const penY = CY - sig(f);
  const shift = (f * SPD) % 60;
  const hit = f > SPIKE;
  return (
    <>
      <Svg>
        {/* Papier quadrillé qui défile */}
        <rect x={100} y={330} width={1260} height={460} fill="none" stroke={DIM} strokeWidth={2} />
        {Array.from({length: 23}).map((_, i) => {
          const x = 100 + ((i * 60 + 60 - shift) % 1260);
          return <line key={i} x1={x} x2={x} y1={330} y2={790} stroke={FAINT} strokeWidth={1.5} />;
        })}
        {[400, 480, 560, 640, 720].map((y) => <line key={y} x1={100} x2={1360} y1={y} y2={y} stroke={FAINT} strokeWidth={1.5} />)}
        <polyline points={pts.join(' ')} fill="none" stroke={W} strokeWidth={3} />
        {red.length > 1 && <polyline points={red.join(' ')} fill="none" stroke={RED} strokeWidth={4} style={{filter: RGLOW}} />}
        {/* Boîtier, tambour, bras */}
        <rect x={1360} y={300} width={420} height={520} rx={16} fill="#0a0a0a" stroke={W} strokeWidth={4} />
        <g transform={`translate(1460 560) rotate(${-f * 6})`}>
          <circle r={70} fill="none" stroke={W} strokeWidth={4} />
          {Array.from({length: 8}).map((_, i) => <line key={i} x1={0} y1={0} x2={70 * Math.cos(i * 0.785)} y2={70 * Math.sin(i * 0.785)} stroke={DIM} strokeWidth={3} />)}
        </g>
        <line x1={1680} y1={560} x2={PEN} y2={penY} stroke={W} strokeWidth={5} strokeLinecap="round" />
        <circle cx={1680} cy={560} r={16} fill={W} />
        <circle cx={PEN} cy={penY} r={8} fill={hit && f < SPIKE + 25 ? RED : W} />
        <Txt x={1570} y={740} a="middle" s={20} c={DIM}>SENSOR 4 · TREE LINE</Txt>
        <rect x={1640} y={340} width={110} height={36} fill="none" stroke={hit ? RED : DIM} strokeWidth={2} />
        <Txt x={1695} y={365} a="middle" s={20} c={hit ? RED : DIM}>{hit ? 'ALERT' : 'IDLE'}</Txt>
        {hit && (
          <g opacity={interpolate(f, [SPIKE + 3, SPIKE + 10], [0, 1], CL)} style={{filter: RGLOW}}>
            <line x1={PEN - (f - SPIKE) * SPD} x2={PEN - (f - SPIKE) * SPD} y1={300} y2={330} stroke={RED} strokeWidth={3} />
            <Txt x={PEN - (f - SPIKE) * SPD} y={290} a="middle" c={RED} s={24}>03:07 AM · ANOMALY</Txt>
          </g>
        )}
      </Svg>
      <Fig n="FIG. 1 · BUILT: SEISMOGRAPH" title="ACTIVITY AT THE TREE LINE" cap="EVERY NIGHT, THE SENSORS ARE QUIET. EXCEPT AT 3:07." />
    </>
  );
};

// ---------------------------------------------------------------------------
// 2. Horloge polaire (histogramme circulaire sur 24 h)
// ---------------------------------------------------------------------------
const HOURS = [4, 3, 9, 41, 12, 5, 2, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 2, 2, 3, 4, 5, 6, 5];
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cx = 960, cy = 590, r0 = 120;
  const hand = interpolate(f, [10, T(3)], [0, 3 + 7 / 60], {...CL, easing: Easing.inOut(Easing.cubic)});
  return (
    <>
      <Svg>
        {[1, 2, 3].map((k) => <circle key={k} cx={cx} cy={cy} r={r0 + k * 90} fill="none" stroke={FAINT} strokeWidth={1.5} strokeDasharray="4 8" />)}
        <circle cx={cx} cy={cy} r={r0} fill="none" stroke={W} strokeWidth={3} />
        {HOURS.map((v, i) => {
          const g = spring({frame: f - 8 - i * 2, fps, config: {damping: 14}});
          const a = (i / 24) * Math.PI * 2 - Math.PI / 2 + Math.PI / 24;
          const len = 8 + v * 5.2 * g;
          const c = i === 3 ? RED : W;
          return <line key={i} x1={cx + Math.cos(a) * (r0 + 12)} y1={cy + Math.sin(a) * (r0 + 12)} x2={cx + Math.cos(a) * (r0 + 12 + len)} y2={cy + Math.sin(a) * (r0 + 12 + len)}
            stroke={c} strokeWidth={22} style={i === 3 ? {filter: RGLOW} : undefined} />;
        })}
        {['00', '06', '12', '18'].map((h, i) => {
          const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
          return <Txt key={h} x={cx + Math.cos(a) * 92} y={cy + Math.sin(a) * 92 + 8} a="middle" c={DIM}>{h}</Txt>;
        })}
        <line x1={cx} y1={cy} x2={cx + Math.cos((hand / 24) * Math.PI * 2 - Math.PI / 2) * 70} y2={cy + Math.sin((hand / 24) * Math.PI * 2 - Math.PI / 2) * 70} stroke={RED} strokeWidth={5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={8} fill={RED} />
        <g opacity={interpolate(f, [T(2.6), T(3)], [0, 1], CL)}>
          <line x1={cx + Math.cos(-Math.PI / 2 + (3.5 / 24) * Math.PI * 2) * (r0 + 240)} y1={cy + Math.sin(-Math.PI / 2 + (3.5 / 24) * Math.PI * 2) * (r0 + 240)} x2={1380} y2={230} stroke={RED} strokeWidth={2} />
          <Txt x={1390} y={225} c={RED} s={34} mono={false}>41 CALLS</Txt>
          <Txt x={1390} y={262} c={DIM} s={20}>BETWEEN 03:00 AND 04:00</Txt>
        </g>
      </Svg>
      <Fig n="FIG. 2 · POLAR CLOCK CHART" title="WHEN IT CALLS" cap="MOST CALLS HAPPEN BETWEEN THREE AND FOUR IN THE MORNING." />
    </>
  );
};

// ---------------------------------------------------------------------------
// 3. Radar (toile d'araignée) : profil de l'entité
// ---------------------------------------------------------------------------
const AX: [string, number][] = [['MIMICRY', 0.96], ['PATIENCE', 0.9], ['PROXIMITY', 0.68], ['HUNGER', 0.8], ['SPEED', 0.3], ['VISIBILITY', 0.04]];
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cx = 960, cy = 560, R = 290;
  const g = spring({frame: f - 15, fps, config: {damping: 9, mass: 1.3}});
  const pt = (i: number, k: number) => {
    const a = (i / AX.length) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * k];
  };
  const poly = AX.map(([, v], i) => pt(i, v * g).join(',')).join(' ');
  return (
    <>
      <Svg>
        {[0.25, 0.5, 0.75, 1].map((k) => <polygon key={k} points={AX.map((_, i) => pt(i, k).join(',')).join(' ')} fill="none" stroke={k === 1 ? DIM : FAINT} strokeWidth={2} />)}
        {AX.map((_, i) => <line key={i} x1={cx} y1={cy} x2={pt(i, 1)[0]} y2={pt(i, 1)[1]} stroke={FAINT} strokeWidth={2} />)}
        <polygon points={poly} fill={RED} fillOpacity={0.22} stroke={RED} strokeWidth={4} style={{filter: RGLOW}} />
        {AX.map(([n, v], i) => {
          const [x, y] = pt(i, 1.2);
          const [px, py] = pt(i, v * g);
          return (
            <g key={n}>
              <circle cx={px} cy={py} r={7} fill={W} />
              <Txt x={x} y={y} a="middle" s={24}>{n}</Txt>
              <Txt x={x} y={y + 30} a="middle" s={22} c={v > 0.6 ? RED : DIM} o={interpolate(f, [30, 40], [0, 1], CL)}>{Math.round(v * 100 * g)}%</Txt>
            </g>
          );
        })}
      </Svg>
      <Fig n="FIG. 3 · RADAR CHART" title="ENTITY PROFILE" cap="IT IS VERY GOOD AT SOUNDING LIKE SOMEONE YOU LOVE." />
    </>
  );
};

// ---------------------------------------------------------------------------
// 4. Calendrier en carte de chaleur
// ---------------------------------------------------------------------------
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const x0 = 560, y0 = 290, C = 112;
  return (
    <>
      <Svg>
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => <Txt key={d} x={x0 + i * C + C / 2 - 6} y={y0 - 16} a="middle" c={DIM} s={18}>{d}</Txt>)}
        {Array.from({length: 31}).map((_, d) => {
          const i = d + 2; // le mois commence un mercredi
          const x = x0 + (i % 7) * C, y = y0 + Math.floor(i / 7) * C;
          const full = d === 12 || d === 26;
          const v = full ? 1 : 0.08 + rnd(d + 3) * 0.45;
          const on = interpolate(f, [10 + d * 2.2, 16 + d * 2.2], [0, 1], CL);
          return (
            <g key={d}>
              <rect x={x} y={y} width={C - 12} height={C - 12} fill={full ? RED : W} fillOpacity={v * on * (full ? 0.85 : 0.75)} stroke={full ? RED : DIM} strokeWidth={2}
                style={full && on > 0.5 ? {filter: RGLOW} : undefined} />
              <Txt x={x + 10} y={y + 26} s={18} c={full ? W : v > 0.4 ? '#0a0a0a' : DIM}>{d + 1}</Txt>
              {full && <circle cx={x + C - 34} cy={y + C - 34} r={13} fill="none" stroke={W} strokeWidth={3} opacity={on} />}
            </g>
          );
        })}
        <Txt x={1380} y={420} s={20} c={DIM}>REPORTED CALLS</Txt>
        <defs>
          <linearGradient id="hg" x1="0" x2="1"><stop offset="0" stopColor={W} stopOpacity={0.05} /><stop offset="1" stopColor={W} stopOpacity={0.8} /></linearGradient>
        </defs>
        <rect x={1380} y={440} width={240} height={24} fill="url(#hg)" stroke={DIM} />
        <Txt x={1380} y={490} s={18} c={DIM}>FEW</Txt>
        <Txt x={1620} y={490} s={18} c={DIM} a="end">MANY</Txt>
        <rect x={1380} y={530} width={24} height={24} fill={RED} />
        <Txt x={1416} y={550} s={18} c={RED}>FULL MOON</Txt>
      </Svg>
      <Fig n="FIG. 4 · HEATMAP CALENDAR" title="OCTOBER" cap="ON NIGHTS WITH A FULL MOON, THE NUMBER OF CALLS TRIPLES." />
    </>
  );
};

// ---------------------------------------------------------------------------
// 5. Diagramme de flux (Sankey)
// ---------------------------------------------------------------------------
const band = (xa: number, a1: number, a2: number, xb: number, b1: number, b2: number) => {
  const xm = (xa + xb) / 2;
  return `M${xa},${a1} C${xm},${a1} ${xm},${b1} ${xb},${b1} L${xb},${b2} C${xm},${b2} ${xm},${a2} ${xa},${a2} Z`;
};
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const rev = interpolate(f, [12, T(4.2)], [260, 1700], {...CL, easing: Easing.inOut(Easing.quad)});
  const X0 = 320, X1 = 900, X2 = 1460, NW = 22;
  const nodes: [number, number, number, string, string, boolean][] = [
    [X0, 250, 850, 'HEARD THEIR NAME', '100', false],
    [X1, 220, 646, 'DID NOT ANSWER', '71', false],
    [X1, 700, 874, 'ANSWERED', '29', true],
    [X2, 560, 668, 'CAME BACK', '18', false],
    [X2, 720, 768, 'CAME BACK… DIFFERENT', '8', true],
    [X2, 820, 838, 'NEVER CAME BACK', '3', true],
  ];
  return (
    <>
      <Svg glow={false}>
        <defs><clipPath id="rev"><rect x={0} y={0} width={rev} height={1080} /></clipPath></defs>
        <g clipPath="url(#rev)">
          <path d={band(X0 + NW, 250, 676, X1, 220, 646)} fill={W} opacity={0.22} />
          <path d={band(X0 + NW, 676, 850, X1, 700, 874)} fill={RED} opacity={0.35} />
          <path d={band(X1 + NW, 700, 808, X2, 560, 668)} fill={W} opacity={0.22} />
          <path d={band(X1 + NW, 808, 856, X2, 720, 768)} fill={RED} opacity={0.45} />
          <path d={band(X1 + NW, 856, 874, X2, 820, 838)} fill={RED} opacity={0.6} />
          {nodes.map(([x, a, b, n, v, r]) => (
            <g key={n} style={{filter: r ? RGLOW : GLOW}}>
              <rect x={x} y={a} width={NW} height={b - a} fill={r ? RED : W} />
              <Txt x={x + (x === X0 ? -16 : NW + 16)} y={(a + b) / 2 - 4} a={x === X0 ? 'end' : 'start'} s={x === X0 ? 54 : 34} c={r ? RED : W} mono={false}>{v}</Txt>
              <Txt x={x + (x === X0 ? -16 : NW + 16)} y={(a + b) / 2 + 26} a={x === X0 ? 'end' : 'start'} s={19} c={r ? RED : DIM}>{n}</Txt>
            </g>
          ))}
        </g>
      </Svg>
      <Fig n="FIG. 5 · FLOW DIAGRAM (SANKEY)" title="WHAT HAPPENS IF YOU ANSWER" cap="OF THE 29 WHO ANSWERED, 11 DID NOT COME BACK THE SAME." />
    </>
  );
};

// ---------------------------------------------------------------------------
// 6. MACHINE : écran radar avec balayage
// ---------------------------------------------------------------------------
const BLIP_A = -50; // degrés
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const cx = 960, cy = 560, R = 340;
  const sweep = f * 6 - 90;
  const passed = Math.floor((sweep - BLIP_A + 360) / 360);
  const since = ((((sweep - BLIP_A) % 360) + 360) % 360) / 6;
  const dist = Math.max(70, 340 - passed * 75);
  const bright = passed > 0 ? Math.exp(-since / 22) : 0;
  const bx = cx + Math.cos((BLIP_A * Math.PI) / 180) * dist;
  const by = cy + Math.sin((BLIP_A * Math.PI) / 180) * dist;
  const meters = Math.round((dist / 340) * 160);
  return (
    <>
      <Svg>
        <circle cx={cx} cy={cy} r={R + 30} fill="#0a0a0a" stroke={W} strokeWidth={5} />
        {[1, 2, 3, 4].map((k) => <circle key={k} cx={cx} cy={cy} r={(R * k) / 4} fill="none" stroke={FAINT} strokeWidth={2} />)}
        <line x1={cx - R} x2={cx + R} y1={cy} y2={cy} stroke={FAINT} strokeWidth={2} />
        <line x1={cx} x2={cx} y1={cy - R} y2={cy + R} stroke={FAINT} strokeWidth={2} />
        {Array.from({length: 24}).map((_, i) => (
          <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(((sweep - i * 1.6) * Math.PI) / 180) * R} y2={cy + Math.sin(((sweep - i * 1.6) * Math.PI) / 180) * R}
            stroke={W} strokeWidth={i === 0 ? 4 : 6} opacity={i === 0 ? 1 : 0.18 * (1 - i / 24)} />
        ))}
        {/* parasites fixes */}
        {Array.from({length: 7}).map((_, i) => {
          const a = rnd(i + 2) * 360, d = 120 + rnd(i + 9) * 240;
          const s = ((((sweep - a) % 360) + 360) % 360) / 6;
          return <circle key={i} cx={cx + Math.cos((a * Math.PI) / 180) * d} cy={cy + Math.sin((a * Math.PI) / 180) * d} r={5} fill={W} opacity={0.6 * Math.exp(-s / 15)} />;
        })}
        <circle cx={bx} cy={by} r={14} fill={RED} opacity={bright} style={{filter: RGLOW}} />
        <circle cx={bx} cy={by} r={14 + (1 - bright) * 40} fill="none" stroke={RED} strokeWidth={2} opacity={bright * 0.8} />
        <House x={cx} y={cy + 22} s={0.13} />
        <g transform="translate(1440 380)">
          <Txt x={0} y={0} s={20} c={DIM}>CONTACT 01</Txt>
          <Txt x={0} y={60} s={56} c={RED} mono={false}>{passed > 0 ? `${meters} M` : '—'}</Txt>
          <Txt x={0} y={100} s={20} c={DIM}>FROM YOUR HOUSE</Txt>
          <Txt x={0} y={170} s={20} c={DIM}>STATUS</Txt>
          <Txt x={0} y={204} s={26} c={passed >= 3 ? RED : W}>{passed >= 3 ? 'APPROACHING' : 'STATIONARY'}</Txt>
        </g>
      </Svg>
      <Fig n="FIG. 6 · BUILT: RADAR SCREEN" title="IT DOES NOT MOVE WHILE YOU LOOK" cap="EACH TIME THE SWEEP PASSES, IT IS A LITTLE CLOSER." />
    </>
  );
};

// ---------------------------------------------------------------------------
// 7. Nuage de points + tendance
// ---------------------------------------------------------------------------
const PTS = Array.from({length: 54}, (_, i) => {
  const x = rnd(i + 100) * 470 + 10;
  const y = Math.max(0.5, 38 * Math.exp(-x / 110) + (rnd(i + 200) - 0.5) * 7);
  return [x, y];
});
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const X = (v: number) => 320 + (v / 500) * 1240;
  const Y = (v: number) => 880 - (v / 45) * 540;
  const tp = interpolate(f, [T(2.4), T(3.6)], [0, 1], CL);
  const trend = Array.from({length: 51}, (_, i) => i * 10).filter((x) => x / 500 <= tp).map((x) => `${X(x)},${Y(38 * Math.exp(-x / 110))}`).join(' ');
  const out = spring({frame: f - T(3.6), fps, config: {damping: 9}});
  return (
    <>
      <Svg>
        <line x1={320} x2={1580} y1={880} y2={880} stroke={W} strokeWidth={3} />
        <line x1={320} x2={320} y1={320} y2={880} stroke={W} strokeWidth={3} />
        {[0, 100, 200, 300, 400, 500].map((v) => <Txt key={v} x={X(v)} y={916} a="middle" s={18} c={DIM}>{v}</Txt>)}
        {[0, 15, 30, 45].map((v) => <Txt key={v} x={300} y={Y(v) + 6} a="end" s={18} c={DIM}>{v}</Txt>)}
        <Txt x={950} y={956} a="middle" s={18} c={DIM}>DISTANCE FROM THE TREE LINE (M)</Txt>
        <Txt x={340} y={316} s={18} c={DIM}>CALLS PER YEAR</Txt>
        {PTS.map(([x, y], i) => {
          const s = spring({frame: f - 6 - i * 1.1, fps, config: {damping: 12}});
          return <circle key={i} cx={X(x)} cy={Y(y)} r={8 * s} fill={W} />;
        })}
        <polyline points={trend} fill="none" stroke={W} strokeWidth={3} strokeDasharray="12 10" opacity={0.7} />
        <g style={{filter: RGLOW}} opacity={out}>
          <circle cx={X(470)} cy={Y(36)} r={10} fill={RED} />
          <circle cx={X(470)} cy={Y(36)} r={34 * out} fill="none" stroke={RED} strokeWidth={3} />
          <line x1={X(470) - 34} y1={Y(36)} x2={X(380)} y2={Y(36)} stroke={RED} strokeWidth={2} />
          <Txt x={X(375)} y={Y(36) - 6} a="end" c={RED} s={26}>HOUSE 14</Txt>
          <Txt x={X(375)} y={Y(36) + 26} a="end" c={RED} s={18}>480 M AWAY · 36 CALLS</Txt>
        </g>
      </Svg>
      <Fig n="FIG. 7 · SCATTER PLOT" title="DISTANCE VS. CALLS" cap="THE FURTHER FROM THE TREES, THE SAFER. WITH ONE EXCEPTION." />
    </>
  );
};

// ---------------------------------------------------------------------------
// 8. MACHINE : magnétophone à bandes (pièce à conviction audio)
// ---------------------------------------------------------------------------
const Reel: React.FC<{x: number; y: number; r: number; a: number}> = ({x, y, r, a}) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <circle r={r} fill="#0a0a0a" stroke={W} strokeWidth={4} />
    <circle r={r * 0.62} fill="none" stroke={DIM} strokeWidth={r * 0.35} />
    {[0, 120, 240].map((d) => (
      <circle key={d} cx={Math.cos((d * Math.PI) / 180) * r * 0.5} cy={Math.sin((d * Math.PI) / 180) * r * 0.5} r={r * 0.2} fill="#0a0a0a" stroke={W} strokeWidth={3} />
    ))}
    <circle r={r * 0.12} fill={W} />
  </g>
);
const VOICE = T(2.4);
const lvl = (t: number) => {
  const v = Math.exp(-Math.pow((t - VOICE - 20) / 14, 2));
  return 0.12 + rnd(Math.floor(t)) * 0.18 + v * (0.6 + rnd(Math.floor(t) + 9) * 0.3);
};
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const l = lvl(f);
  const needle = -60 + l * 115;
  const loud = l > 0.6;
  return (
    <>
      <Svg>
        <rect x={360} y={250} width={1200} height={620} rx={22} fill="#0a0a0a" stroke={W} strokeWidth={4} />
        <Reel x={620} y={450} r={150} a={f * 5} />
        <Reel x={1300} y={450} r={150} a={f * 5} />
        <path d="M620,600 L760,640 L960,640 L1160,640 L1300,600" fill="none" stroke={DIM} strokeWidth={4} />
        <rect x={900} y={622} width={120} height={36} fill="#0a0a0a" stroke={W} strokeWidth={3} />
        {/* Vu-mètre */}
        <g transform="translate(960 790)">
          <path d="M-120,0 A120,120 0 0 1 120,0" fill="none" stroke={DIM} strokeWidth={3} />
          <path d="M60,-104 A120,120 0 0 1 120,0" fill="none" stroke={RED} strokeWidth={6} />
          <line x1={0} y1={0} x2={Math.sin((needle * Math.PI) / 180) * 110} y2={-Math.cos((needle * Math.PI) / 180) * 110} stroke={loud ? RED : W} strokeWidth={4} />
          <circle r={8} fill={W} />
          <Txt x={-150} y={0} a="end" s={18} c={DIM}>VU</Txt>
        </g>
        <Txt x={400} y={300} s={20} c={DIM}>EXHIBIT C · TAPE 14 · 03:07 AM</Txt>
        {/* Forme d'onde défilante */}
        {Array.from({length: 70}).map((_, i) => {
          const h = lvl(f - (69 - i)) * 120;
          const red = lvl(f - (69 - i)) > 0.6;
          return <rect key={i} x={400 + i * 16.5} y={960 - h / 2} width={9} height={h} fill={red ? RED : W} opacity={0.35 + (i / 70) * 0.65} />;
        })}
      </Svg>
      <Fig n="FIG. 8 · BUILT: TAPE RECORDER" title="AUDIO EVIDENCE" cap={f > VOICE + 8 ? '“ … COME OUTSIDE. IT\'S ME. ”' : '[ WIND ] [ BRANCHES ]'} />
    </>
  );
};

// ---------------------------------------------------------------------------
// 9. Fin
// ---------------------------------------------------------------------------
const S9: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - 4, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: W}}>
      <div style={{border: `4px solid ${RED}`, padding: '26px 70px', transform: `scale(${s})`, filter: RGLOW}}>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 8, color: RED}}>RULE 1</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 110, letterSpacing: 6, color: W}}>DO NOT ANSWER.</div>
      </div>
      <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: DIM, marginTop: 40, opacity: interpolate(f, [40, 50], [0, 1], CL)}}>END OF BULLETIN · ALL DATA FICTIONAL</div>
    </AbsoluteFill>
  );
};

const SCENES: [React.FC, number][] = [
  [S0, T(2.6)], [S1, T(5.5)], [S2, T(5)], [S3, T(5)], [S4, T(5)], [S5, T(6)], [S6, T(7)], [S7, T(5.5)], [S8, T(6)], [S9, T(3.4)],
];
const STARTS = SCENES.reduce<number[]>((a, [, d], i) => [...a, i ? a[i - 1] + SCENES[i - 1][1] : 0], []);
GLITCHES = STARTS.slice(1);
export const DATA_RULES_FRAMES = SCENES.reduce((a, [, d]) => a + d, 0);

export const DataRules: React.FC = () => (
  <AbsoluteFill style={{background: '#0a0a0a'}}>
    <Audio src={staticFile('rules/hiss.wav')} volume={0.35} loop />
    <Audio src={staticFile('rules/low.wav')} volume={0.7} />
    {STARTS.slice(1).map((s) => (
      <Sequence key={s} from={s - 3} durationInFrames={10}><Audio src={staticFile('rules/glitch.wav')} volume={0.6} /></Sequence>
    ))}
    <Sequence from={STARTS[1]} durationInFrames={SCENES[1][1]}><Audio src={staticFile('rules/scratch.wav')} volume={0.25} /></Sequence>
    <Sequence from={STARTS[1] + SPIKE} durationInFrames={10}><Audio src={staticFile('rules/beep.wav')} volume={0.7} /></Sequence>
    {Array.from({length: 4}).map((_, k) => {
      // ping quand le balayage passe sur le contact (tous les 60 images à partir de l'angle du contact)
      const first = Math.round((BLIP_A + 90 + 360) / 6) % 60;
      return (
        <Sequence key={k} from={STARTS[6] + first + k * 60} durationInFrames={36}><Audio src={staticFile('rules/ping.wav')} volume={0.55} /></Sequence>
      );
    })}
    {Array.from({length: 6}).map((_, k) => (
      <Sequence key={k} from={STARTS[6] + T(2.6) + k * 20} durationInFrames={24}><Audio src={staticFile('heartbeat.wav')} volume={0.5} /></Sequence>
    ))}
    <Sequence from={STARTS[9]} durationInFrames={20}><Audio src={staticFile('rules/door.wav')} volume={0.6} /></Sequence>
    <Chroma>
      {SCENES.map(([C, d], i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={d}><C /></Sequence>
      ))}
    </Chroma>
    <HUD />
    <VHS />
  </AbsoluteFill>
);
