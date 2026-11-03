// Montage fabriqué d'après un pattern mesuré (analyse_montage.py → appliquer_pattern.py).
// Toutes les décisions (plans, cadrages, zooms, transitions, sous-titres, effets, musique) sont dans montage-data.json :
// modifiez ce fichier, pas le code, pour retoucher le montage.
import React from 'react';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/montserrat/900.css';
import data from './montage-data.json';

type Clip = {src: string; nom: string; role: string; src_in: number; src_out: number; t0: number; t1: number; zoom: number; broll?: boolean; transition_entree?: {type: string; images: number}};
type Zoom = {t0: number; dur_s: number; de: number; a: number; courbe: string; plan: number};
const D: any = data;
const fps: number = D.fps;
const F = (t: number) => Math.round(t * fps);
const media = (nom: string) => staticFile('media/' + nom);

// image visible à chaque plan : l'illustration (B-roll) quand il y en a une, sinon le rush principal
const VIS: Clip[] = (D.clips as Clip[]).map((c, i) => {
  const b = (D.illustrations as any[]).find((x) => x.plan === i);
  return b ? {...c, nom: b.nom, src_in: b.src_in, src_out: b.src_out, zoom: 1, broll: true} : c;
});

const easeFor = (courbe: string) => (courbe || '').includes('ease-in') ? Easing.in(Easing.cubic) : (courbe || '').includes('constante') ? Easing.linear : Easing.out(Easing.cubic);

// zoom total d'un plan à l'instant f (cadrage fixe + punch-in animés)
const zoomAt = (clip: Clip, idx: number, f: number) => {
  if (clip.broll) return 1;
  let z = clip.zoom;
  for (const zz of D.zooms as Zoom[]) {
    if (zz.plan !== idx) continue;
    const a = F(zz.t0), b = Math.max(a + 1, F(zz.t0 + zz.dur_s));
    if (f >= a) z = interpolate(f, [a, b], [zz.de, zz.a], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeFor(zz.courbe)});
  }
  return z;
};

const grade = (): React.CSSProperties => {
  const e = D.etalonnage;
  if (!e) return {};
  return {filter: `brightness(${e.luminosite_x}) contrast(${e.contraste_x}) saturate(${e.saturation_x})`};
};

