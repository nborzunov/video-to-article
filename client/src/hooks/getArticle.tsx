export interface Article {
  title: string;
  annotation: string;
  paragraphs: Paragraph[];
}

interface Paragraph {
  title: string;
  subparagraphs: Paragraph[];
  imageUrls?: string[];
}

export const getArticle = (articleId: string): Promise<Article> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(mockArticle);
    }, 2000);
  }).catch((error) => {
    console.error(error);
  });
};

const mockArticle = {
  title:
    "Сила убеждения: как создать топовую презентацию для серьезного бизнеса. Поэтапный план",
  annotation:
    "Чем отличается премиальная презентация от бюджетного варианта, сделанного на коленке в PowerPoint? \n" +
    "Как создаются эффективные и захватывающие проекты для топовых клиентов? Сколько сил и ресурсов надо привлечь, чтобы результат действительно решал поставленную задачу?",
  paragraphs: [
    {
      title: "От чего следует держаться подальше",
      timestamp: 0,
      subparagraphs: [
        {
          text:
            "Первое правило: премиальные презентации не делают в PowerPoint или Keynote. Профессионалы используют целый пакет мощных графических приложений, созданных под каждую конкретную задачу. Например, для обработки растровой графики — Photoshop, Lightroom, для работы \n" +
            "с векторной графикой — Illustrator, InDesign, Figma, редко Corel. С их помощью создают дизайн совершенно иного уровня, нежели в PowerPoint.",
          timestamp: 0,
          imageUrls: Array(10).fill("https://source.unsplash.com/random"),
        },
        {
          text:
            "Первое правило: премиальные презентации не делают в PowerPoint или Keynote. Профессионалы используют целый пакет мощных графических приложений, созданных под каждую конкретную задачу. Например, для обработки растровой графики — Photoshop, Lightroom, для работы \n" +
            "с векторной графикой — Illustrator, InDesign, Figma, редко Corel. С их помощью создают дизайн совершенно иного уровня, нежели в PowerPoint.",
          timestamp: 55,
          imageUrls: Array(5).fill("https://source.unsplash.com/random"),
        },
        {
          text:
            "Первое правило: премиальные презентации не делают в PowerPoint или Keynote. Профессионалы используют целый пакет мощных графических приложений, созданных под каждую конкретную задачу. Например, для обработки растровой графики — Photoshop, Lightroom, для работы \n" +
            "с векторной графикой — Illustrator, InDesign, Figma, редко Corel. С их помощью создают дизайн совершенно иного уровня, нежели в PowerPoint.",
          timestamp: 89,
          imageUrls: Array(2).fill("https://source.unsplash.com/random"),
        },
      ],
    },
    {
      title: "От чего следует держаться подальше",
      subparagraphs: [
        {
          text:
            "Первое правило: премиальные презентации не делают в PowerPoint или Keynote. Профессионалы используют целый пакет мощных графических приложений, созданных под каждую конкретную задачу. Например, для обработки растровой графики — Photoshop, Lightroom, для работы \n" +
            "с векторной графикой — Illustrator, InDesign, Figma, редко Corel. С их помощью создают дизайн совершенно иного уровня, нежели в PowerPoint.",
          timestamp: 105,
          imageUrls: Array(2).fill("https://source.unsplash.com/random"),
        },
        {
          text:
            "Первое правило: премиальные презентации не делают в PowerPoint или Keynote. Профессионалы используют целый пакет мощных графических приложений, созданных под каждую конкретную задачу. Например, для обработки растровой графики — Photoshop, Lightroom, для работы \n" +
            "с векторной графикой — Illustrator, InDesign, Figma, редко Corel. С их помощью создают дизайн совершенно иного уровня, нежели в PowerPoint.",
          timestamp: 139,
          imageUrls: Array(5).fill("https://source.unsplash.com/random"),
        },
        {
          text:
            "Первое правило: премиальные презентации не делают в PowerPoint или Keynote. Профессионалы используют целый пакет мощных графических приложений, созданных под каждую конкретную задачу. Например, для обработки растровой графики — Photoshop, Lightroom, для работы \n" +
            "с векторной графикой — Illustrator, InDesign, Figma, редко Corel. С их помощью создают дизайн совершенно иного уровня, нежели в PowerPoint.",
          timestamp: 182,
          imageUrls: Array(10).fill("https://source.unsplash.com/random"),
        },
      ],
    },
  ],
};
