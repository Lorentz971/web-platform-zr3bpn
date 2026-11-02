// « How Cults Take Over Normal People's Minds » : style papier découpé, 4 min 15.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {P, SANS, SERIF, t, cl, Cut, PaperBG, Figure, Serif, Label, PaperCaptions, TearWipe, Heart, Speech, Cap} from './paper';

// ---------------------------------------------------------------------------
// Sous-titres
// ---------------------------------------------------------------------------
const CAPS: Cap[] = [
  [0, 3, 'Nobody ever joined a cult.'],
  [3, 7, 'They joined a church that fought racism.'],
  [7, 10, 'A community that fed the poor.'],
  [10, 14, 'A group that finally made them feel like they belonged.'],
  [14, 20, 'In 1978, in the jungle of Guyana, more than nine hundred of those people died on a single day.'],
  [20, 22, 'At a place called Jonestown.'],
  [22, 26, "Most of them weren't crazy. They weren't stupid."],
  [26, 30, 'Years earlier, they had simply said yes to something that looked good.'],
  [30, 33, 'So how does a normal person end up there?'],
  [33, 35, 'It happens in four steps.'],
  [35, 40, 'First, forget the idea that only weak people fall for this.'],
  [40, 46, "Recruiters don't look for a type of person. They look for a moment."],
  [46, 52, 'A new city. A breakup. Losing a parent. The first year of college.'],
  [52, 58, "Moments when your old world has gone quiet, and you're looking for a new one."],
  [58, 64, 'At that moment, anyone is vulnerable.'],
  [64, 70, 'Including you.'],
  [70, 73, 'Step one: love.'],
  [73, 79, 'Your first visit, everyone is so happy to see you. They remember your name.'],
  [79, 84, 'They laugh at your jokes. They actually listen.'],
  [84, 90, 'Psychologists call this love bombing. It gives you exactly what you were missing.'],
  [90, 96, "But notice something: you haven't been told what the group really believes."],
  [96, 100, 'Not yet.'],
  [100, 103, 'Step two: small steps.'],
  [103, 110, 'Come back next week. Stay for dinner. Join this weekend retreat. Donate a little.'],
  [110, 116, 'Each request is tiny. And every yes makes the next yes easier.'],
  [116, 123, 'Saying no now would mean admitting the last ten yeses were a mistake.'],
  [123, 130, 'Six months later, the group has your weekends, your money, and most of your friends.'],
  [130, 133, 'Step three: control.'],
  [133, 138, 'Cult expert Steven Hassan describes it with four letters.'],
  [138, 142, 'Behavior: what you wear, eat, and do with your time.'],
  [142, 146, 'Information: what you can read, and who you can talk to.'],
  [146, 150, 'Thoughts: a special vocabulary, so doubts start to sound like sins.'],
  [150, 154, 'Emotions: guilt and fear whenever you step out of line.'],
  [154, 162, 'And slowly, the world splits in two. Us, who understand.'],
  [162, 170, 'And them, including your own family, who are lost.'],
  [170, 173, 'Step four: the exit disappears.'],
  [173, 180, 'In 1954, psychologist Leon Festinger infiltrated a group convinced the world would end on December 21st.'],
  [180, 184, 'Some had quit their jobs and given everything away.'],
  [184, 188, 'The date came. Nothing happened.'],
  [188, 194, 'And instead of leaving, many of them believed even harder.'],
  [194, 201, "Because when you've given up everything, admitting you were wrong hurts more than staying."],
  [201, 210, 'Your friends are inside. Your money is gone. Your identity is the group.'],
  [210, 215, 'So how do you protect yourself? Not by being smart.'],
  [215, 218, 'Watch for three warning signs.'],
  [218, 223, "One: you can't question the leader."],
  [223, 228, "Two: the love feels conditional. Warm when you obey, cold when you don't."],
  [228, 233, 'Three: the group wants you to need fewer people outside it.'],
  [233, 239, 'And the best protection of all? Keep one friend outside.'],
  [239, 245, 'Someone who knew you before.'],
  [245, 248, "Cults don't recruit the weak."],
  [248, 252, 'They recruit the lonely, at exactly the right moment.'],
  [252, 255, "The best defense isn't intelligence. It's connection."],
];

const pop = (frame: number, at: number, fps: number, damping = 12) => spring({frame: frame - at, fps, config: {damping}});
const CROWD = [P.teal, P.plum, P.mustard, '#4f7cac', '#c97b63', P.teal, '#8a6fb0', '#d39b3c'];

// ---------------------------------------------------------------------------
// 1. ACCROCHE (35 s)
// ---------------------------------------------------------------------------
const House: React.FC = () => (
  <svg width={520} height={460} viewBox="0 0 520 460">
    <rect x={60} y={190} width={400} height={260} fill={P.white} />
    <polygon points="30,200 260,40 490,200" fill={P.coral} />
    <rect x={230} y={0} width={60} height={110} fill={P.coralDark} />
    <rect x={215} y={300} width={90} height={150} rx={45} fill={P.teal} />
    <circle cx={260} cy={240} r={34} fill={P.mustard} />
    <path d="M260,262 C246,250 238,244 238,234 C238,226 244,222 250,222 C255,222 258,225 260,229 C262,225 265,222 270,222 C276,222 282,226 282,234 C282,244 274,250 260,262 Z" fill={P.coral} />
    <rect x={100} y={250} width={70} height={70} fill={P.mustard} opacity={0.8} />
    <rect x={350} y={250} width={70} height={70} fill={P.mustard} opacity={0.8} />
  </svg>
);

