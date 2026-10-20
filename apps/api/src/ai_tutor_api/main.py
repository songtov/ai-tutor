from fastapi import FastAPI

from ai_tutor_api.interface import health

app = FastAPI(title="ai-tutor", version="0.0.1")
app.include_router(health.router)
