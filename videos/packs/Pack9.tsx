// Pack 9 : vues en coupe (immeuble, sous-marin, fourmilière en style 1 ; bunker en style 7).
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Badge, CL, Head, K, Pack1, PackTitle, rnd, Scene, Svg, T, total, Txt} from './k1';
import * as S7 from './k7';

const Guy: React.FC<{x: number; y: number; c: string; s?: number; walk?: number}> = ({x, y, c, s = 1, walk = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cy={-62} r={11} fill="#f1c7a0" />
    <rect x={-12} y={-50} width={24} height={32} rx={8} fill={c} />
    <rect x={-10} y={-20} width={8} height={20} rx={3} fill="#26334d" transform={`rotate(${Math.sin(walk) * 20} -6 -20)`} />
    <rect x={2} y={-20} width={8} height={20} rx={3} fill="#26334d" transform={`rotate(${-Math.sin(walk) * 20} 6 -20)`} />
  </g>
);

// 1. Immeuble en coupe
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const FL = 230;
  const floors = ['ROOFTOP', 'OFFICES', 'MEETING ROOM', 'CAFÉ', 'GYM', 'LOBBY', 'SERVER ROOM'];
  const pan = interpolate(f, [15, T(6)], [0, FL * floors.length - 820], {...CL, easing: Easing.inOut(Easing.cubic)});
  const lift = interpolate(f % 120, [0, 60, 120], [5, 1, 5]);
  return (
    <>
      <Svg>
        <g transform={`translate(0 ${200 - pan})`}>
          <rect x={460} y={0} width={1000} height={FL * floors.length} fill="#1f3152" />
          {floors.map((n, i) => {
            const y = i * FL;
            const bg = i === 6 ? '#0d1626' : i === 0 ? '#2b4a7a' : '#efe6d6';
            return (
              <g key={n}>
                <rect x={480} y={y + 10} width={820} height={FL - 20} fill={bg} />
                <Txt x={500} y={y + 50} s={22} c={i === 6 || i === 0 ? '#fff' : '#101b30'}>{`${7 - i - 1 < 1 ? (i === 6 ? 'B1' : 'G') : 7 - i - 1} · ${n}`}</Txt>
                {i === 0 && <><circle cx={900} cy={y + 150} r={60} fill="none" stroke="#fff" strokeWidth={6} /><Txt x={900} y={y + 166} a="middle" s={50} w={900}>H</Txt></>}
                {i === 1 && [0, 1, 2, 3].map((k) => <g key={k}><rect x={540 + k * 190} y={y + 140} width={140} height={14} fill="#8a5a3c" /><rect x={580 + k * 190} y={y + 90} width={60} height={46} rx={4} fill="#26334d" /><rect x={586 + k * 190} y={y + 96} width={48} height={34} fill={Math.floor(f / 10 + k) % 3 ? '#5aa9ff' : '#7cf0b1'} /><Guy x={610 + k * 190} y={y + 200} c={K.shirts[k]} s={1.1} /></g>)}
                {i === 2 && <><rect x={600} y={y + 120} width={560} height={30} rx={14} fill="#8a5a3c" />{[0, 1, 2, 3, 4].map((k) => <Guy key={k} x={640 + k * 120} y={y + 210} c={K.shirts[k + 2]} s={1.1} />)}<rect x={1180} y={y + 60} width={100} height={70} fill="#fff" /><Badge b="google" x={1230} y={y + 95} r={24} /></>}
                {i === 3 && <><rect x={560} y={y + 110} width={260} height={90} fill={'#00704a'} /><Badge b="starbucks" x={690} y={y + 80} r={30} />{[0, 1, 2].map((k) => <Guy key={k} x={900 + k * 110 + ((f * 2) % 60)} y={y + 210} c={K.shirts[k]} walk={f * 0.4 + k} s={1.1} />)}</>}
                {i === 4 && [0, 1, 2].map((k) => <g key={k}><rect x={560 + k * 240} y={y + 170} width={180} height={20} rx={10} fill="#3b4a66" /><Guy x={650 + k * 240} y={y + 172} c={K.shirts[k + 3]} walk={f * 0.6 + k} s={1.1} /></g>)}
                {i === 5 && <><rect x={560} y={y + 150} width={240} height={50} fill="#8a5a3c" /><Guy x={680} y={y + 150} c="#101b30" s={1.1} />{[0, 1].map((k) => <Guy key={k} x={((f * 3 + k * 300) % 700) + 820} y={y + 210} c={K.shirts[k + 4]} walk={f * 0.5} s={1.1} />)}</>}
                {i === 6 && [0, 1, 2, 3, 4, 5].map((k) => <g key={k}><rect x={540 + k * 120} y={y + 60} width={90} height={150} fill="#26334d" />{[0, 1, 2, 3, 4].map((r) => <circle key={r} cx={560 + k * 120} cy={y + 80 + r * 26} r={5} fill={rnd(k * 9 + r + Math.floor(f / 4)) > 0.5 ? '#7cf0b1' : '#14402a'} />)}</g>)}
              </g>
            );
          })}
          <rect x={1310} y={0} width={140} height={FL * floors.length} fill="#16233a" />
          <rect x={1320} y={lift * FL + 20} width={120} height={FL - 40} rx={8} fill="#9aa5b5" />
          <rect x={440} y={-20} width={1040} height={30} fill="#26334d" />
        </g>
      </Svg>
      <Head n="01 · CUTAWAY: BUILDING" title="INSIDE" accent="A TECH HQ" note="" />
    </>
  );
};