const SAmerica: React.FC<{pin: number}> = ({pin}) => (
  <svg width={520} height={640} viewBox="0 0 420 520">
    <path d="M150,20 L230,28 L300,68 L362,118 L382,168 L352,228 L312,282 L282,342 L242,402 L212,472 L192,500 L178,430 L168,352 L150,302 L118,252 L80,200 L60,150 L88,92 L120,50 Z" fill={P.teal} opacity={0.85} />
    <g transform={`translate(232, ${70 - (1 - pin) * 60}) scale(${pin})`}>
      <circle r={16} fill={P.coral} />
      <rect x={-3} y={10} width={6} height={30} fill={P.ink} />
    </g>
  </svg>
);

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shrink = interpolate(frame, [t(12), t(15)], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  const toSteps = interpolate(frame, [t(22), t(23)], [1, 0], cl);
  const stepsIn = frame >= t(22);
  return (
    <PaperBG color={P.cream}>
      {/* Phase 1 et 2 : la maison accueillante, puis la photo sur la carte */}
      <AbsoluteFill style={{opacity: toSteps}}>
        <div
          style={{
            position: 'absolute',
            left: interpolate(shrink, [0, 1], [0, 220]),
            top: interpolate(shrink, [0, 1], [0, 210]),
            width: 1920,
            height: 1080,
            transform: `scale(${interpolate(shrink, [0, 1], [1, 0.36])}) rotate(${shrink * -4}deg)`,
            transformOrigin: 'top left',
            background: shrink > 0 ? P.white : 'transparent',
            padding: shrink > 0 ? 50 : 0,
            boxShadow: shrink > 0 ? '20px 30px 0 rgba(43,34,51,.25)' : 'none',
          }}
        >
          <div style={{position: 'relative', width: 1920 - (shrink > 0 ? 100 : 0), height: 1080 - (shrink > 0 ? 160 : 0), background: P.rose, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 700, top: 300}}>
              <Cut seed={3} shadow={14}>
                <House />
              </Cut>
            </div>
            {CROWD.map((c, i) => {
              const walk = interpolate(frame, [i * 12, i * 12 + 120], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
              const side = i % 2 === 0 ? -1 : 1;
              const x = 960 + side * (300 + (i >> 1) * 150) * (1.3 - walk * 0.3) - 60;
              return (
                <div key={i} style={{position: 'absolute', left: x, top: 560 + (i % 3) * 20}}>
                  <Figure color={c} size={230} seed={i + 1} arms={frame > t(7) && i % 3 === 0 ? 'up' : 'down'} />
                </div>
              );
            })}
            {Array.from({length: 7}, (_, i) => {
              const at = t(4) + i * 14;
              const p = interpolate(frame - at, [0, 50], [0, 1], cl);
              return frame > at ? (
                <div key={i} style={{position: 'absolute', left: 560 + i * 120, top: 520 - p * 300, opacity: 1 - p, transform: `scale(${0.6 + p})`}}>
                  <Heart size={70} />
                </div>
              ) : null;
            })}
          </div>
          {shrink > 0.9 && <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 56, color: P.ink, marginTop: 20, textAlign: 'center'}}>Peoples Temple, 1970s</div>}
        </div>
        {frame < t(12) && (
          <div style={{position: 'absolute', top: 70, width: '100%'}}>
            <Serif text="Nobody ever joined a cult." size={104} delay={4} highlight="cult." />
          </div>
        )}
        {frame >= t(13) && (
          <>
            <div style={{position: 'absolute', right: 180, top: 160, opacity: interpolate(frame, [t(13), t(14)], [0, 1], cl)}}>
              <Cut seed={8} shadow={10}>
                <SAmerica pin={pop(frame, t(15), fps, 9)} />
              </Cut>
            </div>
            {frame >= t(15) && (
              <div style={{position: 'absolute', right: 230, top: 120}}>
                <Label text="Guyana · 1978" delay={t(15)} bg={P.coral} color={P.white} size={44} />
              </div>
            )}
            {frame >= t(17) && (
              <div style={{position: 'absolute', left: 980, top: 690, width: 800}}>
                <Serif text="900+" size={150} color={P.coralDark} delay={t(17)} italic={false} />
              </div>
            )}
          </>
        )}
      </AbsoluteFill>
      {/* Phase 3 : quatre marches */}
      {stepsIn && (
        <AbsoluteFill>
          <div style={{position: 'absolute', top: 120, width: '100%'}}>
            {frame < t(30) ? <Serif text="They simply said yes." size={96} delay={t(22.5)} highlight="yes." /> : <Serif text="It happens in four steps." size={96} delay={t(30)} highlight="four" />}
          </div>
          <div style={{position: 'absolute', left: 360, top: 470, display: 'flex', alignItems: 'flex-end', gap: 30}}>
            {[1, 2, 3, 4].map((n, i) => {
              const p = pop(frame, t(23) + i * 10, fps);
              const col = [P.mustard, P.coral, P.plum, P.indigo][i];
              return (
                <Cut key={n} seed={20 + i} shadow={12}>
                  <div style={{width: 260, height: 120 + i * 90, background: col, transform: `scaleY(${p})`, transformOrigin: 'bottom', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 20, fontFamily: SERIF, fontWeight: 700, fontSize: 80, color: P.white}}>
                    {n}
                  </div>
                </Cut>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
    </PaperBG>
  );
};

// ---------------------------------------------------------------------------
// 2. QUI SE FAIT RECRUTER (35 s)
// ---------------------------------------------------------------------------
const Icon: React.FC<{kind: string}> = ({kind}) => {
  const c = P.ink;
  if (kind === 'suitcase')
    return (
      <svg width={90} height={80} viewBox="0 0 90 80">
        <rect x={5} y={22} width={80} height={54} rx={8} fill={P.coralDark} />
        <rect x={30} y={8} width={30} height={18} rx={6} fill="none" stroke={c} strokeWidth={6} />
      </svg>
    );
  if (kind === 'heart')
    return (
      <svg width={90} height={80} viewBox="0 0 100 90">
        <path d="M50,88 C20,62 2,46 2,26 C2,10 14,2 28,2 C38,2 46,8 50,16 L42,34 L56,46 L46,62 Z" fill={P.coral} />
        <path d="M54,18 C58,8 64,2 72,2 C86,2 98,10 98,26 C98,46 80,62 54,86 L60,62 L50,46 L64,34 Z" fill={P.coral} />
      </svg>
    );
  if (kind === 'candle')
    return (
      <svg width={70} height={90} viewBox="0 0 70 90">
        <rect x={22} y={34} width={26} height={54} fill={P.white} />
        <path d="M35,4 C46,18 44,28 35,32 C26,28 24,18 35,4 Z" fill={P.mustard} />
      </svg>
    );
  if (kind === 'cap')
    return (
      <svg width={100} height={80} viewBox="0 0 100 80">
        <polygon points="50,6 96,28 50,50 4,28" fill={c} />
        <rect x={30} y={40} width={40} height={22} fill={c} />
        <line x1={88} y1={30} x2={88} y2={60} stroke={P.mustard} strokeWidth={4} />
      </svg>
    );
  return null;
};

const SceneWho: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const people = [
    {c: P.teal, icon: 'suitcase'},
    {c: P.plum, icon: 'heart'},
    {c: '#4f7cac', icon: 'candle'},
    {c: P.coral, icon: '', you: true},
    {c: P.mustard, icon: 'cap'},
    {c: '#c97b63', icon: ''},
  ];
  const spotX = interpolate(frame, [t(23), t(28), t(29)], [200, 1500, 960 + 0], {...cl, easing: Easing.inOut(Easing.cubic)});
  const youX = 260 + 3 * 250 + 60;
  const finalSpot = interpolate(frame, [t(29), t(30)], [spotX, youX], cl);
  const spot = frame < t(29) ? spotX : finalSpot;
  const dark = interpolate(frame, [t(22), t(24)], [0, 0.55], cl);
  return (
    <PaperBG color={P.sand}>
      <div style={{position: 'absolute', top: 70, width: '100%'}}>
        {frame < t(5) && <Serif text="Not weak people." size={100} delay={4} />}
        {frame >= t(5) && frame < t(11) && <Serif text="Not a type. A moment." size={100} delay={t(5)} highlight="moment." />}
        {frame >= t(11) && frame < t(23) && <Serif text="When your old world goes quiet." size={90} delay={t(17)} />}
        {frame >= t(23) && frame < t(29) && <Serif text="Anyone is vulnerable." size={100} delay={t(23)} highlight="anyone" />}
        {frame >= t(29) && <Serif text="Including you." size={120} delay={t(29)} color={P.coralDark} />}
      </div>
      <AbsoluteFill style={{background: `rgba(27,29,51,${dark})`}} />
      {frame >= t(22) && (
        <div style={{position: 'absolute', left: spot - 260, top: 260, width: 520, height: 820, background: 'radial-gradient(ellipse at center, rgba(255,240,200,.55) 0%, rgba(255,240,200,0) 65%)', mixBlendMode: 'screen'}} />
      )}
      {people.map((p, i) => {
        const inP = pop(frame, 10 + i * 8, fps, 14);
        const iconP = pop(frame, t(11) + i * 20, fps, 10);
        return (
          <div key={i} style={{position: 'absolute', left: 260 + i * 250, top: 470, transform: `translateY(${(1 - inP) * 400}px)`}}>
            {p.icon && (
              <div style={{position: 'absolute', top: -120, left: 40, transform: `scale(${iconP})`}}>
                <Cut seed={i + 30}>
                  <Icon kind={p.icon} />
                </Cut>
              </div>
            )}
            <Figure color={p.c} size={300} seed={i + 4} you={p.you && frame >= t(29)} look={Math.sin(frame / 40 + i)} />
          </div>
        );
      })}
      {frame >= t(29.5) && (
        <div style={{position: 'absolute', left: youX - 70, top: 400}}>
          <Label text="You" bg={P.mustard} delay={t(29.5)} size={48} />
        </div>
      )}
      {[0, 1, 2, 3].map((i) => (
        <Sequence key={i} from={t(11) + i * 20} durationInFrames={8}>
          <Audio src={staticFile('cults/pop.wav')} volume={0.5} />
        </Sequence>
      ))}
    </PaperBG>
  );
};

// ---------------------------------------------------------------------------
// 3. LOVE BOMBING (30 s)
// ---------------------------------------------------------------------------
const SceneLove: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const belong = interpolate(frame, [t(3), t(20)], [0.1, 1], {...cl, easing: Easing.out(Easing.quad)});
  const curtain = pop(frame, t(20), fps, 16);
  const bubbles = [
    {text: "We're so glad you came!", x: 160, y: 200, at: t(3)},
    {text: 'Sarah, right? Welcome!', x: 1150, y: 170, at: t(6)},
    {text: "Haha, you're hilarious!", x: 120, y: 470, at: t(9)},
    {text: 'Tell me about yourself.', x: 1230, y: 470, at: t(12)},
    {text: 'You belong here.', x: 660, y: 120, at: t(15)},
  ];
  return (
    <PaperBG color={P.rose}>
      {/* rideau fermé en arrière-plan */}
      <div style={{position: 'absolute', left: 700, top: 110, width: 520, height: 360, opacity: curtain}}>
        <Cut seed={50} shadow={10}>
          <div style={{width: 520, height: 360, background: `repeating-linear-gradient(90deg, ${P.plum} 0 40px, #6a3f82 40px 80px)`}} />
        </Cut>
        <div style={{position: 'absolute', top: 30, left: 70}}>
          <Label text="What we believe" bg={P.ink} color={P.white} delay={t(20)} size={34} />
        </div>
      </div>
      {/* le groupe en cercle autour de toi */}
      {Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const p = pop(frame, 5 + i * 6, fps, 15);
        const r = 520 - p * 120;
        return (
          <div key={i} style={{position: 'absolute', left: 900 + Math.cos(a) * r - 60, top: 600 + Math.sin(a) * r * 0.42 - 100}}>
            <Figure color={CROWD[i]} size={240} seed={i + 60} arms={(frame + i * 20) % 90 < 45 ? 'up' : 'down'} look={Math.cos(a) > 0 ? -1 : 1} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 900 - 70, top: 540}}>
        <Figure color={P.coral} size={300} you seed={7} />
      </div>
      {/* cœurs qui convergent */}
      {Array.from({length: 18}, (_, i) => {
        const at = t(2) + i * 18;
        const p = interpolate(frame - at, [0, 40], [0, 1], {...cl, easing: Easing.in(Easing.quad)});
        if (frame < at || p >= 1) return null;
        const a = (i * 137) % 360;
        const sx = 900 + Math.cos((a * Math.PI) / 180) * 700;
        const sy = 600 + Math.sin((a * Math.PI) / 180) * 380;
        return (
          <div key={i} style={{position: 'absolute', left: sx + (900 - sx) * p, top: sy + (620 - sy) * p, transform: `scale(${1 - p * 0.5})`}}>
            <Heart size={54} />
          </div>
        );
      })}
      {bubbles.map((b, i) => {
        const p = pop(frame, b.at, fps, 11);
        return frame >= b.at && frame < t(20) ? (
          <div key={i} style={{position: 'absolute', left: b.x, top: b.y, transform: `scale(${p})`, transformOrigin: 'bottom left'}}>
            <Cut seed={i + 70}>
              <Speech text={b.text} />
            </Cut>
          </div>
        ) : null;
      })}
      {/* jauge d'appartenance */}
      <div style={{position: 'absolute', right: 90, top: 240}}>
        <Cut seed={80} shadow={8}>
          <div style={{width: 90, height: 520, background: P.white, borderRadius: 45, padding: 12, display: 'flex', alignItems: 'flex-end'}}>
            <div style={{width: '100%', height: `${belong * 100}%`, background: `linear-gradient(${P.coral}, ${P.coralDark})`, borderRadius: 33}} />
          </div>
        </Cut>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: P.ink, marginTop: 18, textAlign: 'center', width: 90, marginLeft: -40, transform: 'translateX(20px)'}}>BELONGING</div>
      </div>
      <div style={{position: 'absolute', top: 60, left: 80}}>
        {frame < t(14) && <Label text="Step 1 · Love" bg={P.coral} color={P.white} delay={6} size={54} />}
        {frame >= t(14) && frame < t(20) && <Label text="Love bombing" bg={P.coral} color={P.white} delay={t(14)} size={54} />}
        {frame >= t(26) && <Label text="Not yet." bg={P.ink} color={P.white} delay={t(26)} size={54} />}
      </div>
      {bubbles.map((b, i) => (
        <Sequence key={i} from={b.at} durationInFrames={8}>
          <Audio src={staticFile('cults/pop.wav')} volume={0.45} />
        </Sequence>
      ))}
    </PaperBG>
  );
};

// ---------------------------------------------------------------------------
// 4. LES PETITS PAS (30 s)
// ---------------------------------------------------------------------------
const CARDS = ['Come back next week', 'Stay for dinner', 'Weekend retreat', 'Donate a little'];

const SceneSteps: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phase2 = frame >= t(23);
  const fill = interpolate(frame, [t(23.5), t(29)], [0, 1], cl);
  return (
    <PaperBG color={P.sand}>
      <div style={{position: 'absolute', top: 60, left: 80}}>
        <Label text="Step 2 · Small steps" bg={P.mustard} delay={4} size={54} />
      </div>
      {!phase2 ? (
        <>
          {CARDS.map((c, i) => {
            const at = t(3) + i * t(1.7);
            const p = pop(frame, at, fps, 14);
            const yes = frame >= t(10) + i * 25;
            const ys = pop(frame, t(10) + i * 25, fps, 8);
            return (
              <div key={c} style={{position: 'absolute', left: 260 + i * 330, top: 300 + i * 30, transform: `translateY(${(1 - p) * -700}px) rotate(${-6 + i * 4}deg)`}}>
                <Cut seed={i + 90} shadow={12}>
                  <div style={{width: 300, height: 380, background: P.white, borderRadius: 14, padding: 30, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                    <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: P.grey}}>REQUEST #{i + 1}</div>
                    <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 48, color: P.ink, lineHeight: 1.1}}>{c}</div>
                    <div style={{height: 70}} />
                  </div>
                </Cut>
                {yes && (
                  <div style={{position: 'absolute', left: 120, top: 250, transform: `rotate(-14deg) scale(${2 - ys})`, opacity: ys, fontFamily: SANS, fontWeight: 700, fontSize: 64, color: P.coral, border: `6px solid ${P.coral}`, borderRadius: 12, padding: '0 18px'}}>
                    YES
                  </div>
                )}
              </div>
            );
          })}
          <div style={{position: 'absolute', bottom: 190, width: '100%'}}>
            {frame >= t(10) && frame < t(16) && <Serif text="Each yes makes the next one easier." size={70} delay={t(10)} highlight="easier." />}
            {frame >= t(16) && <Serif text="Saying no would mean admitting you were wrong." size={64} delay={t(16)} />}
          </div>
        </>
      ) : (
        <>
          <div style={{position: 'absolute', top: 180, width: '100%'}}>
            <Serif text="Six months later." size={96} delay={t(23)} />
          </div>
          {[
            {label: 'Your weekends', icon: '📅'},
            {label: 'Your money', icon: '💰'},
            {label: 'Your friends', icon: '👥'},
          ].map((it, i) => {
            const p = pop(frame, t(23.5) + i * 12, fps, 14);
            const f = Math.min(1, Math.max(0, fill * 1.3 - i * 0.15));
            return (
              <div key={it.label} style={{position: 'absolute', left: 230 + i * 520, top: 420, transform: `scale(${p})`}}>
                <Cut seed={i + 100} shadow={10}>
                  <div style={{width: 420, background: P.white, borderRadius: 16, padding: 34, textAlign: 'center'}}>
                    <div style={{fontSize: 90}}>{it.icon}</div>
                    <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 48, color: P.ink, margin: '10px 0 24px'}}>{it.label}</div>
                    <div style={{height: 34, background: '#e8e0d3', borderRadius: 17, overflow: 'hidden'}}>
                      <div style={{width: `${f * 100}%`, height: '100%', background: P.plum, borderRadius: 17}} />
                    </div>
                    <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: P.plum, marginTop: 14}}>{Math.round(f * 100)}% · THE GROUP</div>
                  </div>
                </Cut>
              </div>
            );
          })}
        </>
      )}
      {CARDS.map((_, i) => (
        <Sequence key={`sw${i}`} from={t(3) + i * t(1.7)} durationInFrames={12}>
          <Audio src={staticFile('cults/swish.wav')} volume={0.6} />
        </Sequence>
      ))}
      {CARDS.map((_, i) => (
        <Sequence key={`st${i}`} from={t(10) + i * 25} durationInFrames={10}>
          <Audio src={staticFile('cults/stamp.wav')} volume={0.8} />
        </Sequence>
      ))}
    </PaperBG>
  );
};

