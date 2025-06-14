from fastapi import APIRouter, Request, status, Form, Cookie, HTTPException, Depends
from fastapi.responses import RedirectResponse, StreamingResponse, Response

from asyncio import sleep
from asyncio.queues import Queue

from typing import Annotated

from .. import config
from ..templates import templates
from .. import db

router = APIRouter()

SELECT_RECENT = """
SELECT TaxpayerRegNum, TaxpayerName, TaxpayerDetailsT.TIN, RDOCode != '' AS Status 
FROM TaxpayerDetailsT 
JOIN TINDetailsT ON TaxpayerDetailsT.TIN = TINDetailsT.TIN 
ORDER BY TaxpayerRegNum DESC LIMIT 9
"""

SELECT_PENDING_COUNT = """
SELECT COUNT(*) FROM TINDetailsT WHERE RDOCode = ''
"""

SELECT_TOTAL_COUNT = """
SELECT COUNT(*) FROM TINDetailsT
"""

def is_authed(session_id: Annotated[str | None, Cookie()] = None):
    if session_id != config.SESSION_ID:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
@router.get('/login')
async def login(request: Request, session_id: Annotated[str | None, Cookie()] = None):
    if session_id == config.SESSION_ID:
        return RedirectResponse('/dashboard', status.HTTP_302_FOUND)
    
    return templates.TemplateResponse(request=request, name="login.html")

@router.post('/login')
async def login(request: Request, username: Annotated[str, Form()], password: Annotated[str, Form()]):
    if username == config.ADMIN_USERNAME and password == config.ADMIN_PASSWORD:
        response = RedirectResponse('/dashboard', status.HTTP_302_FOUND)
        response.set_cookie(key="session_id", value=config.SESSION_ID, max_age=86400)
        return response
    
    return templates.TemplateResponse(request=request, name="login.html", context={"error": True})

@router.get('/logout')
async def logout():
    response = RedirectResponse('/login')
    response.delete_cookie('session_id')
    return response


sse_queues = []

async def sse_push_event(event, data):
    global sse_queues
    sse_new_queues = []
    for q, is_disconnected in sse_queues:
        if not await is_disconnected():
            print("SENDING EVENT")
            sse_new_queues.append((q, is_disconnected))
            await q.put(f'event: {event}\ndata: {data}\n\n')
    sse_queues = sse_new_queues

@router.get('/dashboard', dependencies=[Depends(is_authed)])
async def dashboard(request: Request):
    with db.get_connection() as conn, conn.cursor() as cursor:
        cursor.execute(SELECT_RECENT)
        recent_applications = cursor.fetchall()
        cursor.execute(SELECT_PENDING_COUNT)
        pending_count = cursor.fetchone()[0]
        cursor.execute(SELECT_TOTAL_COUNT)
        total_count = cursor.fetchone()[0]

    return templates.TemplateResponse(request=request, name="dashboard.html", context={
        "recent_applications": recent_applications, 
        "active": 0, 
        "pending_count": pending_count,
        "total_count": total_count
    })

@router.get('/dashboard/sse')
async def dashboard_sse(request: Request):
    q = Queue()
    sse_queues.append((q, request.is_disconnected))

    async def events():
        while True:
            yield await q.get()

    return StreamingResponse(events(), media_type='text/event-stream')