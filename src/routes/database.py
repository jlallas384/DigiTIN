from fastapi import Request, Depends, Query, APIRouter

from typing import Annotated
import json

from .admin import is_authed
from . import utils

from .. import db
from ..templates import templates

router = APIRouter(prefix='/database', dependencies=[Depends(is_authed)])

MAX_PER_PAGE = 10

SELECT_APPROVED_BY_NAME = """
SELECT TaxpayerDetailsT.TIN, TaxpayerName
FROM TaxpayerDetailsT 
JOIN TINDetailsT ON TaxpayerDetailsT.TIN = TINDetailsT.TIN 
WHERE RDOCode != '' AND TaxpayerName LIKE %s
ORDER BY TaxpayerRegNum DESC
"""

SELECT_APPROVED_BY_TIN = """
SELECT TaxpayerDetailsT.TIN, TaxpayerName
FROM TaxpayerDetailsT 
JOIN TINDetailsT ON TaxpayerDetailsT.TIN = TINDetailsT.TIN 
WHERE RDOCode != '' AND TaxpayerDetailsT.TIN LIKE %s
ORDER BY TaxpayerRegNum DESC
"""


@router.get('')
async def database(request: Request, kind: str = "", value: str = "", page: Annotated[int, Query(ge=1)] = 1):
    like_string = f'%{value}%'
    with db.get_connection() as conn, conn.cursor() as cursor:
        if kind == 'name':
            cursor.execute(SELECT_APPROVED_BY_NAME, (like_string, ))
        else:
            cursor.execute(SELECT_APPROVED_BY_TIN, (like_string, ))
        approved = cursor.fetchall()

    total_page = (len(approved) + MAX_PER_PAGE - 1) // MAX_PER_PAGE
    
    approved = approved[(page - 1) * MAX_PER_PAGE: (page - 1) * MAX_PER_PAGE + MAX_PER_PAGE]

    return templates.TemplateResponse(request=request, name="database.html", context={"approved": approved, "active": 1, "page": page, "total_page": total_page})


@router.get('/{tin}')
async def view_database(request: Request, tin: str):
    info = utils.get_info_from_tin(tin)
    return templates.TemplateResponse(request=request, name="view_database.html", context={"active": 1, "info": info})