import os
import re
import time
import emoji
import pymysql
import numpy as np
from openai import OpenAI
from tqdm import tqdm
from dotenv import load_dotenv
from soynlp.normalizer import repeat_normalize

# 환경 변수 로드
load_dotenv(override=True)

# 환경 변수 설정
MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
MYSQL_USER = os.getenv('MYSQL_USER')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
MYSQL_DATABASE = os.getenv('MYSQL_DATABASE')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# 데이터 전처리 함수 정의
normal_pattern = re.compile(r'[^ .,?!/@$%~％·∼()\x00-\x7Fㄱ-ㅣ가-힣]+')
url_pattern = re.compile(r'https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)')

def preprocess(value):
    if not value:
        return ''
    value = normal_pattern.sub(' ', value)
    value = emoji.replace_emoji(value, replace='')
    value = url_pattern.sub('', value)
    value = repeat_normalize(value, num_repeats=2)
    value = value.strip()
    return value

def get_embeddings_batch(texts, client: OpenAI):
    try:
        response = client.embeddings.create(
            input=texts,
            model='text-embedding-3-large'
        )
        return [data.embedding for data in response.data]
    except Exception as e:
        print(f'Error creating embeddings: {e}')
        return None

def process_batch(articles, client, connection):
    # 텍스트 전처리 및 결합
    processed_texts = []
    article_ids = []

    for article in articles:
        title = preprocess(article['title'])
        text = preprocess(article['text'])
        combined_text = f'{title} {text}'.strip()

        if combined_text:  # 빈 문자열이 아닌 경우만 처리
            processed_texts.append(combined_text)
            article_ids.append(article['id'])

    if not processed_texts:
        return 0

    # 임베딩 생성
    embeddings = get_embeddings_batch(processed_texts, client)
    if not embeddings:
        return 0

    # DB 업데이트
    cursor = connection.cursor()
    updated = 0

    for article_id, embedding in zip(article_ids, embeddings):
        try:
            cursor.execute('''
                INSERT INTO article_embeddings (id, embedding)
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE 
                embedding = VALUES(embedding)
            ''', (article_id, str(embedding)))
            updated += 1
        except Exception as e:
            print(f'Error updating article {article_id}: {e}')
            connection.rollback()
            continue

    connection.commit()
    cursor.close()

    return updated

def main():
    # OpenAI 클라이언트 초기화
    client = OpenAI(api_key=OPENAI_API_KEY)

    # DB 연결
    connection = pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        # 전체 게시글 수 확인
        cursor = connection.cursor()
        cursor.execute('''
            SELECT COUNT(*) as count 
            FROM articles
            LEFT JOIN article_embeddings ON articles.id = article_embeddings.id 
            WHERE article_embeddings.id IS NULL
        ''')
        total_articles = cursor.fetchone()['count']
        cursor.close()

        print(f'Total articles to process: {total_articles}')

        # 배치 처리
        batch_size = 10
        processed_total = 0

        with tqdm(total=total_articles) as pbar:
            while True:
                cursor = connection.cursor()
                cursor.execute('''
                    SELECT
                        articles.id,
                        articles.title,
                        articles.text 
                    FROM articles
                    LEFT JOIN article_embeddings ON articles.id = article_embeddings.id 
                    WHERE article_embeddings.id IS NULL
                    ORDER BY RAND()
                    LIMIT %s
                ''', (batch_size,))
                articles = cursor.fetchall()
                cursor.close()

                if not articles:
                    break

                # 배치 처리 및 업데이트
                updated = process_batch(articles, client, connection)
                processed_total += updated
                pbar.update(len(articles))

                # 처리 현황 출력
                print(f'\nProcessed batch: {updated}/{len(articles)} articles successful')
                print(f'Total processed: {processed_total}/{total_articles}')

                # API 레이트 리밋을 위한 딜레이
                time.sleep(1)

    except KeyboardInterrupt:
        print('\nProcess interrupted by user')
    except Exception as e:
        print(f'An error occurred: {e}')
    finally:
        connection.close()
        print(f'\nFinal total processed: {processed_total}/{total_articles}')

if __name__ == '__main__':
    main()