// 2. Sous-marin en coupe
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const depth = Math.round(interpolate(f, [0, T(6.5)], [120, 640], CL));
  const rooms: [number, number, string][] = [[520, 230, 'TORPEDOES'], [760, 260, 'CONTROL'], [1030, 230, 'CREW'], [1270, 230, 'ENGINE']];
  return (
    <>
      <Svg>
        <defs><linearGradient id="sea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1d5f86" /><stop offset="1" stopColor="#071a2c" /></linearGradient></defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#sea)" opacity={interpolate(depth, [120, 640], [1, 0.5])} />
        {Array.from({length: 7}).map((_, i) => {
          const x = ((i * 330 - f * (2 + i % 3)) % 2200 + 2200) % 2200 - 140;
          return <path key={i} d={`M${x},${200 + i * 110} q30,-20 60,0 q-30,20 -60,0 l-20,-14 l0,28 z`} fill="#0b2a44" />;
        })}
        <g transform={`translate(0 ${Math.sin(f * 0.05) * 8})`}>
          <path d="M440,520 Q440,400 600,400 L1400,400 Q1560,400 1600,520 Q1560,640 1400,640 L600,640 Q440,640 440,520 Z" fill="#3b4a66" />
          <rect x={840} y={300} width={170} height={110} rx={12} fill="#3b4a66" />
          <rect x={910} y={190} width={12} height={110} fill="#5a6a88" />
          <rect x={910} y={190} width={40} height={14} fill="#5a6a88" />
          {rooms.map(([x, w, n], i) => (
            <g key={n}>
              <rect x={x} y={430} width={w - 14} height={180} rx={10} fill="#efe6d6" />
              <Txt x={x + 12} y={460} s={18} c="#101b30">{n}</Txt>
              {i === 0 && [0, 1, 2].map((k) => <rect key={k} x={x + 20} y={490 + k * 34} width={170} height={22} rx={11} fill="#5a6a88" />)}
              {i === 1 && <><rect x={x + 30} y={500} width={90} height={60} fill="#101b30" /><circle cx={x + 75} cy={530} r={22} fill="none" stroke="#2ef08a" strokeWidth={2} /><line x1={x + 75} y1={530} x2={x + 75 + Math.cos(f * 0.2) * 22} y2={530 + Math.sin(f * 0.2) * 22} stroke="#2ef08a" strokeWidth={2} /><Guy x={x + 180} y={600} c="#3d5a80" /></>}
              {i === 2 && [0, 1].map((k) => <g key={k}><rect x={x + 20} y={500 + k * 50} width={180} height={18} fill="#8a5a3c" /><circle cx={x + 40} cy={492 + k * 50} r={9} fill="#f1c7a0" /></g>)}
              {i === 3 && <g transform={`translate(${x + 100} 530) rotate(${f * 8})`}>{Array.from({length: 8}).map((_, k) => <rect key={k} x={-8} y={-50} width={16} height={22} fill="#5a6a88" transform={`rotate(${k * 45})`} />)}<circle r={34} fill="#5a6a88" /><circle r={12} fill="#efe6d6" /></g>}
            </g>
          ))}
          <g transform={`translate(1610 520) scale(1 ${Math.cos(f * 0.5)})`}><ellipse rx={14} ry={70} fill="#9aa5b5" /></g>
          {Array.from({length: 10}).map((_, i) => {
            const t = ((f + i * 12) % 120) / 120;
            return <circle key={i} cx={1640 + t * 200 + Math.sin(t * 9 + i) * 10} cy={520 - t * 260} r={4 + t * 8} fill="none" stroke="#bfe3ff" strokeWidth={2} opacity={1 - t} />;
          })}
        </g>
        {[0, 1, 2].map((k) => {
          const t = ((f + k * 30) % 90) / 90;
          return <circle key={k} cx={960} cy={520} r={200 + t * 700} fill="none" stroke="#7cf0b1" strokeWidth={2} opacity={(1 - t) * 0.5} />;
        })}
        <Txt x={1780} y={980} a="end" s={64} w={900}>{depth} M</Txt>
        <Txt x={1780} y={920} a="end" s={22} c={K.dim}>DEPTH</Txt>
      </Svg>
      <Head n="02 · CUTAWAY: SUBMARINE" title="INSIDE" accent="A SUBMARINE" note="" />
    </>
  );
};

