"""Exports du plan de montage : Remotion (projet prêt à rendre), DaVinci Resolve / Final Cut (FCPXML 1.9),
Premiere / Avid / DaVinci (EDL CMX 3600), CapCut et tous logiciels (SRT, marqueurs CSV, recette pas à pas)."""
import csv, json, os, shutil
from fractions import Fraction
from xml.sax.saxutils import quoteattr, escape

COULEURS = {'vert': '#22e04a', 'jaune': '#ffe600', 'rouge': '#ff3b30', 'bleu': '#2f8cff', 'orangée': '#ff9500', 'orange': '#ff9500', 'violet': '#af52de',
            'rose': '#ff4fa3', 'cyan': '#00d5ff', 'blanc': '#ffffff', 'magenta': '#ff2bd6'}


def _hex(nom):
    if not nom: return '#ffe600'
    for k, v in COULEURS.items():
        if k in nom: return v
    return '#ffe600'


# ------------------------------------------------------------------ SRT et marqueurs
def _ts(t, sep=','):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}'


def srt(plan, path):
    st = plan.get('style_sous_titres') or {}
    with open(path, 'w', encoding='utf-8') as f:
        for i, s in enumerate(plan['sous_titres'], 1):
            txt = s['texte'].upper() if st.get('majuscules') else s['texte']
            f.write(f"{i}\n{_ts(s['t0'])} --> {_ts(s['t1'])}\n{txt}\n\n")


def marqueurs(plan, path):
    rows = []
    for i, c in enumerate(plan['clips']):
        rows.append((c['t0'], 'coupe', f"plan {i + 1} : {c['nom']} {c['src_in']:.2f}–{c['src_out']:.2f} s" + (f", cadre ×{c['zoom']}" if c['zoom'] != 1 else '')))
    for b in plan['illustrations']: rows.append((b['t0'], 'illustration', f"{b['nom']} {b['src_in']:.2f}–{b['src_out']:.2f} s par-dessus la voix, jusqu'à {b['t1']:.2f} s"))
    for t in plan['transitions']: rows.append((t['t'], 'transition', f"{t['type']} ({t['images']} images)"))
    for z in plan['zooms']: rows.append((z['t0'], 'zoom', f"punch-in ×{z['de']} → ×{z['a']} en {z['dur_s']} s sur « {z['mot']} » ({z['courbe']})"))
    for e in plan['effets']: rows.append((e['t'], 'effet sonore', e['type']))
    rows.sort()
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f); w.writerow(['temps_s', 'timecode', 'type', 'action'])
        for t, k, a in rows: w.writerow([round(t, 3), _tc(t, plan['fps']), k, a])
    return rows


# ------------------------------------------------------------------ EDL CMX 3600
def _tc(t, fps):
    f = int(round(t * fps)); fps = int(round(fps))
    return f'{f // (3600 * fps):02d}:{f // (60 * fps) % 60:02d}:{f // fps % 60:02d}:{f % fps:02d}'


def edl(plan, path_base):
    fps = plan['fps']; out = []
    for piste, items in (('V1', plan['clips']), ('V2', plan['illustrations'])):
        if not items: continue
        L = [f"TITLE: Montage selon pattern ({piste})", 'FCM: NON-DROP FRAME', '']
        for i, c in enumerate(items, 1):
            reel = os.path.splitext(c['nom'])[0][:8].upper().replace(' ', '_') or 'AX'
            L.append(f"{i:03d}  {reel:<8} {'AA/V' if piste == 'V1' else 'V':<5} C        {_tc(c['src_in'], fps)} {_tc(c['src_out'], fps)} {_tc(c['t0'], fps)} {_tc(c['t1'], fps)}")
            L.append(f"* FROM CLIP NAME: {c['nom']}")
            if c.get('zoom', 1) != 1: L.append(f"* CADRE : ZOOM {round((c['zoom'] - 1) * 100)} %")
            L.append('')
        p = f'{path_base}_{piste}.edl'; open(p, 'w').write('\n'.join(L)); out.append(p)
    return out


