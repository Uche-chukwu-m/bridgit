"""The shapes of Bridgit's API. Heights are inches, distances metres, durations seconds."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class Place(BaseModel):
    label: str | None = None
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)


class TripRequest(BaseModel):
    origin: Place
    destination: Place
    vehicle_height_in: int = Field(ge=36, le=240, description="Total height, including anything on the roof")
    margin_in: int = Field(default=3, ge=0, le=24, description="Extra room to leave under every clearance")


class Clearance(BaseModel):
    name: str | None
    clearance_in: int
    spare_in: int
    status: Literal["blocked", "tight", "ok"]
    lat: float
    lon: float
    along_m: float
    osm_url: str


class RouteOption(BaseModel):
    distance_m: float
    duration_s: float
    verdict: Literal["clear", "caution", "unsafe"]
    geometry: list[tuple[float, float]]
    clearances: list[Clearance]


class Trip(BaseModel):
    vehicle_height_in: int
    margin_in: int
    checked: bool = Field(description="False if clearances along the routes couldn't be double-checked")
    recommended: int
    routes: list[RouteOption]


class HeightEstimate(BaseModel):
    vehicle: str
    low_in: int
    high_in: int
    roof_items: list[str]
    notes: str
