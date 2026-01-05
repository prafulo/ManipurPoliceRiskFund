'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Member, Unit, Transfer } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Printer } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface ReportRow {
    unitName: string;
    previousMembers: number;
    newMembers: number;
    transferredIn: number;
    totalIn: number;
    transferredOut: number;
    closedExpiredRetired: number;
    closedDoubling: number;
    totalOut: number;
    actualMembers: number;
}

export default function ComparativeStatementPage() {
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allTransfers, setAllTransfers] = useState<Transfer[]>([]);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);

  useEffect(() => {
    // Load all necessary data from localStorage
    const membersString = localStorage.getItem('members');
    const transfersString = localStorage.getItem('transfers');
    const unitsString = localStorage.getItem('units');

    setAllMembers(membersString ? JSON.parse(membersString).map((m: any) => ({ ...m, allotmentDate: new Date(m.allotmentDate), dateOfDischarge: m.dateOfDischarge ? new Date(m.dateOfDischarge) : undefined })) : []);
    setAllTransfers(transfersString ? JSON.parse(transfersString).map((t: any) => ({...t, transferDate: new Date(t.transferDate)})) : []);
    setAllUnits(unitsString ? JSON.parse(unitsString) : []);
    
    setLoading(false);
  }, []);

  const generateReport = () => {
    setLoading(true);

    const startDate = dateRange?.from ? startOfDay(dateRange.from) : startOfDay(new Date());
    const endDate = dateRange?.to ? endOfDay(dateRange.to) : endOfDay(new Date());

    const data: ReportRow[] = allUnits.map(unit => {
        // Previous Members: Active members before the start date
        const previousMembers = allMembers.filter(m => {
            if (m.allotmentDate >= startDate) return false; // Enrolled after period started

            // Was the member in this unit before the start date?
            const transfersBefore = allTransfers
                .filter(t => t.memberId === m.id && t.transferDate < startDate)
                .sort((a, b) => b.transferDate.getTime() - a.transferDate.getTime());

            const lastUnitIdBefore = transfersBefore.length > 0 ? transfersBefore[0].toUnitId : m.unitId;
            if(lastUnitIdBefore !== unit.id) return false;
            
            // Were they closed before start date?
            if (m.status === 'Closed' && m.dateOfDischarge && m.dateOfDischarge < startDate) {
                return false;
            }

            return true;
        }).length;
        
        // New Members: Enrolled during the period
        const newMembers = allMembers.filter(m => m.unitId === unit.id && m.allotmentDate >= startDate && m.allotmentDate <= endDate).length;

        // Transfers In: Transferred to this unit during the period
        const transferredIn = allTransfers.filter(t => t.toUnitId === unit.id && t.transferDate >= startDate && t.transferDate <= endDate).length;
        
        // Transfers Out: Transferred from this unit during the period
        const transferredOut = allTransfers.filter(t => t.fromUnitId === unit.id && t.transferDate >= startDate && t.transferDate <= endDate).length;

        // Closed Members: Closed during the period
        const closedExpiredRetired = allMembers.filter(m => {
            const lastUnitBeforeClosure = allTransfers
                .filter(t => t.memberId === m.id && m.dateOfDischarge && t.transferDate < m.dateOfDischarge)
                .sort((a,b) => b.transferDate.getTime() - a.transferDate.getTime());
            const unitAtClosure = lastUnitBeforeClosure.length > 0 ? lastUnitBeforeClosure[0].toUnitId : m.unitId;

            return unitAtClosure === unit.id && 
                   m.status === 'Closed' &&
                   m.dateOfDischarge && m.dateOfDischarge >= startDate && m.dateOfDischarge <= endDate &&
                   (m.closureReason === 'Retirement' || m.closureReason === 'Death' || m.closureReason === 'Expelled')
        }).length;

        const closedDoubling = allMembers.filter(m => {
             const lastUnitBeforeClosure = allTransfers
                .filter(t => t.memberId === m.id && m.dateOfDischarge && t.transferDate < m.dateOfDischarge)
                .sort((a,b) => b.transferDate.getTime() - a.transferDate.getTime());
            const unitAtClosure = lastUnitBeforeClosure.length > 0 ? lastUnitBeforeClosure[0].toUnitId : m.unitId;
            
            return unitAtClosure === unit.id &&
                   m.status === 'Closed' &&
                   m.dateOfDischarge && m.dateOfDischarge >= startDate && m.dateOfDischarge <= endDate &&
                   m.closureReason === 'Doubling'
        }).length;


        const totalIn = previousMembers + newMembers + transferredIn;
        const totalOut = transferredOut + closedExpiredRetired + closedDoubling;
        const actualMembers = totalIn - totalOut;
      
      return {
        unitName: unit.name,
        previousMembers,
        newMembers,
        transferredIn,
        totalIn,
        transferredOut,
        closedExpiredRetired,
        closedDoubling,
        totalOut,
        actualMembers
      };
    });

    setReportData(data);
    setLoading(false);
  };
  
  useEffect(() => {
    if (!loading) { 
       generateReport();
    }
  }, [dateRange, allMembers, allTransfers, allUnits, loading]); 


  const handlePrint = () => {
    window.print();
  }
  
  const dateRangeString = dateRange?.from && dateRange.to ? `${format(dateRange.from, 'LLL d, y')} to ${format(dateRange.to, 'LLL d, y')}` : 'a selected period';

  if (loading && allMembers.length === 0) {
    return <div>Loading data...</div>;
  }

  return (
    <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">Comparative Statement</h2>
                <p className="text-muted-foreground">Member movement for {dateRangeString}</p>
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
                 <Button onClick={generateReport} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate'}
                 </Button>
                 <Button onClick={handlePrint} variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
            </div>
        </div>
         <div className="text-center p-4 print:block hidden mb-4">
            <h2 className="text-xl font-bold">COMPARATIVE TABLES FOR THE MONTH(S) OF {dateRangeString.toUpperCase()}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
                <p>Generating Report...</p>
            ) : reportData.length > 0 ? (
                reportData.map((row, index) => (
                <Card key={index}>
                    <CardHeader className="bg-muted/30">
                        <CardTitle>{index + 1}. {row.unitName}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Previous D/Note</TableCell>
                                    <TableCell className="text-right">{row.previousMembers}</TableCell>
                                    <TableCell>Tfr. To other Unit</TableCell>
                                    <TableCell className="text-right">{row.transferredOut}</TableCell>
                                    <TableCell className="row-span-4 border-l font-semibold text-center align-middle">
                                        Actual Member<br/>
                                        ({row.actualMembers})
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>New Data</TableCell>
                                    <TableCell className="text-right">{row.newMembers}</TableCell>
                                    <TableCell>Exp/Ret/Terminate</TableCell>
                                    <TableCell className="text-right">{row.closedExpiredRetired}</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell>Tfr from other Unit</TableCell>
                                    <TableCell className="text-right">{row.transferredIn}</TableCell>
                                    <TableCell>Doubling</TableCell>
                                    <TableCell className="text-right">{row.closedDoubling}</TableCell>
                                </TableRow>
                                 <TableRow className="font-bold bg-muted/50">
                                    <TableCell>Total 1</TableCell>
                                    <TableCell className="text-right">{row.totalIn}</TableCell>
                                    <TableCell>Total 2</TableCell>
                                    <TableCell className="text-right">{row.totalOut}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                ))
            ) : (
                <p>No data for this period.</p>
            )}
        </div>
        <div className="text-right mt-12 print:block hidden">
            <p>(Ningshen Worngam), IPS</p>
            <p>Dy. IG of Police (Telecom),</p>
            <p>Manipur, Imphal.</p>
        </div>
    </div>
  );
}
