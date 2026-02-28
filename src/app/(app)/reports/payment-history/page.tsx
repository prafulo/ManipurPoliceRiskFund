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
                @page { 
                    size: landscape; 
                    margin: 10mm; 
                }
                
                /* Strictly hide all layout, navigation, and profile elements */
                header, aside, nav, footer, .print\\:hidden, 
                [data-sidebar], [data-mobile], 
                .flex-col.gap-6, .mb-6, [role="menu"], [role="menubar"] { 
                    display: none !important; 
                }

                /* Force 100% width on all potential containers */
                body, html, main, .flex-1, #__next, .grid, .flex, div, 
                .container, .mx-auto, [class*="max-w-"] {
                    width: 100% !important;
                    max-width: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                    overflow: visible !important;
                    display: block !important;
                }

                /* Official Header Setup */
                .official-print-header {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 100% !important;
                    margin-bottom: 30px !important;
                    text-align: center !important;
                }

                /* Borderless Table Reset */
                table { 
                    width: 100% !important; 
                    border-collapse: collapse !important; 
                    border: none !important;
                    margin: 0 !important;
                }

                th, td { 
                    border: none !important; 
                    padding: 8px 4px !important;
                    font-size: 9pt !important;
                    text-align: left;
                }

                th {
                    font-weight: bold !important;
                    color: #000 !important;
                }

                /* Triple Signature Section in Single Row */
                .print-signature-grid {
                    display: grid !important;
                    grid-template-columns: repeat(3, 1fr) !important;
                    width: 100% !important;
                    gap: 40px !important;
                    margin-top: 60px !important;
                    border: none !important;
                }
                
                .print-signature-line {
                    border-top: 1px solid black !important;
                    padding-top: 5px !important;
                    width: 80% !important;
                    margin: 0 auto !important;
                }

                .grand-total-row {
                    font-weight: bold !important;
                    border-top: 1.5px solid #000 !important;
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
                <p className="text-muted-foreground animate-pulse font-medium">Generating report...</p>
            </div>
        ) : (
            <div className="space-y-8 w-full">
                <Card className="print:border-none print:shadow-none overflow-hidden w-full">
                    <CardContent className="p-0 w-full">
                        {/* Official Report Header - Absolute top in print */}
                        <div className="official-print-header hidden print:flex">
                            <Logo className="w-20 h-20 mb-2" />
                            <h2 className="text-2xl font-bold uppercase text-primary">Manipur Police Risk Fund (Demand Note)</h2>
                            <div className="flex gap-6 text-sm font-bold text-muted-foreground mt-1">
                                <span>Period: {reportDateString}</span>
                                <span>Unit: {allUnits?.find(u => u.id === selectedUnit)?.name || 'All Units'}</span>
                            </div>
                        </div>
                        
                        <Table className="w-full border-none">
                            <TableHeader className="bg-muted/50 print:bg-transparent">
                                <TableRow className="border-none">
                                    <TableHead className="w-[50px] border-none">Sl. No.</TableHead>
                                    <TableHead className="border-none">Mem. Code</TableHead>
                                    <TableHead className="border-none">EIN</TableHead>
                                    <TableHead className="border-none">Rank</TableHead>
                                    <TableHead className="border-none">Name</TableHead>
                                    <TableHead className="text-right border-none">Subs</TableHead>
                                    <TableHead className="text-right border-none">Arrear</TableHead>
                                    <TableHead className="text-right border-none">Total Payable</TableHead>
                                    <TableHead className="text-right print:hidden border-none">Recv.</TableHead>
                                    <TableHead className="text-right print:hidden border-none">Balance</TableHead>
                                    <TableHead className="hidden print:table-cell w-[120px] border-none">Remark</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="border-none">
                                {reportData.length > 0 ? (
                                    <>
                                        {reportData.map((row, index) => (
                                            <TableRow key={index} className="hover:bg-muted/30 border-none">
                                                <TableCell className="text-xs text-muted-foreground border-none">{index + 1}</TableCell>
                                                <TableCell className="font-mono text-[10px] border-none">{row.memberCode}</TableCell>
                                                <TableCell className="font-mono text-[10px] border-none">{row.ein}</TableCell>
                                                <TableCell className="text-[10px] uppercase border-none">{row.rank}</TableCell>
                                                <TableCell className="font-medium text-xs border-none">{row.name}</TableCell>
                                                <TableCell className="text-right font-mono text-xs border-none">{row.subscription.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-mono text-xs border-none">{row.arrear.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-bold font-mono text-xs text-primary print:text-black border-none">{row.totalPayable.toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-green-600 font-mono text-xs print:hidden border-none">{row.received.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-bold font-mono text-xs print:hidden border-none">{row.balance.toFixed(2)}</TableCell>
                                                <TableCell className="hidden print:table-cell border-none"></TableCell>
                                            </TableRow>
                                        ))}
                                        {/* Grand Totals Row */}
                                        <TableRow className="font-bold bg-muted/50 print:bg-transparent border-t-2 border-black grand-total-row">
                                            <TableCell colSpan={5} className="text-right uppercase text-[10px] tracking-widest border-none">Grand Totals</TableCell>
                                            <TableCell className="text-right font-mono border-none">{totals.subscription.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-mono border-none">{totals.arrear.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-mono border-none">{totals.totalPayable.toFixed(2)}</TableCell>
                                            <TableCell className="text-right print:hidden font-mono border-none">{totals.received.toFixed(2)}</TableCell>
                                            <TableCell className="text-right print:hidden font-mono border-none">{totals.balance.toFixed(2)}</TableCell>
                                            <TableCell className="hidden print:table-cell border-none"></TableCell>
                                        </TableRow>
                                    </>
                                ) : (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={11} className="h-32 text-center text-muted-foreground italic border-none">
                                            No active members found for the selected criteria and period.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {!loading && reportData.length > 0 && (
                    <div className="space-y-12 w-full">
                        <div className="text-right pr-4 font-bold text-lg w-full">
                            <p className="border-t-2 border-black inline-block pt-2">Rs. {totals.totalPayable.toFixed(2)} (Rupees {numberToWords(Math.round(totals.totalPayable))}) only.</p>
                        </div>
                        
                        {signatures && (
                            <div className="mt-16 px-4 w-full">
                                <div className="grid grid-cols-3 gap-8 print-signature-grid">
                                    {/* Signature 1 */}
                                    <div className="text-center space-y-1">
                                        <div className="print-signature-line min-h-[50px] flex flex-col items-center justify-end">
                                            <p className="font-bold uppercase text-xs">{signatures.sig1?.name || ''}</p>
                                        </div>
                                        <p className="text-[9px] text-muted-foreground uppercase font-bold">{signatures.sig1?.designation}</p>
                                        <p className="text-[9px] text-muted-foreground uppercase font-bold">{signatures.sig1?.organization}</p>
                                    </div>
                                    {/* Signature 2 */}
                                    <div className="text-center space-y-1">
                                        <div className="print-signature-line min-h-[50px] flex flex-col items-center justify-end">
                                            <p className="font-bold uppercase text-xs">{signatures.sig2?.name || ''}</p>
                                        </div>
                                        <p className="text-[9px] text-muted-foreground uppercase font-bold">{signatures.sig2?.designation}</p>
                                        <p className="text-[9px] text-muted-foreground uppercase font-bold">{signatures.sig2?.organization}</p>
                                    </div>
                                    {/* Signature 3 */}
                                    <div className="text-center space-y-1">
                                        <div className="print-signature-line min-h-[50px] flex flex-col items-center justify-end">
                                            <p className="font-bold uppercase text-xs">{signatures.sig3?.name || ''}</p>
                                        </div>
                                        <p className="text-[9px] text-muted-foreground uppercase font-bold">{signatures.sig3?.designation}</p>
                                        <p className="text-[9px] text-muted-foreground uppercase font-bold">{signatures.sig3?.organization}</p>
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
