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

