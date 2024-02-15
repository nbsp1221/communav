import os
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv(override=True)

# DB 관련 정보
MYSQL_ROOT_PASSWORD = os.getenv('MYSQL_ROOT_PASSWORD')
MYSQL_DATABASE = os.getenv('MYSQL_DATABASE')
MYSQL_USER = os.getenv('MYSQL_USER')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
MYSQL_PORT = int(os.getenv('MYSQL_PORT'))
MYSQL_HOST = os.getenv('MYSQL_HOST')
PHPMYADMIN_PORT = int(os.getenv('PHPMYADMIN_PORT'))

# 에브리타임 접속 정보
EVERYTIME_COOKIE = os.getenv('EVERYTIME_COOKIE')
