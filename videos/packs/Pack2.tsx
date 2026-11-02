// Pack 2 : évolution (style n° 7). Univers MBNC, données fictives.
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {BLACK, CL, DIM, FAINT, Fig, Pack7, PackTitle7, RED, RGLOW, rnd, Scene, Svg, T, total, Txt, useSp, W} from './k7';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const Clip: React.FC<{id: string; w: number}> = ({id, w}) => <defs><clipPath id={id}><rect x={0} y={0} width={w} height={1080} /></clipPath></defs>;

// 1. Aires empilées
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const L = [
    [4, 5, 4, 6, 5, 7, 6, 8, 9, 12, 10, 9],
    [3, 3, 4, 3, 5, 4, 6, 5, 7, 8, 9, 8],
    [1, 1, 2, 2, 3, 4, 6, 8, 11, 16, 20, 26],
  ];
  const X = (i: number) => 260 + i * 125, Y = (v: number) => 880 - v * 10;
  const rev = interpolate(f, [10, T(3.5)], [240, 1700], {...CL, easing: Easing.inOut(Easing.quad)});
  const acc = MONTHS.map(() => 0);
  const names = ['KNOCKING', 'LIGHTS', 'VOICES'];
  return (
    <>
      <Svg>
        <Clip id="c21" w={rev} />
        <g clipPath="url(#c21)">
          {L.map((vals, k) => {
            const lo = acc.slice();
            vals.forEach((v, i) => (acc[i] += v));
            const top = acc.map((v, i) => `${X(i)},${Y(v)}`).join(' L');
            const bot = lo.map((v, i) => `${X(i)},${Y(v)}`).reverse().join(' L');
            const red = k === 2;
            return (
              <g key={k}>
                <path d={`M${top} L${bot} Z`} fill={red ? RED : W} opacity={red ? 0.45 : 0.08 + k * 0.08} />
                <polyline points={acc.map((v, i) => `${X(i)},${Y(v)}`).join(' ')} fill="none" stroke={red ? RED : W} strokeWidth={3} style={red ? {filter: RGLOW} : undefined} />
              </g>
            );
          })}
        </g>
        {MONTHS.map((m, i) => <Txt key={m} x={X(i)} y={920} a="middle" s={18} c={DIM}>{m}</Txt>)}
        <line x1={240} x2={1660} y1={880} y2={880} stroke={W} strokeWidth={3} />
        {names.map((n, k) => (
          <g key={n}><rect x={1480} y={300 + k * 40} width={22} height={22} fill={k === 2 ? RED : W} opacity={k === 2 ? 0.8 : 0.2 + k * 0.15} /><Txt x={1514} y={318 + k * 40} s={20} c={k === 2 ? RED : W}>{n}</Txt></g>
        ))}
      </Svg>
      <Fig n="FIG. 1 · STACKED AREA" title="REPORTS BY TYPE" cap="KNOCKING AND LIGHTS STAY THE SAME. THE VOICES DO NOT." />
    </>
  );
};

// 2. Courbe en escalier
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const lv = [1, 1, 2, 2, 2, 3, 2, 3, 4, 4, 5, 5, 3, 4, 5];
  const X = (i: number) => 300 + i * 90, Y = (v: number) => 860 - v * 100;
  const p = interpolate(f, [10, T(3.6)], [0, lv.length - 1], CL);
  const n = Math.floor(p);
  let d = `M${X(0)},${Y(lv[0])}`;
  for (let i = 1; i <= n; i++) d += ` H${X(i)} V${Y(lv[i])}`;
  d += ` H${X(n) + (p - n) * 90}`;
  const cur = lv[n];
  return (
    <>
      <Svg>
        {[1, 2, 3, 4, 5].map((v) => (
          <g key={v}>
            <line x1={280} x2={1640} y1={Y(v)} y2={Y(v)} stroke={v === 5 ? RED : FAINT} strokeWidth={v === 5 ? 2 : 1.5} strokeDasharray="6 8" />
            <Txt x={260} y={Y(v) + 7} a="end" s={20} c={v === 5 ? RED : DIM}>LV {v}</Txt>
          </g>
        ))}
        <path d={d} fill="none" stroke={cur >= 5 ? RED : W} strokeWidth={5} style={cur >= 5 ? {filter: RGLOW} : undefined} />
        <circle cx={X(n) + (p - n) * 90} cy={Y(cur)} r={10} fill={cur >= 5 ? RED : W} />
        <Txt x={300} y={920} s={18} c={DIM}>DAY 1</Txt><Txt x={X(14)} y={920} a="end" s={18} c={DIM}>DAY 15</Txt>
        <rect x={1500} y={200} width={200} height={90} fill="none" stroke={cur >= 5 ? RED : W} strokeWidth={3} />
        <Txt x={1600} y={265} a="middle" s={48} big c={cur >= 5 ? RED : W}>LV {cur}</Txt>
      </Svg>
      <Fig n="FIG. 2 · STEP LINE" title="CURFEW LEVEL" cap="LEVEL 5 MEANS: STAY AWAY FROM ALL WINDOWS." />
    </>
  );
};

