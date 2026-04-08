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
    // Simulate API fetch
    const timer = setTimeout(() => {
      setData({
        totalPlots: 12,
        totalCrops: 4,
        totalArea: 2.5,
        totalPlants: '1,240',
        performancePct: 78,
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
    // Simulate API fetch
    const timer = setTimeout(() => {
      setData([
        { label: 'Nitrogen (N)', value: '142 ppm', maxPpm: 200, pct: 71 },
        { label: 'Phosphorus (P)', value: '28 ppm', maxPpm: 50, pct: 56 },
        { label: 'Potassium (K)', value: '115 ppm', maxPpm: 150, pct: 76 },
      ]);
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
    // Simulate API fetch
    const timer = setTimeout(() => {
      setData({
        completed: 42,
        pending: 8,
      });
      setIsPending(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return { data, isPending };
}
