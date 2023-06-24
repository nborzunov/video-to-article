from faster_whisper.transcribe import Segment
from pydub import AudioSegment
import whisper
from faster_whisper import WhisperModel
import time
import sqlite3

def convert_mp4_to_wav(video_file, audio_file):
    video = AudioSegment.from_file(video_file, format="mp4")
    audio = video.set_channels(1).set_frame_rate(16000).set_sample_width(2)
    audio.export(audio_file, format="wav")


def transcribe(file_name):
    print("[Started transcription]")
    video_file = f'./video/{file_name}.mp4'
    audio_file = f'./audio/{file_name}.wav'

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

    # Сохранение результата транскрибации в базу данных
    insert_transcript(file_name, str(result))

    return result


def insert_transcript(video_id, data):
    with sqlite3.connect("db.sqlite3") as conn:
        c = conn.cursor()
        c.execute("DELETE FROM transcripts WHERE video_id=?", (video_id,))
        c.execute("INSERT INTO transcripts VALUES (?, ?)", (video_id, data))
        conn.commit()
