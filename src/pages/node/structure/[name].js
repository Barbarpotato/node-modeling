"use client";
import { Background, ReactFlow, applyNodeChanges } from "@xyflow/react";
import { useRouter } from "next/router";
import DatabaseSchemaDemo from "@/components/databaseschemademo";
import "@xyflow/react/dist/style.css";
import { useEffect, useState, useCallback } from "react";

const nodeTypes = {
    databaseSchema: DatabaseSchemaDemo,
};

export default function Node() {
    const router = useRouter();
    const { name } = router.query;
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    const onNodesChange = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    useEffect(() => {
        if (!name) return; // Wait for name

        try {
            // Get and parse raw data with fallback
            const rawData = JSON.parse(localStorage.getItem("raw-data") || "{}");
            const object = rawData[name] || {};

            const newNodes = [];
            const newEdges = [];
            let index = 1;

            // Step 1: Generate nodes and collect schema info
            const nodeSchemas = new Map(); // Map to store node ID -> schema for edge creation

            Object.keys(object).forEach((component) => {
                const componentData = object[component];

                Object.keys(componentData).forEach((node) => {
                    const nodeData = componentData[node];
                    const fieldName = nodeData["^field_name"] || [];
                    const fieldType = nodeData["^field_type"] || [];
                    const tableName = nodeData["table_name"] || `node-${index}`;

                    const schema = [];
                    for (let i = 0; i < fieldName.length; i++) {
                        schema.push({
                            title: fieldName[i],
                            type: fieldType[i],
                        });
                    }

                    newNodes.push({
                        id: tableName,
                        position: { x: index * 400, y: index * 200 }, // Simplified positioning
                        type: "databaseSchema",
                        data: {
                            label: tableName,
                            schema: schema,
                        },
                    });

                    // Store schema for this node
                    nodeSchemas.set(tableName, schema);
                    index++;
                });
            });

            // Step 2: Generate edges based on foreign keys
            newNodes.forEach((sourceNode) => {
                const sourceSchema = nodeSchemas.get(sourceNode.id);

                sourceSchema.forEach((field) => {
                    // Check if the field looks like a foreign key (ends with "_id")
                    if (field.title.endsWith("_id")) {
                        const possibleTableName = field.title.replace("_id", ""); // e.g., "user_id" -> "user"

                        // Find the target node that matches the inferred table name
                        const targetNode = newNodes.find(
                            (n) => n.id.toLowerCase() === possibleTableName.toLowerCase()
                        );

                        if (targetNode) {
                            const targetSchema = nodeSchemas.get(targetNode.id);
                            const targetPrimaryKey = targetSchema[0]?.title || "id"; // First field as primary key, fallback to "id"

                            newEdges.push({
                                id: `${sourceNode.id}-${targetNode.id}-${field.title}`,
                                source: sourceNode.id,
                                target: targetNode.id,
                                sourceHandle: field.title, // e.g., "user_id"
                                targetHandle: targetPrimaryKey, // First field of target node's schema
                                type: "smoothstep",
                                label: `${field.title} → ${targetPrimaryKey}`, // Optional: show relationship
                            });
                        }
                    }
                });
            });

            setNodes(newNodes);
            setEdges(newEdges);
        } catch (error) {
            console.error("Error processing raw-data:", error);
            setNodes([]);
            setEdges([]);
        }
    }, [name]);

    return (
        <div
            style={{
                width: "99vw",
                height: "93vh",
                overflow: "hidden",
                scrollbarWidth: "none"
            }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                fitView
            >
                <Background />
            </ReactFlow>
        </div>
    );
}