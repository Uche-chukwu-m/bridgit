"""Planning a trip: route for the vehicle's height, then check every clearance on the way."""

from __future__ import annotations

import logging

import httpx

from .clearance import classify
from .config import Settings
from .errors import UpstreamError
from .models import Clearance, RouteOption, Trip, TripRequest
from .restrictions import fetch_restrictions, match_route
from .routing import fetch_routes

log = logging.getLogger(__name__)

DISPLAY_TOLERANCE_M = 2
_VERDICT_RANK = {"clear": 0, "unchecked": 1, "caution": 1, "unsafe": 2}


async def plan_trip(client: httpx.AsyncClient, settings: Settings, request: TripRequest) -> Trip:
    height, margin = request.vehicle_height_in, request.margin_in
    origin = (request.origin.lat, request.origin.lon)
    destination = (request.destination.lat, request.destination.lon)

    # Ask the router to keep the safety margin too, so it avoids anything tight, not just anything too low.
    routes = await fetch_routes(client, settings.valhalla_url, origin, destination, height + margin)

    try:
        restrictions = await fetch_restrictions(client, settings.overpass_url, [r.line for r in routes])
        checked = True
    except UpstreamError as exc:
        log.warning("Clearance check skipped: %s", exc)
        restrictions, checked = [], False

    options = []
    for route in routes:
        # Clients get a lighter line; distances along it are measured on that same line
        # so drive-time alerts line up with what's on screen.
        display = route.line.simplified(DISPLAY_TOLERANCE_M)
        clearances = []
        for match in match_route(restrictions, route.line):
            r = match.restriction
            clearances.append(Clearance(
                name=r.name,
                clearance_in=r.clearance_in,
                spare_in=r.clearance_in - height,
                status=classify(r.clearance_in, height, margin),
                lat=round(match.point[0], 6),
                lon=round(match.point[1], 6),
                along_m=round(display.locate(match.point)[1], 1),
                osm_url=r.osm_url,
            ))
        statuses = {c.status for c in clearances}
        if not checked:
            verdict = "unchecked"
        elif "blocked" in statuses:
            verdict = "unsafe"
        elif "tight" in statuses:
            verdict = "caution"
        else:
            verdict = "clear"
        options.append(RouteOption(
            distance_m=round(route.distance_m, 1),
            duration_s=round(route.duration_s),
            verdict=verdict,
            geometry=[(round(lat, 6), round(lon, 6)) for lat, lon in display.points],
            clearances=clearances,
        ))

    recommended = min(range(len(options)), key=lambda i: (_VERDICT_RANK[options[i].verdict], options[i].duration_s))
    return Trip(vehicle_height_in=height, margin_in=margin, checked=checked, recommended=recommended, routes=options)
