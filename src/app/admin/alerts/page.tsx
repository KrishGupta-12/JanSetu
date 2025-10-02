
'use client';
import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Megaphone, Info, TriangleAlert, Siren } from 'lucide-react';
import { Alert as AlertType, AlertLevel } from '@/lib/types';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query, orderBy } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const alertLevelOptions: AlertLevel[] = ['Info', 'Warning', 'Critical'];

const levelStyles: Record<AlertLevel, string> = {
  Info: 'bg-blue-100 text-blue-800 border-blue-300',
  Warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Critical: 'bg-red-100 text-red-800 border-red-300',
};

const levelIcons: Record<AlertLevel, React.ReactNode> = {
  Info: <Info className="h-4 w-4" />,
  Warning: <TriangleAlert className="h-4 w-4" />,
  Critical: <Siren className="h-4 w-4" />,
};


function AlertSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function AdminAlertsPage() {
  const { user: adminUser, isLoading: isUserLoading, firestore } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<AlertLevel>('Info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const alertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'alerts'), orderBy('publishDate', 'desc'));
  }, [firestore]);
  const { data: alerts, isLoading: areAlertsLoading } = useCollection<AlertType>(alertsQuery);

  const handleSubmit = async () => {
    if (!adminUser || !firestore) return;
    if (!title || !description) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill out all fields.',
      });
      return;
    }

    setIsSubmitting(true);
    const alertsCollection = collection(firestore, 'alerts');
    const newAlert = {
      title,
      description,
      level,
      publishDate: new Date().toISOString(),
      adminId: adminUser.uid,
      adminName: adminUser.name,
    };
    
    addDocumentNonBlocking(alertsCollection, newAlert);

    toast({
      title: 'Alert Published',
      description: 'The new alert has been sent to all users.',
    });

    // Reset form
    setTitle('');
    setDescription('');
    setLevel('Info');
    setIsSubmitting(false);
  };
  
  const isLoading = isUserLoading || areAlertsLoading;

  if (isLoading || !adminUser) {
      return <AlertSkeleton />;
  }


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Publish New Alert</CardTitle>
            <CardDescription>
              Create and send a new platform-wide alert.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alert-title">Title</Label>
              <Input id="alert-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Water Supply Disruption" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert-description">Description</Label>
              <Textarea id="alert-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details about the alert..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert-level">Severity Level</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as AlertLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {alertLevelOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Megaphone className="mr-2 h-4 w-4" />
              )}
              Publish Alert
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Published Alerts</CardTitle>
            <CardDescription>
              A history of all alerts sent on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Published</TableHead>
                            <TableHead>Author</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {alerts?.map(alert => (
                            <TableRow key={alert.id}>
                                <TableCell className="font-medium">{alert.title}</TableCell>
                                <TableCell>
                                    <Badge className={cn('font-semibold gap-1 pl-1.5', levelStyles[alert.level])}>
                                        {levelIcons[alert.level]}
                                        {alert.level}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {formatDistanceToNow(new Date(alert.publishDate), { addSuffix: true })}
                                </TableCell>
                                <TableCell>{alert.adminName}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
