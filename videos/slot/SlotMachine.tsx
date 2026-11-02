// Test : machine à sous avec des logos de marques (style n° 1 « plat », 100 % Remotion).
// Logos : paquet simple-icons (SVG vectoriels, fond transparent).
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as SI from 'simple-icons';
import {CL, FONT, T} from '../flat/flat';

type Icon = {title: string; hex: string; path: string};
const B: Record<string, Icon> = {
  apple: SI.siApple, netflix: SI.siNetflix, spotify: SI.siSpotify, youtube: SI.siYoutube,
  nike: SI.siNike, cocacola: SI.siCocacola, mcdonalds: SI.siMcdonalds, tesla: SI.siTesla,
  playstation: SI.siPlaystation, nintendo: SI.siNintendo, starbucks: SI.siStarbucks, ferrari: SI.siFerrari,
};

// Trois rouleaux, chacun dans un ordre différent.
const STRIPS = [
  ['apple', 'mcdonalds', 'netflix', 'spotify', 'tesla', 'nike', 'cocacola', 'playstation', 'youtube', 'nintendo', 'starbucks', 'ferrari'],
  ['nike', 'spotify', 'ferrari', 'apple', 'mcdonalds', 'youtube', 'tesla', 'starbucks', 'netflix', 'cocacola', 'nintendo', 'playstation'],
  // YouTube est juste avant Spotify : le rouleau 3 frôle Spotify puis s'arrête sur YouTube.
  ['tesla', 'netflix', 'starbucks', 'mcdonalds', 'cocacola', 'nintendo', 'youtube', 'spotify', 'apple', 'ferrari', 'playstation', 'nike'],
];
const L = 12;
const H = 170; // hauteur d'une case

type Spin = {lever: number; start: number; stops: number[]; targets: string[]; slow?: number};
const SPINS: Spin[] = [
  {lever: T(1.6), start: T(2.0), stops: [T(3.5), T(4.0), T(4.5)], targets: ['apple', 'nike', 'netflix']},
  {lever: T(6.6), start: T(7.0), stops: [T(8.5), T(9.0), T(11.2)], targets: ['spotify', 'spotify', 'youtube'], slow: 2},
  {lever: T(13.4), start: T(13.8), stops: [T(15.3), T(15.8), T(16.9)], targets: ['mcdonalds', 'mcdonalds', 'mcdonalds']},
];
const WIN = SPINS[2].stops[2];
export const SLOT_FRAMES = T(26);

// Position du rouleau r (en cases, flottante). Elle diminue : les logos descendent.
const posAt = (r: number, f: number): number => {
  let p = STRIPS[r].indexOf(['ferrari', 'tesla', 'nintendo'][r]);
  for (const s of SPINS) {
    const stop = s.stops[r];
    const idx = STRIPS[r].indexOf(s.targets[r]);
    const durSec = (stop - s.start) / 30;
    let end = idx;
    while (p - end < 10 + 14 * durSec) end -= L;
    if (f < s.start - 6) return p;
    if (f < s.start) return p + 0.25 * Math.sin(((f - (s.start - 6)) / 6) * Math.PI); // petit recul
    if (f < stop) {
      const t = (f - s.start) / (stop - s.start);
      const e = s.slow && r === s.slow ? Easing.out(Easing.poly(4))(t) : Easing.out(Easing.back(1.1))(t);
      return p + (end - p) * e;
    }
    p = end;
  }
  return p;
};

const mod = (a: number, n: number) => ((a % n) + n) % n;
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Logo: React.FC<{name: string; x: number; y: number; s: number}> = ({name, x, y, s}) => (
  <svg x={x - s / 2} y={y - s / 2} width={s} height={s} viewBox="0 0 24 24">
    <path d={B[name].path} fill={`#${B[name].hex}`} />
  </svg>
);

const REEL_X = [520, 770, 1020];
const REEL_W = 230;
const WIN_Y = 330;
const WIN_H = 510;
const MID = WIN_Y + WIN_H / 2;

