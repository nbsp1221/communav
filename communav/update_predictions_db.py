import utils.db as db
from pymysql import Error

connection = db.get_connection()
cursor = connection.cursor()

sql_template = '''
    INSERT INTO everytime_article_predictions (id, category_id)
    SELECT
        id,
        {category_id} AS category_id
    FROM everytime_article_dataset
    WHERE probs_category_{category_id} > 0.5
    ON DUPLICATE KEY UPDATE category_id = VALUES(category_id)
'''

for category_id in range(14):
    sql = sql_template.format(category_id=category_id)

    try:
        cursor.execute(sql)
        connection.commit()
    except Error as error:
        print(f'Failed to update predictions to DB. {error}')

    print(f'Updated predictions for category {category_id} to DB.')

sql_template = '''
    INSERT INTO everytime_article_predictions (id, category_id)
    SELECT
        id,
        0 AS category_id
    FROM everytime_article_dataset
    WHERE {conditions}
    ON DUPLICATE KEY UPDATE category_id = VALUES(category_id)
'''

conditions = ' AND '.join([f'probs_category_{category_id} <= 0.5' for category_id in range(14)])
sql = sql_template.format(conditions=conditions)

try:
    cursor.execute(sql)
    connection.commit()
except Error as error:
    print(f'Failed to update predictions to DB. {error}')

db.close_connection()
