import utils.db as db

connection = db.get_connection()
cursor = connection.cursor()

# 에브리타임 게시글 테이블 생성
cursor.execute('''
    CREATE TABLE IF NOT EXISTS everytime_articles (
        id VARCHAR(255) PRIMARY KEY,
        board_id VARCHAR(255),
        is_notice TINYINT(1),
        is_question TINYINT(1),
        title TEXT,
        text TEXT,
        created_at DATETIME,
        like_count INT,
        scrap_count INT,
        comment_count INT,
        first_comment_id VARCHAR(255),
        user_type VARCHAR(255),
        user_id VARCHAR(255),
        user_nickname VARCHAR(255),
        user_picture_url VARCHAR(255)
    )
''')

# 에브리타임 댓글 테이블 생성
cursor.execute('''
    CREATE TABLE IF NOT EXISTS everytime_comments (
        id VARCHAR(255) PRIMARY KEY,
        article_id VARCHAR(255),
        parent_id VARCHAR(255),
        text TEXT,
        created_at DATETIME,
        like_count INT,
        user_type VARCHAR(255),
        user_id VARCHAR(255),
        user_nickname VARCHAR(255),
        user_picture_url VARCHAR(255),
        FOREIGN KEY (article_id) REFERENCES everytime_articles(id)
    )
''')

# 에브리타임 게시글 레이블 정보 테이블 생성
cursor.execute('''
    CREATE TABLE IF NOT EXISTS everytime_article_labels (
        article_id VARCHAR(255) PRIMARY KEY,
        category_ids JSON,
        is_ambiguous TINYINT(1),
        is_verified TINYINT(1),
        FOREIGN KEY (article_id) REFERENCES everytime_articles(id)
    )
''')

db.close_connection()