// ---------------------------------------------------------------------------
// 5. LE CONTRÔLE (40 s)
// ---------------------------------------------------------------------------
const BITE = [
  {l: 'B', w: 'Behavior', d: 'what you wear, eat, do', at: 8},
  {l: 'I', w: 'Information', d: 'what you read, who you see', at: 12},
  {l: 'T', w: 'Thoughts', d: 'doubts become sins', at: 16},
  {l: 'E', w: 'Emotions', d: 'guilt and fear', at: 20},
];

const SceneControl: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const split = frame >= t(24);
  const lineP = interpolate(frame, [t(24), t(25.5)], [0, 1], cl);
  const family = interpolate(frame, [t(32), t(38)], [0, 1], cl);
  return (
    <PaperBG color={P.indigo} dark>
      <div style={{position: 'absolute', top: 60, left: 80}}>
        <Label text="Step 3 · Control" bg={P.plum} color={P.white} delay={4} size={54} />
      </div>
      {!split ? (
        <>
          <div style={{position: 'absolute', top: 180, width: '100%'}}>
            <Serif text="Four letters." size={90} color={P.white} delay={t(3)} />
          </div>
          <div style={{position: 'absolute', top: 380, width: '100%', display: 'flex', justifyContent: 'center', gap: 50}}>
            {BITE.map((b) => {
              const p = interpolate(frame, [t(b.at), t(b.at) + 14], [0, 1], {...cl, easing: Easing.out(Easing.back(1.4))});
              const lit = frame >= t(b.at);
              return (
                <div key={b.l} style={{perspective: 900}}>
                  <div style={{transform: `rotateY(${lit ? (1 - p) * 90 : 0}deg)`}}>
                    <Cut seed={b.l.charCodeAt(0)} shadow={12}>
                      <div style={{width: 330, height: 420, borderRadius: 18, background: lit ? P.white : '#3a3f63', padding: 30, textAlign: 'center'}}>
                        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 200, lineHeight: 1, color: lit ? P.coral : '#4a5078'}}>{lit ? b.l : '?'}</div>
                        {lit && <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 46, color: P.ink, marginTop: 14}}>{b.w}</div>}
                        {lit && <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, color: P.grey, marginTop: 14}}>{b.d}</div>}
                      </div>
                    </Cut>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* la ligne qui coupe le monde en deux */}
          <div style={{position: 'absolute', left: 958, top: 140, width: 6, height: 900 * lineP, background: P.mustard, boxShadow: `0 0 30px ${P.mustard}`}} />
          <div style={{position: 'absolute', left: 300, top: 170}}>
            <Serif text="Us." size={120} color={P.mustard} delay={t(24.5)} />
          </div>
          <div style={{position: 'absolute', left: 1300, top: 170}}>
            <Serif text="Them." size={120} color={P.mist} delay={t(32)} />
          </div>
          {CROWD.slice(0, 5).map((c, i) => (
            <div key={i} style={{position: 'absolute', left: 140 + i * 140, top: 480 + (i % 2) * 40}}>
              <Figure color={c} size={260} seed={i + 110} look={1} />
            </div>
          ))}
          <div style={{position: 'absolute', left: 420, top: 600}}>
            <Figure color={P.coral} size={280} you seed={7} look={1} />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{position: 'absolute', left: 1180 + i * 200 + family * 120, top: 500 + (i % 2) * 40, filter: `blur(${family * 3}px)`}}>
              <Figure color={['#d39b3c', '#4f7cac', '#c97b63'][i]} size={260} seed={i + 120} grey={family} arms={i === 1 ? 'up' : 'down'} look={-1} />
            </div>
          ))}
          {frame >= t(33) && (
            <div style={{position: 'absolute', left: 1220, top: 880}}>
              <Label text="Including your family" bg={P.mist} delay={t(33)} size={36} />
            </div>
          )}
        </>
      )}
      {BITE.map((b) => (
        <Sequence key={b.l} from={t(b.at)} durationInFrames={12}>
          <Audio src={staticFile('cults/swish.wav')} volume={0.6} />
        </Sequence>
      ))}
    </PaperBG>
  );
};