const Reel: React.FC<{r: number; f: number}> = ({r, f}) => {
  const p = posAt(r, f);
  const speed = Math.abs(posAt(r, f) - posAt(r, f - 1));
  const blur = Math.min(26, speed * H * 0.35);
  const base = Math.floor(p);
  const cells = [];
  for (let k = base - 3; k <= base + 3; k++) {
    const y = MID + (k - p) * H;
    const name = STRIPS[r][mod(k, L)];
    cells.push(<Logo key={k} name={name} x={REEL_X[r] + REEL_W / 2} y={y} s={112} />);
  }
  return (
    <g clipPath={`url(#clip${r})`}>
      <rect x={REEL_X[r]} y={WIN_Y} width={REEL_W} height={WIN_H} fill="#fbf7ee" />
      <g filter={blur > 0.5 ? `url(#mb${r})` : undefined}>{cells}</g>
      <rect x={REEL_X[r]} y={WIN_Y} width={REEL_W} height={WIN_H} fill="url(#cyl)" />
      <filter id={`mb${r}`} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation={`0 ${blur}`} />
      </filter>
    </g>
  );
};

// Ampoules autour d'un rectangle arrondi
const Bulbs: React.FC<{x: number; y: number; w: number; h: number; n: number; f: number; party: boolean}> = ({x, y, w, h, n, f, party}) => {
  const per = 2 * (w + h);
  const out = [];
  for (let i = 0; i < n; i++) {
    let d = (i / n) * per;
    let bx: number, by: number;
    if (d < w) [bx, by] = [x + d, y];
    else if ((d -= w) < h) [bx, by] = [x + w, y + d];
    else if ((d -= h) < w) [bx, by] = [x + w - d, y + h];
    else [bx, by] = [x, y + h - (d - w)];
    const on = party ? Math.floor(f / 4) % 2 === i % 2 : (i + Math.floor(f / 4)) % 3 === 0;
    out.push(
      <circle key={i} cx={bx} cy={by} r={9} fill={on ? '#fff3b0' : '#8a5a2b'} style={{filter: on ? 'drop-shadow(0 0 10px #ffd166)' : undefined}} />,
    );
  }
  return <>{out}</>;
};

const Coin: React.FC<{i: number; f: number}> = ({i, f}) => {
  const t0 = WIN + Math.floor(rnd(i) * 70);
  const t = f - t0;
  if (t < 0) return null;
  const x = 200 + rnd(i + 9) * 1520;
  const vy = -12 - rnd(i + 3) * 10;
  const y = 860 + vy * t + 0.55 * t * t;
  if (y > 1200) return null;
  const vx = (rnd(i + 5) - 0.5) * 10;
  const flip = Math.cos(t * (0.25 + rnd(i + 7) * 0.3));
  return (
    <g transform={`translate(${x + vx * t} ${y}) scale(${flip} 1)`}>
      <circle r={30} fill="#f4a52a" />
      <circle r={23} fill="#ffd166" />
      <text y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#c7811d">$</text>
    </g>
  );
};

const Banner: React.FC<{text: string; from: number; to: number; color: string; f: number; fps: number}> = ({text, from, to, color, f, fps}) => {
  if (f < from || f > to) return null;
  const s = spring({frame: f - from, fps, config: {damping: 11}});
  const o = interpolate(f, [to - 8, to], [1, 0], CL);
  return (
    <div style={{position: 'absolute', left: 1480, width: 420, top: 160, textAlign: 'center', opacity: o, transform: `scale(${s}) rotate(4deg)`}}>
      <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 58, letterSpacing: 4, color, background: '#1b1030', padding: '8px 34px', borderRadius: 14}}>{text}</span>
    </div>
  );
};

