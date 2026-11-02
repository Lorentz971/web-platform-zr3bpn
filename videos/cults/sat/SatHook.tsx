// Test de style n° 3 : cartes « satellites » animées (style GeoEarthStories), 30 s.
// Aucune image externe : le relief, la jungle et les nuages sont des textures procédurales (SVG).
import React from 'react';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

const FPS = 30;
const T = (s: number) => Math.round(s * FPS);
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FONT = '"Inter", "DejaVu Sans", sans-serif';
const ACCENT = '#ffcc4d';
const RED = '#ff5a4f';

// ---------------------------------------------------------------------------
// Projection régionale : nord de l'Amérique du Sud (100 px par degré)
// ---------------------------------------------------------------------------
const P = (lon: number, lat: number): [number, number] => [(lon + 72) * 100, (12 - lat) * 100];
const path = (pts: [number, number][], close = true) => 'M' + pts.map(([lo, la]) => P(lo, la).map((v) => v.toFixed(1)).join(',')).join(' L') + (close ? ' Z' : '');

const COAST: [number, number][] = [
  [-72, 11.8], [-70.5, 12.1], [-69.5, 11.5], [-68.2, 10.7], [-66.5, 10.6], [-64.5, 10.4], [-63, 10.7], [-62.2, 10.6], [-61.8, 10.0], [-61.0, 9.6], [-60.3, 8.9], [-59.8, 8.4], [-59.0, 7.9], [-58.5, 7.3], [-58.16, 6.85], [-57.6, 6.4], [-57.1, 6.0], [-56.0, 5.9], [-55.2, 5.9], [-54.0, 5.7], [-53.0, 5.5], [-52.2, 4.9], [-51.6, 4.2], [-51.1, 3.2], [-50.4, 1.8], [-50.0, 0.5], [-50.0, -2],
];
const NORTH_WEST: [number, number][] = [[-88, 13.5], [-86, 12.5], [-84, 11], [-83, 9.8], [-81, 8.8], [-79.5, 9.6], [-78, 9.3], [-76.8, 8.6], [-75.5, 10.5], [-74, 11.2]];
const LAND: [number, number][] = [
  ...NORTH_WEST,
  ...COAST.slice(0, -1),
  [-50, -0.5], [-48, -1], [-45, -1.5], [-41, -3], [-38, -4], [-35, -6], [-35, -25], [-70, -25], [-70, -18], [-72, -17], [-76, -14], [-79, -8], [-81, -5], [-80, 0], [-77.3, 4], [-78, 7], [-80, 7.5], [-83.5, 8.5], [-85.5, 10.5], [-87, 12],
];
const GUYANA: [number, number][] = [
  [-59.8, 8.4], [-59.0, 7.9], [-58.5, 7.3], [-58.16, 6.85], [-57.6, 6.4], [-57.1, 6.0], [-57.25, 5.0], [-57.6, 3.6], [-58.0, 2.4], [-57.0, 1.6], [-58.6, 1.25], [-59.7, 1.4], [-59.9, 2.4], [-59.7, 3.8], [-60.6, 4.8], [-61.2, 5.9], [-61.3, 6.4], [-60.6, 7.1], [-60.1, 7.9],
];
const RIVERS: [number, number][][] = [
  [[-58.6, 6.95], [-58.7, 6.0], [-58.6, 5.2], [-58.9, 4.2], [-59.0, 3.2], [-58.7, 2.3]],
  [[-61.0, 9.6], [-62.5, 8.6], [-64.0, 8.0], [-65.6, 7.6], [-66.8, 6.4], [-67.6, 5.4]],
  [[-59.25, 8.15], [-59.55, 7.95], [-59.8, 7.8], [-59.95, 7.6]],
  [[-57.1, 6.0], [-57.25, 5.0], [-57.6, 3.6], [-58.0, 2.4]],
];
const GEORGETOWN = P(-58.16, 6.8);
const JONESTOWN = P(-59.95, 7.69);
const PORT_KAITUMA = P(-59.88, 7.74);

// Caméra : images clés {centre x, centre y, zoom}
type Key = [number, number, number, number]; // [seconde, cx, cy, zoom]
const KEYS: Key[] = [
  [0, ...P(-60, 5), 0.5],
  [2, ...P(-60, 5), 0.55],
  [4.5, ...P(-58.8, 6.6), 1.0],
  [7.5, ...P(-59.2, 7.2), 1.5],
  [10.5, ...P(-59.7, 7.5), 3.2],
  [14, JONESTOWN[0] + 40, JONESTOWN[1] + 10, 9],
  [19, JONESTOWN[0] + 25, JONESTOWN[1] + 5, 11],
  [22, ...P(-59.5, 7.0), 2.0],
];
const camAt = (sec: number) => {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [s0, x0, y0, z0] = KEYS[i];
    const [s1, x1, y1, z1] = KEYS[i + 1];
    if (sec >= s0 && sec <= s1) {
      const p = Easing.inOut(Easing.cubic)((sec - s0) / (s1 - s0));
      // zoom interpolé en logarithmique pour un mouvement régulier
      const z = Math.exp(Math.log(z0) + (Math.log(z1) - Math.log(z0)) * p);
      return {cx: x0 + (x1 - x0) * p, cy: y0 + (y1 - y0) * p, z};
    }
  }
  const [, x, y, z] = KEYS[KEYS.length - 1];
  return {cx: x, cy: y, z};
};