// 3. Fourmilière en coupe
const TUN = 'M960,300 C960,380 820,400 760,470 C700,540 700,600 620,640 M760,470 C860,520 1000,520 1080,580 C1160,640 1180,720 1100,780 M1080,580 C1180,560 1300,600 1340,680 M620,640 C560,700 560,780 640,840 M1100,780 C1000,840 860,860 780,900';
const CH: [number, number, string][] = [[620, 660, 'FOOD'], [1340, 690, 'EGGS'], [640, 850, 'NURSERY'], [780, 905, 'QUEEN'], [1100, 790, 'FUNGUS FARM']];
const pathPts = (() => {
  const segs = [[[960, 300], [960, 380], [820, 400], [760, 470]], [[760, 470], [860, 520], [1000, 520], [1080, 580]], [[1080, 580], [1160, 640], [1180, 720], [1100, 780]], [[1100, 780], [1000, 840], [860, 860], [780, 900]]];
  return segs.flatMap((s) => Array.from({length: 30}, (_, i) => {
    const t = i / 30, u = 1 - t;
    return [u ** 3 * s[0][0] + 3 * u * u * t * s[1][0] + 3 * u * t * t * s[2][0] + t ** 3 * s[3][0], u ** 3 * s[0][1] + 3 * u * u * t * s[1][1] + 3 * u * t * t * s[2][1] + t ** 3 * s[3][1]];
  }));
})();
const Ant: React.FC<{x: number; y: number; a: number; f: number}> = ({x, y, a, f}) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    {[-1, 0, 1].map((k) => <line key={k} x1={k * 7} y1={0} x2={k * 7 + Math.sin(f + k) * 3} y2={Math.sin(f * 0.8 + k) > 0 ? 9 : -9} stroke="#1b0f08" strokeWidth={2} />)}
    <ellipse cx={-10} cy={0} rx={8} ry={6} fill="#1b0f08" /><ellipse cx={1} cy={0} rx={5} ry={4} fill="#1b0f08" /><circle cx={10} cy={0} r={5} fill="#1b0f08" />
  </g>
);
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, T(6)], [1, 1.25], CL);
  return (
    <>
      <Svg>
        <g transform={`translate(960 600) scale(${zoom}) translate(-960 -600)`}>
          <rect x={0} y={0} width={1920} height={300} fill="#5aa9ff" opacity={0.25} />
          <rect x={0} y={300} width={1920} height={780} fill="#7a4e33" />
          <rect x={0} y={300} width={1920} height={780} fill="url(#soil)" />
          <defs><pattern id="soil" width="80" height="80" patternUnits="userSpaceOnUse"><circle cx={20} cy={30} r={6} fill="#6b4329" /><circle cx={60} cy={60} r={4} fill="#8a5a3c" /></pattern></defs>
          {Array.from({length: 80}).map((_, i) => <path key={i} d={`M${i * 25},300 l6,-${20 + rnd(i) * 20} l6,${20 + rnd(i) * 20}`} fill="#4e8a3e" />)}
          <path d="M900,300 Q960,230 1020,300 Z" fill="#a0693f" />
          <path d={TUN} fill="none" stroke="#3b2414" strokeWidth={50} strokeLinecap="round" />
          {CH.map(([x, y, n]) => (
            <g key={n}>
              <ellipse cx={x} cy={y} rx={95} ry={50} fill="#3b2414" />
              {n === 'EGGS' && Array.from({length: 7}).map((_, k) => <ellipse key={k} cx={x - 50 + k * 16} cy={y + 18 - (k % 2) * 14} rx={7} ry={10} fill="#fbf7ee" />)}
              {n === 'FOOD' && Array.from({length: 6}).map((_, k) => <circle key={k} cx={x - 40 + k * 16} cy={y + 20 - (k % 2) * 12} r={8} fill="#7fb069" />)}
              {n === 'QUEEN' && <g transform={`translate(${x} ${y + 10}) scale(2.2)`}><Ant x={0} y={0} a={0} f={0} /></g>}
              {n === 'FUNGUS FARM' && Array.from({length: 5}).map((_, k) => <circle key={k} cx={x - 40 + k * 20} cy={y + 14} r={12} fill="#e8e4dc" />)}
              {(() => {
                const [dx, dy] = ({FOOD: [-200, -70], EGGS: [150, -90], NURSERY: [-220, 40], QUEEN: [170, 40], 'FUNGUS FARM': [180, 90]} as Record<string, number[]>)[n];
                return <><line x1={x + Math.sign(dx) * 80} y1={y} x2={x + dx} y2={y + dy} stroke="#fff" strokeWidth={2} /><Txt x={x + dx + Math.sign(dx) * 8} y={y + dy + 8} a={dx < 0 ? 'end' : 'start'} s={22}>{n}</Txt></>;
              })()}
            </g>
          ))}
          {Array.from({length: 14}).map((_, i) => {
            const n = pathPts.length;
            const p = ((f * 1.5 + i * (n / 14)) % n + n) % n;
            const k = Math.floor(p), dir = i % 2 ? 1 : -1;
            const idx = dir > 0 ? k : n - 1 - k;
            const [x, y] = pathPts[idx], [x2, y2] = pathPts[Math.max(0, Math.min(n - 1, idx + dir))];
            return <Ant key={i} x={x + (i % 3 - 1) * 8} y={y} a={(Math.atan2(y2 - y, x2 - x) * 180) / Math.PI} f={f * 0.8 + i} />;
          })}
        </g>
      </Svg>
      <Head n="03 · CUTAWAY: ANTHILL" title="UNDER" accent="YOUR GARDEN" note="" />
    </>
  );
};

