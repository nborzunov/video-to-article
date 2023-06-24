import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { AiOutlineUnorderedList, AiOutlineUser } from "react-icons/ai";

export const Layout = () => {
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
        <HStack spacing={8} alignItems={"center"}>
          <Box fontWeight={"bold"} fontSize={"xl"}>
            Logo
          </Box>
        </HStack>
        <Flex alignItems={"center"} columnGap={3}>
          <IconButton
            colorScheme={"orange"}
            borderRadius="50%"
            size="lg"
            color="white"
            variant="ghost"
            _hover={{
              background: "orange.400",
            }}
            icon={<AiOutlineUnorderedList />}
          />

          <IconButton
            colorScheme={"orange"}
            borderRadius="50%"
            size="lg"
            color="white"
            variant="ghost"
            _hover={{
              background: "orange.400",
            }}
            icon={<AiOutlineUser />}
          />
        </Flex>
      </Box>
      <Outlet />
    </Box>
  );
};
