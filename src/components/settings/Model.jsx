import { Box, Button, Flex, Heading, Input, Separator, Spacer, Text, Badge } from '@chakra-ui/react';
import { buildModel } from '@/utils/buildModel';
import { Fragment, useEffect, useState, useRef } from 'react';

export default function Model() {
    const [rawDataList, setRawDataList] = useState([]);
    const [fileContent, setFileContent] = useState("");
    const [fileName, setFileName] = useState("");

    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            setFileContent(content);
        };
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            setFileContent("");
            setFileName("");
        };
        reader.readAsText(file);
    };

    const handleSave = async () => {
        if (!fileContent) {
            alert("No file selected or empty file!");
            return;
        }

        try {
            let parsedContent;
            try {
                parsedContent = JSON.parse(fileContent);
                if (!parsedContent._project_name) {
                    throw new Error('File content must include "_project_name" property');
                }
            } catch (parseError) {
                alert('Invalid JSON file: ' + parseError.message);
                return;
            }

            const response = await fetch("/api/rawData", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: fileContent,
                    project_name: parsedContent._project_name,
                    created: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to set up database or fetch data');
            }

            setFileContent("");
            setFileName("");
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            const updatedResponse = await fetch("/api/rawData");
            const updatedData = await updatedResponse.json();
            setRawDataList(updatedData.rawData);

            alert("Model has been imported successfully!");
        } catch (error) {
            console.error('Error in handleSave:', error);
            alert("Failed to save model: " + error.message);
        }
    };

    const handleApply = async (data) => {
        try {
            const rawData = JSON.parse(data.data);

            localStorage.setItem("raw-data-id", data.id);
            localStorage.setItem("raw-data", data.data);
            localStorage.setItem("node-model", '[]');
            localStorage.setItem('edge-model', '[]');

            const response = await fetch(`/api/node?raw_data=${data.id}`);
            const nodes = await response.json();

            if (nodes.length > 0) {
                for (let i = 0; i < nodes.length; i++) {
                    localStorage.setItem(`file_path-${nodes[i]['node_name']}`, nodes[i]['file_path']);
                }
            }

            buildModel(rawData);

            alert("Model has been applied!");

            window.location.reload();
        } catch (error) {
            console.error('Error in handleApply:', error);
            alert("Failed to apply model: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(`Are you sure you want to delete the model with ID ${id}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/rawData/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete model');
            }

            const updatedResponse = await fetch("/api/rawData");
            const updatedData = await updatedResponse.json();
            setRawDataList(updatedData.rawData || []);

            // If the deleted model was active, clear the localStorage
            if (localStorage.getItem("raw-data-id") === String(id)) {
                localStorage.removeItem("raw-data-id");
                localStorage.removeItem("raw-data");
                localStorage.removeItem("node-model");
                localStorage.removeItem("edge-model");
                // Optionally clear file_path entries if needed
            }

            alert("Model has been deleted successfully!");
        } catch (error) {
            console.error('Error in handleDelete:', error);
            alert("Failed to delete model: " + error.message);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/rawData");
                if (!response.ok) {
                    throw new Error('Failed to fetch raw data');
                }
                const data = await response.json();
                setRawDataList(data.rawData || []);
            } catch (error) {
                console.error('Error fetching raw data:', error);
                alert("Failed to fetch raw data: " + error.message);
            }
        };
        fetchData();
    }, []);

    return (
        <Fragment>
            <Box borderRadius={"md"} padding={5} shadow={"lg"}>
                <Heading>Import Model</Heading>

                <Input
                    my={5}
                    type="file"
                    accept=".json,.txt"
                    borderWidth={0}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                />

                <Flex my={5}>
                    <Text>{fileName ? `Loaded: ${fileName}` : "Please select a file with extension .json or .txt"}</Text>
                    <Spacer />
                    <Button onClick={handleSave} isDisabled={!fileContent}>
                        Save
                    </Button>
                </Flex>
            </Box>

            <Box borderRadius={"md"} padding={5} my={5} shadow={"lg"}>
                <Heading>Model List</Heading>

                {rawDataList.length === 0 ? (
                    <Text>No models available.</Text>
                ) : (
                    rawDataList.map((item, index) => {
                        const isActive = localStorage.getItem("raw-data-id") === String(item.id); // Compare with item.id
                        return (
                            <Box marginY={3} key={index}>
                                <Flex my={5} direction={"row"} alignItems={"center"}>
                                    <Heading size={"lg"}>{item.project_name}</Heading>
                                    {isActive && (
                                        <Badge ml={2} colorScheme="blue">
                                            Active
                                        </Badge>
                                    )}
                                    <Spacer />
                                    <Button onClick={() => handleApply(item)} mr={2}>
                                        Apply Model
                                    </Button>
                                    <Button colorPalette="red" onClick={() => handleDelete(item.id)}>
                                        Delete Model
                                    </Button>
                                </Flex>
                                <Separator />
                            </Box>
                        );
                    })
                )}
            </Box>
        </Fragment>
    );
}