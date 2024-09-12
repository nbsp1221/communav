# 프롬프트

'''
당신은 광운대학교의 에브리타임 커뮤니티 사이트 게시글 분류를 검증하는 전문가입니다. 당신의 분류 능력은 최고 수준이며, 매우 정확하고 일관된 결과를 제공합니다.

# 배경 지식
- 광운대학교는 서울에 위치한 공과대학 중심의 종합대학교입니다.
- 에브리타임은 대학생들이 주로 사용하는 익명 커뮤니티 서비스입니다.
- 게시글은 대학생들의 학업 관련 질문, 일상적인 고민, 캠퍼스 생활 정보 등 다양한 주제를 다룹니다.
- 주어진 모든 게시글은 이미 "수업" 카테고리(ID: 4)로 분류되어 있습니다.

# 카테고리
ID: 4, 수업 (강의 정보, 교수님 평가, 과제 및 시험 정보, 수강 추천, 수업 관련 질문 등 모든 수업 관련 주제)
ID: 5, 수업/이과 (수업 카테고리에 속한 자연과학, 공학, 의학 등 이공계열 전공 수업에 관한 정보 및 질문)
ID: 6, 수업/문과 (수업 카테고리에 속한 인문학, 사회과학, 예술, 체육 등 비이공계열 및 교양 수업에 관한 정보 및 질문)

# 가이드라인
1. 게시글을 주의 깊게 읽습니다.
2. 게시글의 주요 의도나 핵심 질문을 파악합니다.
3. 게시글 내용이 이공계 수업인지, 비이공계 수업인지, 또는 구분이 어려운지 판단합니다.
4. 판단에 따라 현재 카테고리를 "수업" (ID: 4)로 유지할지, 또는 "수업/이과" (ID: 5)나 "수업/문과" (ID: 6)로 변경할지 결정합니다.
5. 선택한 이유를 간단히 생각해 봅니다.
6. 최종 결정을 내립니다.

# 주의사항
- 각 게시글에 반드시 하나의 카테고리만 선택하세요. 중복 선택은 불가능합니다.
- 이공계 수업으로 명확히 구분 가능한 경우 → "수업/이과" (ID: 5)로 변경하세요.
- 비이공계 수업으로 명확히 구분 가능한 경우 → "수업/문과" (ID: 6)로 변경하세요.
- 구분이 어렵거나 이과/문과 수업 내용이 모두 포함된 경우 → "수업" (ID: 4) 유지하세요.
- 비속어나 은어가 사용되어도 내용에 집중하여 분류하세요.

# 예시
1. "내일 미적분학 시험인데 어려울까요?" → ID: 5 (수업/이과)
   이유: 미적분학은 명확한 이공계 과목이므로 "수업/이과"로 분류합니다.
2. "경영학원론 레포트 어떻게 쓰나요?" → ID: 6 (수업/문과)
   이유: 경영학은 사회과학 분야이므로 "수업/문과"로 분류합니다.
3. "체육 수업에서 배구 서브 연습하는데 잘 안 돼요." → ID: 6 (수업/문과)
   이유: 체육은 예체능 분야로, 비이공계열이므로 "수업/문과"로 분류합니다.
4. "이번에 6전공 하려고 하는데 ㄱㄴ?" → ID: 4 (수업)
   이유: 특정 과목이나 계열에 대한 언급 없이 일반적인 수강 관련 질문이므로 "수업" 카테고리로 분류합니다.
5. "C프랑 색채심리 중 하나 삽니다" → ID: 4 (수업)
   이유: 이공계(C프로그래밍)와 문과(색채심리) 과목이 동시에 언급되어 있어 특정 계열로 구분하기 어렵습니다. 따라서 일반적인 "수업" 카테고리로 분류합니다.

# 응답 형식
중요: 반드시 다음 JSON 형식의 리스트만을 응답으로 제공하세요. 추가 설명이나 주석은 포함하지 마세요.
{게시글 ID: 선택한 카테고리 ID, ...}

주어진 게시글들을 위 지침에 따라 신중하고 정확하게 재검증하여 지정된 형식으로 응답하세요.
결정이 어려운 경우 게시글을 다시 읽어보세요. 당신의 전문성을 믿고 최선의 판단을 내리세요.
'''

import json
import os
import pymysql
import time
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(override=True)

MYSQL_HOST = os.getenv('MYSQL_HOST')
MYSQL_PORT = int(os.getenv('MYSQL_PORT'))
MYSQL_USER = os.getenv('MYSQL_USER')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
MYSQL_DATABASE = os.getenv('MYSQL_DATABASE')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

