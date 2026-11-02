// Test de style « motion design 2D plat » : l'accroche de la vidéo sur les sectes (35 s).
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {K, T, CL, FONT, Camera, SceneFade, Sky, Layer, hills, Tree, Motes, Person, Headline, ChapterChip, Callout, LowerCaps, Cap} from './flat';

const CAPS: Cap[] = [
  [0, 3, 'Nobody ever joined a cult.'],
  [3, 7, 'They joined a church that fought racism.'],
  [7, 10, 'A community that fed the poor.'],
  [10, 13, 'A group that finally made them feel like they belonged.'],
  [13, 19, 'In 1978, in the jungle of Guyana, more than nine hundred of those people died on a single day.'],
  [19, 22, 'At a place called Jonestown.'],
  [22, 26, "Most of them weren't crazy. They weren't stupid."],
  [26, 30, 'Years earlier, they had simply said yes to something that looked good.'],
  [30, 33, 'So how does a normal person end up there?'],
  [33, 35, 'It happens in four steps.'],
];

// ---------------------------------------------------------------------------
// Icônes plates
// ---------------------------------------------------------------------------
const IconChurch: React.FC<{c?: string}> = ({c = K.white}) => (
  <svg width={40} height={40} viewBox="0 0 40 40">
    <polygon points="20,4 34,16 6,16" fill={c} />
    <rect x={9} y={16} width={22} height={18} fill={c} />
    <rect x={17} y={24} width={6} height={10} fill="#1b2433" />
  </svg>
);
const IconPin: React.FC = () => (
  <svg width={40} height={40} viewBox="0 0 40 40">
    <path d="M20,36 C10,24 8,19 8,14 C8,7 13,3 20,3 C27,3 32,7 32,14 C32,19 30,24 20,36 Z" fill={K.accent} />
    <circle cx={20} cy={14} r={5} fill="#1b2433" />
  </svg>
);

// ---------------------------------------------------------------------------
// Scène 1 : l'église au coucher du soleil, les gens arrivent (0 – 12 s)
// ---------------------------------------------------------------------------
const Church: React.FC<{x: number; y: number}> = ({x, y}) => {
  const frame = useCurrentFrame();
  const glow = 0.85 + 0.15 * Math.sin(frame / 9);
  const win = `rgba(255,209,102,${glow})`;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* clocher */}
      <rect x={-40} y={-330} width={80} height={140} fill="#e9e2d4" />
      <rect x={0} y={-330} width={40} height={140} fill="#cfc6b4" />
      <polygon points="-52,-330 0,-420 52,-330" fill="#7a4b3a" />
      <polygon points="0,-420 52,-330 0,-330" fill="#5f3a2d" />
      <circle cx={0} cy={-270} r={18} fill={win} />
      {/* nef */}
      <rect x={-210} y={-190} width={420} height={190} fill="#e9e2d4" />
      <rect x={60} y={-190} width={150} height={190} fill="#cfc6b4" />
      <polygon points="-230,-190 0,-290 230,-190" fill="#7a4b3a" />
      <polygon points="0,-290 230,-190 0,-190" fill="#5f3a2d" />
      {[-150, -90, 90, 150].map((wx) => (
        <rect key={wx} x={wx - 18} y={-150} width={36} height={60} rx={18} fill={win} />
      ))}
      <rect x={-32} y={-100} width={64} height={100} rx={32} fill="#3d2a22" />
      <rect x={-26} y={-90} width={52} height={90} rx={26} fill={win} opacity={0.6} />
    </g>
  );
};

const ChurchUI: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ChapterChip icon={<IconChurch />} label="PEOPLES TEMPLE · 1970S" delay={6} />
      {frame < T(7) ? <Headline text="Nobody ever joined a cult." accent="cult." size={70} delay={4} /> : <Headline text="They joined a community." accent="community." size={70} delay={T(7)} />}
    </AbsoluteFill>
  );
};

