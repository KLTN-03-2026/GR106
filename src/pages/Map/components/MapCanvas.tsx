import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function MapCanvas({ children }: Props) {
  return (
    <div className="flex-1 w-full rounded-2xl border border-gray-100 overflow-hidden relative shadow-inner m-4 mt-2">
      {children}
    </div>
  );
}
