// Kit « motion design 2D plat » (style explications : formes plates, silhouettes en couches,
// une seule couleur d'accent, titres en majuscules, légendes fines, caméra lente).
import React from 'react';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

export const FPS = 30;
export const T = (sec: number) => Math.round(sec * FPS);
export const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const FONT = '"Montserrat", "DejaVu Sans", sans-serif';

export const K = {
  accent: '#ff8a3d',
  accent2: '#ffd166',
  red: '#e5484d',
  white: '#f4f1ea',
  dim: '#a7b0bd',
  skin: ['#f1c7a0', '#d9a77f', '#a8714f', '#7a4e33'],
  shirts: ['#e07a5f', '#3d5a80', '#81b29a', '#f2cc8f', '#9c6b98', '#5c946e', '#c06c84'],
};

// ---------------------------------------------------------------------------
// Caméra : zoom et déplacement lents
// ---------------------------------------------------------------------------
export const Camera: React.FC<{children: React.ReactNode; from?: number; to?: number; panX?: number; panY?: number; dur: number}> = ({
  children,
  from = 1,
  to = 1.08,
  panX = 0,
  panY = 0,
  dur,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, dur], [0, 1], {...CL, easing: Easing.inOut(Easing.sin)});
  return (
    <AbsoluteFill style={{transform: `scale(${from + (to - from) * p}) translate(${panX * p}px, ${panY * p}px)`}}>{children}</AbsoluteFill>
  );
};

