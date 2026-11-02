// Pack 7 : machines et écrans construits (style n° 1).
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Badge, CL, col, fmt, FONT, Head, K, Logo, NAME, Pack1, PackTitle, rnd, Scene, Svg, T, total, Txt, useSp} from './k1';

// 1. Tapis roulant d'usine
const Bottle: React.FC<{x: number; y: number; label: boolean}> = ({x, y, label}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-12,-170 L12,-170 L12,-140 Q34,-120 34,-90 L34,0 L-34,0 L-34,-90 Q-34,-120 -12,-140 Z" fill="#7a3b2e" />
    <rect x={-13} y={-180} width={26} height={14} rx={3} fill="#c8102e" />
    {label && <><rect x={-34} y={-80} width={68} height={40} fill="#e41e2b" /><path d="M-30,-60 Q0,-75 30,-60" stroke="#fff" strokeWidth={4} fill="none" /></>}
  </g>
);
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const speed = 6, gap = 200, PX = 960;
  const press = (() => {
    const ph = (f * speed) % gap;
    return ph < 40 ? Math.sin((ph / 40) * Math.PI) : 0;
  })();
  const made = Math.floor((f * speed) / gap);
  return (
    <>
      <Head n="01 · BUILT: CONVEYOR BELT" title="BOTTLES PER" accent="SECOND" note="" />
      <Svg>
        <rect x={100} y={760} width={1720} height={40} rx={20} fill="#3b4a66" />
        {Array.from({length: 18}).map((_, i) => (
          <g key={i} transform={`translate(${140 + i * 100} 820) rotate(${f * 12})`}>
            <circle r={26} fill="#26334d" stroke="#5a6a88" strokeWidth={4} /><line x1={-20} x2={20} y1={0} y2={0} stroke="#5a6a88" strokeWidth={4} />
          </g>
        ))}
        {Array.from({length: 11}).map((_, i) => {
          const x = ((i * gap + f * speed) % (gap * 11)) - 100;
          return <Bottle key={i} x={x} y={760} label={x > PX} />;
        })}
        <rect x={PX - 90} y={200} width={180} height={150} rx={10} fill="#5a6a88" />
        <rect x={PX - 14} y={350} width={28} height={140 + press * 90} fill="#9aa5b5" />
        <rect x={PX - 70} y={480 + press * 90} width={140} height={40} rx={6} fill="#c8102e" />
        {press > 0.8 && <g>{[0, 1, 2, 3].map((k) => <line key={k} x1={PX + (k - 1.5) * 60} x2={PX + (k - 1.5) * 90} y1={600} y2={560} stroke={K.accent2} strokeWidth={5} />)}</g>}
        <Badge b="cocacola" x={1700} y={300} r={80} />
        <Txt x={1700} y={460} a="middle" s={72} w={900}>{fmt(made * 2000)}</Txt>
        <Txt x={1700} y={500} a="middle" s={22} c={K.dim}>BOTTLES TODAY</Txt>
      </Svg>
    </>
  );
};