// 3. Bump chart (évolution des rangs)
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const towns = ['ASHFORD', 'MILLBROOK', 'GREY HOLLOW', 'PINEVALE', 'OAKRIDGE', 'LOWMOOR'];
  const R = [[0, 1, 1, 2, 3, 3], [1, 0, 0, 0, 1, 2], [5, 5, 4, 3, 2, 0], [2, 2, 3, 1, 0, 1], [3, 4, 2, 4, 4, 4], [4, 3, 5, 5, 5, 5]];
  const X = (i: number) => 520 + i * 210, Y = (r: number) => 280 + r * 110;
  const p = interpolate(f, [10, T(4)], [0, 5], {...CL, easing: Easing.inOut(Easing.quad)});
  return (
    <>
      <Svg>
        {[2020, 2021, 2022, 2023, 2024, 2025].map((y, i) => <Txt key={y} x={X(i)} y={940} a="middle" s={20} c={i <= p ? W : DIM}>{y}</Txt>)}
        {R.map((rs, k) => {
          const red = k === 2;
          const n = Math.floor(p), fr = p - n;
          const pts = rs.slice(0, n + 1).map((r, i) => [X(i), Y(r)]);
          if (n < 5) pts.push([X(n) + fr * 210, Y(rs[n] + (rs[n + 1] - rs[n]) * Easing.inOut(Easing.cubic)(fr))]);
          const tip = pts[pts.length - 1];
          return (
            <g key={k}>
              <Txt x={490} y={Y(rs[0]) + 8} a="end" s={22} c={red ? RED : DIM}>{towns[k]}</Txt>
              <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke={red ? RED : W} strokeWidth={red ? 8 : 4} opacity={red ? 1 : 0.4} style={red ? {filter: RGLOW} : undefined} />
              <circle cx={tip[0]} cy={tip[1]} r={red ? 16 : 11} fill={red ? RED : W} />
            </g>
          );
        })}
        <Txt x={X(5) + 40} y={Y(0) + 8} s={26} c={RED} o={interpolate(f, [T(4), T(4.3)], [0, 1], CL)}>#1</Txt>
      </Svg>
      <Fig n="FIG. 3 · BUMP CHART" title="TOWN RANKING · MOST CALLS" cap="GREY HOLLOW WENT FROM LAST PLACE TO FIRST IN FIVE YEARS." />
    </>
  );
};

