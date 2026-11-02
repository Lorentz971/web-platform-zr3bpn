import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

const FONT = '"DejaVu Sans", "Liberation Sans", Arial, sans-serif';
const MONO = '"DejaVu Sans Mono", monospace';
const BG = '#0d0f12';
const PANEL = '#2a2f36';
const AMBER = '#ffb547';
const RED = '#ff4d4d';
const PALE = '#e8e4da';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const GROUPS = [
  'SLIGHT SHOCK',
  'MODERATE SHOCK',
  'STRONG SHOCK',
  'VERY STRONG SHOCK',
  'INTENSE SHOCK',
  'EXTREME INTENSITY SHOCK',
  'DANGER: SEVERE SHOCK',
  'XXX',
];

// Texte cinétique centré
const Line: React.FC<{text: string; size?: number; color?: string; delay?: number; y?: number}> = ({
  text,
  size = 72,
  color = PALE,
  delay = 0,
  y = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 16}});
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 800,
        color,
        textAlign: 'center',
        opacity: s,
        transform: `translateY(${(1 - s) * 40 + y}px)`,
      }}
    >
      {text}
    </div>
  );
};

// Effet machine à écrire
const Typewriter: React.FC<{text: string; start?: number; cps?: number}> = ({text, start = 0, cps = 18}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.floor(((frame - start) / 30) * cps));
  const cursor = Math.floor(frame / 15) % 2 === 0 ? '▌' : ' ';
  return (
    <span style={{fontFamily: MONO}}>
      {text.slice(0, n)}
      {n < text.length ? cursor : ''}
    </span>
  );
};

// Scène 1 : 1961, Yale
const SceneDate: React.FC = () => {
  const frame = useCurrentFrame();
  const flicker = frame < 20 ? (Math.sin(frame * 2.3) > 0 ? 1 : 0.2) : 1;
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center', opacity: flicker}}>
      <div style={{fontSize: 64, color: AMBER, letterSpacing: 6}}>
        <Typewriter text="NEW HAVEN · 1961" start={8} />
      </div>
      <div style={{fontSize: 40, color: PALE, marginTop: 30, opacity: interpolate(frame, [50, 65], [0, 0.85], clamp)}}>
        <Typewriter text="Wanted: volunteers for a memory study. $4.50." start={50} cps={30} />
      </div>
    </AbsoluteFill>
  );
};

