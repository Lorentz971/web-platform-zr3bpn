// Pack 4 : liens et géographie (style n° 7). Univers MBNC, données fictives.
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {CONTINENTS} from '../flat/FlatHook';
import {BLACK, CL, DIM, FAINT, Fig, House, Pack7, PackTitle7, Person, RED, RGLOW, rnd, Scene, Svg, T, total, Txt, useSp, W, WARM} from './k7';

const CONT = CONTINENTS as number[][][];

// 1. Réseau de relations (propagation)
const NODES = Array.from({length: 26}, (_, i) => {
  const a = i * 2.4, r = 80 + Math.sqrt(i) * 85;
  return [960 + Math.cos(a) * r * 1.5, 580 + Math.sin(a) * r * 0.85];
});
const EDGES: [number, number][] = [];
NODES.forEach((p, i) => {
  const d = NODES.map((q, j) => [j, (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2] as [number, number]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]);
  d.slice(0, 2).forEach(([j]) => { if (!EDGES.some(([a, b]) => (a === j && b === i))) EDGES.push([i, j]); });
});
// distance (en sauts) depuis le nœud 0
const HOPS = (() => {
  const h = NODES.map(() => 99);
  h[0] = 0;
  for (let k = 0; k < 30; k++) EDGES.forEach(([a, b]) => { h[b] = Math.min(h[b], h[a] + 1); h[a] = Math.min(h[a], h[b] + 1); });
  return h;
})();
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [6, 40], [0, 1], CL);
  const wave = interpolate(f, [T(1.6), T(4.4)], [0, 8], CL);
  return (
    <>
      <Svg>
        {EDGES.map(([a, b], i) => {
          const red = HOPS[a] < wave && HOPS[b] < wave;
          const [x1, y1] = NODES[a], [x2, y2] = NODES[b];
          return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * draw} y2={y1 + (y2 - y1) * draw} stroke={red ? RED : DIM} strokeWidth={red ? 4 : 2} />;
        })}
        {NODES.map(([x, y], i) => {
          const red = HOPS[i] < wave;
          return <g key={i} style={red ? {filter: RGLOW} : undefined}><Person x={x} y={y + 22} s={0.36 * useSp(i, 12)} color={red ? RED : W} /></g>;
        })}
        <Txt x={NODES[0][0]} y={NODES[0][1] + 60} a="middle" s={18} c={RED}>PATIENT ZERO</Txt>
      </Svg>
      <Fig n="FIG. 1 · NETWORK GRAPH" title="WHO HEARD IT FROM WHOM" cap="IT SPREADS THROUGH PEOPLE WHO TALK ABOUT IT." />
    </>
  );
};

// 2. Arbre généalogique
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const G: [number, number, string, boolean][][] = [
    [[960, 300, 'ELIAS · 1921', true]],
    [[620, 520, 'MARTHA · 1950', false], [960, 520, 'JOHN · 1953', true], [1300, 520, 'RUTH · 1957', false]],
    [[480, 740, 'ANNA · 1979', false], [760, 740, 'PAUL · 1982', false], [960, 740, 'SARAH · 1985', true], [1160, 740, 'TOM · 1988', false], [1440, 740, 'YOU · 1999', false]],
  ];
  const parent = [[0, 0, 0], [0, 0, 1, 2, 2]];
  const p = interpolate(f, [6, T(2.6)], [0, 3], CL);
  return (
    <>
      <Svg>
        {G.slice(1).map((row, gi) => row.map(([x, y], i) => {
          const [px, py] = G[gi][parent[gi][i]];
          const o = Math.min(1, Math.max(0, p - gi - 0.6) * 2);
          return <path key={`${gi}-${i}`} d={`M${px},${py + 50} V${(py + y) / 2} H${x} V${y - 70}`} fill="none" stroke={DIM} strokeWidth={3} opacity={o} />;
        }))}
        {G.map((row, gi) => row.map(([x, y, n, red], i) => {
          const o = Math.min(1, Math.max(0, p - gi) * 2);
          const you = n.startsWith('YOU');
          const pulse = you ? 0.5 + 0.5 * Math.sin(f * 0.25) : 1;
          return (
            <g key={n} opacity={o}>
              <circle cx={x} cy={y - 20} r={44} fill={BLACK} stroke={red ? RED : you ? WARM : W} strokeWidth={4} style={red ? {filter: RGLOW} : undefined} opacity={you ? 0.4 + pulse * 0.6 : 1} />
              <circle cx={x} cy={y - 32} r={12} fill={red ? RED : W} />
              <path d={`M${x - 20},${y + 4} Q${x},${y - 22} ${x + 20},${y + 4}`} fill={red ? RED : W} />
              <Txt x={x} y={y + 56} a="middle" s={18} c={red ? RED : you ? WARM : W}>{n}</Txt>
              {red && <Txt x={x} y={y + 80} a="middle" s={16} c={RED}>ANSWERED</Txt>}
            </g>
          );
        }))}
      </Svg>
      <Fig n="FIG. 2 · FAMILY TREE" title="THE HOLLOWAY FAMILY" cap="ONE PERSON PER GENERATION. ALWAYS THE MIDDLE CHILD." />
    </>
  );
};

