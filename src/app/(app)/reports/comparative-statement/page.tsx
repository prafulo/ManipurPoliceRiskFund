'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Member, Unit, Transfer, Signature } from '@/lib/types';
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

async function fetchData() {
    const [membersRes, transfersRes, unitsRes, signatureRes] = await Promise.all([
        fetch('/api/members?all=true'),
        fetch('/api/transfers?all=true'),
        fetch('/api/units'),
        fetch('/api/signature')
    ]);
    if (!membersRes.ok || !transfersRes.ok || !unitsRes.ok) {
        throw new Error('Failed to fetch initial data');
    }
    const [membersData, transfersData, unitsData, signatureData] = await Promise.all([
        membersRes.json(),
        transfersData.json(),
        unitsRes.json(),
        signatureRes.json()
    ]);
    return {
        members: membersData.members.map((m: Member) => ({ ...m, allotmentDate: toDate(m.allotmentDate), dateOfDischarge: m.dateOfDischarge ? toDate(m.dateOfDischarge) : null })),
        transfers: transfersData.transfers.map((t: Transfer) => ({ ...t, transferDate: toDate(t.transferDate) })),
        units: unitsData.units,
        signature: signatureData
    };
}


export default function ComparativeStatementPage() {
  const [allData, setAllData] = useState<{ members: Member[], transfers: Transfer[], units: Unit[], signature: Signature | null } | null>(null);
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
            const data = await fetchData();
            setAllData(data);
        } catch (error) {
            console.error("Failed to load initial data", error);
        } finally {
            setInitialLoading(false);
        }
    }
    loadData();
  }, []);

  const generateReport = () => {
    if (!allData || !dateRange?.from || !dateRange.to) {
        return;
    }
    setReportLoading(true);

    const { members, transfers, units } = allData;
    const startDate = startOfDay(dateRange.from);
    const endDate = endOfDay(dateRange.to);

    const data: ReportRow[] = units.map(unit => {
        
        const getUnitOnDate = (memberId: string, date: Date): string => {
            const member = members.find(m => m.id === memberId);
            if (!member) return '';

            const transfersForMember = transfers
                .filter(t => t.memberId === memberId && isBefore(t.transferDate, date))
                .sort((a, b) => b.transferDate.getTime() - a.transferDate.getTime());
            
            return transfersForMember.length > 0 ? transfersForMember[0].toUnitId : member.unitId;
        };

        const membersInUnitAtStart = members.filter(m => {
             const unitAtStart = getUnitOnDate(m.id, startDate);
             return unitAtStart === unit.id && isBefore(m.allotmentDate, startDate) && (!m.dateOfDischarge || !isBefore(m.dateOfDischarge, startDate));
        });

        const previousMembers = membersInUnitAtStart.length;

        const newMembers = members.filter(m => 
            m.unitId === unit.id && isWithinInterval(m.allotmentDate, { start: startDate, end: endDate })
        ).length;
        
        const transfersInPeriod = transfers.filter(t => isWithinInterval(t.transferDate, { start: startDate, end: endDate }));
        const transferredIn = transfersInPeriod.filter(t => t.toUnitId === unit.id).length;
        const transferredOut = transfersInPeriod.filter(t => t.fromUnitId === unit.id).length;

        const closedMembers = members.filter(m => {
            if (!m.dateOfDischarge || !isWithinInterval(m.dateOfDischarge, { start: startDate, end: endDate })) {
                return false;
            }
            const unitAtDischarge = getUnitOnDate(m.id, m.dateOfDischarge);
            return unitAtDischarge === unit.id;
        });

        const closedExpiredRetired = closedMembers.filter(m => m.closureReason === 'Retirement' || m.closureReason === 'Death' || m.closureReason === 'Expelled').length;
        const closedDoubling = closedMembers.filter(m => m.closureReason === 'Doubling').length;

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
    if (!initialLoading) {
      generateReport();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, initialLoading, allData]);


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
            <h2 className="text-xl font-bold uppercase">COMPARATIVE TABLES FOR THE MONTH(S) OF {dateRangeString.toUpperCase()}</h2>
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
        {allData?.signature && (
            <div className="text-right mt-12 print:block hidden">
                <p className="font-bold">{allData.signature.name}</p>
                <p>{allData.signature.designation}</p>
                <p>{allData.signature.organization}</p>
            </div>
        )}
    </div>
  );
}
