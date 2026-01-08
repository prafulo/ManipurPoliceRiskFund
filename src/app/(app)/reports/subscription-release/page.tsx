'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Member, Payment } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { members as allMembersData, payments as allPaymentsData } from '@/lib/data';

interface ReportRow {
  memberCode: string;
  rank: string;
  name: string;
  closureDate: Date;
  totalMonthsPaid: number | string;
  totalAmountPaid: number;
  remark: string;
}

export default function SubscriptionReleaseReportPage() {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);

  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [reportLoading, setReportLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  
  const expiredReleaseAmount = 50000; // Mocked

  useEffect(() => {
    setAllMembers(allMembersData);
    setAllPayments(allPaymentsData);
  }, []);

  const generateReport = () => {
    if (!allMembers || !allPayments) return;
    setReportLoading(true);
    
    const startDate = dateRange?.from;
    const endDate = dateRange?.to;

    const toDate = (timestamp: any): Date => timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

    const closedMembers = allMembers.filter(m => {
        const dischargeDate = m.dateOfDischarge ? toDate(m.dateOfDischarge) : null;
        return m.status === 'Closed' &&
               (m.closureReason === 'Retirement' || m.closureReason === 'Death') &&
               dischargeDate &&
               (!startDate || dischargeDate >= startDate) &&
               (!endDate || dischargeDate <= endDate);
    });

    const data: ReportRow[] = closedMembers.map(member => {
      let totalAmountPaid: number;
      let totalMonthsPaid: number | string;

      if (member.closureReason === 'Death') {
        totalAmountPaid = expiredReleaseAmount;
        totalMonthsPaid = 'N/A';
      } else {
        const memberPayments = allPayments.filter(p => p.memberId === member.id);
        totalAmountPaid = memberPayments.reduce((sum, p) => sum + p.amount, 0);
        totalMonthsPaid = memberPayments.reduce((sum, p) => {
          return sum + (Array.isArray(p.months) ? p.months.length : 0);
        }, 0);
      }

      return {
        memberCode: member.membershipCode,
        rank: member.rank,
        name: member.name,
        closureDate: toDate(member.dateOfDischarge!),
        totalMonthsPaid,
        totalAmountPaid,
        remark: member.closureReason || 'N/A',
      };
    });

    setReportData(data);
    setReportLoading(false);
  }

  useEffect(() => {
    if (allMembers.length > 0) {
      generateReport();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, allMembers, allPayments, expiredReleaseAmount]);

  const totals = useMemo(() => {
    return reportData.reduce((acc, row) => ({
      totalAmountPaid: acc.totalAmountPaid + row.totalAmountPaid,
    }), { totalAmountPaid: 0 });
  }, [reportData]);

  const handlePrint = () => {
    window.print();
  }
  
  const dateRangeString = dateRange?.from && dateRange.to ? `${format(dateRange.from, 'LLL d, y')} to ${format(dateRange.to, 'LLL d, y')}` : 'for all time';

  const loading = !allMembers.length;
  if (loading) {
      return <div>Loading data...</div>
  }

  return (
    <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">Member Subscription Release</h2>
                <p className="text-muted-foreground">Report of total subscriptions for retired or expired members {dateRangeString}.</p>
            </div>
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(dateRange.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
                 <Button onClick={generateReport} disabled={reportLoading}>
                    {reportLoading ? 'Generating...' : 'Generate Report'}
                 </Button>
                 <Button onClick={handlePrint} variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
            </div>
        </div>
        <Card>
            <CardContent className="p-0">
                 <div className="text-center p-4 print:block hidden">
                    <h2 className="text-xl font-bold">Member Subscription Payment Release Statement</h2>
                    <h3 className="text-lg">For Retired / Expired Members {dateRangeString}</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">Sl. No.</TableHead>
                            <TableHead>Mem. Code</TableHead>
                            <TableHead>Rank</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Date of Retirement/Expiry</TableHead>
                            <TableHead className="text-right">Total Months Paid</TableHead>
                            <TableHead className="text-right">Total Refundable Amount</TableHead>
                            <TableHead>Remark</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportLoading ? (
                             <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    Generating report...
                                </TableCell>
                            </TableRow>
                        ) : reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{row.memberCode}</TableCell>
                                    <TableCell>{row.rank}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{format(row.closureDate, 'PP')}</TableCell>
                                    <TableCell className="text-right">{row.totalMonthsPaid}</TableCell>
                                    <TableCell className="text-right font-semibold">{row.totalAmountPaid.toFixed(2)}</TableCell>
                                    <TableCell>{row.remark}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No retired or expired members found for the selected period.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                         <TableRow className="font-bold bg-muted/50">
                            <TableCell colSpan={6} className="text-right">GRAND TOTAL</TableCell>
                            <TableCell className="text-right">{totals.totalAmountPaid.toFixed(2)}</TableCell>
                            <TableCell></TableCell>
                         </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
        <div className="text-right mt-12 print:block hidden">
            <p>(Ningshen Worngam), IPS</p>
            <p>Dy. IG of Police (Telecom),</p>
            <p>Manipur, Imphal.</p>
        </div>
    </div>
  );
}
