import React, { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Typography,
  Box,
  Divider,
  Skeleton,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import {
  getUserConversations,
  createConversation,
  setCurrentConversation,
  updateConversation
} from '@/store/slices/conversationSlice';
import { Conversation } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ConversationListProps {
  onSelectConversation?: (conversation: Conversation) => void;
  selectedId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedId
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { conversations, isLoading } = useSelector((state: RootState) => state.conversation);

  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(getUserConversations(currentUser.id));
    }
  }, [dispatch, currentUser]);

  const handleCreateNewConversation = () => {
    if (currentUser?.id) {
      dispatch(createConversation({
        user_id: currentUser.id,
        title: 'New Conversation'
      }));
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch(setCurrentConversation(conversation));

    navigate(`/chat/${conversation.id}`);

    if (onSelectConversation) {
      onSelectConversation(conversation);
    }
  };

  const handleEditClick = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditMode(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleEditSave = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      dispatch(updateConversation({
        id: conversationId,
        data: { title: editTitle.trim() }
      }));
    }
    setEditMode(null);
  };

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditMode(null);
  };

  const handleDeleteClick = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    // Note: We'd need to add functionality to delete conversations
    // This would require adding this to the backend API and Redux
    setDeleteConfirmOpen(false);
    setConversationToDelete(null);
  };

  const filteredConversations = searchTerm
    ? conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : conversations;

  // Sort conversations by most recent first (would need updatedAt from backend)
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    // This assumes there's an updated_at field, we'd need to add that to the types
    // For now, just use ID as a simple proxy (higher ID = more recent)
    return b.id.localeCompare(a.id);
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6" gutterBottom>
          Conversations
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNewConversation}
        >
          New Conversation
        </Button>
      </Box>

      <Divider />

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {isLoading ? (
          <List>
            {[1, 2, 3].map((item) => (
              <ListItem key={item} disablePadding>
                <Box sx={{ p: 2, width: '100%' }}>
                  <Skeleton variant="text" width="80%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              </ListItem>
            ))}
          </List>
        ) : sortedConversations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </Typography>
          </Box>
        ) : (
          <List>
            {sortedConversations.map((conversation) => (
              <ListItem
                key={conversation.id}
                disablePadding
                secondaryAction={
                  editMode === conversation.id ? (
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Save">
                        <IconButton
                          edge="end"
                          onClick={(e) => handleEditSave(conversation.id, e)}
                        >
                          <CheckCircleIcon color="success" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton
                          edge="end"
                          onClick={handleEditCancel}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Edit">
                        <IconButton
                          edge="end"
                          onClick={(e) => handleEditClick(conversation, e)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          edge="end"
                          onClick={(e) => handleDeleteClick(conversation.id, e)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )
                }
              >
                <ListItemButton
                  selected={selectedId === conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  {editMode === conversation.id ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <ListItemText
                      primary={conversation.title}
                      secondary={`Created ${formatDistanceToNow(new Date(), { addSuffix: true })}`}
                      primaryTypographyProps={{
                        noWrap: true,
                        style: { fontWeight: selectedId === conversation.id ? 600 : 400 }
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Conversation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this conversation? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConversationList;