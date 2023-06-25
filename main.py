import mimetypes

from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
import os
import sqlite3

from article import add_article
from video_processing import extract_images
from fastapi import BackgroundTasks, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pytube import YouTube
import time
from transcribe import transcribe_video


app = FastAPI()
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/transcribe")
def get_blog_post(video_url, background_tasks: BackgroundTasks):
    unique_id = convert_video_url_to_filename(video_url)

    def transcribe_callback(file_name, _):
        [title, preview_url] = get_video_details(video_url)
        video_id = convert_video_url_to_filename(video_url)
        add_article(video_id, title, preview_url)
        video_length = YouTube(video_url).length
        add_article(video_id, title, preview_url, video_length)
        transcribe_video(unique_id)

    async def start_processing():
        download_video(video_url, unique_id, transcribe_callback)

    background_tasks.add_task(start_processing)
    return "Started processing..."


@app.get("/video_info")
async def get_video_info(video_url):
    yt = YouTube(video_url)

    return {
        "video_id": yt.video_id,
        "video_length": yt.length
    }


def download_video(video_url, unique_id, callback):
    print(f'Started downloading video - [{unique_id}]')
    start = time.time()
    youtube_object = YouTube(video_url, on_complete_callback=callback)
    youtube_object = youtube_object.streams.get_by_resolution("720p")
    youtube_object.download("./video", f'{unique_id}.mp4')
    end = time.time()
    print('[Download video] %ss' % round(end - start, 2))

    extract_images(unique_id)


def convert_video_url_to_filename(video_url):
    video_id = video_url.split("v=")[1]
    return video_id


def get_video_details(video_url):
    youtube = YouTube(video_url)

    title = youtube.title
    preview_url = youtube.thumbnail_url
    return [title, preview_url]


@app.get("/articles")
def get_articles_endpoint():
    def get_articles():
        conn = sqlite3.connect('db.sqlite3')
        c = conn.cursor()

        c.execute("SELECT * FROM articles")
        articles = c.fetchall()

        conn.close()

        return articles
    articles = get_articles()
    return {"articles": articles}

@app.get("/article/{video_id}")
def get_single_article(video_id):
    def get_article(video_id):
        with sqlite3.connect('db.sqlite3') as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM articles WHERE video_id = ?", (video_id,))
            article = c.fetchone()
            c.execute("SELECT * FROM frames WHERE video_id = ?", (video_id,))
            frames = c.fetchone()
            return article, frames

    def get_screenshots(video_id):
        screenshot_folder = "screen"
        screenshot_files = os.listdir(screenshot_folder)
        screenshots = []
        for screenshot_file in screenshot_files:
            if screenshot_file.startswith(video_id):
                screenshot_path = os.path.join(screenshot_folder, screenshot_file)
                screenshots.append(FileResponse(screenshot_path, media_type='image/jpeg'))
        return screenshots

    article = get_article(video_id)
    screenshots = get_screenshots(video_id)
    return article, screenshots