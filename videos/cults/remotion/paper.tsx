// Style « papier découpé » : nouveau langage visuel, indépendant de la vidéo Milgram.
import React from 'react';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/700-italic.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

export const FPS = 30;
export const t = (sec: number) => Math.round(sec * FPS);
export const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const P = {
  cream: '#f3e9d8',
  sand: '#e9d3b7',
  rose: '#f4d3c4',
  coral: '#e4572e',
  coralDark: '#b8401f',
  teal: '#2f8f83',
  mustard: '#f2c14e',
  plum: '#7b4b94',
  ink: '#2b2233',
  indigo: '#262a47',
  night: '#1b1d33',
  mist: '#c9c4d8',
  grey: '#9b98a6',
  white: '#fffaf1',
};

export const SERIF = '"Playfair Display", Georgia, serif';
export const SANS = '"DM Sans", "DejaVu Sans", sans-serif';

// Petit tremblement « stop-motion » (change toutes les 3 images)
export const useBoil = (seed = 1, amp = 1.6) => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / 3);
  return {
    x: Math.sin(k * 12.9898 + seed * 78.233) * amp,
    y: Math.cos(k * 4.1414 + seed * 23.17) * amp,
    r: Math.sin(k * 7.7 + seed) * amp * 0.25,
  };
};

export const Cut: React.FC<{children: React.ReactNode; seed?: number; shadow?: number; style?: React.CSSProperties; boil?: number}> = ({
  children,
  seed = 1,
  shadow = 8,
  style,
  boil = 1.4,
}) => {
  const b = useBoil(seed, boil);
  return (
    <div style={{filter: `drop-shadow(${shadow * 0.5}px ${shadow}px 0 rgba(43,34,51,.22))`, transform: `translate(${b.x}px, ${b.y}px) rotate(${b.r}deg)`, ...style}}>
      {children}
    </div>
  );
};

