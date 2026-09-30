"""Shared test helpers."""

from app.geo import METRES_PER_DEGREE, Point
import math


def encode_polyline(points: list[Point], precision: int = 6) -> str:
    factor = 10**precision
    out, prev_lat, prev_lon = [], 0, 0
    for lat, lon in points:
        ilat, ilon = round(lat * factor), round(lon * factor)
        for delta in (ilat - prev_lat, ilon - prev_lon):
            value = ~(delta << 1) if delta < 0 else delta << 1
            while value >= 0x20:
                out.append(chr((0x20 | (value & 0x1F)) + 63))
                value >>= 5
            out.append(chr(value + 63))
        prev_lat, prev_lon = ilat, ilon
    return "".join(out)


def offset(p: Point, north_m: float = 0.0, east_m: float = 0.0) -> Point:
    """Move a point a few metres north/east."""
    lat, lon = p
    return (lat + north_m / METRES_PER_DEGREE, lon + east_m / (METRES_PER_DEGREE * math.cos(math.radians(lat))))


def straight_road(start: Point, east_m: float, step_m: float = 50.0) -> list[Point]:
    """A road running due east from start, with a vertex every step_m."""
    n = int(east_m // step_m)
    return [offset(start, east_m=i * step_m) for i in range(n + 1)]