export const SlotMachine: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const won = f >= WIN;
  const intro = spring({frame: f, fps, config: {damping: 14}});

  // Crédits : 300, chaque partie coûte 100, puis le jackpot.
  const spent = SPINS.filter((s) => f >= s.lever).length * 100;
  const credits = won
    ? 0 + Math.round(interpolate(f, [WIN + 10, WIN + T(4)], [0, 1000000], {...CL, easing: Easing.out(Easing.cubic)}))
    : 300 - spent;

  // Levier : la boule descend puis remonte
  const leverPull = Math.max(
    ...SPINS.map((s) => interpolate(f, [s.lever, s.lever + 6, s.lever + 10, s.lever + 22], [0, 1, 1, 0], {...CL, easing: Easing.inOut(Easing.quad)})),
  );
  const ballY = interpolate(leverPull, [0, 1], [330, 760]);

  const flash = won ? 0.5 + 0.5 * Math.sin((f - WIN) * 0.6) : 0;
  const shake = won && f < WIN + 12 ? Math.sin(f * 3) * (WIN + 12 - f) * 0.8 : 0;
  const rays = f * 0.15;

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #4a2a6e 0%, #241238 55%, #120a1e 100%)', overflow: 'hidden'}}>
      <Audio src={staticFile('slot/hum.wav')} volume={0.5} />
      {SPINS.map((s, i) => (
        <React.Fragment key={i}>
          <Sequence from={s.lever} durationInFrames={30}><Audio src={staticFile('slot/lever.wav')} volume={0.8} /></Sequence>
          <Sequence from={s.start} durationInFrames={s.stops[2] - s.start}><Audio src={staticFile('slot/spin.wav')} volume={0.35} /></Sequence>
          {s.stops.map((st, j) => (
            <Sequence key={j} from={st - 2} durationInFrames={15}><Audio src={staticFile('slot/stop.wav')} volume={0.9} /></Sequence>
          ))}
          {i < 2 && <Sequence from={s.stops[2] + 4} durationInFrames={45}><Audio src={staticFile('slot/lose.wav')} volume={0.5} /></Sequence>}
        </React.Fragment>
      ))}
      <Sequence from={WIN} durationInFrames={T(7)}><Audio src={staticFile('slot/jackpot.wav')} volume={0.7} /></Sequence>

      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          {REEL_X.map((x, r) => (
            <clipPath key={r} id={`clip${r}`}><rect x={x} y={WIN_Y} width={REEL_W} height={WIN_H} rx={12} /></clipPath>
          ))}
          <linearGradient id="cyl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.55" />
            <stop offset="0.25" stopColor="#000" stopOpacity="0" />
            <stop offset="0.75" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* Rayons de lumière derrière la machine */}
        <g transform={`translate(860 520) rotate(${rays})`} opacity={0.18 + flash * 0.25}>
          {Array.from({length: 16}).map((_, i) => (
            <path key={i} d="M0 0 L-90 -1400 L90 -1400 Z" fill={won ? '#ffd166' : '#a77bd6'} transform={`rotate(${i * 22.5})`} />
          ))}
        </g>
        {/* Petites lumières floues */}
        {Array.from({length: 26}).map((_, i) => (
          <circle key={i} cx={rnd(i) * 1920} cy={rnd(i + 40) * 1080} r={6 + rnd(i + 80) * 18} fill={i % 3 ? '#ff8a3d' : '#ffd166'}
            opacity={0.08 + 0.1 * Math.sin(f * 0.05 + i)} />
        ))}

        <g transform={`translate(${shake} ${interpolate(intro, [0, 1], [700, 0])})`}>
          {/* Ombre au sol */}
          <ellipse cx={860} cy={1040} rx={520} ry={34} fill="#000" opacity={0.35} />
          {/* Corps */}
          <rect x={430} y={180} width={860} height={850} rx={46} fill="#d63c3c" />
          <rect x={430} y={600} width={860} height={430} rx={46} fill="#b52f34" />
          <rect x={470} y={300} width={780} height={570} rx={30} fill="#7a1f2b" />
          {/* Enseigne */}
          <rect x={500} y={80} width={720} height={170} rx={34} fill="#2b1846" />
          <Bulbs x={500} y={80} w={720} h={170} n={34} f={f} party={won} />
          <text x={860} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} letterSpacing={4}
            fill={won && Math.floor(f / 5) % 2 ? '#fff3b0' : '#ffd166'}>BRAND JACKPOT</text>
          {/* Rouleaux */}
          {[0, 1, 2].map((r) => <Reel key={r} r={r} f={f} />)}
          {REEL_X.map((x, r) => (
            <rect key={r} x={x} y={WIN_Y} width={REEL_W} height={WIN_H} rx={12} fill="none" stroke="#3a0f18" strokeWidth={8} />
          ))}
          {/* Cadres dorés sur la ligne gagnante */}
          {won && REEL_X.map((x, r) => (
            <rect key={r} x={x + 10} y={MID - H / 2 + 6} width={REEL_W - 20} height={H - 12} rx={14} fill="none" stroke="#ffd166"
              strokeWidth={8} opacity={0.5 + flash * 0.5} style={{filter: 'drop-shadow(0 0 14px #ffd166)'}} />
          ))}
          {/* Ligne de paiement */}
          <rect x={480} y={MID - 3} width={760} height={6} fill={won ? '#ffd166' : '#ff8a3d'} opacity={0.85} />
          <path d={`M455 ${MID - 22} L490 ${MID} L455 ${MID + 22} Z`} fill="#ffd166" />
          <path d={`M1265 ${MID - 22} L1230 ${MID} L1265 ${MID + 22} Z`} fill="#ffd166" />
          {/* Afficheur des crédits */}
          <rect x={560} y={940} width={600} height={64} rx={14} fill="#1b1030" />
          <text x={590} y={983} fontFamily={FONT} fontWeight={800} fontSize={26} fill="#a7b0bd" letterSpacing={3}>CREDITS</text>
          <text x={1135} y={987} textAnchor="end" fontFamily="monospace" fontWeight={700} fontSize={40} fill={won ? '#ffd166' : '#ff8a3d'}>
            {credits.toLocaleString('en-US')}
          </text>
          {/* Levier */}
          <rect x={1290} y={520} width={60} height={110} rx={16} fill="#8a8f99" />
          <line x1={1335} y1={575} x2={1410} y2={ballY} stroke="#c9ced6" strokeWidth={20} strokeLinecap="round" />
          <circle cx={1410} cy={ballY} r={44} fill="#e5484d" />
          <circle cx={1396} cy={ballY - 14} r={12} fill="#ff9b9e" />
        </g>

        {/* Pièces */}
        {won && Array.from({length: 90}).map((_, i) => <Coin key={i} i={i} f={f} />)}
      </svg>

      {/* Titre d'ouverture */}
      <div style={{position: 'absolute', left: 60, top: 360, width: 360, opacity: interpolate(f, [8, 20, T(5), T(5.6)], [0, 1, 1, 0], CL)}}>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 26, color: '#a7b0bd', letterSpacing: 5}}>TEST · STYLE 1</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 46, color: '#f4f1ea', lineHeight: 1.1}}>
          WHICH BRAND<br />HITS<br /><span style={{color: '#ffd166'}}>3 IN A ROW?</span>
        </div>
      </div>

      <Banner text="NO MATCH" from={SPINS[0].stops[2] + 4} to={SPINS[1].lever} color="#a7b0bd" f={f} fps={fps} />
      <Banner text="SO CLOSE…" from={SPINS[1].stops[2] + 4} to={SPINS[2].lever} color="#ff8a3d" f={f} fps={fps} />

      {/* JACKPOT */}
      {won && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 215, textAlign: 'center',
          transform: `scale(${spring({frame: f - WIN - 4, fps, config: {damping: 8}})}) rotate(${-4 + Math.sin(f * 0.2) * 2}deg)`}}>
          <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 170, color: '#ffd166', letterSpacing: 6,
            WebkitTextStroke: '10px #7a1f2b', paintOrder: 'stroke', textShadow: '0 12px 0 #3a0f18'}}>JACKPOT!</span>
        </div>
      )}
      {f > WIN + T(5) && (
        <div style={{position: 'absolute', left: 60, width: 360, top: 140, textAlign: 'center',
          opacity: interpolate(f, [WIN + T(5), WIN + T(5.6)], [0, 1], CL)}}>
          <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 48, lineHeight: 1.2, display: 'inline-block', color: '#f4f1ea', background: '#1b1030', padding: '12px 30px', borderRadius: 14}}>
            +1,000,000<br /><span style={{color: '#ffd166'}}>CREDITS</span>
          </span>
        </div>
      )}

      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [SLOT_FRAMES - 20, SLOT_FRAMES], [0, 1], CL)}} />
    </AbsoluteFill>
  );
};
