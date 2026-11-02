# Fabrique une vidéo test avec des zooms connus (vérité terrain enregistrée dans truth.csv)
import numpy as np, cv2, math
from PIL import Image, ImageDraw, ImageFont
W,H=1920,1080
page=Image.new('RGB',(3000,2000),'#f7f5f0'); d=ImageDraw.Draw(page)
fb=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf',90)
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',44)
d.text((300,250),'Local Bank Collapses Overnight',font=fb,fill='#111')
import random; random.seed(3)
words='the of market investors billion savings customers report officials said that would economy'.split()
for i in range(22):
    y=450+i*62; line=' '.join(random.choice(words) for _ in range(14))
    d.text((300,y),line,font=f,fill='#333')
d.rectangle((1180,1055,1530,1112),fill='#ffe066'); d.text((1190,1060),'BANKRUPT',font=f,fill='#111')
P=np.array(page)[:,:,::-1].copy()
fps=30; T=lambda s:int(s*fps)
def ease_out(t): return 1-(1-t)**3
# segments: (frames, scale_from, scale_to, cx_from, cy_from, cx_to, cy_to, easing)
base=(1500,1000)
word=(1355,1083)
segs=[(T(1),1.0,1.0,*base,*base,'lin'),
      (6,1.0,1.40,*base,*word,'out'),      # punch-in 40% en 6 images vers le mot
      (T(1),1.40,1.40,*word,*word,'lin'),
      (T(2),1.40,1.52,*word,*word,'lin'),   # lente poussée +12 points
      (1,1.0,1.0,*base,*base,'lin'),        # coupe
      (T(1),1.0,1.0,*base,*base,'lin'),
      (T(1.5),1.0,1.0,*base,1500,1250,'out')]  # panoramique vertical
vw=cv2.VideoWriter('test.mp4',cv2.VideoWriter_fourcc(*'mp4v'),fps,(W,H))
rows=[]; n=0
for fr,s0,s1,x0,y0,x1,y1,e in segs:
    for k in range(fr):
        t=(k+1)/fr if fr>1 else 1; t=ease_out(t) if e=='out' else t
        s=s0+(s1-s0)*t; cx=x0+(x1-x0)*t; cy=y0+(y1-y0)*t
        z=1.6*s  # échelle de base pour remplir l'écran
        M=np.float32([[z,0,W/2-cx*z],[0,z,H/2-cy*z]])
        img=cv2.warpAffine(P,M,(W,H),flags=cv2.INTER_LINEAR)
        vw.write(img); rows.append((n,s,cx,cy)); n+=1
vw.release()
np.savetxt('truth.csv',np.array(rows),delimiter=',',header='frame,scale,cx,cy',comments='')
print(n,'frames')
