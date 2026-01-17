'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle, Info, Lock, ArchiveRestore } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Member, Unit, Payment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  unitId: z.string().optional(), // Not required for submission, just for filtering
  memberId: z.string({ required_error: "Please select a member." }),
  releaseDate: z.date({ required_error: "Please select a release date."}),
  notes: z.string().optional(),
});

export function ReleaseForm() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    async function loadData() {
        try {
            const [unitsRes, membersRes, paymentsRes] = await Promise.all([
                fetch('/api/units'),
                fetch('/api/members'),
                fetch('/api/payments')
            ]);
            const [unitsData, membersData, paymentsData] = await Promise.all([
                unitsRes.json(), membersRes.json(), paymentsRes.json()
            ]);
            setUnits(unitsData.units);
            setAllMembers(membersData.members);
            setAllPayments(paymentsData.payments.map((p: any) => ({...p, amount: Number(p.amount)})));
        } catch (error) {
            console.error("Failed to load data for release form", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load required data.' });
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: '',
      releaseDate: new Date(),
      notes: '',
    },
  });

  const selectedUnitId = form.watch('unitId');
  const selectedMemberId = form.watch('memberId');

  const eligibleMembers = useMemo(() => {
      const filteredByEligibility = allMembers.filter(m => 
        m.status === 'Closed' && 
        m.closureReason === 'Retirement' &&
        !m.releaseDate // Filter out members who already have a release date
      );
      if (!selectedUnitId) return filteredByEligibility;
      return filteredByEligibility.filter(m => m.unitId === selectedUnitId);
  }, [allMembers, selectedUnitId]);
  
  const selectedMember = useMemo(() => {
    return allMembers.find(m => m.id === selectedMemberId);
  }, [allMembers, selectedMemberId]);

  useEffect(() => {
    if (selectedMemberId && allPayments.length > 0) {
        const memberPayments = allPayments.filter(p => p.memberId === selectedMemberId);
        const total = memberPayments.reduce((sum, p) => sum + p.amount, 0);
        setTotalAmount(total);
    } else {
        setTotalAmount(0);
    }
  }, [selectedMemberId, allPayments]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (totalAmount <= 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Cannot release a zero or negative amount.'});
        return;
    }
    
    const payload = { ...values, amount: totalAmount };
    
    try {
        const res = await fetch('/api/subscription-releases/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Something went wrong');
        }

        toast({
            title: "Release Processed",
            description: `Payment release for ${selectedMember?.name} has been recorded.`
        });
        router.push('/subscription-release');
        router.refresh();

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Processing Release",
            description: error.message,
        });
    }
  }

  if (loading) {
    return (
        <Card className="shadow-lg max-w-lg mx-auto">
            <CardHeader className="bg-primary text-primary-foreground p-6">
                 <Skeleton className="h-8 w-3/4 bg-primary/50" />
                 <Skeleton className="h-4 w-1/2 bg-primary/50" />
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter className="p-8">
                 <Skeleton className="h-12 w-full" />
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="shadow-xl max-w-lg mx-auto">
        <CardHeader className="bg-primary p-6">
            <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                <ArchiveRestore />
                Release Payment Details
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 pt-1">
                Process member subscription payout for retired members.
            </CardDescription>
        </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-8 space-y-6">
            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filter by Unit (Optional)</FormLabel>
                  <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('memberId', ''); // Reset member selection when unit changes
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter members by unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Filter the member list by their last assigned unit.</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Retired Member</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a retired member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eligibleMembers.length > 0 ? eligibleMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.membershipCode})
                        </SelectItem>
                      )) : <p className="p-4 text-sm text-muted-foreground">No eligible members found.</p>}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedMember && (
                <div className="space-y-4 pt-2">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-slate-700">
                        <Info className="text-blue-600 dark:text-blue-400 h-5 w-5 mt-0.5" />
                        <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            Superannuation Date
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Retired on {selectedMember.dateOfDischarge ? format(new Date(selectedMember.dateOfDischarge), 'PPP') : 'N/A'}
                        </p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="total-amount">Total Amount to be released</Label>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">₹</span>
                            <Input 
                                id="total-amount"
                                readOnly
                                value={totalAmount.toFixed(2)}
                                className="pl-8 font-bold text-lg bg-muted/50 cursor-not-allowed"
                            />
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                        </div>
                         <FormDescription>This amount is auto-calculated from all past subscriptions.</FormDescription>
                    </div>
                </div>
            )}

            <FormField
              control={form.control}
              name="releaseDate"
              render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Amount Released Date</FormLabel>
                    <Popover>
                    <PopoverTrigger asChild><FormControl>
                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl></PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any additional notes here..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="p-8 pt-2">
            <Button type="submit" className="w-full" size="lg" disabled={!selectedMember || totalAmount <= 0}>
              <CheckCircle className="mr-2 h-5 w-5" />
              Release Payment
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