// 3. Diagramme d'accords
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const towns = ['ASHFORD', 'MILLBROOK', 'GREY HOLLOW', 'PINEVALE', 'OAKRIDGE', 'LOWMOOR'];
  const ch: [number, number, number][] = [[2, 0, 30], [2, 1, 22], [2, 3, 26], [2, 4, 14], [2, 5, 18], [0, 1, 6], [3, 4, 5], [1, 5, 4], [0, 4, 3]];
  const cx = 960, cy = 580, R = 320;
  const ang = (i: number) => (i / 6) * Math.PI * 2 - Math.PI / 2;
  const P = (a: number, r = R) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  const arc = useSp(4, 20);
  return (
    <>
      <Svg>
        {towns.map((t, i) => {
          const a0 = ang(i) - 0.42 * arc, a1 = ang(i) + 0.42 * arc;
          const [x0, y0] = P(a0, R + 14), [x1, y1] = P(a1, R + 14);
          const [lx, ly] = P(ang(i), R + 115);
          const red = i === 2;
          return (
            <g key={t}>
              <path d={`M${x0},${y0} A${R + 14},${R + 14} 0 0 1 ${x1},${y1}`} fill="none" stroke={red ? RED : W} strokeWidth={22} style={red ? {filter: RGLOW} : undefined} />
              <Txt x={lx} y={ly + 8} a="middle" s={22} c={red ? RED : W}>{t}</Txt>
            </g>
          );
        })}
        {ch.map(([a, b, v], i) => {
          const o = interpolate(f, [16 + i * 5, 26 + i * 5], [0, 1], CL);
          const w = v * 0.012;
          const [a1x, a1y] = P(ang(a) - w), [a2x, a2y] = P(ang(a) + w), [b1x, b1y] = P(ang(b) - w), [b2x, b2y] = P(ang(b) + w);
          const red = a === 2;
          return <path key={i} d={`M${a1x},${a1y} Q${cx},${cy} ${b2x},${b2y} L${b1x},${b1y} Q${cx},${cy} ${a2x},${a2y} Z`} fill={red ? RED : W} opacity={o * (red ? 0.45 : 0.18)} />;
        })}
      </Svg>
      <Fig n="FIG. 3 · CHORD DIAGRAM" title="WHERE THE CALLERS MOVED" cap="EVERY FAMILY THAT LEFT GREY HOLLOW BROUGHT IT WITH THEM." />
    </>
  );
};

// 4. Venn
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const C: [number, number, string, number][] = [[820, 500, 'HEARD A VOICE', 412], [1100, 500, 'SAW LIGHTS', 288], [960, 720, 'LOST TIME', 157]];
  const mid = useSp(T(2), 8);
  return (
    <>
      <Svg>
        {C.map(([x, y, n, v], i) => {
          const g = useSp(6 + i * 8, 12);
          const [lx, ly] = [[560, 330], [1360, 330], [960, 1000]][i];
          return (
            <g key={n}>
              <circle cx={x} cy={y} r={230 * g} fill={W} fillOpacity={0.06} stroke={W} strokeWidth={4} />
              <Txt x={lx} y={ly} a="middle" s={26} o={g}>{n}</Txt>
              <Txt x={lx} y={ly + 34} a="middle" s={22} c={DIM} o={g}>{v} PEOPLE</Txt>
            </g>
          );
        })}
        <g style={{filter: RGLOW}} transform={`translate(960 580) scale(${mid})`}>
          <circle r={56} fill={RED} opacity={0.35} />
          <Txt x={0} y={14} a="middle" s={44} big c={W}>23</Txt>
        </g>
        <Txt x={1380} y={600} s={22} c={RED} o={mid}>ALL THREE: 23 PEOPLE</Txt>
        <Txt x={1380} y={634} s={18} c={DIM} o={mid}>NONE OF THEM REMEMBER IT</Txt>
      </Svg>
      <Fig n="FIG. 4 · VENN DIAGRAM" title="SYMPTOMS" />
    </>
  );
};

