from .. import db

SELECT_FROM_TIN = """
SELECT TaxpayerRegNum, TINDetailsT.TIN, TaxpayerType, TaxpayerName, Gender, CivilStatus, DateOfBirth, PlaceOfBirth,
    MothersName, FathersName, Citizenship, OtherCitizenship, LocalAddress,
    BusinessAddress, ForeignAddress, Purpose, IDType, IDNum, IDEffectivityDate,
    IDExpiryDate, Issuer, IDPlaceOfIssue, PrefConType, ContactNum, EmailAdd, SpouseTIN,
    RegOffice, BIRRegDate, PCN, RDOCode, TaxRateOpt, ExpAnnualGS, PHBusNum
FROM TaxpayerDetailsT 
JOIN TINDetailsT ON TaxpayerDetailsT.TIN = TINDetailsT.TIN WHERE TINDetailsT.TIN = %s
"""

SELECT_SPOUSE_FROM_TIN = """
SELECT SpouseTIN, EmpStatSpouse, SpouseName, SpouseEmpName, SpouseEmpTIN 
FROM SpouseDetailsT
WHERE SpouseTIN = %s 
"""

SELECT_BUSINESS = """
SELECT INDNum, INDBusinessRegNum, INDRegBody, INDBusName, INDBusinessRegDate, INDPSICCode, INDLineOfBusiness
FROM BusinessDetailsT
WHERE TIN = %s
ORDER BY INDNum
"""

def get_info_from_tin(tin):
    with db.get_connection() as conn, conn.cursor(dictionary=True) as cursor:
        cursor.execute(SELECT_FROM_TIN, (tin, ))
        info = cursor.fetchone()
        cursor.fetchall()

        cursor.execute(SELECT_BUSINESS, (tin, ))
        info['Business'] = cursor.fetchall()

        spouse_tin = info['SpouseTIN']
        if spouse_tin:
            cursor.execute(SELECT_SPOUSE_FROM_TIN, (spouse_tin, ))
            info['Spouse'] = cursor.fetchone()

    return info