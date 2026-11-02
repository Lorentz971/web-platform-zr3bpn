// Pack 6 : jeux et machines construits (style n° 7). Univers MBNC.
import React from 'react';
import {Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BLACK, CL, DIM, FAINT, Fig, House, MONO, Pack7, PackTitle7, Person, RED, RGLOW, rnd, Scene, Svg, T, total, Txt, useSp, W, WARM} from './k7';

const Eye: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = RED}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-50,0 Q0,-40 50,0 Q0,40 -50,0 Z" fill="none" stroke={c} strokeWidth={6} />
    <circle r={14} fill={c} />
  </g>
);
const LineTree: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => (
  <g stroke={W} strokeWidth={4} fill="none" strokeLinecap="round">
    <path d={`M${x},${y} L${x},${y - h}`} />
    {[0.35, 0.55, 0.75].map((k) => <path key={k} d={`M${x - h * (0.28 - k * 0.15)},${y - h * k + h * 0.12} L${x},${y - h * k} L${x + h * (0.28 - k * 0.15)},${y - h * k + h * 0.12}`} />)}
  </g>
);

// 1. Ticket à gratter
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const cells = [0, 1, 2, 3, 4, 5].map((i) => [640 + (i % 3) * 220, 430 + Math.floor(i / 3) * 220]);
  const sym = ['eye', 'tree', 'eye', 'house', 'person', 'eye'];
  const path = Array.from({length: 240}, (_, k) => {
    const cell = Math.floor(k / 40), t = (k % 40) / 40;
    const [cx, cy] = cells[cell];
    return [cx - 80 + t * 160, cy - 70 + ((Math.floor(t * 8) % 2 ? 1 - ((t * 8) % 1) : (t * 8) % 1)) * 140];
  });
  const n = Math.floor(interpolate(f, [12, T(4)], [0, 240], CL));
  const done = n >= 240;
  const [px, py] = path[Math.min(n, 239)];
  return (
    <>
      <Svg>
        <rect x={500} y={250} width={920} height={640} rx={18} fill={BLACK} stroke={W} strokeWidth={4} />
        <Txt x={960} y={310} a="middle" s={30} big>MBNC NIGHT LOTTERY</Txt>
        <Txt x={960} y={850} a="middle" s={18} c={DIM}>MATCH 3 TO BE SELECTED</Txt>
        <defs>
          <mask id="scr"><rect x={0} y={0} width={1920} height={1080} fill="#fff" />{path.slice(0, n).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={34} fill="#000" />)}</mask>
        </defs>
        {cells.map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 95} y={y - 95} width={190} height={190} fill={BLACK} stroke={DIM} strokeWidth={2} />
            {sym[i] === 'eye' && <g style={done ? {filter: RGLOW} : undefined}><Eye x={x} y={y} /></g>}
            {sym[i] === 'tree' && <LineTree x={x} y={y + 60} h={120} />}
            {sym[i] === 'house' && <House x={x} y={y + 60} s={0.35} />}
            {sym[i] === 'person' && <Person x={x} y={y + 80} s={0.85} />}
          </g>
        ))}
        <g mask="url(#scr)">{cells.map(([x, y], i) => <rect key={i} x={x - 95} y={y - 95} width={190} height={190} fill="#8c8c8c" />)}</g>
        {!done && <g transform={`translate(${px} ${py})`}><circle r={34} fill="#cfcfcf" stroke={W} strokeWidth={3} /><Txt x={0} y={8} a="middle" s={22}>¢</Txt></g>}
        {done && <Txt x={960} y={970} a="middle" s={40} big c={RED}>YOU HAVE BEEN SELECTED.</Txt>}
      </Svg>
      <Fig n="FIG. 1 · BUILT: SCRATCH TICKET" title="NIGHT LOTTERY" />
    </>
  );
};

