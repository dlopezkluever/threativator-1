import { cn } from '@/lib/utils';

interface TestCardProps {
  title: string;
  status: 'success' | 'error' | 'pending';
  children: React.ReactNode;
}

export function TestCard({ title, status, children }: TestCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 shadow-sm transition-all duration-200 hover:shadow-md',
        {
          'border-green-200 bg-green-50': status === 'success',
          'border-red-200 bg-red-50': status === 'error',
          'border-yellow-200 bg-yellow-50': status === 'pending',
        }
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn('w-3 h-3 rounded-full', {
            'bg-green-500': status === 'success',
            'bg-red-500': status === 'error',
            'bg-yellow-500': status === 'pending',
          })}
        />
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="text-sm text-gray-600">{children}</div>
    </div>
  );
}