// 2. Distributeur
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const items = ['redbull', 'cocacola', 'starbucks', 'redbull', 'mcdonalds', 'cocacola', 'starbucks', 'redbull', 'cocacola'];
  const sel = 4; // B2 → index 4
  const keys = ['B', '2'];
  const typed = f > 30 ? (f > 45 ? 'B2' : 'B') : '';
  const spin = interpolate(f, [55, 80], [0, 1], CL);
  const fall = interpolate(f, [80, 100], [0, 1], {...CL, easing: Easing.in(Easing.quad)});
  const coin = interpolate(f, [8, 24], [0, 1], CL);
  return (
    <>
      <Head n="02 · BUILT: VENDING MACHINE" title="PICK" accent="B2" note="" />
      <Svg>
        <rect x={560} y={180} width={720} height={860} rx={24} fill="#c8102e" />
        <rect x={600} y={220} width={480} height={620} rx={10} fill="#0d1626" />
        {items.map((b, i) => {
          const x = 680 + (i % 3) * 160, y = 300 + Math.floor(i / 3) * 190;
          const me = i === sel;
          const dx = me ? spin * 0 : 0;
          const dy = me ? fall * (900 - y) + spin * 10 : 0;
          return (
            <g key={i}>
              <path d={`M${x - 60},${y + 70} q15,-14 30,0 q15,14 30,0 q15,-14 30,0 q15,14 30,0`} stroke="#9aa5b5" strokeWidth={4} fill="none" transform={me ? `translate(${(spin * 30) % 30} 0)` : undefined} />
              {!(me && fall >= 1) && <Badge b={b} x={x + dx} y={y + dy} r={50} />}
            </g>
          );
        })}
        <rect x={600} y={880} width={480} height={110} rx={10} fill="#0d1626" />
        {fall >= 1 && <Badge b={items[sel]} x={840} y={935} r={44} />}
        <rect x={1110} y={240} width={140} height={70} rx={8} fill="#0d1626" />
        <Txt x={1180} y={290} a="middle" s={40} w={900} c="#7cf0b1">{typed || '--'}</Txt>
        {['A', 'B', 'C', '1', '2', '3'].map((k, i) => {
          const pressed = (k === 'B' && f > 30 && f < 38) || (k === '2' && f > 45 && f < 53);
          return <g key={k}><rect x={1115 + (i % 3) * 45} y={340 + Math.floor(i / 3) * 50} width={38} height={40} rx={6} fill={pressed ? K.accent2 : '#e8e4dc'} /><Txt x={1134 + (i % 3) * 45} y={368 + Math.floor(i / 3) * 50} a="middle" s={20} c="#101b30">{k}</Txt></g>;
        })}
        <rect x={1150} y={480} width={60} height={12} rx={6} fill="#0d1626" />
        <circle cx={1180} cy={interpolate(coin, [0, 1], [420, 486])} r={22} fill="#ffd166" opacity={coin < 1 ? 1 : 0} />
        <Txt x={1180} y={540} a="middle" s={18} c="#fff">$2.50</Txt>
        {void keys}
      </Svg>
    </>
  );
};

