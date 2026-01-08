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
import { format, startOfDay, endOfDay, isWithinInterval, isBefore } from 'date-fns';
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

const toDate = (timestamp: any): Date => timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

export default function ComparativeStatementPage() {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allTransfers, setAllTransfers] = useState<Transfer[]>([]);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [reportLoading, setReportLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  useEffect(() => {
    async function loadData() {
        setInitialLoading(true);
        try {
            const [membersRes, transfersRes, unitsRes] = await Promise.all([
                fetch('/api/members'),
                fetch('/api/transfers'),
                fetch('/api/units')
            ]);
            const [membersData, transfersData, unitsData] = await Promise.all([
                membersRes.json(),
                unitsRes.json(),
                transfersRes.json()
            ]);
            setAllMembers(membersData.members);
            setAllTransfers(transfersData.transfers);
            setAllUnits(unitsData.units);
        } catch (error) {
            console.error("Failed to load initial data", error);
        } finally {
            setInitialLoading(false);
        }
    }
    loadData();
  }, []);

  const generateReport = () => {
    if (initialLoading || !allMembers || !allUnits || !allTransfers) {
        return;
    }
    setReportLoading(true);

    const startDate = dateRange?.from ? startOfDay(dateRange.from) : startOfDay(new Date());
    const endDate = dateRange?.to ? endOfDay(dateRange.to) : endOfDay(new Date());

    const data: ReportRow[] = allUnits.map(unit => {
        let previousMembers = 0;
        let newMembers = 0;
        let transferredIn = 0;
        let transferredOut = 0;
        let closedExpiredRetired = 0;
        let closedDoubling = 0;

        // Transfers within the current period
        const transfersInPeriod = allTransfers.filter(t => 
            isWithinInterval(toDate(t.transferDate), { start: startDate, end: endDate })
        );
        transferredIn = transfersInPeriod.filter(t => t.toUnitId === unit.id).length;
        transferredOut = transfersInPeriod.filter(t => t.fromUnitId === unit.id).length;

        allMembers.forEach(member => {
            const allotmentDate = toDate(member.allotmentDate);
            const dischargeDate = member.dateOfDischarge ? toDate(member.dateOfDischarge) : null;
            
            // Find the member's unit at the START of the period
            const transfersBeforePeriod = allTransfers
                .filter(t => t.memberId === member.id && isBefore(toDate(t.transferDate), startDate))
                .sort((a, b) => toDate(b.transferDate).getTime() - toDate(a.transferDate).getTime());
            
            const unitBeforePeriod = transfersBeforePeriod.length > 0 ? transfersBeforePeriod[0].toUnitId : member.unitId;

            // Is the member part of the "Previous Members" count for this unit?
            // They were allotted before the start date AND their unit before the start date was this one
            // AND they were not discharged before the start date
            if (isBefore(allotmentDate, startDate) && unitBeforePeriod === unit.id && (!dischargeDate || !isBefore(dischargeDate, startDate))) {
                previousMembers++;
            }

            // Is the member a "New Member" for this unit during the period?
            // They were allotted during this period AND their original unitId is this unit
            if (member.unitId === unit.id && isWithinInterval(allotmentDate, { start: startDate, end: endDate })) {
                newMembers++;
            }

            // Was the member closed in this unit during this period?
            if (dischargeDate && isWithinInterval(dischargeDate, { start: startDate, end: endDate })) {
                 // To correctly attribute closure, find the member's unit at the time of discharge
                const transfersBeforeClosure = allTransfers
                    .filter(t => t.memberId === member.id && !isBefore(dischargeDate, toDate(t.transferDate)))
                    .sort((a,b) => toDate(b.transferDate).getTime() - toDate(a.transferDate).getTime());
            
                const unitAtClosure = transfersBeforeClosure.length > 0 ? transfersBeforeClosure[0].toUnitId : member.unitId;
                
                if (unitAtClosure === unit.id) {
                    if (member.closureReason === 'Retirement' || member.closureReason === 'Death' || member.closureReason === 'Expelled') {
                        closedExpiredRetired++;
                    } else if (member.closureReason === 'Doubling') {
                        closedDoubling++;
                    }
                }
            }
        });
        
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
    setReportLoading(false);
  };
  
  useEffect(() => {
      generateReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, initialLoading]); 


  const handlePrint = () => {
    window.print();
  }
  
  const dateRangeString = dateRange?.from && dateRange.to ? `${format(dateRange.from, 'LLL d, y')} to ${format(dateRange.to, 'LLL d, y')}` : 'a selected period';

  if (initialLoading) {
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
                 <Button onClick={generateReport} disabled={reportLoading}>
                    {reportLoading ? 'Generating...' : 'Generate'}
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
            {reportLoading ? (
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
