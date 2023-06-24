from faster_whisper.transcribe import Segment
from pydub import AudioSegment
import time
from fastapi import BackgroundTasks, FastAPI
import openai
import whisper
import uuid
from pytube import YouTube
import jax
from faster_whisper import WhisperModel
from fastapi.middleware.cors import CORSMiddleware
import cv2
import time
import asyncio

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
    prev_sentence = ''
    start_timestamp = 0
    for segments in segments:
        for word in segments:
            if isinstance(word, Segment):
                text = word.text.strip()

                if prev_sentence == '':
                    start_timestamp = word.start
                prev_sentence = f'{prev_sentence} {text}'

                if text[-1] in ["!", ".", "?"]:
                    result.append({"start": start_timestamp, "end": word.end, "text": prev_sentence.strip()})
                    prev_sentence = ''
                if len(result) >= 1:
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


def is_frame_static(frame, previous_frame, static_threshold=3):
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray_previous_frame = cv2.cvtColor(previous_frame, cv2.COLOR_BGR2GRAY)
    difference = cv2.absdiff(gray_frame, gray_previous_frame)
    non_zero_pixels = cv2.countNonZero(difference)
    return non_zero_pixels <= static_threshold


def is_duplicate_frame(frame, frames, similarity_threshold=0.95):
    for existing_frame in frames:
        similarity = compare_frames(frame, existing_frame)
        if similarity >= similarity_threshold:
            return True
    return False


def compare_frames(frame1, frame2):
    gray_frame1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
    gray_frame2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
    similarity = cv2.matchTemplate(gray_frame1, gray_frame2, cv2.TM_CCOEFF_NORMED)
    return similarity[0][0]


def extract_static_frames(video_path, output_path, static_duration=5, skip_frames=20):
    capture = cv2.VideoCapture(video_path)
    success, frame = capture.read()
    previous_frame = frame
    frame_count = 0
    static_frames = []
    static_start_frame = None
    frame_info = []

    start_time = time.time()

    while success:
        frame_count += 1
        if frame_count % skip_frames == 0:
            if is_frame_static(frame, previous_frame):
                if static_start_frame is None:
                    static_start_frame = frame_count
                elif frame_count - static_start_frame >= static_duration:
                    if not is_duplicate_frame(previous_frame, static_frames):
                        static_frames.append(previous_frame)
                        frame_info.append((len(static_frames), frame_count / capture.get(cv2.CAP_PROP_FPS)))
                    static_start_frame = None
            else:
                static_start_frame = None

        previous_frame = frame
        success, frame = capture.read()

    capture.release()

    for i, static_frame in enumerate(static_frames):
        output_frame_path = f'{output_path}/frame_{i + 1}.jpg'
        cv2.imwrite(output_frame_path, static_frame)

    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Время выполнения: {execution_time} секунд")

    return frame_info


def extract_images(file_name):
    video_path = f'./video/${file_name}.mp4'
    output_path = 'screen'
    static_duration = 5
    skip_frames = 20

    return extract_static_frames(video_path, output_path, static_duration, skip_frames)


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
    print(f'Started downloading video - [${file_name}]')
    start = time.time()
    youtube_object = YouTube(video_url, on_complete_callback=callback)
    youtube_object = youtube_object.streams.get_by_resolution("720p")
    youtube_object.download("./video", f'${file_name}.mp4')
    end = time.time()
    print('[Download video] %ss' % round(end - start, 2))


@app.get("/transcribe")
def get_blog_post(video_url, background_tasks: BackgroundTasks):
    unique_id = str(uuid.uuid4())

    def transcribe_callback(a, b):
        result = transcribe(unique_id)
        images_info = extract_images(unique_id)

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