CATEGORIES = [
    { 'id': 0, 'name': '자유', 'description': '기타 카테고리에 속하지 않는 다양한 주제의 게시글' },
    { 'id': 1, 'name': '학사', 'description': '수강신청, 학점, 전공, 학사 관리, 자퇴, 졸업, 학사 일정, 재수강 등 학업 관련 모든 사항' },
    { 'id': 2, 'name': '장학 · 행정', 'description': '등록금, 장학금, 학자금 대출, 각종 증명서 발급, 학생증, 휴학, 복학, 전과, 교환학생 프로그램 등 행정적 절차와 관련된 모든 사항' },
    { 'id': 3, 'name': '학교생활', 'description': '동아리 활동, 학교 행사, 축제, 교내 대회, 학생회 활동, 캠퍼스 생활 경험 공유 등 학업 외 대학 생활 전반' },
    { 'id': 4, 'name': '수업', 'description': '강의 정보, 교수님 평가, 과제 및 시험 정보, 수강 추천, 수업 관련 질문 등 모든 수업 관련 주제' },
    { 'id': 5, 'name': '수업/이과', 'description': '수업 카테고리에 속한 자연과학, 공학, 의학 등 이공계열 전공 수업에 관한 정보 및 질문' },
    { 'id': 6, 'name': '수업/문과', 'description': '수업 카테고리에 속한 인문학, 사회과학, 예술, 체육 등 비이공계열 및 교양 수업에 관한 정보 및 질문' },
    { 'id': 7, 'name': '캠퍼스', 'description': '도서관, 기숙사, 구내식당, 학교 건물, 교내 시설 이용, 주변 상권, 대중교통 등 캠퍼스 내부 및 주변 환경에 대한 정보와 문의' },
    { 'id': 8, 'name': '취업 · 진로', 'description': '인턴십, 채용 정보, 면접 후기, 자격증 준비, 대학원 진학, 취업 준비 팁, 진로 고민 등 졸업 후 진로와 관련된 모든 주제' },
    { 'id': 9, 'name': '일상생활', 'description': '대학생 건강 관리, 아르바이트, 자취 생활 팁, 시간 관리, 학업과 생활의 균형 등 대학생의 일상과 관련된 정보 공유' },
    { 'id': 10, 'name': '음식점 · 카페', 'description': '맛집, 카페, 술집 추천 및 리뷰, 배달음식 추천 등 식음료 관련 모든 정보' },
    { 'id': 11, 'name': '취미 · 여가', 'description': '운동, 게임, 영화, 음악, 여행, 독서, 요리 등 대학생들의 취미 활동 및 여가 생활 관련 정보 공유 및 모임' },
    { 'id': 12, 'name': '인간관계', 'description': '학교 친구, 선후배 관계, 연애, 대인관계 고민, 갈등 해결, 사회성 개발 등 인간관계에 관한 모든 주제' },
    { 'id': 13, 'name': '병역', 'description': '입대 준비, 군 복무 경험, 전역 후 학교 복귀, 대체 복무, 예비군 훈련 등 병역 의무와 관련된 정보 및 경험 공유' },
]

client = OpenAI(api_key=OPENAI_API_KEY)
connection = None

def get_articles(limit=100):
    cursor = connection.cursor()
    cursor.execute('''
        SELECT
            id,
            title,
            text,
            category_id
        FROM
            everytime_article_dataset_v2
        WHERE
            category_id = 4 AND is_verified IS NULL
        ORDER BY
            RAND()
        LIMIT
            %s
    ''', (limit,))
    articles = cursor.fetchall()
    cursor.close()
    print(f'Fetched {len(articles)} articles.')
    return articles

def update_articles(articles):
    cursor = connection.cursor()
    sql = '''
        UPDATE
            everytime_article_dataset_v2
        SET
            category_id = %s,
            is_verified = -1
        WHERE
            id = %s
    '''
    data = [(article['category_id'], article['id']) for article in articles]
    try:
        cursor.executemany(sql, data)
        connection.commit()
        print(f'Updated {cursor.rowcount} articles.')
    except Exception as error:
        connection.rollback()
        print(f'Failed to update articles: {error}')
    finally:
        cursor.close()

def classify_articles(articles):
    print('Classifying articles...')
    thread = client.beta.threads.create()
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role='user',
        content='\n'.join(['ID: {id}\n제목: {title}\n내용:\n```\n{text}\n```\n'.format(**article) for article in articles])
    )
    run = client.beta.threads.runs.create_and_poll(
        thread_id=thread.id,
        assistant_id='asst_mvmsiXtiqCPhcTvdO4ikKBjn'
    )
    if run.status != 'completed':
        print(f'Run is not completed. Status: {run.status}')
        return {}
    messages = client.beta.threads.messages.list(thread_id=thread.id)
    if not messages.data:
        print('No messages found.')
        return {}
    classifications = json.loads(messages.data[0].content[0].text.value)
    print('Completed classifying articles.')
    return classifications

if __name__ == '__main__':
    try:
        connection = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        while True:
            articles = get_articles()
            if not articles:
                print('No articles found.')
                break
            classifications = classify_articles(articles)
            if not classifications:
                print('No classifications found.')
                continue
            next_articles = []
            changed = 0
            for article in articles:
                next_category_id = int(classifications.get(str(article['id']), 4))
                next_articles.append({
                    'id': article['id'],
                    'category_id': next_category_id,
                })
                if next_category_id != 4:
                    changed += 1
                    with open('verify_category_id_4.txt', 'a') as f:
                        f.write(f'4 -> {next_category_id}\n')
                        f.write('[{id}] {title}\n{text}\n\n'.format(**article))
            print(f'Changed category for {changed} articles.')
            update_articles(next_articles)
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    except Exception as error:
        print(error)
    finally:
        connection.close()
