from pydub import AudioSegment
import time
from fastapi import FastAPI
import openai
import whisper


def convert_mp4_to_wav(video_file, audio_file):
    video = AudioSegment.from_file(video_file, format="mp4")
    audio = video.set_channels(1).set_frame_rate(16000).set_sample_width(2)
    audio.export(audio_file, format="wav")


def transcribe():
    print("[Started transcription]")
    video_file = "video.mp4"
    audio_file = "speech.wav"

    start = time.time()
    convert_mp4_to_wav(video_file, audio_file)
    end = time.time()
    print('[Mp4 -> Wav] %ss' % round(end - start, 2))

    start = time.time()
    audio = whisper.load_audio("speech.wav")
    end = time.time()
    print('[Load audio] %ss' % round(end - start, 2))

    start = time.time()
    model = whisper.load_model("tiny", device="cpu")
    end = time.time()
    print('[Load model] %ss' % round(end - start, 2))

    start = time.time()
    result = model.transcribe(audio, language='en', word_timestamps=True, fp16=False)

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


@app.get("/transcribe")
def get_blog_post():
    result = transcribe()

    # blogpost = get_post(result['text'], result['segments'])
    return result
