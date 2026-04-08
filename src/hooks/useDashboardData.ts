import { useState, useEffect } from 'react';

// Types and Mocks
export interface FarmStats {
  totalPlots: number;
  totalCrops: number;
  totalArea: number;
  totalPlants: string | number;
  performancePct: number;
}

export interface NpkMetric {
  label: string;
  value: string;
  maxPpm: number;
  pct: number;
}

export interface TasksSummary {
  completed: number;
  pending: number;
}

export function useFarmStats() {
  const [data, setData] = useState<FarmStats | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    // Will be replaced by real API call
    const timer = setTimeout(() => {
      setData({
        totalPlots: 0,
        totalCrops: 0,
        totalArea: 0,
        totalPlants: 0,
        performancePct: 0,
      });
      setIsPending(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return { data, isPending };
}

export function useNpkData() {
  const [data, setData] = useState<NpkMetric[]>([]);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    // Will be replaced by real API call
    const timer = setTimeout(() => {
      setData([]);
      setIsPending(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return { data, isPending };
}

export function useTasksSummary() {
  const [data, setData] = useState<TasksSummary | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    // Will be replaced by real API call
    const timer = setTimeout(() => {
      setData({
        completed: 0,
        pending: 0,
      });
      setIsPending(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return { data, isPending };
}
