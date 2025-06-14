from fastapi import APIRouter, Body, Request, status

import datetime
import random
import string
from typing import Annotated
import json

from .. import db
from .. import schemas
from ..templates import templates
from .admin import sse_push_event

router = APIRouter()

FIND_TIN = """
SELECT * FROM TINDetailsT WHERE TIN = %s
"""

def generate_tin(cursor):
    while True:
        tin = ''.join(random.choices(string.digits, k=9))
        cursor.execute(FIND_TIN, (tin, ))
        if cursor.fetchone() == None:
            return tin

ADD_TINDETAILS = """
INSERT INTO TINDetailsT (TIN, RegOffice, BIRRegDate, PCN, RDOCode, TaxRateOpt, ExpAnnualGS, PHBusNum) 
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
"""

ADD_TAXPAYERDETAILS = """
INSERT INTO TaxpayerDetailsT (TaxpayerRegNum,
    TIN, TaxpayerType, TaxpayerName, Gender, CivilStatus, DateOfBirth, PlaceOfBirth,
    MothersName, FathersName, Citizenship, OtherCitizenship, LocalAddress,
    BusinessAddress, ForeignAddress, Purpose, IDType, IDNum, IDEffectivityDate,
    IDExpiryDate, Issuer, IDPlaceOfIssue, PrefConType, ContactNum, EmailAdd, SpouseTIN
) 
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

ADD_SPOUSEDETAILS = """
INSERT INTO SpouseDetailsT (SpouseTIN, EmpStatSpouse, SpouseName, SpouseEmpName, SpouseEmpTIN) VALUES (%s, %s, %s, %s, %s)
"""

ADD_BUSINESSDETAILS = """
INSERT INTO BusinessDetailsT (TIN, INDBusinessRegNum, INDRegBody, INDNum, INDBusName, INDBusinessRegDate, INDPSICCode, INDLineOfBusiness) 
VALUES (%s, %s, %s, %s, %s, %s, 0, %s)
"""

SELECT_COUNT = """
SELECT COUNT(*) FROM TINDetailsT
"""
@router.post('/api/register', status_code=status.HTTP_201_CREATED)
async def register(data: Annotated[schemas.FormData, Body()]):
    with db.get_connection() as conn, conn.cursor() as cursor:
        curr_date = datetime.date.today().isoformat()

        tin = generate_tin(cursor)

        cursor.execute(ADD_TINDETAILS, (tin, data.reg_office, curr_date, data.pcn, data.rdo_code, data.tax_rate_opt, data.exp_annual_gs, data.ph_bus_num))

        if data.civil_status == 'Married':
            cursor.execute(ADD_SPOUSEDETAILS, (data.spouse_tin, data.spouse_emp_stat, data.spouse_name, data.spouse_emp_name, data.spouse_emp_tin))
        
        cursor.execute(SELECT_COUNT)
        reg_num = cursor.fetchone()[0]

        cursor.fetchall()

        cursor.execute(ADD_TAXPAYERDETAILS, (reg_num, tin, data.taxpayer_type, data.taxpayer_name, data.gender, data.civil_status, data.date_of_birth, data.place_of_birth, 
                                            data.mothers_name, data.fathers_name, data.citizenship, data.other_citizenship, data.local_address, data.business_address,
                                            data.foreign_address, data.purpose, data.id_type, data.id_num, data.id_effectivity_date, data.id_expiry_date, data.id_issuer,
                                            data.id_place_of_issue, data.pref_con_type, data.contact_num, data.email_addr, data.spouse_tin))
        num = cursor.lastrowid
        for bus in data.business_details:
            cursor.execute(ADD_BUSINESSDETAILS, (tin, bus.business_reg_num, bus.reg_body, bus.num, bus.bus_name, bus.reg_date, bus.line_of_business))

        conn.commit()

    data = {
        'num': num,
        'name': data.taxpayer_name,
        'tin': str(tin)
    }
    await sse_push_event('register', json.dumps(data))

@router.get('/success')
async def success(request: Request):
    return templates.TemplateResponse(request=request, name="success.html")

@router.get('/register')
async def register(request: Request):
    return templates.TemplateResponse(request=request, name="register.html")
