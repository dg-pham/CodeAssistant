import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Grid
} from '@mui/material';
import { GitMergeSession, GitMergeConflict } from '@/api/gitMergeService';
import { formatDistanceToNow } from 'date-fns';

interface SessionStatusCardProps {
  session: GitMergeSession;
  conflicts: GitMergeConflict[];
  onCompleteMerge: () => void;
  isLoading: boolean;
}

const SessionStatusCard: React.FC<SessionStatusCardProps> = ({
  session,
  conflicts,
  onCompleteMerge,
  isLoading
}) => {
  const totalConflicts = conflicts.length;
  const resolvedConflicts = conflicts.filter(c => c.is_resolved).length;
  const progress = totalConflicts > 0 ? (resolvedConflicts / totalConflicts) * 100 : 0;

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

  const canCompleteMerge = session.status === 'ready_for_merge';

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Merge Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={getStatusText(session.status)}
                color={getStatusColor(session.status) as any}
                sx={{ mr: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Updated {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">
                Repository: {session.repository_url}
              </Typography>
              <Typography variant="body2">
                Merging from <strong>{session.target_branch}</strong> into <strong>{session.base_branch}</strong>
              </Typography>
            </Box>

            {session.merge_result && (
              <Box sx={{ mt: 2,
                  p: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  overflow: 'auto',
                  maxWidth: '100%'
               }}>
                <Typography
                    variant="body2"
                    sx={{
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'break-word'
                      }}
                >
                  <strong>Result:</strong> {session.merge_result}
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Conflicts Progress
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {resolvedConflicts} of {totalConflicts} conflicts resolved
                </Typography>
                <Typography variant="body2">
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>

            {canCompleteMerge && (
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={onCompleteMerge}
                disabled={isLoading}
              >
                Complete Merge
              </Button>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SessionStatusCard;