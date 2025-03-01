import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import { Card, Input, Button, Badge, Select, SelectOption, Modal } from '../components/common';
import { CodeBlock } from '../components/code';
import { useCodeStore, useUserStore } from '../store';
import { useToast } from '../components/common/Toast';
import { CodeSnippetResponse, PROGRAMMING_LANGUAGES } from '../types';

export const SnippetsPage: React.FC = () => {
  const { currentUser } = useUserStore();
  const { snippets, getUserSnippets, deleteSnippet, isLoading, error } = useCodeStore();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('');
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippetResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnippets = async () => {
      if (currentUser) {
        try {
          await getUserSnippets();
        } catch (error) {
          console.error('Failed to fetch snippets:', error);
          showToast({
            type: 'error',
            message: 'Failed to fetch your code snippets',
          });
        }
      }
    };

    fetchSnippets();
  }, [currentUser, getUserSnippets, showToast]);

  const handleDelete = async () => {
    if (snippetToDelete) {
      try {
        await deleteSnippet(snippetToDelete);
        showToast({
          type: 'success',
          message: 'Snippet deleted successfully',
        });
        // Reset state
        setIsDeleteModalOpen(false);
        setSnippetToDelete(null);

        // If the deleted snippet was the selected one, close the detail view
        if (selectedSnippet && selectedSnippet.id === snippetToDelete) {
          setSelectedSnippet(null);
        }
      } catch (error) {
        console.error('Failed to delete snippet:', error);
        showToast({
          type: 'error',
          message: 'Failed to delete snippet. Please try again.',
        });
      }
    }
  };

  // Filter snippets based on search query and language filter
  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch = searchQuery
      ? snippet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.code.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesLanguage = filterLanguage
      ? snippet.language === filterLanguage
      : true;

    return matchesSearch && matchesLanguage;
  });

  // Create language filter options
  const languageOptions: SelectOption[] = [
    { value: '', label: 'All Languages' },
    ...PROGRAMMING_LANGUAGES,
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Code Snippets</h1>
            <p className="mt-2 text-lg text-gray-600">
              Browse, view, and manage your saved code snippets
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Snippets List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <div className="mb-4 flex space-x-2">
                <Input
                  placeholder="Search snippets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                />
              </div>

              <div className="mb-4">
                <Select
                  options={languageOptions}
                  value={filterLanguage}
                  onChange={setFilterLanguage}
                  label="Filter by Language"
                  fullWidth
                />
              </div>

              <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : filteredSnippets.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    {searchQuery || filterLanguage
                      ? 'No snippets match your filters'
                      : 'No saved snippets yet. Create some in the Code Assistant!'}
                  </div>
                ) : (
                  filteredSnippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${
                        selectedSnippet?.id === snippet.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedSnippet(snippet)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 truncate">
                            {snippet.description || 'Unnamed Snippet'}
                          </h3>
                          <div className="mt-1 flex items-center">
                            <Badge variant="secondary" size="sm">
                              {snippet.language}
                            </Badge>
                            <span className="ml-2 text-xs text-gray-500">
                              {new Date(snippet.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSnippetToDelete(snippet.id);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Snippet Detail */}
          <div className="lg:col-span-2">
            {selectedSnippet ? (
              <Card>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedSnippet.description || 'Unnamed Snippet'}
                  </h2>
                  <div className="mt-2 flex items-center space-x-4">
                    <Badge variant="primary">{selectedSnippet.language}</Badge>
                    <span className="text-sm text-gray-500">
                      Created: {new Date(selectedSnippet.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <CodeBlock
                    code={selectedSnippet.code}
                    language={selectedSnippet.language}
                    showLineNumbers
                  />
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSnippet(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg p-8 text-center">
                <div>
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Select a snippet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Click on a snippet from the list to view its details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Snippet"
        footer={
          <div className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to delete this snippet? This action cannot be undone.
        </p>
      </Modal>
    </MainLayout>
  );
};