import asyncio

import httpx
import pytest

from app.errors import UpstreamError
from app.geo import Line
from app.restrictions import Restriction, build_query, fetch_restrictions, match_route
from tests.fakes import SETTINGS, FakeServices, overpass_node, overpass_way
from tests.helpers import offset, straight_road

START = (35.9940, -78.9103)
ROUTE = Line(straight_road(START, east_m=2000))


def way(osm_id, points, clearance_in=148, **tags):
    return Restriction("way", osm_id, tags, points, clearance_in)


def node(osm_id, point, clearance_in=148):
    return Restriction("node", osm_id, {}, [point], clearance_in)


def test_matches_a_restricted_stretch_the_route_drives_along():
    under_bridge = way(1, [offset(START, east_m=500), offset(START, east_m=540)], name="Gregson Street")
    [match] = match_route([under_bridge], ROUTE)
    assert match.restriction is under_bridge
    assert match.along_m == pytest.approx(500, abs=2)


def test_matches_when_the_route_uses_only_part_of_a_long_restricted_way():
    # Joins from the south at 1500 m, shares 500 m with the route, then carries on past its end.
    long_way = way(1, [offset(START, north_m=-800, east_m=1500), offset(START, east_m=1500), offset(START, east_m=2400)])
    [match] = match_route([long_way], ROUTE)
    assert match.along_m == pytest.approx(1500, abs=2)


def test_ignores_a_restricted_road_that_only_crosses_the_route():
    # The road underneath a bridge the route drives over.
    crossing = way(1, [offset(START, north_m=-100, east_m=700), offset(START, north_m=100, east_m=700)])
    assert match_route([crossing], ROUTE) == []


def test_ignores_a_parallel_road_nearby():
    frontage = way(1, [offset(START, north_m=12, east_m=100), offset(START, north_m=12, east_m=600)])
    assert match_route([frontage], ROUTE) == []


def test_matches_a_height_barrier_node_on_the_route_only():
    on_route = node(1, offset(START, east_m=1200))
    off_route = node(2, offset(START, north_m=25, east_m=1300))
    [match] = match_route([on_route, off_route], ROUTE)
    assert match.restriction is on_route


def test_merges_one_structure_split_across_ways_keeping_the_lowest():
    first = way(1, [offset(START, east_m=800), offset(START, east_m=820)], clearance_in=150)
    second = way(2, [offset(START, east_m=820), offset(START, east_m=845)], clearance_in=146)
    later = way(3, [offset(START, east_m=1500), offset(START, east_m=1530)], clearance_in=160)
    matches = match_route([later, second, first], ROUTE)
    assert [m.restriction.clearance_in for m in matches] == [146, 160]
    assert matches[0].along_m == pytest.approx(800, abs=2)


def test_query_covers_every_point_of_a_long_route():
    zigzag = Line([offset(START, north_m=(i % 2) * 30, east_m=i * 30) for i in range(1000)])
    query = build_query([zigzag])
    assert query.count("way[") == 3  # 1000 points in chunks of 400 that share their ends
    last_lat, last_lon = zigzag.points[-1]
    assert f"{last_lat:.6f},{last_lon:.6f});" in query


def fetch(services, lines=(ROUTE,)):
    async def go():
        async with httpx.AsyncClient(transport=services.transport()) as client:
            return await fetch_restrictions(client, SETTINGS.overpass_url, list(lines))
    return asyncio.run(go())


def test_fetch_reads_ways_and_nodes_and_skips_unusable_tags():
    services = FakeServices()
    services.overpass = (200, {"elements": [
        overpass_way(10, [START, offset(START, east_m=30)], maxheight="12'4\"", name="Gregson Street"),
        overpass_node(11, offset(START, east_m=900), maxheight="3.5", barrier="height_restrictor"),
        overpass_way(12, [START, offset(START, east_m=30)], maxheight="default"),
    ]})
    restrictions = fetch(services)
    assert [(r.osm_type, r.osm_id, r.clearance_in) for r in restrictions] == [("way", 10, 148), ("node", 11, 137)]
    assert restrictions[0].name == "Gregson Street"
    assert restrictions[0].osm_url == "https://www.openstreetmap.org/way/10"
    assert "around:10," in services.overpass_query()


@pytest.mark.parametrize("response", [
    (429, {}),
    (200, {"elements": [], "remark": "runtime error: Query timed out in \"query\" at line 3 after 120 seconds."}),
])
def test_fetch_refuses_to_pass_off_partial_data(response):
    services = FakeServices()
    services.overpass = response
    with pytest.raises(UpstreamError):
        fetch(services)
