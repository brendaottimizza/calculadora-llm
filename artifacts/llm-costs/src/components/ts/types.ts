import type { Model } from '@/lib/models';

export interface Row {
  model: Model;
  inputCost: number;
  outputCost: number;
  total: number;
}
