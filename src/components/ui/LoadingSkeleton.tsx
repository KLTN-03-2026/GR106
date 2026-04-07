import React from 'react';
import { Wheat, Milk, Egg, Beef } from 'lucide-react';

/**
 * Loading skeleton với chủ đề farm
 * Dùng khi đang load data trong table/list
 */
export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="space-y-4 p-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="flex items-center space-x-4">
            {/* Icon placeholder */}
            <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
              {i % 4 === 0 && <Wheat className="h-6 w-6 text-gray-400" />}
              {i % 4 === 1 && <Milk className="h-6 w-6 text-gray-400" />}
              {i % 4 === 2 && <Egg className="h-6 w-6 text-gray-400" />}
              {i % 4 === 3 && <Beef className="h-6 w-6 text-gray-400" />}
            </div>
            
            {/* Content placeholder */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Card skeleton
 */
export const LoadingCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
};
