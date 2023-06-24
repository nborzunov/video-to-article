import {
    Avatar,
    Box, Button, Flex, Heading,
    HStack, IconButton, Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList, Stack,
    useColorModeValue,
    Text,
    useDisclosure
} from "@chakra-ui/react";

export const UploadForm = () => {
    const {isOpen, onOpen, onClose} = useDisclosure();
    return <Box display={'flex'} justifyContent={'center'} alignItems='center' flexDirection={'column'}>
        <Box bg={'#F0910F'} px={4} display={'flex'} justifyContent={'center'} w={'100%'}>
            <Flex h={'100px'} alignItems={'center'} justifyContent={'space-between'} w={'8xl'}>
                <IconButton
                    size={'md'}
                    icon={'123'}
                    aria-label={'Open Menu'}
                    display={{md: 'none'}}
                    onClick={isOpen ? onClose : onOpen}
                />
                <HStack spacing={8} alignItems={'center'}>
                    <Box fontWeight={'bold'} fontSize={'xl'}>Logo</Box>
                </HStack>
                <Flex alignItems={'center'}>
                    <Menu>
                        <MenuButton
                            as={Button}
                            rounded={'full'}
                            variant={'link'}
                            cursor={'pointer'}
                            minW={0}>
                            <Avatar
                                size={'sm'}
                                src={
                                    'https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
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
            </Flex>
        </Box>

        <Flex alignItems={'center'} justifyContent={'center'} w={'8xl'}>
            <Stack
                textAlign={'center'}
                align={'center'}
                spacing={{base: 8, md: 10}}
                py={{base: 20, md: 28}}>
                <Heading
                    fontWeight={600}
                    fontSize={'72px'}
                    lineHeight={'110%'}>
                    Создайте статью{' '}
                    <Text as={'span'} color={'orange.400'}>
                        за один клик
                    </Text>
                </Heading>
                <Text color={'gray.500'} maxW={'3xl'} fontSize={'24px'}>
                    Вставьте ссылку на видео из Youtube. Получите подробную статью по этому видео с тайм-кодами
                </Text>
            </Stack>

        </Flex>
    </Box>
}