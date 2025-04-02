import { Box, Button, Flex, Heading, Input, Separator, Text, CloseButton, Dialog, Portal, Badge } from '@chakra-ui/react';
import { buildModel } from '@/utils/buildModel';
import { IoIosAttach } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { Fragment, useEffect, useState } from 'react';

export default function Data() {
    const [rawData, setRawData] = useState([]);
    const [fileContent, setFileContent] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [activeObjectName, setActiveObjectName] = useState(null);

    useEffect(() => {
        const rawDataTemp = JSON.parse(localStorage.getItem("raw-data"));
        if (rawDataTemp) {
            setRawData(rawDataTemp);
        }
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const content = await file.text();
                setFileContent(content);
            } catch (error) {
                console.error('Error reading file:', error);
                alert('Failed to read file: ' + error.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!activeObjectName) {
            alert("Error: No object name selected");
            return;
        }

        if (!fileContent) {
            alert("Error: No file selected");
            return;
        }

        try {
            const response = await fetch("/api/node", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    file: fileContent,
                    raw_data: localStorage.getItem("raw-data-id"),
                    node_name: activeObjectName,
                    created: new Date().toISOString(),
                }),
            });

            // Store the fact that a file is attached, but not the content
            localStorage.setItem(`file_attached-${activeObjectName}`, 'true');

            const data = await response.json();
            if (response.ok) {
                alert("Successfully Attached Engine!");
                setOpenModal(false);
                setActiveObjectName(null);
                setFileContent(null);
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            alert("Failed to attach engine: " + error.message);
        }
    };

    const handleDeleteNode = (keyToRemove) => {
        const { [keyToRemove]: _, ...rest } = rawData;
        setRawData(rest);
        localStorage.setItem("raw-data", JSON.stringify(rest));
        localStorage.removeItem("node-model");
        localStorage.removeItem("edge-model");
        localStorage.removeItem(`file_attached-${keyToRemove}`);
        buildModel(rest);
    };

    return (
        <Fragment>
            <Box borderRadius={"md"} padding={5} shadow={"lg"}>
                <Heading>Current Node</Heading>
                <Separator my={5} />
                {Object.keys(rawData).length > 0 ? (
                    <Box my={5}>
                        <Box mt={2}>
                            {Object.keys(rawData)
                                .filter((objectName) => objectName !== "_project_name")
                                .map((objectName, idx) => {
                                    const isAttached = !!localStorage.getItem(`file_attached-${objectName}`);
                                    return (
                                        <Fragment key={idx}>
                                            <Flex my={6} alignItems="center">
                                                <Text>{objectName}</Text>
                                                {isAttached && (
                                                    <Badge ml={2} colorScheme="green">
                                                        Attached
                                                    </Badge>
                                                )}
                                                <Dialog.Root
                                                    size="lg"
                                                    placement="center"
                                                    motionPreset="slide-in-bottom"
                                                    lazyMount
                                                    open={openModal && activeObjectName === objectName}
                                                    onOpenChange={(e) => {
                                                        if (e.open) {
                                                            setActiveObjectName(objectName);
                                                        } else {
                                                            setActiveObjectName(null);
                                                            setFileContent(null);
                                                        }
                                                        setOpenModal(e.open);
                                                    }}
                                                >
                                                    <Dialog.Trigger asChild>
                                                        <Button ml={"auto"} mr={3} variant="outline" size="sm">
                                                            <IoIosAttach />
                                                        </Button>
                                                    </Dialog.Trigger>
                                                    <Portal>
                                                        <Dialog.Backdrop />
                                                        <Dialog.Positioner>
                                                            <Dialog.Content>
                                                                <Dialog.Header>
                                                                    <Dialog.Title>Attach Engine File</Dialog.Title>
                                                                    <Dialog.CloseTrigger asChild>
                                                                        <CloseButton size="sm" />
                                                                    </Dialog.CloseTrigger>
                                                                </Dialog.Header>
                                                                <Dialog.Body>
                                                                    <Heading my={5}>Upload Engine File</Heading>
                                                                    <form onSubmit={handleSubmit}>
                                                                        <Input
                                                                            type="file"
                                                                            accept=".php"
                                                                            onChange={handleFileChange}
                                                                            mb={5}
                                                                        />
                                                                        <Button type="submit">
                                                                            Attach
                                                                        </Button>
                                                                    </form>
                                                                </Dialog.Body>
                                                            </Dialog.Content>
                                                        </Dialog.Positioner>
                                                    </Portal>
                                                </Dialog.Root>
                                                <Button
                                                    size={"xs"}
                                                    disabled={isAttached}
                                                    variant={"solid"}
                                                    onClick={() => handleDeleteNode(objectName)}
                                                    colorPalette={isAttached ? "black" : "red"}
                                                >
                                                    <MdDelete />
                                                </Button>
                                            </Flex>
                                            <Separator />
                                        </Fragment>
                                    );
                                })}
                        </Box>
                    </Box>
                ) : (
                    <Box mt={5}>
                        <Heading size={"md"}>No data found</Heading>
                    </Box>
                )}
            </Box>
        </Fragment>
    );
}