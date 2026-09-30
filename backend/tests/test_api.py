import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
from tests.fakes import (SETTINGS, FakeServices, overpass_node, overpass_way, valhalla_response,
                         valhalla_trip)
from tests.helpers import offset, straight_road

START = (35.9940, -78.9103)
FAST = straight_road(START, east_m=3000)
SLOW = [START, offset(START, north_m=1000), offset(START, north_m=1000, east_m=3000), FAST[-1]]


@pytest.fixture
def services():
    s = FakeServices()
    s.valhalla = (200, valhalla_response(valhalla_trip(FAST, 3.0, 240), valhalla_trip(SLOW, 5.0, 400)))
    return s


@pytest.fixture
def client(services, tmp_path):
    with TestClient(create_app(SETTINGS, services.transport(), static_dir=tmp_path / "none")) as c:
        yield c


def plan(client, height=138, margin=3):
    return client.post("/api/trip", json={
        "origin": {"lat": START[0], "lon": START[1], "label": "Start"},
        "destination": {"lat": FAST[-1][0], "lon": FAST[-1][1]},
        "vehicle_height_in": height,
        "margin_in": margin,
    })


def test_trip_routes_for_height_plus_margin(client, services):
    assert plan(client, height=138, margin=3).status_code == 200
    body = services.valhalla_body()
    assert body["costing"] == "truck"
    assert body["costing_options"]["truck"]["height"] == pytest.approx(141 * 0.0254, abs=0.01)


def test_trip_lists_every_clearance_on_each_route(client, services):
    services.overpass = (200, {"elements": [
        overpass_way(1, [offset(START, east_m=1000), offset(START, east_m=1030)], maxheight="12'4\"", name="Gregson Street"),
        overpass_way(2, [offset(START, east_m=2000), offset(START, east_m=2030)], maxheight="11'6\""),
        overpass_node(3, offset(START, north_m=1000, east_m=1500), maxheight="4.5"),
    ]})
    trip = plan(client, height=138).json()

    assert trip["checked"] is True
    fast, slow = trip["routes"]
    assert [(c["name"], c["clearance_in"], c["spare_in"], c["status"]) for c in fast["clearances"]] == [
        ("Gregson Street", 148, 10, "ok"),
        (None, 138, 0, "tight"),
    ]
    assert fast["clearances"][0]["along_m"] == pytest.approx(1000, abs=3)
    assert fast["clearances"][0]["osm_url"] == "https://www.openstreetmap.org/way/1"
    assert fast["verdict"] == "caution"
    assert [c["clearance_in"] for c in slow["clearances"]] == [177]
    assert slow["verdict"] == "clear"
    # The slower route wins because the fast one has a tight clearance.
    assert trip["recommended"] == 1
    assert fast["distance_m"] == 3000 and fast["duration_s"] == 240
    assert fast["geometry"][0] == pytest.approx(START) and len(fast["geometry"]) == 2


def test_trip_flags_a_clearance_the_vehicle_cannot_fit_under(client, services):
    services.overpass = (200, {"elements": [
        overpass_way(1, [offset(START, east_m=1000), offset(START, east_m=1030)], maxheight="11'"),
    ]})
    fast = plan(client, height=138).json()["routes"][0]
    assert fast["clearances"][0]["status"] == "blocked"
    assert fast["verdict"] == "unsafe"


def test_trip_still_returns_routes_when_the_double_check_is_unavailable(client, services):
    services.overpass = (504, {})
    response = plan(client)
    assert response.status_code == 200
    trip = response.json()
    assert trip["checked"] is False
    assert trip["recommended"] == 0 and len(trip["routes"]) == 2
    # Never "clear" when nothing was checked.
    assert {r["verdict"] for r in trip["routes"]} == {"unchecked"}


def test_trip_says_when_no_route_fits(client, services):
    services.valhalla = (400, {"error_code": 442, "error": "No path could be found for input", "status_code": 400})
    response = plan(client)
    assert response.status_code == 422
    assert "fits a vehicle this tall" in response.json()["detail"]


