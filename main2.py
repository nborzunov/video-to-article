import cv2
import time

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
        output_frame_path = f'{output_path}/frame_{i+1}.jpg'
        cv2.imwrite(output_frame_path, static_frame)

    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Время выполнения: {execution_time} секунд")

    return frame_info


video_path = '$ba6f45ee-febf-4295-90b8-64e1e216bed7.mp4'
output_path = 'screen'
static_duration = 5
skip_frames = 20

frame_info = extract_static_frames(video_path, output_path, static_duration, skip_frames)
print("Массив с названиями файлов и таймкодами:")
for info in frame_info:
    print(f"Файл: frame_{info[0]}.jpg, Таймкод: {info[1]} сек")
