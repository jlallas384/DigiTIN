from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

import os

from . import routes
from .templates import templates


app = FastAPI()

static_dir = os.path.join(os.path.dirname(__file__), 'static')

@app.get('/', response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")


app.include_router(routes.admin_router)
app.include_router(routes.applications_router)
app.include_router(routes.register_router)
app.include_router(routes.database_router)

app.mount('/', StaticFiles(directory=static_dir))