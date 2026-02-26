'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import type { Member, Unit, Payment, Signature } from '@/lib/types';
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
import { CalendarIcon, Printer, Search, Check, ChevronsUpDown, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Logo } from '@/components/logo';

export default function IndividualPaymentHistoryPage() {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [signature, setSignature] = useState<Signature | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });

  const [openMemberSelect, setOpenMemberSelect] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  useEffect(() => {
    async function loadData() {
        try {
            const [membersRes, paymentsRes, unitsRes, signatureRes] = await Promise.all([
                fetch('/api/members?all=true'),
                fetch('/api/payments?all=true'),
                fetch('/api/units'),
                fetch('/api/signature'),
            ]);
            const [membersData, paymentsData, unitsData, signatureData] = await Promise.all([
                membersRes.json(),
                paymentsRes.json(),
                unitsRes.json(),
                signatureRes.json(),
            ]);
            setAllMembers(membersData.members || []);
            setAllPayments(paymentsData.payments || []);
            setAllUnits(unitsData.units || []);
            setSignature(signatureData);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setIsLoading(false);
        }
    }
    loadData();
  }, []);

  const selectedMember = useMemo(() => 
    allMembers.find(m => m.id === selectedMemberId), 
    [allMembers, selectedMemberId]
  );

  const filteredMembers = useMemo(() => 
    allMembers.filter(member => 
      member.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
      member.membershipCode.toLowerCase().includes(memberSearch.toLowerCase())
    ),
    [allMembers, memberSearch]
  );

  const reportData = useMemo(() => {
    if (!selectedMemberId || !dateRange?.from || !dateRange.to) return [];

    const start = startOfDay(dateRange.from);
    const end = endOfDay(dateRange.to);

    return allPayments
      .filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return p.memberId === selectedMemberId && isWithinInterval(paymentDate, { start, end });
      })
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
  }, [selectedMemberId, dateRange, allPayments]);

  const totalAmount = useMemo(() => 
    reportData.reduce((sum, p) => sum + Number(p.amount), 0),
    [reportData]
  );

  const formatMonths = (months: any) => {
    let monthArray: any[];
    if(typeof months === 'string') {
        try { monthArray = JSON.parse(months); } catch { return 'N/A'; }
    } else { monthArray = months; }
    return monthArray.map((m: any) => format(new Date(m), 'MMM yyyy')).join(', ');
  }

  const handlePrint = () => {
    window.print();
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading member data...</div>;
  }

  return (
    <div className="space-y-6">
        {/* Controls - Hidden during print */}
        <div className="flex flex-col gap-6 print:hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-headline text-primary">Individual Payment Statement</h2>
                    <p className="text-muted-foreground">Generate a detailed subscription report for a specific member.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handlePrint} variant="outline" disabled={!selectedMemberId || reportData.length === 0}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Statement
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">1. Select Member</label>
                        <Popover open={openMemberSelect} onOpenChange={setOpenMemberSelect}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between font-normal"
                                >
                                    {selectedMemberId
                                        ? allMembers.find(m => m.id === selectedMemberId)?.name
                                        : "Search for a member..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                <div className="p-2 border-b">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Name or Code..." 
                                            className="pl-8 h-9" 
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <ScrollArea className="h-64">
                                    {filteredMembers.length > 0 ? (
                                        filteredMembers.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent transition-colors"
                                                onClick={() => {
                                                    setSelectedMemberId(member.id);
                                                    setOpenMemberSelect(false);
                                                }}
                                            >
                                                <Check className={cn("h-4 w-4", selectedMemberId === member.id ? "opacity-100" : "opacity-0")} />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{member.name}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{member.membershipCode}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-xs text-muted-foreground">No members found.</div>
                                    )}
                                </ScrollArea>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">2. Select Period</label>
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

        {/* Report Content */}
        {!selectedMemberId ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-lg border border-dashed print:hidden">
                <User className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground font-medium">Please select a member above to view their statement.</p>
            </div>
        ) : (
            <Card className="print:shadow-none print:border-none">
                <CardContent className="p-8 md:p-12 space-y-8">
                    {/* Header - Shown in print, styled for report */}
                    <div className="flex flex-col md:row-row items-center justify-between gap-6 border-b pb-8">
                        <div className="flex items-center gap-4">
                            <Logo className="w-16 h-16" />
                            <div>
                                <h1 className="text-2xl font-bold font-headline text-primary">Manipur Police Risk Fund</h1>
                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Individual Subscription Statement</p>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-2">
                                Official Record
                            </div>
                            <p className="text-xs font-mono text-muted-foreground">Generated on: {format(new Date(), 'PP p')}</p>
                        </div>
                    </div>

                    {/* Member Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-muted/30 p-6 rounded-lg border">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Member Name</p>
                            <p className="font-bold text-lg">{selectedMember?.name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Membership Code</p>
                            <p className="font-mono font-semibold text-primary">{selectedMember?.membershipCode}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rank / EIN</p>
                            <p className="font-medium">{selectedMember?.rank} ({selectedMember?.serviceNumber})</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Unit / District</p>
                            <p className="font-medium">{allUnits.find(u => u.id === selectedMember?.unitId)?.name || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-l-4 border-primary pl-3">
                            Payment Details {dateRange?.from && `(${format(dateRange.from, 'PP')} - ${format(dateRange.to || new Date(), 'PP')})`}
                        </h3>
                        
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[60px]">Sl. No.</TableHead>
                                        <TableHead>Payment Date</TableHead>
                                        <TableHead>Subscription Period (Months)</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.length > 0 ? (
                                        reportData.map((p, index) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                                                <TableCell className="font-medium">{format(new Date(p.paymentDate), 'PP')}</TableCell>
                                                <TableCell className="text-xs uppercase tracking-tight text-muted-foreground">
                                                    {formatMonths(p.months)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {Number(p.amount).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                                No subscription records found for the selected period.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter className="bg-muted/30">
                                    <TableRow className="font-bold">
                                        <TableCell colSpan={3} className="text-right uppercase text-[10px] tracking-widest">Grand Total Received</TableCell>
                                        <TableCell className="text-right text-lg text-primary">{totalAmount.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="text-[10px] text-muted-foreground leading-relaxed italic border-t pt-4">
                        * This statement provides a detailed log of subscription payments recorded in the Manipur Police Risk Fund Management System. 
                        Payments are validated and matched based on the individual Employee Identification Number (EIN) and Membership Code.
                    </div>

                    {/* Authority Signature */}
                    {signature && (
                        <div className="pt-16 flex justify-end">
                            <div className="text-center space-y-1 w-64 border-t-2 border-muted pt-2">
                                <p className="font-bold text-sm uppercase">{signature.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{signature.designation}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{signature.organization}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
    </div>
  );
}