// 2. Plateau de jeu
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const sq = Array.from({length: 24}, (_, i) => {
    const row = Math.floor(i / 8), c = i % 8;
    const col = row % 2 ? 7 - c : c;
    return [440 + col * 150, 820 - row * 210];
  });
  const rolls = [3, 5, 4, 6, 5];
  const stops = rolls.reduce<number[]>((a, r) => [...a, Math.min(23, a[a.length - 1] + r)], [0]);
  const per = 24;
  const k = Math.min(rolls.length, Math.floor(Math.max(0, f - 10) / per));
  const t = Math.max(0, f - 10 - k * per) / per;
  const from = stops[k], to = stops[Math.min(k + 1, stops.length - 1)];
  const pos = k >= rolls.length ? 23 : from + (to - from) * Math.min(1, t * 1.4);
  const i0 = Math.floor(pos), fr = pos - i0;
  const [x0, y0] = sq[i0], [x1, y1] = sq[Math.min(23, i0 + 1)];
  const hop = Math.sin(fr * Math.PI) * 50;
  const end = pos >= 23;
  return (
    <>
      <Svg>
        {sq.map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 66} y={y - 66} width={132} height={132} fill={i === 23 ? RED : BLACK} fillOpacity={i === 23 ? 0.35 : 1} stroke={i === 23 ? RED : i === 7 || i === 15 ? WARM : W} strokeWidth={3} />
            <Txt x={x - 56} y={y - 40} s={18} c={DIM}>{i + 1}</Txt>
          </g>
        ))}
        <LineTree x={sq[23][0]} y={sq[23][1] + 50} h={90} />
        <Txt x={sq[23][0]} y={sq[23][1] - 76} a="middle" s={18} c={RED}>THE WOODS</Txt>
        <Txt x={sq[7][0]} y={sq[7][1] + 50} a="middle" s={15} c={WARM}>GO HOME</Txt>
        <Txt x={sq[15][0]} y={sq[15][1] + 50} a="middle" s={15} c={WARM}>LOCK DOOR</Txt>
        <g style={end ? {filter: RGLOW} : undefined}><Person x={x0 + (x1 - x0) * fr} y={y0 + (y1 - y0) * fr + 50 - hop} s={0.5} color={end ? RED : W} /></g>
        <rect x={1700} y={300} width={120} height={120} rx={18} fill="none" stroke={W} strokeWidth={4} />
        <Txt x={1760} y={385} a="middle" s={70} big>{k < rolls.length ? rolls[k] : '—'}</Txt>
      </Svg>
      <Fig n="FIG. 2 · BUILT: BOARD GAME" title="THE WALK HOME" cap="EVERY PATH ENDS AT THE SAME SQUARE." />
    </>
  );
};

// 3. Flipper
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const WP: [number, number][] = [[1240, 900], [1240, 300], [1100, 220], [900, 330], [760, 480], [980, 560], [1120, 420], [880, 650], [800, 820], [920, 900], [1010, 760], [860, 440], [1060, 540], [960, 960]];
  const bump: [number, number][] = [[900, 400], [1060, 470], [820, 560]];
  const t = interpolate(f, [10, T(4.6)], [0, WP.length - 1.001], CL);
  const i = Math.floor(t), u = t - i;
  const P = (k: number) => WP[Math.max(0, Math.min(WP.length - 1, k))];
  const cr = (a: number, b: number, c: number, d: number, s: number) => 0.5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s * s + (-a + 3 * b - 3 * c + d) * s * s * s);
  const bx = cr(P(i - 1)[0], P(i)[0], P(i + 1)[0], P(i + 2)[0], u), by = cr(P(i - 1)[1], P(i)[1], P(i + 1)[1], P(i + 2)[1], u);
  const hits = bump.map(([x, y]) => Math.hypot(bx - x, by - y) < 80);
  const score = Math.floor(t * 1370);
  const flipL = [8, 10].includes(i) ? -25 : 20, flipR = [9].includes(i) ? 25 : -20;
  const lost = t > WP.length - 1.5;
  return (
    <>
      <Svg>
        <path d="M700,1000 L700,260 Q700,160 800,160 L1180,160 Q1280,160 1280,260 L1280,1000" fill="none" stroke={W} strokeWidth={5} />
        <line x1={1200} x2={1200} y1={420} y2={1000} stroke={DIM} strokeWidth={3} />
        {bump.map(([x, y], k) => <g key={k} style={hits[k] ? {filter: RGLOW} : undefined}><circle cx={x} cy={y} r={hits[k] ? 52 : 46} fill={hits[k] ? RED : BLACK} stroke={hits[k] ? RED : W} strokeWidth={4} /><Eye x={x} y={y} s={0.5} c={hits[k] ? W : DIM} /></g>)}
        <line x1={740} y1={760} x2={830} y2={850} stroke={W} strokeWidth={4} /><line x1={1160} y1={760} x2={1070} y2={850} stroke={W} strokeWidth={4} />
        <g transform={`rotate(${flipL} 830 860)`}><path d="M830,850 L930,880 L830,875 Z" fill={W} stroke={W} strokeWidth={10} strokeLinejoin="round" /></g>
        <g transform={`rotate(${flipR} 1070 860)`}><path d="M1070,850 L970,880 L1070,875 Z" fill={W} stroke={W} strokeWidth={10} strokeLinejoin="round" /></g>
        <circle cx={bx} cy={by} r={18} fill={W} />
        <rect x={1360} y={260} width={360} height={150} fill="none" stroke={W} strokeWidth={3} />
        <Txt x={1380} y={300} s={20} c={DIM}>SCORE</Txt>
        <Txt x={1700} y={380} a="end" s={64} big>{String(score).padStart(6, '0')}</Txt>
        {lost && <Txt x={1540} y={480} a="middle" s={30} c={RED}>BALL LOST · IT KEEPS IT</Txt>}
      </Svg>
      <Fig n="FIG. 3 · BUILT: PINBALL" title="AN ARCADE MACHINE" />
    </>
  );
};