// ---------------------------------------------------------------------------
// Monde texturé (océan, terre, fleuves, frontières, nuages)
// ---------------------------------------------------------------------------
const World: React.FC<{z: number}> = ({z}) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <defs>
        <filter id="land" x="-3000" y="-3000" width="9000" height="9000" filterUnits="userSpaceOnUse">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={6} seed={4} result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0.30 0 0 0 0.03
                    0.50 0 0 0 0.10
                    0.20 0 0 0 0.04
                    0 0 0 0 1"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="landFine" x="-3000" y="-3000" width="9000" height="9000" filterUnits="userSpaceOnUse">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={11} result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0.25 0 0 0 0.02
                    0.55 0 0 0 0.08
                    0.18 0 0 0 0.03
                    0 0 0 0 1"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="ocean" filterUnits="userSpaceOnUse" x="-3000" y="-3000" width="9000" height="9000">
          <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves={3} seed={9} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.03  0 0 0 0 0.18  0 0 0 0 0.30  0 0 0.25 0 0.0" />
        </filter>
        <filter id="clouds" filterUnits="userSpaceOnUse" x="-3000" y="-3000" width="9000" height="9000">
          <feTurbulence type="fractalNoise" baseFrequency="0.0045" numOctaves={5} seed={21} />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  4.2 0 0 0 -2.55" />
          <feGaussianBlur stdDeviation={3} />
        </filter>
        <filter id="shallow">
          <feGaussianBlur stdDeviation={14} />
        </filter>
        <linearGradient id="deep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#06233a" />
          <stop offset="1" stopColor="#0b3a57" />
        </linearGradient>
      </defs>
      <rect x={-3000} y={-3000} width={9000} height={9000} fill="url(#deep)" />
      <rect x={-3000} y={-3000} width={9000} height={9000} filter="url(#ocean)" />
      <path d={path(COAST, false)} fill="none" stroke="#3aa6b9" strokeWidth={40} opacity={0.45} filter="url(#shallow)" />
      <path d={path(LAND)} fill="#2d4a22" />
      <path d={path(LAND)} fill="#fff" filter="url(#land)" />
      <path d={path(LAND)} fill="#fff" filter="url(#landFine)" opacity={interpolate(z, [2, 7], [0, 0.65], CL)} />
      {RIVERS.map((r, i) => (
        <path key={i} d={path(r, false)} fill="none" stroke="#5b8fa8" strokeWidth={Math.max(1.2, 4 / Math.sqrt(z))} strokeLinecap="round" opacity={0.9} />
      ))}
      {/* frontières */}
      <path d={path(GUYANA)} fill="none" stroke="rgba(255,255,255,.75)" strokeWidth={2.2 / z} strokeDasharray={`${10 / z} ${7 / z}`} />
      {/* nuages qui dérivent */}
      <g transform={`translate(${frame * 1.2}, ${frame * 0.3})`} opacity={interpolate(z, [0.5, 3, 6], [0.85, 0.55, 0.15], CL)}>
        <rect x={-3000} y={-3000} width={9000} height={9000} filter="url(#clouds)" />
      </g>
    </g>
  );
};

