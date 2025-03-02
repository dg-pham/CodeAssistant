import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import {
  getUserCodeSnippets,
  searchCodeSnippets,
  deleteCodeSnippet,
  saveCodeSnippet,
  setCurrentCode,
  setLanguage
} from '@/store/slices/codeSlice';
import SnippetCard from './SnippetCard';
import SnippetForm from './SnippetForm';
import { CodeSnippet, CodeSnippetCreate } from '@/types';

const languageOptions = [
  { value: '', label: 'All Languages' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'php', label: 'PHP' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
];

interface SnippetListProps {
  onOpenInEditor?: (snippet: CodeSnippet) => void;
}

const SnippetList: React.FC<SnippetListProps> = ({ onOpenInEditor }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { snippets, isProcessing, error } = useSelector((state: RootState) => state.code);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | undefined>(undefined);
  const [page, setPage] = useState(1);
  const snippetsPerPage = 6;

  const handleSearch = () => {
    if (!currentUser) return;

    if (searchTerm.trim()) {
      dispatch(searchCodeSnippets({ userId: currentUser.id, query: searchTerm }));
    } else {
      dispatch(getUserCodeSnippets({ userId: currentUser.id, language: selectedLanguage }));
    }
  };

  const handleLanguageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const language = event.target.value as string;
    setSelectedLanguage(language);

    if (currentUser) {
      dispatch(getUserCodeSnippets({ userId: currentUser.id, language }));
    }
  };

  const handleAddSnippet = () => {
    setEditingSnippet(undefined);
    setFormOpen(true);
  };

  const handleEditSnippet = (snippet: CodeSnippet) => {
    setEditingSnippet(snippet);
    setFormOpen(true);
  };

  const handleDeleteSnippet = (snippetId: string) => {
    dispatch(deleteCodeSnippet(snippetId));
  };

  const handleSaveSnippet = (snippetData: CodeSnippetCreate) => {
    dispatch(saveCodeSnippet(snippetData));
  };

  const handleCopySnippet = (snippet: CodeSnippet) => {
    navigator.clipboard.writeText(snippet.code);
  };

  const handleOpenInEditor = (snippet: CodeSnippet) => {
    dispatch(setCurrentCode(snippet.code));
    dispatch(setLanguage(snippet.language));

    if (onOpenInEditor) {
      onOpenInEditor(snippet);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  // Calculate pagination
  const pageCount = Math.ceil(snippets.length / snippetsPerPage);
  const displayedSnippets = snippets.slice(
    (page - 1) * snippetsPerPage,
    page * snippetsPerPage
  );

  return (
    <Box>
      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search code snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="language-filter-label">Language</InputLabel>
              <Select
                labelId="language-filter-label"
                value={selectedLanguage}
                label="Language"
                onChange={handleLanguageChange as any}
              >
                {languageOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4} textAlign="right">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSnippet}
            >
              Add Snippet
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Snippets Grid */}
      {isProcessing ? (
        <Typography>Loading snippets...</Typography>
      ) : displayedSnippets.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No code snippets found
          </Typography>
          <Typography color="text.secondary">
            {searchTerm || selectedLanguage
              ? 'Try changing your search or filter'
              : 'Create your first code snippet by clicking the "Add Snippet" button'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {displayedSnippets.map((snippet) => (
            <Grid item xs={12} sm={6} md={6} lg={4} key={snippet.id}>
              <SnippetCard
                snippet={snippet}
                onEdit={handleEditSnippet}
                onDelete={handleDeleteSnippet}
                onCopy={handleCopySnippet}
                onOpen={handleOpenInEditor}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Add/Edit Form Dialog */}
      {currentUser && (
        <SnippetForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSaveSnippet}
          initialData={editingSnippet}
          userId={currentUser.id}
        />
      )}
    </Box>
  );
};

export default SnippetList;