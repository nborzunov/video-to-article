from faster_whisper.transcribe import Segment
from pydub import AudioSegment
import time
from fastapi import FastAPI
import openai
import whisper
import uuid
from pytube import YouTube
import jax
from faster_whisper import WhisperModel
from fastapi.middleware.cors import CORSMiddleware

jax.config.update('jax_platform_name', 'cpu')


def convert_mp4_to_wav(video_file, audio_file):
    video = AudioSegment.from_file(video_file, format="mp4")
    audio = video.set_channels(1).set_frame_rate(16000).set_sample_width(2)
    audio.export(audio_file, format="wav")


def transcribe(file_name):
    print("[Started transcription]")
    video_file = f'./video/${file_name}.mp4'
    audio_file = f'./audio/${file_name}.wav'

    start = time.time()
    convert_mp4_to_wav(video_file, audio_file)
    end = time.time()
    print('[Mp4 -> Wav] %ss' % round(end - start, 2))

    start = time.time()
    audio = whisper.load_audio(audio_file)
    end = time.time()
    print('[Load audio] %ss' % round(end - start, 2))

    start = time.time()
    model = WhisperModel("base", device="cpu", compute_type="int8")
    end = time.time()
    print('[Load model] %ss' % round(end - start, 2))

    start = time.time()
    segments = model.transcribe(audio, language="ru", word_timestamps=True, beam_size=1, vad_filter=True)

    result = []
    for segments in segments:
        for word in segments:
            if isinstance(word, Segment):
                result.append({"start": word.start, "end": word.end, "text": word.text})
                print(result[-1])

    end = time.time()
    print('[Transcription] %ss' % round(end - start, 2))
    return result


def get_post(text, segments):
    fields_to_keep = ["start", "end", "text", "words"]
    # segments = list(map(lambda obj: {key: obj[key] for key in obj.keys() if key in fields_to_keep}, segments))
    API_KEY = "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"

    openai.api_key = API_KEY

    prompt = '''\
    This is a full transcription of the video. Could you please write a blog post according to this text.
    Return format is JSON array with object with fields:
    {
        heading: string,
        text: string,
        timestamp: [string, string] // e.g. [13:20:00, 13:25:00]
        
    }
    
    Here is an original text:\n {text}\n
    
    Also here are timest
    '''.format(text=text)

    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=2000,
        n=1,
        stop=None,
        temperature=0.7
    )

    return response


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


def download_video(video_url, file_name, callback):
    start = time.time()
    youtube_object = YouTube(video_url, on_complete_callback=callback)
    youtube_object = youtube_object.streams.get_by_resolution("720p")
    youtube_object.download("./video", f'${file_name}.mp4')
    end = time.time()
    print('[Download video] %ss' % round(end - start, 2))


@app.get("/transcribe")
def get_blog_post(video_url):
    unique_id = str(uuid.uuid4())

    result = None

    def transcribe_callback(a, b):
        nonlocal result
        print(a, b)
        result = transcribe(unique_id)
        print(result)

    download_video(video_url, unique_id, transcribe_callback)

    # TODO !!!
    # 1. собрать неполные предложения вместе
    # 2.
    return result


@app.get("/video_info")
def get_video_info(video_url):
    yt = YouTube(video_url)

    return {
        "video_id": yt.video_id,
        "video_length": yt.length
    }
