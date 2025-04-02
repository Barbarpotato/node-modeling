import { Box, Button, Flex, Heading, Input, InputGroup, Separator, Spacer } from '@chakra-ui/react';
import { useGlobalContext } from '@/context/GlobalContext';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRef, useState } from 'react';


function APIKEY() {

    const { geminiApiKey, setGeminiApiKey } = useGlobalContext();

    const [showApiKey, setShowApiKey] = useState(false);
    const inputRef = useRef(null)

    const handleSave = () => {
        localStorage.setItem("gemini-api-key", geminiApiKey);
        alert("API KEY has been saved!");
    }

    const endElement = showApiKey ? (
        <FaEye onClick={() => setShowApiKey(!showApiKey)} />
    ) : (
        <FaEyeSlash onClick={() => setShowApiKey(!showApiKey)} />
    )

    return (
        <Box borderRadius={"md"} padding={5} shadow={"lg"}>

            <Heading>API KEY</Heading>

            <Separator my={5} />

            <Heading fontSize={"md"}>Gemini API KEY</Heading>

            <InputGroup endElement={endElement}>
                <Input value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value)}
                    ref={inputRef} my={2} placeholder='Your GEMINI API KEY' type={showApiKey ? "text" : "password"} />

            </InputGroup>

            <Flex mt={5}>
                <></>
                <Spacer />
                <Button onClick={handleSave}>Save</Button>
            </Flex>
        </Box>
    )
}

export default APIKEY