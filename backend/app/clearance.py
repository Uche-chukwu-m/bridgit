"""Reading OpenStreetMap height tags, and deciding whether a vehicle fits.

Heights are inches throughout, because that is how clearances are signed in
the US. Anything that could round is rounded in the safe direction.
"""

from __future__ import annotations

import math
import re
from typing import Literal, Mapping

INCHES_PER_METRE = 1 / 0.0254

# Every tag that can describe the clearance for traffic on a way or at a node.
# When several are present we trust the lowest.
HEIGHT_TAGS = ("maxheight", "maxheight:physical", "maxheight:forward", "maxheight:backward")

_METRIC = re.compile(r"^(\d+(?:\.\d+)?)\s*(m)?$")
_IMPERIAL = re.compile(r"^(\d+)\s*(?:'|ft|feet)\s*(?:(\d+(?:\.\d+)?)\s*(?:\"|in|inches)?)?$")

# A unitless value above this is almost certainly feet typed without a unit
# (e.g. "13.5" on a US road). Reading it as feet is also the safer mistake.
_MAX_PLAUSIBLE_METRES = 6.5

Status = Literal["blocked", "tight", "ok"]


def parse_height(value: str) -> float | None:
    """Parse an OSM height value into inches, or None if it isn't a height."""
    text = (
        value.strip().lower()
        .replace(",", ".")
        .replace("′", "'").replace("’", "'")
        .replace("″", '"').replace("”", '"').replace("''", '"')
    )
    if m := _METRIC.match(text):
        number = float(m.group(1))
        if m.group(2) is None and _MAX_PLAUSIBLE_METRES < number <= 20:
            inches = number * 12
        else:
            inches = number * INCHES_PER_METRE
    elif m := _IMPERIAL.match(text):
        inches = int(m.group(1)) * 12 + float(m.group(2) or 0)
    else:
        return None  # "none", "default", "below_default", conditional values, typos...
    return inches if 36 <= inches <= 360 else None


def clearance_from_tags(tags: Mapping[str, str]) -> int | None:
    """Lowest clearance described by the tags, rounded down to whole inches."""
    heights = [h for key in HEIGHT_TAGS if key in tags and (h := parse_height(tags[key])) is not None]
    return math.floor(min(heights)) if heights else None


def classify(clearance_in: int, vehicle_in: int, margin_in: int) -> Status:
    spare = clearance_in - vehicle_in
    if spare < 0:
        return "blocked"
    if spare < margin_in:
        return "tight"
    return "ok"
