import { AlertTriangle } from 'lucide-react';

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-sm text-critical">
      <AlertTriangle size={16} />
      <span>{message}</span>
    </div>
  );
}
