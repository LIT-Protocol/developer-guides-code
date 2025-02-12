export type OperationState = {
  loading: boolean;
  success: boolean;
  error: string | null;
};

export type OperationResult = {
  success?: boolean;
  error?: Error | string;
  data?: any;
} | null;

export type Operation = {
  id: string;
  name: string;
  handler: () => any;
};