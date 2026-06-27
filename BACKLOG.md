# ui_set_2 — BACKLOG

Live: https://devanshsrivastava88.github.io/ui-set-2/
Repo: https://github.com/DevanshSrivastava88/ui-set-2

## Done
- [x] 3 crazy chatbot UIs: exocortex.html, plasma.html, neural.html
- [x] index.html gallery landing
- [x] chat-engine.js — offline mock brain + live claude-haiku-4-5 (BYO-key, localStorage)
- [x] deployed to GitHub Pages (master root)
- [x] ponytail plugin installed (user scope, enabled)

## STATUS: ON HOLD (2026-06-27)
User: "okayish, not mindblowing, stash it." Paused.

## To make cyberpunk actually mindblowing (next pickup)
- Ditch THREE.Points for the logo — points read as a starfield, not the chrome liquid-metal
  blackletter from the ref (web.with.ai / KVS reel). Use real geometry:
  - 3D blackletter as a GLB model OR TextGeometry, MeshStandardMaterial metalness=1 roughness=.1
    + HDRI/RoomEnvironment envmap = true chrome. Water reflection via reflector plane.
  - Shatter = break the mesh into fragments (or instanced shards), not scatter points.
- Get the REAL font/3D asset instead of freehanding (see memory: design-needs-better-resources).
- Heavier postFX: chromatic aberration, film grain pass, subtle motion blur.

## Pending / ideas
- [ ] Visual browser QA — extension disconnected during build, only curl-verified. Open each page, type a message, confirm streaming + animations.
- [ ] Optional 4th theme (warm-glass riff from thalivethali palette)
- [ ] Wire a serverless proxy so live chat works without users pasting their own key
- [ ] Persist chat history per theme