// 4. Grue à peluches
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const cx = interpolate(f, [10, 50, 105, 130], [760, 1080, 1080, 820], CL);
  const drop = interpolate(f, [55, 80, 95, 115], [0, 360, 360, 0], CL);
  const close = interpolate(f, [80, 90], [0, 1], CL);
  const carry = f >= 90;
  const release = f > 132;
  const prizes: [number, number, boolean][] = [[880, 760, false], [980, 790, false], [1080, 770, true], [1180, 790, false], [790, 800, false]];
  return (
    <>
      <Svg>
        <rect x={680} y={220} width={600} height={640} fill="none" stroke={W} strokeWidth={5} />
        <rect x={680} y={860} width={600} height={160} fill={BLACK} stroke={W} strokeWidth={5} />
        <rect x={720} y={880} width={180} height={120} fill="none" stroke={DIM} strokeWidth={3} />
        <Txt x={810} y={950} a="middle" s={18} c={DIM}>PRIZE</Txt>
        <line x1={680} x2={1280} y1={260} y2={260} stroke={DIM} strokeWidth={4} />
        {prizes.map(([x, y, you], i) => {
          if (you && carry) return null;
          return <Person key={i} x={x} y={y + 60} s={0.55} color={you ? WARM : DIM} />;
        })}
        <line x1={cx} x2={cx} y1={260} y2={360 + drop} stroke={W} strokeWidth={3} />
        <rect x={cx - 30} y={340 + drop} width={60} height={30} fill={W} />
        <path d={`M${cx - 20},${370 + drop} L${cx - 50 + close * 20},${430 + drop} L${cx - 30 + close * 15},${470 + drop}`} fill="none" stroke={W} strokeWidth={6} />
        <path d={`M${cx + 20},${370 + drop} L${cx + 50 - close * 20},${430 + drop} L${cx + 30 - close * 15},${470 + drop}`} fill="none" stroke={W} strokeWidth={6} />
        {carry && !release && <Person x={cx} y={560 + drop} s={0.55} color={WARM} />}
        {release && <Person x={810} y={interpolate(f, [132, 145], [560, 990], CL)} s={0.55} color={WARM} />}
        {release && <Txt x={1420} y={600} s={34} c={RED} big>IT CHOSE YOU.</Txt>}
        <Txt x={1300} y={300} s={18} c={WARM}>◀ YOU</Txt>
      </Svg>
      <Fig n="FIG. 4 · BUILT: CLAW MACHINE" title="SELECTION PROCESS" />
    </>
  );
};

// 5. Balance
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const L = Math.floor(interpolate(f, [10, T(2.4)], [0, 3], CL));
  const R = Math.floor(interpolate(f, [T(1.2), T(3.6)], [0, 6], CL));
  const target = (R - L) * 4;
  const ang = useSp(0, 6) * 0 + target - Math.sin(f * 0.3) * Math.max(0, 6 - (f % 40) / 7) * 0.5;
  const rad = (ang * Math.PI) / 180;
  const cx = 960, cy = 420, arm = 420;
  const lx = cx - Math.cos(rad) * arm, ly = cy - Math.sin(rad) * arm, rx = cx + Math.cos(rad) * arm, ry = cy + Math.sin(rad) * arm;
  const Pan: React.FC<{x: number; y: number; n: number; red: boolean; label: string}> = ({x, y, n, red, label}) => (
    <g>
      <line x1={x} y1={y} x2={x - 110} y2={y + 220} stroke={DIM} strokeWidth={3} /><line x1={x} y1={y} x2={x + 110} y2={y + 220} stroke={DIM} strokeWidth={3} />
      <path d={`M${x - 140},${y + 220} Q${x},${y + 290} ${x + 140},${y + 220} Z`} fill={BLACK} stroke={W} strokeWidth={4} />
      {Array.from({length: n}).map((_, i) => <Person key={i} x={x - 75 + (i % 3) * 75} y={y + 222 - Math.floor(i / 3) * 70} s={0.35} color={red ? RED : W} />)}
      <Txt x={x} y={y + 340} a="middle" s={20} c={red ? RED : DIM}>{label}</Txt>
    </g>
  );
  return (
    <>
      <Svg>
        <path d={`M${cx - 100},960 L${cx},${cy} L${cx + 100},960 Z`} fill="none" stroke={W} strokeWidth={5} />
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={W} strokeWidth={10} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={18} fill={W} />
        <Pan x={lx} y={ly} n={L} red={false} label="WHAT THEY GAINED" />
        <Pan x={rx} y={ry} n={R} red label="WHAT THEY LOST" />
      </Svg>
      <Fig n="FIG. 5 · BUILT: BALANCE SCALE" title="WAS IT WORTH ANSWERING?" />
    </>
  );
};

