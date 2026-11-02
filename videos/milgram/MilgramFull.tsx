import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import {
  MilgramHook,
  FONT,
  BG,
  AMBER,
  RED,
  PALE,
  clamp,
  Line,
  ShockPanel,
  Person,
  Fade,
} from './MilgramHook';

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const GREEN = '#5bd68a';
const GREY = '#5a626c';

// ----------------------------------------------------------------------------
// Sous-titres (la narration du script, en attendant la voix off)
// ----------------------------------------------------------------------------
type Cap = [number, number, string];
const CAPTIONS: Cap[] = [
  // 1. Accroche (0 – 35 s)
  [0, 4, 'New Haven, 1961. $4.50 for a memory study at Yale.'],
  [4, 8, 'They sit you in front of a machine with thirty switches.'],
  [8, 12, 'The first says fifteen volts. The last one just says… XXX.'],
  [12, 16, 'In the next room, a man is strapped to a chair.'],
  [16, 20, 'Every wrong answer, you press the next switch.'],
  [20, 25, "You're sure you'd stop early. Almost everyone is."],
  [25, 31, 'But when this experiment was really run…'],
  [31, 35, '…sixty-five percent went all the way.'],
  // 2. Le piège (35 – 80 s)
  [35, 39, "Here's what you don't know."],
  [39, 42, 'The man in the chair is an actor.'],
  [42, 45, 'The shocks are fake.'],
  [45, 50, 'The real experiment… is you.'],
  [50, 55, 'Behind you stands a calm man in a grey lab coat.'],
  [55, 60, 'Whenever you hesitate, he has four sentences ready.'],
  [76, 80, 'No threats. No weapons. Just four polite sentences.'],
  // 3. L'escalade (80 – 130 s)
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
  // 4. Pourquoi le cerveau obéit (130 – 195 s)
  [130, 135, 'So what happened in their heads? Three things.'],
  [135, 140, 'One: authority.'],
  [140, 150, 'Since childhood, your brain has learned that the person in charge usually knows better.'],
  [150, 155, 'Two: tiny steps.'],
  [155, 162, 'Nobody was asked to give 450 volts. Only to go fifteen volts further than last time.'],
  [162, 170, "And every switch you've already pressed makes stopping harder."],
  [170, 175, 'Three: handing off responsibility.'],
  [175, 182, '"Who\'s responsible if he gets hurt?" — "I am." And that was enough.'],
  [182, 188, 'Milgram called it the agentic state.'],
  [188, 195, 'You stop feeling like the author of your actions. You become the instrument.'],
  // 5. Casser le piège (195 – 230 s)
  [195, 200, "But obedience wasn't fixed. Milgram ran many versions."],
  [200, 209, 'When the orders came by phone, obedience dropped sharply.'],
  [209, 220, 'When two other volunteers refused to continue… almost nobody went to the end.'],
  [220, 230, 'One person saying no changed everything.'],
  // 6. Fin (230 – 250 s)
  [230, 236, 'So would you have pressed it?'],
  [236, 241, "Honestly? You don't know. Nobody does, until they're in the room."],
  [241, 245, 'But now you know how the trap works.'],
  [245, 250, 'And how to break it: be the first one to say no.'],
];

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const cap = CAPTIONS.find(([a, b]) => frame >= s(a) && frame < s(b));
  if (!cap) return null;
  const local = frame - s(cap[0]);
  const end = s(cap[1]) - frame;
  const opacity = Math.min(1, local / 6, end / 6);
  return (
    <div style={{position: 'absolute', bottom: 28, width: '100%', display: 'flex', justifyContent: 'center', opacity}}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 34,
          color: '#f5f2ea',
          background: 'rgba(0,0,0,0.55)',
          padding: '10px 26px',
          borderRadius: 10,
          maxWidth: 1500,
          textAlign: 'center',
        }}
      >
        {cap[2]}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// 2. Le piège (45 s)
