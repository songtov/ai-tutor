from fastapi import FastAPI

from ai_tutor_api.interface import health

app = FastAPI(title="ai-tutor")
app.include_router(health.router)