// effet d'entrée d'un plan (transition), sur ses N premières images
const entree = (typ: string, n: number, local: number, W: number): React.CSSProperties => {
  const p = Math.min(1, Math.max(0, local / Math.max(1, n)));
  const e = Easing.out(Easing.cubic)(p);
  switch (typ) {
    case 'fondu enchaîné': return {opacity: p};
    case 'glissement': return {transform: `translateX(${(1 - e) * W}px)`};
    case 'panoramique filé': return {transform: `translateX(${(1 - e) * W}px)`, filter: `blur(${Math.sin(Math.PI * p) * 18}px)`};
    case 'zoom de transition': return {transform: `scale(${1.8 - 0.8 * e})`, opacity: Math.min(1, p * 3), filter: `blur(${(1 - e) * 14}px)`};
    case 'rotation de transition': return {transform: `rotate(${(1 - e) * 90}deg) scale(${1 + (1 - e) * 0.5})`};
    case 'rideau': return {clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`};
    case 'glitch': return local < n ? {transform: `translateX(${((local * 37) % 11 - 5) * 6}px)`, filter: 'drop-shadow(8px 0 0 rgba(255,0,60,.8)) drop-shadow(-8px 0 0 rgba(0,220,255,.8))'} : {};
    default: return {};
  }
};

// effet de sortie du plan précédent, pendant que le suivant entre (panoramique filé, glissement : les deux images bougent ensemble)
const sortie = (typ: string, n: number, k: number, W: number): React.CSSProperties => {
  const p = Math.min(1, Math.max(0, k / Math.max(1, n))); const e = Easing.out(Easing.cubic)(p);
  if (typ === 'glissement') return {transform: `translateX(${-e * W}px)`};
  if (typ === 'panoramique filé') return {transform: `translateX(${-e * W}px)`, filter: `blur(${Math.sin(Math.PI * p) * 18}px)`};
  if (typ === 'zoom de transition') return {transform: `scale(${1 + e * 0.8})`, filter: `blur(${e * 14}px)`};
  return {};
};
const OVERLAP = ['fondu enchaîné', 'rideau', 'glissement', 'panoramique filé', 'zoom de transition', 'rotation de transition'];

const Plan: React.FC<{clip: Clip; idx: number; muted?: boolean; handle: number}> = ({clip, idx, muted, handle}) => {
  const f = useCurrentFrame();                     // temps local à la séquence
  const {width} = useVideoConfig();
  const fg = f + F(clip.t0) - handle;             // temps global
  const tr = clip.transition_entree;
  const nxt: Clip | undefined = VIS[idx + 1];
  const tn = nxt && nxt.transition_entree && OVERLAP.includes(nxt.transition_entree.type) ? nxt.transition_entree : undefined;
  const hn = tn ? Math.min(tn.images, F(nxt!.src_in)) : 0;
  let st: React.CSSProperties = tr ? entree(tr.type, tr.images, f, width) : {};
  if (tn && hn > 0 && fg >= F(nxt!.t0) - hn) st = {...st, ...sortie(tn.type, hn, fg - (F(nxt!.t0) - hn), width)};
  const z = zoomAt(clip, idx, fg);
  return (
    <AbsoluteFill style={{overflow: 'hidden', ...st}}>
      <AbsoluteFill style={{transform: `scale(${z})`, ...grade()}}>
        <OffthreadVideo src={media(clip.nom)} startFrom={Math.max(0, F(clip.src_in) - handle)} muted={muted}
          style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{n: number; color: string}> = ({n, color}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, n / 2, n], [0, 1, 0], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: color, opacity: o}} />;
};

const SousTitre: React.FC<{s: any}> = ({s}) => {
  const f = useCurrentFrame();
  const {height, width} = useVideoConfig();
  const st = D.style_sous_titres || {};
  const size = Math.max(24, (st.hauteur_texte_pct || 4) / 100 * height * 1.35);
  const t = s.t0 + f / fps;
  let scale = 1;
  if ((st.animation || '').includes('pop')) scale = spring({frame: f, fps, config: {damping: 9, stiffness: 180, mass: 0.6}, from: 0.6, to: 1});
  else if ((st.animation || '').includes('agrandissement')) scale = interpolate(f, [0, 5], [0.7, 1], {extrapolateRight: 'clamp'});
  const motParMot = (st.animation || '').includes('mot par mot');
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center'}}>
      <div style={{position: 'absolute', top: `${st.position_y_pct || 70}%`, transform: `translateY(-50%) scale(${scale})`, width: width * 0.9, textAlign: 'center',
        fontFamily: 'Montserrat', fontWeight: 900, fontSize: size, lineHeight: 1.1, color: 'white',
        textTransform: st.majuscules ? 'uppercase' : 'none', WebkitTextStroke: st.contour_noir ? `${Math.round(size / 9)}px black` : undefined,
        paintOrder: 'stroke fill', textShadow: st.contour_noir ? undefined : '0 3px 12px rgba(0,0,0,.7)'}}>
        {s.mots.map((m: any, i: number) => (motParMot && t < m.t0) ? null : (
          <span key={i} style={{color: i === s.mot_surligne ? D.couleur_surlignage_hex : 'white'}}>{m.w}{i < s.mots.length - 1 ? ' ' : ''}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Barre: React.FC = () => {
  const f = useCurrentFrame(); const {durationInFrames, height} = useVideoConfig();
  return <div style={{position: 'absolute', top: 0, left: 0, height: Math.max(8, height * 0.012), width: `${(f / durationInFrames) * 100}%`, background: '#ff2d2d'}} />;
};

export const PatternMontage: React.FC = () => {
  const f = useCurrentFrame();
  const clips: Clip[] = D.clips;
  const m = D.musique;
  const volMusique = (fr: number) => {
    if (!m) return 0;
    const t = fr / fps; const base = Math.pow(10, m.niveau_db / 20); const bas = Math.pow(10, (m.niveau_db - m.baisse_sous_voix_db) / 20);
    let v = base;
    for (const [a, b] of m.passages_voix) {           // baisse sous la voix, rampes de 0,15 s
      const k = Math.min(1, Math.max(0, Math.min((t - a + 0.15) / 0.15, (b + 0.15 - t) / 0.15)));
      v = Math.min(v, base + (bas - base) * k);
    }
    return v;
  };
  return (
    <AbsoluteFill style={{background: 'black'}}>
      {VIS.map((c, i) => {
        const tr = c.transition_entree; const overlap = tr && OVERLAP.includes(tr.type);
        const handle = overlap ? Math.min(tr!.images, F(c.src_in)) : 0;   // le plan entrant commence un peu avant la coupe (poignée)
        return (
          <Sequence key={'c' + i} from={F(c.t0) - handle} durationInFrames={Math.max(1, F(c.t1) - F(c.t0) + handle)}>
            <Plan clip={c} idx={i} handle={handle} muted />
          </Sequence>
        );
      })}
      {clips.filter((c) => c.role === 'A').map((c, i) => (            // la voix continue sous les illustrations
        <Sequence key={'v' + i} from={F(c.t0)} durationInFrames={Math.max(1, F(c.t1) - F(c.t0))}>
          <Audio src={media(c.nom)} startFrom={F(c.src_in)} />
        </Sequence>
      ))}
      {D.transitions.filter((t: any) => t.type === 'flash blanc' || t.type === 'fondu au noir').map((t: any, i: number) => (
        <Sequence key={'f' + i} from={F(t.t) - Math.floor(t.images / 2)} durationInFrames={Math.max(2, t.images)}>
          <Flash n={Math.max(2, t.images)} color={t.type === 'flash blanc' ? 'white' : 'black'} />
        </Sequence>
      ))}
      {D.etalonnage && D.etalonnage.vignettage > 0 ? (
        <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${Math.min(0.9, D.etalonnage.vignettage * 2.5)}) 100%)`}} />
      ) : null}
      {D.sous_titres.map((s: any, i: number) => (
        <Sequence key={'s' + i} from={F(s.t0)} durationInFrames={Math.max(1, F(s.t1) - F(s.t0))}><SousTitre s={s} /></Sequence>
      ))}
      {D.incrustations.some((o: any) => o.type === 'barre de progression') ? <Barre /> : null}
      {D.effets.map((e: any, i: number) => (
        <Sequence key={'e' + i} from={F(e.t)} durationInFrames={F(2)}><Audio src={staticFile(e.fichier)} volume={0.5} /></Sequence>
      ))}
      {m ? <Audio src={media(m.nom)} volume={(fr) => volMusique(fr)} /> : null}
    </AbsoluteFill>
  );
};
