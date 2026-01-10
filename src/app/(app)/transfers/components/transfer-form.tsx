'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowRightLeft } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Member, units as Unit, Transfer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';


const formSchema = z.object({
  memberId: z.string({ required_error: "Please select a member." }),
  toUnitId: z.string({ required_error: "Please select the destination unit." }),
  transferDate: z.date({ required_error: "Please select a transfer date."}),
}).refine(data => {
    // This custom validation can be more complex if needed
    return data.memberId && data.toUnitId;
}, {
    message: "A member and destination unit must be selected.",
    path: ["toUnitId"],
});

type TransferFormProps = {
};

export function TransferForm({}: TransferFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedMemberId = searchParams.get('memberId');
  
  const [members, setMembers] = useState<Member[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        try {
            const [membersRes, unitsRes] = await Promise.all([
                fetch('/api/members'),
                fetch('/api/units')
            ]);
            const [membersData, unitsData] = await Promise.all([
                membersRes.json(),
                unitsRes.json()
            ]);
            setMembers(membersData.members);
            setUnits(unitsData.units);
        } catch (error) {
            console.error("Failed to load data for transfer form", error);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: preselectedMemberId || '',
      toUnitId: '',
      transferDate: new Date(),
    },
  });

  useEffect(() => {
    if (preselectedMemberId) {
      form.setValue('memberId', preselectedMemberId);
    }
  }, [preselectedMemberId, form]);

  const selectedMemberId = form.watch('memberId');
  const selectedMember = members?.find(m => m.id === selectedMemberId);
  const fromUnit = units?.find(u => u.id === selectedMember?.unitId);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedMember || !fromUnit) {
        toast({ variant: 'destructive', title: 'Error', description: 'Selected member or original unit not found.' });
        return;
    }

    const payload = {
        ...values,
        fromUnitId: fromUnit.id,
        memberName: selectedMember.name,
    };

    try {
        const res = await fetch('/api/transfers/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to process transfer.');
        }
        
        toast({ title: 'Transfer Processed', description: `${selectedMember.name} has been transferred.` });
        router.push('/transfers');
        router.refresh();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  }
  
  if (loading) {
      return <div>Loading form...</div>
  }

  return (
    <Card className="shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Member</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a member to transfer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members?.filter(m => m.status === 'Opened').map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} ({member.membershipCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {selectedMember && fromUnit && (
                <div className="p-3 bg-muted/50 rounded-lg border space-y-1">
                  <p className="text-sm font-medium">Current Unit</p>
                  <p className="text-base font-semibold text-primary">{fromUnit.name}</p>
                </div>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <FormField
                    control={form.control}
                    name="toUnitId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>To Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedMember}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select destination unit" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {units?.filter(u => u.id !== fromUnit?.id).map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>
                                {unit.name}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField control={form.control} name="transferDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Date of Transfer</FormLabel>
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
            </div>
            
          </CardContent>
          <CardFooter className="flex justify-end pt-4 border-t p-6">
            <Button type="submit">
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Process Transfer
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
