// Test de style n° 7 : pictogrammes d'« horreur analogique » (fond noir, traits blancs lumineux,
// accent rouge, cartes « RULE », effets VHS). Univers original : Municipal Bureau of Night Conditions.
import React from 'react';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

const FPS = 30;
const T = (s: number) => Math.round(s * FPS);
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FONT = '"Montserrat", "DejaVu Sans", sans-serif';
const MONO = '"DejaVu Sans Mono", monospace';
const W = '#f2f2f2';
const RED = '#e5302a';
const WARM = '#ffcf5a';
const GLOW = 'drop-shadow(0 0 6px rgba(255,255,255,.55)) drop-shadow(0 0 18px rgba(255,255,255,.18))';

// Pseudo-aléatoire déterministe
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------------------
// Effets VHS : lignes de balayage, grain, lignes parasites, petits sauts
// ---------------------------------------------------------------------------
const glitchAt = (frame: number) => {
  const big = [T(4.6), T(10.8), T(15.8), T(21.8), T(27.2)].some((g) => frame >= g && frame < g + 6);
  return big ? 1 : rnd(Math.floor(frame / 2)) > 0.965 ? 0.4 : 0;
};

const VHS: React.FC = () => {
  const frame = useCurrentFrame();
  const g = glitchAt(frame);
  const grain = (Math.floor(frame / 2) % 8) + 1;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0px, rgba(0,0,0,.28) 2px, transparent 2px, transparent 4px)'}} />
      <Img src={staticFile(`grain${grain}.png`)} style={{position: 'absolute', width: '100%', height: '100%', opacity: 0.07, mixBlendMode: 'screen'}} />
      {Array.from({length: g > 0 ? 7 : 2}, (_, i) => {
        const y = rnd(frame * 3 + i * 17) * 1080;
        const w = 200 + rnd(frame + i) * 1400;
        const x = rnd(frame * 7 + i) * (1920 - w);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: w, height: 1 + rnd(i + frame) * (g ? 5 : 2), background: 'rgba(255,255,255,.35)'}} />;
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.7) 100%)'}} />
    </AbsoluteFill>
  );
};