// Carte fictive du comté : quartiers en polygones irréguliers
const GX = 9, GY = 6;
const VERT = Array.from({length: (GX + 1) * (GY + 1)}, (_, i) => {
  const x = i % (GX + 1), y = Math.floor(i / (GX + 1));
  const jx = x === 0 || x === GX ? 0 : (rnd(i) - 0.5) * 80, jy = y === 0 || y === GY ? 0 : (rnd(i + 50) - 0.5) * 70;
  return [360 + x * 135 + jx, 260 + y * 110 + jy];
});
const CELLS = Array.from({length: GX * GY}, (_, k) => {
  const x = k % GX, y = Math.floor(k / GX);
  const v = (a: number, b: number) => VERT[b * (GX + 1) + a];
  const d = Math.hypot(x - 1.5, y - 1.2);
  return {pts: [v(x, y), v(x + 1, y), v(x + 1, y + 1), v(x, y + 1)], val: Math.max(0, 1 - d / 7.5) * 0.9 + rnd(k + 9) * 0.15};
});
const CountyMap: React.FC<{fill: (c: (typeof CELLS)[number], i: number) => [string, number]}> = ({fill}) => (
  <>
    {CELLS.map((c, i) => {
      const [col, o] = fill(c, i);
      return <polygon key={i} points={c.pts.map((p) => p.join(',')).join(' ')} fill={col} fillOpacity={o} stroke={DIM} strokeWidth={2} />;
    })}
    {/* forêt au nord-ouest */}
    {Array.from({length: 18}).map((_, i) => {
      const x = 380 + rnd(i) * 300, y = 280 + rnd(i + 7) * 180;
      return <path key={i} d={`M${x},${y} l-14,30 h28 Z`} fill="none" stroke={W} strokeWidth={2} opacity={0.6} />;
    })}
  </>
);

// 5. Carte colorée (choroplèthe)
const S5: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Svg>
        <CountyMap fill={(c, i) => {
          const o = interpolate(f, [8 + (i % GX) * 3 + Math.floor(i / GX) * 3, 20 + (i % GX) * 3 + Math.floor(i / GX) * 3], [0, 1], CL);
          return [c.val > 0.7 ? RED : W, (c.val > 0.7 ? 0.75 : c.val * 0.55) * o];
        }} />
        <Txt x={1620} y={300} s={20} c={DIM}>CALLS / 1,000</Txt>
        {[0.1, 0.3, 0.5, 0.8].map((v, i) => <g key={v}><rect x={1620} y={320 + i * 44} width={34} height={34} fill={v > 0.7 ? RED : W} fillOpacity={v > 0.7 ? 0.75 : v * 0.55} stroke={DIM} /><Txt x={1668} y={344 + i * 44} s={18}>{['< 2', '2–5', '5–10', '> 10'][i]}</Txt></g>)}
      </Svg>
      <Fig n="FIG. 5 · CHOROPLETH MAP" title="CALLS BY DISTRICT" cap="THE CLOSER TO THE OLD FOREST, THE DARKER THE MAP." />
    </>
  );
};

// Projection du monde (équirectangulaire) dans un rectangle
const MX = 160, MY = 230, MW = 1600, MH = 800;
const pj = (lon: number, lat: number) => [MX + ((lon + 180) / 360) * MW, MY + ((90 - lat) / 180) * MH];
const World: React.FC<{o?: number}> = ({o = 1}) => (
  <g opacity={o}>{CONT.map((c, i) => <path key={i} d={'M' + c.map(([a, b]) => pj(a, b).join(',')).join(' L') + ' Z'} fill="none" stroke={W} strokeWidth={2.5} />)}</g>
);

