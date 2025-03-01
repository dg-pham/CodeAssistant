import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  timeout?: number;
}

/**
 * A hook that provides clipboard functionality
 *
 * @param options Configuration options
 * @returns Object with copied state and copy function
 */
export function useClipboard(options: UseClipboardOptions = {}) {
  const { timeout = 2000 } = options;
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setHasCopied(true);

        // Reset state after timeout
        setTimeout(() => {
          setHasCopied(false);
        }, timeout);

        return true;
      } catch (error) {
        console.error('Failed to copy text: ', error);
        setHasCopied(false);
        return false;
      }
    },
    [timeout]
  );

  return { hasCopied, onCopy };
}