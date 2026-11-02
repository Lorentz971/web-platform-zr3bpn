// Milgram, version « style amélioré » (100 % Remotion), 4 min 10.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {
  C,
  F,
  s,
  clamp,
  FilmLook,
  Shot,
  Backdrop,
  LabBackground,
  Character,
  Shadow,
  Title,
  Typewriter,
  KaraokeCaptions,
  Mini,
  Cap,
  Expr,
} from './kit';

// ---------------------------------------------------------------------------
// Sous-titres (narration du script)
// ---------------------------------------------------------------------------
const CAPS: Cap[] = [
  [0, 4, 'New Haven, 1961. $4.50 for a memory study at Yale.'],
  [4, 8, 'They sit you in front of a machine with thirty switches.'],
  [8, 12, 'The first says fifteen volts. The last one just says… XXX.'],
  [12, 16, 'In the next room, a man is strapped to a chair.'],
  [16, 20, 'Every wrong answer, you press the next switch.'],
  [20, 25, "You're sure you'd stop early. Almost everyone is."],
  [25, 31, 'But when this experiment was really run…'],
  [31, 35, '…sixty-five percent went all the way.'],
  [35, 39, "Here's what you don't know."],
  [39, 42, 'The man in the chair is an actor.'],
  [42, 45, 'The shocks are fake.'],
  [45, 50, 'The real experiment… is you.'],
  [50, 55, 'Behind you stands a calm man in a grey lab coat.'],
  [55, 60, 'Whenever you hesitate, he has four sentences ready.'],
  [76, 80, 'No threats. No weapons. Just four polite sentences.'],
  [80, 85, 'At seventy-five volts, the learner grunts.'],
  [85, 91, 'At a hundred and fifty, he shouts that his heart is bothering him. He wants out.'],
  [91, 95, 'Nearly everyone turns around. "Please continue."'],
  [95, 100, 'At three hundred, he pounds on the wall.'],
  [100, 104, 'After three hundred and thirty… nothing.'],
  [106, 110, '"Treat no answer as a wrong answer."'],
  [110, 115, 'And twenty-six people out of forty kept pressing, all the way to 450.'],
  [115, 120, "They weren't monsters. They were teachers, clerks, salesmen."],
  [120, 125, 'They sweated. They shook. Some laughed nervously.'],
  [125, 130, 'And then they pressed the next switch.'],
  [130, 135, 'So what happened in their heads? Three things.'],
  [135, 140, 'One: authority.'],
  [140, 150, 'Since childhood, your brain has learned that the person in charge usually knows better.'],
  [150, 155, 'Two: tiny steps.'],
  [155, 162, 'Nobody was asked to give 450 volts. Only to go fifteen volts further than last time.'],
  [162, 170, "And every switch you've already pressed makes stopping harder."],
  [170, 175, 'Three: handing off responsibility.'],
  [175, 182, '"Who\'s responsible if he gets hurt?" "I am." And that was enough.'],
  [182, 188, 'Milgram called it the agentic state.'],
  [188, 195, 'You stop feeling like the author of your actions. You become the instrument.'],
  [195, 200, "But obedience wasn't fixed. Milgram ran many versions."],
  [200, 209, 'When the orders came by phone, obedience dropped sharply.'],
  [209, 220, 'When two other volunteers refused to continue… almost nobody went to the end.'],
  [220, 230, 'One person saying no changed everything.'],
  [230, 236, 'So would you have pressed it?'],
  [236, 241, "Honestly? You don't know. Nobody does, until they're in the room."],
  [241, 245, 'But now you know how the trap works.'],
  [245, 250, 'And how to break it: be the first one to say no.'],
];

// ---------------------------------------------------------------------------
// Générateur de chocs, version métal
// ---------------------------------------------------------------------------
const GROUPS = ['SLIGHT SHOCK', 'MODERATE SHOCK', 'STRONG SHOCK', 'VERY STRONG SHOCK', 'INTENSE SHOCK', 'EXTREME INTENSITY SHOCK', 'DANGER: SEVERE SHOCK', 'XXX'];