const SceneChurch: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const people = Array.from({length: 10}, (_, i) => {
    const fromLeft = i % 2 === 0;
    const start = fromLeft ? -120 - i * 60 : 2040 + i * 60;
    const end = fromLeft ? 760 - (i >> 1) * 70 : 1160 + (i >> 1) * 70;
    const p = interpolate(frame, [i * 8, i * 8 + T(7)], [0, 1], {...CL, easing: Easing.out(Easing.quad)});
    return {x: start + (end - start) * p, walking: p < 0.98, dir: (fromLeft ? 1 : -1) as 1 | -1, i};
  });
  return (
    <Camera dur={T(12)} to={1.1} panY={-20}>
      <Sky top="#2b2d5c" mid="#c4627a" bottom="#f4a261" sun={{x: 960, y: 640, r: 60, color: '#ffd29a'}} />
      <Layer d={hills(640, 40, 1)} color="#7d4f6e" speed={0.15} />
      <Layer d={hills(700, 30, 4)} color="#5a3a5a" speed={0.3}>
        {Array.from({length: 18}, (_, i) => (
          <Tree key={i} x={i * 140 + 40} y={700 + Math.sin(i) * 20} h={90 + (i % 3) * 30} color="#4a2f4c" />
        ))}
      </Layer>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={800} width={1920} height={280} fill="#3a2440" />
        <rect x={0} y={800} width={1920} height={10} fill="#4b3050" />
        <Church x={960} y={810} />
        {people.map((pp) => (
          <Person key={pp.i} x={pp.x} y={812 + (pp.i % 3) * 18} h={104} shirt={K.shirts[pp.i % K.shirts.length]} skin={K.skin[pp.i % 4]} walk={pp.walking ? 1 : 0} dir={pp.dir} seed={pp.i} />
        ))}
      </svg>
      <Motes n={30} color="#ffd29a" seed={2} />
      {frame > T(3) && <Callout x={960} y={570} dx={260} dy={-120} label="FOUGHT RACISM" delay={T(3)} />}
      {frame > T(7.5) && <Callout x={760} y={700} dx={-240} dy={-160} label="FED THE POOR" delay={T(7.5)} color={K.accent2} />}
      {spring({frame: frame - T(10), fps}) > 0 && frame > T(10) && <Callout x={1180} y={705} dx={220} dy={-60} label="A PLACE TO BELONG" delay={T(10)} color={K.accent} />}
    </Camera>
  );
};

// ---------------------------------------------------------------------------
// Scène 2 : carte du monde, zoom sur la Guyane (12 – 22 s)
// ---------------------------------------------------------------------------
const W = 1920;
const H = 960;
const proj = (lon: number, lat: number) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
const shape = (pts: number[][]) => 'M' + pts.map(([lo, la]) => proj(lo, la).map((v) => v.toFixed(0)).join(',')).join(' L') + ' Z';
const CONTINENTS = [
  [[-168, 66], [-140, 70], [-95, 72], [-80, 62], [-60, 50], [-66, 44], [-75, 35], [-81, 25], [-90, 29], [-97, 26], [-105, 20], [-90, 15], [-83, 9], [-78, 8], [-92, 16], [-106, 23], [-115, 31], [-124, 40], [-125, 49], [-135, 58], [-150, 60], [-165, 60]],
  [[-55, 82], [-25, 82], [-20, 70], [-45, 60], [-55, 68]],
  [[-80, 9], [-72, 12], [-62, 10], [-50, 1], [-35, -6], [-39, -15], [-48, -26], [-58, -38], [-65, -41], [-68, -52], [-74, -50], [-72, -35], [-71, -18], [-77, -10], [-81, -3]],
  [[-10, 36], [-9, 44], [-2, 48], [-5, 58], [5, 62], [15, 69], [30, 70], [40, 66], [45, 55], [40, 45], [28, 41], [20, 39], [12, 44], [5, 43]],
  [[-17, 21], [-10, 35], [10, 37], [32, 31], [35, 28], [43, 12], [51, 12], [40, -5], [40, -16], [33, -26], [20, -35], [15, -28], [12, -15], [8, 4], [-8, 4], [-15, 10]],
  [[28, 41], [40, 45], [45, 55], [40, 66], [60, 70], [100, 77], [140, 72], [180, 68], [170, 60], [160, 58], [140, 50], [130, 42], [122, 30], [120, 22], [108, 10], [103, 1], [98, 8], [92, 22], [80, 10], [73, 20], [66, 25], [57, 25], [52, 18], [43, 12], [35, 28], [36, 36]],
  [[114, -22], [122, -17], [131, -12], [137, -12], [142, -11], [146, -19], [153, -27], [150, -37], [140, -38], [131, -31], [115, -34]],
];