// Clairière de Jonestown vue du ciel (toits, chemins, piste d'atterrissage de Port Kaituma)
const Settlement: React.FC<{z: number}> = ({z}) => {
  const [jx, jy] = JONESTOWN;
  const [kx, ky] = PORT_KAITUMA;
  const o = interpolate(z, [3, 6], [0, 1], CL);
  return (
    <g opacity={o}>
      <path d={`M${jx - 7},${jy} C ${jx - 7},${jy - 4} ${jx - 2},${jy - 5.5} ${jx + 2},${jy - 4.5} C ${jx + 7},${jy - 3.5} ${jx + 8},${jy + 1} ${jx + 5},${jy + 3.8} C ${jx + 2},${jy + 6} ${jx - 6},${jy + 5} ${jx - 7},${jy} Z`} fill="#7d6b47" />
      <path d={`M${jx - 5},${jy} C ${jx - 5},${jy - 3} ${jx - 1},${jy - 4} ${jx + 2},${jy - 3.2} C ${jx + 5},${jy - 2.4} ${jx + 6},${jy + 0.8} ${jx + 3.6},${jy + 2.8} C ${jx + 1},${jy + 4.4} ${jx - 4.4},${jy + 3.6} ${jx - 5},${jy} Z`} fill="#9c8a5f" />
      {Array.from({length: 18}, (_, i) => (
        <rect key={i} x={jx - 4 + (i % 6) * 1.4} y={jy - 2.4 + Math.floor(i / 6) * 1.6} width={0.9} height={0.6} fill={i === 7 ? '#c9c2b0' : '#5b4a36'} />
      ))}
      <rect x={jx - 1.2} y={jy - 0.6} width={2.4} height={1.4} fill="#d8d2c2" />
      <path d={`M${jx + 5},${jy} C ${jx + 7},${jy - 1} ${kx - 3},${ky + 2} ${kx},${ky}`} stroke="#a08d62" strokeWidth={0.5} fill="none" />
      <rect x={kx - 2.2} y={ky - 0.35} width={4.4} height={0.7} fill="#9a9a90" transform={`rotate(-25 ${kx} ${ky})`} />
    </g>
  );
};

// Étiquette à taille constante, reliée à un point par une fine ligne
const Tag: React.FC<{x: number; y: number; label: string; sub?: string; dx?: number; dy?: number; at: number; color?: string; big?: boolean}> = ({x, y, label, sub, dx = 80, dy = -70, at, color = '#fff', big}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, 14], [0, 1], {...CL, easing: Easing.out(Easing.cubic)});
  if (frame < at) return null;
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <circle cx={x} cy={y} r={7} fill={color} stroke="#000" strokeOpacity={0.4} strokeWidth={2} />
        <line x1={x} y1={y} x2={x + dx * p} y2={y + dy * p} stroke={color} strokeWidth={2} />
      </svg>
      <div style={{position: 'absolute', left: dx > 0 ? x + dx + 10 : x + dx - 610, width: 600, top: y + dy - (big ? 30 : 20), textAlign: dx > 0 ? 'left' : 'right', opacity: p, fontFamily: FONT, color, textShadow: '0 2px 8px rgba(0,0,0,.85)'}}>
        <div style={{fontWeight: 800, fontSize: big ? 46 : 28, letterSpacing: big ? 6 : 1.5}}>{label}</div>
        {sub && <div style={{fontWeight: 600, fontSize: 22, opacity: 0.85}}>{sub}</div>}
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
type Cap = [number, number, string];
const CAPS: Cap[] = [
  [0, 4, 'November 1978. Northern South America.'],
  [4, 8, 'Guyana: a small country, almost entirely covered by rainforest.'],
  [8, 13, 'From the capital, Georgetown, a long journey into the jungle…'],
  [13, 19, '…to a clearing near Port Kaituma, where nearly a thousand Americans had settled.'],
  [19, 24, 'They called it Jonestown.'],
  [24, 30, 'On a single day, more than nine hundred of them died there.'],
];

const Caps: React.FC = () => {
  const frame = useCurrentFrame();
  const c = CAPS.find(([a, b]) => frame >= T(a) && frame < T(b));
  if (!c) return null;
  const o = Math.min(1, (frame - T(c[0])) / 6, (T(c[1]) - frame) / 6);
  return (
    <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', opacity: o}}>
      <span style={{fontFamily: FONT, fontWeight: 600, fontSize: 30, color: '#fff', background: 'rgba(0,0,0,.55)', padding: '8px 22px', borderRadius: 6}}>{c[2]}</span>
    </div>
  );
};

export const SAT_HOOK_FRAMES = T(30);