// Décalage chromatique (rouge / cyan) appliqué au contenu pendant les parasites
const Chroma: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const g = glitchAt(frame);
  const off = g * 8;
  const jitter = g ? (rnd(frame) - 0.5) * 30 : 0;
  if (!g) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{transform: `translateX(${jitter}px)`}}>
      <AbsoluteFill style={{transform: `translateX(${-off}px)`, mixBlendMode: 'screen', filter: 'sepia(1) saturate(8) hue-rotate(-50deg)', opacity: 0.7}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${off}px)`, mixBlendMode: 'screen', filter: 'sepia(1) saturate(8) hue-rotate(140deg)', opacity: 0.7}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{mixBlendMode: 'screen'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// Bandeau d'interface en haut (archive + enregistrement)
const HUD: React.FC<{rule: number}> = ({rule}) => {
  const frame = useCurrentFrame();
  const sec = Math.floor(frame / FPS);
  const tc = `00:00:${String(sec).padStart(2, '0')}:${String(frame % FPS).padStart(2, '0')}`;
  return (
    <div style={{position: 'absolute', top: 26, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: MONO, fontSize: 18, color: 'rgba(242,242,242,.55)', letterSpacing: 2}}>
      <div>MBNC · PUBLIC RECORDING 07</div>
      <div style={{display: 'flex', gap: 6}}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} style={{width: 16, height: 16, border: '1.5px solid rgba(242,242,242,.55)', background: n <= rule ? 'rgba(242,242,242,.75)' : 'transparent'}} />
        ))}
      </div>
      <div>
        <span style={{color: RED, opacity: Math.floor(frame / 15) % 2 ? 1 : 0.2}}>●</span> REC {tc}
      </div>
    </div>
  );
};

// Sous-titres en majuscules
type Cap = [number, number, string];
const CAPS: Cap[] = [
  [0.6, 4.6, 'THIS IS A PUBLIC RECORDING OF THE MUNICIPAL BUREAU OF NIGHT CONDITIONS.'],
  [5.2, 8.0, 'SOMETIMES, LATE AT NIGHT, SOMEONE CALLS YOUR NAME FROM THE TREES.'],
  [8.0, 10.8, 'IT WILL USE A VOICE YOU KNOW.'],
  [11.4, 15.6, 'RULE ONE. DO NOT ANSWER. NOT EVEN TO SAY NO.'],
  [16.2, 19.0, 'IT ONLY CALLS PEOPLE WHO ARE ALONE.'],
  [19.0, 21.6, 'WE HAVE NEVER SEEN WHAT IT LOOKS LIKE.'],
  [22.2, 26.8, 'RULE TWO. GO INSIDE. WALK. DO NOT RUN.'],
  [27.5, 30, 'IT LIKES IT WHEN YOU RUN.'],
];
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const c = CAPS.find(([a, b]) => frame >= T(a) && frame < T(b));
  if (!c) return null;
  return (
    <div style={{position: 'absolute', bottom: 70, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 32, letterSpacing: 2, color: W, textShadow: '0 0 10px rgba(255,255,255,.35)'}}>
      {c[2]}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Pictogrammes au trait
// ---------------------------------------------------------------------------
const Person: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = W}) => (
  <g transform={`translate(${x}, ${y}) scale(${s})`} fill={color}>
    <circle cx={0} cy={-150} r={22} />
    <rect x={-26} y={-122} width={52} height={70} rx={14} />
    <rect x={-24} y={-56} width={20} height={56} rx={8} />
    <rect x={4} y={-56} width={20} height={56} rx={8} />
    <rect x={-40} y={-118} width={14} height={60} rx={7} />
    <rect x={26} y={-118} width={14} height={60} rx={7} />
  </g>
);

const LineTree: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => (
  <g stroke={W} strokeWidth={3} fill="none" strokeLinecap="round">
    <path d={`M${x},${y} L${x},${y - h}`} />
    {[0.35, 0.55, 0.75].map((k, i) => (
      <g key={i}>
        <path d={`M${x},${y - h * k} L${x - h * (0.28 - k * 0.15)},${y - h * k + h * 0.12}`} />
        <path d={`M${x},${y - h * k} L${x + h * (0.28 - k * 0.15)},${y - h * k + h * 0.12}`} />
      </g>
    ))}
  </g>
);

const House: React.FC<{x: number; y: number; lit: number}> = ({x, y, lit}) => (
  <g transform={`translate(${x}, ${y})`}>
    <g stroke={W} strokeWidth={4} fill="#0a0a0a" strokeLinejoin="round">
      <path d="M-170,0 L-170,-200 L0,-320 L170,-200 L170,0 Z" />
      <rect x={-110} y={-170} width={80} height={70} />
      <rect x={-40} y={-120} width={70} height={120} />
    </g>
    <rect x={-106} y={-166} width={72} height={62} fill={WARM} opacity={lit} />
    <path d="M-110,-100 L-180,40 L-40,40 L-30,-100 Z" fill={WARM} opacity={0.12 * lit} />
  </g>
);

// ---------------------------------------------------------------------------
// Scènes
// ---------------------------------------------------------------------------
const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p1 = spring({frame: frame - 18, fps, config: {damping: 20}});
  const p2 = spring({frame: frame - T(3), fps, config: {damping: 9}});
  const typed = 'IF YOU EVER HEAR YOUR NAME CALLED FROM THE WOODS…';
  const n = Math.floor(interpolate(frame, [18, T(2.8)], [0, typed.length], CL));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: 'rgba(242,242,242,.6)', marginBottom: 40, opacity: p1}}>FILE 07 · NIGHT CONDITIONS</div>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: W, letterSpacing: 2, textAlign: 'center', maxWidth: 1500, filter: GLOW}}>{typed.slice(0, n)}</div>
      {frame >= T(3) && (
        <div style={{marginTop: 40, fontFamily: FONT, fontWeight: 900, fontSize: 120, color: RED, letterSpacing: 6, transform: `scale(${1.3 - 0.3 * p2})`, opacity: p2, textShadow: `0 0 30px ${RED}88`}}>DO NOT ANSWER.</div>
      )}
    </AbsoluteFill>
  );
};

const SceneWoods: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const zoom = interpolate(frame, [0, T(5.6)], [1, 1.12], CL);
  const call = spring({frame: frame - T(1.2), fps, config: {damping: 12}});
  const waves = frame > T(1.2);
  return (
    <AbsoluteFill style={{transform: `scale(${zoom})`}}>
      <svg width={1920} height={1080} style={{filter: GLOW}}>
        <circle cx={1650} cy={190} r={46} fill="none" stroke={W} strokeWidth={3} />
        <line x1={0} y1={820} x2={1920} y2={820} stroke={W} strokeWidth={3} />
        {Array.from({length: 11}, (_, i) => (
          <LineTree key={i} x={980 + i * 90 + (i % 2) * 25} y={820} h={260 + (i % 3) * 70} />
        ))}
        <House x={460} y={820} lit={1} />
        <Person x={700} y={820} s={0.9} />
        {waves &&
          [0, 1, 2].map((i) => {
            const t = ((frame + i * 12) % 36) / 36;
            return <path key={i} d={`M${1200 - t * 220},${560 - 70 - t * 30} Q${1160 - t * 240},${560} ${1200 - t * 220},${560 + 70 + t * 30}`} stroke={W} strokeWidth={3} fill="none" opacity={1 - t} />;
          })}
      </svg>
      {waves && (
        <div style={{position: 'absolute', left: 1020, top: 330, transform: `scale(${call})`, transformOrigin: 'bottom right', padding: '14px 26px', border: `3px solid ${W}`, borderRadius: 18, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: W, background: '#0a0a0a', filter: GLOW, letterSpacing: 2}}>
          “[YOUR NAME]…”
        </div>
      )}
      {frame > T(3) && (
        <div style={{position: 'absolute', left: 1040, top: 260, fontFamily: FONT, fontWeight: 900, fontSize: 30, color: RED, letterSpacing: 3, opacity: interpolate(frame, [T(3), T(3.4)], [0, 1], CL)}}>A VOICE YOU KNOW</div>
      )}
    </AbsoluteFill>
  );
};

const RuleCard: React.FC<{n: number; text: string; extra?: React.ReactNode}> = ({n, text, extra}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 4, fps, config: {damping: 14}});
  const line = interpolate(frame, [10, 24], [0, 1], {...CL, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: p, transform: `translateY(${(1 - p) * 20}px)`, filter: GLOW}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 130, color: W, letterSpacing: 4}}>RULE</div>
        <div style={{width: 120, height: 120, background: W, color: '#0a0a0a', fontFamily: FONT, fontWeight: 900, fontSize: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8}}>{n}</div>
      </div>
      <div style={{width: 520 * line, height: 5, background: RED, marginTop: 18, boxShadow: `0 0 14px ${RED}`}} />
      <div style={{marginTop: 26, fontFamily: FONT, fontWeight: 800, fontSize: 52, color: W, letterSpacing: 4, opacity: line}}>{text}</div>
      <div style={{display: 'flex', gap: 10, marginTop: 34, opacity: line}}>
        {[1, 2, 3, 4, 5].map((k) => (
          <div key={k} style={{width: 34, height: 34, border: `2px solid ${W}`, background: k === n ? W : 'transparent', color: k === n ? '#0a0a0a' : W, fontFamily: MONO, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {k}
          </div>
        ))}
      </div>
      {extra}
    </AbsoluteFill>
  );
};

const SceneExhibit: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 3, fps, config: {damping: 16}});
  const figure = interpolate(frame, [T(2.8), T(4.2)], [0, 0.55], CL);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 520, top: 170, transform: `rotate(-2deg) scale(${0.9 + 0.1 * p})`, opacity: p}}>
        <div style={{background: '#e9e6df', padding: 18, paddingBottom: 60, boxShadow: '0 0 40px rgba(255,255,255,.12)'}}>
          <svg width={620} height={420} style={{background: '#2b2b2b', filter: 'grayscale(1) contrast(1.2) blur(0.6px)'}}>
            <rect x={0} y={0} width={620} height={420} fill="#3a3a3a" />
            {Array.from({length: 14}, (_, i) => (
              <rect key={i} x={i * 46 + (i % 3) * 8} y={0} width={14 + (i % 4) * 6} height={420} fill={i % 2 ? '#1c1c1c' : '#262626'} />
            ))}
            <rect x={0} y={330} width={620} height={90} fill="#4a4a4a" />
            <g opacity={figure}>
              <ellipse cx={402} cy={150} rx={12} ry={16} fill="#d9d9d9" />
              <rect x={394} y={164} width={16} height={150} rx={6} fill="#cfcfcf" />
            </g>
            <text x={16} y={404} fontFamily={MONO} fontSize={18} fill="#e0e0e0">
              03:12:44 AM
            </text>
          </svg>
          <div style={{fontFamily: MONO, fontSize: 18, color: '#333', marginTop: 12}}>TRAIL CAMERA 4 · NORTH EDGE</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 1240, top: 200, fontFamily: FONT, color: W}}>
        <div style={{width: 6, height: 70, background: RED, position: 'absolute', left: -20}} />
        <div style={{fontWeight: 900, fontSize: 44, letterSpacing: 3}}>EXHIBIT A</div>
        <div style={{fontFamily: MONO, fontSize: 18, opacity: 0.7, marginTop: 6}}>YEAR: 1987</div>
        <div style={{fontFamily: MONO, fontSize: 18, opacity: 0.7}}>NOTE: ONE FRAME ONLY</div>
      </div>
      {frame > T(3.2) && (
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <circle cx={520 + 18 + 402} cy={170 + 18 + 220} r={60 * interpolate(frame, [T(3.2), T(3.6)], [0, 1], CL)} fill="none" stroke={RED} strokeWidth={4} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

const SceneInside: React.FC = () => {
  const frame = useCurrentFrame();
  const walk = interpolate(frame, [0, T(1.1)], [700, 470], {...CL, easing: Easing.inOut(Easing.quad)});
  const lit = interpolate(frame, [T(1.4), T(1.5)], [1, 0], CL);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{filter: GLOW}}>
        <line x1={0} y1={820} x2={1920} y2={820} stroke={W} strokeWidth={3} />
        {Array.from({length: 11}, (_, i) => (
          <LineTree key={i} x={980 + i * 90 + (i % 2) * 25} y={820} h={260 + (i % 3) * 70} />
        ))}
        <House x={460} y={820} lit={lit} />
        {frame < T(1.2) && <Person x={walk} y={820} s={0.9} />}
        {frame > T(1.7) &&
          Array.from({length: 4}, (_, i) => (
            <g key={i} opacity={interpolate(frame, [T(1.7) + i * 5, T(1.7) + i * 5 + 6], [0, 1], CL)}>
              <circle cx={1080 + i * 120} cy={600 - (i % 2) * 40} r={6} fill={W} />
              <circle cx={1100 + i * 120} cy={600 - (i % 2) * 40} r={6} fill={W} />
            </g>
          ))}
      </svg>
      {frame > T(2.1) && (
        <div style={{position: 'absolute', left: 1080, top: 470, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: RED, letterSpacing: 3}}>IT IS STILL OUT THERE</div>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Assemblage (30 s)
// ---------------------------------------------------------------------------
export const RULES_HOOK_FRAMES = T(30);

const ruleAt = (f: number) => (f < T(11) ? 0 : f < T(22) ? 1 : 2);

export const RulesHook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0a0a0a'}}>
      <Chroma>
        <Sequence durationInFrames={T(5)}>
          <SceneTitle />
        </Sequence>
        <Sequence from={T(5)} durationInFrames={T(6)}>
          <SceneWoods />
        </Sequence>
        <Sequence from={T(11)} durationInFrames={T(5)}>
          <RuleCard n={1} text="DO NOT ANSWER" />
        </Sequence>
        <Sequence from={T(16)} durationInFrames={T(6)}>
          <SceneExhibit />
        </Sequence>
        <Sequence from={T(22)} durationInFrames={T(5)}>
          <RuleCard n={2} text="GO INSIDE. WALK." />
        </Sequence>
        <Sequence from={T(27)} durationInFrames={T(3)}>
          <SceneInside />
        </Sequence>
        <Captions />
      </Chroma>
      <HUD rule={ruleAt(frame)} />
      <VHS />
      <Audio src={staticFile('rules/hiss.wav')} volume={0.5} />
      <Audio src={staticFile('cults/pad_dark.wav')} volume={0.45} />
      {[T(4.6), T(10.8), T(15.8), T(21.8), T(27.2)].map((f) => (
        <Sequence key={f} from={f} durationInFrames={8}>
          <Audio src={staticFile('rules/glitch.wav')} volume={0.6} />
        </Sequence>
      ))}
      {[T(3), T(11) + 4, T(22) + 4].map((f) => (
        <Sequence key={`b${f}`} from={f} durationInFrames={8}>
          <Audio src={staticFile('rules/beep.wav')} volume={0.5} />
        </Sequence>
      ))}
      <Sequence from={T(28.3)} durationInFrames={T(0.6)}>
        <Audio src={staticFile('rules/door.wav')} volume={0.8} />
      </Sequence>
    </AbsoluteFill>
  );
};