// 3. Ascenseur-classement
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const floor = interpolate(f, [12, T(4)], [10, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  const H = 68, base = 1000;
  const apps = ['', 'TIKTOK', 'INSTAGRAM', 'FACEBOOK', 'WHATSAPP', 'CAPCUT', 'TEMU', 'THREADS', 'SNAPCHAT', 'TELEGRAM', 'SPOTIFY'];
  const cur = Math.round(floor);
  const arrived = f > T(4);
  const ding = useSp(T(4), 8);
  return (
    <>
      <Head n="03 · BUILT: ELEVATOR RANKING" title="MOST DOWNLOADED" accent="APP" />
      <Svg>
        <rect x={760} y={base - 10 * H - 20} width={400} height={10 * H + 20} fill="#1f3152" />
        {Array.from({length: 10}).map((_, i) => {
          const fl = i + 1, y = base - (11 - fl) * H;
          return (
            <g key={fl}>
              <line x1={760} x2={1160} y1={y + H} y2={y + H} stroke="#3b4a66" strokeWidth={3} />
              <Txt x={730} y={y + 52} a="end" s={30} w={900} c={fl === cur ? K.accent2 : K.dim}>#{fl}</Txt>
              <Txt x={1190} y={y + 50} s={24} c={fl === cur ? K.white : '#4b5b78'}>{apps[fl]}</Txt>
            </g>
          );
        })}
        <g transform={`translate(960 ${base - (11 - floor) * H + H / 2})`}>
          <rect x={-90} y={-36} width={180} height={72} rx={8} fill={arrived ? K.accent2 : '#e8e4dc'} />
          <line x1={0} x2={0} y1={-36} y2={-900} stroke="#9aa5b5" strokeWidth={3} />
          <Badge b="tiktok" x={0} y={0} r={30} />
        </g>
        <rect x={360} y={260} width={220} height={120} rx={14} fill="#0d1626" />
        <Txt x={470} y={345} a="middle" s={70} w={900} c="#ff6b5a">{cur}</Txt>
        <Txt x={470} y={240} a="middle" s={20} c={K.dim}>FLOOR</Txt>
        {arrived && <Txt x={470} y={480} a="middle" s={60} w={900} c={K.accent2} o={ding}>DING! #1</Txt>}
      </Svg>
    </>
  );
};

// 4. Fusée à étages
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const alt = interpolate(f, [10, T(5)], [0, 1], {...CL, easing: Easing.in(Easing.quad)});
  const camY = alt * 2200;
  const sep = [T(1.8), T(3.2)];
  const stages: [string, string, string][] = [['YOUTUBE', '1B USERS · 2013', '#ff0000'], ['YOUTUBE', '2B USERS · 2019', '#e8e4dc'], ['YOUTUBE', '2.5B USERS · 2025', '#ff0000']];
  const rocketY = 820 - camY;
  return (
    <>
      <Head n="04 · BUILT: MULTI-STAGE ROCKET" title="YOUTUBE'S" accent="LIFT-OFF" />
      <Svg>
        <g transform={`translate(0 ${Math.min(camY, 2200) * 0.85})`}>
          <rect x={0} y={900} width={1920} height={300} fill="#26334d" />
          <rect x={900} y={700} width={20} height={200} fill="#5a6a88" />
        </g>
        {Array.from({length: 40}).map((_, i) => <circle key={i} cx={rnd(i) * 1920} cy={(rnd(i + 5) * 1400 + camY * 0.3) % 1100} r={2} fill="#fff" opacity={alt} />)}
        {stages.map(([n, lab, c], k) => {
          const gone = k < 2 && f > sep[k];
          const st = gone ? f - sep[k] : 0;
          const y = gone ? rocketY - (2 - k) * 0 + st * st * 0.4 + st * 4 : rocketY;
          const sy = 820 + (rocketY - 820) * 0.15;
          const yy = gone ? sy + 150 - k * 130 + st * st * 0.5 : sy + 150 - k * 130;
          const rot = gone ? st * (k ? -2 : 2) : 0;
          void y;
          return (
            <g key={k} transform={`rotate(${rot} 960 ${yy})`}>
              <rect x={900} y={yy - 60} width={120} height={130} fill={c} stroke="#101b30" strokeWidth={4} />
              {k === 2 && <path d={`M900,${yy - 60} L960,${yy - 180} L1020,${yy - 60} Z`} fill="#e8e4dc" stroke="#101b30" strokeWidth={4} />}
              {k === 2 && <circle cx={960} cy={yy - 90} r={18} fill="#5aa9ff" />}
              {k === 0 && <><path d={`M900,${yy + 70} L860,${yy + 110} L900,${yy + 20} Z`} fill="#c8102e" /><path d={`M1020,${yy + 70} L1060,${yy + 110} L1020,${yy + 20} Z`} fill="#c8102e" /></>}
              {!gone && (k === 0 || (k === 1 && f > sep[0]) || (k === 2 && f > sep[1])) && (
                <path d={`M920,${yy + 70} Q960,${yy + 170 + Math.sin(f) * 30} 1000,${yy + 70} Z`} fill={K.accent} />
              )}
              <Txt x={1070} y={yy} s={26} w={900} o={gone ? Math.max(0, 1 - st / 20) : 1}>{n}</Txt>
              <Txt x={1070} y={yy + 34} s={22} c={K.accent2} o={gone ? Math.max(0, 1 - st / 20) : 1}>{lab}</Txt>
            </g>
          );
        })}
        {Array.from({length: 14}).map((_, i) => {
          const t = (f - i * 3) / 30;
          if (t < 0 || alt < 0.02) return null;
          return <circle key={i} cx={960 + (rnd(i) - 0.5) * 200 * t} cy={1000 - (820 + (rocketY - 820) * 0.15) * 0 + 40 * t} r={40 + t * 60} fill="#9aa5b5" opacity={Math.max(0, 0.35 - t * 0.2)} />;
        })}
      </Svg>
    </>
  );
};

// 5. Vieux téléviseur
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const ch = [['netflix', 3], ['youtube', 7], ['twitch', 12], ['playstation', 21]] as const;
  const per = 34;
  const idx = Math.min(ch.length - 1, Math.floor(f / per));
  const inCh = f % per;
  const noise = inCh < 8 && f > 4;
  return (
    <>
      <Head n="05 · BUILT: OLD TV" title="CHANNEL" accent="SURFING" note="" />
      <Svg>
        <line x1={860} y1={260} x2={720} y2={110} stroke="#9aa5b5" strokeWidth={6} /><line x1={1000} y1={260} x2={1140} y2={120} stroke="#9aa5b5" strokeWidth={6} />
        <rect x={480} y={260} width={960} height={680} rx={50} fill="#8a5a3c" />
        <rect x={520} y={300} width={680} height={600} rx={60} fill="#1b1b1b" />
        <defs><clipPath id="crt"><rect x={545} y={325} width={630} height={550} rx={50} /></clipPath></defs>
        <g clipPath="url(#crt)">
          <rect x={545} y={325} width={630} height={550} fill={noise ? '#888' : col(ch[idx][0]) === '#e8e4dc' ? '#333' : '#fbf7ee'} />
          {noise ? Array.from({length: 260}).map((_, i) => <rect key={i} x={545 + rnd(i + f * 7) * 630} y={325 + rnd(i * 3 + f) * 550} width={14} height={4} fill={rnd(i + f) > 0.5 ? '#fff' : '#000'} />) : (
            <>
              <Logo b={ch[idx][0]} x={860} y={600} s={300} />
              <Txt x={1150} y={380} a="end" s={50} w={900} c="#2ec27e">CH {ch[idx][1]}</Txt>
            </>
          )}
          {Array.from({length: 55}).map((_, i) => <rect key={i} x={545} y={325 + i * 10} width={630} height={3} fill="#000" opacity={0.12} />)}
          <rect x={545} y={325} width={630} height={550} fill="url(#vig)" />
        </g>
        <defs><radialGradient id="vig"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.6} /></radialGradient></defs>
        <circle cx={1320} cy={420} r={50} fill="#3b2a20" /><line x1={1320} y1={420} x2={1320 + Math.cos(idx * 1.2) * 40} y2={420 + Math.sin(idx * 1.2) * 40} stroke="#e8e4dc" strokeWidth={8} />
        <circle cx={1320} cy={570} r={36} fill="#3b2a20" />
        {Array.from({length: 6}).map((_, i) => <rect key={i} x={1260} y={680 + i * 30} width={120} height={10} rx={5} fill="#3b2a20" />)}
      </Svg>
    </>
  );
};

