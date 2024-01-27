import os
import pymysql
from dotenv import load_dotenv
from pymysql import Error

# .env 파일에서 환경 변수 로드
load_dotenv()

# DB 정보 설정
mysql_host = os.getenv('MYSQL_HOST')
mysql_port = int(os.getenv('MYSQL_PORT'))
mysql_user = os.getenv('MYSQL_USER')
mysql_password = os.getenv('MYSQL_PASSWORD')
mysql_database = os.getenv('MYSQL_DATABASE')
connection = None

# DB 연결 함수
def connect_database():
    global connection
    try:
        connection = pymysql.connect(
            host=mysql_host,
            port=mysql_port,
            user=mysql_user,
            password=mysql_password,
            database=mysql_database
        )
        print('Successfully connected to DB.')
    except Error as error:
        print(f'Failed to connect to DB. Error: {error}')

# SQL 실행 함수
def execute_sql(sql):
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
            connection.commit()
            print('Successfully executed SQL.')
    except Error as error:
        print(f'Failed to execute {sql}. Error: {error}')

# SQL 조회 함수
def execute_read_sql(sql):
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
            return cursor.fetchall()
    except Error as error:
        print(f'Failed to execute {sql}. Error: {error}')

# DB 연결
connect_database()

# 테이블 생성
execute_sql("""
    CREATE TABLE IF NOT EXISTS examples (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT NOT NULL
    );
""")

# 데이터 삽입
execute_sql("""
    INSERT INTO examples (name, age) VALUES
    ('Alice', 24),
    ('Bob', 30);
""")

# 데이터 조회
results = execute_read_sql("SELECT * FROM examples;")
for result in results:
    print(result)

# DB 연결 종료
connection.close()