const ShockPanel: React.FC<{lit: number; pressed?: number; width?: number}> = ({lit, pressed = -1, width = 1700}) => {
  const frame = useCurrentFrame();
  const W = 50;
  const GAP = 4;
  const needle = interpolate(Math.max(lit, 0), [0, 29], [-60, 60]);
  return (
    <div style={{width, transformOrigin: 'top center'}}>
      <div
        style={{
          background: 'linear-gradient(180deg, #4a5059 0%, #31363d 40%, #262a30 100%)',
          borderRadius: 18,
          padding: '28px 46px 30px',
          boxShadow: '0 40px 90px rgba(0,0,0,.7), inset 0 2px 0 rgba(255,255,255,.12)',
          border: '2px solid #5a616b',
          position: 'relative',
        }}
      >
        {[
          [14, 14],
          [14, 'r'],
          ['b', 14],
          ['b', 'r'],
        ].map(([t, l], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              borderRadius: 6,
              background: 'radial-gradient(#9aa1aa, #3b4048)',
              top: t === 'b' ? undefined : (t as number),
              bottom: t === 'b' ? 14 : undefined,
              left: l === 'r' ? undefined : (l as number),
              right: l === 'r' ? 14 : undefined,
            }}
          />
        ))}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18}}>
          <div style={{background: '#1b1e22', border: '1px solid #6b727c', padding: '6px 18px', borderRadius: 6, fontFamily: F.head, color: '#c9cdd2', fontSize: 22, letterSpacing: 4}}>
            SHOCK GENERATOR · TYPE ZLB
          </div>
          {/* voltmètre à aiguille */}
          <svg width={180} height={100} viewBox="-90 -80 180 100">
            <path d="M-80,0 A80,80 0 0 1 80,0" fill="#e9e3d6" stroke="#222" strokeWidth={3} />
            {Array.from({length: 9}, (_, i) => (
              <line key={i} x1={0} y1={-70} x2={0} y2={-60} stroke={i > 6 ? C.red : '#222'} strokeWidth={3} transform={`rotate(${-60 + i * 15})`} />
            ))}
            <line x1={0} y1={0} x2={0} y2={-66} stroke={C.red} strokeWidth={4} transform={`rotate(${needle + Math.sin(frame / 2) * 1.2})`} />
            <circle r={7} fill="#222" />
          </svg>
          <div style={{fontFamily: F.head, color: '#c9cdd2', fontSize: 22, letterSpacing: 3}}>OUTPUT 15 – 450 VOLTS</div>
        </div>
        <div style={{display: 'flex', gap: GAP}}>
          {GROUPS.map((g, i) => {
            const n = i === 7 ? 2 : 4;
            const on = lit >= i * 4;
            const col = on ? (i >= 6 ? C.red : C.amber) : '#5a616b';
            return (
              <div key={g} style={{width: n * W + (n - 1) * GAP, textAlign: 'center', fontFamily: F.head, fontWeight: 500, fontSize: 13, letterSpacing: 1, color: col, borderBottom: `3px solid ${col}`, paddingBottom: 6, height: 38, textShadow: on ? `0 0 10px ${col}` : 'none'}}>
                {g}
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', gap: GAP, marginTop: 14}}>
          {Array.from({length: 30}, (_, i) => {
            const on = i <= lit;
            const isP = i === pressed;
            return (
              <div key={i} style={{width: W, textAlign: 'center'}}>
                <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 14, color: on ? C.ink : '#6b727c', marginBottom: 8}}>{(i + 1) * 15}</div>
                <div style={{margin: '0 auto', width: 26, height: 50, borderRadius: 6, background: '#16181b', boxShadow: 'inset 0 2px 4px rgba(0,0,0,.8)', position: 'relative'}}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 4,
                      width: 18,
                      height: 22,
                      borderRadius: 5,
                      top: on ? 24 : 4,
                      background: isP ? `linear-gradient(${C.red}, #a12a2a)` : on ? 'linear-gradient(#f2f2f2, #9da3aa)' : 'linear-gradient(#8a9099, #4b5058)',
                      boxShadow: isP ? `0 0 22px ${C.red}` : 'none',
                    }}
                  />
                </div>
                <div style={{width: 12, height: 12, borderRadius: 6, margin: '10px auto 0', background: i < lit ? (i >= 24 ? C.red : C.amber) : '#2a2d31', boxShadow: i < lit ? `0 0 12px ${i >= 24 ? C.red : C.amber}` : 'none'}} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 1. ACCROCHE (0 – 35 s)
// ---------------------------------------------------------------------------
const HookAd: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 6, fps, config: {damping: 16}});
  return (
    <AbsoluteFill>
      <Backdrop glow="rgba(255,217,160,0.12)" />
      <div style={{position: 'absolute', top: 90, width: '100%', textAlign: 'center', fontFamily: F.type, fontSize: 60, color: C.amber, letterSpacing: 6}}>
        <Typewriter text="NEW HAVEN · 1961" start={4} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 560,
          top: 230,
          width: 800,
          padding: '40px 50px',
          background: 'linear-gradient(#efe6d2, #e2d6bb)',
          transform: `rotate(${-2.5 + (1 - p) * 8}deg) translateY(${(1 - p) * 300}px)`,
          opacity: p,
          boxShadow: '0 30px 60px rgba(0,0,0,.6)',
          fontFamily: F.head,
          color: '#2a2116',
          textAlign: 'center',
          border: '3px double #6b5a3f',
        }}
      >
        <div style={{fontSize: 22, letterSpacing: 6}}>PUBLIC ANNOUNCEMENT</div>
        <div style={{fontSize: 64, fontWeight: 700, lineHeight: 1.05, margin: '14px 0'}}>WE WILL PAY YOU $4.00 FOR ONE HOUR OF YOUR TIME</div>
        <div style={{fontSize: 32, fontWeight: 500}}>Persons needed for a study of memory</div>
        <div style={{fontFamily: F.type, fontSize: 26, marginTop: 18}}>* plus 50¢ carfare</div>
      </div>
    </AbsoluteFill>
  );
};

const HookPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const lit = Math.floor(interpolate(frame, [15, 170], [-1, 29], clamp));
  return (
    <AbsoluteFill>
      <Backdrop glow="rgba(255,77,77,0.10)" />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <ShockPanel lit={lit} pressed={lit} />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 110, width: '100%'}}>
        {frame < 110 && <Title text="30 SWITCHES." size={84} delay={20} />}
        {frame >= 110 && frame < 175 && <Title text="15 VOLTS…" size={84} delay={110} />}
        {frame >= 175 && <Title text="…TO XXX." size={96} color={C.red} delay={175} glow />}
      </div>
    </AbsoluteFill>
  );
};