const SCENES_A: Scene[] = [
  [PackTitle('PACK 9 · CUTAWAYS', 'CROSS-SECTIONS', 'SEE INSIDE ANYTHING'), T(2.5)],
  [S1, T(6.5)], [S2, T(6.5)], [S3, T(6.5)],
];
export const PACK9A_FRAMES = total(SCENES_A);
export const PackNineA: React.FC = () => <Pack1 scenes={SCENES_A} />;

// 4. Bunker en coupe (style 7)
const {W, DIM, FAINT, RED, RGLOW, WARM, BLACK} = S7;
const Bunker: React.FC = () => {
  const f = useCurrentFrame();
  const pan = interpolate(f, [20, T(6)], [0, 900], {...CL, easing: Easing.inOut(Easing.cubic)});
  const depth = Math.round(pan / 60);
  const knock = f > T(6.6);
  return (
    <>
      <S7.Svg>
        <g transform={`translate(0 ${-pan})`}>
          <line x1={0} x2={1920} y1={600} y2={600} stroke={W} strokeWidth={4} />
          {Array.from({length: 14}).map((_, i) => <path key={i} d={`M${100 + i * 130},600 l-16,-34 h32 Z`} fill="none" stroke={W} strokeWidth={2} opacity={0.5} />)}
          <S7.House x={700} y={600} s={0.7} />
          <path d="M760,600 L760,900 M820,600 L820,900" stroke={DIM} strokeWidth={3} />
          {Array.from({length: 10}).map((_, i) => <line key={i} x1={760} x2={820} y1={620 + i * 30} y2={620 + i * 30} stroke={DIM} strokeWidth={3} />)}
          <rect x={420} y={900} width={1080} height={900} fill="none" stroke={W} strokeWidth={6} />
          <line x1={420} x2={1500} y1={1350} y2={1350} stroke={W} strokeWidth={4} />
          <line x1={960} x2={960} y1={900} y2={1350} stroke={W} strokeWidth={4} />
          <line x1={960} x2={960} y1={1350} y2={1800} stroke={W} strokeWidth={4} />
          <S7.Txt x={440} y={940} s={20} c={DIM}>SUPPLIES</S7.Txt>
          {Array.from({length: 12}).map((_, i) => <rect key={i} x={460 + (i % 6) * 75} y={1180 + Math.floor(i / 6) * 80} width={60} height={70} fill="none" stroke={W} strokeWidth={3} />)}
          <S7.Txt x={980} y={940} s={20} c={DIM}>RADIO ROOM</S7.Txt>
          <rect x={1100} y={1150} width={240} height={160} fill="none" stroke={W} strokeWidth={3} />
          <circle cx={1150} cy={1200} r={10} fill={Math.floor(f / 8) % 2 ? RED : 'none'} stroke={RED} strokeWidth={2} />
          <polyline points={Array.from({length: 30}, (_, i) => `${1180 + i * 5},${1240 + Math.sin(i * 0.9 + f * 0.5) * 12}`).join(' ')} fill="none" stroke={W} strokeWidth={2} />
          <S7.Person x={1040} y={1340} s={0.7} />
          <S7.Txt x={440} y={1390} s={20} c={DIM}>BUNKS</S7.Txt>
          {[0, 1].map((k) => <g key={k}><rect x={480} y={1550 + k * 120} width={360} height={30} fill="none" stroke={W} strokeWidth={3} /><circle cx={510} cy={1535 + k * 120} r={14} fill={W} /></g>)}
          <S7.Txt x={980} y={1390} s={20} c={RED}>SEALED · DO NOT OPEN</S7.Txt>
          <rect x={1060} y={1500} width={220} height={290} fill="none" stroke={RED} strokeWidth={5} style={{filter: RGLOW}} />
          <line x1={1060} x2={1280} y1={1500} y2={1790} stroke={RED} strokeWidth={3} /><line x1={1280} x2={1060} y1={1500} y2={1790} stroke={RED} strokeWidth={3} />
          {knock && [0, 1, 2].map((k) => <circle key={k} cx={1170} cy={1640} r={60 + ((f * 4 + k * 40) % 120)} fill="none" stroke={RED} strokeWidth={2} opacity={1 - ((f * 4 + k * 40) % 120) / 120} />)}
          <rect x={1300} y={1700} width={4} height={4} fill={WARM} />
        </g>
        <S7.Txt x={1780} y={940} a="end" s={64} big>{depth} M</S7.Txt>
        <S7.Txt x={1780} y={880} a="end" s={20} c={DIM}>BELOW GROUND</S7.Txt>
        {knock && <S7.Txt x={960} y={1000} a="middle" s={34} big c={RED}>THE KNOCKING COMES FROM INSIDE.</S7.Txt>}
      </S7.Svg>
      <S7.Fig n="FIG. 4 · CUTAWAY: SHELTER" title="MUNICIPAL SHELTER N° 2" />
    </>
  );
};
void FAINT; void BLACK;
const SCENES_B: S7.Scene[] = [[Bunker, S7.T(8.4)]];
export const PACK9B_FRAMES = S7.total(SCENES_B);
export const PackNineB: React.FC = () => <S7.Pack7 scenes={SCENES_B} label="MBNC · CIVIL DEFENCE" />;
