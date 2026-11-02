// Pack 3 : parts et répartition (style n° 1). Données fictives.
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Badge, CL, col, fmt, GRID, Head, K, MUTED, NAME, Pack1, PackTitle, rnd, Scene, Svg, T, total, Txt, useSp} from './k1';

const arcPath = (cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) => {
  const p = (r: number, a: number) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${p(r1, a0)} A${r1},${r1} 0 ${large} 1 ${p(r1, a1)} L${p(r0, a1)} A${r0},${r0} 0 ${large} 0 ${p(r0, a0)} Z`;
};

// 1. Camembert
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const sl: [string, number][] = [['apple', 28], ['samsung', 24], ['google', 6], ['', 42]];
  const p = interpolate(f, [8, T(2.4)], [0, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  const ex = useSp(T(2.4), 10);
  let a = -Math.PI / 2;
  return (
    <>
      <Head n="01 · PIE CHART" title="SMARTPHONES SOLD" accent="2025" />
      <Svg>
        {sl.map(([b, v], i) => {
          const a0 = a, a1 = a + (v / 100) * Math.PI * 2 * p;
          a = a1;
          const mid = (a0 + a1) / 2, off = i === 0 ? ex * 40 : 0;
          const cx = 700 + Math.cos(mid) * off, cy = 590 + Math.sin(mid) * off;
          return (
            <g key={i}>
              <path d={arcPath(cx, cy, 0, 330, a0, Math.max(a0 + 0.001, a1))} fill={b ? col(b) : MUTED} stroke="#101b30" strokeWidth={4} />
              {b && p > 0.9 && <Badge b={b} x={cx + Math.cos(mid) * 210} y={cy + Math.sin(mid) * 210} r={40} />}
            </g>
          );
        })}
        {sl.map(([b, v], i) => (
          <g key={i} opacity={useSp(20 + i * 6)}>
            <rect x={1200} y={370 + i * 110} width={36} height={36} rx={6} fill={b ? col(b) : MUTED} />
            <Txt x={1260} y={400 + i * 110} s={36}>{b ? NAME[b] : 'OTHERS'}</Txt>
            <Txt x={1700} y={400 + i * 110} a="end" s={44} w={900} c={i === 0 ? K.accent2 : K.white}>{v}%</Txt>
          </g>
        ))}
      </Svg>
    </>
  );
};

// 2. Treemap
const S2: React.FC = () => {
  const R: [string, number, number, number, number][] = [
    ['apple', 120, 220, 700, 720], ['google', 830, 220, 520, 420], ['amazon', 1360, 220, 440, 420],
    ['samsung', 830, 650, 300, 290], ['tesla', 1140, 650, 230, 290], ['cocacola', 1380, 650, 220, 140], ['nike', 1380, 800, 220, 140], ['ikea', 1610, 650, 190, 290],
  ];
  return (
    <>
      <Head n="02 · TREEMAP" title="BRAND VALUE" accent="SHARE OF TOP 8" />
      <Svg>
        {R.map(([b, x, y, w, h], i) => {
          const g = useSp(6 + i * 4, 13);
          return (
            <g key={b} transform={`translate(${x + w / 2} ${y + h / 2}) scale(${g}) translate(${-w / 2} ${-h / 2})`}>
              <rect width={w - 8} height={h - 8} rx={14} fill={col(b)} opacity={0.92} />
              <Badge b={b} x={Math.min(w, h) * 0.22 + 10} y={Math.min(w, h) * 0.22 + 10} r={Math.min(w, h) * 0.18} />
              <Txt x={20} y={h - 30} s={Math.max(20, Math.min(w, h) * 0.12)} w={900} c={['apple', 'nike'].includes(b) ? '#101b30' : '#fff'}>{NAME[b]}</Txt>
            </g>
          );
        })}
      </Svg>
    </>
  );
};

// 3. Gaufre 10 x 10
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const lit = Math.floor(interpolate(f, [12, T(3)], [0, 37], CL));
  return (
    <>
      <Head n="03 · WAFFLE CHART" title="37 IN 100 COFFEES" accent="ARE BOUGHT HERE" />
      <Svg>
        {Array.from({length: 100}).map((_, i) => {
          const x = 480 + (i % 10) * 64, y = 270 + Math.floor(i / 10) * 64;
          const on = i < lit;
          return <rect key={i} x={x} y={y} width={56} height={56} rx={8} fill={on ? col('starbucks') : MUTED} transform={on ? `translate(${x + 28} ${y + 28}) scale(1.06) translate(${-x - 28} ${-y - 28})` : undefined} />;
        })}
        <Badge b="starbucks" x={1440} y={500} r={120} scale={useSp(8, 10)} />
        <Txt x={1440} y={760} a="middle" s={130} w={900}>{lit}%</Txt>
      </Svg>
    </>
  );
};

// 4. Sunburst
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const inner: [string, number, string][] = [['VIDEO', 45, '#ff8a3d'], ['SOCIAL', 35, '#5aa9ff'], ['MUSIC', 20, '#2ec27e']];
  const outer: [string, number][] = [['youtube', 22], ['netflix', 15], ['twitch', 8], ['instagram', 14], ['tiktok', 13], ['x', 8], ['spotify', 20]];
  const p = interpolate(f, [8, T(2.2)], [0, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  const p2 = interpolate(f, [T(1.4), T(3.2)], [0, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  let a = -Math.PI / 2, b2 = -Math.PI / 2;
  return (
    <>
      <Head n="04 · SUNBURST" title="SCREEN TIME" accent="BY APP" />
      <Svg>
        {inner.map(([n, v, c]) => {
          const a0 = a, a1 = a + (v / 100) * Math.PI * 2 * p;
          a = a1;
          const m = (a0 + a1) / 2;
          return (
            <g key={n}>
              <path d={arcPath(960, 590, 90, 240, a0, Math.max(a0 + 0.001, a1))} fill={c} stroke="#101b30" strokeWidth={4} />
              <Txt x={960 + Math.cos(m) * 165} y={598 + Math.sin(m) * 165} a="middle" s={24} w={900} c="#101b30" o={p}>{n}</Txt>
            </g>
          );
        })}
        {outer.map(([b, v]) => {
          const a0 = b2, a1 = b2 + (v / 100) * Math.PI * 2 * p2;
          b2 = a1;
          const m = (a0 + a1) / 2;
          return (
            <g key={b}>
              <path d={arcPath(960, 590, 250, 400, a0, Math.max(a0 + 0.001, a1))} fill={col(b)} opacity={0.9} stroke="#101b30" strokeWidth={4} />
              {p2 > 0.95 && <Badge b={b} x={960 + Math.cos(m) * 325} y={590 + Math.sin(m) * 325} r={34} />}
            </g>
          );
        })}
        <Txt x={960} y={600} a="middle" s={34} w={900}>{fmt(p * 6.4, 1)}H</Txt>
      </Svg>
    </>
  );
};

// 5. Barres à 100 %
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const segC = ['#5aa9ff', K.accent, K.accent2, '#9aa5b5'];
  const ages = ['13–17', '18–34', '35–54', '55+'];
  const rows: [string, number[]][] = [['tiktok', [25, 47, 21, 7]], ['instagram', [10, 55, 26, 9]], ['facebook', [4, 30, 38, 28]], ['x', [6, 48, 33, 13]], ['snapchat', [30, 50, 15, 5]]];
  const p = interpolate(f, [8, T(2.6)], [0, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  return (
    <>
      <Head n="05 · 100% STACKED BARS" title="USERS BY AGE" />
      <Svg>
        {ages.map((a, i) => <g key={a}><rect x={480 + i * 200} y={210} width={26} height={26} rx={4} fill={segC[i]} /><Txt x={516 + i * 200} y={232} s={24}>{a}</Txt></g>)}
        {rows.map(([b, segs], k) => {
          const y = 300 + k * 125;
          let x = 480;
          return (
            <g key={b}>
              <Badge b={b} x={400} y={y + 40} r={40} />
              {segs.map((v, i) => {
                const w = Math.max(0, Math.min(v * 12, p * 1200 - (x - 480)));
                const el = (
                  <g key={i}>
                    <rect x={x} y={y} width={w} height={80} fill={segC[i]} />
                    {w > 60 && <Txt x={x + w / 2} y={y + 52} a="middle" s={28} w={900} c="#101b30">{v}%</Txt>}
                  </g>
                );
                x += v * 12;
                return el;
              })}
            </g>
          );
        })}
      </Svg>
    </>
  );
};

// 6. Histogramme
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const bins = [2, 5, 11, 19, 24, 18, 10, 6, 3, 2];
  const med = interpolate(f, [T(2.4), T(3.2)], [0, 1], CL);
  return (
    <>
      <Head n="06 · HISTOGRAM" title="TIME ON TIKTOK" accent="(MIN / DAY)" />
      <Svg>
        {bins.map((v, i) => {
          const g = useSp(6 + i * 3, 15);
          const h = v * 24 * g;
          return (
            <g key={i}>
              <rect x={360 + i * 120} y={880 - h} width={116} height={h} fill={i === 4 ? K.accent : '#5aa9ff'} />
              <Txt x={360 + i * 120} y={925} s={20} c={K.dim}>{i * 15}</Txt>
            </g>
          );
        })}
        <line x1={340} x2={1580} y1={880} y2={880} stroke={K.white} strokeWidth={3} />
        <line x1={360 + 4.6 * 120} x2={360 + 4.6 * 120} y1={880} y2={880 - 620 * med} stroke={K.accent2} strokeWidth={4} strokeDasharray="12 8" />
        <Txt x={380 + 4.6 * 120} y={280} s={34} c={K.accent2} o={med}>MEDIAN · 69 MIN</Txt>
        <Badge b="tiktok" x={1650} y={300} r={70} scale={useSp(4, 10)} />
      </Svg>
    </>
  );
};

// 7. Boîtes à moustaches
const S7: React.FC = () => {
  const rows: [string, number, number, number, number, number, number[]][] = [
    ['mcdonalds', 3, 5, 7, 10, 15, [22, 26]], ['burgerking', 4, 7, 9, 12, 18, [27]], ['starbucks', 2, 4, 6, 9, 14, [21, 24, 29]],
  ];
  const X = (v: number) => 520 + v * 38;
  return (
    <>
      <Head n="07 · BOX PLOT" title="WAITING TIME" accent="(MINUTES)" />
      <Svg>
        {[0, 5, 10, 15, 20, 25, 30].map((v) => <g key={v}><line x1={X(v)} x2={X(v)} y1={280} y2={900} stroke={GRID} strokeWidth={2} /><Txt x={X(v)} y={940} a="middle" s={20} c={K.dim}>{v}</Txt></g>)}
        {rows.map(([b, mn, q1, m, q3, mx, out], k) => {
          const g = useSp(8 + k * 8, 14);
          const y = 380 + k * 200;
          const L = (v: number) => X(m + (v - m) * g);
          return (
            <g key={b}>
              <Badge b={b} x={400} y={y} r={50} />
              <line x1={L(mn)} x2={L(mx)} y1={y} y2={y} stroke={K.white} strokeWidth={4} />
              <line x1={L(mn)} x2={L(mn)} y1={y - 30} y2={y + 30} stroke={K.white} strokeWidth={4} />
              <line x1={L(mx)} x2={L(mx)} y1={y - 30} y2={y + 30} stroke={K.white} strokeWidth={4} />
              <rect x={L(q1)} y={y - 55} width={L(q3) - L(q1)} height={110} rx={8} fill={col(b)} />
              <line x1={X(m)} x2={X(m)} y1={y - 55} y2={y + 55} stroke="#101b30" strokeWidth={6} />
              {out.map((o, i) => <circle key={i} cx={X(o)} cy={y} r={12 * useSp(30 + k * 8 + i * 4, 9)} fill="none" stroke={K.accent2} strokeWidth={4} />)}
            </g>
          );
        })}
      </Svg>
    </>
  );
};

// 8. Essaim de points (beeswarm)
const swarm = (vals: number[], X: (v: number) => number, r: number) => {
  const placed: [number, number][] = [];
  return vals.map((v) => {
    const x = X(v);
    let dy = 0;
    for (let k = 0; k < 200; k++) {
      const cand = k === 0 ? 0 : (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (r * 0.9);
      if (placed.every(([px, py]) => (px - x) ** 2 + (py - cand) ** 2 >= (2 * r + 2) ** 2)) {
        dy = cand;
        break;
      }
    }
    placed.push([x, dy]);
    return [x, dy];
  });
};
const SW = (['nike', 'adidas'] as const).map((b, k) => {
  const vals = Array.from({length: 45}, (_, i) => 60 + Math.pow(rnd(i + k * 100), 1.6 + k * 0.4) * 180 + rnd(i * 3 + k) * 30);
  return {b, pts: swarm(vals, (v) => 300 + (v - 50) * 5.6, 13)};
});
const S8: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Head n="08 · BEESWARM" title="SNEAKER PRICES" accent="($)" />
      <Svg>
        {[50, 100, 150, 200, 250].map((v) => <g key={v}><line x1={300 + (v - 50) * 5.6} x2={300 + (v - 50) * 5.6} y1={260} y2={900} stroke={GRID} strokeWidth={2} /><Txt x={300 + (v - 50) * 5.6} y={940} a="middle" s={20} c={K.dim}>${v}</Txt></g>)}
        {SW.map(({b, pts}, k) => {
          const cy = 430 + k * 300;
          return (
            <g key={b}>
              <Badge b={b} x={190} y={cy} r={50} />
              {pts.map(([x, dy], i) => {
                const t = interpolate(f, [6 + i * 1.2 + k * 6, 22 + i * 1.2 + k * 6], [0, 1], {...CL, easing: Easing.out(Easing.bounce)});
                return <circle key={i} cx={x} cy={cy + dy * t - (1 - t) * 300} r={13} fill={b === 'nike' ? K.accent : '#5aa9ff'} opacity={t > 0 ? 1 : 0} />;
              })}
            </g>
          );
        })}
      </Svg>
    </>
  );
};

// 9. Pyramide des âges
const S9: React.FC = () => {
  const m = [3.1, 3.3, 3.4, 3.6, 3.9, 4.1, 4.0, 3.8, 3.7, 3.6, 3.4, 3.0, 2.6, 2.1, 1.5, 0.9, 0.5];
  const w = [3.0, 3.1, 3.2, 3.4, 3.7, 4.0, 4.0, 3.9, 3.8, 3.7, 3.6, 3.3, 2.9, 2.5, 1.9, 1.3, 0.9];
  return (
    <>
      <Head n="09 · POPULATION PYRAMID" title="AGE OF THE POPULATION" />
      <Svg>
        <Txt x={760} y={250} a="end" s={30} c="#5aa9ff">MEN</Txt><Txt x={1160} y={250} s={30} c={K.accent}>WOMEN</Txt>
        {m.map((v, i) => {
          const g = useSp(4 + i * 2, 16);
          const y = 900 - i * 36;
          return (
            <g key={i}>
              <rect x={920 - v * 110 * g} y={y - 30} width={v * 110 * g} height={30} rx={4} fill="#5aa9ff" />
              <rect x={1000} y={y - 30} width={w[i] * 110 * g} height={30} rx={4} fill={K.accent} />
              <Txt x={960} y={y - 8} a="middle" s={17} c={K.dim}>{i * 5}{i === 16 ? '+' : ''}</Txt>
            </g>
          );
        })}
      </Svg>
    </>
  );
};

// 10. Courbe en cloche
const S10: React.FC = () => {
  const f = useCurrentFrame();
  const N = (x: number) => Math.exp(-((x - 7) ** 2) / (2 * 2.2 ** 2));
  const X = (h: number) => 260 + h * 100, Y = (v: number) => 880 - v * 560;
  const p = interpolate(f, [8, T(2.2)], [0, 14], {...CL, easing: Easing.inOut(Easing.quad)});
  const pts = Array.from({length: 141}, (_, i) => i / 10).filter((h) => h <= p).map((h) => `${X(h)},${Y(N(h))}`);
  const me = interpolate(f, [T(2.4), T(3.6)], [0, 11], {...CL, easing: Easing.out(Easing.cubic)});
  let cum = 0, tot = 0;
  for (let h = 0; h <= 14; h += 0.05) { tot += N(h); if (h <= me) cum += N(h); }
  return (
    <>
      <Head n="10 · BELL CURVE" title="DAILY SCREEN TIME" accent="(HOURS)" />
      <Svg>
        {pts.length > 1 && <path d={`M${X(0)},${Y(0)} L${pts.join(' L')} L${X(Math.min(p, 14))},${Y(0)} Z`} fill="#5aa9ff" opacity={0.18} />}
        {pts.length > 1 && <polyline points={pts.join(' ')} fill="none" stroke="#5aa9ff" strokeWidth={6} />}
        <defs><clipPath id="me"><rect x={0} y={0} width={X(me)} height={1080} /></clipPath></defs>
        {me > 0 && <path clipPath="url(#me)" d={`M${X(0)},${Y(0)} L${Array.from({length: 141}, (_, i) => `${X(i / 10)},${Y(N(i / 10))}`).join(' L')} L${X(14)},${Y(0)} Z`} fill={K.accent} opacity={0.55} />}
        <line x1={X(0)} x2={X(14)} y1={880} y2={880} stroke={K.white} strokeWidth={3} />
        {[0, 2, 4, 6, 8, 10, 12, 14].map((h) => <Txt key={h} x={X(h)} y={920} a="middle" s={20} c={K.dim}>{h}H</Txt>)}
        {me > 0 && (
          <g>
            <line x1={X(me)} x2={X(me)} y1={880} y2={300} stroke={K.accent2} strokeWidth={4} />
            <Txt x={X(me)} y={280} a="middle" s={32} c={K.accent2}>YOU · {fmt(me, 1)}H</Txt>
            <Txt x={X(me)} y={240} a="middle" s={26} c={K.white}>MORE THAN {Math.round((cum / tot) * 100)}% OF PEOPLE</Txt>
          </g>
        )}
      </Svg>
    </>
  );
};

const SCENES: Scene[] = [
  [PackTitle('PACK 3 · STYLE 1', 'SHARES & DISTRIBUTION', '10 NEW CHARTS'), T(2.5)],
  [S1, T(4.5)], [S2, T(4)], [S3, T(4.2)], [S4, T(4.4)], [S5, T(4.2)], [S6, T(4.2)], [S7, T(4.2)], [S8, T(4.6)], [S9, T(4)], [S10, T(4.8)],
];
export const PACK3_FRAMES = total(SCENES);
export const PackThree: React.FC = () => <Pack1 scenes={SCENES} />;
