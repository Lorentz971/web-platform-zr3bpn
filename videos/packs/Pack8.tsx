// Pack 8 : écrans et documents construits (style n° 7). Univers MBNC.
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {BLACK, CL, DIM, FAINT, Fig, FONT, House, MONO, Pack7, PackTitle7, Person, RED, RGLOW, rnd, Scene, Svg, T, total, Txt, useSp, W, WARM} from './k7';

const Stamp: React.FC<{x: number; y: number; text: string; at: number; rot?: number; s?: number}> = ({x, y, text, at, rot = -12, s = 1}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const k = interpolate(f, [at, at + 5], [2.2, 1], {...CL, easing: Easing.in(Easing.quad)});
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k * s})`} opacity={interpolate(f, [at, at + 3], [0, 0.95], CL)} style={{filter: RGLOW}}>
      <rect x={-text.length * 22 - 20} y={-50} width={text.length * 44 + 40} height={90} fill="none" stroke={RED} strokeWidth={8} />
      <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} letterSpacing={4} fill={RED}>{text}</text>
    </g>
  );
};

// 1. Panneau de contrôle
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const lights = Array.from({length: 12}, (_, i) => f > 10 + i * 4);
  const sw = [0, 1, 2, 3, 4, 5].map((i) => (i === 4 ? f > T(2.6) : f > 20 + i * 8));
  const alarm = f > T(2.8);
  const needle = alarm ? 70 + Math.sin(f * 0.9) * 10 : interpolate(f, [0, T(2.6)], [-60, 10], CL);
  return (
    <>
      <Svg>
        <rect x={360} y={240} width={1200} height={680} rx={20} fill={BLACK} stroke={W} strokeWidth={4} />
        {lights.map((on, i) => {
          const red = alarm && i % 3 === 0;
          return <circle key={i} cx={440 + i * 95} cy={310} r={20} fill={red ? RED : on ? W : 'none'} stroke={red ? RED : W} strokeWidth={3} opacity={red ? (Math.floor(f / 5) % 2 ? 1 : 0.3) : 1} style={red ? {filter: RGLOW} : undefined} />;
        })}
        {sw.map((up, i) => (
          <g key={i} transform={`translate(${470 + i * 120} 520)`}>
            <rect x={-28} y={-60} width={56} height={120} rx={10} fill="none" stroke={DIM} strokeWidth={3} />
            <line x1={0} y1={0} x2={0} y2={up ? -50 : 50} stroke={i === 4 && up ? RED : W} strokeWidth={14} strokeLinecap="round" />
            <circle r={12} fill={W} />
            <Txt x={0} y={100} a="middle" s={16} c={i === 4 && up ? RED : DIM}>{['LIGHTS', 'DOORS', 'RADIO', 'SIREN', 'VOICE', 'POWER'][i]}</Txt>
          </g>
        ))}
        {[0, 1].map((k) => (
          <g key={k} transform={`translate(${1250 + k * 200} 520)`}>
            <path d="M-80,0 A80,80 0 0 1 80,0" fill="none" stroke={DIM} strokeWidth={3} />
            <line x1={0} y1={0} x2={Math.sin(((needle + k * 15) * Math.PI) / 180) * 70} y2={-Math.cos(((needle + k * 15) * Math.PI) / 180) * 70} stroke={alarm ? RED : W} strokeWidth={4} />
            <Txt x={0} y={40} a="middle" s={16} c={DIM}>{k ? 'SIGNAL' : 'PROXIMITY'}</Txt>
          </g>
        ))}
        <circle cx={1350} cy={790} r={70} fill={RED} opacity={alarm ? 1 : 0.4} style={alarm ? {filter: RGLOW} : undefined} />
        <Txt x={1350} y={890} a="middle" s={18} c={RED}>DO NOT PRESS</Txt>
        <Txt x={500} y={800} s={26} c={alarm ? RED : DIM}>{alarm ? 'SWITCH 5 MOVED BY ITSELF' : 'ALL SYSTEMS NOMINAL'}</Txt>
      </Svg>
      <Fig n="FIG. 1 · BUILT: CONTROL PANEL" title="STATION 4 · NIGHT SHIFT" />
    </>
  );
};

// 2. Panneau à lettres (split-flap)
const CH = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:·';
const Flap: React.FC<{x: number; y: number; c: string; settle: number; red?: boolean}> = ({x, y, c, settle, red}) => {
  const f = useCurrentFrame();
  const ch = f >= settle ? c : CH[Math.floor(rnd(Math.floor(f / 2) + x * 0.37 + y) * CH.length)];
  return (
    <g>
      <rect x={x} y={y} width={44} height={64} rx={4} fill="#151515" stroke="#2a2a2a" />
      <text x={x + 22} y={y + 48} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={42} fill={red && f >= settle ? RED : W}>{ch}</text>
      <line x1={x} x2={x + 44} y1={y + 32} y2={y + 32} stroke={BLACK} strokeWidth={3} />
    </g>
  );
};
const S2: React.FC = () => {
  const rows: [string, string, string, boolean][] = [['02:51', 'NORTH GATE', 'CLEAR', false], ['03:00', 'CREEK ROAD', 'CLEAR', false], ['03:04', 'CHAPEL', 'DELAYED', false], ['03:07', 'ELM STREET', 'CALLING', true], ['03:12', 'YOUR HOUSE', 'BOARDING', true]];
  return (
    <>
      <Svg glow={false}>
        <rect x={180} y={230} width={1560} height={620} rx={14} fill="#0e0e0e" stroke={W} strokeWidth={3} />
        {['TIME', 'LOCATION', 'STATUS'].map((h, i) => <Txt key={h} x={[230, 560, 1240][i]} y={290} s={22} c={WARM}>{h}</Txt>)}
        {rows.map(([t, loc, st, red], k) => {
          const y = 320 + k * 100;
          const cells = (t.padEnd(5) + '  ' + loc.padEnd(13) + '  ' + st.padEnd(9)).split('');
          return cells.map((c, i) => <Flap key={`${k}-${i}`} x={230 + i * 48} y={y} c={c} settle={10 + k * 10 + i * 2} red={red && i > 21} />);
        })}
      </Svg>
      <Fig n="FIG. 2 · BUILT: SPLIT-FLAP BOARD" title="NIGHT SCHEDULE" />
    </>
  );
};

// 3. Dossier tamponné
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const slide = useSp(0, 16);
  const open = interpolate(f, [18, 34], [0, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  const lines = 13;
  return (
    <>
      <Svg>
        <g transform={`translate(${(1 - slide) * -1200} 0)`}>
          <rect x={560} y={230} width={800} height={720} fill={BLACK} stroke={W} strokeWidth={4} />
          <Txt x={600} y={290} s={22}>MBNC · CASE FILE 0417</Txt>
          <Txt x={600} y={326} s={18} c={DIM}>SUBJECT: [REDACTED] · ELM STREET</Txt>
          {Array.from({length: lines}).map((_, i) => {
            const w = 500 + rnd(i) * 200;
            const red = rnd(i + 7) > 0.55;
            const o = interpolate(f, [34 + i * 3, 38 + i * 3], [0, 1], CL);
            const rx = 600 + rnd(i + 3) * 200;
            return (
              <g key={i} opacity={o}>
                <line x1={600} x2={600 + w} y1={380 + i * 40} y2={380 + i * 40} stroke={DIM} strokeWidth={6} />
                {red && <rect x={rx} y={370 + i * 40} width={120 + rnd(i + 2) * 160} height={22} fill={W} />}
              </g>
            );
          })}
          <g transform={`translate(560 230) scale(${1 - open} 1)`}><rect x={0} y={0} width={800} height={720} fill="#141414" stroke={W} strokeWidth={4} /><Txt x={400} y={380} a="middle" s={40} big>CASE 0417</Txt></g>
          <Stamp x={1040} y={820} text="CLASSIFIED" at={T(3)} />
        </g>
      </Svg>
      <Fig n="FIG. 3 · BUILT: STAMPED DOSSIER" title="CASE FILE" />
    </>
  );
};

// 4. Fiche d'identité
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const s = useSp(0, 14);
  const fields: [string, string][] = [['NAME', 'DANIEL HOLLOWAY'], ['BORN', '03 / 07 / 1985'], ['ADDRESS', '14 ELM STREET'], ['HEARD NAME', 'YES · 10/27'], ['ANSWERED', 'YES']];
  const glitch = f > T(3);
  const gl = glitch && f < T(3) + 10;
  return (
    <>
      <Svg>
        <g transform={`translate(960 590) scale(${s}) rotate(${(1 - s) * -10}) translate(-960 -590)`}>
          <rect x={460} y={330} width={1000} height={560} rx={24} fill={BLACK} stroke={W} strokeWidth={4} />
          <rect x={460} y={330} width={1000} height={70} rx={24} fill={W} fillOpacity={0.1} />
          <Txt x={500} y={378} s={24}>MUNICIPAL RESIDENT CARD · GREY HOLLOW</Txt>
          <rect x={510} y={440} width={260} height={320} fill="none" stroke={W} strokeWidth={3} />
          <g transform={gl ? `translate(${(rnd(f) - 0.5) * 40} 0)` : undefined}>
            {!glitch ? <Person x={640} y={740} s={1.4} /> : (
              <g>
                <Person x={640} y={740} s={1.4} color={DIM} />
                <circle cx={640} cy={530} r={34} fill={BLACK} stroke={RED} strokeWidth={3} />
              </g>
            )}
          </g>
          {fields.map(([k, v], i) => {
            const n = Math.floor((f - 14 - i * 8) * 1.4);
            return (
              <g key={k}>
                <Txt x={820} y={470 + i * 64} s={16} c={DIM}>{k}</Txt>
                <Txt x={820} y={496 + i * 64} s={26} c={i >= 3 ? RED : W}>{v.slice(0, Math.max(0, n))}</Txt>
              </g>
            );
          })}
          <Stamp x={1180} y={800} text="REPLACED" at={T(3.3)} rot={-8} s={0.8} />
        </g>
      </Svg>
      <Fig n="FIG. 4 · BUILT: ID CARD" title="RESIDENT RECORD" cap="SINCE OCTOBER, HIS FAMILY SAYS HE SMILES DIFFERENTLY." />
    </>
  );
};

// 5. Tableau d'enquête
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const P: [number, number, string][] = [[420, 330, 'house'], [960, 300, 'tape'], [1500, 340, 'tree'], [520, 760, 'person'], [1000, 780, 'eye'], [1450, 760, 'clock']];
  const links: [number, number][] = [[0, 1], [1, 2], [2, 4], [4, 3], [3, 0], [1, 4], [0, 4], [5, 4], [2, 5]];
  const q = useSp(T(3.6), 9);
  return (
    <>
      <Svg>
        {links.map(([a, b], i) => {
          const t = interpolate(f, [20 + i * 8, 34 + i * 8], [0, 1], CL);
          const [x1, y1] = P[a], [x2, y2] = P[b];
          return <line key={i} x1={x1} y1={y1 - 80} x2={x1 + (x2 - x1) * t} y2={y1 - 80 + (y2 - y1) * t} stroke={RED} strokeWidth={3} style={{filter: RGLOW}} />;
        })}
        {P.map(([x, y, k], i) => {
          const s = useSp(i * 4, 14);
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${(rnd(i) - 0.5) * 10}) scale(${s})`}>
              <rect x={-110} y={-90} width={220} height={240} fill={BLACK} stroke={W} strokeWidth={3} />
              <rect x={-90} y={-70} width={180} height={160} fill="none" stroke={DIM} strokeWidth={2} />
              {k === 'house' && <House x={0} y={60} s={0.38} />}
              {k === 'tree' && <g stroke={W} strokeWidth={4}><line x1={0} y1={70} x2={0} y2={-60} />{[-30, 0, 30].map((dy) => <path key={dy} d={`M-40,${dy + 20} L0,${dy} L40,${dy + 20}`} fill="none" />)}</g>}
              {k === 'person' && <Person x={0} y={85} s={0.8} />}
              {k === 'eye' && <g><path d="M-60,10 Q0,-40 60,10 Q0,60 -60,10 Z" fill="none" stroke={RED} strokeWidth={5} /><circle cx={0} cy={10} r={16} fill={RED} /></g>}
              {k === 'tape' && <g><rect x={-70} y={-30} width={140} height={90} rx={8} fill="none" stroke={W} strokeWidth={4} /><circle cx={-30} cy={15} r={18} fill="none" stroke={W} strokeWidth={4} /><circle cx={30} cy={15} r={18} fill="none" stroke={W} strokeWidth={4} /></g>}
              {k === 'clock' && <g><circle cx={0} cy={10} r={60} fill="none" stroke={W} strokeWidth={4} /><line x1={0} y1={10} x2={0} y2={-35} stroke={W} strokeWidth={4} /><line x1={0} y1={10} x2={30} y2={25} stroke={RED} strokeWidth={4} /></g>}
              <Txt x={0} y={130} a="middle" s={16} c={DIM}>{['14 ELM ST', 'TAPE 14', 'TREE LINE', 'D. HOLLOWAY', '???', '03:07'][i]}</Txt>
              <circle cx={0} cy={-80} r={10} fill={RED} />
            </g>
          );
        })}
        <g transform={`translate(1000 560) scale(${q})`}><Txt x={0} y={30} a="middle" s={110} big c={RED}>?</Txt></g>
      </Svg>
      <Fig n="FIG. 5 · BUILT: INVESTIGATION BOARD" title="CONNECTIONS" />
    </>
  );
};

