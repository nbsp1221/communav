import random
import requests
import time
import xmltodict
import utils.db as db
import utils.env as env
from bs4 import BeautifulSoup
from pymysql import Error

common_headers = {
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9,ko-KR;q=0.8,ko;q=0.7',
    'Authority': 'api.everytime.kr',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Cookie': env.EVERYTIME_COOKIE,
    'Origin': 'https://everytime.kr',
    'Referer': 'https://everytime.kr/',
    'Sec-CH-UA': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'Sec-CH-UA-Mobile': '?0',
    'Sec-CH-UA-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
}

def fetch_articles(board_id, start, limit):
    url = 'https://api.everytime.kr/find/board/article/list'
    data = {
        'id': board_id,
        'limit_num': limit,
        'start_num': start,
    }
    response = requests.post(url, headers=common_headers, data=data)
    return xmltodict.parse(response.text)

def fetch_comments(article_id):
    url = 'https://api.everytime.kr/find/board/comment/list'
    data = {
        'id': article_id,
        'limit_num': -1,
        'articleInfo': 'true'
    }
    response = requests.post(url, headers=common_headers, data=data)
    return xmltodict.parse(response.text)

def insert_article_to_db(board_id, article):
    connection = db.get_connection()
    cursor = connection.cursor()

    sql = '''
        INSERT INTO everytime_articles (
            id,
            board_id,
            is_notice,
            is_question,
            title,
            text,
            created_at,
            like_count,
            scrap_count,
            comment_count,
            first_comment_id,
            user_type,
            user_id,
            user_nickname,
            user_picture_url
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            text = VALUES(text),
            like_count = VALUES(like_count),
            scrap_count = VALUES(scrap_count),
            comment_count = VALUES(comment_count);
    '''

    data = (
        article['@id'],
        board_id,
        1 if article['@is_notice'] == 'true' else 0,
        1 if article['@is_question'] == 'true' else 0,
        article['@title'],
        BeautifulSoup(article['@text'], 'html.parser').get_text('\n'),
        article['@created_at'],
        article['@posvote'],
        article['@scrap_count'],
        article['@comment'],
        article.get('@first_comment_id', None),
        article['@user_type'],
        article['@user_id'],
        article['@user_nickname'],
        article['@user_picture']
    )

    try:
        cursor.execute(sql, data)
        connection.commit()
    except Error as error:
        print(f'Failed to insert article to DB. {error}')
    finally:
        cursor.close()

def insert_comment_to_db(article_id, comments):
    if len(comments) == 0:
        return
    if not isinstance(comments, list):
        comments = [comments]

    connection = db.get_connection()
    cursor = connection.cursor()

    sql = '''
        INSERT INTO everytime_comments (
            id,
            article_id,
            parent_id,
            text,
            created_at,
            like_count,
            user_type,
            user_id,
            user_nickname,
            user_picture_url
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            text = VALUES(text),
            like_count = VALUES(like_count);
    '''

    data = [
        (
            comment['@id'],
            article_id,
            comment['@parent_id'],
            BeautifulSoup(comment['@text'], 'html.parser').get_text('\n'),
            comment['@created_at'],
            comment['@posvote'],
            comment['@user_type'],
            comment['@user_id'],
            comment['@user_nickname'],
            comment['@user_picture']
        )
        for comment in comments if comment['@id'] != '0'
    ]

    try:
        cursor.executemany(sql, data)
        connection.commit()
    except Error as error:
        print(f'Failed to insert comment to DB. {error}')
    finally:
        cursor.close()

def main():
    board_id = '370443'
    start = 0
    limit = 20

    if db.get_connection() is None:
        return

    while True:
        time.sleep(random.randint(1, 5))

        articles = fetch_articles(board_id, start, limit)['response']['article']
        article_ids = [article['@id'] for article in articles]
        print(f'Fetching articles from {start} to {start + limit - 1}...')

        if len(article_ids) == 0:
            print('No more articles to fetch.')
            break

        for article_id in article_ids:
            time.sleep(random.randint(1, 5))

            response = fetch_comments(article_id)['response']
            article = response['article']
            comments = response.get('comment', [])
            print(f'Fetched article {article_id} with {len(comments)} comments. | {article["@title"]}')

            insert_article_to_db(board_id, article)
            insert_comment_to_db(article_id, comments)

        start += limit

    db.close_connection()

if __name__ == '__main__':
    main()
