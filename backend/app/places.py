"""Place search with Photon (OpenStreetMap data, no API key)."""

from __future__ import annotations

import httpx

from .errors import UpstreamError


async def search_places(client: httpx.AsyncClient, base_url: str, query: str, limit: int = 5) -> list[dict]:
    try:
        response = await client.get(f"{base_url}/api/", params={"q": query, "limit": limit, "lang": "en"}, timeout=15)
        response.raise_for_status()
        features = response.json().get("features", [])
    except (httpx.HTTPError, ValueError) as exc:
        raise UpstreamError(f"Place search unavailable: {exc}") from exc

    places, seen = [], set()
    for feature in features:
        lon, lat = feature["geometry"]["coordinates"][:2]
        label = _label(feature.get("properties", {}))
        if label and label not in seen:
            seen.add(label)
            places.append({"label": label, "lat": lat, "lon": lon})
    return places


def _label(props: dict) -> str:
    street = " ".join(filter(None, [props.get("housenumber"), props.get("street")]))
    parts = [props.get("name") or street, props.get("city"), props.get("state"), props.get("country")]
    out: list[str] = []
    for part in parts:
        if part and part not in out:
            out.append(part)
    return ", ".join(out)
