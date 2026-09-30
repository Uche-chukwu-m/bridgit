"""Optional: a rough height range from a photo, using a vision model.

A photo can't measure a vehicle precisely, so this only ever returns a range
and the app plans with the top of it. It is a starting point, not a measurement.
"""

from __future__ import annotations

import base64
import json
import re

import httpx

from .config import Settings
from .errors import UpstreamError

PROMPT = """Estimate the total height of the vehicle in this photo, from the ground to its highest point, \
including anything on the roof (air conditioners, antennas, ladder racks, cargo boxes, light bars).

Use visible references for scale: wheels, doors, mirrors, people, parked cars. Be cautious: if unsure, widen the range.

Reply with JSON only, no other text:
{"vehicle": "<short description>", "low_in": <integer inches>, "high_in": <integer inches>, "roof_items": ["..."], "notes": "<one sentence>"}
If there is no road vehicle in the photo, reply {"vehicle": null}."""


async def estimate_height(client: httpx.AsyncClient, settings: Settings, image: bytes, media_type: str) -> dict:
    data_url = f"data:{media_type};base64,{base64.b64encode(image).decode()}"
    body = {
        "model": settings.vision_model,
        "messages": [{"role": "user", "content": [
            {"type": "text", "text": PROMPT},
            {"type": "image_url", "image_url": {"url": data_url}},
        ]}],
        "max_tokens": 300,
        "temperature": 0.2,
    }
    try:
        response = await client.post(f"{settings.vision_api_url}/chat/completions", json=body, timeout=60,
                                     headers={"Authorization": f"Bearer {settings.vision_api_key}"})
        response.raise_for_status()
        text = response.json()["choices"][0]["message"]["content"]
    except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError) as exc:
        raise UpstreamError(f"Photo estimate unavailable: {exc}") from exc
    return parse_estimate(text)


def parse_estimate(text: str) -> dict:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    try:
        data = json.loads(match.group(0)) if match else {}
    except json.JSONDecodeError:
        data = {}
    if not data.get("vehicle"):
        raise UpstreamError("Couldn't find a vehicle in that photo.")
    try:
        low, high = sorted((int(data["low_in"]), int(data["high_in"])))
    except (KeyError, TypeError, ValueError) as exc:
        raise UpstreamError("The photo estimate came back without a height.") from exc
    if not 48 <= low <= high <= 240:
        raise UpstreamError("The photo estimate wasn't believable. Please measure instead.")
    return {
        "vehicle": str(data["vehicle"]),
        "low_in": low,
        "high_in": high,
        "roof_items": [str(item) for item in data.get("roof_items") or []],
        "notes": str(data.get("notes") or ""),
    }
