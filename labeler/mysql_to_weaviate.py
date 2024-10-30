import os
import time
import json
import pymysql
import weaviate
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv(override=True)

MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
MYSQL_USER = os.getenv('MYSQL_USER')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
MYSQL_DATABASE = os.getenv('MYSQL_DATABASE')

client = weaviate.Client(url='http://localhost:8090')

class_obj = {
    'class': 'Article',
    'vectorizer': 'none',
    'properties': [
        {'name': 'title', 'dataType': ['text']},
        {'name': 'text', 'dataType': ['text']},
        {'name': 'article_id', 'dataType': ['int']}
    ]
}

def setup_weaviate():
    try:
        if client.schema.exists('Article'):
            client.schema.delete_class('Article')
        client.schema.create_class(class_obj)
        print('Weaviate schema created successfully')
    except Exception as e:
        print(f'Error setting up Weaviate schema: {e}')
        raise

def get_total_count(connection):
    cursor = connection.cursor()
    cursor.execute('''
        SELECT COUNT(*) as count 
        FROM articles 
        JOIN article_embeddings ON articles.id = article_embeddings.id
    ''')
    result = cursor.fetchone()
    cursor.close()
    return result['count']

def process_batch(connection, offset, batch_size, pbar):
    cursor = connection.cursor()
    try:
        cursor.execute('''
            SELECT 
                articles.id,
                articles.title,
                articles.text,
                article_embeddings.embedding
            FROM articles
            JOIN article_embeddings ON articles.id = article_embeddings.id
            LIMIT %s OFFSET %s
        ''', (batch_size, offset))

        batch_data = cursor.fetchall()
        if not batch_data:
            return 0

        with client.batch as batch:
            batch.batch_size = batch_size
            for article in batch_data:
                embedding = json.loads(article['embedding'].replace("'", '"'))
                properties = {
                    'title': article['title'],
                    'text': article['text'],
                    'article_id': article['id']
                }
                batch.add_data_object(
                    data_object=properties,
                    class_name='Article',
                    vector=embedding
                )
                pbar.update(1)

        return len(batch_data)
    finally:
        cursor.close()

def main():
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
        setup_weaviate()
        total_records = get_total_count(connection)
        print(f'Total records to migrate: {total_records}')

        batch_size = 100
        offset = 0
        processed_total = 0

        with tqdm(total=total_records, desc='Migrating articles') as pbar:
            while processed_total < total_records:
                processed = process_batch(connection, offset, batch_size, pbar)
                if not processed:
                    break
                processed_total += processed
                offset += batch_size
                # time.sleep(1)

        print(f'\nMigration completed. Total records processed: {processed_total}')

    except KeyboardInterrupt:
        print('\nProcess interrupted by user')
    except Exception as e:
        print(f'An error occurred: {e}')
    finally:
        connection.close()

if __name__ == '__main__':
    main()
