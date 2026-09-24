"""Rebuild the silent website reel from the client's original YouTube files."""
from pathlib import Path
import subprocess
import json
from PIL import Image

sources = {}
for path in Path("research/source-media/YOUTUBE CONTENT").glob("*.mp4"):
    key = "durango" if "Durango" in path.name else "brother" if "brother" in path.name else "dream"
    sources[key] = path

# Source in-point, duration, and horizontal center for the separate phone edit.
shots = [
    ("dream", 658.3, 3.7, 1000),
    ("brother", 10.3, 3.3, 1020),
    ("dream", 298.5, 3.0, 900),
    ("durango", 48.8, 3.0, 1080),
    ("durango", 175.0, 3.0, 1000),
    ("durango", 116.0, 3.0, 1120),
    ("dream", 781.7, 3.0, 1030),
]
work = Path("research/montage-render")
work.mkdir(parents=True, exist_ok=True)
Path("public/video").mkdir(exist_ok=True)

def run(args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)

for mobile in [False, True]:
    name = "district-hero-mobile" if mobile else "district-hero"
    clips = []
    for i, (source, start, duration, center) in enumerate(shots):
        output = work / f"{name}-{i}.mp4"
        frame = f"crop=720:960:{center-360}:60,scale=540:720" if mobile else "crop=1920:960:0:60,scale=1600:800"
        run(["-ss", str(start), "-i", str(sources[source]), "-t", str(duration),
             "-vf", f"{frame},fps=24,setsar=1,eq=saturation=0.68:contrast=1.04:brightness=-0.02",
             "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "24", "-pix_fmt", "yuv420p",
             "-threads", "4", "-map_metadata", "-1", str(output)])
        clips.append(f"file '{output.name}'")
    concat = work / f"{name}.txt"
    concat.write_text("\n".join(clips))
    run(["-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", "-movflags", "+faststart", f"public/video/{name}.mp4"])

stills = {
    "district-bmw": ("dream", 659.5),
    "district-interior": ("dream", 299.4),
    "district-detail": ("durango", 118.2),
    "district-road": ("dream", 783.6),
    "district-culture": ("durango", 51.0),
    "hero-film-poster": ("dream", 658.4),
}
for name, (source, at) in stills.items():
    frame = work / f"{name}.png"
    run(["-ss", str(at), "-i", str(sources[source]), "-frames:v", "1",
         "-vf", "crop=1920:960:0:60,scale=1600:800,eq=saturation=0.68:contrast=1.04:brightness=-0.02",
         str(frame)])
    Image.open(frame).save(f"public/images/{name}.webp", quality=86)

(work / "edit.json").write_text(json.dumps({"shots": shots, "duration": sum(s[2] for s in shots), "audio": False, "fps": 24}, indent=2))
print("Rendered desktop and phone reels, plus six stills. No audio, titles, or captions added.")
