import * as dayjs from "dayjs";

export const getArticles = (): Promise<ArticleItem[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(mockArticles);
    }, 2000);
  }).catch((error) => {
    console.error(error);
  });
};

export interface ArticleItem {
  video_id: string;
  title: string;
  annotation?: string;
  preview_url: string;
  status: "processing" | "completed" | "failed";
  date?: Date;
  finish_timestamp: number;
  total_timestamp: number;
}
const mockArticles = [
  {
    video_id: "1",
    title:
      "Сила убеждения: как создать топовую презентацию для серьезного бизнеса. Поэтапный план",
    annotation:
      "Аннотация к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье..",
    preview_url: "https://source.unsplash.com/random",
    status: "processing",
    date: dayjs().subtract(1, "days"),
    finish_timestamp: 320,
    total_timestamp: 459,
  },
  {
    video_id: "2",
    title:
      "Сила убеждения: как создать топовую презентацию для серьезного бизнеса. Поэтапный план",
    annotation:
      "Аннотация к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье..",
    preview_url: "https://source.unsplash.com/random",
    status: "completed",
    date: dayjs().subtract(1, "days").toDate(),
  },
  {
    video_id: "3",
    title:
      "Сила убеждения: как создать топовую презентацию для серьезного бизнеса. Поэтапный план",
    annotation:
      "Аннотация к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье..",
    preview_url: "https://source.unsplash.com/random",
    status: "completed",
    date: dayjs().subtract(2, "days").toDate(),
  },
  {
    video_id: "4",
    title:
      "Сила убеждения: как создать топовую презентацию для серьезного бизнеса. Поэтапный план",
    annotation:
      "Аннотация к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье..",
    preview_url: "https://source.unsplash.com/random",
    status: "completed",
    date: dayjs().subtract(5, "days").toDate(),
  },
  {
    video_id: "5",
    title:
      "Сила убеждения: как создать топовую презентацию для серьезного бизнеса. Поэтапный план",
    annotation:
      "Аннотация к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье к статье..",
    preview_url: "https://source.unsplash.com/random",
    status: "completed",
    date: dayjs().subtract(15, "days").toDate(),
  },
];
