// Core Modules
import { Dialog, Button, Portal, CloseButton, Flex, Textarea, Text, Box, Heading, Spacer } from '@chakra-ui/react';
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { LuScanText } from "react-icons/lu";
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; // Use the main import
import { coy } from 'react-syntax-highlighter/dist/cjs/styles/prism'; // Use cjs styles

// Custom Modules
import { useGlobalContext } from '@/context/GlobalContext';


export default function GraphDialog({ dialog, content }) {
    const { nodeFuncMetaData, geminiApiKey } = useGlobalContext();

    const [message, setMessage] = useState("");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFullScanToggled, setIsFullScanToggled] = useState(false);

    const dialogBodyRef = useRef(null);

    useEffect(() => {
        if (dialogBodyRef.current) {
            dialogBodyRef.current.scrollTo({
                top: dialogBodyRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [history]);

    useEffect(() => {
        if (!dialog.open) {
            setMessage("");
            setHistory([]);
            setIsFullScanToggled(false);
        }
    }, [dialog.open]);

    const handleToggleFullScan = () => {
        setIsFullScanToggled((prev) => !prev);
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        setLoading(true);
        setHistory((prev) => [
            ...prev,
            {
                role: "user",
                parts: [{ text: message }],
                message: message,
            },
            {
                role: "model",
                parts: [{ text: "Thinking..." }],
                message: "Typing...",
            },
        ]);
        setMessage("");

        try {
            const raw_data_id = localStorage.getItem("raw-data-id");
            const node_name = content;
            let function_name = "";
            if (!isFullScanToggled) function_name = nodeFuncMetaData.label;

            const response = await fetchData(message, history, raw_data_id, node_name, function_name, geminiApiKey);

            setHistory((prev) => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = {
                    role: "model",
                    parts: [{ text: response }],
                    message: response,
                };
                return newHistory;
            });
        } catch (error) {
            setHistory((prev) => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = {
                    role: "model",
                    parts: [{ text: `Error: ${error.message}` }],
                    message: `Error: ${error.message}`,
                };
                return newHistory;
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog.Root closeOnInteractOutside={false} size={'xl'} scrollBehavior={'inside'} placement={'center'}
            open={dialog.open} onOpenChange={(e) => dialog.setOpen(e.open)}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>
                                <Heading size={"md"}>
                                    Ask Questions About "{nodeFuncMetaData.label?.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}"
                                </Heading>
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body ref={dialogBodyRef} marginX={6}>
                            {history.map((msg, index) =>
                                msg.message ? (
                                    <Flex
                                        key={index}
                                        direction="column"
                                        align={msg.role === "model" ? "flex-start" : "flex-end"}
                                    >
                                        <Box
                                            mb={10}
                                            p={3}
                                            borderRadius="md"
                                            bg={msg.role === "model" ? "#3b3b3b" : "#3b3b3b"}
                                            color="white"
                                            width="85%"
                                            transition="all 0.2s ease-in-out"
                                            _hover={{
                                                bg: msg.role === "model" ? "black" : "black",
                                                transform: "scale(1.02)",
                                                boxShadow: "md",
                                            }}
                                        >
                                            <Text fontWeight="bold" color="white">
                                                {msg.role === "model" ? "Assistant" : "You"}
                                            </Text>
                                            <Box mt={1}>
                                                <ReactMarkdown
                                                    components={{
                                                        code({ node, inline, className, children, ...props }) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            return !inline && match ? (
                                                                <SyntaxHighlighter
                                                                    style={coy} // Use cjs-compatible style
                                                                    language={match[1]}
                                                                    PreTag="div"
                                                                    {...props}
                                                                >
                                                                    {String(children).replace(/\n$/, '')}
                                                                </SyntaxHighlighter>
                                                            ) : (
                                                                <Text as="code" bg="gray.800" p={1} borderRadius="sm" {...props}>
                                                                    {children}
                                                                </Text>
                                                            );
                                                        },
                                                        p: ({ children }) => <Text mt={1}>{children}</Text>,
                                                        ul: ({ children }) => <Box as="ul" pl={4} mt={1}>{children}</Box>,
                                                        ol: ({ children }) => <Box as="ol" pl={4} mt={1}>{children}</Box>,
                                                        li: ({ children }) => <Text as="li">{children}</Text>,
                                                        strong: ({ children }) => <Text as="strong" fontWeight="bold">{children}</Text>,
                                                        em: ({ children }) => <Text as="em" fontStyle="italic">{children}</Text>,
                                                    }}
                                                >
                                                    {msg.message}
                                                </ReactMarkdown>
                                            </Box>
                                        </Box>
                                    </Flex>
                                ) : null
                            )}
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Flex width="100%" direction={'column'} gap={2} borderColor={"gray.200"} borderWidth="1px" borderRadius="md">
                                <Textarea
                                    value={message}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    onChange={(e) => setMessage(e.target.value)}
                                    isDisabled={loading}
                                    background="transparent"
                                    placeholder="Ask me anything..."
                                    size="sm"
                                    border="none"
                                    _placeholder={{ color: "gray.400" }}
                                    flex="1"
                                    resize="none"
                                    rows={5}
                                    overflowY="auto"
                                    paddingY="8px"
                                    _focus={{ boxShadow: "none", outline: "none" }}
                                />
                                <Flex padding={2}>
                                    <Button
                                        ml={2}
                                        disabled={loading || !message}
                                        borderRadius="xl"
                                        variant={isFullScanToggled ? "solid" : "outline"}
                                        bg={isFullScanToggled ? "black" : "transparent"}
                                        color={isFullScanToggled ? "white" : "gray.400"}
                                        onClick={handleToggleFullScan}
                                        isLoading={loading}
                                        loadingText="Sending..."
                                        size="md"
                                        _hover={{
                                            bg: isFullScanToggled ? "black" : "gray.700",
                                            color: "white",
                                        }}
                                    >
                                        <LuScanText />
                                        Full Scan Node
                                    </Button>
                                    <Spacer />
                                    <Button
                                        disabled={loading || !message}
                                        borderRadius="md"
                                        variant={'ghost'}
                                        onClick={handleSendMessage}
                                        isLoading={loading}
                                        loadingText="Sending..."
                                        size="md"
                                        px={4}
                                    >
                                        <FaRegArrowAltCircleUp />
                                    </Button>
                                </Flex>
                            </Flex>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}


// Fetch data from your local API
const fetchData = async (message = "", history = [], raw_data_id, node_name, function_name = "", APIKEY = "") => {
    const filteredHistory = history.map((item) => ({
        role: item.role,
        parts: item.parts,
    }));

    const response = await fetch("/api/conversation/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${APIKEY}`,
        },
        body: JSON.stringify({
            history: filteredHistory,
            message: message,
            raw_data_id: raw_data_id,
            node_name: node_name,
            function_name: function_name || undefined, // Only include if provided
        }),
    });

    const data = await response.json();
    if (data.status === "success") {
        return data.response; // Return the text response from your API
    } else {
        throw new Error(data.message || "Failed to fetch response from API");
    }
};