// 6. Terminal
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const lines = [
    '> brands --rank --metric=value', 'LOADING DATASET ......... OK', '',
    '01  APPLE     ████████████████  520', '02  GOOGLE    ████████████░░░░  410', '03  AMAZON    ██████████░░░░░░  340', '04  TESLA     ████░░░░░░░░░░░░  130', '05  YOUTUBE   ██░░░░░░░░░░░░░░   80', '',
    '> _',
  ];
  let budget = Math.floor(Math.max(0, f - 8) * 2.2);
  return (
    <>
      <Head n="06 · BUILT: RETRO TERMINAL" title="COMMAND" accent="LINE" note="" />
      <Svg>
        <rect x={420} y={220} width={1080} height={740} rx={30} fill="#d8d0bf" />
        <rect x={470} y={260} width={980} height={600} rx={30} fill="#0b140c" />
        <rect x={860} y={960} width={200} height={50} fill="#c7bfac" /><rect x={760} y={1000} width={400} height={30} rx={8} fill="#b8af9a" />
        {lines.map((l, i) => {
          const show = l.slice(0, Math.max(0, Math.min(l.length, budget)));
          budget -= l.length + 4;
          const cur = budget < 0 && budget > -l.length - 4 && Math.floor(f / 8) % 2 === 0;
          return <text key={i} x={510} y={320 + i * 52} fontFamily="DejaVu Sans Mono, monospace" fontSize={30} fill="#3cff6e" style={{filter: 'drop-shadow(0 0 6px #3cff6e)'}}>{show}{cur ? '█' : ''}</text>;
        })}
        {Array.from({length: 60}).map((_, i) => <rect key={i} x={470} y={260 + i * 10} width={980} height={3} fill="#000" opacity={0.25} />)}
      </Svg>
    </>
  );
};

// 7. Téléphone avec des notifications
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const N: [string, string, string][] = [
    ['uber', 'YOUR DRIVER IS ARRIVING', 'Toyota Prius · 2 min'], ['spotify', 'NEW RELEASE', 'Your Daily Mix is ready'], ['amazon', 'DELIVERED', 'Your package is at the door'],
    ['netflix', 'NEW EPISODE', 'Season 3 is now streaming'], ['instagram', '12 NEW LIKES', 'on your latest post'],
  ];
  const clock = `21:${String(4 + Math.floor(f / 40)).padStart(2, '0')}`;
  return (
    <>
      <Head n="07 · BUILT: PHONE" title="NOTIFICATION" accent="OVERLOAD" note="" />
      <Svg>
        <g transform="translate(420 0)">
        <rect x={700} y={140} width={520} height={920} rx={70} fill="#0d1626" stroke="#3b4a66" strokeWidth={10} />
        <rect x={880} y={170} width={160} height={34} rx={17} fill="#000" />
        <Txt x={960} y={320} a="middle" s={96} w={900}>{clock}</Txt>
        <Txt x={960} y={360} a="middle" s={22} c={K.dim}>MONDAY, NOVEMBER 2</Txt>
        {N.map(([b, t, sub], i) => {
          const k = N.length - 1 - i;
          const s = useSp(12 + k * 18, 13);
          const order = N.slice(0, i).length;
          const yy = 420 + order * 120;
          return (
            <g key={b} opacity={s} transform={`translate(0 ${(1 - s) * -60})`}>
              <rect x={730} y={yy} width={460} height={104} rx={22} fill="#26334d" />
              <Badge b={b} x={784} y={yy + 52} r={30} />
              <Txt x={830} y={yy + 44} s={20} w={900}>{t}</Txt>
              <Txt x={830} y={yy + 76} s={18} c={K.dim} w={600}>{sub}</Txt>
            </g>
          );
        })}
        </g>
      </Svg>
    </>
  );
};

