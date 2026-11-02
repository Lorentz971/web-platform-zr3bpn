// Test de style n° 5 : « doodle » (traits dessinés à la main, fond clair, bonshommes bâton), 30 s.
import React from 'react';
import '@fontsource/patrick-hand/400.css';
import '@fontsource/permanent-marker/400.css';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

const FPS = 30;
const T = (s: number) => Math.round(s * FPS);
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const HAND = '"Patrick Hand", "DejaVu Sans", sans-serif';
const MARKER = '"Permanent Marker", "DejaVu Sans", sans-serif';
const INK = '#1d1d1f';
const YEL = '#ffd84d';
const RED = '#e63946';
const BLUE = '#4361ee';
const PAPER = '#fbf8f1';

// ---------------------------------------------------------------------------
// Outils « dessin à la main »
// ---------------------------------------------------------------------------
// Filtre de tremblement du trait (change de graine toutes les 3 images = effet « boil »)
const Wobble: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 3) % 6;
  return (
    <svg width={0} height={0} style={{position: 'absolute'}}>
      <filter id="wob">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={seed} />
        <feDisplacementMap in="SourceGraphic" scale={3.2} />
      </filter>
    </svg>
  );
};

// Tracé progressif d'un chemin (effet « se dessine »)
const Draw: React.FC<{d: string; at: number; dur?: number; stroke?: string; width?: number; fill?: string; fillAt?: number}> = ({d, at, dur = 18, stroke = INK, width = 6, fill, fillAt}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], {...CL, easing: Easing.inOut(Easing.quad)});
  const fo = fill ? interpolate(frame, [fillAt ?? at + dur, (fillAt ?? at + dur) + 8], [0, 1], CL) : 0;
  if (frame < at) return null;
  return (
    <>
      {fill && <path d={d} fill={fill} opacity={fo} />}
      <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
    </>
  );
};

// Texte manuscrit qui s'écrit lettre par lettre
const Write: React.FC<{text: string; at: number; size?: number; color?: string; font?: string; cps?: number; style?: React.CSSProperties; hi?: string}> = ({text, at, size = 64, color = INK, font = MARKER, cps = 24, style, hi}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.floor(((frame - at) / FPS) * cps));
  if (frame < at) return null;
  const shown = text.slice(0, n);
  if (!hi || !text.includes(hi)) return <div style={{fontFamily: font, fontSize: size, color, lineHeight: 1.15, ...style}}>{shown}</div>;
  const i0 = text.indexOf(hi);
  const done = n >= text.length;
  const hp = interpolate(frame, [at + (text.length / cps) * FPS, at + (text.length / cps) * FPS + 10], [0, 100], CL);
  return (
    <div style={{fontFamily: font, fontSize: size, color, lineHeight: 1.15, ...style}}>
      {shown.slice(0, i0)}
      <span style={{backgroundImage: `linear-gradient(${YEL}, ${YEL})`, backgroundRepeat: 'no-repeat', backgroundSize: `${done ? hp : 0}% 42%`, backgroundPosition: '0 85%', padding: '0 4px'}}>{shown.slice(i0, i0 + hi.length)}</span>
      {shown.slice(i0 + hi.length)}
    </div>
  );
};

// Coup de surligneur jaune qui passe sous un texte
const Highlight: React.FC<{x: number; y: number; w: number; h: number; at: number; color?: string}> = ({x, y, w, h, at, color = YEL}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 10], [0, 1], {...CL, easing: Easing.out(Easing.quad)});
  return <div style={{position: 'absolute', left: x, top: y, width: w * p, height: h, background: color, opacity: 0.85, transform: 'rotate(-1.5deg)', borderRadius: 6}} />;
};