export const SatHook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sec = frame / FPS;
  const {cx, cy, z} = camAt(sec);
  const scr = ([x, y]: [number, number]): [number, number] => [960 + (x - cx) * z, 540 + (y - cy) * z];
  const [gx, gy] = scr(GEORGETOWN);
  const [jx, jy] = scr(JONESTOWN);
  const [kx, ky] = scr(PORT_KAITUMA);
  const [lgx, lgy] = scr(P(-59.2, 4.6));
  const route = interpolate(frame, [T(8.5), T(12.5)], [0, 1], {...CL, easing: Easing.inOut(Easing.quad)});
  const km = Math.round(route * 220);
  const guyGlow = interpolate(frame, [T(4), T(5.5), T(8), T(9.5)], [0, 1, 1, 0], CL);
  const dark = interpolate(frame, [T(23.5), T(25)], [0, 0.55], CL);
  const big = spring({frame: frame - T(24.5), fps, config: {damping: 14}});
  // point mobile sur l'itinéraire (courbe Georgetown → Jonestown)
  const rx0 = GEORGETOWN[0], ry0 = GEORGETOWN[1];
  const rx1 = JONESTOWN[0], ry1 = JONESTOWN[1];
  const qx = (rx0 + rx1) / 2 + 20, qy = (ry0 + ry1) / 2 + 60;
  const bez = (u: number): [number, number] => [(1 - u) ** 2 * rx0 + 2 * (1 - u) * u * qx + u * u * rx1, (1 - u) ** 2 * ry0 + 2 * (1 - u) * u * qy + u * u * ry1];
  const routeD = `M${rx0},${ry0} Q${qx},${qy} ${rx1},${ry1}`;
  const [mx, my] = scr(bez(route));
  return (
    <AbsoluteFill style={{background: '#02070d'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform={`translate(960,540) scale(${z}) translate(${-cx},${-cy})`}>
          <World z={z} />
          <path d={path(GUYANA)} fill={ACCENT} opacity={0.18 * guyGlow} />
          <path d={path(GUYANA)} fill="none" stroke={ACCENT} strokeWidth={4 / z} opacity={guyGlow} />
          <Settlement z={z} />
          {route > 0 && (
            <path d={routeD} fill="none" stroke={ACCENT} strokeWidth={4 / z} strokeDasharray={`${route * 400} 2000`} strokeLinecap="round" />
          )}
        </g>
      </svg>
      {/* vignettage */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
      {/* étiquettes */}
      {frame >= T(4.5) && frame < T(10) && <Tag x={lgx} y={lgy} label="GUYANA" dx={0.01} dy={0} at={T(4.8)} big />}
      {frame >= T(7.5) && frame < T(14) && <Tag x={gx} y={gy} label="GEORGETOWN" sub="Capital" dx={90} dy={60} at={T(7.6)} />}
      {route > 0 && route < 1 && (
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <circle cx={mx} cy={my} r={9} fill={ACCENT} />
        </svg>
      )}
      {route > 0 && frame < T(15) && (
        <div style={{position: 'absolute', left: 60, bottom: 130, fontFamily: FONT, color: '#fff', textShadow: '0 2px 10px #000'}}>
          <div style={{fontWeight: 600, fontSize: 24, letterSpacing: 3, opacity: 0.8}}>DISTANCE FROM THE CAPITAL</div>
          <div style={{fontWeight: 800, fontSize: 72, color: ACCENT}}>≈ {km} KM</div>
        </div>
      )}
      {frame >= T(14.5) && frame < T(23.5) && <Tag x={kx} y={ky} label="PORT KAITUMA AIRSTRIP" dx={120} dy={-110} at={T(14.6)} />}
      {frame >= T(12.5) && frame < T(23.5) && <Tag x={jx} y={jy} label="JONESTOWN" sub="Peoples Temple Agricultural Project" dx={-130} dy={90} at={T(12.6)} color={ACCENT} big />}
      {/* date en haut à gauche */}
      <div style={{position: 'absolute', left: 50, top: 40, fontFamily: FONT, color: '#fff', textShadow: '0 2px 8px #000'}}>
        <div style={{fontWeight: 800, fontSize: 30, letterSpacing: 4}}>NOV 18, 1978</div>
        <div style={{fontWeight: 600, fontSize: 20, opacity: 0.8}}>{`${(7.69).toFixed(2)}° N · ${(59.95).toFixed(2)}° W`}</div>
      </div>
      {/* échelle en bas à droite */}
      <div style={{position: 'absolute', right: 60, top: 50, fontFamily: FONT, color: '#fff', textAlign: 'right', textShadow: '0 2px 6px #000'}}>
        <div style={{width: 160, height: 6, borderLeft: '2px solid #fff', borderRight: '2px solid #fff', borderBottom: '2px solid #fff', marginLeft: 'auto'}} />
        <div style={{fontWeight: 600, fontSize: 20, marginTop: 6}}>{Math.max(1, Math.round((160 / z / 100) * 111))} km</div>
      </div>
      {/* fin : assombrissement + chiffre */}
      <AbsoluteFill style={{background: `rgba(0,0,0,${dark})`}} />
      {frame >= T(24.5) && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: big}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 200, color: RED, lineHeight: 1, textShadow: '0 6px 30px rgba(0,0,0,.6)', transform: `scale(${0.9 + 0.1 * big})`}}>909</div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 42, letterSpacing: 6, color: '#fff'}}>LIVES · ONE DAY</div>
        </AbsoluteFill>
      )}
      <Audio src={staticFile('cults/pad_dark.wav')} volume={(f) => interpolate(f, [0, T(2)], [0, 0.55], CL)} />
      <Sequence from={T(8.5)} durationInFrames={T(4)}>
        <Audio src={staticFile('cults/swish.wav')} volume={0.4} />
      </Sequence>
      <Sequence from={T(24.5)} durationInFrames={T(2)}>
        <Audio src={staticFile('cults/stamp.wav')} volume={0.8} />
      </Sequence>
      <Caps />
    </AbsoluteFill>
  );
};
