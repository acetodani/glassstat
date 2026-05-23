from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import init_db
from app.api.routes import ingest, analytics, gear
from app.demo.seed import generate_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="GlassStat",
    description="Lens & gear usage analytics for photographers",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router)
app.include_router(analytics.router)
app.include_router(gear.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/demo/seed")
def seed_demo_data():
    count = generate_demo_data(5000)
    return {"message": f"Seeded {count} demo photos"}
