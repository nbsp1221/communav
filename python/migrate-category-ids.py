import json
from pymysql import Error
import utils.db as db

connection = db.get_connection()
cursor = connection.cursor()

sql = 'SELECT * FROM everytime_article_labels'
cursor.execute(sql)
rows = cursor.fetchall()

mapper = {
    2: 100,
    3: 101,
    4: 7,
    5: 8,
    6: 9,
    7: 10,
    8: 11
}

for row in rows:
    category_ids = list(map(lambda x: mapper[x] if x in mapper else x, json.loads(row['category_ids'])))
    sql = 'UPDATE everytime_article_labels SET category_ids = %s WHERE article_id = %s'
    cursor.execute(sql, (json.dumps(category_ids), row['article_id']))

try:
    connection.commit()
    print('Category IDs migration completed successfully.')
except Error as error:
    print(f'Failed to migrate category IDs. {error}')

db.close_connection()
