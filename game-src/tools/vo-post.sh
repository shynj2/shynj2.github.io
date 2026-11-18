#!/bin/sh
# Narrator post: art-src/audio/raw/intro_N.mp3 (as recorded) -> art-src/audio/intro_N.mp3 (what the game ships), then packs them.
#   - silence cut at both ends only; the narrator's own pauses and breaths are KEPT (a pause over 1.2 s is eased to 0.9 s)
#   - no echo, no room: the earlier short echoes (47 ms / 93 ms) gave the voice a metallic, robotic ring
#   - a touch of warmth (low shelf), loudness evened out gently
#   - mono MP3, 64 kbps (48 kbps smeared the breath and the consonants)
# needs ffmpeg.      sh tools/vo-post.sh
cd "$(dirname "$0")/.." || exit 1
for f in art-src/audio/raw/intro_*.mp3; do
  o="art-src/audio/$(basename "$f")"
  ffmpeg -v error -y -i "$f" -af "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06:stop_periods=-1:stop_duration=1.2:stop_threshold=-50dB:stop_silence=0.9,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse,bass=g=1.5:f=160,apad=pad_dur=0.45,loudnorm=I=-17:TP=-1.5:LRA=14" -ac 1 -ar 44100 -b:a 64k "$o"
done
node tools/vo.mjs
