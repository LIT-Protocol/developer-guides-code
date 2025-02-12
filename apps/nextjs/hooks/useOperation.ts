import { useState } from 'react';
import type { OperationState } from '../types/operation';

export function useOperation() {
  const [state, setState] = useState<OperationState>({
    loading: false,
    success: false,
    error: null,
  });

  const executeOperation = async (handler: () => Promise<any>) => {
    try {
      setState({ loading: true, success: false, error: null });
      const result = await handler();
      
      // Check if the result indicates an error
      if (result?.error) {
        setState({
          loading: false,
          success: false,
          error: result.error instanceof Error ? result.error.message : result.error,
        });
        return;
      }

      // If there's no result at all, consider it an error
      if (!result) {
        setState({
          loading: false,
          success: false,
          error: 'Operation returned no result',
        });
        return;
      }

      console.log('Operation result:', result);
      setState({ loading: false, success: true, error: null });
    } catch (err) {
      console.error('Operation error:', err);
      setState({
        loading: false,
        success: false,
        error: err instanceof Error ? err.message : 'Operation failed',
      });
    }
  };

  return { state, executeOperation };
}