// Fond papier : couleur + texture + vignettage doux
export const PaperBG: React.FC<{color: string; dark?: boolean; children?: React.ReactNode}> = ({color, dark, children}) => (
  <AbsoluteFill style={{background: color}}>
    {children}
    <Img src={staticFile('cults/paper.png')} style={{position: 'absolute', width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: dark ? 0.35 : 0.5}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(20,14,30,${dark ? 0.55 : 0.18}) 100%)`}} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Personnage en papier (corps capsule, tête ronde, deux yeux), sans visage détaillé
// ---------------------------------------------------------------------------
export const Figure: React.FC<{
  color: string;
  size?: number;
  you?: boolean;
  seed?: number;
  arms?: 'down' | 'up' | 'reach' | 'hold';
  grey?: number;
  strings?: number;
  look?: number;
}> = ({color, size = 200, you, seed = 1, arms = 'down', grey = 0, strings = 0, look = 0}) => {
  const frame = useCurrentFrame();
  const blink = (frame + seed * 41) % 120 < 4;
  const bob = Math.sin((frame + seed * 17) / 18) * 2;
  return (
    <Cut seed={seed} shadow={size / 28}>
      <svg width={size * 0.6} height={size} viewBox="0 0 120 200" style={{overflow: 'visible', filter: grey ? `grayscale(${grey}) opacity(${1 - grey * 0.45})` : undefined}}>
        {strings > 0 && (
          <g stroke={P.white} strokeWidth={1.6} opacity={0.9}>
            <line x1={60} y1={-400} x2={60} y2={-400 + 420 * strings} />
            <line x1={14} y1={-400} x2={14} y2={-400 + 520 * strings} />
            <line x1={106} y1={-400} x2={106} y2={-400 + 520 * strings} />
          </g>
        )}
        <g transform={`translate(0, ${bob})`}>
          {arms === 'up' && (
            <g fill={color}>
              <rect x={2} y={40} width={20} height={70} rx={10} transform="rotate(-25 12 100)" />
              <rect x={98} y={40} width={20} height={70} rx={10} transform="rotate(25 108 100)" />
            </g>
          )}
          {arms === 'reach' && <rect x={86} y={96} width={70} height={20} rx={10} fill={color} />}
          {arms === 'hold' && <rect x={-36} y={110} width={60} height={20} rx={10} fill={color} />}
          <rect x={22} y={76} width={76} height={122} rx={38} fill={color} stroke={you ? P.white : 'none'} strokeWidth={you ? 5 : 0} />
          {arms === 'down' && (
            <g fill={color}>
              <rect x={10} y={86} width={20} height={80} rx={10} />
              <rect x={90} y={86} width={20} height={80} rx={10} />
            </g>
          )}
          <circle cx={60} cy={44} r={30} fill={color} stroke={you ? P.white : 'none'} strokeWidth={you ? 5 : 0} />
          <g transform={`translate(${look * 5}, 0)`}>
            {blink ? (
              <g stroke={P.ink} strokeWidth={3}>
                <line x1={46} y1={44} x2={54} y2={44} />
                <line x1={66} y1={44} x2={74} y2={44} />
              </g>
            ) : (
              <g fill={P.ink}>
                <ellipse cx={50} cy={44} rx={4} ry={5} />
                <ellipse cx={70} cy={44} rx={4} ry={5} />
              </g>
            )}
          </g>
        </g>
      </svg>
    </Cut>
  );
};

// ---------------------------------------------------------------------------
// Textes
// ---------------------------------------------------------------------------
export const Serif: React.FC<{text: string; size?: number; color?: string; delay?: number; italic?: boolean; align?: 'center' | 'left'; highlight?: string}> = ({
  text,
  size = 96,
  color = P.ink,
  delay = 0,
  italic = true,
  align = 'center',
  highlight,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{textAlign: align, fontFamily: SERIF, fontStyle: italic ? 'italic' : 'normal', fontWeight: 700, fontSize: size, lineHeight: 1.12, color}}>
      {words.map((w, i) => {
        const p = spring({frame: frame - delay - i * 3, fps, config: {damping: 18, stiffness: 120}});
        const isHi = highlight && w.toLowerCase().replace(/[^a-z0-9%+]/g, '') === highlight.toLowerCase();
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: size * 0.24,
              opacity: p,
              transform: `translateY(${(1 - p) * 30}px)`,
              color: isHi ? P.coral : color,
              backgroundImage: isHi ? `linear-gradient(transparent 62%, ${P.mustard}aa 62%)` : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// Étiquette sur une bande de papier qui se déroule
export const Label: React.FC<{text: string; bg?: string; color?: string; delay?: number; size?: number; rotate?: number}> = ({
  text,
  bg = P.mustard,
  color = P.ink,
  delay = 0,
  size = 40,
  rotate = -2,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 12], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{display: 'inline-block', transform: `rotate(${rotate}deg)`}}>
      <div style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, background: bg, color, fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: 2, textTransform: 'uppercase', padding: `${size * 0.2}px ${size * 0.5}px`, boxShadow: '4px 6px 0 rgba(43,34,51,.2)'}}>
        {text}
      </div>
    </div>
  );
};

// Sous-titres sur une bande de papier
export type Cap = [number, number, string];
export const PaperCaptions: React.FC<{caps: Cap[]; darkFrom: number; darkTo: number}> = ({caps, darkFrom, darkTo}) => {
  const frame = useCurrentFrame();
  const cap = caps.find(([a, b]) => frame >= t(a) && frame < t(b));
  if (!cap) return null;
  const dark = frame >= t(darkFrom) && frame < t(darkTo);
  const fade = Math.min(1, (frame - t(cap[0])) / 5, (t(cap[1]) - frame) / 5);
  return (
    <div style={{position: 'absolute', bottom: 44, width: '100%', display: 'flex', justifyContent: 'center', opacity: fade}}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 34,
          color: dark ? P.white : P.ink,
          background: dark ? 'rgba(27,29,51,.86)' : 'rgba(255,250,241,.9)',
          padding: '12px 30px',
          borderRadius: 6,
          maxWidth: 1500,
          textAlign: 'center',
          boxShadow: '4px 6px 0 rgba(43,34,51,.18)',
        }}
      >
        {cap[2]}
      </div>
    </div>
  );
};

// Transition : une bande de papier déchiré qui balaie l'écran
export const TearWipe: React.FC<{color: string; duration?: number}> = ({color, duration = 22}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, duration], [-2400, 2400], {...cl, easing: Easing.inOut(Easing.cubic)});
  const n = 29;
  const right = Array.from({length: n}, (_, i) => `L${2200 + (i % 2 ? 40 : 0)},${i * 40}`).join(' ');
  const left = Array.from({length: n}, (_, i) => `L${200 - (i % 2 ? 40 : 0)},${(n - 1 - i) * 40}`).join(' ');
  return (
    <AbsoluteFill style={{transform: `translateX(${x}px)`}}>
      <svg width={2400} height={1120} viewBox="0 0 2400 1120" style={{position: 'absolute', left: -240, top: -20}}>
        <path d={`M200,0 ${right} ${left} Z`} fill={color} />
      </svg>
    </AbsoluteFill>
  );
};

// Cœur en papier
export const Heart: React.FC<{size?: number; color?: string}> = ({size = 60, color = P.coral}) => (
  <svg width={size} height={size} viewBox="0 0 100 90">
    <path d="M50,88 C20,62 2,46 2,26 C2,10 14,2 28,2 C38,2 46,8 50,16 C54,8 62,2 72,2 C86,2 98,10 98,26 C98,46 80,62 50,88 Z" fill={color} />
  </svg>
);

// Bulle de dialogue en papier
export const Speech: React.FC<{text: string; bg?: string; color?: string; size?: number; tail?: 'left' | 'right'}> = ({text, bg = P.white, color = P.ink, size = 34, tail = 'left'}) => (
  <div style={{position: 'relative', display: 'inline-block', background: bg, color, fontFamily: SANS, fontWeight: 700, fontSize: size, padding: '16px 26px', borderRadius: 26, boxShadow: '4px 6px 0 rgba(43,34,51,.2)'}}>
    {text}
    <div style={{position: 'absolute', bottom: -16, [tail]: 34, width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: `20px solid ${bg}`}} />
  </div>
);
