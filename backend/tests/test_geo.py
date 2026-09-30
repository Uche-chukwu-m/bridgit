import pytest

from app.geo import Line, decode_polyline, haversine_m
from tests.helpers import encode_polyline, offset, straight_road

DURHAM = (35.9940, -78.9103)


def test_decode_polyline_round_trips():
    points = [(35.994, -78.9103), (35.995123, -78.901), (-33.8, 151.2)]
    decoded = decode_polyline(encode_polyline(points))
    assert decoded == pytest.approx(points, abs=1e-6)


def test_decode_polyline_known_value():
    # Google's documented example, at precision 5.
    assert decode_polyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@", precision=5) == pytest.approx(
        [(38.5, -120.2), (40.7, -120.95), (43.252, -126.453)]
    )


def test_haversine_one_degree_of_latitude():
    assert haversine_m((0, 0), (1, 0)) == pytest.approx(111_195, rel=1e-3)


def test_locate_reports_offset_and_distance_along():
    line = Line(straight_road(DURHAM, east_m=1000))
    offset_m, along_m = line.locate(offset(DURHAM, north_m=20, east_m=300))
    assert offset_m == pytest.approx(20, abs=0.5)
    assert along_m == pytest.approx(300, abs=0.5)


def test_locate_respects_within():
    line = Line(straight_road(DURHAM, east_m=1000))
    assert line.locate(offset(DURHAM, north_m=20, east_m=300), within_m=10) is None
    assert line.locate(offset(DURHAM, north_m=5, east_m=300), within_m=10) is not None


def test_sample_spacing_and_ends():
    line = Line(straight_road(DURHAM, east_m=100))
    samples = line.sample(30)
    assert [round(d) for _, d in samples] == [0, 30, 60, 90, 100]
    assert samples[-1][0] == line.points[-1]


def test_simplified_drops_collinear_points_but_keeps_corners():
    road = straight_road(DURHAM, east_m=500) + [offset(DURHAM, north_m=300, east_m=500)]
    simple = Line(road).simplified(1.0)
    assert simple.points == [road[0], road[-2], road[-1]]
    assert simple.length_m == pytest.approx(800, abs=1)


def test_line_needs_two_points():
    with pytest.raises(ValueError):
        Line([DURHAM])