// 4. Sparklines
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const rows = ['SENSOR 01 · NORTH GATE', 'SENSOR 02 · CREEK', 'SENSOR 03 · CHAPEL', 'SENSOR 04 · TREE LINE', 'SENSOR 05 · SCHOOL', 'SENSOR 06 · YOUR STREET'];
  const p = interpolate(f, [10, T(3.4)], [0, 1], CL);
  return (
    <>
      <Svg>
        {rows.map((r, k) => {
          const y = 300 + k * 100;
          const dead = k === 5;
          const n = Math.floor(p * 60);
          const pts = Array.from({length: n + 1}, (_, i) => {
            const v = dead && i > 38 ? 0 : Math.sin(i * 0.5 + k) * 14 + (rnd(i + k * 70) - 0.5) * 22;
            return `${780 + i * 13},${y + 30 - v}`;
          });
          const flat = dead && n > 38;
          return (
            <g key={r}>
              <line x1={160} x2={1760} y1={y + 70} y2={y + 70} stroke={FAINT} />
              <Txt x={160} y={y + 38} s={22} c={flat ? RED : W}>{r}</Txt>
              <polyline points={pts.join(' ')} fill="none" stroke={flat ? RED : W} strokeWidth={3} style={flat ? {filter: RGLOW} : undefined} />
              <Txt x={1760} y={y + 38} a="end" s={22} c={flat ? RED : DIM}>{flat ? 'NO SIGNAL' : 'ACTIVE'}</Txt>
            </g>
          );
        })}
      </Svg>
      <Fig n="FIG. 4 · SPARKLINES" title="SENSOR NETWORK" cap="WHEN A SENSOR GOES SILENT, IT IS NOT BROKEN." />
    </>
  );
};

// 5. Bougies (bourse)
const S5: React.FC = () => {
  const f = useCurrentFrame();
  let v = 300;
  const C = Array.from({length: 22}, (_, i) => {
    const o = v;
    const ch = i < 16 ? (rnd(i) - 0.35) * 22 : -(30 + rnd(i) * 40);
    v = o + ch;
    return {o, c: v, h: Math.max(o, v) + rnd(i + 5) * 14, l: Math.min(o, v) - rnd(i + 9) * 14};
  });
  const Y = (x: number) => 900 - (x - 80) * 1.6;
  const shown = interpolate(f, [8, T(3.8)], [0, 22], CL);
  return (
    <>
      <Svg>
        {[100, 200, 300, 400].map((v) => <g key={v}><line x1={280} x2={1640} y1={Y(v)} y2={Y(v)} stroke={FAINT} /><Txt x={260} y={Y(v) + 7} a="end" s={18} c={DIM}>${v}K</Txt></g>)}
        {C.map((c, i) => {
          if (i >= shown) return null;
          const g = Math.min(1, shown - i);
          const up = c.c >= c.o;
          const x = 320 + i * 60;
          const col = up ? W : RED;
          return (
            <g key={i} opacity={g}>
              <line x1={x} x2={x} y1={Y(c.h)} y2={Y(c.l)} stroke={col} strokeWidth={3} />
              <rect x={x - 18} y={Y(Math.max(c.o, c.c))} width={36} height={Math.max(4, Math.abs(Y(c.o) - Y(c.c)))} fill={up ? BLACK : RED} stroke={col} strokeWidth={3} />
            </g>
          );
        })}
        {shown > 17 && <Txt x={1320} y={250} s={26} c={RED} o={interpolate(shown, [17, 18], [0, 1], CL)}>DAY 17 · FIRST SIGHTING</Txt>}
      </Svg>
      <Fig n="FIG. 5 · CANDLESTICKS" title="HOUSE PRICES · ELM STREET" cap="AFTER THE FIRST SIGHTING, NOBODY WANTED TO BUY." />
    </>
  );
};

