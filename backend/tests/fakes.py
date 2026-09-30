"""Stand-ins for the services Bridgit talks to, shaped like their real responses."""

from __future__ import annotations

import json
from urllib.parse import parse_qs

import httpx

from app.config import Settings
from app.geo import Point
from tests.helpers import encode_polyline

SETTINGS = Settings(
    valhalla_url="https://valhalla.test",
    overpass_url="https://overpass.test/api/interpreter",
    photon_url="https://photon.test",
    vision_api_url="https://vision.test/v1",
    vision_api_key="test-key",
)


def valhalla_trip(points: list[Point], length_km: float, time_s: float) -> dict:
    summary = {"length": length_km, "time": time_s}
    return {"legs": [{"shape": encode_polyline(points), "summary": summary, "maneuvers": []}],
            "summary": summary, "status": 0, "units": "kilometers"}


def valhalla_response(*trips: dict) -> dict:
    return {"trip": trips[0], "alternates": [{"trip": t} for t in trips[1:]]}


def overpass_way(osm_id: int, points: list[Point], **tags: str) -> dict:
    return {"type": "way", "id": osm_id, "tags": tags,
            "geometry": [{"lat": lat, "lon": lon} for lat, lon in points]}


def overpass_node(osm_id: int, point: Point, **tags: str) -> dict:
    return {"type": "node", "id": osm_id, "lat": point[0], "lon": point[1], "tags": tags}


class FakeServices:
    """Answers requests by host. Tweak the attributes to change what each service says."""

    def __init__(self):
        self.valhalla: tuple[int, dict] = (200, {})
        self.overpass: tuple[int, dict] = (200, {"elements": []})
        self.photon: tuple[int, dict] = (200, {"type": "FeatureCollection", "features": []})
        self.vision: tuple[int, dict] = (200, {})
        self.requests: list[httpx.Request] = []

    def transport(self) -> httpx.MockTransport:
        return httpx.MockTransport(self.handle)

    def handle(self, request: httpx.Request) -> httpx.Response:
        self.requests.append(request)
        status, body = {
            "valhalla.test": self.valhalla,
            "overpass.test": self.overpass,
            "photon.test": self.photon,
            "vision.test": self.vision,
        }[request.url.host]
        return httpx.Response(status, json=body)

    def last(self, host: str) -> httpx.Request:
        return [r for r in self.requests if r.url.host == host][-1]

    def valhalla_body(self) -> dict:
        return json.loads(self.last("valhalla.test").content)

    def overpass_query(self) -> str:
        return parse_qs(self.last("overpass.test").content.decode())["data"][0]
