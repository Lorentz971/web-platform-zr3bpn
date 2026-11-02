# Mesure les zooms et mouvements d'une vidéo, sans connaître ses réglages.
import sys, cv2, numpy as np, json
cap=cv2.VideoCapture(sys.argv[1]); fps=cap.get(cv2.CAP_PROP_FPS)
ok,prev=cap.read(); pg=cv2.cvtColor(prev,cv2.COLOR_BGR2GRAY)
H,W=pg.shape
rec=[]  # par image : s (zoom image à image), tx, ty, cut
i=0
while True:
    ok,cur=cap.read()
    if not ok: break
    cg=cv2.cvtColor(cur,cv2.COLOR_BGR2GRAY); i+=1
    p0=cv2.goodFeaturesToTrack(pg,1500,0.01,8)
    cut=False; s=1; tx=ty=0; cx=cy=None
    if p0 is not None:
        p1,st,_=cv2.calcOpticalFlowPyrLK(pg,cg,p0,None,winSize=(31,31),maxLevel=4)
        g=st.ravel()==1
        M,inl=cv2.estimateAffinePartial2D(p0[g],p1[g],method=cv2.RANSAC,ransacReprojThreshold=2)
        if M is None or inl.sum()<0.3*len(p0):
            orb=cv2.ORB_create(3000); k1,d1=orb.detectAndCompute(pg,None); k2,d2=orb.detectAndCompute(cg,None)
            M=None
            if d1 is not None and d2 is not None:
                m=cv2.BFMatcher(cv2.NORM_HAMMING,crossCheck=True).match(d1,d2)
                if len(m)>40:
                    a1=np.float32([k1[x.queryIdx].pt for x in m]); a2=np.float32([k2[x.trainIdx].pt for x in m])
                    M,inl=cv2.estimateAffinePartial2D(a1,a2,method=cv2.RANSAC,ransacReprojThreshold=3)
                    if M is not None and inl.sum()<max(40,0.15*len(m)): M=None
            if M is None: cut=True
        if not cut:
            s=float(np.hypot(M[0,0],M[1,0])); tx,ty=float(M[0,2]),float(M[1,2])
            if abs(np.log(s))>np.log(1.25): cut=True   # saut de plus de 25 % en une image = coupe sèche
            elif abs(s-1)>1e-3: cx,cy=tx/(1-s),ty/(1-s)   # point fixe = centre du zoom (à l'écran)
    else: cut=True
    rec.append(dict(f=i,s=s,tx=tx,ty=ty,cut=cut,cx=cx,cy=cy,M=None if cut else np.vstack([M,[0,0,1]]))); pg=cg
# zoom cumulé (remis à 100 % à chaque coupe)
z=1; cum=[1.0]
for r in rec:
    z = 1 if r['cut'] else z*r['s']; cum.append(z)
# segments de mouvement
segs=[]; cur=None
for r in rec:
    moving=(not r['cut']) and (abs(r['s']-1)>0.0015 or np.hypot(r['tx'] - (1-r['s'])*W/2*0, r['ty'])>0.8 and abs(r['s']-1)<=0.0015)
    if moving:
        if cur is None: cur=dict(a=r['f']-1,rows=[])
        cur['rows'].append(r)
    elif cur: cur['b']=r['f']-1; segs.append(cur); cur=None
if cur: cur['b']=rec[-1]['f']; segs.append(cur)
out=[]
for sg in segs:
    rows=sg['rows']; a,b=sg['a'],sg['b']
    z0,z1=cum[a],cum[b]; dz=z1/z0
    steps=np.array([abs(r['s']-1) for r in rows])
    pan=np.array([np.hypot(r['tx'],r['ty']) for r in rows])
    if abs(dz-1)>0.01:
        prog=np.cumsum(steps)/steps.sum(); half=int(np.argmax(prog>=0.5))+1
        cs=[(r['cx'],r['cy']) for r in rows if r['cx'] is not None]
        A=np.eye(3)
        for r in rows: A=r['M']@A
        tgt=np.linalg.inv(A)@np.array([W/2,H/2,1]); cxm,cym=float(tgt[0]),float(tgt[1])
        kind='PUNCH-IN' if (b-a)<=10 else 'SLOW PUSH'
        ease='ease-out (rapide puis freine)' if half/len(rows)<0.4 else 'linéaire' if half/len(rows)<0.6 else 'ease-in'
        out.append(dict(type=kind,start_s=round(a/fps,2),dur_frames=b-a,dur_s=round((b-a)/fps,2),
          zoom_from=f"{z0*100:.1f}%",zoom_to=f"{z1*100:.1f}%",zoom_change=f"{(dz-1)*100:+.1f}%",
          peak_speed=f"{steps.max()*100:.1f}% par image",half_reached_at=f"{half}/{len(rows)} images",easing=ease,
          target_in_start_frame_px=[round(cxm),round(cym)],target_pct=[round(cxm/W*100),round(cym/H*100)]))
    else:
        tot=np.sum([[r['tx'],r['ty']] for r in rows],axis=0)
        out.append(dict(type='PAN',start_s=round(a/fps,2),dur_s=round((b-a)/fps,2),move_px=[round(float(tot[0])),round(float(tot[1]))],
          move_pct_screen=f"{np.hypot(*tot)/H*100:.0f}% de la hauteur",peak_speed=f"{pan.max():.1f} px/image"))
cuts=[round(r['f']/fps,2) for r in rec if r['cut']]
json.dump(dict(fps=fps,cuts_s=cuts,moves=out),open('pattern.json','w'),indent=2,ensure_ascii=False)
np.savetxt('measured.csv',np.array(cum),delimiter=',')
print(json.dumps(dict(cuts_s=cuts,moves=out),indent=2,ensure_ascii=False))
