// Core Modules
import { ReactFlow, Controls, Background, addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { useDialog } from '@chakra-ui/react';
import { useState, useCallback, useEffect } from 'react';

// Custom Modules
import { useRouter } from "next/router";
import { buildDependencyFlow } from '@/utils/buildGraph';
import { useGlobalContext } from '@/context/GlobalContext';
import GraphDialog from '@/components/dialog/graph';

// CSS
import '@xyflow/react/dist/style.css';

export default function DependencyFlow() {
    const { setNodeFuncMetaData } = useGlobalContext();

    const dialog = useDialog();
    const router = useRouter();
    const { name } = router.query;

    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    const onNodesChange = useCallback(
        (changes) => {
            setNodes((nds) => {
                const updatedNodes = applyNodeChanges(changes, nds);
                localStorage.setItem("node-graph-model", JSON.stringify(updatedNodes));
                return updatedNodes;
            });
        },
        []
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (connection) => setEdges((eds) => addEdge({ ...connection, style: { stroke: '#FF0072', strokeWidth: 2 } }, eds)),
        [setEdges]
    );

    useEffect(() => {
        async function loadDependencyFlow() {
            if (!name) return;
            const { nodes: newNodes, edges: newEdges } = await buildDependencyFlow(name, localStorage.getItem("raw-data-id"));

            // Add custom styles to nodes
            const styledNodes = newNodes.map(node => ({
                ...node,
                style: {
                    ...(node.data?.main
                        ? {
                            background: '#1A365D', // Blue for main nodes
                            color: '#fff', // White text for contrast
                            border: '1px solid #777',
                            borderRadius: '5px',
                            padding: '10px',
                        }
                        : {
                            background: 'white', // Dark slate for non-main nodes
                            color: 'black',
                            border: '1px solid #999',
                            borderRadius: '5px',
                            padding: '10px',
                        }),
                },
            }));

            // Add custom styles to edges
            const styledEdges = newEdges.map(edge => ({
                ...edge,
                style: {
                    stroke: '#FF0072', // Bright pink edges
                    strokeWidth: 2,
                    ...(edge.style || {}), // Preserve any existing styles
                },
            }));

            setNodes(styledNodes);
            setEdges(styledEdges);
        }
        loadDependencyFlow();
    }, [name]);

    return (
        <div style={{
            width: "99vw",
            height: "93vh",
            overflow: "hidden",
        }}>
            <GraphDialog dialog={dialog} content={name} />

            <ReactFlow
                nodes={nodes}
                deleteKeyCode={null}
                onNodesChange={onNodesChange}
                edges={edges}
                onNodeClick={(event, node) => {
                    if (node.data.main) {
                        dialog.setOpen(true);
                        setNodeFuncMetaData(node.data);
                    }
                }}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            >
                <Background
                />
                <Controls
                    style={{
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    }}
                />
            </ReactFlow>
        </div>
    );
}