const SceneMap: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [gx, gy] = proj(-59, 7.5);
  const zoom = interpolate(frame, [T(0.5), T(4)], [1, 4.2], {...CL, easing: Easing.inOut(Easing.cubic)});
  const cx = interpolate(zoom, [1, 4.2], [W / 2, gx]);
  const cy = interpolate(zoom, [1, 4.2], [H / 2 + 60, gy]);
  const pin = spring({frame: frame - T(4.2), fps, config: {damping: 9}});
  const count = Math.round(interpolate(frame, [T(5), T(7.5)], [0, 909], {...CL, easing: Easing.out(Easing.cubic)}));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#123a46, #0c2a33)'}}>
      <div style={{position: 'absolute', left: 0, top: 60, width: W, height: H, transform: `translate(${W / 2 - cx}px, ${H / 2 - cy}px) scale(${zoom})`, transformOrigin: `${cx}px ${cy}px`}}>
        <svg width={W} height={H}>
          {[...Array(7)].map((_, i) => (
            <line key={`la${i}`} x1={0} x2={W} y1={(i + 1) * (H / 8)} y2={(i + 1) * (H / 8)} stroke="rgba(255,255,255,.05)" strokeWidth={1 / zoom} />
          ))}
          {CONTINENTS.map((c, i) => (
            <path key={i} d={shape(c)} fill={i === 2 ? '#e2d3b0' : '#cdbf9e'} stroke="#b5a785" strokeWidth={2 / zoom} />
          ))}
          <circle cx={gx} cy={gy} r={(10 * pin) / zoom} fill={K.accent} />
          <circle cx={gx} cy={gy} r={((10 + (frame % 30) * 1.2) * pin) / zoom} fill="none" stroke={K.accent} strokeWidth={2 / zoom} opacity={1 - (frame % 30) / 30} />
        </svg>
      </div>
      <ChapterChip icon={<IconPin />} label="NOVEMBER 18, 1978" delay={T(4)} />
      {frame > T(4.4) && <Callout x={960} y={540} dx={-220} dy={-150} label="JONESTOWN, GUYANA" delay={T(4.4)} />}
      {frame > T(5) && (
        <div style={{position: 'absolute', left: 1120, top: 200, fontFamily: FONT, color: K.white, textShadow: '0 4px 20px rgba(0,0,0,.5)'}}>
          <div style={{fontWeight: 900, fontSize: 150, color: K.accent, lineHeight: 1}}>{count}</div>
          <div style={{fontWeight: 800, fontSize: 30, letterSpacing: 3}}>PEOPLE DIED IN ONE DAY</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scène 3 : la jungle la nuit (22 – 30 s)
// ---------------------------------------------------------------------------
const SceneJungle: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Camera dur={T(8)} from={1.1} to={1.04} panX={-30}>
      <Sky top="#070b1c" mid="#13223a" bottom="#1d3a3a" />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {Array.from({length: 80}, (_, i) => (
          <circle key={i} cx={(i * 263) % 1920} cy={(i * 137) % 520} r={1 + (i % 3) * 0.6} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin((frame + i * 13) / 30))} />
        ))}
        <circle cx={1640} cy={300} r={56} fill="#f4f1ea" opacity={0.9} />
        <circle cx={1662} cy={290} r={50} fill="#13223a" />
      </svg>
      <Layer d={hills(600, 50, 2)} color="#16303a" speed={0.12}>
        {Array.from({length: 22}, (_, i) => (
          <Tree key={i} x={i * 120} y={610 + Math.sin(i * 1.3) * 30} h={150 + (i % 4) * 40} color="#16303a" kind={i % 3 === 0 ? 'palm' : 'round'} />
        ))}
      </Layer>
      <Layer d={hills(760, 30, 6)} color="#0f2229" speed={0.3}>
        {Array.from({length: 16}, (_, i) => (
          <Tree key={i} x={i * 170 + 60} y={770 + Math.sin(i) * 20} h={220 + (i % 3) * 60} color="#0f2229" kind={i % 2 ? 'palm' : 'round'} />
        ))}
      </Layer>
      {/* pavillon éclairé au loin */}
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <polygon points="880,700 1040,700 1000,660 920,660" fill="#2a3b3a" />
        <rect x={900} y={700} width={120} height={50} fill="#1d2b2a" />
        <rect x={910} y={708} width={100} height={30} fill="rgba(255,209,102,.75)" />
        <rect x={0} y={860} width={1920} height={220} fill="#081418" />
      </svg>
      <Motes n={36} color="#c8ff8a" glow seed={5} />
      {frame < T(4) ? <Headline text="Most of them weren't crazy." accent="crazy." size={66} delay={6} /> : <Headline text="They simply said yes." accent="yes." size={76} delay={T(4)} />}
    </Camera>
  );
};

