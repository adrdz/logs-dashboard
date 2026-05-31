import logging
import traceback

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.logging_config import logger, request_logging_middleware, setup_logging
from app.routers import analytics, logs

setup_logging()

app = FastAPI(
    title="Logs Dashboard API",
    description="REST API for managing and analysing application logs.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Logging middleware ───────────────────────────────────────────────────────
app.middleware("http")(request_logging_middleware)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(logs.router)
app.include_router(analytics.router)


# ─── Exception handlers ───────────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    logger.warning("Validation error", extra={"errors": exc.errors(), "path": str(request.url)})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled exception",
        extra={
            "path": str(request.url),
            "error": str(exc),
            "traceback": traceback.format_exc(),
        },
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok"}
