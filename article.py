import sqlite3
from datetime import date

def add_article(title, preview_url):
    conn = sqlite3.connect('db.sqlite3')
    c = conn.cursor()

    # Здесь выполняйте код для добавления данных о статье в таблицу "articles"
    status = 'processing'
    start_date = date.today()

    c.execute("INSERT INTO articles (title, preview_url, status, start_date) VALUES (?, ?, ?, ?)",
              (title, preview_url, status, start_date))

    conn.commit()
    conn.close()
