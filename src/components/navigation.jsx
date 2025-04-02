import {
    Flex, Box, Button, Spacer,
} from "@chakra-ui/react";
import Link from "next/link";

function Navigation() {


    return (
        <Box as="nav" bg="white" boxShadow="sm" py={4}>
            <Flex
                mx="auto"
                px={4}
                align="center"
                justify="space-between"
            >

                <Box as={Link} href="/" cursor="pointer" fontSize="xl" fontWeight="bold">
                    Node Modeling
                </Box>

                <Spacer />

                <Button as={Link} href="/settings" variant={'outline'} borderRadius={'xl'} size="sm">
                    Settings
                </Button>

            </Flex>

        </Box>
    );
}

export default Navigation;