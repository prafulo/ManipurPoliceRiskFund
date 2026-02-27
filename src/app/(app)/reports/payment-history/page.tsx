'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Member, Unit, Payment, Signature } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Printer } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfMonth, differenceInMonths, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { cn, numberToWords } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DateRange } from 'react-day-picker';
import { Logo } from '@/components/logo';

interface ReportRow {
  memberCode: string;
  ein: string;
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
  const [signatures, setSignatures] = useState<{ sig1?: Signature, sig2?: Signature, sig3?: Signature } | null>(null);
  
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [reportLoading, setReportLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [subscriptionAmount, setSubscriptionAmount] = useState(100); 

  useEffect(() => {
    async function loadData() {
        try {
            const [membersRes, paymentsRes, unitsRes, settingsRes, signatureRes] = await Promise.all([
                fetch('/api/members?all=true'),
                fetch('/api/payments?all=true'),
                fetch('/api/units'),
                fetch('/api/settings'),
                fetch('/api/signature'),
            ]);
            const [membersData, paymentsData, unitsData, settingsData, signatureData] = await Promise.all([
                membersRes.json(),
                paymentsRes.json(),
                unitsRes.json(),
                settingsRes.json(),
                signatureRes.json(),
            ]);
            setAllMembers(membersData.members || []);
            const parsedPayments = (paymentsData.payments || []).map((p: any) => ({
                ...p,
                amount: Number(p.amount)
            }));
            setAllPayments(parsedPayments);
            setAllUnits(unitsData.units || []);
            setSignatures(signatureData);
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
    if (!allMembers.length || !allUnits.length || !dateRange?.from || !dateRange.to) {
        return;
    }
    setReportLoading(true);

    const reportStartDate = startOfMonth(dateRange.from);
    const reportEndDate = endOfMonth(dateRange.to);
    
    const toDate = (timestamp: any): Date => timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

    const filteredMembers = selectedUnit === 'all'
      ? allMembers.filter(m => m.status === 'Opened')
      : allMembers.filter(m => m.unitId === selectedUnit && m.status === 'Opened');

    const data: ReportRow[] = filteredMembers.map(member => {
      const memberPayments = allPayments.filter(p => p.memberId === member.id);
      const subscriptionStartDate = toDate(member.subscriptionStartDate);

      const monthsUntilPeriodStart = differenceInMonths(reportStartDate, startOfMonth(subscriptionStartDate));
      const totalExpectedBefore = monthsUntilPeriodStart > 0 ? monthsUntilPeriodStart * subscriptionAmount : 0;

      const totalReceivedBefore = memberPayments
        .filter(p => toDate(p.paymentDate) < reportStartDate)
        .reduce((sum, p) => sum + p.amount, 0);

      const arrear = Math.max(0, totalExpectedBefore - totalReceivedBefore);

      const memberStart = startOfMonth(subscriptionStartDate);
      const effectiveMonthsInPeriod = eachMonthOfInterval({
          start: reportStartDate,
          end: reportEndDate
      }).filter(m => m >= memberStart).length;
      
      const subscription = effectiveMonthsInPeriod * subscriptionAmount;

      const receivedThisPeriod = memberPayments
        .filter(p => {
            const pDate = toDate(p.paymentDate);
            return pDate >= reportStartDate && pDate <= reportEndDate;
        })
        .reduce((sum, p) => sum + p.amount, 0);
      
      const totalPayable = subscription + arrear;
      const balance = totalPayable - receivedThisPeriod;
      
      return {
        memberCode: member.membershipCode,
        ein: member.serviceNumber,
        rank: member.rank,
        name: member.name,
        subscription,
        arrear,
        totalPayable,
        received: receivedThisPeriod,
        balance,
      };
    });

    setReportData(data);
    setReportLoading(false);
  };
  
  useEffect(() => {
    if (allMembers.length > 0 && dateRange?.from && dateRange?.to) { 
       generateReport();
    }
  }, [dateRange, selectedUnit, allMembers, allPayments, subscriptionAmount]); 


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

  const reportDateString = dateRange?.from && dateRange.to 
    ? `${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}`
    : 'Selected Period';

  const loading = !allMembers.length || !allUnits.length || reportLoading;

  return (
    <div className="space-y-6">
        <style dangerouslySetInnerHTML={{ __html: `
            @media print {
                @page { size: landscape; margin: 10mm; }
                body { margin: 0; padding: 0; background: white !important; width: 100% !important; }
                .print\\:hidden { display: none !important; }
                
                /* Reset layout constraints */
                main, .flex-1, .flex, .grid, .grid-cols-1, .md\\:grid-cols-2 {
                    display: block !important;
                    width: 100% !important;
                    max-width: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                }

                header, aside { display: none !important; }

                /* Force table to full width */
                .rounded-lg, .border, .overflow-hidden, .overflow-x-auto {
                    overflow: visible !important;
                    border: none !important;
                    width: 100% !important;
                }

                table { 
                    width: 100% !important; 
                    border-collapse: collapse !important; 
                    table-layout: auto !important;
                }

                th, td { 
                    border: 1px solid #e2e8f0 !important; 
                    padding: 8px !important;
                }

                /* Ensure table footer (totals) only shows at the bottom of everything */
                tfoot { display: table-footer-group; }
                
                /* Restore the signature grid specifically */
                .print-signature-grid {
                    display: grid !important;
                    grid-template-columns: repeat(3, 1fr) !important;
                    width: 100% !important;
                    gap: 30px !important;
                    margin-top: 60px !important;
                    border: none !important;
                }
                
                .print-signature-grid div {
                    border: none !important;
                }

                .print-signature-line {
                    border-top: 1px solid black !important;
                    padding-top: 8px !important;
                }
            }
        `}} />
        
        {/* Report Controls - Strictly Hidden in Print */}
        <div className="flex flex-col gap-6 print:hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-headline text-primary">Member Demand Note</h2>
                    <p className="text-muted-foreground">Select a unit and flexible date range to generate demand statements.</p>
                </div>
                <Button onClick={handlePrint} variant="outline" disabled={loading || reportData.length === 0}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Statement
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">1. Select Unit</label>
                        <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Units</SelectItem>
                                {allUnits?.map(unit => (
                                    <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">2. Select Period (Flexible)</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
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
                    </div>
                </CardContent>
            </Card>
        </div>

        {loading ? (
            <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/10">
                <p className="text-muted-foreground animate-pulse font-medium">Generating report for {selectedUnit === 'all' ? 'All Units' : allUnits.find(u => u.id === selectedUnit)?.name}...</p>
            </div>
        ) : (
            <div className="space-y-8">
                <Card className="print:border-none print:shadow-none overflow-hidden">
                    <CardContent className="p-0">
                        {/* Official Report Header - Visible only in print */}
                        <div className="text-center p-8 print:flex hidden flex-col items-center border-b mb-6">
                            <Logo className="w-16 h-16 mb-2" />
                            <h2 className="text-2xl font-bold uppercase text-primary">Manipur Police Risk Fund (Demand Note)</h2>
                            <div className="flex gap-4 text-sm font-medium text-muted-foreground mt-1">
                                <span>Period: {reportDateString}</span>
                                <span>Unit: {allUnits?.find(u => u.id === selectedUnit)?.name || 'All Units'}</span>
                            </div>
                        </div>
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[50px]">Sl. No.</TableHead>
                                    <TableHead>Mem. Code</TableHead>
                                    <TableHead>EIN</TableHead>
                                    <TableHead>Rank</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Subs</TableHead>
                                    <TableHead className="text-right">Arrear</TableHead>
                                    <TableHead className="text-right">Total Payable</TableHead>
                                    <TableHead className="text-right print:hidden">Recv.</TableHead>
                                    <TableHead className="text-right print:hidden">Balance</TableHead>
                                    <TableHead className="hidden print:table-cell w-[120px]">Remark</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.length > 0 ? (
                                    <>
                                        {reportData.map((row, index) => (
                                            <TableRow key={index} className="hover:bg-muted/30">
                                                <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                                                <TableCell className="font-mono text-[10px]">{row.memberCode}</TableCell>
                                                <TableCell className="font-mono text-[10px]">{row.ein}</TableCell>
                                                <TableCell className="text-[10px] uppercase">{row.rank}</TableCell>
                                                <TableCell className="font-medium text-xs">{row.name}</TableCell>
                                                <TableCell className="text-right font-mono text-xs">{row.subscription.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-mono text-xs">{row.arrear.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-bold font-mono text-xs text-primary">{row.totalPayable.toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-green-600 font-mono text-xs print:hidden">{row.received.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-bold font-mono text-xs print:hidden">{row.balance.toFixed(2)}</TableCell>
                                                <TableCell className="hidden print:table-cell border-l"></TableCell>
                                            </TableRow>
                                        ))}
                                        {/* Grand Totals Row - Moved into body to prevent repetition on page breaks */}
                                        <TableRow className="font-bold bg-muted/50 border-t-2">
                                            <TableCell colSpan={5} className="text-right uppercase text-[10px] tracking-widest">Grand Totals</TableCell>
                                            <TableCell className="text-right font-mono">{totals.subscription.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-mono">{totals.arrear.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-mono text-primary">{totals.totalPayable.toFixed(2)}</TableCell>
                                            <TableCell className="text-right print:hidden font-mono">{totals.received.toFixed(2)}</TableCell>
                                            <TableCell className="text-right print:hidden font-mono">{totals.balance.toFixed(2)}</TableCell>
                                            <TableCell className="hidden print:table-cell"></TableCell>
                                        </TableRow>
                                    </>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={11} className="h-32 text-center text-muted-foreground italic">
                                            No active members found for the selected criteria and period.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {!loading && reportData.length > 0 && (
                    <div className="space-y-12">
                        <div className="text-right pr-4 font-bold text-lg">
                            <p className="border-t-2 inline-block pt-2">Rs. {totals.totalPayable.toFixed(2)} (Rupees {numberToWords(Math.round(totals.totalPayable))}) only.</p>
                        </div>
                        
                        {signatures && (
                            <div className="mt-20 px-4 print:mt-32">
                                <div className="grid grid-cols-3 gap-8 print-signature-grid">
                                    {/* Signature 1 */}
                                    <div className="text-center space-y-1">
                                        <div className="print-signature-line min-h-[60px] flex flex-col items-center justify-end">
                                            <p className="font-bold uppercase text-xs">{signatures.sig1?.name || ''}</p>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">{signatures.sig1?.designation}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">{signatures.sig1?.organization}</p>
                                    </div>
                                    {/* Signature 2 */}
                                    <div className="text-center space-y-1">
                                        <div className="print-signature-line min-h-[60px] flex flex-col items-center justify-end">
                                            <p className="font-bold uppercase text-xs">{signatures.sig2?.name || ''}</p>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">{signatures.sig2?.designation}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">{signatures.sig2?.organization}</p>
                                    </div>
                                    {/* Signature 3 */}
                                    <div className="text-center space-y-1">
                                        <div className="print-signature-line min-h-[60px] flex flex-col items-center justify-end">
                                            <p className="font-bold uppercase text-xs">{signatures.sig3?.name || ''}</p>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">{signatures.sig3?.designation}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">{signatures.sig3?.organization}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
    </div>
  );
}
