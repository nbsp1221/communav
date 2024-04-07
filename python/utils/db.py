import pymysql
from pymysql import Error
from . import env

connection = None

def get_connection():
    global connection
    try:
        if connection is None:
            connection = pymysql.connect(
                host=env.MYSQL_HOST,
                port=env.MYSQL_PORT,
                user=env.MYSQL_USER,
                password=env.MYSQL_PASSWORD,
                database=env.MYSQL_DATABASE,
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
            print('Connected to DB successfully.')
    except Error as error:
        print(f'Failed to connect to DB. {error}')
    return connection

def close_connection():
    global connection
    if connection is not None:
        connection.close()
        connection = None