// 6. Sablier
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [10, T(4.2)], [0, 1], CL);
  const cx = 960, top = 260, mid = 600, bot = 940, w = 240;
  const topLvl = mid - 40 - (1 - p) * 250;
  const pile = p * 230;
  const days = Math.round(interpolate(p, [0, 1], [30, 0]));
  return (
    <>
      <Svg>
        <defs>
          <clipPath id="glass"><path d={`M${cx - w},${top} L${cx + w},${top} L${cx + 14},${mid} L${cx + w},${bot} L${cx - w},${bot} L${cx - 14},${mid} Z`} /></clipPath>
        </defs>
        <g clipPath="url(#glass)">
          <rect x={cx - w} y={topLvl} width={w * 2} height={mid - topLvl} fill={W} opacity={0.85} />
          <path d={`M${cx - w},${bot} L${cx},${bot - pile} L${cx + w},${bot} Z`} fill={RED} opacity={0.85} />
          {p < 1 && <rect x={cx - 3} y={mid} width={6} height={bot - pile - mid} fill={W} opacity={0.8} />}
        </g>
        <path d={`M${cx - w},${top} L${cx + w},${top} L${cx + 14},${mid} L${cx + w},${bot} L${cx - w},${bot} L${cx - 14},${mid} Z`} fill="none" stroke={W} strokeWidth={5} />
        <rect x={cx - w - 40} y={top - 30} width={(w + 40) * 2} height={30} fill={W} /><rect x={cx - w - 40} y={bot} width={(w + 40) * 2} height={30} fill={W} />
        <Txt x={1420} y={520} s={22} c={DIM}>TIME UNTIL IT REACHES</Txt>
        <Txt x={1420} y={556} s={22} c={DIM}>YOUR STREET</Txt>
        <Txt x={1420} y={660} s={96} big c={days < 8 ? RED : W}>{days} DAYS</Txt>
      </Svg>
      <Fig n="FIG. 6 · BUILT: HOURGLASS" title="ESTIMATED ARRIVAL" />
    </>
  );
};

// 7. Thermomètre
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const temp = interpolate(f, [10, T(1.6), T(3.8)], [18, 16, -21], {...CL, easing: Easing.in(Easing.cubic)});
  const Y = (t: number) => 780 - (t + 30) * 9;
  const cold = temp < 0;
  return (
    <>
      <Svg>
        <rect x={900} y={200} width={120} height={620} rx={60} fill={BLACK} stroke={W} strokeWidth={5} />
        <circle cx={960} cy={860} r={90} fill={BLACK} stroke={W} strokeWidth={5} />
        <circle cx={960} cy={860} r={70} fill={cold ? RED : W} style={cold ? {filter: RGLOW} : undefined} />
        <rect x={935} y={Y(temp)} width={50} height={860 - Y(temp)} fill={cold ? RED : W} />
        {[-30, -20, -10, 0, 10, 20, 30].map((t) => <g key={t}><line x1={1040} x2={1080} y1={Y(t)} y2={Y(t)} stroke={DIM} strokeWidth={3} /><Txt x={1095} y={Y(t) + 8} s={22} c={t === 0 ? W : DIM}>{t}°</Txt></g>)}
        <Txt x={620} y={520} a="middle" s={110} big c={cold ? RED : W}>{Math.round(temp)}°C</Txt>
        <Txt x={620} y={580} a="middle" s={22} c={DIM}>LIVING ROOM · 03:07</Txt>
        {temp < -10 && <Txt x={1400} y={520} s={30} c={RED}>IT IS IN THE ROOM.</Txt>}
      </Svg>
      <Fig n="FIG. 7 · BUILT: THERMOMETER" title="INDOOR TEMPERATURE" cap="THE TEMPERATURE ALWAYS DROPS FIRST." />
    </>
  );
};