// 6. Ticket de caisse
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const L = ['MBNC GENERAL STORE', '--------------------', 'ROCK SALT 2KG     4.99', 'CANDLES X12       8.50', 'EARPLUGS          2.99', 'DOOR CHAIN X3    21.00', 'BLACKOUT CLOTH   12.40', '--------------------', 'TOTAL            49.88', '', 'THANK YOU.', 'DO NOT ANSWER.'];
  const out = interpolate(f, [8, T(3.8)], [0, L.length], CL);
  const len = out * 46 + 20;
  return (
    <>
      <Svg>
        <rect x={700} y={200} width={520} height={160} rx={18} fill={BLACK} stroke={W} strokeWidth={4} />
        <rect x={760} y={340} width={400} height={14} fill={W} opacity={0.3} />
        <rect x={1100} y={240} width={80} height={30} fill={W} opacity={0.5} />
        <defs><clipPath id="rc"><rect x={770} y={354} width={380} height={len} /></clipPath></defs>
        <g clipPath="url(#rc)">
          <rect x={770} y={354} width={380} height={800} fill="#e8e8e8" />
          {L.map((l, i) => {
            const y = 354 + len - (out - i) * 46 + 10;
            const red = i >= 10;
            return <text key={i} x={i === 0 || i >= 10 ? 960 : 790} y={y} textAnchor={i === 0 || i >= 10 ? 'middle' : 'start'} fontFamily={MONO} fontSize={22} fontWeight={700} fill={red ? RED : '#111'} style={{whiteSpace: 'pre'}}>{l}</text>;
          })}
        </g>
        <path d={`M770,${354 + len} ${Array.from({length: 19}).map((_, i) => `l10,${i % 2 ? -8 : 8} l10,${i % 2 ? 8 : -8}`).join(' ')}`} fill="none" stroke="#e8e8e8" strokeWidth={3} />
      </Svg>
      <Fig n="FIG. 6 · BUILT: RECEIPT PRINTER" title="WHAT PEOPLE BUY IN OCTOBER" />
    </>
  );
};

