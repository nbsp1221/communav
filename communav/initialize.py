import utils.db as db

connection = db.get_connection()
cursor = connection.cursor()

# 에브리타임 원본 게시글 테이블 생성
cursor.execute('''
    CREATE TABLE IF NOT EXISTS everytime_original_articles (
        id BIGINT PRIMARY KEY,
        board_id INT,
        is_notice TINYINT(1),
        is_question TINYINT(1),
        title TEXT,
        text TEXT,
        created_at DATETIME,
        like_count INT,
        scrap_count INT,
        comment_count INT,
        first_comment_id BIGINT,
        user_type VARCHAR(255),
        user_id VARCHAR(255),
        user_nickname VARCHAR(255),
        user_picture_url VARCHAR(255)
    )
''')

# 에브리타임 원본 댓글 테이블 생성
cursor.execute('''
    CREATE TABLE IF NOT EXISTS everytime_original_comments (
        id BIGINT PRIMARY KEY,
        article_id BIGINT,
        parent_id BIGINT,
        text TEXT,
        created_at DATETIME,
        like_count INT,
        user_type VARCHAR(255),
        user_id VARCHAR(255),
        user_nickname VARCHAR(255),
        user_picture_url VARCHAR(255),
        FOREIGN KEY (article_id) REFERENCES everytime_original_articles(id)
    )
''')

# 에브리타임 게시글 데이터셋 테이블 생성
cursor.execute('''
    CREATE TABLE IF NOT EXISTS everytime_article_dataset (
        id BIGINT PRIMARY KEY,
        title TEXT,
        text TEXT,
        category_id INT,
        is_verified TINYINT(1),
        predicted_category_id INT,
        probs_category_0 FLOAT,
        probs_category_1 FLOAT,
        probs_category_2 FLOAT,
        probs_category_3 FLOAT,
        probs_category_4 FLOAT,
        probs_category_5 FLOAT,
        probs_category_6 FLOAT,
        probs_category_7 FLOAT,
        probs_category_8 FLOAT,
        probs_category_9 FLOAT,
        probs_category_10 FLOAT,
        probs_category_11 FLOAT,
        probs_category_12 FLOAT,
        probs_category_13 FLOAT,
        FOREIGN KEY (id) REFERENCES everytime_original_articles(id)
    )
''')

# 에브리타임 게시글 예측 결과 테이블 생성
cursor.execute('''
    CREATE TABLE IF NOT EXISTS everytime_article_predictions (
        id BIGINT PRIMARY KEY,
        category_id INT,
        FOREIGN KEY (id) REFERENCES everytime_original_articles(id)
    )
''')

# cursor.execute('''
#     CREATE TABLE IF NOT EXISTS everytime_article_labels (
#         article_id VARCHAR(255) PRIMARY KEY,
#         category_ids JSON,
#         is_ambiguous TINYINT(1),
#         is_verified TINYINT(1),
#         FOREIGN KEY (article_id) REFERENCES everytime_articles(id)
#     )
# ''')

db.close_connection()