def test_trip_reports_a_broken_router(client, services):
    services.valhalla = (500, {"error": "Something went wrong"})
    response = plan(client)
    assert response.status_code == 502
    assert response.json()["detail"] == "Something went wrong"


@pytest.mark.parametrize("height", [20, 300])
def test_trip_rejects_impossible_heights(client, height):
    assert plan(client, height=height).status_code == 422


def test_places(client, services):
    services.photon = (200, {"type": "FeatureCollection", "features": [
        {"geometry": {"type": "Point", "coordinates": [-78.9103, 35.994]},
         "properties": {"name": "Durham", "state": "North Carolina", "country": "United States"}},
        {"geometry": {"type": "Point", "coordinates": [-78.91, 35.99]},
         "properties": {"housenumber": "300", "street": "Gregson Street", "city": "Durham",
                        "state": "North Carolina", "country": "United States"}},
        {"geometry": {"type": "Point", "coordinates": [-78.9, 35.9]},
         "properties": {"name": "Durham", "state": "North Carolina", "country": "United States"}},
    ]})
    response = client.get("/api/places", params={"q": "durham"})
    assert response.json() == [
        {"label": "Durham, North Carolina, United States", "lat": 35.994, "lon": -78.9103},
        {"label": "300 Gregson Street, Durham, North Carolina, United States", "lat": 35.99, "lon": -78.91},
    ]
    assert services.last("photon.test").url.params["q"] == "durham"


def test_places_needs_a_real_query(client):
    assert client.get("/api/places", params={"q": "du"}).status_code == 422


def test_health_reports_whether_photos_work(client, services, tmp_path):
    assert client.get("/api/health").json() == {"ok": True, "photo_estimate": True}
    with TestClient(create_app(Settings(), services.transport(), static_dir=tmp_path)) as bare:
        assert bare.get("/api/health").json()["photo_estimate"] is False
        assert bare.post("/api/estimate-height", files={"photo": ("a.jpg", b"x", "image/jpeg")}).status_code == 503


def test_estimate_height_from_photo(client, services):
    services.vision = (200, {"choices": [{"message": {"content":
        'Sure! {"vehicle": "15 ft box truck", "low_in": 132, "high_in": 126, "roof_items": [], "notes": "Wheels for scale."}'
    }}]})
    response = client.post("/api/estimate-height", files={"photo": ("truck.jpg", b"\xff\xd8jpeg", "image/jpeg")})
    assert response.status_code == 200
    assert response.json() == {"vehicle": "15 ft box truck", "low_in": 126, "high_in": 132,
                               "roof_items": [], "notes": "Wheels for scale."}
    sent = services.last("vision.test")
    assert sent.headers["authorization"] == "Bearer test-key"
    assert b"data:image/jpeg;base64," in sent.content


@pytest.mark.parametrize("content", [
    '{"vehicle": null}',
    'I cannot tell.',
    '{"vehicle": "car", "low_in": 10, "high_in": 12}',
])
def test_estimate_height_rejects_useless_answers(client, services, content):
    services.vision = (200, {"choices": [{"message": {"content": content}}]})
    response = client.post("/api/estimate-height", files={"photo": ("a.jpg", b"x", "image/jpeg")})
    assert response.status_code == 502


def test_estimate_height_needs_an_image(client):
    response = client.post("/api/estimate-height", files={"photo": ("a.txt", b"hello", "text/plain")})
    assert response.status_code == 415


def test_serves_the_built_frontend_with_client_side_routes(services, tmp_path):
    (tmp_path / "assets").mkdir()
    (tmp_path / "index.html").write_text("<html>bridgit</html>")
    (tmp_path / "assets" / "app.js").write_text("console.log(1)")
    (tmp_path.parent / "secret.txt").write_text("nope")
    with TestClient(create_app(SETTINGS, services.transport(), static_dir=tmp_path)) as c:
        assert c.get("/assets/app.js").text == "console.log(1)"
        assert c.get("/drive").text == "<html>bridgit</html>"
        assert "nope" not in c.get("/..%2Fsecret.txt").text
        assert c.get("/api/nothing").status_code == 404
