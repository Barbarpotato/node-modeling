// Core Module
import { ReactFlow, Controls, Background, addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { useState, useCallback, useEffect } from 'react';
import { Button, CloseButton, Drawer, Portal } from "@chakra-ui/react";

// Custom Module
import { useGlobalContext } from '@/context/GlobalContext';
import { useRouter } from "next/router";

// CSS
import '@xyflow/react/dist/style.css';

export default function Home() {
  const { setNodeMetaData } = useGlobalContext();

  // For drawer
  const [open, setOpen] = useState(false);

  // For React Flow
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds);
        localStorage.setItem("node-model", JSON.stringify(updatedNodes));
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
    const nodeModel = localStorage.getItem("node-model");
    const edgeModel = localStorage.getItem("edge-model");

    if (nodeModel && edgeModel) {
      let parsedNodes = JSON.parse(nodeModel);
      let parsedEdges = JSON.parse(edgeModel);

      // Add custom styles to nodes
      parsedNodes = parsedNodes.map(node => ({
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
            : {}), // No custom style for non-main nodes
        },
      }));

      // Add custom styles to edges
      parsedEdges = parsedEdges.map(edge => ({
        ...edge,
        style: {
          stroke: '#FF0072', // Bright pink edges
          strokeWidth: 2,
          ...(edge.style || {}), // Preserve any existing styles
        },
      }));

      setNodes(parsedNodes);
      setEdges(parsedEdges);
    }
  }, []);

  return (
    <div style={{
      width: "99vw",
      height: "93vh",
      overflow: "hidden",
    }}>
      <HomeDrawer open={open} setOpen={setOpen} />

      <ReactFlow
        nodes={nodes}
        deleteKeyCode={null}
        onNodesChange={onNodesChange}
        edges={edges}
        onNodeClick={(event, node) => {
          if (node.data.main) {
            setOpen(true);
            setNodeMetaData(node);
          }
        }}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function HomeDrawer({ open, setOpen }) {
  const { nodeMetaData } = useGlobalContext();
  const router = useRouter();
  const [isFilePathNull, setIsFilePathNull] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const filePath = localStorage.getItem(`file_attached-${nodeMetaData.data?.label}`);
      setIsFilePathNull(filePath === null);
    }
  }, [nodeMetaData]);

  return (
    <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Node Option Details</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Button
                my={1}
                variant="solid"
                w="100%"
                onClick={() => router.push(`/node/structure/${nodeMetaData.data.label}`)}
                size="xs"
              >
                Structure Data
              </Button>
              <Button
                my={1}
                disabled={isFilePathNull}
                textAlign="left"
                variant="solid"
                w="100%"
                onClick={() => router.push(`/node/graph/${nodeMetaData.data.label}`)}
                size="xs"
              >
                Graph Data
              </Button>
            </Drawer.Body>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}