// Fondu d'entrée et de sortie d'une scène
export const SceneFade: React.FC<{children: React.ReactNode; dur: number; inF?: number; outF?: number}> = ({children, dur, inF = 12, outF = 12}) => {
  const frame = useCurrentFrame();
  const o = Math.min(interpolate(frame, [0, inF], [0, 1], CL), interpolate(frame, [dur - outF, dur], [1, 0], CL));
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

// ---------------------------------------------------------------------------
// Fonds : dégradé de ciel + silhouettes en couches (parallaxe)
// ---------------------------------------------------------------------------
export const Sky: React.FC<{top: string; mid: string; bottom: string; sun?: {x: number; y: number; r: number; color: string}}> = ({top, mid, bottom, sun}) => (
  <AbsoluteFill style={{background: `linear-gradient(${top} 0%, ${mid} 55%, ${bottom} 100%)`}}>
    {sun && (
      <div
        style={{
          position: 'absolute',
          left: sun.x - sun.r * 4,
          top: sun.y - sun.r * 4,
          width: sun.r * 8,
          height: sun.r * 8,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${sun.color} 0%, ${sun.color}55 12%, rgba(0,0,0,0) 60%)`,
        }}
      />
    )}
  </AbsoluteFill>
);

// Ligne de collines générée (somme de sinus), remplie jusqu'en bas
export const hills = (baseY: number, amp: number, seed: number, w = 2600) => {
  const pts: string[] = [];
  for (let x = -200; x <= w; x += 40) {
    const y = baseY + Math.sin(x / 210 + seed) * amp + Math.sin(x / 83 + seed * 3) * amp * 0.35;
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M-200,1300 L${pts.join(' L')} L${w},1300 Z`;
};

export const Layer: React.FC<{d: string; color: string; speed: number; children?: React.ReactNode}> = ({d, color, speed, children}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', overflow: 'visible'}}>
      <g transform={`translate(${-frame * speed}, 0)`}>
        <path d={d} fill={color} />
        {children}
      </g>
    </svg>
  );
};

// Silhouette d'arbre (feuillu rond ou conifère)
export const Tree: React.FC<{x: number; y: number; h: number; color: string; kind?: 'round' | 'pine' | 'palm'}> = ({x, y, h, color, kind = 'round'}) => {
  if (kind === 'pine')
    return <polygon points={`${x},${y - h} ${x + h * 0.28},${y} ${x - h * 0.28},${y}`} fill={color} />;
  if (kind === 'palm')
    return (
      <g fill={color}>
        <rect x={x - 5} y={y - h} width={10} height={h} />
        {[-60, -25, 15, 50].map((a) => (
          <ellipse key={a} cx={x + Math.sin((a * Math.PI) / 180) * h * 0.25} cy={y - h + 6} rx={h * 0.26} ry={h * 0.06} transform={`rotate(${a} ${x} ${y - h})`} />
        ))}
      </g>
    );
  return (
    <g fill={color}>
      <rect x={x - 6} y={y - h * 0.45} width={12} height={h * 0.45} />
      <circle cx={x} cy={y - h * 0.62} r={h * 0.3} />
    </g>
  );
};

// Poussière ou lucioles qui flottent
export const Motes: React.FC<{n?: number; color?: string; glow?: boolean; seed?: number}> = ({n = 40, color = '#ffffff', glow, seed = 1}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      {Array.from({length: n}, (_, i) => {
        const x = ((i * 397 + seed * 113) % 1920) + Math.sin((frame + i * 37) / 70) * 25;
        const y = ((i * 211 + seed * 71) % 1080) + Math.cos((frame + i * 19) / 90) * 18 - ((frame * (0.15 + (i % 4) * 0.08)) % 60);
        const tw = glow ? 0.4 + 0.6 * Math.abs(Math.sin((frame + i * 23) / 25)) : 1;
        return <circle key={i} cx={x} cy={y} r={1.5 + (i % 3)} fill={color} opacity={(0.12 + (i % 5) * 0.05) * tw * (glow ? 3 : 1)} />;
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Personnage plat (petit, à la Disasters Explained), avec cycle de marche
// ---------------------------------------------------------------------------
export const Person: React.FC<{x: number; y: number; h?: number; shirt: string; skin: string; pants?: string; walk?: number; dir?: 1 | -1; hair?: string; seed?: number}> = ({
  x,
  y,
  h = 110,
  shirt,
  skin,
  pants = '#2d3142',
  walk = 0,
  dir = 1,
  hair = '#2b2118',
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const ph = walk ? Math.sin((frame + seed * 7) / 4) : 0;
  const s = h / 110;
  return (
    <g transform={`translate(${x}, ${y}) scale(${s * dir}, ${s})`}>
      <ellipse cx={0} cy={2} rx={20} ry={4} fill="rgba(0,0,0,.25)" />
      <rect x={-9} y={-44} width={8} height={44} rx={3} fill={pants} transform={`rotate(${ph * 16} -5 -44)`} />
      <rect x={1} y={-44} width={8} height={44} rx={3} fill={pants} transform={`rotate(${-ph * 16} 5 -44)`} />
      <rect x={-13} y={-86} width={26} height={46} rx={7} fill={shirt} />
      <rect x={0} y={-86} width={13} height={46} rx={7} fill="rgba(0,0,0,.14)" />
      <rect x={-17} y={-82} width={7} height={34} rx={3.5} fill={shirt} transform={`rotate(${-ph * 14} -13 -82)`} />
      <rect x={10} y={-82} width={7} height={34} rx={3.5} fill={shirt} transform={`rotate(${ph * 14} 13 -82)`} />
      <circle cx={0} cy={-100} r={13} fill={skin} />
      <path d="M-13,-102 Q-12,-117 0,-117 Q13,-117 13,-104 Q6,-110 -13,-102 Z" fill={hair} />
    </g>
  );
};

// ---------------------------------------------------------------------------
// Textes et interface
// ---------------------------------------------------------------------------
// Titre en majuscules, un mot en couleur d'accent
export const Headline: React.FC<{text: string; accent?: string; size?: number; delay?: number; color?: string; top?: number; accentColor?: string}> = ({
  text,
  accent,
  size = 64,
  delay = 0,
  color = K.white,
  top = 70,
  accentColor = K.accent,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 20, stiffness: 120}});
  const words = text.split(' ');
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: size * 0.02, color, opacity: p, transform: `translateY(${(1 - p) * 20}px)`, textShadow: '0 4px 18px rgba(0,0,0,.35)'}}>
      {words.map((w, i) => (
        <span key={i} style={{color: accent && w.toUpperCase().includes(accent.toUpperCase()) ? accentColor : color, marginRight: size * 0.28}}>
          {w.toUpperCase()}
        </span>
      ))}
    </div>
  );
};

// Étiquette de chapitre en haut à gauche (icône + texte)
export const ChapterChip: React.FC<{icon: React.ReactNode; label: string; delay?: number}> = ({icon, label, delay = 0}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 12], [0, 1], CL);
  return (
    <div style={{position: 'absolute', left: 44, top: 36, display: 'flex', alignItems: 'center', gap: 14, opacity: p, transform: `translateX(${(1 - p) * -20}px)`}}>
      <div style={{width: 64, height: 64, borderRadius: 10, background: 'rgba(15,22,32,.75)', border: '2px solid rgba(244,241,234,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 2, color: K.white, textShadow: '0 2px 8px rgba(0,0,0,.5)'}}>{label}</div>
    </div>
  );
};

// Légende : point, fine ligne qui se trace, puis texte en majuscules
export const Callout: React.FC<{x: number; y: number; dx: number; dy: number; label: string; delay?: number; color?: string}> = ({x, y, dx, dy, label, delay = 0, color = K.white}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 14], [0, 1], {...CL, easing: Easing.out(Easing.cubic)});
  const tp = interpolate(frame - delay, [10, 20], [0, 1], CL);
  const ex = x + dx * p;
  const ey = y + dy * p;
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <circle cx={x} cy={y} r={6 * Math.min(1, p * 3)} fill={color} />
        <line x1={x} y1={y} x2={ex} y2={ey} stroke={color} strokeWidth={2.5} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: dx < 0 ? x + dx - 600 - 14 : x + dx + 14,
          width: 600,
          textAlign: dx < 0 ? 'right' : 'left',
          top: y + dy - 16,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: 1.5,
          color,
          opacity: tp,
          textShadow: '0 2px 10px rgba(0,0,0,.5)',
        }}
      >
        {label}
      </div>
    </>
  );
};

// Sous-titres discrets (en attendant la voix off)
export type Cap = [number, number, string];
export const LowerCaps: React.FC<{caps: Cap[]}> = ({caps}) => {
  const frame = useCurrentFrame();
  const c = caps.find(([a, b]) => frame >= T(a) && frame < T(b));
  if (!c) return null;
  const o = Math.min(1, (frame - T(c[0])) / 6, (T(c[1]) - frame) / 6);
  return (
    <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', opacity: o}}>
      <span style={{fontFamily: FONT, fontWeight: 600, fontSize: 30, color: K.white, background: 'rgba(10,14,20,.6)', padding: '8px 22px', borderRadius: 6}}>{c[2]}</span>
    </div>
  );
};