const RoomSplit: React.FC<{learnerExpr?: Expr; youExpr?: Expr; darkRight?: boolean; caption?: React.ReactNode; showCoat?: boolean}> = ({learnerExpr = 'neutral', youExpr = 'neutral', darkRight, caption, showCoat = true}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1100, height: 1080, overflow: 'hidden'}}>
        <LabBackground x={-200} />
        {showCoat && (
          <div style={{position: 'absolute', left: 120, top: 420}}>
            <Character variant="coat" expr="calm" height={420} seed={2} />
            <Shadow />
          </div>
        )}
        <div style={{position: 'absolute', left: 520, top: 520}}>
          <Character variant="you" expr={youExpr} seated height={300} seed={1} />
        </div>
        <div style={{position: 'absolute', left: 660, top: 690, width: 360, height: 120, borderRadius: 10, background: 'linear-gradient(#4a5059, #2a2e34)', boxShadow: '0 20px 40px rgba(0,0,0,.6)'}}>
          <div style={{display: 'flex', gap: 6, padding: 18}}>
            {Array.from({length: 10}, (_, i) => (
              <div key={i} style={{width: 24, height: 40, borderRadius: 4, background: '#cfd3d8'}} />
            ))}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 1100, top: 0, width: 40, height: 1080, background: 'linear-gradient(90deg, #3a3f46, #1c1f23)'}} />
      <div style={{position: 'absolute', left: 1140, top: 0, width: 780, height: 1080, overflow: 'hidden'}}>
        <LabBackground x={-500} dim={darkRight ? 0.85 : 0.35} lamp={!darkRight} />
        <div style={{position: 'absolute', left: 280, top: 470, opacity: darkRight ? 0.35 : 1}}>
          <Character variant="learner" expr={learnerExpr} seated height={320} straps seed={3} />
        </div>
        {/* fils des électrodes */}
        <svg width={780} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: darkRight ? 0.3 : 1}}>
          <path d={`M0,${640 + Math.sin(frame / 20) * 4} C 140,700 220,620 330,640`} stroke={C.amber} strokeWidth={4} fill="none" />
        </svg>
      </div>
      {caption}
    </AbsoluteFill>
  );
};

const HookRoom: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <RoomSplit
      learnerExpr={frame > 120 ? 'worried' : 'neutral'}
      caption={
        <div style={{position: 'absolute', top: 70, width: '100%'}}>
          {frame < 120 ? <Title text="EVERY WRONG ANSWER: ONE MORE SWITCH." size={60} delay={10} /> : <Title text="HE'S STRAPPED TO A CHAIR NEXT DOOR." size={60} color={C.red} delay={120} />}
        </div>
      }
    />
  );
};

const PeopleGrid: React.FC<{redUntil: number; greyFrom?: number; jitter?: boolean}> = ({redUntil, greyFrom = 99, jitter}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 92px)', gap: 20}}>
      {Array.from({length: 40}, (_, i) => {
        const p = spring({frame: frame - i, fps, config: {damping: 20}});
        const isRed = i < redUntil && i < greyFrom;
        const j = jitter && isRed ? Math.sin(frame * 1.7 + i) * 3 : 0;
        return (
          <div key={i} style={{opacity: p, transform: `scale(${0.6 + 0.4 * p}) translateX(${j}px)`, filter: isRed ? `drop-shadow(0 0 12px ${C.red}88)` : 'none'}}>
            <Mini color={isRed ? C.red : C.grey} size={92} />
          </div>
        );
      })}
    </div>
  );
};

const HookResult: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = Math.round(interpolate(frame, [110, 200], [0, 26], clamp));
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', top: 70, width: '100%'}}>
        <Title text="MOST PEOPLE ARE SURE THEY'D STOP EARLY." size={64} delay={5} />
      </div>
      <AbsoluteFill style={{alignItems: 'center', top: 190}}>
        <PeopleGrid redUntil={reveal} />
      </AbsoluteFill>
      {frame > 110 && (
        <div style={{position: 'absolute', bottom: 215, width: '100%', textAlign: 'center', fontFamily: F.head, fontWeight: 700, fontSize: 64, color: C.red, textShadow: `0 0 24px ${C.red}66`}}>
          {reveal} OUT OF 40 WENT ALL THE WAY.
        </div>
      )}
    </AbsoluteFill>
  );
};

const HookTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = spring({frame, fps, config: {damping: 9, mass: 1.2}});
  const shake = frame > 8 && frame < 24 ? Math.sin(frame * 4) * 16 : 0;
  return (
    <AbsoluteFill style={{transform: `translate(${shake}px, ${shake / 2}px)`}}>
      <Backdrop glow="rgba(255,77,77,0.22)" />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        {frame < 75 ? (
          <div style={{fontFamily: F.head, fontWeight: 700, fontSize: 380, color: C.red, textShadow: `0 0 80px ${C.red}aa`, transform: `translateY(${(1 - drop) * -800}px)`}}>65%</div>
        ) : (
          <div>
            <Title text="WOULD YOU HAVE" size={120} delay={75} />
            <Title text="PRESSED IT?" size={190} color={C.amber} delay={84} glow />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SectionHook: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={s(4)}>
      <Shot duration={s(4)} noIn>
        <HookAd />
      </Shot>
    </Sequence>
    <Sequence from={s(4)} durationInFrames={s(8)}>
      <Shot duration={s(8)} drift={0.08}>
        <HookPanel />
      </Shot>
    </Sequence>
    <Sequence from={s(12)} durationInFrames={s(8)}>
      <Shot duration={s(8)} drift={0.05}>
        <HookRoom />
      </Shot>
    </Sequence>
    <Sequence from={s(20)} durationInFrames={s(9)}>
      <Shot duration={s(9)}>
        <HookResult />
      </Shot>
    </Sequence>
    <Sequence from={s(29)} durationInFrames={s(6)}>
      <Shot duration={s(6)} drift={0.02} noIn>
        <HookTitle />
      </Shot>
    </Sequence>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// 2. LE PIÈGE (45 s)
// ---------------------------------------------------------------------------
const Stamp: React.FC<{text: string; color: string; at: number}> = ({text, color, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 10, stiffness: 200}});
  if (frame < at) return null;
  return (
    <div style={{fontFamily: F.head, fontWeight: 700, fontSize: 110, color, border: `8px solid ${color}`, padding: '4px 34px', borderRadius: 12, transform: `rotate(-10deg) scale(${2.2 - 1.2 * p})`, opacity: p, textShadow: `0 0 20px ${color}66`}}>
      {text}
    </div>
  );
};

const TrapReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stand = spring({frame: frame - 70, fps, config: {damping: 14}});
  return (
    <AbsoluteFill>
      <LabBackground x={-100} dim={0.2} />
      <div style={{position: 'absolute', left: 840, top: 520 - stand * 110}}>
        <Character variant="learner" expr={stand > 0.5 ? 'calm' : 'worried'} seated={stand < 0.5} height={stand < 0.5 ? 320 : 420} seed={3} />
        <Shadow />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d={`M300,820 C 600,${820 - stand * 120} 760,${700 + stand * 200} ${900 + stand * 260},${760 + stand * 220}`} stroke={C.amber} strokeWidth={5} fill="none" />
      </svg>
      <div style={{position: 'absolute', left: 1240, top: 300}}>
        <Stamp text="ACTOR" color={C.blue} at={100} />
      </div>
      <div style={{position: 'absolute', left: 240, top: 300}}>
        <Stamp text="SHOCKS: FAKE" color={C.red} at={200} />
      </div>
    </AbsoluteFill>
  );
};

