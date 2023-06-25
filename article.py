import sqlite3
from datetime import date

def add_article(video_id, title, preview_url):
    conn = sqlite3.connect('db.sqlite3')
    c = conn.cursor()

    # Здесь выполняйте код для добавления данных о статье в таблицу "articles"
    status = 'processing'
    start_date = date.today()

    c.execute("DELETE FROM articles WHERE video_id=?", (video_id,))
    c.execute("INSERT INTO articles (video_id, title, preview_url, status, start_date) VALUES (?, ?, ?, ?, ?)",
              (video_id, title, preview_url, status, start_date))

    conn.commit()
    conn.close()

def update_article(video_id, data):
    conn = sqlite3.connect('db.sqlite3')

    cursor = conn.cursor()

    set_values = []

    where_values = []

    for column, value in data.items():
        set_values.append(f"{column} = ?")
        where_values.append(value)

    set_clause = ", ".join(set_values)

    where_values.append(video_id)

    update_query = f"""
    UPDATE articles
    SET {set_clause}
    WHERE video_id = ?;
    """

    cursor.execute(update_query, tuple(where_values))

    conn.commit()

    cursor.close()
    conn.close()