// ----------------------------------------------------------------------------
const TrapReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stand = spring({frame: frame - 90, fps, config: {damping: 14}});
  const fake = spring({frame: frame - 210, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{background: BG, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', left: 760, top: 300}}>
        {/* chaise */}
        <div style={{position: 'absolute', left: -10, top: 150, width: 160, height: 120, border: `6px solid ${GREY}`, borderRadius: 12}} />
        <div style={{transform: `translateY(${-stand * 60}px)`}}>
          <Person color="#6fb3d2" seated={stand < 0.5} />
        </div>
        {/* câble retiré */}
        <svg width={300} height={300} style={{position: 'absolute', left: 120, top: 40}}>
          <path
            d={`M10,80 C 80,${80 - stand * 60} 140,${40 + stand * 120} ${180 + stand * 60},${120 + stand * 100}`}
            stroke={AMBER}
            strokeWidth={6}
            fill="none"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: -40,
            top: 320,
            width: 240,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 48,
            color: '#6fb3d2',
            opacity: stand,
          }}
        >
          ACTOR
        </div>
      </div>
      {/* éclair barré : chocs factices */}
      <div style={{position: 'absolute', right: 300, top: 330, opacity: fake, transform: `scale(${0.6 + 0.4 * fake})`}}>
        <svg width={260} height={260} viewBox="0 0 100 100">
          <polygon points="55,5 20,55 45,55 35,95 80,40 55,40 65,5" fill={AMBER} />
          <line x1={10} y1={90} x2={90} y2={10} stroke={RED} strokeWidth={9} />
        </svg>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 52, color: RED, textAlign: 'center'}}>FAKE</div>
      </div>
    </AbsoluteFill>
  );
};

