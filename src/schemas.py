from pydantic import BaseModel, EmailStr
from typing import Annotated, Literal, Optional, List
from enum import Enum

import datetime

class BusinessDetails(BaseModel):
    business_reg_num: str
    reg_body: str
    num: int
    bus_name: str
    reg_date: datetime.date
    line_of_business: str

class FormData(BaseModel):
    model_config = {"extra": "forbid"}

    reg_office: Literal["Head Office", "Branch Office", "Facility"]
    pcn: Optional[str] = None
    tax_rate_opt: Literal["Yes", "No"]
    exp_annual_gs: Literal["Micro", "Small", "Medium", "Large"]
    rdo_code: str = ""
    
    taxpayer_type: str
    taxpayer_name: str
    gender: Literal["M", "F"]
    civil_status: Literal["Single", "Married", "Widow/er", "Legally Separated"]
    date_of_birth: datetime.date
    place_of_birth: str
    mothers_name: str
    fathers_name: str
    citizenship: str
    other_citizenship: Optional[str] = None
    local_address: str
    business_address: str
    foreign_address: Optional[str] = None
    purpose: str

    id_type: str
    id_num: str
    id_effectivity_date: datetime.date
    id_expiry_date: datetime.date
    id_issuer: str
    id_place_of_issue: str
    
    contact_num: str
    email_addr: EmailStr
    pref_con_type: Literal["Landline Number", "Fax Number", "Mobile Number"]

    spouse_emp_stat: Optional[Literal["Unemployed", "Employed Locally",
                             "Employed Abroad", "Engaged in Business/Practice of Profession"]] = None
    spouse_name: Optional[str] = None 
    spouse_tin: Optional[str] = None
    spouse_emp_name: Optional[str] = None
    spouse_emp_tin: Optional[str] = None

    ph_bus_num: str
    business_details: List[BusinessDetails] = []