// ---------------------------------------------------------------------------
// Bonhomme bâton
// ---------------------------------------------------------------------------
type Pose = 'stand' | 'wave' | 'walk' | 'think' | 'cheer';
const Stick: React.FC<{x: number; y: number; s?: number; pose?: Pose; at?: number; color?: string; mood?: 'happy' | 'neutral' | 'sad'; scarf?: string}> = ({x, y, s = 1, pose = 'stand', at = 0, color = INK, mood = 'happy', scarf}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 12}});
  if (frame < at) return null;
  const k = Math.sin(frame / 4);
  const legs = pose === 'walk' ? [`M0,0 L${-12 + k * 14},48`, `M0,0 L${12 - k * 14},48`] : ['M0,0 L-16,48', 'M0,0 L16,48'];
  const arms =
    pose === 'wave'
      ? ['M0,-50 L-26,-22', `M0,-50 L28,${-86 + Math.sin(frame / 3) * 8}`]
      : pose === 'cheer'
        ? ['M0,-50 L-30,-90', 'M0,-50 L30,-90']
        : pose === 'think'
          ? ['M0,-50 L-26,-22', 'M0,-50 L18,-62 L8,-96']
          : pose === 'walk'
            ? [`M0,-50 L${-20 - k * 10},-20`, `M0,-50 L${20 + k * 10},-20`]
            : ['M0,-50 L-24,-18', 'M0,-50 L24,-18'];
  const mouth = mood === 'happy' ? 'M-9,-104 Q0,-96 9,-104' : mood === 'sad' ? 'M-9,-98 Q0,-106 9,-98' : 'M-8,-101 L8,-101';
  return (
    <g transform={`translate(${x}, ${y}) scale(${s * p})`} style={{filter: 'url(#wob)'}}>
      <circle cx={0} cy={-112} r={26} fill={PAPER} stroke={color} strokeWidth={5} />
      <circle cx={-9} cy={-116} r={3.5} fill={color} />
      <circle cx={9} cy={-116} r={3.5} fill={color} />
      <path d={mouth} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M0,-86 L0,0" stroke={color} strokeWidth={5} strokeLinecap="round" />
      {scarf && <path d="M-12,-82 L12,-82 L8,-66" stroke={scarf} strokeWidth={8} fill="none" strokeLinecap="round" />}
      {[...legs, ...arms].map((d, i) => (
        <path key={i} d={d} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </g>
  );
};

const HeartD = (x: number, y: number, r: number) => `M${x},${y + r * 0.9} C${x - r * 1.4},${y} ${x - r},${y - r} ${x},${y - r * 0.35} C${x + r},${y - r} ${x + r * 1.4},${y} ${x},${y + r * 0.9} Z`;

// Flèche dessinée (courbe + pointe)
const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; at: number; color?: string; bend?: number}> = ({x1, y1, x2, y2, at, color = INK, bend = 60}) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - bend;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const h1 = [x2 - 22 * Math.cos(ang - 0.5), y2 - 22 * Math.sin(ang - 0.5)];
  const h2 = [x2 - 22 * Math.cos(ang + 0.5), y2 - 22 * Math.sin(ang + 0.5)];
  return (
    <g style={{filter: 'url(#wob)'}}>
      <Draw d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} at={at} dur={12} stroke={color} width={5} />
      <Draw d={`M${h1[0]},${h1[1]} L${x2},${y2} L${h2[0]},${h2[1]}`} at={at + 12} dur={5} stroke={color} width={5} />
    </g>
  );
};

// ---------------------------------------------------------------------------
// Scènes
// ---------------------------------------------------------------------------
const CHURCH =
  'M760,720 L760,470 L960,330 L1160,470 L1160,720 Z M930,330 L930,250 L990,250 L990,330 M960,250 L960,190 M935,215 L985,215 M920,720 L920,600 Q960,560 1000,600 L1000,720 M820,520 L880,520 L880,580 L820,580 Z M1040,520 L1100,520 L1100,580 L1040,580 Z';

const SceneChurch: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 60, width: '100%', textAlign: 'center'}}>
        <Write text="Nobody ever joined a cult." at={4} size={84} hi="cult" />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g style={{filter: 'url(#wob)'}}>
          <Draw d={CHURCH} at={T(1.2)} dur={T(2)} fill="#fff3d6" fillAt={T(3)} />
          <Draw d="M300,725 L1620,725" at={T(1)} dur={T(1.2)} width={4} />
        </g>
        {[0, 1, 2, 3].map((i) => (
          <g key={i} style={{filter: 'url(#wob)'}}>
            <Draw d={HeartD(720 + i * 160 + (i > 1 ? 160 : 0), 250 - (i % 2) * 40, 22)} at={T(3.4) + i * 6} dur={10} stroke={RED} width={5} fill={RED} />
          </g>
        ))}
        <Stick x={560} y={725} pose="wave" at={T(3.6)} />
        <Stick x={660} y={725} pose="stand" at={T(3.9)} scarf={BLUE} />
        <Stick x={1260} y={725} pose="cheer" at={T(4.2)} />
        <Stick x={1360} y={725} pose="stand" at={T(4.5)} mood="happy" scarf={RED} />
        {frame > T(4.5) && (
          <>
            <Arrow x1={420} y1={420} x2={760} y2={520} at={T(4.6)} />
            <Arrow x1={1500} y1={430} x2={1160} y2={540} at={T(5.6)} bend={70} />
          </>
        )}
      </svg>
      <div style={{position: 'absolute', left: 150, top: 350, transform: 'rotate(-4deg)'}}>
        <Write text="fought racism" at={T(4.5)} font={HAND} size={52} />
      </div>
      <div style={{position: 'absolute', left: 1480, top: 360, transform: 'rotate(3deg)'}}>
        <Write text="fed the poor" at={T(5.5)} font={HAND} size={52} />
      </div>
      <div style={{position: 'absolute', left: 820, top: 790, transform: 'rotate(-2deg)'}}>
        <Write text="you belong here ♥" at={T(6.2)} font={HAND} size={56} color={RED} />
      </div>
    </AbsoluteFill>
  );
};

