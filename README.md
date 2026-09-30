# Bridgit

**Know your height. Get a route that fits.**

Every year, trucks, RVs and rental vans hit bridges that are too low for them, usually because the
driver didn't know their exact height, or their GPS didn't care. Bridgit asks one question, how
tall is your vehicle, and finds a route that clears every low bridge it knows about. Then it
warns you out loud as you approach each one.

## How it works

1. **Vehicle.** Enter your height in feet and inches, and how much extra room to leave (3″ by
   default). If you're unsure, a photo gives a rough range and Bridgit plans with the high end.
2. **Plan.** Bridgit asks [Valhalla](https://github.com/valhalla/valhalla), an open-source
   router, for a truck route at your height plus margin. Valhalla reads the height limits in
   [OpenStreetMap](https://www.openstreetmap.org) and won't use a road you can't fit under.
3. **Double-check.** Bridgit then looks up every height restriction along each route through
   [Overpass](https://overpass-api.de), works out which ones the route really drives under (not
   bridges it crosses over), and compares each with your height using plain arithmetic. You see
   every clearance on the route, with how much room you have.
4. **Drive.** Follow the route with your phone's GPS. Bridgit speaks up a mile before each low
   clearance and again at a quarter mile, and tells you if you leave the checked route.

No AI is involved in deciding whether you fit. The photo estimate is the only AI feature, and it
is optional.

## Run it

You need Python 3.11+ and Node 18+. No API keys are needed.

```bash
# Backend: http://localhost:8000
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload

# Frontend: http://localhost:5173 (in a second terminal)
cd frontend
npm install
npm run dev
```

**Tests:** run `pytest` in `backend/` and `npm test` in `frontend/`.

**One-server deploy:** run `npm run build` in `frontend/`, then start the backend with
`uvicorn app.main:app --host 0.0.0.0`. The backend serves the built app and the API together.

## Configuration

Bridgit works out of the box against public OpenStreetMap services. Copy
`backend/.env.example` to `backend/.env` to change anything.

| Variable | Default | What it's for |
| --- | --- | --- |
| `VALHALLA_URL` | `https://valhalla1.openstreetmap.de` | Routing |
| `OVERPASS_URL` | `https://overpass-api.de/api/interpreter` | Height restrictions |
| `PHOTON_URL` | `https://photon.komoot.io` | Place search |
| `VISION_API_KEY` | none | Turns on photo estimates |
| `VISION_API_URL` | `https://integrate.api.nvidia.com/v1` | Any OpenAI-compatible API |
| `VISION_MODEL` | `meta/llama-3.2-90b-vision-instruct` | Must accept images |

The frontend reads `VITE_TILE_URL` for map tiles (OpenStreetMap's by default).

The public servers are free, shared and rate limited. They're fine for trying Bridgit out, but run
your own Valhalla and Overpass for anything more.

## Limits

Bridgit is only as good as OpenStreetMap's height data. That data is excellent in some places and
missing in others. A clearance nobody has mapped is a clearance Bridgit can't see. Posted signs
always win. If a sign says you won't fit, don't try.

## Layout

```
backend/app/
  main.py          API routes; also serves the built frontend
  trip.py          plan a trip: route, then double-check every clearance
  routing.py       Valhalla client
  restrictions.py  Overpass client, and matching restrictions to the route
  clearance.py     reading OSM height tags; "does it fit?"
  geo.py           polyline and distance maths
  places.py        Photon place search
  photo.py         optional photo height estimate
frontend/src/
  pages/           VehiclePage, PlanPage, DrivePage
  components/      map, clearance sign, place search, ...
  lib/             route maths, alerts, formatting, API client
```

Write-ups from the original hackathon version are in [docs/archive](docs/archive).
