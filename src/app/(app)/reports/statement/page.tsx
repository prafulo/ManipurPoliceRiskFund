'use client';

import { useEffect, useState } from 'react';
import type { Member, Unit, Signature } from '@/lib/types';
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface ReportRow {
  unitName: string;
  retired: number;
  expired: number;
  doubling: number;
  totalDeleted: number;
  newEnrolled: number;
}

export default function StatementReportPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [signature, setSignature] = useState<Signature | null>(null);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [reportLoading, setReportLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  });
  const [totals, setTotals] = useState({
    retired: 0,
    expired: 0,
    doubling: 0,
    totalDeleted: 0,
    newEnrolled: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [membersRes, unitsRes, signatureRes] = await Promise.all([
            fetch('/api/members?all=true'),
            fetch('/api/units'),
            fetch('/api/signature')
        ]);
        const [membersData, unitsData, signatureData] = await Promise.all([
            membersRes.json(),
            unitsRes.json(),
            signatureRes.json()
        ]);
        setMembers(membersData?.members || []);
        setUnits(unitsData?.units || []);
        setSignature(signatureData);
      } catch (error) {
        console.error("Failed to load report data:", error);
        setMembers([]);
        setUnits([]);
      }
    }
    loadData();
  }, []);

  const generateReport = () => {
    if (!members || !units) {
        setReportData([]);
        setTotals({ retired: 0, expired: 0, doubling: 0, totalDeleted: 0, newEnrolled: 0 });
        setReportLoading(false);
        return;
    };
    setReportLoading(true);

    const startDate = dateRange?.from;
    const endDate = dateRange?.to;

    if (!startDate || !endDate) {
      setReportData([]);
      setTotals({ retired: 0, expired: 0, doubling: 0, totalDeleted: 0, newEnrolled: 0 });
      setReportLoading(false);
      return;
    }
    
    const toDate = (timestamp: any): Date => timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

    const data: ReportRow[] = units.map(unit => {
      const unitMembers = members.filter(m => m.unitId === unit.id);

      const retired = unitMembers.filter(m => 
        m.status === 'Closed' && m.closureReason === 'Retirement' && m.dateOfDischarge && toDate(m.dateOfDischarge) >= startDate && toDate(m.dateOfDischarge) <= endDate
      ).length;

      const expired = unitMembers.filter(m => 
        m.status === 'Closed' && m.closureReason === 'Death' && m.dateOfDischarge && toDate(m.dateOfDischarge) >= startDate && toDate(m.dateOfDischarge) <= endDate
      ).length;

      const doubling = unitMembers.filter(m => 
        m.status === 'Closed' && m.closureReason === 'Doubling' && m.dateOfDischarge && toDate(m.dateOfDischarge) >= startDate && toDate(m.dateOfDischarge) <= endDate
      ).length;
      
      const newEnrolled = unitMembers.filter(m => 
        m.status === 'Opened' && toDate(m.allotmentDate) >= startDate && toDate(m.allotmentDate) <= endDate
      ).length;

      const totalDeleted = retired + expired + doubling;
      
      return {
        unitName: unit.name,
        retired,
        expired,
        doubling,
        totalDeleted,
        newEnrolled,
      };
    });

    const totalRow = data.reduce((acc, row) => ({
      retired: acc.retired + row.retired,
      expired: acc.expired + row.expired,
      doubling: acc.doubling + row.doubling,
      totalDeleted: acc.totalDeleted + row.totalDeleted,
      newEnrolled: acc.newEnrolled + row.newEnrolled,
    }), { retired: 0, expired: 0, doubling: 0, totalDeleted: 0, newEnrolled: 0 });

    setReportData(data);
    setTotals(totalRow);
    setReportLoading(false);
  }

  useEffect(() => {
    if (members.length > 0 && units.length > 0) {
      generateReport();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, members, units]);

  const loading = !members.length && !units.length && reportLoading;

  if (loading) {
    return <div>Loading data...</div>;
  }
  
  const handlePrint = () => {
    window.print();
  }

  const dateRangeString = dateRange?.from && dateRange.to ? `${format(dateRange.from, 'LLL d, y')} to ${format(dateRange.to, 'LLL d, y')}` : 'a selected period';

  return (
    <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">Membership Statement</h2>
                <p className="text-muted-foreground">Statement of data entered and deleted during {dateRangeString}</p>
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
                    <h2 className="text-xl font-bold uppercase">Statement of data entered and deleted during {dateRangeString}.</h2>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">SL. No.</TableHead>
                            <TableHead>Units/District</TableHead>
                            <TableHead colSpan={3} className="text-center">Deleted Members</TableHead>
                            <TableHead className="text-center">Total</TableHead>
                            <TableHead className="text-center">New Members Enrolled/Retrieved</TableHead>
                        </TableRow>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead></TableHead>
                            <TableHead className="text-center">Retired</TableHead>
                            <TableHead className="text-center">Expired</TableHead>
                            <TableHead className="text-center">Doubling</TableHead>
                            <TableHead></TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportLoading ? (
                             <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Generating report...
                                </TableCell>
                            </TableRow>
                        ) : reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{row.unitName}</TableCell>
                                    <TableCell className="text-center">{row.retired || ''}</TableCell>
                                    <TableCell className="text-center">{row.expired || ''}</TableCell>
                                    <TableCell className="text-center">{row.doubling || ''}</TableCell>
                                    <TableCell className="text-center font-semibold">{row.totalDeleted || ''}</TableCell>
                                    <TableCell className="text-center">{row.newEnrolled || ''}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No data found for the selected period.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                         <TableRow className="font-bold bg-muted/50">
                            <TableCell colSpan={2} className="text-right">TOTAL</TableCell>
                            <TableCell className="text-center">{totals.retired}</TableCell>
                            <TableCell className="text-center">{totals.expired}</TableCell>
                            <TableCell className="text-center">{totals.doubling}</TableCell>
                            <TableCell className="text-center">{totals.totalDeleted}</TableCell>
                            <TableCell className="text-center">{totals.newEnrolled}</TableCell>
                         </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
        {signature && (
            <div className="text-right mt-12 print:block hidden">
                <p className="font-bold">{signature.name}</p>
                <p>{signature.designation}</p>
                <p>{signature.organization}</p>
            </div>
        )}
    </div>
  );
}
