import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as RunIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { CodeSnippet } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SnippetCardProps {
  snippet: CodeSnippet;
  onEdit?: (snippet: CodeSnippet) => void;
  onDelete?: (snippetId: string) => void;
  onCopy?: (snippet: CodeSnippet) => void;
  onOpen?: (snippet: CodeSnippet) => void;
}

const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
  onEdit,
  onDelete,
  onCopy,
  onOpen
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(snippet);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(snippet.id);
    }
    setDeleteDialogOpen(false);
  };

  const handleCopyClick = () => {
    if (onCopy) {
      onCopy(snippet);
    } else {
      navigator.clipboard.writeText(snippet.code);
    }
    handleMenuClose();
  };

  const handleOpenClick = () => {
    if (onOpen) {
      onOpen(snippet);
    }
    handleMenuClose();
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  // Get correct language identifier for syntax highlighting
  const getLanguageIdentifier = (language: string) => {
    const languageMap: Record<string, string> = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'csharp': 'csharp',
      'c#': 'csharp',
      'c++': 'cpp',
      'cpp': 'cpp',
      'go': 'go',
      'golang': 'go',
      'php': 'php',
      'ruby': 'ruby',
      'rust': 'rust',
      'swift': 'swift',
      'kotlin': 'kotlin',
      'html': 'html',
      'css': 'css',
      'sql': 'sql',
    };

    return languageMap[language.toLowerCase()] || 'text';
  };

  // Truncate code for preview
  const getPreviewCode = (code: string) => {
    const lines = code.split('\n');
    if (lines.length > 5 && !expanded) {
      return lines.slice(0, 5).join('\n') + '\n...';
    }
    return code;
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {snippet.description || 'Untitled Snippet'}
          </Typography>
          <IconButton
            aria-label="settings"
            size="small"
            onClick={handleMenuOpen}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleOpenClick}>
              <CodeIcon fontSize="small" sx={{ mr: 1 }} />
              Open in Editor
            </MenuItem>
            <MenuItem onClick={handleCopyClick}>
              <CopyIcon fontSize="small" sx={{ mr: 1 }} />
              Copy to Clipboard
            </MenuItem>
            <MenuItem onClick={handleEditClick}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleDeleteClick}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ mb: 2 }}>
          <SyntaxHighlighter
            language={getLanguageIdentifier(snippet.language)}
            style={vscDarkPlus}
            customStyle={{ margin: 0, maxHeight: expanded ? '500px' : '180px' }}
          >
            {getPreviewCode(snippet.code)}
          </SyntaxHighlighter>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Chip
              label={snippet.language}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            {snippet.tags && snippet.tags.length > 0 && snippet.tags.slice(0, 2).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{ mr: 1 }}
              />
            ))}
            {snippet.tags && snippet.tags.length > 2 && (
              <Chip
                label={`+${snippet.tags.length - 2}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pt: 0 }}>
        <Button
          size="small"
          onClick={handleToggleExpand}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </Button>
        <Box>
          <Tooltip title="Copy to clipboard">
            <IconButton
              size="small"
              onClick={handleCopyClick}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open in editor">
            <IconButton
              size="small"
              onClick={handleOpenClick}
              color="primary"
            >
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Code Snippet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this code snippet? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SnippetCard;