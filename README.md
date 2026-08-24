# uprighthelper

A browser-based posture monitor that uses on-device pose estimation to warn you when you slouch. Everything runs locally — no data leaves your machine.

**Live demo:** https://aaryanporwal.github.io/uprighthelper/

## How it works

1. Grant webcam access when prompted.
2. Sit upright and click **Right Posture** — the app collects ~15 frames to learn your upright baseline.
3. Slouch and click **Wrong Posture** — the app learns how far you deviate when sitting poorly.
4. Leave the page open. It monitors your posture and alerts you (background color + sound) when you slouch.

Calibration is saved in your browser via IndexedDB, so you don't need to recalibrate every refresh.

## Tech stack

- **MoveNet Lightning** via TensorFlow.js for real-time pose detection
- Geometric posture scoring (head, torso, shoulder metrics)
- Vite + TypeScript, bundled and pinned dependencies (no CDN scripts)
- Bun for package management

## Local development

Requires [Bun](https://bun.sh).

```bash
git clone https://github.com/aaryanporwal/uprighthelper.git
cd uprighthelper
bun install
bun run dev
```

Open the URL Vite prints (usually `http://localhost:5173/uprighthelper/`). Webcam requires HTTPS or localhost.

### Scripts

```bash
bun run dev       # start dev server
bun run build     # production build to dist/
bun run test      # run vitest
bun run lint      # eslint
bun run preview   # preview production build
```

## Privacy

All processing happens in your browser. Webcam frames are never uploaded. Calibration data stays in local IndexedDB.

## License

MIT — see [LICENSE](LICENSE).
