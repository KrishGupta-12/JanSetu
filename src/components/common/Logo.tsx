import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

export default function Logo() {
  const context = useSidebar();
  // If the logo is used outside a sidebar, context will be null.
  const inSidebar = !!context;

  return (
    <div className="flex items-center gap-2">
      <Leaf className="h-6 w-6 text-primary" />
      <span className={cn(
        "font-bold text-lg font-headline",
        inSidebar ? "text-sidebar-foreground" : "text-foreground"
      )}>
        JanSetu
      </span>
    </div>
  );
}