// 7. Facture
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const items: [string, string][] = [['1 × VOICE OF A LOVED ONE (BORROWED)', '—'], ['7 × YEARS OF SLEEP', '—'], ['1 × REFLECTION (MIRROR, HALLWAY)', '—'], ['∞ × NIGHTS AT 03:07', '—']];
  const s = useSp(0, 16);
  const tot = interpolate(f, [T(2.6), T(3)], [0, 1], CL);
  return (
    <>
      <Svg>
        <g opacity={s} transform={`translate(0 ${(1 - s) * 60})`}>
          <rect x={460} y={220} width={1000} height={740} fill={BLACK} stroke={W} strokeWidth={4} />
          <Txt x={510} y={300} s={50} big>INVOICE</Txt>
          <Txt x={1410} y={290} a="end" s={20} c={DIM}>N° 0417 · 10/27</Txt>
          <Txt x={510} y={360} s={20} c={DIM}>BILLED TO:</Txt>
          <Txt x={680} y={360} s={22} c={WARM}>YOU</Txt>
          <line x1={510} x2={1410} y1={400} y2={400} stroke={W} strokeWidth={2} />
          {items.map(([d, a], i) => (
            <g key={i} opacity={interpolate(f, [16 + i * 10, 22 + i * 10], [0, 1], CL)}>
              <Txt x={510} y={460 + i * 66} s={24}>{d}</Txt>
              <Txt x={1410} y={460 + i * 66} a="end" s={24} c={DIM}>{a}</Txt>
              <line x1={510} x2={1410} y1={482 + i * 66} y2={482 + i * 66} stroke={FAINT} />
            </g>
          ))}
          <line x1={1000} x2={1000 + 410 * tot} y1={760} y2={760} stroke={W} strokeWidth={3} />
          <Txt x={1000} y={820} s={24} c={DIM} o={tot}>TOTAL DUE</Txt>
          <Txt x={1410} y={820} a="end" s={36} big c={RED} o={tot}>YOUR NAME</Txt>
          <Txt x={510} y={920} s={20} c={RED} o={tot}>PAYMENT DUE: TONIGHT</Txt>
        </g>
        <Stamp x={760} y={830} text="UNPAID" at={T(3.6)} rot={-10} s={0.8} />
      </Svg>
      <Fig n="FIG. 7 · BUILT: INVOICE" title="WHAT IT COSTS" />
    </>
  );
};

