import {
  Button,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  IconButton,
  Box,
  Image,
  Progress,
  Checkbox,
  Skeleton,
} from "@chakra-ui/react";
import {
  AiFillDelete,
  AiOutlineClose,
  AiOutlineDownload,
  AiOutlineEdit,
  AiOutlineSearch,
} from "react-icons/ai";
import { useEffect, useState } from "react";
import { Article, getArticle } from "../hooks/getArticle";
import { ArticleItem, getArticles } from "../hooks/getArticles";
import * as dayjs from "dayjs";
import "dayjs/locale/ru";

export const ArticleList = () => {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [selectedArticles, setSelectedArticles] = useState({});

  useEffect(() => {
    getArticles().then((articles) => {
      setArticles(articles);
      articles.map((article) => {
        selectedArticles[article.video_id] = false;
      });
    });
  }, []);

  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    let formattedDuration = "";

    if (minutes > 0) {
      formattedDuration += `${minutes} минут${minutes === 1 ? "а" : ""} `;
    }

    if (remainingSeconds > 0 && minutes === 0) {
      formattedDuration += `${remainingSeconds} секунд${
        remainingSeconds === 1 ? "а" : ""
      } `;
    }

    return formattedDuration.trim();
  }

  function formatDate(date) {
    const day = date.getDate();
    return dayjs(date).locale("ru").format("D MMMM YYYY");
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
        <Heading w="83%" fontSize={"72px"}>
          Мои статьи
        </Heading>

        <Text w="50%" fontSize={"20px"}>
          Здесь вы можете отследить загрузку текущей статьи, а также скачать,
          отредактировать или удалить ранее загруженные
        </Text>

        <Flex justifyContent={"space-between"}>
          <InputGroup size="md" w={"50%"}>
            <Input
              pr="4.5rem"
              type={"text"}
              placeholder="Найти..."
              variiant={"outline"}
              colorScheme={"black"}
              borderRadius={"20px"}
              py={"20px"}
              px={"30px"}
              size={"lg"}
              mt={1}
              borderColor={"gray.500"}
              borderWidth={"2px"}
              h={"64px"}
            />

            <InputRightElement width="4.5rem" mt={"4"}>
              <IconButton
                variant={"ghost"}
                size="lg"
                fontSize="32px"
                icon={<AiOutlineSearch />}
              />
            </InputRightElement>
          </InputGroup>

          <Flex columnGap={"3"}>
            <Button
              colorScheme={"orange"}
              bg={"#F0910F"}
              size="lg"
              pt={"25px"}
              pb={"25px"}
              px={4}
              fontSize={"20px"}
              borderRadius={"16px"}
              borderBottomColor={"#BB7515"}
              borderBottomWidth={"8px"}
              _hover={{
                background: "orange.300",
                opacity: 0.8,
              }}
            >
              Cкачать выбранные
            </Button>

            <Button
              leftIcon={<AiFillDelete />}
              variant="ghost"
              colorScheme="gray"
              size={"lg"}
            >
              Удалить выбранные
            </Button>
          </Flex>
        </Flex>

        {!articles.length && (
          <>
            {[0, 0].map((_, i) => (
              <Skeleton
                key={i}
                isLoaded={articles.length}
                width={"100%"}
                h={"380px"}
                borderRadius={"20px"}
              ></Skeleton>
            ))}
          </>
        )}
        {articles.map((article) => (
          <Flex
            key={article.video_id}
            width={"100%"}
            h={"380px"}
            p={"40px"}
            bg={"rgba(240, 145, 15, 0.25)"}
            backdropFilter="auto"
            backdropBlur="10px"
            borderRadius={"20px"}
            position={"relative"}
          >
            <IconButton
              position={"absolute"}
              top={"16px"}
              right={"16px"}
              icon={<AiOutlineClose />}
              variant={"ghost"}
              size={"lg"}
              fontSize={"2xl"}
            />

            <Flex
              position={"absolute"}
              bottom={"52px"}
              right={"32px"}
              columnGap={3}
              alignItems={"center"}
            >
              <Text
                color={selectedArticles[article.video_id] ? "orange.500" : ""}
                transition={"all 0.2s ease"}
              >
                Выбрать статью
              </Text>
              <Checkbox
                size={"lg"}
                colorScheme={"orange"}
                borderColor={
                  selectedArticles[article.video_id] ? "orange.500" : "black"
                }
                onChange={(e) =>
                  setSelectedArticles({
                    ...selectedArticles,
                    [article.video_id]: !selectedArticles[article.video_id],
                  })
                }
              />
            </Flex>
            <Flex w={"467px"} h={"300px"} position={"relative"}>
              <Image
                src={article.preview_url}
                borderRadius={"10px"}
                w={"467px"}
                h={"300px"}
              />

              <Flex
                position={"absolute"}
                bottom="0"
                flexDir={"column"}
                p={"20px"}
                w={"calc(100%)"}
              >
                <Flex justifyContent={"space-between"} color={"white"}>
                  <Text as={"div"}>
                    {article.status === "processing" &&
                      "Статья будет сформирована через"}
                    {article.status === "completed" && "Статья сформирована"}
                  </Text>

                  <Text as={"div"}>
                    {article.status === "processing" &&
                      formatDuration(article.finish_timestamp)}
                    {article.status === "completed" && formatDate(article.date)}
                  </Text>
                </Flex>
                <Box mt={"10px"}>
                  {article.status === "processing" && (
                    <Progress
                      h="10px"
                      borderRadius="10px"
                      colorScheme="orange"
                      value={
                        (article.finish_timestamp / article.total_timestamp) *
                        100
                      }
                    />
                  )}
                  {article.status === "completed" && (
                    <Progress
                      h="10px"
                      borderRadius="10px"
                      colorScheme="green"
                      value={100}
                    />
                  )}
                </Box>
              </Flex>
            </Flex>

            <Flex
              h={"100%"}
              justifyContent={"space-between"}
              ml={"20px"}
              flexDir={"column"}
            >
              <Box>
                <Text
                  fontSize={"24px"}
                  fontWeight={"500"}
                  mt={"10px"}
                  w="550px"
                >
                  {article.title}
                </Text>
                <Text fontSize={"20px"} mt={"30px"} w={"600px"}>
                  {article.status === "processing" &&
                    "Здесь будет аннотация к вашей статье"}
                  {article.status === "completed" && article.annotation}
                </Text>
              </Box>

              <Flex>
                <Button
                  leftIcon={<AiOutlineEdit />}
                  variant="ghost"
                  colorScheme="gray"
                  size={"lg"}
                >
                  Редактировать
                </Button>
                <Button
                  leftIcon={<AiOutlineDownload />}
                  variant="ghost"
                  colorScheme="gray"
                  size={"lg"}
                >
                  Скачать
                </Button>
              </Flex>
            </Flex>
          </Flex>
        ))}
      </Stack>
    </Flex>
  );
};
