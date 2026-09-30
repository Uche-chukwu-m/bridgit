import pytest

from app.clearance import classify, clearance_from_tags, parse_height


@pytest.mark.parametrize(
    "value, inches",
    [
        ("4", 157.48),
        ("3.8", 149.61),
        ("3,8", 149.61),
        ("3.8 m", 149.61),
        ("3.8m", 149.61),
        ("12'4\"", 148),
        ("12' 4\"", 148),
        ("12′4″", 148),
        ("12'4''", 148),
        ("12'", 144),
        ("12 ft 4 in", 148),
        ("12ft", 144),
        ("13'6", 162),
        # Feet typed without a unit are read as feet, not as a 13.5 m bridge.
        ("13.5", 162),
    ],
)
def test_parse_height(value, inches):
    assert parse_height(value) == pytest.approx(inches, abs=0.01)


@pytest.mark.parametrize("value", ["none", "default", "below_default", "", "3.5 @ (Mo-Fr)", "abc", "0.5", "99"])
def test_parse_height_rejects_non_heights(value):
    assert parse_height(value) is None


def test_clearance_uses_lowest_tag_and_rounds_down():
    tags = {"maxheight": "12'6\"", "maxheight:physical": "3.8", "name": "Main St"}
    assert clearance_from_tags(tags) == 149  # 3.8 m is 149.6 in


def test_clearance_ignores_unparseable_tags():
    assert clearance_from_tags({"maxheight": "default"}) is None
    assert clearance_from_tags({"maxheight": "default", "maxheight:physical": "4.2"}) == 165


@pytest.mark.parametrize(
    "clearance, status",
    [(137, "blocked"), (138, "tight"), (140, "tight"), (141, "ok")],
)
def test_classify(clearance, status):
    assert classify(clearance, vehicle_in=138, margin_in=3) == status
