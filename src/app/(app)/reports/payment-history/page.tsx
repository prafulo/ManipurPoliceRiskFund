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
import { format, startOfMonth, differenceInMonths, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { numberToWords } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReportRow {
  memberCode: string;
  rank: string;
  name: string;
  subscription: number;
  arrear: number;
  totalPayable: number;
  received: number;
  balance: number;
}

export default function PaymentHistoryReportPage() {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportMonth, setReportMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
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
                settingsRes.json(),
            ]);
            setAllMembers(membersData.members);
            const parsedPayments = paymentsData.payments.map((p: any) => ({
                ...p,
                amount: Number(p.amount)
            }));
            setAllPayments(parsedPayments);
            setAllUnits(unitsData.units);
            const subAmount = settingsData.find((s:any) => s.key === 'subscriptionAmount');
            if (subAmount) {
                setSubscriptionAmount(Number(subAmount.value));
            }
        } catch (error) {
            console.error("Failed to load report data", error);
        } finally {
            setReportLoading(false);
        }
    }
    loadData();
  }, []);

  const generateReport = () => {
    if (!allMembers || !allPayments) {
        return;
    }
    setReportLoading(true);

    const reportEndDate = endOfMonth(reportMonth);
    
    const toDate = (timestamp: any): Date => timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

    const filteredMembers = selectedUnit === 'all'
      ? allMembers.filter(m => m.status === 'Opened')
      : allMembers.filter(m => m.unitId === selectedUnit && m.status === 'Opened');

    const data: ReportRow[] = filteredMembers.map(member => {
      const memberPayments = allPayments.filter(p => p.memberId === member.id);
      const subscriptionStartDate = toDate(member.subscriptionStartDate);

      const monthsSinceSubscriptionStart = differenceInMonths(reportEndDate, startOfMonth(subscriptionStartDate)) + 1;
      const totalExpected = monthsSinceSubscriptionStart > 0 ? monthsSinceSubscriptionStart * subscriptionAmount : 0;

      const totalReceivedToDate = memberPayments
        .filter(p => toDate(p.paymentDate) <= reportEndDate)
        .reduce((sum, p) => sum + p.amount, 0);

      const receivedThisMonth = memberPayments
        .filter(p => {
            const paymentDate = toDate(p.paymentDate);
            return paymentDate >= startOfMonth(reportMonth) && paymentDate <= reportEndDate;
        })
        .reduce((sum, p) => sum + p.amount, 0);
      
      const balanceAtStartOfMonth = totalExpected - subscriptionAmount - totalReceivedToDate + receivedThisMonth;

      const arrear = balanceAtStartOfMonth > 0 ? balanceAtStartOfMonth : 0;
      const subscription = subscriptionAmount;
      const totalPayable = subscription + arrear;
      const balance = totalPayable - receivedThisMonth;
      
      return {
        memberCode: member.membershipCode,
        rank: member.rank,
        name: member.name,
        subscription,
        arrear,
        totalPayable,
        received: receivedThisMonth,
        balance,
      };
    });

    setReportData(data);
    setReportLoading(false);
  };
  
  useEffect(() => {
    if (allMembers.length > 0) { 
       generateReport();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportMonth, selectedUnit, allMembers, allPayments, subscriptionAmount]); 


  const totals = useMemo(() => {
    return reportData.reduce((acc, row) => ({
      subscription: acc.subscription + row.subscription,
      arrear: acc.arrear + row.arrear,
      totalPayable: acc.totalPayable + row.totalPayable,
      received: acc.received + row.received,
      balance: acc.balance + row.balance,
    }), { subscription: 0, arrear: 0, totalPayable: 0, received: 0, balance: 0 });
  }, [reportData]);

  const handlePrint = () => {
    window.print();
  }

  const reportDateString = format(reportMonth, 'MMMM yyyy');

  const loading = !allMembers.length || !allUnits.length || reportLoading;
  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">Member Payment History</h2>
                <p className="text-muted-foreground">Report for {reportDateString} for unit: {allUnits?.find(u => u.id === selectedUnit)?.name || 'All Units'}</p>
            </div>
            <div className="flex items-center gap-2">
                 <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Units</SelectItem>
                        {allUnits?.map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn("w-[200px] justify-start text-left font-normal")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(reportMonth, "MMM yyyy")}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="single"
                        month={reportMonth}
                        onMonthChange={(month) => {
                            const newMonth = month || startOfMonth(new Date());
                            setReportMonth(startOfMonth(newMonth));
                        }}
                        captionLayout="dropdown-buttons"
                        fromYear={2020}
                        toYear={new Date().getFullYear() + 5}
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
                    <h2 className="text-xl font-bold">Member Payment History for {reportDateString}</h2>
                    <h3 className="text-lg">Unit: {allUnits?.find(u => u.id === selectedUnit)?.name || 'All Units'}</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">Sl. No.</TableHead>
                            <TableHead>Mem. Code</TableHead>
                            <TableHead>Rank</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Subs</TableHead>
                            <TableHead className="text-right">Arrear</TableHead>
                            <TableHead className="text-right">Total Payable</TableHead>
                            <TableHead className="text-right">Recv.</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportLoading ? (
                             <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
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
                                    <TableCell className="text-right">{row.subscription.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{row.arrear.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-semibold">{row.totalPayable.toFixed(2)}</TableCell>
                                    <TableCell className="text-right text-green-600">{row.received.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-semibold">{row.balance.toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    No members found for the selected criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                         <TableRow className="font-bold bg-muted/50">
                            <TableCell colSpan={4} className="text-right">TOTAL</TableCell>
                            <TableCell className="text-right">{totals.subscription.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{totals.arrear.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{totals.totalPayable.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{totals.received.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{totals.balance.toFixed(2)}</TableCell>
                         </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
        <div className="mt-4 text-right pr-4 font-semibold print:block hidden">
            <p>INR {totals.totalPayable.toFixed(2)} (Rupees {numberToWords(Math.round(totals.totalPayable))}) only.</p>
        </div>
        <div className="text-right mt-12 print:block hidden">
            <p>(Ningshen Worngam), IPS</p>
            <p>Dy. IG of Police (Telecom),</p>
            <p>Manipur, Imphal.</p>
        </div>
    </div>
  );
}
