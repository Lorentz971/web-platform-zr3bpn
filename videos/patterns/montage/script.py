"""Monter à partir d'un script : chaque ligne du script devient une case (comme une case du modèle d'un edit),
remplie avec le moment de nos rushs qui correspond le mieux à la description (recherche par le sens, CLIP).

Format (un plan par ligne, champs séparés par | ; seuls la durée et la description sont utiles) :

    # commentaire
    format: vertical
    2 temps | LeBron marche dans le tunnel | THE KING
    2 temps | gros plan visage concentré
    --- drop ---
    1 temps | dunk | | flash, impact
    1 temps | foule qui crie | | zoom
    2 temps | célébration bras levés | GOAT | whoosh
    3 s | LeBron sourit | | ralenti

  durée   : « 2 temps » (sur la musique), « 1.5 s » (en secondes), ou rien (2 temps, ou 1,5 s sans musique)
  « --- drop --- » : la ligne suivante tombe sur le drop de la musique
  texte   : affiché tel quel (majuscules gardées), au centre, avec un pop
  effets  : flash, fondu, glissement, glitch, zoom (punch-in), dézoom, ralenti, accéléré, secousse ;
            sons : whoosh, impact (boum), pop, riser (montée), clic, ding, glitch
"""
import re
from . import banque as bq

ENTREES = {'flash': ('flash blanc', 2), 'fondu': ('fondu enchaîné', 8), 'fondu au noir': ('fondu au noir', 6), 'glissement': ('glissement', 8), 'slide': ('glissement', 8),
           'glitch': ('glitch', 4), 'zoom de transition': ('zoom de transition', 8), 'panoramique': ('panoramique filé', 8), 'whip': ('panoramique filé', 8),
           'rideau': ('rideau', 10), 'rotation': ('rotation de transition', 8)}
SONS = {'whoosh': 'souffle (whoosh)', 'swoosh': 'souffle (whoosh)', 'impact': 'impact grave (boum)', 'boum': 'impact grave (boum)', 'boom': 'impact grave (boum)',
        'pop': 'pop', 'riser': 'montée (riser)', 'montée': 'montée (riser)', 'clic': 'clic', 'click': 'clic', 'ding': 'ding', 'glitch': 'glitch',
        'déclencheur': 'déclencheur photo', 'photo': 'déclencheur photo'}


def _duree(ch):
    ch = ch.strip().lower().replace(',', '.')
    m = re.fullmatch(r'(\d+(?:\.\d+)?)\s*(temps|t|beats?|b)', ch)
    if m: return float(m.group(1)), 'temps'
    m = re.fullmatch(r'(\d+(?:\.\d+)?)\s*(s|sec|secondes?)', ch)
    if m: return float(m.group(1)), 's'
    return None


def lire(texte):
    """Renvoie (réglages, lignes). Chaque ligne : dict(duree, unite, description, texte, effets[], drop_avant)."""
    regl = {}; lignes = []; drop = False
    for brut in texte.splitlines():
        l = brut.strip()
        if not l or l.startswith('#'): continue
        if re.fullmatch(r'-{2,}\s*drop\s*-{2,}', l, re.I): drop = True; continue
        m = re.fullmatch(r'(format|musique|titre)\s*:\s*(.+)', l, re.I)
        if m: regl[m.group(1).lower()] = m.group(2).strip(); continue
        ch = [c.strip() for c in l.split('|')]
        d = _duree(ch[0]) if ch else None
        if d: ch = ch[1:]
        lignes.append(dict(duree=d[0] if d else None, unite=d[1] if d else None, description=ch[0] if ch else '',
                           texte=ch[1] if len(ch) > 1 and ch[1] else None,
                           effets=[e.strip().lower() for e in (ch[2] if len(ch) > 2 else '').split(',') if e.strip()], drop_avant=drop))
        drop = False
    return regl, lignes


