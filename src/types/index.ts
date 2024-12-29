export interface ChatRequest {
  message: string;
  context: Record<string, any>;
}

export interface ChatResponse {
  response: string;
  metadata: {
    processed_at: string;
    [key: string]: any;
  };
} 