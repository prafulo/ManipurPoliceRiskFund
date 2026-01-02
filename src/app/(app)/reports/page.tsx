import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ReportsPage() {
  return (
    <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight font-headline">Reports</h2>
          <p className="text-muted-foreground">View and generate reports for your organization.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Report generation features will be available here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">Coming Soon</p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
