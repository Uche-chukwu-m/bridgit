"""Geometry helpers.

Points are (lat, lon) tuples in degrees. Distances are metres. The maths uses
a local flat-earth approximation around each query point, which is accurate to
well under a metre at the few-metre scales Bridgit cares about.
"""

from __future__ import annotations

import math
from typing import Sequence

Point = tuple[float, float]

EARTH_RADIUS_M = 6_371_008.8
METRES_PER_DEGREE = math.pi * EARTH_RADIUS_M / 180


def decode_polyline(encoded: str, precision: int = 6) -> list[Point]:
    """Decode an encoded polyline. Valhalla uses precision 6."""
    points: list[Point] = []
    factor = 10**precision
    index = lat = lon = 0
    while index < len(encoded):
        deltas = []
        for _ in range(2):
            shift = result = 0
            while True:
                byte = ord(encoded[index]) - 63
                index += 1
                result |= (byte & 0x1F) << shift
                shift += 5
                if byte < 0x20:
                    break
            deltas.append(~(result >> 1) if result & 1 else result >> 1)
        lat += deltas[0]
        lon += deltas[1]
        points.append((lat / factor, lon / factor))
    return points


def haversine_m(a: Point, b: Point) -> float:
    lat1, lon1, lat2, lon2 = map(math.radians, (*a, *b))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    return 2 * EARTH_RADIUS_M * math.asin(math.sqrt(h))


class Line:
    """A polyline with precomputed distances, so points can be located along it."""

    def __init__(self, points: Sequence[Point]):
        if len(points) < 2:
            raise ValueError("A line needs at least two points")
        self.points = list(points)
        self.cumulative = [0.0]
        for a, b in zip(self.points, self.points[1:]):
            self.cumulative.append(self.cumulative[-1] + haversine_m(a, b))
        self._grid: dict[tuple[int, int], list[int]] | None = None

    @property
    def length_m(self) -> float:
        return self.cumulative[-1]

    def locate(self, p: Point, within_m: float = math.inf) -> tuple[float, float] | None:
        """Return (offset_m, along_m) for the closest point on the line to p.

        offset_m is how far p is from the line; along_m is how far along the line
        the closest point lies. Returns None if p is further than within_m away.
        """
        lat, lon = p
        ky = METRES_PER_DEGREE
        kx = math.cos(math.radians(lat)) * METRES_PER_DEGREE
        # Cheap degree-space bounds let us skip far-away segments quickly.
        pad_lat = within_m / ky if within_m != math.inf else math.inf
        pad_lon = within_m / kx if within_m != math.inf and kx > 0 else math.inf

        best_d2 = within_m * within_m
        best_along = None
        pts, cum = self.points, self.cumulative
        for i in self._candidate_segments(lat, lon, pad_lat, pad_lon):
            (alat, alon), (blat, blon) = pts[i], pts[i + 1]
            if (lat < min(alat, blat) - pad_lat or lat > max(alat, blat) + pad_lat
                    or lon < min(alon, blon) - pad_lon or lon > max(alon, blon) + pad_lon):
                continue
            ax, ay = (alon - lon) * kx, (alat - lat) * ky
            dx, dy = (blon - alon) * kx, (blat - alat) * ky
            seg2 = dx * dx + dy * dy
            t = 0.0 if seg2 == 0 else min(1.0, max(0.0, -(ax * dx + ay * dy) / seg2))
            cx, cy = ax + t * dx, ay + t * dy
            d2 = cx * cx + cy * cy
            if d2 <= best_d2:
                best_d2 = d2
                best_along = cum[i] + t * (cum[i + 1] - cum[i])
        if best_along is None:
            return None
        return math.sqrt(best_d2), best_along

    _GRID_DEG = 0.005  # roughly 500 m cells

    def _candidate_segments(self, lat: float, lon: float, pad_lat: float, pad_lon: float):
        """Segment indices worth checking; a coarse grid keeps long routes fast."""
        if pad_lat == math.inf or pad_lon == math.inf:
            return range(len(self.points) - 1)
        size = self._GRID_DEG
        if self._grid is None:
            self._grid = {}
            for i, ((alat, alon), (blat, blon)) in enumerate(zip(self.points, self.points[1:])):
                for gy in range(math.floor(min(alat, blat) / size), math.floor(max(alat, blat) / size) + 1):
                    for gx in range(math.floor(min(alon, blon) / size), math.floor(max(alon, blon) / size) + 1):
                        self._grid.setdefault((gy, gx), []).append(i)
        found: set[int] = set()
        for gy in range(math.floor((lat - pad_lat) / size), math.floor((lat + pad_lat) / size) + 1):
            for gx in range(math.floor((lon - pad_lon) / size), math.floor((lon + pad_lon) / size) + 1):
                found.update(self._grid.get((gy, gx), ()))
        return sorted(found)

    def sample(self, step_m: float) -> list[tuple[Point, float]]:
        """Points every step_m along the line (plus both ends), with their distance along."""
        out: list[tuple[Point, float]] = []
        pts, cum = self.points, self.cumulative
        target, i = 0.0, 0
        while target < self.length_m:
            while cum[i + 1] < target:
                i += 1
            seg = cum[i + 1] - cum[i]
            t = 0.0 if seg == 0 else (target - cum[i]) / seg
            (alat, alon), (blat, blon) = pts[i], pts[i + 1]
            out.append(((alat + t * (blat - alat), alon + t * (blon - alon)), target))
            target += step_m
        out.append((pts[-1], self.length_m))
        return out

    def simplified(self, tolerance_m: float) -> "Line":
        """Douglas-Peucker simplification; no point moves more than tolerance_m."""
        pts = self.points
        xy = [(lon * math.cos(math.radians(lat)) * METRES_PER_DEGREE, lat * METRES_PER_DEGREE) for lat, lon in pts]
        keep = [False] * len(pts)
        keep[0] = keep[-1] = True
        stack = [(0, len(pts) - 1)]
        tol2 = tolerance_m * tolerance_m
        while stack:
            start, end = stack.pop()
            (sx, sy), (ex, ey) = xy[start], xy[end]
            dx, dy = ex - sx, ey - sy
            seg2 = dx * dx + dy * dy
            worst, worst_d2 = -1, tol2
            for i in range(start + 1, end):
                px, py = xy[i][0] - sx, xy[i][1] - sy
                t = 0.0 if seg2 == 0 else min(1.0, max(0.0, (px * dx + py * dy) / seg2))
                ox, oy = px - t * dx, py - t * dy
                d2 = ox * ox + oy * oy
                if d2 > worst_d2:
                    worst, worst_d2 = i, d2
            if worst != -1:
                keep[worst] = True
                stack.append((start, worst))
                stack.append((worst, end))
        return Line([p for p, k in zip(pts, keep) if k])