// 8. Journal qui tourne
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, [4, 34], [0, 1], {...CL, easing: Easing.out(Easing.cubic)});
  return (
    <>
      <Svg>
        <g transform={`translate(960 580) rotate(${(1 - t) * 1080 - 4}) scale(${0.05 + t * 0.95})`}>
          <rect x={-480} y={-340} width={960} height={680} fill="#e9e6df" />
          <text x={0} y={-260} textAnchor="middle" fontFamily="DejaVu Serif, serif" fontWeight={700} fontSize={50} fill="#111">THE GREY HOLLOW GAZETTE</text>
          <line x1={-440} x2={440} y1={-235} y2={-235} stroke="#111" strokeWidth={3} />
          <text x={-440} y={-210} fontFamily={MONO} fontSize={16} fill="#333">OCTOBER 28 · FIVE CENTS</text>
          <text x={0} y={-130} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill="#111">LOCAL MAN ANSWERS</text>
          <rect x={-440} y={-90} width={420} height={380} fill="#111" />
          <Person x={-230} y={240} s={1.5} color="#e9e6df" />
          <circle cx={-230} cy={15} r={34} fill="#111" stroke={RED} strokeWidth={4} />
          {Array.from({length: 13}).map((_, i) => <rect key={i} x={20} y={-80 + i * 28} width={400 - rnd(i) * 80} height={10} fill="#555" />)}
          <text x={20} y={-100} fontFamily={MONO} fontSize={18} fontWeight={700} fill={RED}>"IT SOUNDED JUST LIKE HIS WIFE"</text>
        </g>
      </Svg>
      <Fig n="FIG. 8 · BUILT: SPINNING NEWSPAPER" title="PRESS ARCHIVE" />
    </>
  );
};

const SCENES: Scene[] = [
  [PackTitle7('PACK 8 · STYLE 7 · MBNC ARCHIVE', 'SCREENS & DOCUMENTS', '8 BUILT OBJECTS'), T(2.6)],
  [S1, T(4.6)], [S2, T(4.4)], [S3, T(4.6)], [S4, T(4.8)], [S5, T(5)], [S6, T(4.6)], [S7, T(4.6)], [S8, T(4)],
];
export const PACK8_FRAMES = total(SCENES);
export const PackEight: React.FC = () => <Pack7 scenes={SCENES} label="MBNC · RECORDS DEPARTMENT" />;
