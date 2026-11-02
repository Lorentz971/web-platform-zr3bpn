// Kit commun des packs en style n° 1 (plat, fond bleu nuit, logos).
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as SI from 'simple-icons';
import {CL, FONT, K, T} from '../flat/flat';
export {CL, FONT, K, T};

type Icon = {hex: string; path: string};
export const B: Record<string, Icon> = {
  apple: SI.siApple, netflix: SI.siNetflix, spotify: SI.siSpotify, youtube: SI.siYoutube, nike: SI.siNike, adidas: SI.siAdidas,
  cocacola: SI.siCocacola, mcdonalds: SI.siMcdonalds, burgerking: SI.siBurgerking, tesla: SI.siTesla,
  playstation: SI.siPlaystation, nintendo: SI.siNintendo, starbucks: SI.siStarbucks, ferrari: SI.siFerrari, samsung: SI.siSamsung,
  google: SI.siGoogle, amazon: SI.siAmazon, airbnb: SI.siAirbnb, redbull: SI.siRedbull, tiktok: SI.siTiktok, instagram: SI.siInstagram,
  x: SI.siX, facebook: SI.siFacebook, snapchat: SI.siSnapchat, twitch: SI.siTwitch, uber: SI.siUber, bmw: SI.siBmw, mercedes: SI.siMercedes,
  porsche: SI.siPorsche, lamborghini: SI.siLamborghini, visa: SI.siVisa, mastercard: SI.siMastercard, ikea: SI.siIkea,
};
export const NAME: Record<string, string> = {
  apple: 'APPLE', netflix: 'NETFLIX', spotify: 'SPOTIFY', youtube: 'YOUTUBE', nike: 'NIKE', adidas: 'ADIDAS', cocacola: "COCA-COLA",
  mcdonalds: "McDONALD'S", burgerking: 'BURGER KING', tesla: 'TESLA', playstation: 'PLAYSTATION', nintendo: 'NINTENDO', starbucks: 'STARBUCKS',
  ferrari: 'FERRARI', samsung: 'SAMSUNG', google: 'GOOGLE', amazon: 'AMAZON', airbnb: 'AIRBNB', redbull: 'RED BULL', tiktok: 'TIKTOK',
  instagram: 'INSTAGRAM', x: 'X', facebook: 'FACEBOOK', snapchat: 'SNAPCHAT', twitch: 'TWITCH', uber: 'UBER', bmw: 'BMW', mercedes: 'MERCEDES',
  porsche: 'PORSCHE', lamborghini: 'LAMBORGHINI', visa: 'VISA', mastercard: 'MASTERCARD', ikea: 'IKEA',
};
const DARK = ['apple', 'nike', 'adidas', 'tiktok', 'x', 'uber', 'porsche', 'lamborghini', 'mercedes'];
export const col = (b: string) => (DARK.includes(b) ? '#e8e4dc' : b === 'snapchat' ? '#fffc00' : `#${B[b].hex}`);

export const BG = '#101b30';
export const PANEL = '#1a2944';
export const GRID = '#2a3a58';
export const MUTED = '#3b4a66';
export const fmt = (n: number, d = 0) => n.toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d});
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const useSp = (delay = 0, damping = 14) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping}});
};

export const Logo: React.FC<{b: string; x: number; y: number; s: number}> = ({b, x, y, s}) => (
  <svg x={x - s / 2} y={y - s / 2} width={s} height={s} viewBox="0 0 24 24"><path d={B[b].path} fill={`#${B[b].hex}`} /></svg>
);
export const Badge: React.FC<{b: string; x: number; y: number; r: number; scale?: number}> = ({b, x, y, r, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle r={r} fill="#fbf7ee" />
    <Logo b={b} x={0} y={0} s={r * 1.24} />
  </g>
);
export const Txt: React.FC<{x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; w?: number; o?: number; ls?: number; children: React.ReactNode}> = ({
  x, y, s = 24, c = K.white, a = 'start', w = 800, o = 1, ls = 1, children,
}) => (
  <text x={x} y={y} fontFamily={FONT} fontWeight={w} fontSize={s} fill={c} textAnchor={a} opacity={o} letterSpacing={ls}>{children}</text>
);
export const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>{children}</svg>
);

export const Head: React.FC<{n: string; title: string; accent?: string; note?: string}> = ({n, title, accent, note = 'ILLUSTRATIVE DATA'}) => {
  const s = useSp(0, 16);
  return (
    <>
      <div style={{position: 'absolute', left: 80, top: 56, transform: `translateX(${(1 - s) * -60}px)`, opacity: s}}>
        <div style={{display: 'inline-block', fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: BG, background: K.accent, padding: '6px 14px', borderRadius: 6}}>{n}</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 56, color: K.white, marginTop: 12, letterSpacing: 1}}>
          {title} {accent && <span style={{color: K.accent2}}>{accent}</span>}
        </div>
      </div>
      {note && <div style={{position: 'absolute', right: 60, bottom: 36, fontFamily: FONT, fontWeight: 600, fontSize: 18, letterSpacing: 3, color: K.dim, opacity: 0.8}}>{note}</div>}
    </>
  );
};

const Fade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, 8, dur - 8, dur], [0, 1, 1, 0], CL)}}>{children}</AbsoluteFill>;
};

// Assemble une suite de scènes avec fond, nappe sonore, transitions
export type Scene = [React.FC, number];
export const total = (s: Scene[]) => s.reduce((a, [, d]) => a + d, 0);
export const Pack1: React.FC<{scenes: Scene[]; bed?: string}> = ({scenes, bed = 'data/bed.wav'}) => {
  let at = 0;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, ${PANEL} 0%, ${BG} 70%)`}}>
      <Audio src={staticFile(bed)} volume={0.55} loop />
      {scenes.map(([C, d], i) => {
        const from = at;
        at += d;
        return (
          <React.Fragment key={i}>
            <Sequence from={from} durationInFrames={d}><Fade dur={d}><C /></Fade></Sequence>
            {i > 0 && <Sequence from={from - 6} durationInFrames={20}><Audio src={staticFile('data/whoosh.wav')} volume={0.3} /></Sequence>}
            <Sequence from={from + 10} durationInFrames={10}><Audio src={staticFile('data/pop.wav')} volume={0.45} /></Sequence>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// Titre de pack
export const PackTitle: (n: string, title: string, sub: string) => React.FC = (n, title, sub) => () => {
  const s = useSp(4, 12);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT}}>
      <div style={{fontWeight: 800, fontSize: 26, letterSpacing: 8, color: K.accent}}>{n}</div>
      <div style={{fontWeight: 900, fontSize: 104, color: K.white, transform: `scale(${s})`, lineHeight: 1.05, marginTop: 10}}>{title}</div>
      <div style={{fontWeight: 600, fontSize: 30, letterSpacing: 5, color: K.dim, marginTop: 18}}>{sub}</div>
    </AbsoluteFill>
  );
};