def modele(regl, lignes, M=None):
    """Construit un modèle (même forme que modele.construire) depuis le script. M : analyse de NOTRE musique (pour convertir les secondes en temps)."""
    tb = (M or {}).get('temps_s') or []
    per = (60 / M['tempo_bpm']) if M and M.get('tempo_bpm') else 0.5
    a_mus = len(tb) >= 4
    cases = []; b = 0.0; t = 0.0; drops = []
    for i, L in enumerate(lignes):
        if L['duree'] is None: dt = 2.0 if a_mus else None; ds = 1.5 if not a_mus else 2.0 * per
        elif L['unite'] == 'temps': dt = L['duree']; ds = L['duree'] * per
        else: ds = L['duree']; dt = L['duree'] / per
        if dt is None: dt = ds / per
        if L['drop_avant']: drops.append(b)
        besoin = bq.besoin_depuis_texte(L['description'])
        besoin['requete'] = L['description']
        ent = None; mouv = []; sons = []; vitesse_lecture = 1.0; a_faire = []
        for e in L['effets']:
            if e in ENTREES: ent = dict(type=ENTREES[e][0], images=ENTREES[e][1])
            elif e in ('zoom', 'punch', 'punch-in'): mouv.append(dict(type='punch-in', debut_rel_s=0.0, dur_s=min(0.35, ds * 0.4), zoom_pct=12, courbe='freine à la fin (ease-out)'))
            elif e in ('dézoom', 'dezoom'): mouv.append(dict(type='dézoom rapide', debut_rel_s=0.0, dur_s=min(0.35, ds * 0.4), zoom_pct=12, courbe='freine à la fin (ease-out)'))
            elif e in ('poussée', 'zoom lent'): mouv.append(dict(type='poussée lente', debut_rel_s=0.0, dur_s=ds, zoom_pct=8, courbe='constante'))
            elif e == 'ralenti': vitesse_lecture = 0.5
            elif e == 'accéléré': vitesse_lecture = 1.5
            elif e in ('secousse', 'shake'): a_faire.append('secousse (shake sur le temps)')
            if e in SONS: sons.append(dict(type=SONS[e], debut_rel_s=-0.12 if SONS[e] == 'souffle (whoosh)' else (-1.2 if 'riser' in SONS[e] else 0.0)))
        if L['drop_avant'] and not ent: ent = dict(type='flash blanc', images=2)          # le drop se voit
        textes = []
        if L['texte']:
            textes.append(dict(texte_original=L['texte'], notre=True, debut_rel_s=0.0, duree_s=round(ds, 3), animation='pop avec rebond', role='titre',
                               derriere_le_sujet=False, suit_le_sujet=False, position=[50, 42], hauteur_pct=7.0, majuscules=L['texte'].isupper()))
        cases.append(dict(n=i + 1, debut_s=round(t, 3), duree_s=round(ds, 3), debut_temps=round(b, 3), duree_temps=round(dt, 3),
                          partie='drop' if drops else None, apres_le_drop_s=None, calee_sur='sur un temps', besoin=besoin, entree=ent, vitesse=None,
                          vitesse_lecture=vitesse_lecture, mouvements=mouv, effets=[], masques=[], incrustations=[], textes=textes, sons=sons,
                          a_faire_script=a_faire, etalonnage={}, role=L['description']))
        b += dt; t += ds
    fmt = (regl.get('format') or 'vertical').lower()
    return dict(source='script', format='vertical 9:16' if 'vert' in fmt else 'carré 1:1' if 'carr' in fmt else 'horizontal 16:9', duree_s=round(t, 3), fps=30,
                musique=dict(tempo_bpm=M.get('tempo_bpm'), drops_s=[], drops_temps=drops[:1], parties=[], filtres=[], cymbales_inversees=[], premier_temps_s=None,
                             nombre_de_temps=int(b)) if a_mus else None,
                style_sous_titres=None, style_global=[], barre_de_progression=False, volume_lufs=-10.0, lecture=None, cases=cases)
