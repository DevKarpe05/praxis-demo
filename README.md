# Praxis Robotics — Demo

A polished investor demo for **Praxis Robotics**, telling the "every workplace is a robotics data vendor" story through three connected personas — **Factory**, **Praxis Ops**, **Robotics Lab** — all viewing the same real multi-modal capture episode.

## What's in this build

- **Real data centerpiece.** Episode `1778330002413` from `~/Documents/Samples/` is decoded directly:
  - 3 synchronized videos (ZED2i head cam + left wrist + right wrist), 30 fps
  - HDF5 sensor pack with timestamps, `High_Level_Instruction`, `Sub_Task_Instruction`, `Scene_Category`, head/hand poses, 40 finger joints
  - Camera intrinsics (fx/fy/cx/cy + stereo baseline)
- **Multi-modal player** synchronizes the three views on one `currentTime` and overlays a 40-joint hand skeleton, end-effector trajectories, sub-task timeline, and the literal VLA instruction (`"tidy shoe cabinet"`).
- **6-stage pipeline simulator** turns a fake upload into a released VLA triplet with stage-accurate animations.
- **Cross-portal continuity** — a marketplace purchase pays an annotation bonus back to the Factory portal's earnings card via `localStorage` + a custom event.

## Quick start

```bash
# 1. Preprocess the real episode (only needed if ~/Documents/Samples changes)
python3 -m venv .venv && source .venv/bin/activate
pip install h5py numpy
python scripts/preprocess_episode.py --episode 1778330002413 --start 0 --duration 30
bash scripts/transcode_videos.sh

# 2. Install + run
npm install
npm run dev     # http://localhost:3000
```

## File layout

```
praxis-demo/
  app/
    page.tsx                       # landing
    factory/                       # Factory portal (capture, upload, earnings)
    ops/                           # Praxis Ops (pipeline kanban + multi-modal reviewer)
    lab/                           # Robotics Lab marketplace + dataset detail
    api/
      upload/                      # POST returns jobId
      jobs/[id]/                   # GET returns 6-stage time-based progress
  components/
    player/                        # MultiViewPlayer + overlays (hand skeleton, trajectory, instruction, intrinsics)
    factory/  ops/  lab/  ui/      # persona-specific UI
  data/
    datasets.json                  # marketplace datasets (3 cards)
    devices.json  operators.json  pricing.json
    episodes/1778330002413/        # decoded HDF5 → meta/tracks/subtasks JSON
  public/samples/episodes/<id>/    # transcoded MP4s (head + L wrist + R wrist) + camera.json
  scripts/
    preprocess_episode.py          # HDF5 → tracks.json
    transcode_videos.sh            # ffmpeg trim/downscale/H.264
  lib/                             # types, data loaders, tracks interp, pipeline, bonus event bus
```

## Demo script (suggested)

1. **Landing** — sets the story. Click "Enter as Factory".
2. **Factory** — show fleet (ZED2i + dual wrist online), recent uploads, `$10/hr earned` headline. Click "New upload".
3. **Factory · upload** — click "Start upload". Stand still for ~22s and narrate the 6-stage pipeline as each one animates. End state shows "Released" with a link.
4. Switch persona to **Praxis Ops**. Show kanban (note the highlighted QA card "tidy shoe cabinet"). Click it.
5. **Ops · review** — let the multi-view player run a few seconds. Point out:
   - 3 synced videos
   - Sub-task timeline auto-advancing
   - Hand skeleton XY plot updating live
   - End-effector XYZ traces with playhead
   - VLA instruction header
   - ZED2i intrinsics panel
   Click "Approve & release" → VLA Triplet reveal pops in.
6. Switch persona to **Robotics Lab**. Show marketplace grid filtered to premium. Click "Tidy shoe cabinet".
7. **Lab · dataset detail** — same multi-view player from the Lab's perspective. Click "Add to cart" → "Confirm". Note the "$96 paid to factory_024" toast.
8. Switch to **Factory**. The bonus has landed in the earnings card. Story complete.

## Deploy to Vercel

```bash
# One-time auth (interactive browser flow)
npx vercel login

# First deploy (creates project, links it, deploys)
npx vercel        # preview
npx vercel --prod # production

# Subsequent deploys
git push          # if you wire GitHub integration
# or
npx vercel --prod
```

Vercel auto-detects Next.js. The `public/samples/` directory (≈6 MB) ships as static assets.

## v1.1 plans

- Add episode 2 (`1778589627389`) to the marketplace once preprocessed
- Populate Factory recent-uploads from `factory024_worker001_part00/` chunk JSONs
- Page-transition animation pass
