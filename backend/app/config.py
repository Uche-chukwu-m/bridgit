"""Settings, read from the environment (and a .env file, if present)."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    valhalla_url: str = "https://valhalla1.openstreetmap.de"
    overpass_url: str = "https://overpass-api.de/api/interpreter"
    photon_url: str = "https://photon.komoot.io"
    vision_api_url: str = "https://integrate.api.nvidia.com/v1"
    vision_api_key: str | None = None
    vision_model: str = "meta/llama-3.2-90b-vision-instruct"
    user_agent: str = "Bridgit/2.0 (https://github.com/Uche-chukwu-m/bridgit)"

    @classmethod
    def from_env(cls) -> "Settings":
        defaults = cls()
        return cls(
            valhalla_url=os.getenv("VALHALLA_URL", defaults.valhalla_url).rstrip("/"),
            overpass_url=os.getenv("OVERPASS_URL", defaults.overpass_url),
            photon_url=os.getenv("PHOTON_URL", defaults.photon_url).rstrip("/"),
            vision_api_url=os.getenv("VISION_API_URL", defaults.vision_api_url).rstrip("/"),
            vision_api_key=os.getenv("VISION_API_KEY") or os.getenv("NVIDIA_API_KEY") or None,
            vision_model=os.getenv("VISION_MODEL", defaults.vision_model),
        )