// ---------------------------------------------------------------------------
// 6. LA SORTIE DISPARAÎT (40 s)
// ---------------------------------------------------------------------------
const SceneExit: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const day = Math.min(21, 17 + Math.floor(interpolate(frame, [t(4), t(13)], [0, 4.99], cl)));
  const clockA = interpolate(frame, [t(13), t(16)], [300, 360], cl);
  const huddle = interpolate(frame, [t(18), t(24)], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  const door = interpolate(frame, [t(24), t(34)], [1, 0.15], {...cl, easing: Easing.in(Easing.quad)});
  const strings = interpolate(frame, [t(31), t(34)], [0, 1], cl);
  const phaseA = frame < t(18);
  return (
    <PaperBG color={P.night} dark>
      <div style={{position: 'absolute', top: 60, left: 80}}>
        <Label text="Step 4 · The exit disappears" bg={P.plum} color={P.white} delay={4} size={50} />
      </div>
      {phaseA ? (
        <>
          <div style={{position: 'absolute', left: 300, top: 260}}>
            <Cut seed={130} shadow={12}>
              <div style={{width: 520, background: P.white, borderRadius: 12, overflow: 'hidden', textAlign: 'center'}}>
                <div style={{background: P.coral, color: P.white, fontFamily: SANS, fontWeight: 700, fontSize: 44, letterSpacing: 4, padding: 16}}>DECEMBER 1954</div>
                <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 280, color: day === 21 ? P.coral : P.ink, lineHeight: 1.2}}>{day}</div>
              </div>
            </Cut>
          </div>
          <div style={{position: 'absolute', left: 1080, top: 250}}>
            <Cut seed={131} shadow={12}>
              <svg width={520} height={520} viewBox="-130 -130 260 260">
                <circle r={120} fill={P.white} />
                {Array.from({length: 12}, (_, i) => (
                  <rect key={i} x={-3} y={-110} width={6} height={18} fill={P.ink} transform={`rotate(${i * 30})`} />
                ))}
                <rect x={-5} y={-70} width={10} height={74} rx={5} fill={P.ink} transform={`rotate(${clockA - 360 + 0})`} />
                <rect x={-3} y={-100} width={6} height={104} rx={3} fill={P.coral} transform={`rotate(${clockA * 12})`} />
                <circle r={10} fill={P.ink} />
              </svg>
            </Cut>
          </div>
          <div style={{position: 'absolute', bottom: 190, width: '100%'}}>
            {frame < t(13) && <Serif text="“The world ends on the 21st.”" size={70} color={P.white} delay={t(4)} />}
            {frame >= t(14) && <Serif text="Nothing happened." size={100} color={P.mustard} delay={t(14)} />}
          </div>
        </>
      ) : (
        <>
          <div style={{position: 'absolute', top: 150, width: '100%'}}>
            {frame < t(24) ? <Serif text="They believed even harder." size={90} color={P.white} delay={t(18)} highlight="harder." /> : <Serif text="Your identity is the group." size={90} color={P.white} delay={t(31)} />}
          </div>
          {/* porte de sortie qui s'éloigne */}
          <div style={{position: 'absolute', left: 1450, top: 360, transform: `scale(${door}) translateY(${(1 - door) * -200}px)`, transformOrigin: 'center bottom', opacity: 0.4 + door * 0.6}}>
            <Cut seed={140} shadow={10}>
              <div style={{width: 230, height: 400, background: P.mustard, borderRadius: '115px 115px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 52, color: P.ink, letterSpacing: 4}}>EXIT</div>
            </Cut>
          </div>
          {CROWD.slice(0, 6).map((c, i) => {
            const startX = 150 + i * 200;
            const endX = 520 + (i - 2.5) * 110;
            return (
              <div key={i} style={{position: 'absolute', left: startX + (endX - startX) * huddle, top: 540 + (i % 2) * 30}}>
                <Figure color={c} size={250} seed={i + 150} grey={0.25} />
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 560, top: 600}}>
            <Figure color={P.coral} size={280} you seed={7} strings={strings} />
          </div>
          {frame >= t(31) &&
            ['Friends: inside', 'Money: gone', 'Identity: the group'].map((x, i) => (
              <div key={x} style={{position: 'absolute', left: 1050, top: 820 - i * 0, marginTop: 0, transform: `translateY(${-i * 90}px)`}}>
                <Label text={x} bg={P.white} delay={t(31) + i * 20} size={34} rotate={-1 + i} />
              </div>
            ))}
        </>
      )}
      {Array.from({length: 5}, (_, i) => (
        <Sequence key={`tk${i}`} from={t(4) + i * t(2.2)} durationInFrames={6}>
          <Audio src={staticFile('cults/tick.wav')} volume={0.6} />
        </Sequence>
      ))}
      <Sequence from={t(16)} durationInFrames={t(3)}>
        <Audio src={staticFile('cults/bell.wav')} volume={0.7} />
      </Sequence>
    </PaperBG>
  );
};

// ---------------------------------------------------------------------------
// 7. SE PROTÉGER (35 s)
// ---------------------------------------------------------------------------
const SIGNS = [
  {txt: "You can't question the leader", at: 8},
  {txt: 'The love is conditional', at: 13},
  {txt: 'They want you to need fewer people outside', at: 18},
];

const SceneProtect: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phase2 = frame >= t(23);
  const reach = interpolate(frame, [t(23), t(27)], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const snap = frame >= t(29);
  const fall = interpolate(frame, [t(29), t(31)], [0, 1], cl);
  return (
    <PaperBG color={P.indigo} dark>
      {!phase2 ? (
        <>
          <div style={{position: 'absolute', top: 90, width: '100%'}}>
            {frame < t(5) ? <Serif text="Not by being smart." size={96} color={P.white} delay={4} /> : <Serif text="Three warning signs." size={96} color={P.mustard} delay={t(5)} />}
          </div>
          <div style={{position: 'absolute', top: 330, width: '100%', display: 'flex', justifyContent: 'center', gap: 70}}>
            {SIGNS.map((sg, i) => {
              const p = pop(frame, t(sg.at), fps, 9);
              const lit = frame >= t(sg.at);
              return (
                <div key={i} style={{width: 460, textAlign: 'center', transform: `scale(${0.85 + 0.15 * p})`}}>
                  <Cut seed={i + 160} shadow={12}>
                    <svg width={300} height={270} viewBox="0 0 100 90">
                      <polygon points="50,4 96,86 4,86" fill={lit ? P.mustard : '#3a3f63'} stroke={P.ink} strokeWidth={3} strokeLinejoin="round" />
                      <text x={50} y={72} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={46} fill={P.ink}>
                        {i + 1}
                      </text>
                    </svg>
                  </Cut>
                  <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 42, color: lit ? P.white : '#5a5f83', marginTop: 20, lineHeight: 1.15, opacity: 0.4 + 0.6 * p}}>{sg.txt}</div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div style={{position: 'absolute', top: 110, width: '100%'}}>
            {frame < t(29) ? <Serif text="Keep one friend outside." size={96} color={P.white} delay={t(23)} highlight="outside." /> : <Serif text="Someone who knew you before." size={90} color={P.mustard} delay={t(29)} />}
          </div>
          {/* cercle du groupe */}
          <div style={{position: 'absolute', left: 260, top: 360, width: 900, height: 600, borderRadius: '50%', border: `6px dashed ${P.plum}`}} />
          {CROWD.slice(0, 5).map((c, i) => (
            <div key={i} style={{position: 'absolute', left: 340 + i * 150, top: 470 + (i % 2) * 50}}>
              <Figure color={c} size={220} seed={i + 170} grey={0.4} />
            </div>
          ))}
          <div style={{position: 'absolute', left: 900, top: 520}}>
            <Figure color={P.coral} size={290} you seed={7} strings={snap ? 0 : 1} arms={reach > 0.5 ? 'reach' : 'down'} />
          </div>
          {snap && (
            <svg width={300} height={700} style={{position: 'absolute', left: 900, top: -100, opacity: 1 - fall}}>
              {[20, 90, 160].map((x, i) => (
                <line key={x} x1={x} y1={0} x2={x + (i - 1) * 40 * fall} y2={300 + fall * 300} stroke={P.white} strokeWidth={2} />
              ))}
            </svg>
          )}
          <div style={{position: 'absolute', left: 1500 - reach * 160, top: 500}}>
            <Figure color={P.mustard} size={310} seed={9} arms="hold" />
          </div>
        </>
      )}
      {SIGNS.map((sg) => (
        <Sequence key={sg.at} from={t(sg.at)} durationInFrames={10}>
          <Audio src={staticFile('cults/stamp.wav')} volume={0.6} />
        </Sequence>
      ))}
      <Sequence from={t(29)} durationInFrames={8}>
        <Audio src={staticFile('cults/snap.wav')} volume={0.9} />
      </Sequence>
    </PaperBG>
  );
};

// ---------------------------------------------------------------------------
// 8. FIN (10 s)
// ---------------------------------------------------------------------------
const SceneEnd: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <PaperBG color={P.cream}>
      <div style={{position: 'absolute', top: 120, width: '100%'}}>
        {frame < t(3) && <Serif text="Cults don't recruit the weak." size={96} delay={4} />}
        {frame >= t(3) && frame < t(7) && <Serif text="They recruit the lonely." size={104} delay={t(3)} highlight="lonely." />}
        {frame >= t(7) && <Serif text="The best defense is connection." size={100} delay={t(7)} highlight="connection." />}
      </div>
      <div style={{position: 'absolute', left: 760, top: 470}}>
        <Figure color={P.coral} size={330} you seed={7} arms="reach" />
      </div>
      <div style={{position: 'absolute', left: 1000, top: 450}}>
        <Figure color={P.mustard} size={340} seed={9} arms="hold" />
      </div>
      {Array.from({length: 6}, (_, i) => {
        const p = interpolate(frame - i * 12, [0, 60], [0, 1], cl);
        return frame > i * 12 ? (
          <div key={i} style={{position: 'absolute', left: 950 + Math.sin(i * 2) * 120, top: 460 - p * 280, opacity: 1 - p}}>
            <Heart size={50} color={P.coral} />
          </div>
        ) : null;
      })}
    </PaperBG>
  );
};

// ---------------------------------------------------------------------------
// Assemblage : 255 s (4 min 15)
// ---------------------------------------------------------------------------
const SECTIONS: {from: number; dur: number; el: React.ReactNode; wipe: string}[] = [
  {from: 0, dur: 35, el: <SceneHook />, wipe: P.cream},
  {from: 35, dur: 35, el: <SceneWho />, wipe: P.sand},
  {from: 70, dur: 30, el: <SceneLove />, wipe: P.rose},
  {from: 100, dur: 30, el: <SceneSteps />, wipe: P.mustard},
  {from: 130, dur: 40, el: <SceneControl />, wipe: P.plum},
  {from: 170, dur: 40, el: <SceneExit />, wipe: P.night},
  {from: 210, dur: 35, el: <SceneProtect />, wipe: P.indigo},
  {from: 245, dur: 10, el: <SceneEnd />, wipe: P.coral},
];

export const CULTS_FRAMES = t(255);

export const CultsVideo: React.FC = () => (
  <AbsoluteFill style={{background: P.cream}}>
    {SECTIONS.map(({from, dur, el}) => (
      <Sequence key={from} from={t(from)} durationInFrames={t(dur)}>
        {el}
      </Sequence>
    ))}
    {SECTIONS.slice(1).map(({from, wipe}) => (
      <Sequence key={`w${from}`} from={t(from) - 11} durationInFrames={22}>
        <TearWipe color={wipe} />
        <Audio src={staticFile('cults/swish.wav')} volume={0.5} />
      </Sequence>
    ))}
    {/* nappes sonores : chaleureuse puis sombre, puis chaleureuse */}
    <Audio src={staticFile('cults/pad_warm.wav')} loop volume={(f) => (f < t(128) ? 0.5 : f < t(131) ? interpolate(f, [t(128), t(131)], [0.5, 0], cl) : f >= t(244) ? interpolate(f, [t(244), t(246)], [0, 0.5], cl) : 0)} />
    <Audio src={staticFile('cults/pad_dark.wav')} loop volume={(f) => (f < t(128) ? 0 : f < t(131) ? interpolate(f, [t(128), t(131)], [0, 0.55], cl) : f < t(244) ? 0.55 : interpolate(f, [t(244), t(246)], [0.55, 0], cl))} />
    <PaperCaptions caps={CAPS} darkFrom={130} darkTo={245} />
  </AbsoluteFill>
);
