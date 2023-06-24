import sqlite3
from datetime import date



def add_article(video_id, title, preview_url):
    conn = sqlite3.connect('db.sqlite3')
    c = conn.cursor()

    video_id = video_id
    # Здесь выполняйте код для добавления данных о статье в таблицу "articles"
    status = 'processing'
    start_date = date.today()

    c.execute("INSERT INTO articles (video_id, title, preview_url, status, start_date) VALUES (?, ?, ?, ?, ?)",
              (video_id, title, preview_url, status, start_date))

    conn.commit()
    conn.close()
