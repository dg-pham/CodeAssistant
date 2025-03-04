import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Merge as GitIcon,
  Tune as GeneralIcon,
  Add as AddIcon,
  Save as SaveIcon,
  PlayArrow as RunIcon
} from '@mui/icons-material';

interface Agent {
  name: string;
  description: string;
  category: string;
  inputs: string[];
  outputs: string[];
}

interface ControlPanelProps {
  agents: Record<string, Agent>;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => void;
  onSaveWorkflow: () => void;
  onRunWorkflow: () => void;
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  agents,
  onDragStart,
  onSaveWorkflow,
  onRunWorkflow,
  workflowName,
  onWorkflowNameChange
}) => {
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [tempWorkflowName, setTempWorkflowName] = useState(workflowName);

  // Group agents by category
  const groupedAgents: Record<string, Record<string, Agent>> = {};

  Object.entries(agents).forEach(([key, agent]) => {
    if (!groupedAgents[agent.category]) {
      groupedAgents[agent.category] = {};
    }
    groupedAgents[agent.category][key] = agent;
  });

  const handleOpenNameDialog = () => {
    setTempWorkflowName(workflowName);
    setNameDialogOpen(true);
  };

  const handleSaveWorkflowName = () => {
    onWorkflowNameChange(tempWorkflowName);
    setNameDialogOpen(false);
  };

  // Get icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'code':
        return <CodeIcon />;
      case 'git':
        return <GitIcon />;
      case 'general':
        return <GeneralIcon />;
      default:
        return <GeneralIcon />;
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 300,
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {workflowName || 'Unnamed Workflow'}
          </Typography>
          <Button size="small" onClick={handleOpenNameDialog}>
            Edit
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSaveWorkflow}
            fullWidth
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<RunIcon />}
            onClick={onRunWorkflow}
            fullWidth
          >
            Run
          </Button>
        </Box>
      </Box>

      {/* Agents section */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Available Agents
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Drag and drop agents onto the canvas to build your workflow.
        </Typography>

        {Object.entries(groupedAgents).map(([category, categoryAgents]) => (
          <Accordion key={category} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getCategoryIcon(category)}
                <Typography sx={{ ml: 1, textTransform: 'capitalize' }}>
                  {category} Agents
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense>
                {Object.entries(categoryAgents).map(([nodeType, agent]) => (
                  <ListItem
                    key={nodeType}
                    button
                    draggable
                    onDragStart={(event) => onDragStart(event, nodeType)}
                    sx={{
                      cursor: 'grab',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getCategoryIcon(category)}
                    </ListItemIcon>
                    <ListItemText
                      primary={agent.name}
                      secondary={agent.description}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Workflow rename dialog */}
      <Dialog open={nameDialogOpen} onClose={() => setNameDialogOpen(false)}>
        <DialogTitle>Rename Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workflow Name"
            fullWidth
            value={tempWorkflowName}
            onChange={(e) => setTempWorkflowName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNameDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveWorkflowName} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ControlPanel;