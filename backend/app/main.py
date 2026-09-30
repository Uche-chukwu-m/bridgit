"""Bridgit's API. Run with: uvicorn app.main:app --reload"""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Query, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse

from .config import Settings
from .errors import NoRouteError, UpstreamError
from .models import HeightEstimate, Place, Trip, TripRequest
from .photo import estimate_height
from .places import search_places
from .trip import plan_trip

FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
MAX_PHOTO_BYTES = 8 * 1024 * 1024


def create_app(settings: Settings | None = None, transport: httpx.AsyncBaseTransport | None = None,
               static_dir: Path = FRONTEND_DIST) -> FastAPI:
    settings = settings or Settings.from_env()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        async with httpx.AsyncClient(transport=transport, headers={"User-Agent": settings.user_agent}) as client:
            app.state.client = client
            yield

    app = FastAPI(title="Bridgit API", version="2.0.0", lifespan=lifespan)

    @app.exception_handler(NoRouteError)
    async def no_route(_: Request, exc: NoRouteError):
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    @app.exception_handler(UpstreamError)
    async def upstream_failed(_: Request, exc: UpstreamError):
        return JSONResponse(status_code=502, content={"detail": str(exc)})

    @app.get("/api/health")
    async def health():
        return {"ok": True, "photo_estimate": bool(settings.vision_api_key)}

    @app.get("/api/places", response_model=list[Place])
    async def places(request: Request, q: str = Query(min_length=3, max_length=200)):
        return await search_places(request.app.state.client, settings.photon_url, q)

    @app.post("/api/trip", response_model=Trip)
    async def trip(request: Request, body: TripRequest):
        return await plan_trip(request.app.state.client, settings, body)

    @app.post("/api/estimate-height", response_model=HeightEstimate)
    async def estimate(request: Request, photo: UploadFile = File(...)):
        if not settings.vision_api_key:
            raise HTTPException(503, "Photo estimates aren't set up on this server.")
        if not (photo.content_type or "").startswith("image/"):
            raise HTTPException(415, "Please upload an image.")
        image = await photo.read(MAX_PHOTO_BYTES + 1)
        if len(image) > MAX_PHOTO_BYTES:
            raise HTTPException(413, "That photo is too large.")
        return await estimate_height(request.app.state.client, settings, image, photo.content_type)

    if static_dir.is_dir():
        _serve_frontend(app, static_dir.resolve())
    return app


def _serve_frontend(app: FastAPI, root: Path) -> None:
    """Serve the built frontend, falling back to index.html for client-side routes."""

    @app.get("/{path:path}", include_in_schema=False)
    async def frontend(path: str):
        if path.startswith("api/"):
            raise HTTPException(404)
        file = (root / path).resolve()
        if path and file.is_file() and file.is_relative_to(root):
            return FileResponse(file)
        return FileResponse(root / "index.html")


load_dotenv()
app = create_app()
