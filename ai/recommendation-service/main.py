try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
except Exception:
    # Fallback stubs for environments where fastapi isn't installed (editor/linters)
    from typing import Callable, Any

    class CORSMiddleware:  # stub
        pass

    class FastAPI:  # minimal stub to allow linting/editing
        def __init__(self, *args, **kwargs):
            pass

        def add_middleware(self, *args, **kwargs):
            return None

        def get(self, path: str) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
            def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
                return func

            return decorator
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EVENT_SERVICE_URL = "http://localhost:3002/events"

@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: str):
    events = requests.get(EVENT_SERVICE_URL).json()

    # простая логика для диплома:
    # сначала концерты и театр, потом остальные
    preferred = ["Концерт", "Театр"]

    recommended = sorted(
        events,
        key=lambda event: 0 if event.get("category") in preferred else 1
    )

    return recommended[:6]