// ---------------------------------------------------------------------------
// Scène 4 : les quatre étapes (30 – 35 s)
// ---------------------------------------------------------------------------
const STEPS = [
  {n: 1, label: 'LOVE', icon: <path d="M30,52 C14,38 4,30 4,18 C4,9 11,4 18,4 C24,4 28,8 30,12 C32,8 36,4 42,4 C49,4 56,9 56,18 C56,30 46,38 30,52 Z" />},
  {n: 2, label: 'SMALL STEPS', icon: <path d="M4,52 L4,40 L18,40 L18,28 L32,28 L32,16 L46,16 L46,4 L56,4 L56,52 Z" />},
  {n: 3, label: 'CONTROL', icon: <g><circle cx={30} cy={28} r={22} fill="none" stroke="currentColor" strokeWidth={6} /><circle cx={30} cy={28} r={8} /></g>},
  {n: 4, label: 'NO EXIT', icon: <g><rect x={14} y={4} width={32} height={48} rx={3} fill="none" stroke="currentColor" strokeWidth={6} /><line x1={6} y1={52} x2={54} y2={4} stroke="currentColor" strokeWidth={6} /></g>},
];

const SceneSteps: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1b2433, #0f151f)'}}>
      <Motes n={30} seed={8} />
      {frame < T(3) ? <Headline text="So how does it happen?" accent="how" size={68} top={150} delay={4} /> : <Headline text="In four steps." accent="four" size={84} top={150} delay={T(3)} />}
      <div style={{position: 'absolute', top: 430, width: '100%', display: 'flex', justifyContent: 'center', gap: 60}}>
        {STEPS.map((st, i) => {
          const p = spring({frame: frame - 10 - i * 8, fps, config: {damping: 14}});
          const col = i === 3 ? K.red : i === 0 ? K.accent : K.white;
          return (
            <div key={st.n} style={{width: 260, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
              <div style={{width: 170, height: 170, margin: '0 auto', borderRadius: 18, background: 'rgba(244,241,234,.06)', border: `3px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: col}}>
                <svg width={84} height={84} viewBox="0 0 60 56" fill="currentColor">
                  {st.icon}
                </svg>
              </div>
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 22, color: K.dim, marginTop: 18, letterSpacing: 3}}>STEP {st.n}</div>
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: col, letterSpacing: 2}}>{st.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Assemblage
// ---------------------------------------------------------------------------
export const FLAT_HOOK_FRAMES = T(35);

export const FlatHook: React.FC = () => (
  <AbsoluteFill style={{background: '#0f151f'}}>
    <Sequence durationInFrames={T(12.4)}>
      <SceneFade dur={T(12.4)} inF={1}>
        <SceneChurch />
        <ChurchUI />
      </SceneFade>
    </Sequence>
    <Sequence from={T(12)} durationInFrames={T(10.4)}>
      <SceneFade dur={T(10.4)}>
        <SceneMap />
      </SceneFade>
    </Sequence>
    <Sequence from={T(22)} durationInFrames={T(8.4)}>
      <SceneFade dur={T(8.4)}>
        <SceneJungle />
      </SceneFade>
    </Sequence>
    <Sequence from={T(30)} durationInFrames={T(5)}>
      <SceneFade dur={T(5)} outF={1}>
        <SceneSteps />
      </SceneFade>
    </Sequence>
    <Audio src={staticFile('cults/pad_warm.wav')} volume={(f) => (f < T(12) ? 0.45 : interpolate(f, [T(12), T(14)], [0.45, 0], CL))} />
    <Sequence from={T(12)}>
      <Audio src={staticFile('cults/pad_dark.wav')} volume={(f) => interpolate(f, [0, T(2)], [0, 0.5], CL)} />
    </Sequence>
    <Sequence from={T(16.2)} durationInFrames={T(2)}>
      <Audio src={staticFile('cults/stamp.wav')} volume={0.7} />
    </Sequence>
    {[0, 1, 2, 3].map((i) => (
      <Sequence key={i} from={T(30) + 10 + i * 8} durationInFrames={10}>
        <Audio src={staticFile('cults/pop.wav')} volume={0.4} />
      </Sequence>
    ))}
    <LowerCaps caps={CAPS} />
  </AbsoluteFill>
);
