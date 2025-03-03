import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemButton,
  Chip,
  Typography,
  Box,
  Paper,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { AgentOrchestrationTask } from '@/api/orchestrationService';
import { formatDistanceToNow } from 'date-fns';

interface TasksListProps {
  tasks: AgentOrchestrationTask[];
  onSelectTask: (task: AgentOrchestrationTask) => void;
  onDeleteTask: (taskId: string) => void;
  selectedTaskId?: string;
}

const TasksList: React.FC<TasksListProps> = ({
  tasks,
  onSelectTask,
  onDeleteTask,
  selectedTaskId
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'aborted': return 'error';
      default: return 'default';
    }
  };

  if (tasks.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No orchestration tasks found</Typography>
      </Box>
    );
  }

  return (
    <Paper variant="outlined">
      <List sx={{ width: '100%' }}>
        {tasks.map((task) => (
          <React.Fragment key={task.id}>
            <ListItem
              secondaryAction={
                <IconButton edge="end" onClick={() => onDeleteTask(task.id)}>
                  <DeleteIcon />
                </IconButton>
              }
              disablePadding
            >
              <ListItemButton
                selected={selectedTaskId === task.id}
                onClick={() => onSelectTask(task)}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ mr: 1 }}>
                        {task.task_type}
                      </Typography>
                      <Chip
                        label={task.status}
                        color={getStatusColor(task.status) as any}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        Agent: {task.current_agent_index + 1} of {task.agent_chain.length}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                      </Typography>
                    </>
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

export default TasksList;