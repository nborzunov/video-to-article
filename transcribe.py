import time
import sqlite3
import logging

import openai
from pydub import AudioSegment
from faster_whisper.transcribe import Segment
import whisper
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)
API_KEY = "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"
openai.api_key = API_KEY

LOG_FORMAT = "%(asctime)s [%(levelname)s] %(message)s"
logging.basicConfig(format=LOG_FORMAT, level=logging.INFO)


def convert_mp4_to_wav(video_file, audio_file):
    video = AudioSegment.from_file(video_file, format="mp4")
    audio = video.set_channels(1).set_frame_rate(16000).set_sample_width(2)
    audio.export(audio_file, format="wav")


def rephrase_text(args):
    [text] = args
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system",
             "content": "Отформатируй текст, перефразируй многосложные предложения в односложные, удали вводные слова и слова-паразиты, если в тексте встречаются повторы, то удаляй все, кроме одного."},
            {"role": "user", "content": text}
        ]
    )

    if 'error' in response:
        if response['error']['code'] == 'server_overloaded':
            raise Exception('Server overloaded or not ready')
        else:
            raise Exception('Error in API response')

    reply = response.choices[0].message["content"]
    reply = reply.replace("assistant:", "").strip()
    phrases = reply.split("\n")

    result = " ".join(phrases).strip()
    return result


def get_heading(args):
    [text, headings] = args
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system",
             "content": f"Придумай заголовок для текста. Если текст не имеет смысла, то верни ''. Заголовок должен быть без кавычек, предыдущие заголовки: {' '.join(headings)}"},
            {"role": "user", "content": text}
        ]
    )

    if 'error' in response:
        if response['error']['code'] == 'server_overloaded':
            raise Exception('Server overloaded or not ready')
        else:
            raise Exception('Error in API response')

    reply = response.choices[0].message["content"]
    reply = reply.replace("assistant:", "").strip()
    phrases = reply.split("\n")

    result = " ".join(phrases).strip()
    return result


def retry_process_text(function, args, max_retries=5, initial_delay=1, max_delay=30):
    retries = 0
    delay = initial_delay

    while retries < max_retries:
        try:
            result = function(args)
            return result  # Return the result if successful
        except Exception as e:
            print(f"Error: {str(e)}")
            retries += 1

            if retries >= max_retries:
                break

            print(f"Retrying in {delay} seconds...")
            time.sleep(delay)

            # Exponential backoff: double the delay for the next retry
            delay = min(delay * 2, max_delay)

    print("Maximum retries reached. Unable to process the request.")
    return None


def transcribe_video(file_name):
    logger.info("[Started transcription]")

    video_file = f'./video/{file_name}.mp4'
    audio_file = f'./audio/{file_name}.wav'

    start = time.time()
    convert_mp4_to_wav(video_file, audio_file)
    end = time.time()
    logger.info('[Mp4 -> Wav] %ss' % round(end - start, 2))

    start = time.time()
    audio = whisper.load_audio(audio_file)
    end = time.time()
    logger.info('[Load audio] %ss' % round(end - start, 2))

    start = time.time()
    model = WhisperModel("base", device="cpu", compute_type="int8")
    end = time.time()
    logger.info('[Load model] %ss' % round(end - start, 2))

    start = time.time()
    segments = model.transcribe(audio, language="ru", word_timestamps=True, beam_size=1)

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

    end = time.time()
    logger.info('[Transcription] %ss' % round(end - start, 2))

    paragraphs = get_paragraphs(result)
    insert_transcript(file_name, str(result))

    start = time.time()
    rephrased_text = []
    headings = []
    for sentence_group in paragraphs:
        paragraph = []
        for subparagraph in sentence_group:
            rephrased_group = retry_process_text(rephrase_text, [subparagraph["text"]])
            subparagraph["text"] = rephrased_group
            paragraph.append(subparagraph)
        rephrased_text.append(paragraph)
        heading = retry_process_text(get_heading, [" ".join(list(map(lambda x: x['text'], sentence_group))), headings])
        headings.append(heading)

    end = time.time()
    logger.info('[Rephrasing] %ss' % round(end - start, 2))

    insert_paragraphs(file_name, rephrased_text)


def get_paragraphs(sentences):
    paragraphs = []
    current_paragraph = []
    threshold_paragraph = 1.0
    threshold_subparagraph = 0.6

    for sentence in sentences:
        if not current_paragraph or sentence['start'] > (current_paragraph[-1]['end'] + threshold_paragraph):
            # Start a new paragraph
            if current_paragraph:
                paragraphs.append(current_paragraph)
            current_paragraph = []

        if not current_paragraph or sentence['start'] > (current_paragraph[-1]['end'] + threshold_subparagraph):
            # Start a new subparagraph
            current_paragraph.append(sentence)
        else:
            current_paragraph[-1]['end'] = max(current_paragraph[-1]['end'], sentence['end'])
            current_paragraph[-1]['text'] = current_paragraph[-1]['text'] + " " + sentence['text']

    if current_paragraph:
        paragraphs.append(current_paragraph)

    return paragraphs


def insert_transcript(video_id, data):
    try:
        with sqlite3.connect("db.sqlite3") as conn:
            c = conn.cursor()
            c.execute("DELETE FROM transcripts WHERE video_id=?", (video_id,))
            c.execute("INSERT INTO transcripts VALUES (?, ?)", (video_id, data))
            conn.commit()
    except sqlite3.Error as e:
        logger.error(f"Failed to insert transcript: {e}")


def insert_paragraphs(video_id, data):
    try:
        with sqlite3.connect("db.sqlite3") as conn:
            c = conn.cursor()
            c.execute("DELETE FROM paragraphs WHERE video_id=?", (video_id,))
            c.execute("INSERT INTO paragraphs VALUES (?, ?)", (video_id, data))
            conn.commit()
    except sqlite3.Error as e:
        logger.error(f"Failed to insert paragraphs: {e}")