// 8. Moniteur cardiaque
const ecg = (t: number) => {
  const p = t % 1;
  if (p < 0.1) return Math.sin((p / 0.1) * Math.PI) * 10;
  if (p > 0.18 && p < 0.21) return -20;
  if (p >= 0.21 && p < 0.25) return 140 * (1 - Math.abs(p - 0.23) / 0.02);
  if (p >= 0.25 && p < 0.28) return -40;
  if (p > 0.4 && p < 0.55) return Math.sin(((p - 0.4) / 0.15) * Math.PI) * 25;
  return 0;
};
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const bpm = interpolate(f, [0, T(4)], [72, 148], CL);
  const W0 = 520, W1 = 1500, sweepPx = 12;
  const head = W0 + ((f * sweepPx) % (W1 - W0));
  let phase = 0;
  const pts: string[] = [];
  const beatAt = (fr: number) => {
    let ph = 0;
    for (let k = 0; k < fr; k++) ph += interpolate(k, [0, T(4)], [72, 148], CL) / 60 / 30;
    return ph;
  };
  const ph0 = beatAt(f);
  for (let x = W0; x <= W1; x += 4) {
    const dx = (head - x + (W1 - W0)) % (W1 - W0);
    if (dx < 30) continue;
    const ago = dx / sweepPx;
    phase = ph0 - ago * (bpm / 60 / 30);
    pts.push(`${x},${600 - ecg(phase)}`);
  }
  return (
    <>
      <Head n="08 · BUILT: HEART MONITOR" title="WAITING FOR" accent="THE REVEAL" note="" />
      <Svg>
        <rect x={460} y={260} width={1100} height={640} rx={30} fill="#0d1626" stroke="#3b4a66" strokeWidth={8} />
        {Array.from({length: 23}).map((_, i) => <line key={i} x1={W0 + i * 45} x2={W0 + i * 45} y1={300} y2={860} stroke="#15304a" strokeWidth={2} />)}
        {Array.from({length: 13}).map((_, i) => <line key={i} x1={W0} x2={W1} y1={300 + i * 45} y2={300 + i * 45} stroke="#15304a" strokeWidth={2} />)}
        <polyline points={pts.join(' ')} fill="none" stroke="#2ef08a" strokeWidth={5} style={{filter: 'drop-shadow(0 0 8px #2ef08a)'}} />
        <Txt x={1520} y={360} a="end" s={30} c="#2ef08a">BPM</Txt>
        <Txt x={1520} y={450} a="end" s={90} w={900} c={bpm > 120 ? '#ff6b5a' : '#2ef08a'}>{Math.round(bpm)}</Txt>
        <Badge b="playstation" x={1680} y={560} r={70} />
        <Txt x={1680} y={680} a="middle" s={22} c={K.dim}>NEW CONSOLE</Txt>
      </Svg>
    </>
  );
};

const SCENES: Scene[] = [
  [PackTitle('PACK 7 · STYLE 1', 'MACHINES & SCREENS', '8 BUILT OBJECTS'), T(2.5)],
  [S1, T(4.6)], [S2, T(4.4)], [S3, T(5)], [S4, T(5.4)], [S5, T(4.6)], [S6, T(5)], [S7, T(4.6)], [S8, T(4.6)],
];
export const PACK7_FRAMES = total(SCENES);
export const PackSeven: React.FC = () => <Pack1 scenes={SCENES} />;
void NAME; void FONT;
