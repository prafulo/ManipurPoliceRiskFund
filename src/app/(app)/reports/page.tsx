'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Reports</h2>
        <p className="text-muted-foreground">View and generate reports for your organization.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Membership Statement</CardTitle>
            <CardDescription>Statement of data entered and deleted during a selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center bg-muted/50 rounded-md">
              <p className="text-sm text-center text-muted-foreground">Generates a summary of new, retired, expired, and doubling members for each unit.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/reports/statement">
              <Button>Generate Report</Button>
            </Link>
          </CardFooter>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Member-wise payment history, arrears, and totals for a selected period.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-32 flex items-center justify-center bg-muted/50 rounded-md">
              <p className="text-sm text-center text-muted-foreground">Generates a detailed breakdown of subscriptions, arrears, payments, and balances for each member.</p>
            </div>
          </CardContent>
           <CardFooter>
            <Link href="/reports/payment-history">
              <Button>Generate Report</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
