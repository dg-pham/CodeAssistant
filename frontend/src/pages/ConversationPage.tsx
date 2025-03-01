import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import { Card, Input, Button, Badge, Modal } from '../components/common';
import { useConversationStore, useUserStore } from '../store';
import { useToast } from '../components/common/Toast';
import { ConversationResponse, MessageResponse } from '../types';
import { formatDistanceToNow } from 'date-fns';

// Message Bubble Component
interface MessageBubbleProps {
  message: MessageResponse;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-primary-100 text-primary-900'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="flex items-center mb-1">
          <div
            className={`font-medium ${
              isUser ? 'text-primary-700' : 'text-gray-700'
            }`}
          >
            {isUser ? 'You' : 'CodeAgent'}
          </div>
          <div className="text-xs text-gray-500 ml-2">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
};

export const ConversationsPage: React.FC = () => {
  const { currentUser } = useUserStore();
  const {
    conversations,
    currentConversation,
    currentMessages,
    getUserConversations,
    getConversationWithMessages,
    updateConversation,
    isLoading,
    error,
    setCurrentConversation,
  } = useConversationStore();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      if (currentUser) {
        try {
          await getUserConversations();
        } catch (error) {
          console.error('Failed to fetch conversations:', error);
          showToast({
            type: 'error',
            message: 'Failed to fetch your conversations',
          });
        }
      }
    };

    fetchConversations();
  }, [currentUser, getUserConversations, showToast]);

  const handleSelectConversation = async (conversation: ConversationResponse) => {
    try {
      setCurrentConversation(conversation);
      await getConversationWithMessages(conversation.id);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      showToast({
        type: 'error',
        message: 'Failed to load conversation messages',
      });
    }
  };

  const handleRenameConversation = async () => {
    if (currentConversation && newTitle.trim()) {
      try {
        await updateConversation(currentConversation.id, { title: newTitle.trim() });
        showToast({
          type: 'success',
          message: 'Conversation renamed successfully',
        });
        setIsRenameModalOpen(false);
      } catch (error) {
        console.error('Failed to rename conversation:', error);
        showToast({
          type: 'error',
          message: 'Failed to rename conversation',
        });
      }
    }
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    return conversation.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Conversations</h1>
            <p className="mt-2 text-lg text-gray-600">
              Browse and review your past conversations with CodeAgent
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <div className="mb-4">
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                />
              </div>

              <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    {searchQuery
                      ? 'No conversations match your search'
                      : 'No conversations yet. Start coding to create some!'}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${
                        currentConversation?.id === conversation.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.title}
                      </h3>
                      <div className="mt-1 text-xs text-gray-500">
                        {conversation.updated_at &&
                          `Updated ${formatDistanceToNow(new Date(conversation.updated_at))} ago`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Conversation Detail */}
          <div className="lg:col-span-2">
            {currentConversation ? (
              <Card>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentConversation.title}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewTitle(currentConversation.title || '');
                      setIsRenameModalOpen(true);
                    }}
                  >
                    Rename
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b">
                    <h3 className="font-medium">Conversation History</h3>
                  </div>

                  <div className="p-4 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {isLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                      </div>
                    ) : currentMessages.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No messages in this conversation yet.
                      </div>
                    ) : (
                      currentMessages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))
                    )}
                  </div>
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
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    Select a conversation
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Click on a conversation from the list to view its messages.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rename Conversation Modal */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title="Rename Conversation"
        footer={
          <div className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsRenameModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRenameConversation}
              disabled={!newTitle.trim()}
            >
              Rename
            </Button>
          </div>
        }
      >
        <Input
          label="New Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter a new title for this conversation"
          fullWidth
        />
      </Modal>
    </MainLayout>
  );
};