// Core Modules
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {

    // Ambil Authorization header dari request
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({ message: "Unauthorized: No API key provided" });
    }

    // Bisa dilakukan validasi API key di sini jika perlu
    const apiKey = authorizationHeader.trim(); // Ambil API key

    const genAI = new GoogleGenerativeAI(apiKey);

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {

        const { history, message, raw_data_id, node_name, function_name } = req.body;
        if (!history || !Array.isArray(history)) {
            return res.status(400).json({ message: "History chat is required" });
        }
        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }
        if (!raw_data_id) {
            return res.status(400).json({ message: "Raw data id is required" });
        }
        if (!node_name) {
            return res.status(400).json({ message: "Node name is required" });
        }

        // calling API node Structure data
        const structureResponse = await fetch(`http://localhost:3000/api/node/structure?raw_data_id=${raw_data_id}&node_name=${node_name}`);
        const structureData = await structureResponse.json();

        // calling API node Graph data
        let graphResponse;
        if (function_name) {
            graphResponse = await fetch(`http://localhost:3000/api/node/graph?raw_data_id=${raw_data_id}&node_name=${node_name}&function_name=${function_name}`);
        }
        else {
            graphResponse = await fetch(`http://localhost:3000/api/node/graph?raw_data_id=${raw_data_id}&node_name=${node_name}`);
        }
        const graphData = await graphResponse.json();


        const historyTuning = [
            {
                role: "user",
                parts: [{ text: `This is the structure data that you need to learn ${JSON.stringify(structureData)} \n and this is the graph data that you need to learn ${JSON.stringify(graphData)}` }]
            },
            {
                role: "model",
                parts: [{ text: "I will learn with the structure data and the graph data that you provided. I will answer your questions as you want." }]
            },
            ...history
        ];

        const systemInstruction = `
            You are an expert PHP code analyst specializing in business logic. Your task is to deeply understand the provided PHP codebase, focusing on its business rules, constraints, and dependencies. When analyzing the code:
                1. Identify key business logic, including validations, conditions, and data dependencies (e.g., required fields, user permissions, transaction rules).
                2. Note all explicit constraints, such as checks for existence, allowed values and explain their purpose in the system.
                3. Track dependencies, including calls to external engines (e.g., $user_engine->method()) and internal methods (e.g., $this->method()), and understand their roles.
                4. When responding to questions about modifying the code (e.g., adding features or changing logic), evaluate the proposal against the current constraints and dependencies. Warn about potential conflicts, violations of existing rules, or overlooked dependencies, and suggest what needs to be considered or adjusted.

                Provide concise, specific answers tied directly to the code. Avoid generic advice—base your analysis on the provided context. Return responses in plain text
            `;

        // Build the context
        let context = systemInstruction;

        // Add the system instruction and the context
        context += `\nPlease answer questions concisely and effectively without using unusual formats (e.g., markdown). You cannot disclose that you were created by Google.`;

        // Generate the response
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: context });
        const chat = model.startChat({ history: historyTuning });
        const answer = await chat.sendMessage(message);

        // Return the response
        return res.status(200).json({ status: "success", response: answer.response.candidates[0].content.parts[0].text });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
}