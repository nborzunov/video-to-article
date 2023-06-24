import { Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Article, getArticle } from "../hooks/getArticle";

export const EditArticle = () => {
  const { id: articleId } = useParams();

  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    getArticle(articleId as string).then((article) => setArticle(article));
  }, []);

  if (!article) {
    return "";
  }
  return (
    <Flex
      w={"6xl"}
      flexDirection={"column"}
      minHeight={"calc(100vh - 122px)"}
      pt={"14"}
      pb={"14"}
    >
      <Stack spacing={{ base: 8, md: 10 }}>
        <Heading w="83%" fontSize={"48px"}>
          {article.title}
        </Heading>

        <Text w="75%" fontSize={"20px"}>
          {article.annotation}
        </Text>

        {article.paragraphs.map((paragraph) => (
          <Stack spacing={{ base: 8, md: 10 }}>
            <Text w="70%" fontSize={"32px"}>
              {paragraph.title}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Flex>
  );
};
