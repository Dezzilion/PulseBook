from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import ollama
import os
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


EVENT_SERVICE_URL = os.getenv(
    "EVENT_SERVICE_URL",
    "http://localhost:3002/events"
)

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

OLLAMA_HOST = os.getenv(
    "OLLAMA_HOST",
    "http://localhost:11434"
)

ollama_client = ollama.Client(host=OLLAMA_HOST)


class ChatRequest(BaseModel):
    userId: str
    message: str


@app.get("/")
def health():
    return {
        "status": "ok",
        "service": "recommendation-service",
        "model": OLLAMA_MODEL,
    }


@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: str):
    events = requests.get(EVENT_SERVICE_URL).json()

    preferred = ["Концерт", "Театр"]

    recommended = sorted(
        events,
        key=lambda event: 0 if event.get("category") in preferred else 1
    )

    return recommended[:6]


def is_invalid_message(message: str):
    text = message.strip().lower()

    if len(text) < 4:
        return True

    if not re.search(r"[а-яіїєґa-z]", text):
        return True

    random_patterns = ["авп", "ыыы", "фыв", "asdf", "qwerty", "123"]

    if text in random_patterns:
        return True

    return False


@app.post("/recommendations/chat")
def recommendation_chat(data: ChatRequest):
    user_message = data.message.strip()

    if is_invalid_message(user_message):
        return {
            "answer": "Пробачте, я не зрозумів ваш запит. Будь ласка, перепишіть його більш детально."
        }

    events = requests.get(EVENT_SERVICE_URL).json()

    events_text = "\n".join([
        f"- {event.get('title')} | "
        f"категорія: {event.get('category')} | "
        f"локація: {event.get('location')} | "
        f"ціна: {event.get('price')} грн | "
        f"дата: {event.get('date')}"
        for event in events
    ])

    system_prompt = """
Ти AI-помічник системи PulseBook для рекомендації культурних подій.

Правила:
1. Відповідай українською мовою.
2. Рекомендуй тільки події з наданого списку.
3. Не вигадуй події, яких немає у списку.
4. Якщо запит користувача незрозумілий або схожий на випадковий набір символів, відповідай тільки:
"Пробачте, я не зрозумів ваш запит. Будь ласка, перепишіть його більш детально."
5. Відповідь має бути дружньою, короткою і корисною.
"""

    user_prompt = f"""
Користувач написав:
"{user_message}"

Доступні події:
{events_text}

Порадь 2-3 найбільш відповідні події та коротко поясни вибір.
"""

    response = ollama_client.chat(
        model=OLLAMA_MODEL,
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
    )

    return {
        "answer": response["message"]["content"]
    }