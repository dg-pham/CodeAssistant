import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemButton,
  Typography,
  Box,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon, PlayArrow as RunIcon } from '@mui/icons-material';
import { Workflow } from '@/api/workflowService';
import { formatDistanceToNow } from 'date-fns';

interface WorkflowListProps {
  workflows: Workflow[];
  onSelectWorkflow: (workflow: Workflow) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  onRunWorkflow: (workflowId: string) => void;
  selectedWorkflowId?: string;
}

const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  onSelectWorkflow,
  onDeleteWorkflow,
  onRunWorkflow,
  selectedWorkflowId
}) => {
  if (workflows.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No workflows found</Typography>
      </Box>
    );
  }

  return (
    <Paper variant="outlined">
      <List sx={{ width: '100%' }}>
        {workflows.map((workflow) => (
          <React.Fragment key={workflow.id}>
            <ListItem
              secondaryAction={
                <Box>
                  <IconButton edge="end" onClick={() => onRunWorkflow(workflow.id)}>
                    <RunIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => onDeleteWorkflow(workflow.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
              disablePadding
            >
              <ListItemButton
                selected={selectedWorkflowId === workflow.id}
                onClick={() => onSelectWorkflow(workflow)}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {workflow.name || 'Unnamed Workflow'}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" component="span">
                        {workflow.description || 'No description'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        Updated {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default WorkflowList;