// 6. Flèches de flux
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const O = [-72, 44];
  const D: [number, number, string][] = [[2, 48, 'PARIS'], [139, 36, 'TOKYO'], [-46, -23, 'SÃO PAULO'], [151, -33, 'SYDNEY'], [28, -26, 'JOHANNESBURG'], [-122, 37, 'SAN FRANCISCO'], [37, 55, 'MOSCOW'], [77, 28, 'DELHI']];
  const [ox, oy] = pj(O[0], O[1]);
  return (
    <>
      <Svg>
        <World o={0.55} />
        {D.map(([lo, la, n], i) => {
          const [x, y] = pj(lo, la);
          const t = interpolate(f, [10 + i * 8, 40 + i * 8], [0, 1], {...CL, easing: Easing.inOut(Easing.quad)});
          const mx = (ox + x) / 2, my = Math.min(oy, y) - 120 - Math.abs(x - ox) * 0.12;
          const pts = Array.from({length: 31}, (_, k) => k / 30).filter((s) => s <= t).map((s) => [(1 - s) ** 2 * ox + 2 * (1 - s) * s * mx + s * s * x, (1 - s) ** 2 * oy + 2 * (1 - s) * s * my + s * s * y]);
          return (
            <g key={n}>
              <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={RED} strokeWidth={3} style={{filter: RGLOW}} />
              {t >= 1 && <><circle cx={x} cy={y} r={7} fill={RED} /><Txt x={x} y={y - 16} a="middle" s={16}>{n}</Txt></>}
            </g>
          );
        })}
        <circle cx={ox} cy={oy} r={12} fill={RED} style={{filter: RGLOW}} />
        <Txt x={ox} y={oy + 40} a="middle" s={18} c={RED}>GREY HOLLOW</Txt>
      </Svg>
      <Fig n="FIG. 6 · FLOW MAP" title="THE RECORDING SPREAD" cap="THE TAPE WAS COPIED. AND COPIED AGAIN." />
    </>
  );
};

// 7. Zoom pays → ville → maison
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [12, T(3.4)], [0, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  const s = Math.pow(60, z);
  const [tx, ty] = pj(-72, 44);
  const town = interpolate(z, [0.55, 0.75], [0, 1], CL);
  const house = interpolate(f, [T(3.4), T(3.9)], [0, 1], CL);
  return (
    <>
      <Svg>
        <g transform={`translate(960 600) scale(${s}) translate(${-tx} ${-ty})`} opacity={1 - town}>
          <World />
          <circle cx={tx} cy={ty} r={6 / Math.sqrt(s)} fill={RED} />
        </g>
        <g opacity={town} transform={`translate(960 600) scale(${0.4 + town * 0.6 + house * 0.4}) translate(-960 -600)`}>
          {Array.from({length: 14}).map((_, i) => <line key={`h${i}`} x1={200} x2={1720} y1={180 + i * 66} y2={180 + i * 66 + (rnd(i) - 0.5) * 40} stroke={FAINT} strokeWidth={i % 4 ? 2 : 8} />)}
          {Array.from({length: 20}).map((_, i) => <line key={`v${i}`} x1={240 + i * 76} x2={240 + i * 76 + (rnd(i + 3) - 0.5) * 60} y1={160} y2={1040} stroke={FAINT} strokeWidth={i % 5 ? 2 : 8} />)}
          <rect x={940} y={580} width={40} height={40} fill="none" stroke={RED} strokeWidth={3} />
        </g>
        <g opacity={house}><House x={960} y={680} s={0.55} /><circle cx={960} cy={590} r={150} fill="none" stroke={RED} strokeWidth={3} style={{filter: RGLOW}} /></g>
        <Txt x={1500} y={300} s={22} c={DIM} o={1 - town}>NORTH AMERICA</Txt>
        <Txt x={1500} y={300} s={22} c={DIM} o={town * (1 - house)}>GREY HOLLOW</Txt>
        <Txt x={1500} y={300} s={22} c={RED} o={house}>14 ELM STREET</Txt>
      </Svg>
      <Fig n="FIG. 7 · ZOOM: COUNTRY → TOWN → HOUSE" title="PRIMARY LOCATION" />
    </>
  );
};

