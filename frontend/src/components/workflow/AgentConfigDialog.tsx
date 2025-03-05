// src/components/workflow/AgentConfigDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress
} from '@mui/material';
import { WorkflowNode } from '@/api/workflowService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`agent-config-tabpanel-${index}`}
      aria-labelledby={`agent-config-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface AgentConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (nodeId: string, config: any) => void;
  node: WorkflowNode | null;
  agentDetails: any;
  isLoading: boolean;
}

const AgentConfigDialog: React.FC<AgentConfigDialogProps> = ({
  open,
  onClose,
  onSave,
  node,
  agentDetails,
  isLoading
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [config, setConfig] = useState<any>({
    prompt: '',
    parameters: {},
  });

  // Reset form khi node thay đổi
  useEffect(() => {
    if (node && open) {
      setConfig({
        prompt: node.config?.prompt || '',
        parameters: node.config?.parameters || {}
      });
    }
  }, [node, open]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({
      ...config,
      prompt: e.target.value
    });
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setConfig({
      ...config,
      parameters: {
        ...config.parameters,
        [paramName]: value
      }
    });
  };

  const handleSave = () => {
    if (node) {
      onSave(node.id, config);
    }
  };

  if (!node) return null;

  // Thông tin về agent từ agentDetails
  const agent = agentDetails[node.node_type] || {
    name: node.name,
    description: 'Unknown agent',
    inputs: [],
    outputs: []
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Cấu hình Agent: {node.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Prompt" />
            <Tab label="Tham số" />
            <Tab label="Thông tin" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Tùy chỉnh prompt cho agent này. Sử dụng các biến như {"{input}"}, {"{parameters}"} để tương tác với dữ liệu vào.
          </Typography>
          <TextField
            multiline
            rows={12}
            fullWidth
            variant="outlined"
            value={config.prompt}
            onChange={handlePromptChange}
            placeholder={`Bạn là một ${agent.name}. Nhiệm vụ của bạn là ${agent.description}.\n\nInput: {input}\n\nVui lòng xử lý dữ liệu đầu vào và trả về kết quả phù hợp.`}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Cài đặt tham số cho agent này.
          </Typography>

          <Box sx={{ my: 2 }}>
            {agent.inputs.map((input: string) => (
              <TextField
                key={input}
                fullWidth
                margin="normal"
                label={`${input}`}
                value={config.parameters[input] || ''}
                onChange={(e) => handleParameterChange(input, e.target.value)}
              />
            ))}

            {agent.inputs.length === 0 && (
              <Typography color="text.secondary">
                Agent này không có tham số nào để cấu hình.
              </Typography>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1">{agent.name}</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {agent.description}
            </Typography>

            <Typography variant="subtitle2" sx={{ mt: 2 }}>Inputs</Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              {agent.inputs.map((input: string) => (
                <Typography component="li" key={input} variant="body2">
                  {input}
                </Typography>
              ))}
            </Box>

            <Typography variant="subtitle2" sx={{ mt: 2 }}>Outputs</Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              {agent.outputs.map((output: string) => (
                <Typography component="li" key={output} variant="body2">
                  {output}
                </Typography>
              ))}
            </Box>
          </Paper>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Lưu cấu hình'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgentConfigDialog;