// Kit de style « amélioré » : polices, couleurs, personnages illustrés, décors,
// grain, vignettage, caméra, transitions et sous-titres animés.
import React from 'react';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource/oswald/500.css';
import '@fontsource/oswald/700.css';
import '@fontsource/special-elite/400.css';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

export const FPS = 30;
export const s = (sec: number) => Math.round(sec * FPS);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const C = {
  bg: '#0c0e11',
  ink: '#f3efe6',
  dim: '#9aa3ad',
  amber: '#ffb547',
  red: '#ff4d4d',
  green: '#5bd68a',
  blue: '#6fb3d2',
  steel: '#2a2f36',
  grey: '#5a626c',
};

export const F = {
  head: '"Oswald", "DejaVu Sans", sans-serif',
  body: '"Inter", "DejaVu Sans", sans-serif',
  type: '"Special Elite", "DejaVu Sans Mono", monospace',
};

// ---------------------------------------------------------------------------
// Grain de film + vignettage + étalonnage léger (appliqué à toute la vidéo)
// ---------------------------------------------------------------------------
export const FilmLook: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const g = (Math.floor(frame / 2) % 8) + 1;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{filter: 'contrast(1.06) saturate(1.08) sepia(0.06)'}}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}}
      />
      <Img
        src={staticFile(`grain${g}.png`)}
        style={{position: 'absolute', width: '100%', height: '100%', opacity: 0.09, mixBlendMode: 'overlay'}}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Plan : transition d'entrée/sortie (zoom + flou) et léger mouvement de caméra
