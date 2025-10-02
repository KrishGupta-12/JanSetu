import ReportForm from '@/components/report/ReportForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Report an Issue</CardTitle>
          <CardDescription>
            Help improve our community by reporting issues. Please provide as much detail as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportForm />
        </CardContent>
      </Card>
    </div>
  );
}