# ------------------------------------------------------------------ FCPXML 1.9 (DaVinci Resolve, Final Cut Pro)
def _r(t, fps):
    f = int(round(t * fps)); fr = Fraction(f * 1000, int(round(fps * 1000)))
    return f'{fr.numerator}/{fr.denominator}s' if fr.denominator != 1 else f'{fr.numerator}s'


def fcpxml(plan, path, chemins):
    """chemins : nom de fichier → chemin absolu (rushs, effets, musique)."""
    fps = plan['fps']; W, H = plan['largeur'], plan['hauteur']; R = lambda t: _r(t, fps)
    assets, ids = [], {}
    def asset(nom, dur, video=True):
        if nom in ids: return ids[nom]
        i = f'r{len(ids) + 2}'; ids[nom] = i
        uri = 'file://' + os.path.abspath(chemins[nom]).replace(' ', '%20')
        fmt = 'format="r1" ' if video else ''
        assets.append(f'    <asset id="{i}" name={quoteattr(nom)} start="0s" duration="{R(dur)}" hasVideo="{1 if video else 0}" hasAudio="1" '
                      f'{fmt}audioSources="1" audioChannels="2" audioRate="48000">\n'
                      f'      <media-rep kind="original-media" src={quoteattr(uri)}/>\n    </asset>')
        return i
    durs = {r['nom']: r['duree_s'] for r in plan['rushs']}
    spine = []
    zooms_by = {}
    for z in plan['zooms']: zooms_by.setdefault(z['plan'], []).append(z)
    for i, c in enumerate(plan['clips']):
        rid = asset(c['nom'], durs.get(c['nom'], c['src_out'] + 1))
        inner = []
        loc = lambda t: c['src_in'] + (t - c['t0'])               # temps local du clip parent
        if c['zoom'] != 1 or i in zooms_by:
            if i in zooms_by:
                kf = [f'<keyframe time="{R(c["src_in"])}" value="{c["zoom"]} {c["zoom"]}"/>']
                for z in zooms_by[i]:
                    kf += [f'<keyframe time="{R(loc(z["t0"]))}" value="{z["de"]} {z["de"]}"/>', f'<keyframe time="{R(loc(z["t0"] + z["dur_s"]))}" value="{z["a"]} {z["a"]}"/>']
                inner.append(f'        <adjust-transform><param name="scale"><keyframeAnimation>{"".join(kf)}</keyframeAnimation></param></adjust-transform>')
            else:
                inner.append(f'        <adjust-transform scale="{c["zoom"]} {c["zoom"]}"/>')
        for b in plan['illustrations']:
            if b['plan'] == i:
                bid = asset(b['nom'], durs.get(b['nom'], b['src_out'] + 1))
                inner.append(f'        <asset-clip ref="{bid}" lane="1" offset="{R(loc(b["t0"]))}" start="{R(b["src_in"])}" duration="{R(b["t1"] - b["t0"])}" name={quoteattr(b["nom"])} audioRole="effects">'
                             f'<adjust-volume amount="-96dB"/></asset-clip>')
        for e in plan['effets']:
            if c['t0'] <= e['t'] < c['t1']:
                nom = os.path.basename(e['fichier']); eid = asset(nom, 2.0, video=False)
                inner.append(f'        <asset-clip ref="{eid}" lane="-1" offset="{R(loc(e["t"]))}" start="0s" duration="{R(1.0)}" name={quoteattr(e["type"])} audioRole="effects"/>')
        for t in plan['transitions']:
            if t['plan'] == i:
                v = quoteattr('Transition : %s (%d images)' % (t['type'], t['images']))
                inner.append(f'        <marker start="{R(c["src_in"])}" duration="{R(1 / fps)}" value={v}/>')
        for z in zooms_by.get(i, []):
            v = quoteattr('Zoom ×%s → ×%s (%s)' % (z['de'], z['a'], z['courbe']))
            inner.append(f'        <marker start="{R(loc(z["t0"]))}" duration="{R(1 / fps)}" value={v}/>')
        if i == 0 and plan.get('musique'):
            m = plan['musique']; mid = asset(m['nom'], plan['duree_s'] + 1, video=False)
            inner.append(f'        <asset-clip ref="{mid}" lane="-2" offset="{R(c["src_in"])}" start="0s" duration="{R(plan["duree_s"])}" name={quoteattr(m["nom"])} audioRole="music">'
                         f'<adjust-volume amount="{m["niveau_db"]}dB"/></asset-clip>')
        spine.append(f'      <asset-clip ref="{rid}" offset="{R(c["t0"])}" start="{R(c["src_in"])}" duration="{R(c["t1"] - c["t0"])}" name={quoteattr(c["nom"])}' +
                     ('>\n' + '\n'.join(inner) + '\n      </asset-clip>' if inner else '/>'))
    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
    <format id="r1" name="FFVideoFormatRateUndefined" frameDuration="{_r(1 / fps, fps)}" width="{W}" height="{H}"/>
{chr(10).join(assets)}
  </resources>
  <library>
    <event name="Pattern de montage">
      <project name="Montage selon pattern">
        <sequence format="r1" duration="{R(plan['duree_s'])}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
{chr(10).join(spine)}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
'''
    open(path, 'w', encoding='utf-8').write(xml)


# ------------------------------------------------------------------ CapCut (et tout logiciel) : recette pas à pas
def recette_md(plan, path, rows):
    R = plan['recette']; st = plan.get('style_sous_titres') or {}; et = plan.get('etalonnage') or {}
    L = [f"# Recette de montage — d'après {plan['pattern_source']}", '',
         f"Format **{plan['format']}** {plan['largeur']}×{plan['hauteur']}, {plan['fps']} images/s, durée **{plan['duree_s']:.1f} s**, "
         f"{len(plan['clips'])} plans (≈ {round(len(plan['clips']) / max(plan['duree_s'], 1) * 60)} par minute).", '',
         '## Dans CapCut (ou tout autre logiciel)', '',
         '1. Nouveau projet au format ' + ('9:16' if plan['format'] == 'vertical' else '16:9' if plan['format'] == 'horizontal' else '1:1') + '.',
         '2. Importez les rushs, la musique et le dossier `sfx/` (effets sonores fournis).',
         '3. **Coupes** : suivez `marqueurs.csv` (colonne *timecode*) — chaque ligne « coupe » dit quel rush et quel passage garder. '
         'Les silences sont déjà retirés.',
         f"4. **Cadrage** : sur les plans marqués « cadre ×{max([c['zoom'] for c in plan['clips']] + [1])} », agrandissez l'image de "
         f"{round((max([c['zoom'] for c in plan['clips']] + [1]) - 1) * 100)} % (changement de cadre à la coupe).",
         ]
    if plan['zooms']:
        z = plan['zooms'][0]
        L.append(f"5. **Zooms** : {len(plan['zooms'])} punch-in de ×{z['de']} à ×{z['a']} en {z['dur_s']} s ({z['courbe']}) — images clés aux temps des lignes « zoom ».")
    if plan['transitions']:
        L.append('6. **Transitions** : ' + ', '.join(sorted(set(f"{t['type']} ({t['images']} images)" for t in plan['transitions']))) + ' — aux lignes « transition ».')
    if plan['sous_titres']:
        L.append(f"7. **Sous-titres** : Texte → Sous-titres locaux → importez `sous-titres.srt`. Style : position à {st.get('position_y_pct')} % de la hauteur, "
                 f"texte de {st.get('hauteur_texte_pct')} % de la hauteur, {'MAJUSCULES' if st.get('majuscules') else 'minuscules'}, "
                 f"{'contour noir épais' if st.get('contour_noir') else 'sans contour'}, mot clé en {st.get('couleur_surlignage') or 'couleur'} ({_hex(st.get('couleur_surlignage'))}), "
                 f"animation d'entrée : {st.get('animation')}.")
    if plan['effets']:
        L.append(f"8. **Effets sonores** : {len(plan['effets'])} effets, aux lignes « effet sonore » (fichiers dans `sfx/`).")
    if plan.get('musique'):
        m = plan['musique']
        L.append(f"9. **Musique** : {m['nom']} ({m['tempo_bpm']} BPM) à {m['niveau_db']} dB, baissée de **{m['baisse_sous_voix_db']} dB** quand on parle "
                 '(dans CapCut : « Atténuation automatique » / ducking, ou images clés de volume).')
    if plan['incrustations']: L.append("10. **Barre de progression** en haut de l'écran sur toute la durée.")
    if et:
        L += ['', '## Étalonnage', f"Cible : luminosité {et['cible'].get('luminosite')}, contraste {et['cible'].get('contraste')}, saturation {et['cible'].get('saturation')} "
              f"(nos rushs : {et['nos_rushs']}). Réglages : luminosité ×{et['luminosite_x']}, contraste ×{et['contraste_x']}, saturation ×{et['saturation_x']}"
              + (f", ombres vers {et['ombres']}, hautes lumières vers {et['hautes_lumieres']}" if et.get('ombres') else '')
              + (f", vignettage {et['vignettage']}" if et.get('vignettage') else '') + '.']
    L += ['', '## Toutes les actions dans l\'ordre', '', '| Timecode | Type | Action |', '|---|---|---|']
    L += [f"| {_tc(t, plan['fps'])} | {k} | {a} |" for t, k, a in rows]
    open(path, 'w', encoding='utf-8').write('\n'.join(L) + '\n')


# ------------------------------------------------------------------ Remotion
def remotion(plan, dossier, modele_tsx, chemins, lier=True):
    pub = os.path.join(dossier, 'public'); src = os.path.join(dossier, 'src')
    os.makedirs(os.path.join(pub, 'media'), exist_ok=True); os.makedirs(src, exist_ok=True)
    for nom, p in chemins.items():                                # rushs, musique et effets dans public/media
        d = os.path.join(pub, 'media', nom)
        if os.path.lexists(d): os.remove(d)
        try:
            if lier: os.symlink(os.path.abspath(p), d)
            else: shutil.copy(p, d)
        except OSError: shutil.copy(p, d)
    data = {k: plan[k] for k in ('fps', 'largeur', 'hauteur', 'duree_s', 'clips', 'illustrations', 'transitions', 'zooms', 'sous_titres',
                                 'style_sous_titres', 'effets', 'musique', 'incrustations', 'etalonnage')}
    data['clips'] = [{k: v for k, v in c.items() if k != 'mots'} for c in data['clips']]
    data['couleur_surlignage_hex'] = _hex((plan.get('style_sous_titres') or {}).get('couleur_surlignage'))
    for e in data['effets']: e['fichier'] = 'media/' + os.path.basename(e['fichier'])
    json.dump(data, open(os.path.join(src, 'montage-data.json'), 'w'), ensure_ascii=False, indent=1)
    shutil.copy(modele_tsx, os.path.join(src, 'PatternMontage.tsx'))
    open(os.path.join(src, 'index.ts'), 'w').write("import {registerRoot} from 'remotion';\nimport {RemotionRoot} from './Root';\nregisterRoot(RemotionRoot);\n")
    open(os.path.join(src, 'Root.tsx'), 'w').write(f"""import React from 'react';
import {{Composition}} from 'remotion';
import {{PatternMontage}} from './PatternMontage';
import data from './montage-data.json';

export const RemotionRoot: React.FC = () => (
  <Composition id="PatternMontage" component={{PatternMontage}} durationInFrames={{Math.round(data.duree_s * data.fps)}}
    fps={{data.fps}} width={{data.largeur}} height={{data.hauteur}} />
);
""")
    pkg = os.path.join(dossier, 'package.json')
    if not os.path.exists(pkg):
        json.dump({'name': 'montage-selon-pattern', 'private': True, 'version': '1.0.0',
                   'scripts': {'apercu': 'remotion studio src/index.ts', 'rendu': 'remotion render src/index.ts PatternMontage out/montage.mp4'},
                   'dependencies': {'@remotion/cli': '4.0.540', 'remotion': '4.0.540', 'react': '18.3.1', 'react-dom': '18.3.1', '@fontsource/montserrat': '5.3.0'}},
                  open(pkg, 'w'), indent=1)
    open(os.path.join(dossier, 'tsconfig.json'), 'w').write('{"compilerOptions":{"target":"ES2018","module":"commonjs","jsx":"react-jsx","strict":false,"esModuleInterop":true,"resolveJsonModule":true,"skipLibCheck":true}}\n')
