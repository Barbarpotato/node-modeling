import { createContext, useContext, useState, useEffect } from "react";

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
    // Global State for Table View
    const [nodeMetaData, setNodeMetaData] = useState({});
    const [nodeFuncMetaData, setNodeFuncMetaData] = useState({});
    const [geminiApiKey, setGeminiApiKey] = useState("");

    // Ensure localStorage is accessed only on the client side
    useEffect(() => {
        const storedApiKey = localStorage.getItem("gemini-api-key");
        if (storedApiKey) {
            setGeminiApiKey(storedApiKey);
        }
    }, []);

    // Function to reset state
    const resetState = () => {
        setNodeMetaData({});
    };

    const contextValue = {
        nodeMetaData,
        setNodeMetaData,
        nodeFuncMetaData,
        setNodeFuncMetaData,
        geminiApiKey,
        setGeminiApiKey,
        resetState,
    };

    return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => useContext(GlobalContext);
