"""Height restrictions along a route, from OpenStreetMap via Overpass.

This is Bridgit's second opinion. The router already avoids anything too low;
here we list every restriction the route still passes under, so the driver
can see them and be warned as they approach. When the geometry is ambiguous we
err towards listing a restriction rather than hiding it.
"""

from __future__ import annotations

from dataclasses import dataclass

import httpx

from .clearance import clearance_from_tags
from .errors import UpstreamError
from .geo import Line, Point

QUERY_RADIUS_M = 10      # fetch anything this close to the route...
QUERY_TOLERANCE_M = 3    # ...drawn with a simplified line that strays at most this far
QUERY_CHUNK_POINTS = 400
MATCH_M = 3              # the route and a restricted way must be this close to count as the same road
SAMPLE_STEP_M = 2
MIN_TRAVEL_M = 10        # the route must follow a restricted way this far, not just cross it
MERGE_M = 50             # restrictions this close together are one structure


@dataclass
class Restriction:
    osm_type: str
    osm_id: int
    tags: dict[str, str]
    geometry: list[Point]
    clearance_in: int

    @property
    def name(self) -> str | None:
        return self.tags.get("name") or self.tags.get("ref")

    @property
    def osm_url(self) -> str:
        return f"https://www.openstreetmap.org/{self.osm_type}/{self.osm_id}"


@dataclass
class Match:
    restriction: Restriction
    point: Point     # where the route reaches the restriction
    along_m: float   # how far along the route that is


def build_query(lines: list[Line]) -> str:
    filters = []
    for line in lines:
        points = line.simplified(QUERY_TOLERANCE_M).points
        step = QUERY_CHUNK_POINTS - 1  # chunks share an end point so nothing falls between them
        for start in range(0, max(1, len(points) - 1), step):
            coords = ",".join(f"{lat:.6f},{lon:.6f}" for lat, lon in points[start:start + QUERY_CHUNK_POINTS])
            for kind in ("way", "node"):
                filters.append(f'  {kind}[~"^maxheight"~"."](around:{QUERY_RADIUS_M},{coords});')
    return "[out:json][timeout:120];\n(\n" + "\n".join(filters) + "\n);\nout tags geom;"


async def fetch_restrictions(client: httpx.AsyncClient, url: str, lines: list[Line]) -> list[Restriction]:
    """Every height restriction near any of the lines."""
    try:
        response = await client.post(url, data={"data": build_query(lines)}, timeout=150)
        response.raise_for_status()
        data = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise UpstreamError(f"Clearance data unavailable: {exc}") from exc
    # Overpass reports timeouts inside a 200 response; partial data must not pass as a full check.
    if "error" in data.get("remark", "").lower():
        raise UpstreamError(f"Clearance data incomplete: {data['remark']}")

    restrictions = []
    for element in data.get("elements", []):
        tags = element.get("tags", {})
        clearance = clearance_from_tags(tags)
        if clearance is None:
            continue
        if element["type"] == "node":
            geometry = [(element["lat"], element["lon"])]
        else:
            geometry = [(p["lat"], p["lon"]) for p in element.get("geometry", []) if p]
        if geometry:
            restrictions.append(Restriction(element["type"], element["id"], tags, geometry, clearance))
    return restrictions


def match_route(restrictions: list[Restriction], route: Line) -> list[Match]:
    """The restrictions this route passes under, in driving order."""
    matches = [m for r in restrictions if (m := _match_one(r, route))]
    matches.sort(key=lambda m: m.along_m)

    merged: list[Match] = []
    for m in matches:
        if merged and m.along_m - merged[-1].along_m < MERGE_M:
            if m.restriction.clearance_in < merged[-1].restriction.clearance_in:
                merged[-1] = Match(m.restriction, merged[-1].point, merged[-1].along_m)
            continue
        merged.append(m)
    return merged


def _match_one(restriction: Restriction, route: Line) -> Match | None:
    if restriction.osm_type == "node" or len(restriction.geometry) < 2:
        point = restriction.geometry[0]
        hit = route.locate(point, within_m=MATCH_M)
        return Match(restriction, point, hit[1]) if hit else None

    way = Line(restriction.geometry)
    hits = [(p, loc[1]) for p, _ in way.sample(SAMPLE_STEP_M) if (loc := route.locate(p, within_m=MATCH_M))]
    if not hits:
        return None
    alongs = [along for _, along in hits]
    # A road that merely crosses the route touches it at one spot; one the route drives along spans a distance.
    if max(alongs) - min(alongs) < min(MIN_TRAVEL_M, way.length_m / 2):
        return None
    point, along = min(hits, key=lambda h: h[1])
    return Match(restriction, point, along)
