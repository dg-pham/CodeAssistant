import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format a date string to a readable format
 * @param dateString ISO date string
 * @returns Formatted date string (e.g., "Jan 1, 2023")
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a date string to a time string
 * @param dateString ISO date string
 * @returns Formatted time string (e.g., "3:45 PM")
 */
export const formatTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return dateString;
  }
};

/**
 * Format a date string to a relative time (e.g., "5 minutes ago")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return dateString;
  }
};

/**
 * Format a date string to a datetime format
 * @param dateString ISO date string
 * @returns Formatted datetime string (e.g., "Jan 1, 2023, 3:45 PM")
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy, h:mm a');
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateString;
  }
};

/**
 * Extract code blocks from markdown text
 * @param markdown Markdown text containing code blocks
 * @returns Array of code blocks with language and code
 */
export const extractCodeBlocks = (markdown: string): { language: string; code: string }[] => {
  const regex = /```([\w-]*)\n([\s\S]*?)```/g;
  const matches = [];
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    matches.push({
      language: match[1] || 'text',
      code: match[2].trim()
    });
  }

  return matches;
};

/**
 * Format token count with appropriate units
 * @param count Number of tokens
 * @returns Formatted token count (e.g., "1.2K tokens")
 */
export const formatTokenCount = (count: number): string => {
  if (count < 1000) {
    return `${count} tokens`;
  } else if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K tokens`;
  } else {
    return `${(count / 1000000).toFixed(1)}M tokens`;
  }
};

/**
 * Format file size with appropriate units
 * @param bytes Size in bytes
 * @returns Formatted file size (e.g., "1.2 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
};