const TrapYou: React.FC = () => {
  const frame = useCurrentFrame();
  const spot = interpolate(frame, [0, 40], [0.0, 0.8], clamp);
  return (
    <AbsoluteFill>
      <LabBackground x={0} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 62%, rgba(0,0,0,0) 12%, rgba(0,0,0,${spot}) 34%)`}} />
      <div style={{position: 'absolute', left: 860, top: 520}}>
        <Character variant="you" expr="worried" seated height={320} seed={1} />
      </div>
      <div style={{position: 'absolute', top: 120, width: '100%'}}>
        <Title text="THE REAL EXPERIMENT…" size={72} delay={8} />
        <Title text="…IS YOU." size={150} color={C.amber} delay={45} glow />
      </div>
    </AbsoluteFill>
  );
};

const SENTENCES = ['Please continue.', 'The experiment requires that you continue.', 'It is absolutely essential that you continue.', 'You have no other choice. You must go on.'];

const TrapSentences: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dim = interpolate(frame, [780, 820], [1, 0.4], clamp);
  return (
    <AbsoluteFill>
      <LabBackground x={200} dim={0.55} />
      <div style={{position: 'absolute', left: 120, top: 360}}>
        <Character variant="coat" expr="calm" height={560} seed={2} />
        <Shadow w={220} />
      </div>
      <div style={{position: 'absolute', left: 560, top: 150, width: 1250, opacity: dim}}>
        {SENTENCES.map((t, i) => {
          const st = 300 + i * 120;
          const p = spring({frame: frame - st, fps, config: {damping: 14}});
          const last = i === 3;
          return (
            <div
              key={t}
              style={{
                display: 'inline-block',
                marginBottom: 26,
                padding: '18px 30px',
                borderRadius: 22,
                background: last ? 'rgba(60,18,18,.92)' : 'rgba(18,20,24,.92)',
                border: `2px solid ${last ? C.red : 'rgba(243,239,230,.35)'}`,
                fontFamily: F.body,
                fontWeight: 800,
                fontStyle: 'italic',
                fontSize: 42 + i * 8,
                color: last ? C.red : C.ink,
                opacity: p,
                transform: `translateX(${(1 - p) * 80}px) scale(${0.9 + 0.1 * p})`,
                transformOrigin: 'left center',
              }}
            >
              “{t}”
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SectionTrap: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={s(10)}>
      <Shot duration={s(10)}>
        <TrapReveal />
      </Shot>
    </Sequence>
    <Sequence from={s(10)} durationInFrames={s(5)}>
      <Shot duration={s(5)} drift={0.12}>
        <TrapYou />
      </Shot>
    </Sequence>
    <Sequence from={s(15)} durationInFrames={s(30)}>
      <Shot duration={s(30)} drift={0.06}>
        <TrapSentences />
      </Shot>
    </Sequence>
    {[0, 1, 2, 3].map((i) => (
      <Sequence key={i} from={s(15) + 300 + i * 120} durationInFrames={s(2)}>
        <Audio src={staticFile('ding.wav')} volume={0.5} />
      </Sequence>
    ))}
    {[100, 200].map((f) => (
      <Sequence key={f} from={f} durationInFrames={s(1.5)}>
        <Audio src={staticFile('impact.wav')} volume={0.5} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// 3. L'ESCALADE (50 s)
// ---------------------------------------------------------------------------
const VOLT_KEYS: [number, number][] = [
  [0, 0],
  [s(5), 4],
  [s(11), 9],
  [s(15), 9],
  [s(20), 19],
  [s(24), 21],
  [s(30), 21],
  [s(35), 29],
];
const switchAt = (frame: number) => {
  for (let k = 0; k < VOLT_KEYS.length - 1; k++) {
    const [f0, v0] = VOLT_KEYS[k];
    const [f1, v1] = VOLT_KEYS[k + 1];
    if (frame >= f0 && frame <= f1) return Math.floor(interpolate(frame, [f0, f1], [v0, v1]));
  }
  return 29;
};

const Bubble: React.FC<{text: string; color?: string; at: number; until: number}> = ({text, color = C.ink, at, until}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame >= until) return null;
  const p = spring({frame: frame - at, fps, config: {damping: 11}});
  return (
    <div style={{display: 'inline-block', transform: `scale(${p})`, transformOrigin: 'bottom left', fontFamily: F.head, fontWeight: 700, fontSize: 60, color, background: '#15181c', border: `3px solid ${color}`, borderRadius: 24, padding: '10px 28px', boxShadow: `0 0 30px ${color}44`}}>
      {text}
    </div>
  );
};

const SectionEscalation: React.FC = () => {
  const frame = useCurrentFrame();
  const sw = switchAt(frame);
  const volts = (sw + 1) * 15;
  const silent = frame >= s(24);
  const pounding = frame >= s(15) && frame < s(20);
  const shake = pounding ? Math.sin(frame * 2.5) * 8 : 0;
  const learnerExpr: Expr = frame < s(4) ? 'neutral' : frame < s(9) ? 'pain' : 'scared';
  const youExpr: Expr = frame < s(9) ? 'neutral' : 'worried';
  const phase2 = frame >= s(35);
  return (
    <AbsoluteFill>
      {!phase2 ? (
        <AbsoluteFill style={{transform: `translateX(${shake * 0.4}px)`}}>
          <RoomSplit learnerExpr={learnerExpr} youExpr={youExpr} darkRight={silent} showCoat={false} />
          <div style={{position: 'absolute', top: 24, left: 0, width: '100%', display: 'flex', justifyContent: 'center', transform: 'scale(0.78)', transformOrigin: 'top center'}}>
            <ShockPanel lit={sw} pressed={sw} />
          </div>
          <div style={{position: 'absolute', left: 70, top: 330, fontFamily: F.head, fontWeight: 700, fontSize: 170, color: sw >= 24 ? C.red : C.amber, textShadow: `0 0 40px ${sw >= 24 ? C.red : C.amber}66`}}>{volts} V</div>
          <div style={{position: 'absolute', left: 1250, top: 380}}>
            <Bubble text="UGH!" at={s(4)} until={s(6.5)} />
            <Bubble text="LET ME OUT! MY HEART!" color={C.red} at={s(9.5)} until={s(13)} />
            <Bubble text="*BANG* *BANG*" color={C.red} at={s(15)} until={s(20)} />
          </div>
          <div style={{position: 'absolute', left: 70, top: 540, width: 1000}}>
            {frame >= s(11.5) && frame < s(15) && <Title text="“PLEASE CONTINUE.”" size={64} align="left" delay={s(11.5)} />}
            {frame >= s(26) && frame < s(30) && <Title text="“TREAT NO ANSWER AS A WRONG ANSWER.”" size={56} align="left" delay={s(26)} />}
            {frame >= s(30) && <Title text="26 OUT OF 40 WENT ALL THE WAY." size={60} color={C.red} align="left" delay={s(30)} glow />}
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          <Backdrop glow="rgba(255,77,77,0.10)" />
          <AbsoluteFill style={{alignItems: 'center', top: 110}}>
            <PeopleGrid redUntil={26} jitter={frame > s(40) && frame < s(45)} />
          </AbsoluteFill>
          <div style={{position: 'absolute', bottom: 230, width: '100%'}}>
            {frame < s(40) && <Title text="TEACHERS. CLERKS. SALESMEN." size={70} delay={s(35)} />}
            {frame >= s(40) && frame < s(45) && <Title text="THEY SWEATED. THEY SHOOK." size={70} delay={s(40)} />}
            {frame >= s(45) && <Title text="AND THEN THEY PRESSED THE NEXT SWITCH." size={66} color={C.amber} delay={s(45)} glow />}
          </div>
        </AbsoluteFill>
      )}
      {Array.from({length: 30}, (_, i) => {
        let f = -1;
        for (let k = 1; k < VOLT_KEYS.length; k++) {
          const [f0, v0] = VOLT_KEYS[k - 1];
          const [f1, v1] = VOLT_KEYS[k];
          if (i > v0 && i <= v1) {
            f = Math.round(interpolate(i, [v0, v1], [f0, f1]));
            break;
          }
        }
        return f > 0 ? (
          <Sequence key={i} from={f} durationInFrames={10}>
            <Audio src={staticFile('click.wav')} volume={0.6} />
          </Sequence>
        ) : null;
      })}
      {Array.from({length: 7}, (_, i) => (
        <Sequence key={`hb${i}`} from={s(9) + i * 22} durationInFrames={25}>
          <Audio src={staticFile('heartbeat.wav')} volume={0.8} />
        </Sequence>
      ))}
      {Array.from({length: 8}, (_, i) => (
        <Sequence key={`pd${i}`} from={s(15) + i * 18} durationInFrames={12}>
          <Audio src={staticFile('pound.wav')} volume={0.9} />
        </Sequence>
      ))}
      <Sequence from={s(46.5)} durationInFrames={10}>
        <Audio src={staticFile('click.wav')} volume={1} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 4. LE CERVEAU (65 s)
// ---------------------------------------------------------------------------
const Brain: React.FC<{active: number}> = ({active}) => {
  const frame = useCurrentFrame();
  const zones = [
    {cx: 290, cy: 180},
    {cx: 480, cy: 220},
    {cx: 370, cy: 330},
  ];
  return (
    <svg width={760} height={560} viewBox="0 0 700 500">
      <defs>
        <radialGradient id="brainFill" cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#3b4350" />
          <stop offset="1" stopColor="#1b2027" />
        </radialGradient>
        <filter id="blur30">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>
      {zones.map((z, i) => {
        const on = active === i + 1;
        const pulse = 0.6 + 0.4 * Math.sin(frame / 6);
        return on ? <circle key={`g${i}`} cx={z.cx} cy={z.cy} r={120} fill={C.amber} opacity={0.55 * pulse} filter="url(#blur30)" /> : null;
      })}
      <path d="M120,260 C90,150 190,60 320,70 C420,40 560,90 590,200 C640,260 610,360 520,380 C470,440 360,450 300,410 C200,430 130,370 120,260 Z" fill="url(#brainFill)" stroke="#d9d4c7" strokeWidth={5} />
      {[
        'M180,180 C230,140 270,210 330,170 C380,140 420,190 470,160',
        'M160,260 C220,230 260,290 330,260 C390,230 440,290 520,250',
        'M210,340 C260,310 300,370 370,340 C420,320 470,360 530,320',
        'M400,110 C430,150 480,130 520,170',
        'M300,90 C290,130 330,150 320,190',
        'M560,230 C540,270 580,300 560,330',
      ].map((d, i) => (
        <path key={i} d={d} stroke="#59616d" strokeWidth={5} fill="none" strokeLinecap="round" />
      ))}
      <path d="M330,400 C340,440 360,470 350,500" stroke="#3b4350" strokeWidth={30} strokeLinecap="round" />
      {zones.map((z, i) => {
        const on = active === i + 1;
        return (
          <g key={i}>
            <circle cx={z.cx} cy={z.cy} r={on ? 46 : 32} fill={on ? C.amber : 'rgba(255,255,255,.08)'} stroke={on ? '#fff3dc' : '#6b727c'} strokeWidth={3} />
            <text x={z.cx} y={z.cy + 14} textAnchor="middle" fontFamily={F.head} fontWeight={700} fontSize={40} fill={on ? C.bg : '#9aa3ad'}>
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const Chip: React.FC<{text: string; at: number}> = ({text, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 13}});
  return (
    <div style={{opacity: p, transform: `translateY(${(1 - p) * 30}px)`, fontFamily: F.head, fontWeight: 500, fontSize: 40, letterSpacing: 2, color: C.ink, background: 'rgba(243,239,230,.07)', border: '2px solid rgba(243,239,230,.4)', borderRadius: 16, padding: '14px 26px'}}>
      {text}
    </div>
  );
};

const SectionBrain: React.FC = () => {
  const frame = useCurrentFrame();
  const active = frame < s(5) ? 0 : frame < s(20) ? 1 : frame < s(40) ? 2 : 3;
  const climb = Math.floor(interpolate(frame, [s(25), s(38)], [0, 29], clamp));
  const bagT = interpolate(frame, [s(48), s(51)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const strings = interpolate(frame, [s(56), s(59)], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Backdrop glow="rgba(255,181,71,0.12)" />
      <div style={{position: 'absolute', left: 40, top: 230}}>
        <Brain active={active} />
      </div>
      <div style={{position: 'absolute', left: 860, top: 150, width: 1000}}>
        {active === 0 && <Title text="THREE THINGS." size={110} delay={10} />}
        {active === 1 && (
          <>
            <Title text="1 · AUTHORITY" size={96} color={C.amber} delay={s(5)} glow />
            <div style={{display: 'flex', justifyContent: 'center', gap: 30, marginTop: 70}}>
              <Chip text="LAB COAT" at={s(10)} />
              <Chip text="YALE" at={s(10) + 20} />
              <Chip text="CALM VOICE" at={s(10) + 40} />
            </div>
            <div style={{marginTop: 70}}>
              <Title text="= “TRUST ME.”" size={84} color={C.amber} delay={s(14)} />
            </div>
          </>
        )}
        {active === 2 && (
          <>
            <Title text="2 · TINY STEPS" size={96} color={C.amber} delay={s(20)} glow />
            <svg width={1000} height={560} style={{marginTop: 20}}>
              {Array.from({length: 30}, (_, i) => {
                const x = 40 + i * 30;
                const y = 520 - i * 16;
                const on = i <= climb;
                return <rect key={i} x={x} y={y} width={30} height={16 + i * 16} fill={on ? (i >= 24 ? C.red : C.amber) : '#232830'} opacity={on ? 1 : 0.8} />;
              })}
              <text x={40 + climb * 30 + 46} y={520 - climb * 16 - 20} fontFamily={F.head} fontSize={38} fontWeight={700} fill={C.ink}>
                +15 V
              </text>
            </svg>
            <div style={{position: 'absolute', left: 40 + climb * 30 - 25, top: 130 + 520 - climb * 16 - 160}}>
              <Character variant="you" expr="worried" height={160} seed={1} />
            </div>
          </>
        )}
        {active === 3 && (
          <>
            <Title text="3 · HANDING OFF RESPONSIBILITY" size={68} color={C.amber} delay={s(40)} glow />
            <div style={{position: 'relative', height: 680, marginTop: 20}}>
              <div style={{position: 'absolute', left: 60, top: 230, opacity: 1 - strings * 0.3}}>
                <Character variant="you" expr={strings > 0 ? 'neutral' : 'worried'} seated height={300} seed={1} />
              </div>
              <div style={{position: 'absolute', left: 640, top: 110}}>
                <Character variant="coat" expr="calm" height={440} seed={2} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 190 + bagT * 470,
                  top: 170 + bagT * 150 - Math.sin(bagT * Math.PI) * 130,
                  width: 120,
                  height: 90,
                  background: `linear-gradient(${C.red}, #a12a2a)`,
                  borderRadius: 16,
                  color: 'white',
                  fontFamily: F.head,
                  fontWeight: 700,
                  fontSize: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 30px ${C.red}88`,
                }}
              >
                BLAME
              </div>
              {frame >= s(45) && frame < s(48) && <div style={{position: 'absolute', left: 0, top: 70, fontFamily: F.body, fontStyle: 'italic', fontWeight: 800, fontSize: 44, color: C.ink}}>“Who's responsible?”</div>}
              {frame >= s(48) && frame < s(52) && <div style={{position: 'absolute', left: 600, top: 40, fontFamily: F.body, fontStyle: 'italic', fontWeight: 800, fontSize: 54, color: '#dfe3e8'}}>“I am.”</div>}
              <svg width={400} height={260} style={{position: 'absolute', left: 60, top: -40, opacity: strings}}>
                {[60, 115, 170].map((x) => (
                  <line key={x} x1={x} y1={0} x2={x} y2={260 * strings} stroke={C.ink} strokeWidth={2} />
                ))}
              </svg>
              {frame >= s(52) && (
                <div style={{position: 'absolute', left: 0, top: 590, width: 1000}}>
                  <Title text="THE AGENTIC STATE" size={86} color={C.red} delay={s(52)} glow />
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {[s(5), s(20), s(40)].map((f) => (
        <Sequence key={f} from={f} durationInFrames={s(1.2)}>
          <Audio src={staticFile('ding.wav')} volume={0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 5. CASSER LE PIÈGE (35 s)
// ---------------------------------------------------------------------------
const SectionBreak: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pct = interpolate(frame, [s(6), s(10), s(15), s(19)], [65, 20.5, 20.5, 10], clamp);
  const rebels = spring({frame: frame - s(14), fps, config: {damping: 14}});
  const greyed = Math.floor(interpolate(frame, [s(22), s(30)], [0, 40], clamp));
  return (
    <AbsoluteFill>
      <Backdrop glow={frame < s(21) ? 'rgba(255,77,77,0.10)' : 'rgba(91,214,138,0.12)'} />
      {frame < s(21) ? (
        <>
          <div style={{position: 'absolute', top: 90, width: '100%'}}>
            <Title text="OBEDIENCE WASN'T FIXED." size={92} delay={5} />
          </div>
          <div style={{position: 'absolute', left: 200, top: 330, width: 1050}}>
            <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 32, color: C.dim, marginBottom: 14}}>Went all the way to 450 V</div>
            <div style={{height: 96, background: '#1c2026', borderRadius: 18, overflow: 'hidden', boxShadow: 'inset 0 4px 10px rgba(0,0,0,.6)'}}>
              <div style={{width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, #a12a2a, ${C.red})`, borderRadius: 18, boxShadow: `0 0 30px ${C.red}88`}} />
            </div>
            <div style={{fontFamily: F.head, fontWeight: 700, fontSize: 150, color: C.red, marginTop: 14, textShadow: `0 0 40px ${C.red}66`}}>≈ {pct.toFixed(0)}%</div>
            <div style={{fontFamily: F.head, fontWeight: 500, fontSize: 52, color: C.ink, letterSpacing: 1}}>
              {frame < s(6) ? 'ORIGINAL VERSION' : frame < s(14) ? 'ORDERS GIVEN BY PHONE' : 'TWO OTHER VOLUNTEERS REFUSE'}
            </div>
          </div>
          <div style={{position: 'absolute', right: 140, top: 430, opacity: rebels, transform: `translateY(${(1 - rebels) * 60}px)`, display: 'flex', gap: 20}}>
            <div>
              <Character variant="rebel" expr="calm" armsCrossed height={440} seed={5} />
              <Shadow />
            </div>
            <div>
              <Character variant="rebel" expr="neutral" armsCrossed height={440} seed={8} />
              <Shadow />
            </div>
          </div>
        </>
      ) : (
        <AbsoluteFill>
          <AbsoluteFill style={{alignItems: 'center', top: 110}}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 92px)', gap: 20}}>
              {Array.from({length: 40}, (_, i) => {
                const red = i < 26 && i >= greyed;
                return (
                  <div key={i} style={{filter: red ? `drop-shadow(0 0 12px ${C.red}88)` : 'none'}}>
                    <Mini color={red ? C.red : i < greyed ? C.green : C.grey} size={92} />
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>
          <div style={{position: 'absolute', bottom: 230, width: '100%'}}>
            <Title text="ONE PERSON SAYING NO CHANGED EVERYTHING." size={66} color={C.green} delay={s(22)} glow />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 6. FIN (20 s)
// ---------------------------------------------------------------------------
const SectionEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const no = spring({frame: frame - s(15), fps, config: {damping: 10}});
  return (
    <AbsoluteFill>
      <Backdrop glow={no > 0.05 ? 'rgba(91,214,138,0.2)' : 'rgba(255,181,71,0.10)'} />
      <div style={{position: 'absolute', top: 110, width: '100%'}}>
        {frame < s(6) && <Title text="SO… WOULD YOU HAVE PRESSED IT?" size={96} delay={5} />}
        {frame >= s(6) && frame < s(11) && <Title text="NOBODY KNOWS, UNTIL THEY'RE IN THE ROOM." size={80} delay={s(6)} />}
        {frame >= s(11) && frame < s(15) && <Title text="NOW YOU KNOW HOW THE TRAP WORKS." size={84} color={C.amber} delay={s(11)} />}
        {frame >= s(15) && <Title text="BE THE FIRST ONE TO SAY NO." size={110} color={C.green} delay={s(15)} glow />}
      </div>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: 160}}>
        <div style={{display: 'flex', gap: 14, alignItems: 'flex-end', padding: '34px 44px', borderRadius: 20, background: 'linear-gradient(180deg, #4a5059 0%, #262a30 100%)', boxShadow: '0 40px 90px rgba(0,0,0,.7)'}}>
          {Array.from({length: 12}, (_, i) => (
            <div key={i} style={{width: 46, height: 90, borderRadius: 8, background: 'linear-gradient(#8a9099, #4b5058)'}} />
          ))}
          <div style={{textAlign: 'center', marginLeft: 30}}>
            <div style={{width: 120, height: 180, borderRadius: 18, background: no > 0.05 ? `linear-gradient(${C.green}, #2f8a55)` : 'linear-gradient(#8a9099, #4b5058)', boxShadow: no > 0.05 ? `0 0 ${70 * no}px ${C.green}` : 'none', transform: `scale(${1 + 0.15 * no})`}} />
            <div style={{fontFamily: F.head, fontWeight: 700, fontSize: 56, color: no > 0.05 ? C.green : '#9aa3ad', marginTop: 14}}>NO</div>
          </div>
        </div>
      </AbsoluteFill>
      <Sequence from={s(15)} durationInFrames={s(2)}>
        <Audio src={staticFile('impact.wav')} volume={0.7} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Assemblage
// ---------------------------------------------------------------------------
const SECTIONS: {from: number; dur: number; el: React.ReactNode; wrap: boolean}[] = [
  {from: 0, dur: 35, el: <SectionHook />, wrap: false},
  {from: 35, dur: 45, el: <SectionTrap />, wrap: false},
  {from: 80, dur: 50, el: <SectionEscalation />, wrap: true},
  {from: 130, dur: 65, el: <SectionBrain />, wrap: true},
  {from: 195, dur: 35, el: <SectionBreak />, wrap: true},
  {from: 230, dur: 20, el: <SectionEnd />, wrap: true},
];

export const MILGRAM_V2_FRAMES = s(250);

export const MilgramV2: React.FC = () => (
  <FilmLook>
    {SECTIONS.map(({from, dur, el, wrap}) => (
      <Sequence key={from} from={s(from)} durationInFrames={s(dur)}>
        {wrap ? (
          <Shot duration={s(dur)} drift={0.03}>
            {el}
          </Shot>
        ) : (
          el
        )}
      </Sequence>
    ))}
    <Audio src={staticFile('drone.wav')} loop volume={(f) => (f >= s(104) && f < s(110) ? 0 : 0.35)} />
    {Array.from({length: 30}, (_, i) => (
      <Sequence key={i} from={s(4) + Math.round(15 + (i * 155) / 30)} durationInFrames={8}>
        <Audio src={staticFile('click.wav')} volume={0.35} />
      </Sequence>
    ))}
    <Sequence from={s(29)} durationInFrames={s(2)}>
      <Audio src={staticFile('impact.wav')} volume={0.9} />
    </Sequence>
    <KaraokeCaptions caps={CAPS} />
  </FilmLook>
);