// 6. Streamgraph
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const N = 40;
  const layers = [0, 1, 2, 3, 4].map((k) => Array.from({length: N}, (_, i) => 20 + 30 * (0.5 + 0.5 * Math.sin(i * 0.25 + k * 1.3)) + (k === 4 ? Math.pow(i / N, 3) * 140 : 0)));
  const X = (i: number) => 200 + i * 39;
  const rev = interpolate(f, [8, T(3.6)], [180, 1760], {...CL, easing: Easing.inOut(Easing.quad)});
  const tot = Array.from({length: N}, (_, i) => layers.reduce((a, l) => a + l[i], 0));
  const acc = tot.map((t) => 600 - t / 2);
  const names = ['WIND', 'FOOTSTEPS', 'WHISTLING', 'CRYING', 'THEIR OWN NAME'];
  return (
    <>
      <Svg>
        <Clip id="c26" w={rev} />
        <g clipPath="url(#c26)">
          {layers.map((l, k) => {
            const lo = acc.slice();
            l.forEach((v, i) => (acc[i] += v));
            const top = acc.map((v, i) => `${X(i)},${v}`).join(' L');
            const bot = lo.map((v, i) => `${X(i)},${v}`).reverse().join(' L');
            const red = k === 4;
            return <path key={k} d={`M${top} L${bot} Z`} fill={red ? RED : W} opacity={red ? 0.6 : 0.07 + k * 0.07} stroke={BLACK} strokeWidth={2} style={red ? {filter: RGLOW} : undefined} />;
          })}
        </g>
        <Txt x={200} y={960} s={18} c={DIM}>1990</Txt><Txt x={X(N - 1)} y={960} a="end" s={18} c={DIM}>2025</Txt>
        {names.slice(0, 4).map((n, k) => <Txt key={n} x={210 + k * 270} y={250} s={18} c={DIM}>■ {n}</Txt>)}
        <Txt x={1290} y={250} s={18} c={RED}>■ THEIR OWN NAME</Txt>
      </Svg>
      <Fig n="FIG. 6 · STREAMGRAPH" title="WHAT PEOPLE HEAR" cap="SINCE 2010, MORE AND MORE PEOPLE HEAR THEIR OWN NAME." />
    </>
  );
};

// 7. Tableau qui se remplit
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    ['0412', '10/02', '02:51', 'KNOCKING', 'CLOSED'], ['0413', '10/05', '03:07', 'VOICE (MOTHER)', 'CLOSED'], ['0414', '10/09', '03:12', 'LIGHTS', 'CLOSED'],
    ['0415', '10/13', '03:07', 'VOICE (SPOUSE)', 'CLOSED'], ['0416', '10/21', '01:40', 'FOOTSTEPS', 'CLOSED'], ['0417', '10/27', '03:07', 'VOICE (YOU)', 'ONGOING'],
  ];
  const cols = [180, 360, 560, 760, 1340];
  const head = ['CASE', 'DATE', 'TIME', 'TYPE', 'STATUS'];
  return (
    <>
      <Svg>
        {head.map((h, i) => <Txt key={h} x={cols[i]} y={290} s={20} c={DIM}>{h}</Txt>)}
        <line x1={160} x2={1760} y1={310} y2={310} stroke={W} strokeWidth={2} />
        {rows.map((r, k) => {
          const t0 = 12 + k * 16;
          const red = r[4] === 'ONGOING';
          const y = 370 + k * 80;
          return (
            <g key={k} opacity={f > t0 ? 1 : 0}>
              {r.map((c, i) => {
                const chars = Math.floor((f - t0 - i * 2) * 1.5);
                const txt = c.slice(0, Math.max(0, chars));
                return <Txt key={i} x={cols[i]} y={y} s={26} c={red && (i === 4 || i === 3) ? RED : i === 2 && c === '03:07' ? RED : W}>{txt}</Txt>;
              })}
              <line x1={160} x2={1760} y1={y + 26} y2={y + 26} stroke={FAINT} />
              {red && f > t0 + 20 && <rect x={1320} y={y - 34} width={190} height={48} fill="none" stroke={RED} strokeWidth={3} opacity={Math.floor(f / 8) % 2 ? 1 : 0.3} style={{filter: RGLOW}} />}
            </g>
          );
        })}
      </Svg>
      <Fig n="FIG. 7 · LIVE TABLE" title="INCIDENT LOG · OCTOBER" cap="CASE 0417. THE VOICE WAS THE CALLER'S OWN." />
    </>
  );
};

const SCENES: Scene[] = [
  [PackTitle7('PACK 2 · STYLE 7 · MBNC ARCHIVE', 'OVER TIME', '7 CHARTS · ALL DATA FICTIONAL'), T(2.6)],
  [S1, T(5)], [S2, T(4.6)], [S3, T(5.2)], [S4, T(4.6)], [S5, T(4.8)], [S6, T(4.8)], [S7, T(5.6)],
];
export const PACK2_FRAMES = total(SCENES);
export const PackTwo: React.FC = () => <Pack7 scenes={SCENES} label="MBNC · STATISTICAL BULLETIN 08" />;
void useSp;