// ---------------------------------------------------------------------------
export const Shot: React.FC<{children: React.ReactNode; duration: number; drift?: number; noIn?: boolean}> = ({
  children,
  duration,
  drift = 0.04,
  noIn,
}) => {
  const frame = useCurrentFrame();
  const inP = noIn ? 1 : interpolate(frame, [0, 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const outP = interpolate(frame, [duration - 12, duration], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const cam = interpolate(frame, [0, duration], [1, 1 + drift], clamp);
  const scale = cam * (1 + (1 - inP) * 0.06) * (1 - outP * 0.03);
  const blur = (1 - inP) * 10 + outP * 6;
  return (
    <AbsoluteFill style={{opacity: Math.min(inP, 1 - outP), transform: `scale(${scale})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Fonds
// ---------------------------------------------------------------------------
export const Backdrop: React.FC<{glow?: string}> = ({glow = 'rgba(255,181,71,0.10)'}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${glow} 0%, rgba(0,0,0,0) 55%), linear-gradient(#14181d, #0a0c0f)`}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {Array.from({length: 40}, (_, i) => {
          const x = ((i * 241) % 1920) + Math.sin((frame + i * 30) / 90) * 30;
          const y = ((i * 157 + frame * (0.3 + (i % 3) * 0.2)) % 1180) - 50;
          return <circle key={i} cx={x} cy={1080 - y} r={1.5 + (i % 3)} fill="#fff" opacity={0.08 + (i % 4) * 0.03} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Laboratoire de 1961 : mur à lambris, plaque, horloge, lampe suspendue avec cône de lumière
export const LabBackground: React.FC<{dim?: number; lamp?: boolean; x?: number}> = ({dim = 0, lamp = true, x = 0}) => {
  const frame = useCurrentFrame();
  const flicker = 0.85 + 0.15 * Math.sin(frame / 3.1) * Math.sin(frame / 7.3);
  const minute = (frame / 30) * 6;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a3038" />
            <stop offset="1" stopColor="#1b2027" />
          </linearGradient>
          <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a2f25" />
            <stop offset="1" stopColor="#261e17" />
          </linearGradient>
          <radialGradient id="cone" cx="0.5" cy="0" r="1">
            <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.45" />
            <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform={`translate(${x * 0.4}, 0)`}>
          <rect x={-200} y={0} width={2320} height={720} fill="url(#wall)" />
          <rect x={-200} y={560} width={2320} height={170} fill="url(#panel)" />
          {Array.from({length: 22}, (_, i) => (
            <rect key={i} x={-180 + i * 110} y={575} width={96} height={140} rx={4} fill="none" stroke="#4a3c2f" strokeWidth={3} />
          ))}
          <rect x={-200} y={556} width={2320} height={10} fill="#4d3f31" />
          {/* plaque */}
          <rect x={720} y={150} width={480} height={90} rx={6} fill="#c9a96a" opacity={0.9} />
          <text x={960} y={190} textAnchor="middle" fontFamily={F.head} fontWeight={700} fontSize={30} fill="#2a2116" letterSpacing={4}>
            YALE UNIVERSITY
          </text>
          <text x={960} y={225} textAnchor="middle" fontFamily={F.head} fontWeight={500} fontSize={20} fill="#3d3121" letterSpacing={3}>
            INTERACTION LABORATORY
          </text>
          {/* horloge */}
          <g transform="translate(1560,200)">
            <circle r={62} fill="#e9e3d6" stroke="#4d3f31" strokeWidth={8} />
            {Array.from({length: 12}, (_, i) => (
              <rect key={i} x={-2} y={-54} width={4} height={10} fill="#333" transform={`rotate(${i * 30})`} />
            ))}
            <rect x={-3} y={-34} width={6} height={36} fill="#222" transform={`rotate(${minute / 12 + 60})`} />
            <rect x={-2} y={-50} width={4} height={52} fill="#222" transform={`rotate(${minute})`} />
          </g>
          {/* porte */}
          <rect x={160} y={180} width={230} height={540} fill="#2d241c" stroke="#4d3f31" strokeWidth={8} />
          <circle cx={360} cy={470} r={10} fill="#c9a96a" />
        </g>
        {/* sol */}
        <rect x={0} y={720} width={1920} height={360} fill="#121417" />
        {Array.from({length: 16}, (_, i) => (
          <line key={i} x1={960} y1={720} x2={-600 + i * 210} y2={1080} stroke="#1c2025" strokeWidth={3} />
        ))}
        {/* lampe */}
        {lamp && (
          <g>
            <rect x={955} y={0} width={10} height={70} fill="#555" />
            <path d="M890,70 L1030,70 L1000,110 L920,110 Z" fill="#3b3f45" />
            <ellipse cx={960} cy={112} rx={40} ry={8} fill="#ffe7bf" opacity={flicker} />
            <path d="M920,110 L1000,110 L1500,1080 L420,1080 Z" fill="url(#cone)" opacity={0.6 * flicker} />
          </g>
        )}
      </svg>
      {dim > 0 && <AbsoluteFill style={{background: `rgba(5,6,8,${dim})`}} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Personnages illustrés (visage, clignement des yeux, respiration, expressions)
// ---------------------------------------------------------------------------
export type Expr = 'neutral' | 'worried' | 'scared' | 'calm' | 'pain';
type Variant = 'you' | 'learner' | 'coat' | 'rebel';

const LOOK: Record<Variant, {skin: string; hair: string; shirt: string; pants: string}> = {
  you: {skin: '#e7bf98', hair: '#3a2a1e', shirt: '#d99a3c', pants: '#2b2f36'},
  learner: {skin: '#d9a77f', hair: '#6b6f74', shirt: '#5f8fa8', pants: '#3a3f46'},
  coat: {skin: '#efcfae', hair: '#1f1b18', shirt: '#dfe3e8', pants: '#33373d'},
  rebel: {skin: '#c99872', hair: '#2a2420', shirt: '#4fb07a', pants: '#2b2f36'},
};

export const Character: React.FC<{
  variant: Variant;
  expr?: Expr;
  seated?: boolean;
  height?: number;
  armsCrossed?: boolean;
  seed?: number;
  straps?: boolean;
}> = ({variant, expr = 'neutral', seated, height = 300, armsCrossed, seed = 0, straps}) => {
  const frame = useCurrentFrame();
  const L = LOOK[variant];
  const blinkCycle = (frame + seed * 37) % 110;
  const eyeScale = blinkCycle < 4 ? 0.1 : 1;
  const breathe = 1 + Math.sin((frame + seed * 13) / 22) * 0.012;
  const shake = expr === 'pain' || expr === 'scared' ? Math.sin(frame * 1.9 + seed) * 1.5 : 0;
  const brow =
    expr === 'worried' || expr === 'scared' || expr === 'pain' ? {l: 'M-26,-14 L-8,-20', r: 'M8,-20 L26,-14'} : expr === 'calm' ? {l: 'M-26,-18 L-8,-18', r: 'M8,-18 L26,-18'} : {l: 'M-26,-18 L-8,-20', r: 'M8,-20 L26,-18'};
  const mouth =
    expr === 'scared' ? <ellipse cx={0} cy={22} rx={8} ry={11} fill="#3a1f1a" /> : expr === 'pain' ? <path d="M-14,26 Q0,10 14,26" stroke="#3a1f1a" strokeWidth={4} fill="#3a1f1a" /> : expr === 'worried' ? <path d="M-12,24 Q0,16 12,24" stroke="#3a1f1a" strokeWidth={4} fill="none" strokeLinecap="round" /> : expr === 'calm' ? <path d="M-12,20 Q0,26 12,20" stroke="#3a1f1a" strokeWidth={4} fill="none" strokeLinecap="round" /> : <path d="M-10,22 L10,22" stroke="#3a1f1a" strokeWidth={4} strokeLinecap="round" />;
  const vbH = seated ? 330 : 420;
  return (
    <svg width={(height * 220) / vbH} height={height} viewBox={`-110 -70 220 ${vbH}`} style={{overflow: 'visible'}}>
      <g transform={`translate(${shake},0)`}>
        {/* jambes */}
        {!seated && (
          <g>
            <rect x={-38} y={200} width={32} height={140} rx={12} fill={L.pants} />
            <rect x={6} y={200} width={32} height={140} rx={12} fill={L.pants} />
            <rect x={-44} y={330} width={44} height={16} rx={8} fill="#1a1a1a" />
            <rect x={6} y={330} width={44} height={16} rx={8} fill="#1a1a1a" />
          </g>
        )}
        {seated && <rect x={-50} y={200} width={100} height={46} rx={18} fill={L.pants} />}
        {/* buste */}
        <g transform={`translate(0,120) scale(1,${breathe}) translate(0,-120)`}>
          <path d="M-62,70 Q-60,48 -30,44 L30,44 Q60,48 62,70 L56,220 L-56,220 Z" fill={L.shirt} />
          {variant === 'coat' && (
            <g>
              <path d="M-66,70 Q-62,46 -30,42 L-6,42 L-14,240 L-60,240 Z" fill="#cfd4da" />
              <path d="M66,70 Q62,46 30,42 L6,42 L14,240 L60,240 Z" fill="#cfd4da" />
              <path d="M-6,42 L-22,96 L-12,104" stroke="#aab0b8" strokeWidth={3} fill="none" />
              <path d="M6,42 L22,96 L12,104" stroke="#aab0b8" strokeWidth={3} fill="none" />
              <rect x={24} y={120} width={22} height={6} fill="#4a6fa5" />
            </g>
          )}
          {variant !== 'coat' && <path d="M-16,44 L0,66 L16,44 Z" fill="#f2efe9" />}
          {variant === 'you' && <path d="M-6,64 L0,120 L6,64 Z" fill="#7a2f2f" />}
          {/* bras */}
          {armsCrossed ? (
            <rect x={-60} y={110} width={120} height={34} rx={16} fill={L.shirt} stroke="rgba(0,0,0,.25)" strokeWidth={3} />
          ) : (
            <g>
              <rect x={-78} y={62} width={26} height={130} rx={13} fill={variant === 'coat' ? '#cfd4da' : L.shirt} />
              <rect x={52} y={62} width={26} height={130} rx={13} fill={variant === 'coat' ? '#cfd4da' : L.shirt} />
              <circle cx={-65} cy={196} r={13} fill={L.skin} />
              <circle cx={65} cy={196} r={13} fill={L.skin} />
            </g>
          )}
          {straps && (
            <g>
              <rect x={-66} y={150} width={132} height={14} fill="#3b2a1d" />
              <rect x={-88} y={180} width={46} height={12} fill="#3b2a1d" />
              <circle cx={-72} cy={186} r={5} fill="#c9a96a" />
            </g>
          )}
        </g>
        {/* tête */}
        <rect x={-14} y={22} width={28} height={26} fill={L.skin} />
        <g transform="translate(0,-8)">
          <ellipse cx={-44} cy={0} rx={8} ry={12} fill={L.skin} />
          <ellipse cx={44} cy={0} rx={8} ry={12} fill={L.skin} />
          <ellipse cx={0} cy={0} rx={44} ry={50} fill={L.skin} />
          <path
            d={variant === 'learner' ? 'M-44,-6 Q-46,-46 -10,-50 Q30,-54 44,-20 Q46,-8 40,-4 Q36,-30 0,-34 Q-36,-30 -40,-4 Z' : 'M-46,-4 Q-50,-56 0,-56 Q50,-56 46,-4 Q40,-30 10,-36 Q-20,-30 -40,-12 Z'}
            fill={L.hair}
          />
          {variant === 'learner' && <path d="M-18,0 L18,0" stroke="#333" strokeWidth={0} />}
          <g transform={`translate(0,0) scale(1,${eyeScale})`}>
            <ellipse cx={-16} cy={-2} rx={5} ry={6} fill="#1d1a18" />
            <ellipse cx={16} cy={-2} rx={5} ry={6} fill="#1d1a18" />
          </g>
          <path d={brow.l} stroke={L.hair} strokeWidth={5} strokeLinecap="round" />
          <path d={brow.r} stroke={L.hair} strokeWidth={5} strokeLinecap="round" />
          {variant === 'coat' && (
            <g stroke="#2a2a2a" strokeWidth={3} fill="none">
              <circle cx={-16} cy={-2} r={11} />
              <circle cx={16} cy={-2} r={11} />
              <path d="M-5,-2 L5,-2" />
            </g>
          )}
          <path d="M0,4 Q4,12 0,14" stroke="rgba(0,0,0,.25)" strokeWidth={3} fill="none" />
          {mouth}
          {(expr === 'worried' || expr === 'scared' || expr === 'pain') && (
            <ellipse cx={34} cy={-26} rx={4} ry={7} fill="#bfe3ff" opacity={0.8} />
          )}
        </g>
      </g>
    </svg>
  );
};

// Ombre au sol sous un personnage
export const Shadow: React.FC<{w?: number}> = ({w = 180}) => (
  <div style={{width: w, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,.45)', filter: 'blur(6px)', margin: '-14px auto 0'}} />
);

// ---------------------------------------------------------------------------
// Textes animés
// ---------------------------------------------------------------------------
export const Title: React.FC<{text: string; size?: number; color?: string; delay?: number; font?: string; glow?: boolean; align?: 'center' | 'left'}> = ({
  text,
  size = 90,
  color = C.ink,
  delay = 0,
  font = F.head,
  glow,
  align = 'center',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{textAlign: align, fontFamily: font, fontWeight: 700, fontSize: size, color, lineHeight: 1.08, textShadow: glow ? `0 0 30px ${color}88` : '0 6px 24px rgba(0,0,0,.6)'}}>
      {words.map((w, i) => {
        const p = spring({frame: frame - delay - i * 3, fps, config: {damping: 15, stiffness: 140}});
        return (
          <span key={i} style={{display: 'inline-block', marginRight: size * 0.25, opacity: p, transform: `translateY(${(1 - p) * size * 0.6}px) rotate(${(1 - p) * 4}deg)`}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Typewriter: React.FC<{text: string; start?: number; cps?: number}> = ({text, start = 0, cps = 22}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.floor(((frame - start) / FPS) * cps));
  const cursor = Math.floor(frame / 15) % 2 === 0 ? '▌' : ' ';
  return (
    <span>
      {text.slice(0, n)}
      {n < text.length ? cursor : ''}
    </span>
  );
};

// Sous-titres « karaoké » : mot courant en ambre, mots passés en blanc, à venir atténués
export type Cap = [number, number, string];
export const KaraokeCaptions: React.FC<{caps: Cap[]}> = ({caps}) => {
  const frame = useCurrentFrame();
  const cap = caps.find(([a, b]) => frame >= s(a) && frame < s(b));
  if (!cap) return null;
  const [a, b, text] = cap;
  const words = text.split(' ');
  const start = s(a);
  const speakEnd = s(a) + (s(b) - s(a)) * 0.85;
  const idx = Math.floor(interpolate(frame, [start, speakEnd], [0, words.length], clamp));
  const fade = Math.min(1, (frame - start) / 5, (s(b) - frame) / 5);
  return (
    <div style={{position: 'absolute', bottom: 0, width: '100%', height: 190, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 46, background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.65))', opacity: fade}}>
      <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 38, maxWidth: 1500, textAlign: 'center', lineHeight: 1.35}}>
        {words.map((w, i) => (
          <span key={i} style={{color: i === idx ? C.amber : i < idx ? C.ink : 'rgba(243,239,230,.45)', marginRight: 11}}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
};

// Silhouette simple (pour les grilles de 40 personnes)
export const Mini: React.FC<{color: string; size?: number}> = ({color, size = 100}) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 140 170">
    <defs>
      <linearGradient id={`m${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} />
        <stop offset="1" stopColor={color} stopOpacity="0.7" />
      </linearGradient>
    </defs>
    <circle cx={70} cy={38} r={30} fill={`url(#m${color.replace('#', '')})`} />
    <path d="M30,166 L30,110 Q30,76 70,76 Q110,76 110,110 L110,166 Z" fill={`url(#m${color.replace('#', '')})`} />
  </svg>
);