// 8. Compte à rebours (afficheur 7 segments)
const SEG: Record<string, number[]> = {
  '0': [1, 1, 1, 1, 1, 1, 0], '1': [0, 1, 1, 0, 0, 0, 0], '2': [1, 1, 0, 1, 1, 0, 1], '3': [1, 1, 1, 1, 0, 0, 1], '4': [0, 1, 1, 0, 0, 1, 1],
  '5': [1, 0, 1, 1, 0, 1, 1], '6': [1, 0, 1, 1, 1, 1, 1], '7': [1, 1, 1, 0, 0, 0, 0], '8': [1, 1, 1, 1, 1, 1, 1], '9': [1, 1, 1, 1, 0, 1, 1],
};
const Digit: React.FC<{x: number; y: number; d: string; c: string}> = ({x, y, d, c}) => {
  const s = SEG[d];
  const H = (k: number, xx: number, yy: number) => <rect x={x + xx} y={y + yy} width={90} height={18} rx={9} fill={c} opacity={s[k] ? 1 : 0.07} />;
  const V = (k: number, xx: number, yy: number) => <rect x={x + xx} y={y + yy} width={18} height={95} rx={9} fill={c} opacity={s[k] ? 1 : 0.07} />;
  return <g>{H(0, 14, 0)}{V(1, 104, 14)}{V(2, 104, 124)}{H(3, 14, 220)}{V(4, 0, 124)}{V(5, 0, 14)}{H(6, 14, 110)}</g>;
};
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const secs = Math.max(0, Math.ceil(interpolate(f, [10, T(3.6)], [10, 0], CL)));
  const zero = secs === 0;
  const blink = zero ? Math.floor(f / 6) % 2 : 1;
  const s = `0000${String(secs).padStart(2, '0')}`;
  const c = zero ? RED : W;
  return (
    <>
      <Svg>
        <rect x={340} y={360} width={1240} height={340} rx={20} fill={BLACK} stroke={W} strokeWidth={4} />
        <g opacity={blink} style={zero ? {filter: RGLOW} : undefined}>
          {s.split('').map((d, i) => <Digit key={i} x={400 + i * 170 + Math.floor(i / 2) * 60} y={410} d={d} c={c} />)}
          {[746, 1146].map((x) => <g key={x}><circle cx={x} cy={490} r={10} fill={c} /><circle cx={x} cy={580} r={10} fill={c} /></g>)}
        </g>
        <Txt x={960} y={780} a="middle" s={26} c={zero ? RED : DIM}>{zero ? 'IT IS 3:07. DO NOT ANSWER.' : 'UNTIL 03:07'}</Txt>
      </Svg>
      <Fig n="FIG. 8 · BUILT: COUNTDOWN CLOCK" title="TIME REMAINING" />
    </>
  );
};

const SCENES: Scene[] = [
  [PackTitle7('PACK 6 · STYLE 7 · MBNC ARCHIVE', 'GAMES & MACHINES', '8 BUILT OBJECTS'), T(2.6)],
  [S1, T(5)], [S2, T(5.6)], [S3, T(5)], [S4, T(5.4)], [S5, T(4.4)], [S6, T(4.8)], [S7, T(4.6)], [S8, T(4.6)],
];
const STARTS = SCENES.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + SCENES[i - 1][1] : 0], []);
export const PACK6_FRAMES = total(SCENES);
export const PackSix: React.FC = () => (
  <Pack7 scenes={SCENES} label="MBNC · EQUIPMENT CATALOGUE" extra={
    <>
      {Array.from({length: 10}).map((_, k) => <Sequence key={k} from={STARTS[8] + 10 + k * 9} durationInFrames={8}><Audio src={staticFile('rules/beep.wav')} volume={0.35} /></Sequence>)}
      <Sequence from={STARTS[8] + T(3.6)} durationInFrames={20}><Audio src={staticFile('rules/ping.wav')} volume={0.6} /></Sequence>
      <Sequence from={STARTS[1] + 12} durationInFrames={T(3.5)}><Audio src={staticFile('rules/scratch.wav')} volume={0.3} /></Sequence>
    </>
  } />
);
void FAINT; void rnd; void MONO;
