import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  MarkerType,
  NodeChange,
  EdgeChange,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Paper, Snackbar, Alert } from '@mui/material';
import AgentNode from './AgentNode';
import { WorkflowNode, WorkflowEdge } from '@/api/workflowService';

interface WorkflowEditorProps {
  workflowId: string;
  availableAgents: Record<string, any>;
  backendNodes: WorkflowNode[];
  backendEdges: WorkflowEdge[];
  onAddNode: (nodeType: string, position: { x: number, y: number }) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddEdge: (sourceId: string, targetId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onNodePositionChange: (nodeId: string, position: { x: number, y: number }) => void;
}

const nodeTypes: NodeTypes = {
  agent: AgentNode
};

// Edge configuration
const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20
  },
  style: {
    strokeWidth: 2
  }
};

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  workflowId,
  availableAgents,
  backendNodes,
  backendEdges,
  onAddNode,
  onDeleteNode,
  onAddEdge,
  onDeleteEdge,
  onNodePositionChange
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Convert backend nodes to React Flow format
  useEffect(() => {
    if (backendNodes.length > 0) {
      const reactFlowNodes = backendNodes.map(node => {
        const agentInfo = availableAgents[node.node_type] || {
          name: node.name,
          description: 'Unknown agent',
          category: 'general',
          inputs: [],
          outputs: []
        };

        return {
          id: node.id,
          type: 'agent',
          position: { x: node.position_x, y: node.position_y },
          data: {
            label: node.name,
            nodeType: node.node_type,
            category: agentInfo.category,
            description: node.description || agentInfo.description,
            inputs: agentInfo.inputs,
            outputs: agentInfo.outputs,
            onDelete: onDeleteNode
          }
        };
      });

      setNodes(reactFlowNodes);
    } else {
      setNodes([]);
    }
  }, [backendNodes, availableAgents, onDeleteNode]);

  // Convert backend edges to React Flow format
  useEffect(() => {
    if (backendEdges.length > 0) {
      const reactFlowEdges = backendEdges.map(edge => ({
        id: edge.id,
        source: edge.source_id,
        target: edge.target_id,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed
        },
        data: {
          edgeType: edge.edge_type,
          conditions: edge.conditions
        }
      }));

      setEdges(reactFlowEdges);
    } else {
      setEdges([]);
    }
  }, [backendEdges]);

  // Handle node drag and drop from panel to canvas
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) return;

      // Check if the node type is valid
      if (!availableAgents[nodeType]) {
        setSnackbarSeverity('error');
        setSnackbarMessage(`Agent type ${nodeType} is not available`);
        setSnackbarOpen(true);
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });

      onAddNode(nodeType, position);
    },
    [reactFlowInstance, availableAgents, onAddNode]
  );

  // Handle edge connections
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        onAddEdge(connection.source, connection.target);
      }
    },
    [onAddEdge]
  );

  // Handle node drag end (position update)
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodePositionChange(node.id, node.position);
    },
    [onNodePositionChange]
  );

  // Handle edge removal
  const onEdgeDelete = useCallback(
    (edge: Edge) => {
      onDeleteEdge(edge.id);
    },
    [onDeleteEdge]
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: '100%',
        position: 'relative'
      }}
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onEdgeClick={(_event, edge) => onEdgeDelete(edge)}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <Background />
      </ReactFlow>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default function WorkflowEditorWithProvider(props: WorkflowEditorProps) {
  return (
    <ReactFlowProvider>
      <WorkflowEditor {...props} />
    </ReactFlowProvider>
  );
}