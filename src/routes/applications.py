from fastapi import Request, Depends, Query, APIRouter, Form, status, BackgroundTasks
from fastapi.responses import RedirectResponse

from typing import Annotated, List

from .admin import is_authed
from . import utils

from .. import db
from ..templates import templates
from ..email_service import send_email

router = APIRouter(prefix='/applications', dependencies=[Depends(is_authed)])

MAX_PER_PAGE = 10

SELECT_PENDING = """
SELECT TaxpayerRegNum, TaxpayerName, TaxpayerDetailsT.TIN
FROM TaxpayerDetailsT 
JOIN TINDetailsT ON TaxpayerDetailsT.TIN = TINDetailsT.TIN WHERE RDOCode = ''
ORDER BY TaxpayerDetailsT.TaxpayerRegNum
"""

@router.get('')
async def applications(request: Request, page: Annotated[int, Query(ge=1)] = 1):
    with db.get_connection() as conn, conn.cursor() as cursor:
        cursor.execute(SELECT_PENDING)
        pending = cursor.fetchall()


    total_page = (len(pending) + MAX_PER_PAGE - 1) // MAX_PER_PAGE
    
    pending = pending[(page - 1) * MAX_PER_PAGE: (page - 1) * MAX_PER_PAGE + MAX_PER_PAGE]

    return templates.TemplateResponse(request=request, name="applications.html", context={"pending": pending, "active": 2, "page": page, "total_page": total_page})


SELECT_EMAIL_ADD = """
SELECT EmailAdd FROM TaxpayerDetailsT WHERE TIN = %s
"""

UPDATE_RDOCODE = """
UPDATE TINDetailsT SET RDOCode = %s WHERE TIN = %s
"""

UPDATE_BUSINESS_PSIC = """
UPDATE BusinessDetailsT SET INDPSICCode = %s WHERE 
TIN = %s AND INDNum = %s
"""

@router.get('/{tin}')
async def view_application(request: Request, tin: str):
    info = utils.get_info_from_tin(tin)
    return templates.TemplateResponse(request=request, name="view_application.html", context={"active": 2, "info": info})


APPROVE_HTML = """
<p>Dear Applicant,</p>

<p>We are pleased to inform you that your Tax Identification Number (TIN) application has been approved.</p>

<p><strong>Your TIN:</strong> {}</p>

"""

REJECT_HTML = """
<p>Dear Applicant,</p>

<p>We regret to inform you that your Tax Identification Number (TIN) application has been rejected.</p>

<p><strong>Reason for rejection:</strong> {}</p>
"""

@router.post('/{tin}/approve')
async def approve_application(tin: str, rdo_code: Annotated[str, Form()], tasks: BackgroundTasks, psic_code: Annotated[List[int], Form()] = []):
    with db.get_connection() as conn, conn.cursor() as cursor:
        cursor.execute(SELECT_EMAIL_ADD, (tin, ))
        email_addr = cursor.fetchone()[0]
        cursor.execute(UPDATE_RDOCODE, (rdo_code, tin))

        for i, code, in enumerate(psic_code):
            cursor.execute(UPDATE_BUSINESS_PSIC, (code, tin, i + 1))
            
        conn.commit()

    html = APPROVE_HTML.format(tin)

    tasks.add_task(send_email, email_addr, 'TIN Registration', html)
    return RedirectResponse('/applications', status.HTTP_302_FOUND)

@router.post('/{tin}/reject')
async def reject_application(tin: str, reason: Annotated[str, Form()], tasks: BackgroundTasks,):
    with db.get_connection() as conn, conn.cursor() as cursor:
        cursor.execute(SELECT_EMAIL_ADD, (tin, ))
        email_addr = cursor.fetchone()[0]

    html = REJECT_HTML.format(reason)

    tasks.add_task(send_email, email_addr, 'TIN Registration', html)
    return RedirectResponse('/applications', status.HTTP_302_FOUND)