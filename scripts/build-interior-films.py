"""Short silent atmospheric loops from the already reviewed client montage cuts."""
from pathlib import Path
import subprocess
from PIL import Image
work=Path('research/interior-render');work.mkdir(parents=True,exist_ok=True)
# The originals were visually checked for captions during the homepage edit.
clips={'drive':('district-hero-6.mp4',1600,0.8),'cabin':('district-hero-2.mp4',960,0.7),'people':('district-hero-3.mp4',1440,0.8)}
for name,(source,width,speed) in clips.items():
 src=Path('research/montage-render')/source
 dest=Path('public/video')/f'district-{name}-loop.mp4'
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(src),'-vf',f'setpts=PTS/{speed},scale={width}:-2,fps=24','-an','-c:v','libx264','-preset','fast','-crf','26','-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata','-1',str(dest)],check=True)
 print(dest,dest.stat().st_size)
# A real showroom portrait from the user-supplied tour footage.
source=next(Path('research/source-media/YOUTUBE CONTENT').glob('*Durango*'))
frame=work/'people.jpg'
subprocess.run(['ffmpeg','-v','error','-y','-ss','175.5','-i',str(source),'-frames:v','1','-vf','scale=1200:-2',str(frame)],check=True)
Image.open(frame).save('public/images/district-people.webp',quality=82)
