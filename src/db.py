import mysql.connector.pooling
from . import config

db = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="pool",
    user=config.DB_USER,
    password=config.DB_PASSWORD,
    host=config.DB_HOST,
    database=config.DB_NAME,
    port=config.DB_PORT
)

def get_connection():
    return db.get_connection()

if __name__ == '__main__':
    with get_connection() as conn:
        cur = conn.cursor()

        cur.execute('SELECT * FROM TINDetailsT')

        for data in cur:
            print(data)        
