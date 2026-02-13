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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <CardTitle>Payment History (Unit)</CardTitle>
            <CardDescription>Unit-wise payment history, arrears, and totals for a selected period.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-32 flex items-center justify-center bg-muted/50 rounded-md">
              <p className="text-sm text-center text-muted-foreground">Generates a detailed breakdown of subscriptions, arrears, payments, and balances for all members in a unit.</p>
            </div>
          </CardContent>
           <CardFooter>
            <Link href="/reports/payment-history">
              <Button>Generate Report</Button>
            </Link>
          </CardFooter>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Individual Statement</CardTitle>
            <CardDescription>Complete subscription payment history for a specific member.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-32 flex items-center justify-center bg-primary/10 rounded-md border border-primary/10">
              <p className="text-sm text-center text-primary font-medium">Generate and print a personalized payment statement for an individual member for any period.</p>
            </div>
          </CardContent>
           <CardFooter>
            <Link href="/reports/individual-payment-history">
              <Button className="w-full">Generate Statement</Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscription Release</CardTitle>
            <CardDescription>Refundable subscription amount for retired or expired members.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-32 flex items-center justify-center bg-muted/50 rounded-md">
              <p className="text-sm text-center text-muted-foreground">Generates a statement showing total subscription paid by members closed due to retirement or death.</p>
            </div>
          </CardContent>
           <CardFooter>
            <Link href="/reports/subscription-release">
              <Button>Generate Report</Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Consolidated Statement</CardTitle>
            <CardDescription>Unit-wise demand notes showing subscriptions, arrears, and total payable amount.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-32 flex items-center justify-center bg-muted/50 rounded-md">
              <p className="text-sm text-center text-muted-foreground">Generates a consolidated financial statement for all units for a selected period.</p>
            </div>
          </CardContent>
           <CardFooter>
            <Link href="/reports/consolidated-statement">
              <Button>Generate Report</Button>
            </Link>
          </CardFooter>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Comparative Statement</CardTitle>
            <CardDescription>Unit-wise total IN and OUT members for a selected period.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-32 flex items-center justify-center bg-muted/50 rounded-md">
              <p className="text-sm text-center text-muted-foreground">Generates a comparative table of member movements, including new, transferred, and closed members.</p>
            </div>
          </CardContent>
           <CardFooter>
            <Link href="/reports/comparative-statement">
              <Button>Generate Report</Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>View a chronological log of all recent system activities.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-32 flex items-center justify-center bg-muted/50 rounded-md">
              <p className="text-sm text-center text-muted-foreground">Generates a filterable list of all important events recorded in the system.</p>
            </div>
          </CardContent>
           <CardFooter>
            <Link href="/recent-activity">
              <Button variant="outline" className="w-full">View Activity Log</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