const TrapYou: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 150], [1, 1.35], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: BG, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${zoom})`, textAlign: 'center'}}>
        <Person color={AMBER} seated />
        <div style={{fontFamily: FONT, fontWeight: 800, color: AMBER, fontSize: 30}}>YOU</div>
      </div>
      <div style={{position: 'absolute', top: 120, width: '100%'}}>
        <Line text="The real experiment…" size={64} delay={10} />
        <Line text="…is you." size={110} color={AMBER} delay={55} />
      </div>
    </AbsoluteFill>
  );
};

const SENTENCES = [
  'Please continue.',
  'The experiment requires that you continue.',
  'It is absolutely essential that you continue.',
  'You have no other choice. You must go on.',
];

const TrapSentences: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const coat = spring({frame, fps, config: {damping: 15}});
  const dim = interpolate(frame, [780, 820], [1, 0.35], clamp);
  return (
    <AbsoluteFill style={{background: BG}}>
      <div style={{position: 'absolute', left: 150, top: 330, opacity: coat, transform: `translateX(${(1 - coat) * -80}px)`}}>
        <Person color="#c9ced4" coat />
        <div style={{fontFamily: FONT, color: '#c9ced4', fontSize: 26, fontWeight: 800, width: 140, textAlign: 'center'}}>LAB COAT</div>
      </div>
      <div style={{position: 'absolute', left: 430, top: 150, width: 1350, opacity: dim}}>
        {SENTENCES.map((t, i) => {
          const start = 300 + i * 120; // une phrase toutes les 4 s, à partir de 10 s
          const sp = spring({frame: frame - start, fps, config: {damping: 14}});
          const size = 44 + i * 12;
          return (
            <div
              key={t}
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontStyle: 'italic',
                fontSize: size,
                color: i === 3 ? RED : PALE,
                opacity: sp,
                transform: `translateX(${(1 - sp) * 60}px)`,
                marginBottom: 34,
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
      <Fade duration={s(10)}><TrapReveal /></Fade>
    </Sequence>
    <Sequence from={s(10)} durationInFrames={s(5)}>
      <Fade duration={s(5)}><TrapYou /></Fade>
    </Sequence>
    <Sequence from={s(15)} durationInFrames={s(30)}>
      <Fade duration={s(30)}><TrapSentences /></Fade>
    </Sequence>
    {[0, 1, 2, 3].map((i) => (
      <Sequence key={i} from={s(15) + 300 + i * 120} durationInFrames={s(2)}>
        <Audio src={staticFile('ding.wav')} volume={0.5} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// ----------------------------------------------------------------------------
// 3. L'escalade (50 s)
// ----------------------------------------------------------------------------
// Tension en fonction de l'image (index de l'interrupteur : 0 = 15 V)
const VOLT_KEYS: [number, number][] = [
  [0, 0],
  [s(5), 4], // 75 V
  [s(11), 9], // 150 V
  [s(15), 9],
  [s(20), 19], // 300 V
  [s(24), 21], // 330 V
  [s(30), 21],
  [s(35), 29], // 450 V
];

const switchAt = (frame: number) => {
  for (let k = 0; k < VOLT_KEYS.length - 1; k++) {
    const [f0, v0] = VOLT_KEYS[k];
    const [f1, v1] = VOLT_KEYS[k + 1];
    if (frame >= f0 && frame <= f1) return Math.floor(interpolate(frame, [f0, f1], [v0, v1]));
  }
  return 29;
};

const Bubble: React.FC<{text: string; show: boolean; color?: string}> = ({text, show, color = PALE}) => (
  <div
    style={{
      opacity: show ? 1 : 0,
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: 56,
      color,
      background: '#1a1e24',
      border: `3px solid ${color}`,
      borderRadius: 18,
      padding: '14px 30px',
      display: 'inline-block',
    }}
  >
    {text}
  </div>
);

const SectionEscalation: React.FC = () => {
  const frame = useCurrentFrame();
  const sw = switchAt(frame);
  const volts = (sw + 1) * 15;
  const silent = frame >= s(24) && frame < s(30);
  const pounding = frame >= s(15) && frame < s(20);
  const shake = pounding ? Math.sin(frame * 2.5) * 8 : 0;
  const wallLight = silent ? 0.05 : 0.25 + (pounding ? 0.5 * Math.abs(Math.sin(frame / 4)) : 0);
  const phase2 = frame >= s(35);
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: BG}}>
      {!phase2 ? (
        <>
          <div style={{position: 'absolute', top: 40, left: 0, width: '100%', display: 'flex', justifyContent: 'center'}}>
            <ShockPanel litUntil={sw} pressed={sw} scale={0.95} />
          </div>
          <div style={{position: 'absolute', left: 140, top: 420, fontFamily: FONT, fontWeight: 900, fontSize: 200, color: sw >= 24 ? RED : AMBER}}>
            {volts} V
          </div>
          {/* mur et pièce de l'élève */}
          <div style={{position: 'absolute', left: 1060, top: 400, width: 30, height: 560, background: `rgba(255,77,77,${wallLight})`, transform: `translateX(${shake}px)`}} />
          <div style={{position: 'absolute', left: 1180, top: 450}}>
            <Bubble text="Ugh!" show={frame >= s(4) && frame < s(6.5)} />
          </div>
          <div style={{position: 'absolute', left: 1140, top: 450}}>
            <Bubble text="Let me out! My heart!" show={frame >= s(9.5) && frame < s(13)} color={RED} />
          </div>
          <div style={{position: 'absolute', left: 1180, top: 640, transform: `translateX(${shake}px)`}}>
            <Bubble text="*BANG* *BANG*" show={pounding} color={RED} />
          </div>
          <div style={{position: 'absolute', left: 140, top: 700}}>
            {frame >= s(11.5) && frame < s(15) && (
              <div style={{fontFamily: FONT, fontStyle: 'italic', fontWeight: 800, fontSize: 52, color: PALE}}>“Please continue.”</div>
            )}
            {frame >= s(26) && frame < s(30) && (
              <div style={{fontFamily: FONT, fontStyle: 'italic', fontWeight: 800, fontSize: 52, color: PALE}}>“Treat no answer as a wrong answer.”</div>
            )}
            {frame >= s(30) && (
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: RED}}>26 out of 40 went all the way.</div>
            )}
          </div>
        </>
      ) : (
        <AbsoluteFill style={{alignItems: 'center'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 100px)', gap: 26, marginTop: 120}}>
            {Array.from({length: 40}, (_, i) => {
              const red = i < 26;
              const jitter = red && frame > s(40) && frame < s(45) ? Math.sin(frame * 1.7 + i) * 3 : 0;
              return (
                <svg key={i} width={100} height={120} viewBox="0 0 140 170" style={{transform: `translateX(${jitter}px)`}}>
                  <circle cx={70} cy={38} r={30} fill={red ? RED : GREY} />
                  <rect x={30} y={76} width={80} height={90} rx={28} fill={red ? RED : GREY} />
                </svg>
              );
            })}
          </div>
          <div style={{position: 'absolute', bottom: 150, width: '100%'}}>
            {frame < s(40) && <Line text="Teachers. Clerks. Salesmen." size={62} delay={s(35)} />}
            {frame >= s(40) && frame < s(45) && <Line text="They sweated. They shook." size={62} delay={s(40)} />}
            {frame >= s(45) && (
              <Line text="And then they pressed the next switch." size={62} color={AMBER} delay={s(45)} />
            )}
          </div>
          {frame >= s(46.5) && (
            <div style={{position: 'absolute', top: 60, opacity: spring({frame: frame - s(46.5), fps, config: {damping: 12}})}}>
              <div style={{width: 60, height: 100, borderRadius: 10, background: RED, boxShadow: `0 0 40px ${RED}`}} />
            </div>
          )}
        </AbsoluteFill>
      )}
      {/* sons : clic à chaque nouvel interrupteur, battements de cœur, coups contre le mur */}
      {Array.from({length: 30}, (_, i) => {
        const f = VOLT_KEYS.reduce((acc, [fr, v], k) => {
          if (acc !== -1 || k === 0) return acc;
          const [f0, v0] = VOLT_KEYS[k - 1];
          if (i > v0 && i <= v) return Math.round(interpolate(i, [v0, v], [f0, fr]));
          return acc;
        }, -1 as number);
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

// ----------------------------------------------------------------------------
// 4. Pourquoi le cerveau obéit (65 s)
// ----------------------------------------------------------------------------
const Brain: React.FC<{active: number}> = ({active}) => {
  const frame = useCurrentFrame();
  const zones = [
    {cx: 300, cy: 170, label: '1'},
    {cx: 470, cy: 230, label: '2'},
    {cx: 360, cy: 330, label: '3'},
  ];
  return (
    <svg width={700} height={500} viewBox="0 0 700 500">
      <path
        d="M120,260 C90,150 190,60 320,70 C420,40 560,90 590,200 C640,260 610,360 520,380 C470,440 360,450 300,410 C200,430 130,370 120,260 Z"
        fill="#1f242b"
        stroke={PALE}
        strokeWidth={4}
      />
      <path d="M200,200 C260,170 300,230 360,190 M240,300 C300,260 380,320 450,270 M420,140 C460,180 520,160 540,220" stroke="#3b424c" strokeWidth={5} fill="none" />
      {zones.map((z, i) => {
        const on = active === i + 1;
        const pulse = on ? 0.6 + 0.4 * Math.sin(frame / 6) : 0.15;
        return (
          <g key={i}>
            <circle cx={z.cx} cy={z.cy} r={on ? 70 : 50} fill={AMBER} opacity={pulse * 0.6} />
            <text x={z.cx} y={z.cy + 18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={on ? BG : '#8a919a'}>
              {z.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const SectionBrain: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const active = frame < s(5) ? 0 : frame < s(20) ? 1 : frame < s(40) ? 2 : 3;
  const climb = Math.floor(interpolate(frame, [s(25), s(38)], [0, 29], clamp));
  const bagT = interpolate(frame, [s(48), s(51)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const strings = interpolate(frame, [s(56), s(59)], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: BG}}>
      <div style={{position: 'absolute', left: 40, top: 230, transform: 'scale(1.15)', transformOrigin: 'left top'}}>
        <Brain active={active} />
      </div>
      <div style={{position: 'absolute', left: 880, top: 170, width: 960}}>
        {active === 0 && <Line text="Three things." size={80} delay={10} />}
        {active === 1 && (
          <>
            <Line text="1 · AUTHORITY" size={72} color={AMBER} delay={s(5)} />
            <div style={{display: 'flex', justifyContent: 'center', gap: 60, marginTop: 60}}>
              {['LAB COAT', 'YALE', 'CALM VOICE'].map((t, i) => (
                <div key={t} style={{opacity: spring({frame: frame - s(10) - i * 20, fps}), fontFamily: FONT, fontWeight: 800, fontSize: 36, color: PALE, border: `3px solid ${PALE}`, borderRadius: 14, padding: '16px 22px'}}>
                  {t}
                </div>
              ))}
            </div>
            <div style={{marginTop: 60}}>
              <Line text="= “trust me”" size={60} color={AMBER} delay={s(14)} />
            </div>
          </>
        )}
        {active === 2 && (
          <>
            <Line text="2 · TINY STEPS" size={72} color={AMBER} delay={s(20)} />
            <svg width={960} height={560} style={{marginTop: 20}}>
              {Array.from({length: 30}, (_, i) => {
                const x = 40 + i * 29;
                const y = 520 - i * 16;
                return <rect key={i} x={x} y={y} width={29} height={14} fill={i <= climb ? AMBER : '#2c3238'} />;
              })}
              <circle cx={40 + climb * 29 + 14} cy={520 - climb * 16 - 26} r={18} fill={PALE} />
              <text x={40 + climb * 29 + 50} y={520 - climb * 16 - 20} fontFamily={FONT} fontSize={30} fontWeight={800} fill={PALE}>
                +15 V
              </text>
            </svg>
          </>
        )}
        {active === 3 && (
          <>
            <Line text="3 · HANDING OFF RESPONSIBILITY" size={56} color={AMBER} delay={s(40)} />
            <div style={{position: 'relative', height: 600, marginTop: 30}}>
              <div style={{position: 'absolute', left: 80, top: 160}}>
                <Person color={strings > 0 ? '#c79b5a' : AMBER} seated />
                <div style={{fontFamily: FONT, fontWeight: 800, color: AMBER, fontSize: 28, width: 140, textAlign: 'center'}}>YOU</div>
              </div>
              <div style={{position: 'absolute', left: 640, top: 100}}>
                <Person color="#c9ced4" coat />
              </div>
              {/* le « sac » de responsabilité */}
              <div
                style={{
                  position: 'absolute',
                  left: 200 + bagT * 420,
                  top: 140 - Math.sin(bagT * Math.PI) * 120,
                  width: 90,
                  height: 80,
                  background: RED,
                  borderRadius: 14,
                  color: 'white',
                  fontFamily: FONT,
                  fontWeight: 900,
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                BLAME
              </div>
              {frame >= s(45) && frame < s(48) && (
                <div style={{position: 'absolute', left: 0, top: 30, fontFamily: FONT, fontStyle: 'italic', fontWeight: 800, fontSize: 36, color: PALE}}>“Who's responsible?”</div>
              )}
              {frame >= s(48) && frame < s(52) && (
                <div style={{position: 'absolute', left: 560, top: 20, fontFamily: FONT, fontStyle: 'italic', fontWeight: 800, fontSize: 44, color: '#c9ced4'}}>“I am.”</div>
              )}
              {/* fils de marionnette */}
              <svg width={400} height={200} style={{position: 'absolute', left: 60, top: -20, opacity: strings}}>
                {[40, 90, 140].map((x) => (
                  <line key={x} x1={x} y1={0} x2={x} y2={200 * strings} stroke={PALE} strokeWidth={2} />
                ))}
              </svg>
              {frame >= s(52) && (
                <div style={{position: 'absolute', left: 0, top: 470, width: 960}}>
                  <Line text="THE AGENTIC STATE" size={64} color={RED} delay={s(52)} />
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

// ----------------------------------------------------------------------------
// 5. Casser le piège (35 s)
// ----------------------------------------------------------------------------
const SectionBreak: React.FC = () => {
  const frame = useCurrentFrame();
  const pct = interpolate(frame, [s(6), s(10), s(15), s(19)], [65, 20.5, 20.5, 10], clamp);
  const rebels = spring({frame: frame - s(14), fps: FPS, config: {damping: 14}});
  const greyed = Math.floor(interpolate(frame, [s(22), s(30)], [0, 40], clamp));
  return (
    <AbsoluteFill style={{background: BG}}>
      {frame < s(21) ? (
        <>
          <div style={{position: 'absolute', top: 90, width: '100%'}}>
            <Line text="Obedience wasn't fixed." size={70} delay={5} />
          </div>
          <div style={{position: 'absolute', left: 260, top: 330, width: 1400}}>
            <div style={{fontFamily: FONT, fontSize: 34, color: '#9aa3ad', marginBottom: 14}}>Went all the way to 450 V</div>
            <div style={{height: 90, background: '#1f242b', borderRadius: 14, overflow: 'hidden'}}>
              <div style={{width: `${pct}%`, height: '100%', background: RED, borderRadius: 14}} />
            </div>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 120, color: RED, marginTop: 20}}>≈ {pct.toFixed(0)}%</div>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, color: PALE, marginTop: 10}}>
              {frame < s(6) ? 'Original version' : frame < s(14) ? '📞 Orders given by phone' : '🙅 Two other volunteers refuse'}
            </div>
          </div>
          <div style={{position: 'absolute', right: 160, top: 560, opacity: rebels, display: 'flex', gap: 30}}>
            {[0, 1].map((i) => (
              <div key={i}>
                <Person color={GREEN} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <AbsoluteFill style={{alignItems: 'center'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 100px)', gap: 26, marginTop: 110}}>
            {Array.from({length: 40}, (_, i) => {
              const red = i < 26 && i >= greyed;
              return (
                <svg key={i} width={100} height={120} viewBox="0 0 140 170">
                  <circle cx={70} cy={38} r={30} fill={red ? RED : GREY} />
                  <rect x={30} y={76} width={80} height={90} rx={28} fill={red ? RED : GREY} />
                </svg>
              );
            })}
          </div>
          <div style={{position: 'absolute', bottom: 140, width: '100%'}}>
            <Line text="One person saying NO changed everything." size={60} color={GREEN} delay={s(22)} />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------------------
// 6. Fin (20 s)
// ----------------------------------------------------------------------------
const SectionEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const no = spring({frame: frame - s(15), fps, config: {damping: 10}});
  return (
    <AbsoluteFill style={{background: BG, alignItems: 'center'}}>
      <div style={{marginTop: 90}}>
        {frame < s(6) && <Line text="So… would YOU have pressed it?" size={76} delay={5} />}
        {frame >= s(6) && frame < s(11) && <Line text="Nobody knows, until they're in the room." size={64} delay={s(6)} />}
        {frame >= s(11) && frame < s(15) && <Line text="Now you know how the trap works." size={64} color={AMBER} delay={s(11)} />}
        {frame >= s(15) && <Line text="Be the first one to say NO." size={80} color={GREEN} delay={s(15)} />}
      </div>
      <div style={{position: 'absolute', top: 380, display: 'flex', gap: 14, alignItems: 'flex-end'}}>
        {Array.from({length: 12}, (_, i) => (
          <div key={i} style={{width: 46, height: 80, borderRadius: 8, background: '#3a4049'}} />
        ))}
        <div style={{textAlign: 'center', marginLeft: 30}}>
          <div
            style={{
              width: 110,
              height: 170,
              borderRadius: 16,
              background: no > 0.05 ? GREEN : '#3a4049',
              boxShadow: no > 0.05 ? `0 0 ${60 * no}px ${GREEN}` : 'none',
              transform: `scale(${1 + 0.15 * no})`,
            }}
          />
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 48, color: no > 0.05 ? GREEN : '#8a919a', marginTop: 14}}>NO</div>
        </div>
      </div>
      <Sequence from={s(15)} durationInFrames={s(2)}>
        <Audio src={staticFile('impact.wav')} volume={0.7} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------------------
// Assemblage : 250 s (4 min 10)
// ----------------------------------------------------------------------------
const SECTIONS: {from: number; dur: number; el: React.ReactNode}[] = [
  {from: 0, dur: 35, el: <MilgramHook />},
  {from: 35, dur: 45, el: <SectionTrap />},
  {from: 80, dur: 50, el: <SectionEscalation />},
  {from: 130, dur: 65, el: <SectionBrain />},
  {from: 195, dur: 35, el: <SectionBreak />},
  {from: 230, dur: 20, el: <SectionEnd />},
];

export const MILGRAM_FULL_FRAMES = s(250);

export const MilgramFull: React.FC = () => (
  <AbsoluteFill style={{background: BG}}>
    {SECTIONS.map(({from, dur, el}) => (
      <Sequence key={from} from={s(from)} durationInFrames={s(dur)}>
        {from === 0 ? el : <Fade duration={s(dur)}>{el}</Fade>}
      </Sequence>
    ))}
    {/* ambiance continue (bourdonnement grave), en boucle */}
    <Audio src={staticFile('drone.wav')} loop volume={(f) => (f >= s(104) && f < s(110) ? 0 : 0.35)} />
    {/* sons de l'accroche : clics du panneau et impact du 65 % */}
    {Array.from({length: 30}, (_, i) => (
      <Sequence key={i} from={s(4) + Math.round((15 + (i * 155) / 30))} durationInFrames={8}>
        <Audio src={staticFile('click.wav')} volume={0.35} />
      </Sequence>
    ))}
    <Sequence from={s(29)} durationInFrames={s(2)}>
      <Audio src={staticFile('impact.wav')} volume={0.9} />
    </Sequence>
    <Captions />
  </AbsoluteFill>
);
