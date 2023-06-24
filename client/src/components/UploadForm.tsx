import {
    Avatar,
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    IconButton,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Stack,
    useColorModeValue,
    Text,
    useDisclosure,
    InputRightElement,
    InputGroup,
    Input,
    Switch,
    Fade,
    RangeSliderThumb,
    RangeSliderFilledTrack,
    RangeSlider,
    RangeSliderTrack,
    RangeSliderMark,
    Skeleton,
    Tooltip, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
} from "@chakra-ui/react";
import {useEffect, useMemo, useRef, useState} from "react";
import ky from "ky";
import YouTube, {YouTubePlayer, YouTubeProps} from "react-youtube";

export const UploadForm = () => {
    const {isOpen, onOpen, onClose} = useDisclosure();

    const [videoUrl, setVideoUrl] = useState("");
    const [videoInfo, setVideoInfo] = useState(null);
    const [chooseSegment, setChooseSegment] = useState(false);
    const [range, setRange] = useState([0, 0]);
    const createArticle = () => {
        console.log("CREATE ARTICLE");
    };

    const opts: YouTubeProps["opts"] = {
        height: "504",
        width: "896",
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: 0,
        },
    };

    const [showPlayer, setShowPlayer] = useState(false);

    const [sliderValue, setSliderValue] = useState([0, 0]);
    const [showTooltip1, setShowTooltip1] = useState(false);
    const [showTooltip2, setShowTooltip2] = useState(false);

    const playerRef = useRef<YouTubePlayer | null>(null as any);

    const [prevSkipTimeStamp, setPrevSkipTimeStamp] = useState(0);
    const skipToTimeStamp = (oldRange, newRange) => {
        let timestamp = null;
        if (oldRange[0] !== newRange[0]) {
            timestamp = newRange[0];
        }
        if (oldRange[1] !== newRange[1]) {
            timestamp = newRange[1];
        }
        if (prevSkipTimeStamp === timestamp) {
            return;
        }

        playerRef.current.seekTo(timestamp);
        playerRef.current.playVideo();
        setTimeout(() => {
            playerRef.current.pauseVideo();
        }, 0);
        setPrevSkipTimeStamp(timestamp);
    };

    const onPlayerReady: YouTubeProps["onReady"] = (event) => {
        // access to player in all event handlers via event.target
        setShowPlayer(true);
        playerRef.current = event.target;
    };
    const beautify = (seconds) => {
        if (!videoInfo) {
            return "";
        }
        const videoLength = videoInfo.video_length;
        const addLeadingZero = (value) => (value < 10 ? `0${value}` : value);

        const hoursInVideo = Math.floor(videoLength / 3600);

        const formatTime = (hours, minutes, seconds) => {
            let formattedTime = `${addLeadingZero(minutes)}:${addLeadingZero(
                seconds
            )}`;
            if (hoursInVideo > 0) {
                formattedTime = `${addLeadingZero(hours)}:${formattedTime}`;
            }
            return formattedTime;
        };

        const startHours = Math.floor(seconds / 3600);
        const startMinutes = Math.floor((seconds % 3600) / 60);
        const startSeconds = Math.floor(seconds % 60);
        return formatTime(startHours, startMinutes, startSeconds);
    };

    const rangeBeautified = useMemo(() => {
        if (!videoInfo) {
            return ["", ""];
        }
        const videoLength = videoInfo.video_length;
        const [start, end] = range;
        const addLeadingZero = (value) => (value < 10 ? `0${value}` : value);

        const hoursInVideo = Math.floor(videoLength / 3600);

        const formatTime = (hours, minutes, seconds) => {
            let formattedTime = `${addLeadingZero(minutes)}:${addLeadingZero(
                seconds
            )}`;
            if (hoursInVideo > 0) {
                formattedTime = `${addLeadingZero(hours)}:${formattedTime}`;
            }
            return formattedTime;
        };

        const startHours = Math.floor(start / 3600);
        const startMinutes = Math.floor((start % 3600) / 60);
        const startSeconds = Math.floor(start % 60);
        const formattedStart = formatTime(startHours, startMinutes, startSeconds);

        const endHours = Math.floor(end / 3600);
        const endMinutes = Math.floor((end % 3600) / 60);
        const endSeconds = Math.floor(end % 60);
        const formattedEnd = formatTime(endHours, endMinutes, endSeconds);

        return [formattedStart, formattedEnd];
    }, [videoInfo?.video_length, range]);

    const [settingsLoaded, setSettingsLoaded] = useState(false);

    useEffect(() => {
        if (videoUrl) {
            ky.get(`http://localhost:8000/video_info`, {
                searchParams: {
                    video_url: videoUrl,
                },
            })
                .json()
                .then((data) => {
                    setVideoInfo(data as any);
                    console.log(data);
                    setRange([range[0], data.video_length]);

                    setTimeout(() => {
                        setSettingsLoaded(true);
                    }, 1500);
                });
        }
    }, [videoUrl]);
    return (
        <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems="center"
            flexDirection={"column"}
            bg={"gray.100"}
            minHeight={"100vh"}
        >
            <Box
                bg={"#F0910F"}
                display={"flex"}
                h={"72px"}
                my={"25px"}
                w={"6xl"}
                alignItems={"center"}
                justifyContent={"space-between"}
                px={"50px"}
                py={"18px"}
                borderRadius={"12px"}
            >
                <IconButton
                    size={"md"}
                    icon={"123"}
                    aria-label={"Open Menu"}
                    display={{md: "none"}}
                    onClick={isOpen ? onClose : onOpen}
                />
                <HStack spacing={8} alignItems={"center"}>
                    <Box fontWeight={"bold"} fontSize={"xl"}>
                        Logo
                    </Box>
                </HStack>
                <Flex alignItems={"center"}>
                    <Menu>
                        <MenuButton
                            as={Button}
                            rounded={"full"}
                            variant={"link"}
                            cursor={"pointer"}
                            minW={0}
                        >
                            <Avatar
                                size={"sm"}
                                src={
                                    "https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                                }
                            />
                        </MenuButton>
                        <MenuList>
                            <MenuItem>Link 1</MenuItem>
                            <MenuItem>Link 2</MenuItem>
                            <MenuDivider/>
                            <MenuItem>Link 3</MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            </Box>

            <Flex
                alignItems={"center"}
                w={"8xl"}
                flexDirection={"column"}
                minHeight={"calc(100vh - 122px)"}
                pb={'16'}
            >
                <Stack
                    textAlign={"center"}
                    align={"center"}
                    spacing={{base: 8, md: 10}}
                    pt={"28"}
                    pb={"14"}
                >
                    <Heading fontWeight={600} fontSize={"60px"} lineHeight={"110%"}>
                        Создайте статью{" "}
                        <Text as={"span"} color={"orange.400"}>
                            за один клик
                        </Text>
                    </Heading>
                    <Text color={"gray.500"} maxW={"xl"} fontSize={"22px"}>
                        Вставьте ссылку на видео из Youtube. Получите подробную статью по
                        этому видео с тайм-кодами
                    </Text>
                </Stack>

                <Stack spacing={8}>
                    <Box position={"relative"}>
                        <Input
                            size={"lg"}
                            width={"4xl"}
                            h={"80px"}
                            px={8}
                            py={4}
                            type={"text"}
                            placeholder="Вставьте ссылку на видео"
                            colorScheme={"orange"}
                            fontWeight={"semibold"}
                            fontSize={"xl"}
                            borderRadius={"20px"}
                            borderColor={"gray.500"}
                            borderWidth={"2px"}
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                        />

                        <Button
                            colorScheme={"orange"}
                            bg={"#F0910F"}
                            size="lg"
                            pt={"25px"}
                            pb={"25px"}
                            px={4}
                            fontSize={"20px"}
                            onClick={createArticle}
                            position={"absolute"}
                            right={"10px"}
                            top={"10px"}
                            borderRadius={"16px"}
                            zIndex={"1000"}
                            borderBottomColor={"#BB7515"}
                            borderBottomWidth={"8px"}
                        >
                            Создать статью
                        </Button>
                    </Box>

                    <Fade in={videoInfo}>
                        <Stack spacing={8} fontSize={"lg"}>
                            <Skeleton isLoaded={settingsLoaded} w={ !settingsLoaded ? '200px' : '100%'}>
                                <Flex>
                                    <Switch
                                        size="lg"
                                        colorScheme={"orange"}
                                        mr={4}
                                        value={chooseSegment}
                                        onChange={(e) => setChooseSegment(e.target.checked)}
                                    />{" "}
                                    <Text color={"gray.600"}>Выбрать отрезок</Text>
                                </Flex>
                            </Skeleton>

                            <Fade in={chooseSegment} unmountOnExit>
                                <Box>
                                    <Skeleton isLoaded={showPlayer} height={"504px"}>
                                        <YouTube
                                            videoId={videoInfo?.video_id}
                                            opts={opts}
                                            onReady={onPlayerReady}
                                        />
                                    </Skeleton>
                                    <Flex mt={6} justifyContent={"space-between"} mb={6}>
                                        <Box
                                            bg={"white"}
                                            px={"12px"}
                                            py={"6px"}
                                            borderRadius={"41px"}
                                        >
                                            {rangeBeautified[0]}
                                        </Box>
                                        <Box
                                            bg={"white"}
                                            px={"12px"}
                                            py={"6px"}
                                            borderRadius={"41px"}
                                        >
                                            {rangeBeautified[1]}
                                        </Box>
                                    </Flex>
                                    <RangeSlider
                                        aria-label={["min", "max"]}
                                        colorScheme="orange"
                                        defaultValue={range}
                                        max={videoInfo?.video_length}
                                        onChangeEnd={setRange}
                                        onChange={(v) => {
                                            skipToTimeStamp(range, v);
                                            setSliderValue(v);
                                        }}
                                        size={"lg"}
                                    >
                                        <RangeSliderMark value={25}></RangeSliderMark>
                                        <RangeSliderTrack bg={"white"}>
                                            <RangeSliderFilledTrack bg={"#F0910F"}/>
                                        </RangeSliderTrack>
                                        <Tooltip
                                            hasArrow
                                            bg="orange.500"
                                            color="white"
                                            placement="top"
                                            isOpen={showTooltip1}
                                            label={beautify(sliderValue[0])}
                                        >
                                            <RangeSliderThumb
                                                index={0}
                                                bg={"black"}
                                                onMouseEnter={() => setShowTooltip1(true)}
                                                onMouseLeave={() => setShowTooltip1(false)}
                                            />
                                        </Tooltip>

                                        <Tooltip
                                            hasArrow
                                            bg="orange.500"
                                            color="white"
                                            placement="top"
                                            isOpen={showTooltip2}
                                            label={beautify(sliderValue[1])}
                                        >
                                            <RangeSliderThumb
                                                index={1}
                                                bg={"black"}
                                                onMouseEnter={() => setShowTooltip2(true)}
                                                onMouseLeave={() => setShowTooltip2(false)}
                                            />
                                        </Tooltip>
                                    </RangeSlider>
                                </Box>
                            </Fade>

                            <Skeleton isLoaded={settingsLoaded} w={'360px'}>
                                <Stack>
                                    <Text>
                                        Задержка для скриншота{" "}
                                        <Text as={"span"} color={"gray.500"} pl={1}>
                                        </Text>
                                    </Text>

                                    <Flex alignItems={"center"}>
                                        <InputGroup width={"360px"}>

                                            <NumberInput
                                                value={"10 секунд"}>
                                                <NumberInputField colorScheme={"black"}
                                                                  placeholder={"10 секунд"}
                                                                  borderRadius={"20px"}
                                                                  py={"20px"}
                                                                  px={"30px"}
                                                                  size={"lg"}
                                                                  mt={1}
                                                                  borderColor={"gray.500"}
                                                                  borderWidth={"2px"}
                                                                  h={"64px"} width={"360px"}/>
                                                <NumberInputStepper height={'80%'} my={'3'} mx={2}>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper/>
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </InputGroup>
                                    </Flex>
                                </Stack>
                            </Skeleton>

                            <Skeleton isLoaded={settingsLoaded} w={'360px'}>
                                <Stack>
                                    <Text>
                                        Длина аннотации{" "}
                                        <Text as={"span"} color={"gray.500"} pl={1}>
                                            (не обязательно)
                                        </Text>
                                    </Text>
                                    <Input
                                        colorScheme={"black"}
                                        placeholder={"Без ограничения"}
                                        width={"360px"}
                                        borderRadius={"20px"}
                                        py={"20px"}
                                        px={"30px"}
                                        size={"lg"}
                                        mt={1}
                                        borderColor={"gray.500"}
                                        borderWidth={"2px"}
                                        h={"64px"}
                                    />
                                </Stack>
                            </Skeleton>

                            <Skeleton isLoaded={settingsLoaded} w={'360px'}>
                                <Stack>
                                    <Text>
                                        Длина статьи{" "}
                                        <Text as={"span"} color={"gray.500"} pl={1}>
                                            (не обязательно)
                                        </Text>
                                    </Text>

                                    <Flex alignItems={"center"}>
                                        <InputGroup width={"360px"}>
                                            <Input
                                                colorScheme={"black"}
                                                placeholder={"Без ограничения"}
                                                borderRadius={"20px"}
                                                py={"20px"}
                                                px={"30px"}
                                                size={"lg"}
                                                mt={1}
                                                borderColor={"gray.500"}
                                                borderWidth={"2px"}
                                                h={"64px"}
                                                value={"3000 знаков"}
                                            />
                                        </InputGroup>
                                    </Flex>
                                </Stack>
                            </Skeleton>


                        </Stack>
                    </Fade>
                </Stack>
            </Flex>
        </Box>
    );
};
