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
import { CalendarIcon, ArrowRightLeft, ChevronsUpDown, Check } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Member, Unit } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';


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

  // For searchable member select
  const [openMemberSelect, setOpenMemberSelect] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

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

  const filteredMembers = members.filter(member => 
    member.status === 'Opened' && 
    (member.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
     member.membershipCode.toLowerCase().includes(memberSearch.toLowerCase()) ||
     member.serviceNumber.toLowerCase().includes(memberSearch.toLowerCase()))
  );


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
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Member</FormLabel>
                    <Popover open={openMemberSelect} onOpenChange={(isOpen) => {
                      setOpenMemberSelect(isOpen);
                      if (!isOpen) {
                        setMemberSearch("");
                      }
                    }}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openMemberSelect}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? members.find(
                                  (member) => member.id === field.value
                                )?.name
                              : "Select a member to transfer"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <div className="p-2 border-b">
                            <Input 
                              placeholder="Search by name, code or EIN..."
                              className="h-9"
                              value={memberSearch}
                              onChange={(e) => setMemberSearch(e.target.value)}
                            />
                          </div>
                          <ScrollArea className="h-72">
                            {filteredMembers.length > 0 ? filteredMembers.map((member) => (
                                <div
                                  key={member.id}
                                  onClick={() => {
                                    form.setValue("memberId", member.id === field.value ? "" : member.id);
                                    setOpenMemberSelect(false);
                                    setMemberSearch("");
                                  }}
                                  className="text-sm p-2 flex items-center hover:bg-accent cursor-pointer"
                                >
                                   <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      member.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div>
                                    <div>{member.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {member.membershipCode} • EIN: {member.serviceNumber}
                                    </div>
                                  </div>
                                </div>
                              )) : (
                                <div className="p-2 text-center text-sm text-muted-foreground">
                                    No member found.
                                </div>
                              )
                            }
                          </ScrollArea>
                      </PopoverContent>
                    </Popover>
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
                              {field.value ? format(field.value, "MM/dd/yyyy") : <span>Pick a date</span>}
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
