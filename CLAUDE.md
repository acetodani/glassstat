# GlassStat — Project Context

## What This Is

Photography analytics dashboard — "Spotify Wrapped for your camera gear." Users upload photos, EXIF metadata is extracted via ExifTool, and the app visualizes shooting patterns (focal length, aperture, ISO, gear usage, time-of-day).

**Live repo:** https://github.com/acetodani/glassstat
**Owner:** acetodani (Dani Almalaki)

## Tech Stack

- **Backend:** Python 3.9+ / FastAPI / SQLModel / SQLite / ExifTool / Pillow
- **Frontend:** React 18 / TypeScript / Vite / Tailwind / Recharts
- **ML (planned):** CLIP via open-clip-torch for image scoring, tagging, similarity
- **Deploy:** Docker Compose

## Running Locally

```bash
# Backend
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npx vite --port 3000
```

Requires: ExifTool (`brew install exiftool`), Python 3.9+, Node 20+

## Architecture

```
backend/app/
├── api/routes/     # FastAPI routers (dashboard, photos, ingest, analytics, gear, wrapped, ml)
├── core/           # Config, ExifTool wrapper
├── db/             # SQLite engine, WAL mode
├── demo/           # Demo data seeder (5000 fake photos)
├── models/         # SQLModel: Photo, Gear
├── services/       # Analytics, parser, scanner, wrapped, archetypes, best_photo, ml
frontend/src/
├── api/            # Typed API client
├── components/     # Home, Dashboard, Gallery, Wrapped, Demo, Import, Nav
├── hooks/          # useFetch with 30s cache
├── types/          # TypeScript interfaces
```

## Key Design Decisions

- **Single `/api/dashboard` endpoint** bundles stats + recent photos + top gear + charts (7 requests → 1)
- **Thumbnails** generated server-side at 400px via Pillow with EXIF orientation fix, cached in `.thumbs/`
- **Full-size files** also orientation-corrected, cached in `.corrected/`
- **Duplicate prevention** by filename + MD5 of first 64KB
- **File validation** — whitelist of 13 image extensions, 50MB max, empty file rejection
- **Infinite scroll** gallery with IntersectionObserver, 24 per page
- **Best photo scoring** — multi-factor: ISO (25%), aperture sweet spot (20%), shutter (15%), golden hour (15%), subject intent (15%), resolution (10%)
- **Photographer archetypes** — 7 types classified from shooting patterns

## Current State (as of May 2024)

### Working (85%)
- 6 pages: Home, Overview, Library, Wrapped, Demo, Import
- 29 API endpoints
- Photo upload + scan with real-time progress
- Gallery with lens/camera filters
- Photo viewer with keyboard nav, swipe, auto-insights
- Wrapped card with archetype + best photo + download as PNG
- Glass morphism UI with animated gradient background
- Charts: sky blue focal length bars, orange activity area

### Half-Built
- `ShotMap.tsx` — placeholder, no Leaflet rendering (backend GPS data ready)
- `GearROI.tsx` — placeholder, needs gear settings UI
- Unused chart components in `charts/` folder (aperture, ISO, timeline, heatmap)

### Known Bugs
- `best_photo.py` line 61: `if iso >= 3200 and hour >= 20 or hour <= 5:` — missing parens, should be `and (hour >= 20 or hour <= 5)`

## Next Steps: ML Pipeline

Plan is to add CLIP (open-clip-torch) for three features using a single model:

1. **Aesthetic scoring** — compare image embeddings to "beautiful photo" text prompt (LAION Aesthetics approach)
2. **Subject auto-tagging** — zero-shot classification against 12 labels (portrait, landscape, architecture, street, wildlife, food, macro, night, sports, abstract, pet, travel)
3. **Similar photo grouping** — cosine similarity on 512-dim embeddings, group at >0.85 threshold

### Implementation needs:
- New `backend/app/services/ml.py` — CLIP wrapper
- New `backend/app/api/routes/ml.py` — ML endpoints
- Add columns to Photo model: `aesthetic_score`, `subject_tag`, `subject_confidence`, `embedding`
- Update gallery to filter by subject, sort by score
- Update best_photo to use real aesthetic score
- Background processing after upload (~1s per photo on M-series CPU)
- Dependencies: `torch`, `open-clip-torch`, `transformers` (~700MB total)

### Other planned work:
- Wire up ShotMap with actual Leaflet
- Analytics detail page using the existing unused chart components
- Gear settings UI for purchase prices
- Fix night detection bug

## Conventions

- No AI/Claude references in code, commits, or README
- No purple/indigo colors — use sky blue (#0EA5E9) + warm orange (#F97316)
- Glass morphism (backdrop-blur) on all cards
- Font stack: DM Serif Display (headings), JetBrains Mono (data), Inter (body)
- Background: #F0F4F8 with animated floating gradient blobs
- All Python files use `from __future__ import annotations` for 3.9 compat
- Frontend type-checks clean (`npx tsc --noEmit`)
- Commits are descriptive multi-line messages
