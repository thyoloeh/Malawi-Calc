export type CalculationType = 
  | 'standard' 
  | 'scientific' 
  | 'fraction' 
  | 'equation' 
  | 'statistics' 
  | 'conversion';

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: CalculationType;
  expression: string;
  result: string;
  details?: string;
  metadata?: Record<string, any>;
}
