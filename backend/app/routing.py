"""Height-aware routing with Valhalla's truck profile.

Valhalla reads OpenStreetMap's maxheight tags and refuses roads the vehicle
cannot pass under, so every route it returns already avoids known low bridges.
"""

from __future__ import annotations

from dataclasses import dataclass

import httpx

from .errors import NoRouteError, UpstreamError
from .geo import Line, Point, decode_polyline

METRES_PER_INCH = 0.0254

# Valhalla error codes that mean "no route exists", as opposed to "something broke".
# 171: no usable road near a location, 441: unreachable, 442: no path found.
_NO_ROUTE_CODES = {171, 441, 442}


@dataclass
class Route:
    line: Line
    distance_m: float
    duration_s: float


async def fetch_routes(client: httpx.AsyncClient, base_url: str, origin: Point, destination: Point,
                       height_in: float, alternates: int = 2) -> list[Route]:
    """Up to 1 + alternates routes, best first, for a vehicle height_in tall."""
    body = {
        "locations": [{"lat": origin[0], "lon": origin[1]}, {"lat": destination[0], "lon": destination[1]}],
        "costing": "truck",
        "costing_options": {"truck": {"height": round(height_in * METRES_PER_INCH, 2)}},
        "units": "kilometers",
        "alternates": alternates,
    }
    try:
        response = await client.post(f"{base_url}/route", json=body, timeout=60)
    except httpx.HTTPError as exc:
        raise UpstreamError(f"Routing service unreachable: {exc}") from exc

    data = _json(response)
    if response.status_code >= 400:
        if data.get("error_code") in _NO_ROUTE_CODES:
            raise NoRouteError("No route between these places fits a vehicle this tall.")
        raise UpstreamError(data.get("error") or f"Routing service returned HTTP {response.status_code}")

    trips = [data.get("trip")] + [alt.get("trip") for alt in data.get("alternates", [])]
    routes = [_route_from_trip(trip) for trip in trips if trip]
    if not routes:
        raise UpstreamError("Routing service returned no routes")
    return routes


def _route_from_trip(trip: dict) -> Route:
    points: list[Point] = []
    for leg in trip["legs"]:
        leg_points = decode_polyline(leg["shape"])
        points.extend(leg_points[1:] if points and leg_points and leg_points[0] == points[-1] else leg_points)
    summary = trip["summary"]
    return Route(line=Line(points), distance_m=summary["length"] * 1000, duration_s=summary["time"])


def _json(response: httpx.Response) -> dict:
    try:
        data = response.json()
    except ValueError as exc:
        raise UpstreamError(f"Routing service returned HTTP {response.status_code} with no JSON") from exc
    return data if isinstance(data, dict) else {}
