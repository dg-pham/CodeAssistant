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
import { GitMergeSession } from '@/api/gitMergeService';
import { formatDistanceToNow } from 'date-fns';

interface SessionsListProps {
  sessions: GitMergeSession[];
  onSelectSession: (session: GitMergeSession) => void;
  onDeleteSession: (sessionId: string) => void;
  selectedSessionId?: string;
}

const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  onSelectSession,
  onDeleteSession,
  selectedSessionId
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'analyzing_conflicts': return 'info';
      case 'ready_for_resolution': return 'warning';
      case 'ready_for_merge': return 'success';
      case 'merging': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'analyzing_conflicts': return 'Analyzing Conflicts';
      case 'ready_for_resolution': return 'Ready for Resolution';
      case 'ready_for_merge': return 'Ready for Merge';
      case 'merging': return 'Merging';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  if (sessions.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No merge sessions found</Typography>
      </Box>
    );
  }

  return (
    <Paper variant="outlined">
      <List sx={{ width: '100%' }}>
        {sessions.map((session) => (
          <React.Fragment key={session.id}>
            <ListItem
              secondaryAction={
                <IconButton edge="end" onClick={() => onDeleteSession(session.id)}>
                  <DeleteIcon />
                </IconButton>
              }
              disablePadding
            >
              <ListItemButton
                selected={selectedSessionId === session.id}
                onClick={() => onSelectSession(session)}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ mr: 1 }}>
                        {session.base_branch} ← {session.target_branch}
                      </Typography>
                      <Chip
                        label={getStatusText(session.status)}
                        color={getStatusColor(session.status) as any}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {session.repository_url}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        Created {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
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

export default SessionsList;