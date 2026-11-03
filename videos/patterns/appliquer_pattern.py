#!/usr/bin/env python3
"""Applique un pattern de montage (mesuré sur une vidéo YouTube / TikTok) à NOS rushs.

Usage :
  python3 appliquer_pattern.py PATTERN.json RUSH1.mp4 [RUSH2.mp4 ...] [--musique MUSIQUE.mp3] [--duree 60]
                               [--format vertical|horizontal|carre] [--sortie DOSSIER] [--rendu] [--graine 0]

  PATTERN.json : le pattern.json d'une vidéo (analyse_montage.py) ou un style combiné (agreger.py).
  Les rushs où l'on parle deviennent la piste principale (silences retirés, coupes entre les mots) ;
  les rushs sans parole servent d'illustrations par-dessus la voix.

Produit dans DOSSIER (par défaut ./montage) :
  plan-de-montage.json        toutes les décisions, lisibles et modifiables
  remotion/                   projet Remotion prêt à rendre (npm install puis npm run rendu)
  davinci/montage.fcpxml      à importer dans DaVinci Resolve (Fichier → Importer → Timeline) ou Final Cut Pro
  davinci/montage_V1.edl …    EDL CMX 3600 (Premiere, Avid, DaVinci)
  capcut/recette.md           la recette pas à pas (CapCut ou tout logiciel), avec chaque action et son timecode
  sous-titres.srt, marqueurs.csv, sfx/*.wav (effets sonores fabriqués par calcul)

--rendu : rend la vidéo avec Remotion (Node.js requis), puis la ré-analyse et la compare au pattern
          (boucle de conformité : conformite.md).
"""
import argparse, json, os, shutil, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from montage import plan as planif, exports, sfx_lib


def _gain_lufs(path, cible):
    try:
        import pyloudnorm, soundfile, tempfile
        tmp = tempfile.mktemp(suffix='.wav')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-vn', '-ac', '2', '-ar', '48000', tmp], check=True)
        y, sr = soundfile.read(tmp); os.remove(tmp)
        return float(max(-20, min(20, cible - pyloudnorm.Meter(sr).integrated_loudness(y))))
    except Exception:
        return 0.0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('pattern'); ap.add_argument('rushs', nargs='+')
    ap.add_argument('--musique'); ap.add_argument('--duree', type=float); ap.add_argument('--format', choices=['vertical', 'horizontal', 'carre'])
    ap.add_argument('--sortie', default='montage'); ap.add_argument('--rendu', action='store_true'); ap.add_argument('--graine', type=int, default=0)
    ap.add_argument('--node-modules', help='dossier node_modules existant à réutiliser (évite npm install)')
    ap.add_argument('--navigateur', help='Chrome / Chromium à utiliser pour le rendu Remotion (sinon Remotion télécharge le sien)')
    a = ap.parse_args()
    P = json.load(open(os.path.join(a.pattern, 'pattern.json') if os.path.isdir(a.pattern) else a.pattern))
    out = os.path.abspath(a.sortie); os.makedirs(out, exist_ok=True)
    plan = planif.construire(P, a.rushs, musique=a.musique, duree_max=a.duree, format_=a.format, graine=a.graine)
    exporter(plan, out, a.pattern, rendu=a.rendu, navigateur=a.navigateur, node_modules=a.node_modules)


def exporter(plan, out, pattern, rendu=False, navigateur=None, node_modules=None):
    """Écrit tous les exports d'un plan de montage (et rend la vidéo avec Remotion si rendu=True)."""
    os.makedirs(out, exist_ok=True)
    sfx = sfx_lib.ecrire(os.path.join(out, 'sfx'))
    json.dump(plan, open(os.path.join(out, 'plan-de-montage.json'), 'w'), ensure_ascii=False, indent=1)
    chemins = {r['nom']: r['chemin'] for r in plan['rushs']}
    if plan.get('musique'): chemins[plan['musique']['nom']] = plan['musique']['src']
    for nom, v in sfx.items(): chemins[f'{nom}.wav'] = v['fichier']
    exports.srt(plan, os.path.join(out, 'sous-titres.srt'))
    rows = exports.marqueurs(plan, os.path.join(out, 'marqueurs.csv'))
    os.makedirs(os.path.join(out, 'davinci'), exist_ok=True); os.makedirs(os.path.join(out, 'capcut'), exist_ok=True)
    exports.fcpxml(plan, os.path.join(out, 'davinci', 'montage.fcpxml'), chemins)
    exports.edl(plan, os.path.join(out, 'davinci', 'montage'))
    exports.recette_md(plan, os.path.join(out, 'capcut', 'recette.md'), rows)
    shutil.copy(os.path.join(out, 'sous-titres.srt'), os.path.join(out, 'capcut', 'sous-titres.srt'))
    rdir = os.path.join(out, 'remotion')
    exports.remotion(plan, rdir, os.path.join(HERE, 'remotion', 'PatternMontage.tsx'), chemins)
    print(f"\nPlan : {len(plan['clips'])} plans, {len(plan['illustrations'])} illustrations, {len(plan['transitions'])} transitions, {len(plan['zooms'])} zooms, "
          f"{len(plan['sous_titres'])} sous-titres, {len(plan['effets'])} effets sonores, {plan['duree_s']:.1f} s → {out}")
    if rendu:
        nm = os.path.join(rdir, 'node_modules')
        if node_modules and not os.path.exists(nm): os.symlink(os.path.abspath(node_modules), nm)
        if not os.path.exists(nm): subprocess.run(['npm', 'install', '--no-audit', '--no-fund'], cwd=rdir, check=True)
        os.makedirs(os.path.join(rdir, 'out'), exist_ok=True)
        subprocess.run(['npx', 'remotion', 'render', 'src/index.ts', 'PatternMontage', 'out/montage.mp4', '--log=error']
                       + ([f'--browser-executable={navigateur}'] if navigateur else []), cwd=rdir, check=True)
        brut = os.path.join(rdir, 'out', 'montage.mp4'); video = os.path.join(out, 'montage.mp4')
        L = plan['volume_cible_lufs']                       # volume général calé sur celui du pattern
        gain = 0.0
        for _ in range(3):                                 # gain mesuré (pyloudnorm), limiteur contre la saturation, puis on re-mesure
            gain += _gain_lufs(video if _ else brut, L) if _ else _gain_lufs(brut, L)
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', brut, '-c:v', 'copy', '-af', f'volume={gain:.2f}dB,alimiter=limit=0.89',
                            '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', video], check=True)
            if abs(_gain_lufs(video, L)) < 0.5: break
        print(f'Vidéo rendue : {video} (volume normalisé à {L} LUFS)')
        print('Boucle de conformité : ré-analyse de notre montage…')
        subprocess.run([sys.executable, os.path.join(HERE, 'analyse_montage.py'), video, os.path.join(out, 'analyse-du-rendu')], check=True)
        ref = os.path.join(pattern, 'pattern.json') if os.path.isdir(pattern) else pattern
        subprocess.run([sys.executable, os.path.join(HERE, 'comparer.py'), ref, os.path.join(out, 'analyse-du-rendu', 'pattern.json'), os.path.join(out, 'conformite.md')], check=True)


if __name__ == '__main__':
    main()