// 8. Globe qui tourne
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const cx = 960, cy = 590, R = 360;
  const lon0 = -150 + f * 1.4, lat0 = 20;
  const rad = Math.PI / 180;
  const proj = (lon: number, lat: number) => {
    const l = (lon - lon0) * rad, p = lat * rad, p0 = lat0 * rad;
    const x = Math.cos(p) * Math.sin(l), y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l);
    const vis = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
    const k = vis < 0 ? 1 / Math.hypot(x, y) : 1;
    return [cx + x * R * k, cy - y * R * k, vis];
  };
  const line = (pts: number[][]) => pts.map((p) => proj(p[0], p[1]));
  const [hx, hy, hv] = proj(-72, 44);
  return (
    <>
      <Svg>
        <circle cx={cx} cy={cy} r={R} fill={BLACK} stroke={W} strokeWidth={4} />
        {Array.from({length: 12}).map((_, i) => {
          const pts = line(Array.from({length: 37}, (_, k) => [i * 30, -90 + k * 5])).filter((p) => p[2] > 0);
          return <polyline key={`m${i}`} points={pts.map((p) => `${p[0]},${p[1]}`).join(' ')} fill="none" stroke={FAINT} strokeWidth={1.5} />;
        })}
        {[-60, -30, 0, 30, 60].map((la) => {
          const pts = line(Array.from({length: 73}, (_, k) => [k * 5, la])).filter((p) => p[2] > 0);
          return <polyline key={`p${la}`} points={pts.map((p) => `${p[0]},${p[1]}`).join(' ')} fill="none" stroke={FAINT} strokeWidth={1.5} />;
        })}
        {CONT.map((c, i) => {
          const pts = line(c);
          if (pts.every((p) => p[2] < 0)) return null;
          return <polygon key={i} points={pts.map((p) => `${p[0]},${p[1]}`).join(' ')} fill={W} fillOpacity={0.08} stroke={W} strokeWidth={2.5} />;
        })}
        {hv > 0 && <g style={{filter: RGLOW}}><circle cx={hx} cy={hy} r={10} fill={RED} /><circle cx={hx} cy={hy} r={10 + ((f * 1.5) % 40)} fill="none" stroke={RED} strokeWidth={2} opacity={1 - ((f * 1.5) % 40) / 40} /></g>}
      </Svg>
      <Fig n="FIG. 8 · ROTATING GLOBE" title="ONE SIGNAL. ONE ORIGIN." />
    </>
  );
};

// 9. Chronologie sur la carte
const S9: React.FC = () => {
  const f = useCurrentFrame();
  const EV: [number, number, number][] = [[1931, 3, 1], [1948, 2, 2], [1962, 4, 2], [1977, 3, 3], [1985, 5, 3], [1994, 4, 4], [2003, 6, 4], [2011, 5, 5], [2019, 7, 5], [2025, 6, 6]];
  const cen = (c: number, r: number) => {
    const pts = CELLS[Math.min(r, GY - 1) * GX + Math.min(c, GX - 1)].pts;
    return [pts.reduce((a, p) => a + p[0], 0) / 4, pts.reduce((a, p) => a + p[1], 0) / 4];
  };
  const p = interpolate(f, [10, T(4.4)], [0, EV.length], CL);
  const year = Math.floor(interpolate(p, [0, EV.length], [1925, 2025]));
  const shown = EV.filter((_, i) => i < p);
  return (
    <>
      <Svg>
        <CountyMap fill={() => [W, 0.03]} />
        <polyline points={shown.map(([, c, r]) => cen(c, r).join(',')).join(' ')} fill="none" stroke={RED} strokeWidth={3} strokeDasharray="10 8" style={{filter: RGLOW}} />
        {shown.map(([y, c, r], i) => {
          const [x, yy] = cen(c, r);
          const last = i === shown.length - 1;
          return (
            <g key={y}>
              <circle cx={x} cy={yy} r={last ? 14 : 9} fill={RED} style={{filter: RGLOW}} />
              <Txt x={x + 16} y={yy - 12} s={18} c={last ? W : DIM}>{y}</Txt>
            </g>
          );
        })}
        <House x={cen(6, 5)[0] + 70} y={cen(6, 5)[1] + 40} s={0.16} />
        <Txt x={1620} y={360} s={80} big c={W}>{year}</Txt>
      </Svg>
      <Fig n="FIG. 9 · MAP TIMELINE" title="IT IS MOVING TOWARD TOWN" cap="ABOUT ONE DISTRICT EVERY TEN YEARS. IT IS NOW ON ELM STREET." />
    </>
  );
};

const SCENES: Scene[] = [
  [PackTitle7('PACK 4 · STYLE 7 · MBNC ARCHIVE', 'LINKS & MAPS', '9 VISUALS · ALL DATA FICTIONAL'), T(2.6)],
  [S1, T(5)], [S2, T(4.8)], [S3, T(4.6)], [S4, T(4.4)], [S5, T(4.4)], [S6, T(5)], [S7, T(5)], [S8, T(4.6)], [S9, T(5.4)],
];
export const PACK4_FRAMES = total(SCENES);
export const PackFour: React.FC = () => <Pack7 scenes={SCENES} label="MBNC · STATISTICAL BULLETIN 09" />;
