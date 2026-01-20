'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Member, Unit, Payment } from '@/lib/types';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfMonth, endOfMonth, differenceInMonths, eachMonthOfInterval } from 'date-fns';
import { cn, numberToWords } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface ReportRow {
  unitName: string;
  memberCount: number;
  subscription: number;
  arrears: number;
  totalPayable: number;
}

export default function ConsolidatedStatementPage() {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [reportLoading, setReportLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [subscriptionAmount, setSubscriptionAmount] = useState(100);

  useEffect(() => {
    async function loadData() {
      try {
        const [membersRes, paymentsRes, unitsRes, settingsRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/payments'),
          fetch('/api/units'),
          fetch('/api/settings'),
        ]);
        const [membersData, paymentsData, unitsData, settingsData] = await Promise.all([
          membersRes.json(),
          paymentsRes.json(),
          unitsRes.json(),
          settingsRes.json()
        ]);
        setAllMembers(membersData.members);
        setAllPayments(paymentsData.payments);
        setAllUnits(unitsData.units);
        
        const subAmount = settingsData.find((s:any) => s.key === 'subscriptionAmount');
        if (subAmount) setSubscriptionAmount(Number(subAmount.value));

      } catch (error) {
        console.error("Failed to load report data", error);
      }
    }
    loadData();
  }, []);

  const generateReport = () => {
    if (!allMembers || !allPayments || !allUnits) return;
    setReportLoading(true);

    const reportStartDate = dateRange?.from ? startOfMonth(dateRange.from) : startOfMonth(new Date());
    const reportEndDate = dateRange?.to ? endOfMonth(dateRange.to) : endOfMonth(new Date());

    const toDate = (timestamp: any): Date => timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    
    const data: ReportRow[] = allUnits.map(unit => {
      const unitMembers = allMembers.filter(m => {
          const allotmentDate = toDate(m.allotmentDate);
          return m.unitId === unit.id && m.status === 'Opened' && startOfMonth(allotmentDate) <= reportEndDate;
      });

      let totalSubscription = 0;
      let totalArrears = 0;

      unitMembers.forEach(member => {
        const subscriptionStartDate = toDate(member.subscriptionStartDate);
        
        const memberMonthsInPeriod = eachMonthOfInterval({
            start: reportStartDate,
            end: reportEndDate
        }).filter(month => month >= startOfMonth(subscriptionStartDate)).length;

        totalSubscription += memberMonthsInPeriod * subscriptionAmount;

        const monthsDueBeforePeriod = differenceInMonths(reportStartDate, startOfMonth(subscriptionStartDate));
        if (monthsDueBeforePeriod > 0) {
            const expectedBeforePeriod = monthsDueBeforePeriod * subscriptionAmount;
            
            const paidBeforePeriod = allPayments
                .filter(p => p.memberId === member.id && toDate(p.paymentDate) < reportStartDate)
                .reduce((sum, p) => sum + p.amount, 0);
            
            const arrearForMember = expectedBeforePeriod - paidBeforePeriod;
            if (arrearForMember > 0) {
                totalArrears += arrearForMember;
            }
        }
      });
      
      return {
        unitName: unit.name,
        memberCount: unitMembers.length,
        subscription: totalSubscription,
        arrears: totalArrears,
        totalPayable: totalSubscription + totalArrears,
      };
    });

    setReportData(data);
    setReportLoading(false);
  };
  
  useEffect(() => {
    if (allMembers.length > 0 && allUnits.length > 0) { 
       generateReport();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, allMembers, allPayments, allUnits, subscriptionAmount]); 


  const totals = useMemo(() => {
    return reportData.reduce((acc, row) => ({
      memberCount: acc.memberCount + row.memberCount,
      subscription: acc.subscription + row.subscription,
      arrears: acc.arrears + row.arrears,
      totalPayable: acc.totalPayable + row.totalPayable,
    }), { memberCount: 0, subscription: 0, arrears: 0, totalPayable: 0 });
  }, [reportData]);

  const handlePrint = () => {
    window.print();
  }
  
  const dateRangeString = dateRange?.from && dateRange.to ? `${format(dateRange.from, 'MMMM yyyy')} to ${format(dateRange.to, 'MMMM yyyy')}` : 'a selected period';

  const loading = !allMembers.length || !allUnits.length;
  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">Consolidated Statement</h2>
                <p className="text-muted-foreground">Demand Notes for {dateRangeString}</p>
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
                            {format(dateRange.from, "LLL, y")} -{" "}
                            {format(dateRange.to, "LLL, y")}
                            </>
                        ) : (
                            format(dateRange.from, "LLL, y")
                        )
                        ) : (
                        <span>Pick a date range</span>
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
                    <h2 className="text-xl font-bold">Consolidated Statement of Demand Notes</h2>
                    <h3 className="text-lg">For the months of {dateRangeString}</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">Sl. No.</TableHead>
                            <TableHead>Units/District</TableHead>
                            <TableHead className="text-right">No. of members</TableHead>
                            <TableHead className="text-right">Subscription</TableHead>
                            <TableHead className="text-right">Arrears</TableHead>
                            <TableHead className="text-right">Total Payable Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportLoading ? (
                             <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Generating report...
                                </TableCell>
                            </TableRow>
                        ) : reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{row.unitName}</TableCell>
                                    <TableCell className="text-right">{row.memberCount}</TableCell>
                                    <TableCell className="text-right">₹{row.subscription.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">₹{row.arrears.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-semibold">₹{row.totalPayable.toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No data found for the selected criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                         <TableRow className="font-bold bg-muted/50">
                            <TableCell colSpan={2} className="text-right">TOTAL</TableCell>
                            <TableCell className="text-right">{totals.memberCount}</TableCell>
                            <TableCell className="text-right">₹{totals.subscription.toFixed(2)}</TableCell>
                            <TableCell className="text-right">₹{totals.arrears.toFixed(2)}</TableCell>
                            <TableCell className="text-right">₹{totals.totalPayable.toFixed(2)}</TableCell>
                         </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
        <div className="mt-4 text-right pr-4 font-semibold print:block hidden">
            <p>₹{totals.totalPayable.toFixed(2)} (Rupees {numberToWords(Math.round(totals.totalPayable))}) only.</p>
        </div>
        <div className="text-right mt-12 print:block hidden">
            <p>(Ningshen Worngam), IPS</p>
            <p>Dy. IG of Police (Telecom),</p>
            <p>Manipur, Imphal.</p>
        </div>
    </div>
  );
}