// Le générateur de chocs (30 interrupteurs)
const ShockPanel: React.FC<{litUntil: number; pressed?: number; scale?: number}> = ({litUntil, pressed = -1, scale = 1}) => {
  const frame = useCurrentFrame();
  const W = 54;
  const GAP = 3;
  return (
    <div style={{transform: `scale(${scale})`, transformOrigin: 'center'}}>
      <div style={{background: PANEL, padding: '40px 50px', borderRadius: 16, boxShadow: '0 30px 80px rgba(0,0,0,.6)', border: '2px solid #444b55'}}>
        <div style={{fontFamily: MONO, color: '#9aa3ad', fontSize: 22, marginBottom: 24, letterSpacing: 3}}>
          SHOCK GENERATOR, TYPE ZLB · OUTPUT 15 VOLTS – 450 VOLTS
        </div>
        {/* étiquettes de catégories */}
        <div style={{display: 'flex', gap: GAP}}>
          {GROUPS.map((g, i) => {
            const n = i === 7 ? 2 : 4;
            const on = litUntil >= i * 4;
            return (
              <div
                key={g}
                style={{
                  width: n * W + (n - 1) * GAP,
                  textAlign: 'center',
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 14,
                  color: on ? (i >= 6 ? RED : AMBER) : '#555c66',
                  borderBottom: `3px solid ${on ? (i >= 6 ? RED : AMBER) : '#555c66'}`,
                  paddingBottom: 6,
                  height: 40,
                }}
              >
                {g}
              </div>
            );
          })}
        </div>
        {/* interrupteurs */}
        <div style={{display: 'flex', gap: GAP, marginTop: 16}}>
          {Array.from({length: 30}, (_, i) => {
            const on = i <= litUntil;
            const isPressed = i === pressed;
            const glow = isPressed ? 0.6 + 0.4 * Math.sin(frame / 3) : 0;
            return (
              <div key={i} style={{width: W, textAlign: 'center'}}>
                <div style={{fontFamily: MONO, fontSize: 15, color: on ? PALE : '#555c66', marginBottom: 8}}>{(i + 1) * 15}</div>
                <div
                  style={{
                    margin: '0 auto',
                    width: 30,
                    height: 54,
                    borderRadius: 6,
                    background: isPressed ? RED : on ? '#d9d4c7' : '#3a4049',
                    boxShadow: isPressed ? `0 0 ${30 * glow}px ${RED}` : 'none',
                    transform: isPressed ? 'translateY(8px)' : 'none',
                  }}
                />
                <div style={{width: 12, height: 12, borderRadius: 6, margin: '10px auto 0', background: i < pressed ? AMBER : '#222'}} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Scène 2 : le panneau s'allume interrupteur par interrupteur
const ScenePanel: React.FC = () => {
  const frame = useCurrentFrame();
  const lit = Math.floor(interpolate(frame, [15, 170], [-1, 29], clamp));
  const zoom = interpolate(frame, [0, 240], [0.92, 1.05], clamp);
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center'}}>
      <ShockPanel litUntil={lit} scale={zoom} />
      <div style={{position: 'absolute', bottom: 110, width: '100%'}}>
        {frame > 20 && frame < 110 && <Line text="30 switches." size={58} delay={20} />}
        {frame >= 110 && frame < 175 && <Line text="15 volts…" size={58} delay={110} />}
        {frame >= 175 && <Line text="…to XXX." size={58} color={RED} delay={175} />}
      </div>
    </AbsoluteFill>
  );
};

// Personnage stylisé
const Person: React.FC<{color: string; coat?: boolean; seated?: boolean}> = ({color, coat, seated}) => (
  <svg width={140} height={seated ? 200 : 260} viewBox={`0 0 140 ${seated ? 200 : 260}`}>
    <circle cx={70} cy={40} r={32} fill={color} />
    <rect x={25} y={80} width={90} height={seated ? 90 : 150} rx={30} fill={coat ? '#8e949c' : color} />
    {coat && <rect x={65} y={84} width={10} height={140} fill="#6d737a" />}
  </svg>
);

// Scène 3 : le dispositif en coupe
const SceneRoom: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s1 = spring({frame: frame - 5, fps, config: {damping: 15}});
  const s2 = spring({frame: frame - 25, fps, config: {damping: 15}});
  const s3 = spring({frame: frame - 70, fps, config: {damping: 15}});
  const wallPulse = frame > 120 ? 0.5 + 0.5 * Math.abs(Math.sin(frame / 8)) : 0;
  return (
    <AbsoluteFill style={{background: BG}}>
      {/* pièces */}
      <div style={{position: 'absolute', left: 140, top: 180, width: 1000, height: 640, border: '4px solid #39404a', borderRadius: 8}} />
      <div style={{position: 'absolute', left: 1160, top: 180, width: 620, height: 640, border: '4px solid #39404a', borderRadius: 8}} />
      <div style={{position: 'absolute', left: 1140, top: 180, width: 20, height: 640, background: `rgba(255,77,77,${0.15 + wallPulse * 0.5})`}} />
      {/* sujet */}
      <div style={{position: 'absolute', left: 380, top: 520, opacity: s1, transform: `translateY(${(1 - s1) * 40}px)`}}>
        <Person color={AMBER} seated />
        <div style={{fontFamily: FONT, color: AMBER, fontSize: 30, textAlign: 'center', fontWeight: 800}}>YOU</div>
      </div>
      <div style={{position: 'absolute', left: 560, top: 560, width: 260, height: 90, background: PANEL, borderRadius: 10, opacity: s1}} />
      {/* élève */}
      <div style={{position: 'absolute', left: 1400, top: 520, opacity: s2, transform: `translateY(${(1 - s2) * 40}px)`}}>
        <Person color="#6fb3d2" seated />
        <div style={{fontFamily: FONT, color: '#6fb3d2', fontSize: 30, textAlign: 'center', fontWeight: 800}}>THE LEARNER</div>
      </div>
      {/* expérimentateur */}
      <div style={{position: 'absolute', left: 170, top: 400, opacity: s3, transform: `translateX(${(1 - s3) * -60}px)`}}>
        <Person color="#c9ced4" coat />
        <div style={{fontFamily: FONT, color: '#c9ced4', fontSize: 26, textAlign: 'center', fontWeight: 800, width: 140}}>LAB COAT</div>
      </div>
      <div style={{position: 'absolute', top: 70, width: '100%'}}>
        {frame < 120 ? (
          <Line text="Every wrong answer: one more switch." size={52} delay={10} />
        ) : (
          <Line text="He's strapped to a chair next door." size={52} color={RED} delay={120} />
        )}
      </div>
    </AbsoluteFill>
  );
};

// Scène 4 : ce qu'on croit vs ce qui s'est passé
const SceneResult: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dots = Array.from({length: 40}, (_, i) => i);
  const reveal = interpolate(frame, [110, 200], [0, 26], clamp);
  return (
    <AbsoluteFill style={{background: BG, alignItems: 'center'}}>
      <div style={{marginTop: 110}}>
        <Line text="Most people are sure they'd stop early." size={56} delay={5} />
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 90px)', gap: 22, marginTop: 90}}>
        {dots.map((i) => {
          const s = spring({frame: frame - 30 - i, fps, config: {damping: 20}});
          const red = i < reveal;
          return (
            <svg key={i} width={90} height={110} viewBox="0 0 140 170" style={{opacity: s, transform: `scale(${0.6 + 0.4 * s})`}}>
              <circle cx={70} cy={38} r={30} fill={red ? RED : '#5a626c'} />
              <rect x={30} y={76} width={80} height={90} rx={28} fill={red ? RED : '#5a626c'} />
            </svg>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 90, width: '100%', opacity: interpolate(frame, [110, 125], [0, 1], clamp)}}>
        <Line text={`${Math.round(reveal)} out of 40 went all the way.`} size={56} color={RED} delay={110} />
      </div>
    </AbsoluteFill>
  );
};

// Scène 5 : 65% + titre
const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = spring({frame, fps, config: {damping: 9, mass: 1.2}});
  const shake = frame > 8 && frame < 22 ? Math.sin(frame * 4) * 14 : 0;
  const titleOn = frame > 75;
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center', transform: `translate(${shake}px, ${shake / 2}px)`}}>
      {!titleOn ? (
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 320, color: RED, transform: `translateY(${(1 - drop) * -700}px)`}}>65%</div>
      ) : (
        <div>
          <Line text="WOULD YOU HAVE" size={110} delay={75} />
          <Line text="PRESSED IT?" size={150} color={AMBER} delay={85} />
        </div>
      )}
    </AbsoluteFill>
  );
};

const Fade: React.FC<{children: React.ReactNode; duration: number}> = ({children, duration}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, duration - 8, duration], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export const MilgramHook: React.FC = () => {
  // durées : 120 + 240 + 240 + 270 + 180 = 1050 images (35 s)
  return (
    <AbsoluteFill style={{background: BG}}>
      <Sequence from={0} durationInFrames={120}>
        <Fade duration={120}><SceneDate /></Fade>
      </Sequence>
      <Sequence from={120} durationInFrames={240}>
        <Fade duration={240}><ScenePanel /></Fade>
      </Sequence>
      <Sequence from={360} durationInFrames={240}>
        <Fade duration={240}><SceneRoom /></Fade>
      </Sequence>
      <Sequence from={600} durationInFrames={270}>
        <Fade duration={270}><SceneResult /></Fade>
      </Sequence>
      <Sequence from={870} durationInFrames={180}>
        <SceneTitle />
      </Sequence>
    </AbsoluteFill>
  );
};

export const MILGRAM_FRAMES = 1050;
export {Easing};
