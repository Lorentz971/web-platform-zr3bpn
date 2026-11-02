// Kit commun des packs en style n° 7 (horreur analogique : noir, traits blancs lumineux, rouge, VHS).
import React from 'react';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const FPS = 30;
export const T = (s: number) => Math.round(s * FPS);
export const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const FONT = '"Montserrat", "DejaVu Sans", sans-serif';
export const MONO = '"DejaVu Sans Mono", monospace';
export const W = '#f2f2f2';
export const DIM = 'rgba(242,242,242,.38)';
export const FAINT = 'rgba(242,242,242,.13)';
export const RED = '#e5302a';
export const WARM = '#ffcf5a';
export const BLACK = '#0a0a0a';
export const GLOW = 'drop-shadow(0 0 6px rgba(255,255,255,.55)) drop-shadow(0 0 18px rgba(255,255,255,.18))';
export const RGLOW = 'drop-shadow(0 0 8px rgba(229,48,42,.9))';
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const useSp = (delay = 0, damping = 14) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping}});
};

const GlitchCtx = React.createContext<number[]>([]);
const useGlitch = () => {
  const f = useCurrentFrame();
  const gs = React.useContext(GlitchCtx);
  return gs.some((g) => f >= g - 3 && f < g + 4) ? 1 : rnd(Math.floor(f / 2)) > 0.97 ? 0.35 : 0;
};

const VHS: React.FC = () => {
  const f = useCurrentFrame();
  const g = useGlitch();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0px, rgba(0,0,0,.28) 2px, transparent 2px, transparent 4px)'}} />
      <Img src={staticFile(`grain${(Math.floor(f / 2) % 8) + 1}.png`)} style={{position: 'absolute', width: '100%', height: '100%', opacity: 0.07, mixBlendMode: 'screen'}} />
      {Array.from({length: g > 0 ? 7 : 2}, (_, i) => {
        const w = 200 + rnd(f + i) * 1400;
        return <div key={i} style={{position: 'absolute', left: rnd(f * 7 + i) * (1920 - w), top: rnd(f * 3 + i * 17) * 1080, width: w, height: 1 + rnd(i + f) * (g ? 5 : 2), background: 'rgba(255,255,255,.35)'}} />;
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.7) 100%)'}} />
    </AbsoluteFill>
  );
};

const Chroma: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const g = useGlitch();
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

const HUD: React.FC<{label: string}> = ({label}) => {
  const f = useCurrentFrame();
  const s = Math.floor(f / FPS);
  const tc = `00:00:${String(s).padStart(2, '0')}:${String(f % FPS).padStart(2, '0')}`;
  return (
    <div style={{position: 'absolute', top: 26, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 18, color: 'rgba(242,242,242,.55)', letterSpacing: 2}}>
      <div>{label}</div>
      <div><span style={{color: RED, opacity: Math.floor(f / 15) % 2 ? 1 : 0.2}}>●</span> REC {tc}</div>
    </div>
  );
};

export const Fig: React.FC<{n: string; title: string; cap?: string}> = ({n, title, cap}) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{position: 'absolute', left: 80, top: 90, fontFamily: MONO, color: W, filter: GLOW}}>
        <div style={{fontSize: 20, letterSpacing: 4, color: DIM}}>{n}</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 46, letterSpacing: 3, marginTop: 6}}>
          {title.slice(0, Math.floor(f / 1.2))}<span style={{opacity: Math.floor(f / 8) % 2}}>▌</span>
        </div>
      </div>
      {cap && (
        <div style={{position: 'absolute', bottom: 56, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: W,
          textShadow: '0 0 10px rgba(255,255,255,.35)', opacity: interpolate(f, [12, 22], [0, 1], CL)}}>{cap}</div>
      )}
    </>
  );
};

export const Svg: React.FC<{children: React.ReactNode; glow?: boolean}> = ({children, glow = true}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', filter: glow ? GLOW : undefined}}>{children}</svg>
);
export const Txt: React.FC<{x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; o?: number; big?: boolean; children: React.ReactNode}> = ({
  x, y, s = 22, c = W, a = 'start', o = 1, big = false, children,
}) => (
  <text x={x} y={y} fontSize={s} fill={c} textAnchor={a} opacity={o} fontFamily={big ? FONT : MONO} fontWeight={big ? 900 : 400} letterSpacing={2}>{children}</text>
);

export const Person: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = W}) => (
  <g transform={`translate(${x}, ${y}) scale(${s})`} fill={color}>
    <circle cx={0} cy={-150} r={22} />
    <rect x={-26} y={-122} width={52} height={70} rx={14} />
    <rect x={-24} y={-56} width={20} height={56} rx={8} />
    <rect x={4} y={-56} width={20} height={56} rx={8} />
    <rect x={-40} y={-118} width={14} height={60} rx={7} />
    <rect x={26} y={-118} width={14} height={60} rx={7} />
  </g>
);
export const House: React.FC<{x: number; y: number; s?: number; lit?: number}> = ({x, y, s = 1, lit = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-170,0 L-170,-200 L0,-320 L170,-200 L170,0 Z" stroke={W} strokeWidth={6 / Math.max(s, 0.2)} fill={BLACK} strokeLinejoin="round" />
    <rect x={-110} y={-170} width={80} height={70} fill={WARM} opacity={lit} />
  </g>
);

export const PackTitle7: (n: string, title: string, sub: string) => React.FC = (n, title, sub) => () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily: MONO, color: W, filter: GLOW, textAlign: 'center'}}>
      <div style={{fontSize: 24, letterSpacing: 8, color: DIM}}>{n}</div>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, letterSpacing: 6, marginTop: 20, opacity: interpolate(f, [8, 14], [0, 1], CL)}}>{title}</div>
      <div style={{fontSize: 28, letterSpacing: 6, marginTop: 18, color: RED, filter: RGLOW, opacity: interpolate(f, [22, 28], [0, 1], CL)}}>{sub}</div>
    </AbsoluteFill>
  );
};

export type Scene = [React.FC, number];
export const total = (s: Scene[]) => s.reduce((a, [, d]) => a + d, 0);
export const Pack7: React.FC<{scenes: Scene[]; label: string; extra?: React.ReactNode}> = ({scenes, label, extra}) => {
  const starts = scenes.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + scenes[i - 1][1] : 0], []);
  return (
    <GlitchCtx.Provider value={starts.slice(1)}>
      <AbsoluteFill style={{background: BLACK}}>
        <Audio src={staticFile('rules/hiss.wav')} volume={0.35} loop />
        <Audio src={staticFile('rules/low.wav')} volume={0.6} loop />
        {starts.slice(1).map((s) => <Sequence key={s} from={s - 3} durationInFrames={10}><Audio src={staticFile('rules/glitch.wav')} volume={0.55} /></Sequence>)}
        {extra}
        <Chroma>{scenes.map(([C, d], i) => <Sequence key={i} from={starts[i]} durationInFrames={d}><C /></Sequence>)}</Chroma>
        <HUD label={label} />
        <VHS />
      </AbsoluteFill>
    </GlitchCtx.Provider>
  );
};
