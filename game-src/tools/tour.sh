#!/bin/sh
# 2x2 montage of the four workshop screens at logical resolution -> $1 (default /tmp/tour.png)
cd "$(dirname "$0")/.." && node tools/build.mjs | cut -c1-48
i=0; for c in ${COLS:-8 46 78 100}; do node tools/shot.mjs /tmp/tour_$i.png --vp 640x360 --canvas --col $c --wait ${WAIT:-1} $EXTRA | cut -c1-200; i=$((i+1)); done
python3 -c "
from PIL import Image
ims=[Image.open('/tmp/tour_%d.png'%i).convert('RGB') for i in range($i)]
m=Image.new('RGB',(1280,360*(($i+1)//2)))
for n,im in enumerate(ims): m.paste(im,((n%2)*640,(n//2)*360))
m.save('${1:-/tmp/tour.png}')"
