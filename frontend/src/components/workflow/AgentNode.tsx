// src/components/workflow/AgentNode.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, Paper, Tooltip, IconButton, Button } from '@mui/material';
import { Delete as DeleteIcon, Info as InfoIcon, PlayArrow as RunIcon, Settings as SettingsIcon } from '@mui/icons-material';

interface AgentNodeProps extends NodeProps {
  data: {
    label: string;
    nodeType: string;
    category: string;
    description: string;
    inputs: string[];
    outputs: string[];
    onDelete?: (id: string) => void;
    onRun?: (id: string) => void;
    onConfigure?: (id: string) => void; // Thêm handler cho cấu hình
  };
}

// Node styles based on category
const getNodeStyle = (category: string) => {
  switch (category) {
    case 'code':
      return { borderColor: '#3498db', backgroundColor: '#ebf5fb' };
    case 'git':
      return { borderColor: '#e74c3c', backgroundColor: '#fdedec' };
    case 'general':
      return { borderColor: '#2ecc71', backgroundColor: '#eafaf1' };
    default:
      return { borderColor: '#95a5a6', backgroundColor: '#f4f6f6' };
  }
};

const AgentNode = memo(({ id, data, selected }: AgentNodeProps) => {
  const { label, nodeType, category, description, inputs, outputs, onDelete, onRun, onConfigure } = data;
  const style = getNodeStyle(category);

  return (
    <Paper
      elevation={selected ? 5 : 2}
      sx={{
        borderRadius: '8px',
        border: `2px solid ${style.borderColor}`,
        backgroundColor: style.backgroundColor,
        padding: 1,
        minWidth: 180,
        maxWidth: 250,
      }}
    >
      {/* Input handle for connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: style.borderColor }}
      />

      {/* Node header */}
      <Box sx={{
        p: 1,
        backgroundColor: style.borderColor,
        borderRadius: '4px 4px 0 0',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {label}
        </Typography>
        <Box>
          <Tooltip title="Info">
            <IconButton size="small" sx={{ color: 'white' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Thêm nút cấu hình */}
          {onConfigure && (
            <Tooltip title="Cấu hình">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => onConfigure(id)}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {onDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" sx={{ color: 'white' }} onClick={() => onDelete(id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Node content */}
      <Box sx={{ p: 1 }}>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          Type: {nodeType}
        </Typography>

        <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
          {description}
        </Typography>

        {/* Input/Output indicators */}
        <Box sx={{ mt: 1 }}>
          {inputs.length > 0 && (
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 'bold' }}>
              Inputs: {inputs.join(', ')}
            </Typography>
          )}

          {outputs.length > 0 && (
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 'bold' }}>
              Outputs: {outputs.join(', ')}
            </Typography>
          )}
        </Box>

        {/* Run button */}
        {onRun && (
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RunIcon />}
              onClick={() => onRun(id)}
              sx={{
                borderColor: style.borderColor,
                color: style.borderColor,
                '&:hover': {
                  backgroundColor: `${style.borderColor}20`
                }
              }}
            >
              Run
            </Button>
          </Box>
        )}
      </Box>

      {/* Output handle for connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: style.borderColor }}
      />
    </Paper>
  );
});

export default AgentNode;