const SAMERICA =
  'M820,250 L960,240 L1080,300 L1170,370 L1190,430 L1140,520 L1090,600 L1050,690 L990,780 L950,880 L920,900 L905,820 L890,720 L860,640 L810,560 L760,470 L760,380 L790,300 Z';

const SceneMap: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = Math.round(interpolate(frame, [T(3.5), T(5.5)], [0, 909], {...CL, easing: Easing.out(Easing.cubic)}));
  const pop = spring({frame: frame - T(3.5), fps, config: {damping: 10}});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: 70}}>
        <Write text="Guyana, 1978." at={4} size={80} />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g style={{filter: 'url(#wob)'}}>
          <Draw d={SAMERICA} at={8} dur={T(1.4)} fill="#d8f0d0" fillAt={T(1.5)} />
          <Draw d="M955,268 L995,308 M995,268 L955,308" at={T(2)} dur={8} stroke={RED} width={8} />
          <Draw d="M1015,275 C1160,200 1300,240 1360,330" at={T(2.3)} dur={12} width={4} />
        </g>
        {frame > T(3.4) && (
          <g transform={`translate(1460, 560) scale(${pop})`} style={{filter: 'url(#wob)'}}>
            <ellipse cx={0} cy={0} rx={250} ry={130} fill="none" stroke={RED} strokeWidth={6} />
          </g>
        )}
      </svg>
      <div style={{position: 'absolute', left: 1330, top: 330, transform: 'rotate(-3deg)'}}>
        <Write text="Jonestown" at={T(2.4)} font={HAND} size={56} color={RED} />
      </div>
      {frame > T(3.4) && (
        <div style={{position: 'absolute', left: 1210, top: 455, width: 500, textAlign: 'center', transform: `scale(${pop}) rotate(-2deg)`}}>
          <div style={{fontFamily: MARKER, fontSize: 150, color: INK, lineHeight: 1}}>{n}</div>
          <div style={{fontFamily: HAND, fontSize: 46, color: INK}}>people. one day.</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const SceneSteps: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    {label: 'LOVE', color: RED},
    {label: 'SMALL STEPS', color: BLUE},
    {label: 'CONTROL', color: '#7b2cbf'},
    {label: 'NO EXIT', color: INK},
  ];
  const walkP = interpolate(frame, [T(3), T(7.5)], [0, 1], {...CL, easing: Easing.inOut(Easing.quad)});
  const stepW = 330;
  const sx = 240 + walkP * stepW * 3.4;
  const sy = 470 + walkP * 3.4 * 110;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 60, width: '100%', textAlign: 'center'}}>
        {frame < T(3) ? <Write text="So how does it happen?" at={4} size={84} /> : <Write text="One step at a time." at={T(3)} size={84} />}
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {steps.map((st, i) => {
          const x = 180 + i * stepW;
          const y = 480 + i * 110;
          return (
            <g key={st.label} style={{filter: 'url(#wob)'}}>
              <Draw d={`M${x},${y} L${x + stepW},${y} L${x + stepW},${y + 110}`} at={10 + i * 8} dur={12} />
              <Draw d={`M${x + 20},${y + 12} L${x + stepW - 20},${y + 12} L${x + stepW - 20},${y + 96} L${x + 20},${y + 96} Z`} at={T(1.5) + i * 10} dur={10} stroke={st.color} width={4} fill={`${st.color}22`} />
            </g>
          );
        })}
        <Stick x={sx} y={sy} pose={walkP > 0 && walkP < 1 ? 'walk' : 'think'} at={T(1)} mood={walkP > 0.7 ? 'sad' : 'happy'} s={0.9} />
        {frame > T(8) && (
          <g style={{filter: 'url(#wob)'}}>
            <Draw d="M1640,700 C1640,640 1720,640 1720,690 C1720,730 1680,735 1680,775 M1680,815 L1680,818" at={T(8)} dur={14} stroke={RED} width={9} />
          </g>
        )}
      </svg>
      {steps.map((st, i) => (
        <div key={st.label} style={{position: 'absolute', left: 180 + i * 330, top: 498 + i * 110, width: 330, textAlign: 'center'}}>
          <Write text={st.label} at={T(1.8) + i * 10} font={MARKER} size={40} color={st.color} cps={30} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Assemblage
// ---------------------------------------------------------------------------
type Cap = [number, number, string];
const CAPS: Cap[] = [
  [0, 3.5, 'Nobody ever joined a cult.'],
  [3.5, 7, 'They joined a church that fought racism, and fed the poor.'],
  [7, 10.5, 'A group that finally made them feel like they belonged.'],
  [10.5, 13, 'In 1978, in the jungle of Guyana…'],
  [13, 18, '…more than nine hundred of them died on a single day.'],
  [18, 21, 'So how does a normal person end up there?'],
  [21, 30, "It doesn't happen in one step. It happens in four."],
];

const Caps: React.FC = () => {
  const frame = useCurrentFrame();
  const c = CAPS.find(([a, b]) => frame >= T(a) && frame < T(b));
  if (!c) return null;
  const o = Math.min(1, (frame - T(c[0])) / 5, (T(c[1]) - frame) / 5);
  return (
    <div style={{position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', opacity: o}}>
      <span style={{fontFamily: HAND, fontSize: 38, color: INK, background: 'rgba(255,255,255,.85)', padding: '4px 20px', borderRadius: 8, border: `2px solid ${INK}`}}>{c[2]}</span>
    </div>
  );
};

// Fond papier avec quadrillage léger de cahier
const Paper: React.FC = () => (
  <AbsoluteFill style={{background: PAPER, backgroundImage: 'linear-gradient(rgba(67,97,238,.07) 2px, transparent 2px), linear-gradient(90deg, rgba(67,97,238,.07) 2px, transparent 2px)', backgroundSize: '60px 60px'}} />
);

// Transition : la page « s'efface » par un balayage blanc
const Swipe: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 14], [-2000, 2000], {...CL, easing: Easing.inOut(Easing.cubic)});
  return <div style={{position: 'absolute', top: 0, left: x, width: 1920, height: 1080, background: PAPER, boxShadow: '0 0 60px rgba(0,0,0,.15)'}} />;
};

export const DOODLE_HOOK_FRAMES = T(30);

export const DoodleHook: React.FC = () => (
  <AbsoluteFill>
    <Paper />
    <Wobble />
    <Sequence durationInFrames={T(10.5)}>
      <SceneChurch />
    </Sequence>
    <Sequence from={T(10.5)} durationInFrames={T(7.5)}>
      <SceneMap />
    </Sequence>
    <Sequence from={T(18)} durationInFrames={T(12)}>
      <SceneSteps />
    </Sequence>
    {[T(10.5) - 7, T(18) - 7].map((f) => (
      <Sequence key={f} from={f} durationInFrames={14}>
        <Swipe />
      </Sequence>
    ))}
    <Audio src={staticFile('doodle/bed.wav')} volume={0.35} />
    {[4, T(1.2), T(4.5), T(10.5) + 4, T(10.5) + 8, T(18) + 4, T(18) + T(1.5)].map((f, i) => (
      <Sequence key={i} from={f} durationInFrames={T(1)}>
        <Audio src={staticFile('doodle/scribble.wav')} volume={0.5} />
      </Sequence>
    ))}
    {[T(3.4), T(3.6), T(3.9), T(4.2), T(4.5), T(10.5) + T(3.5)].map((f, i) => (
      <Sequence key={`p${i}`} from={f} durationInFrames={8}>
        <Audio src={staticFile('doodle/pop.wav')} volume={0.4} />
      </Sequence>
    ))}
    <Caps />
  </AbsoluteFill>
);
