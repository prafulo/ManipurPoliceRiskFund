'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Member, Unit, Payment, UserRole } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';

type PaymentSelection = {
  [memberId: string]: {
    [month: number]: boolean;
  };
};

export function BulkPaymentForm() {
    const { toast } = useToast();
    const router = useRouter();
    const { data: session } = useSession();

    const [allUnits, setAllUnits] = useState<Unit[]>([]);
    const [allMembers, setAllMembers] = useState<Member[]>([]);
    const [allPayments, setAllPayments] = useState<Payment[]>([]);

    const [selectedUnitId, setSelectedUnitId] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selections, setSelections] = useState<PaymentSelection>({});
    const [subscriptionAmount, setSubscriptionAmount] = useState(100);
    
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const role = session?.user.role as UserRole;

    useEffect(() => {
        async function loadInitialData() {
            setLoading(true);
            try {
                const [unitsRes, membersRes, paymentsRes, settingsRes] = await Promise.all([
                    fetch('/api/units'),
                    fetch('/api/members'),
                    fetch('/api/payments'),
                    fetch('/api/settings'),
                ]);
                const [unitsData, membersData, paymentsData, settingsData] = await Promise.all([
                    unitsRes.json(), membersRes.json(), paymentsRes.json(), settingsRes.json()
                ]);

                setAllUnits(unitsData.units);
                setAllMembers(membersData.members);
                
                const parsedPayments = paymentsData.payments.map((p: any) => ({...p, amount: Number(p.amount)}));
                setAllPayments(parsedPayments);

                const subAmount = settingsData.find((s: any) => s.key === 'subscriptionAmount');
                if (subAmount) setSubscriptionAmount(Number(subAmount.value));
                
                // Pre-select unit for UnitAdmins
                if (role === 'UnitAdmin' && session?.user.unit) {
                    setSelectedUnitId(session.user.unit);
                }

            } catch (error) {
                console.error("Failed to load bulk payment data", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load required data.' });
            } finally {
                setLoading(false);
            }
        }
        loadInitialData();
    }, [toast, role, session?.user.unit]);

    const unitMembers = useMemo(() => {
        if (!selectedUnitId) return [];
        return allMembers.filter(m => m.unitId === selectedUnitId && m.status === 'Opened');
    }, [allMembers, selectedUnitId]);

    const paidMonths = useMemo(() => {
        const paidSet = new Set<string>();
        allPayments.forEach(p => {
            const months = typeof p.months === 'string' ? JSON.parse(p.months) : p.months;
            months.forEach((monthStr: string | Date) => {
                const monthDate = new Date(monthStr);
                if (monthDate.getFullYear() === selectedYear) {
                    paidSet.add(`${p.memberId}-${monthDate.getMonth()}`);
                }
            });
        });
        return paidSet;
    }, [allPayments, selectedYear]);

    const handleSelectAll = (month: number, checked: boolean) => {
        const newSelections = { ...selections };
        unitMembers.forEach(member => {
            const isPaid = paidMonths.has(`${member.id}-${month}`);
            if (!isPaid) {
                if (!newSelections[member.id]) newSelections[member.id] = {};
                newSelections[member.id][month] = checked;
            }
        });
        setSelections(newSelections);
    };

    const handleSelectMonth = (memberId: string, month: number, checked: boolean) => {
        const newSelections = { ...selections };
        if (!newSelections[memberId]) newSelections[memberId] = {};
        newSelections[memberId][month] = checked;
        setSelections(newSelections);
    };

    const totalAmount = useMemo(() => {
        let count = 0;
        Object.values(selections).forEach(memberMonths => {
            count += Object.values(memberMonths).filter(Boolean).length;
        });
        return count * subscriptionAmount;
    }, [selections, subscriptionAmount]);
    
    const months = Array.from({ length: 12 }, (_, i) => i);
    const monthNames = months.map(m => new Date(selectedYear, m).toLocaleString('default', { month: 'short' }));

    async function handleMakePayment() {
        setIsSaving(true);
        const paymentsToCreate: { memberId: string, amount: number, months: Date[], memberName: string }[] = [];

        unitMembers.forEach(member => {
            const memberSelections = selections[member.id];
            if (!memberSelections) return;

            const selectedMonths = Object.entries(memberSelections)
                .filter(([, isSelected]) => isSelected)
                .map(([month]) => new Date(selectedYear, Number(month), 15)); // use 15th to avoid timezone issues
            
            if (selectedMonths.length > 0) {
                paymentsToCreate.push({
                    memberId: member.id,
                    amount: selectedMonths.length * subscriptionAmount,
                    months: selectedMonths,
                    memberName: member.name
                });
            }
        });

        if (paymentsToCreate.length === 0) {
            toast({ title: "No payments selected", description: "Please select at least one month for a member." });
            setIsSaving(false);
            return;
        }

        try {
            const res = await fetch('/api/payments/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentsToCreate)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to save payments.');
            }

            toast({ title: 'Payments Saved', description: `${paymentsToCreate.length} payment records have been created successfully.`});
            
            // Re-fetch payments to update the UI state instantly
            const paymentsRes = await fetch('/api/payments');
            if (paymentsRes.ok) {
                const paymentsData = await paymentsRes.json();
                const parsedPayments = paymentsData.payments.map((p: any) => ({...p, amount: Number(p.amount)}));
                setAllPayments(parsedPayments);
            }
            
            // Reset selections after successful payment
            setSelections({});
            router.refresh();

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSaving(false);
        }
    }


    if (loading) {
        return (
             <Card className="shadow-lg">
                <CardContent className="p-6 md:p-8 space-y-4">
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                    <Skeleton className="h-96 w-full" />
                </CardContent>
                <CardFooter className="flex justify-end pt-4 border-t p-6">
                    <Skeleton className="h-10 w-36" />
                </CardFooter>
            </Card>
        )
    }

  return (
    <Card className="shadow-lg">
        <CardContent className="p-0">
            <div className="p-4 flex flex-col sm:flex-row gap-4 md:items-end justify-between">
                <div className="flex gap-4 items-end">
                    <div className="w-full sm:w-64">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="unit-select">Select Unit</label>
                        <Select value={selectedUnitId} onValueChange={setSelectedUnitId} disabled={role === 'UnitAdmin'}>
                            <SelectTrigger id="unit-select">
                                <SelectValue placeholder="Select a Unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {allUnits.map(unit => (
                                    <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex items-center bg-background rounded-md border px-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedYear(y => y - 1)}><ChevronLeft className="h-5 w-5"/></Button>
                        <span className="mx-2 font-semibold text-lg tabular-nums">{selectedYear}</span>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedYear(y => y + 1)}><ChevronRight className="h-5 w-5"/></Button>
                    </div>
                </div>
            </div>
            
            <div className="border-t overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                        <TableRow>
                            <TableHead className="sticky left-0 bg-muted/50 z-20 pl-2 pr-1 w-12">#</TableHead>
                            <TableHead className="sticky left-12 bg-muted/50 z-20 min-w-[150px]">Name</TableHead>
                            <TableHead>Rank</TableHead>
                            {monthNames.map((name, i) => (
                                <TableHead key={i} className="text-center p-1.5">
                                    <div className="flex flex-col items-center gap-2">
                                        <span>{name}</span>
                                        <Checkbox
                                            onCheckedChange={(checked) => handleSelectAll(i, checked as boolean)}
                                            title={`Select all for ${name}`}
                                        />
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="sticky right-0 bg-muted/50 z-20 text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {unitMembers.length > 0 ? unitMembers.map((member, idx) => {
                             const memberSelections = selections[member.id] || {};
                             const rowTotal = Object.keys(memberSelections).reduce((acc, month) => {
                                 return memberSelections[parseInt(month)] ? acc + subscriptionAmount : acc;
                             }, 0);

                            return (
                            <TableRow key={member.id}>
                                <TableCell className="sticky left-0 bg-background z-10 pl-2 pr-1">{idx + 1}</TableCell>
                                <TableCell className="sticky left-12 bg-background z-10 font-medium">{member.name}</TableCell>
                                <TableCell>{member.rank}</TableCell>
                                {months.map(month => {
                                    const isPaid = paidMonths.has(`${member.id}-${month}`);
                                    const isSelected = !!selections[member.id]?.[month];
                                    return (
                                        <TableCell key={month} className="text-center p-1.5">
                                            <Checkbox
                                                checked={isPaid || isSelected}
                                                disabled={isPaid}
                                                onCheckedChange={(checked) => handleSelectMonth(member.id, month, checked as boolean)}
                                            />
                                        </TableCell>
                                    );
                                })}
                                <TableCell className="sticky right-0 bg-background z-10 text-right font-bold">Rs. {rowTotal.toFixed(2)}</TableCell>
                            </TableRow>
                        )}) : (
                            <TableRow>
                                <TableCell colSpan={15} className="h-24 text-center">
                                    {selectedUnitId ? 'No members found in this unit.' : 'Please select a unit to see members.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
        <CardFooter className="bg-muted/50 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
            <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{unitMembers.length}</span> members
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold text-primary">Rs. {totalAmount.toFixed(2)}</p>
                </div>
                <Button onClick={handleMakePayment} disabled={isSaving || totalAmount === 0}>
                    {isSaving ? 'Saving...' : <><FileSpreadsheet className="mr-2"/> Make Payment</>}
                </Button>
            </div>
        </CardFooter>
    </Card>
  )
}
