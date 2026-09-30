class UpstreamError(Exception):
    """A service Bridgit depends on failed or returned something unusable."""


class NoRouteError(Exception):
    """There is no route that a vehicle of the requested height can take."""
