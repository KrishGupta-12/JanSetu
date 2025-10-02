import { Leaf } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Leaf className="h-6 w-6 text-primary" />
      <span className="font-bold text-lg font-headline text-foreground">
        JanSetu
      </span>
    </div>
  );
}
