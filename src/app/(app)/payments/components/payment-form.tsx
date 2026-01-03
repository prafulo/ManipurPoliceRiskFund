
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, addMonths, startOfMonth, eachMonthOfInterval, endOfMonth } from 'date-fns';
import type { Member, Unit, Payment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';

const formSchema = z.object({
  memberId: z.string({ required_error: "Please select a member." }),
  monthRange: z.object({
      from: z.date({ required_error: "Please select a start month."}),
      to: z.date({ required_error: "Please select an end month."})
  }),
});

type PaymentFormProps = {
  members: Member[];
  units: Unit[];
};

const MONTHLY_SUBSCRIPTION_AMOUNT = 100; // This should come from settings

function addPaymentToLocalStorage(payment: Payment) {
    const existingPaymentsString = localStorage.getItem('payments');
    const existingPayments = existingPaymentsString ? JSON.parse(existingPaymentsString) : [];
    existingPayments.push(payment);
    localStorage.setItem('payments', JSON.stringify(existingPayments));
}

export function PaymentForm({ members, units }: PaymentFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedMemberId = searchParams.get('memberId');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: preselectedMemberId || '',
      monthRange: {
        from: startOfMonth(new Date()),
        to: startOfMonth(new Date()),
      }
    },
  });

  useEffect(() => {
    if(preselectedMemberId) {
        form.setValue('memberId', preselectedMemberId);
    }
  }, [preselectedMemberId, form]);

  const monthRange = form.watch('monthRange');
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [totalAmount, setTotalAmount] = useState(MONTHLY_SUBSCRIPTION_AMOUNT);

  useEffect(() => {
      if(monthRange?.from && monthRange?.to) {
          const months = eachMonthOfInterval({
              start: monthRange.from,
              end: monthRange.to
          });
          setNumberOfMonths(months.length);
          setTotalAmount(months.length * MONTHLY_SUBSCRIPTION_AMOUNT);
      }
  }, [monthRange]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const member = members.find(m => m.id === values.memberId);
    if (!member || !values.monthRange.from || !values.monthRange.to) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please select a member and a valid date range.",
        });
        return;
    }

    const newPayment: Payment = {
        id: new Date().getTime().toString(), // Unique ID
        memberId: member.id,
        memberName: member.name,
        membershipCode: member.membershipCode,
        unitName: units.find(u => u.id === member.unitId)?.name || 'N/A',
        amount: totalAmount,
        months: eachMonthOfInterval({ start: values.monthRange.from, end: values.monthRange.to }),
        paymentDate: new Date(),
    };

    addPaymentToLocalStorage(newPayment);

    toast({
      title: "Payment Recorded",
      description: `Payment of $${totalAmount} for ${member?.name} has been saved.`,
    });
    router.push('/payments');
  }

  const selectedMemberId = form.watch('memberId');
  const selectedMember = members.find(m => m.id === selectedMemberId);

  return (
    <Card className="shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                          <SelectValue placeholder="Select a member to pay for" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.filter(m => m.status === 'Opened').map(member => (
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
               {selectedMember && (
                <div className="p-3 bg-muted/50 rounded-lg border space-y-1">
                  <p className="text-sm font-medium">Member Details</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">{selectedMember.name}</span>, {units.find(u=>u.id === selectedMember.unitId)?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">Code: {selectedMember.membershipCode}</p>
                </div>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <FormField
                    control={form.control}
                    name="monthRange"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Select Month(s)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value.from && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value?.from ? (
                                    field.value.to ? (
                                    <>
                                        {format(field.value.from, "MMM yyyy")} -{" "}
                                        {format(field.value.to, "MMM yyyy")}
                                    </>
                                    ) : (
                                    format(field.value.from, "MMM yyyy")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                defaultMonth={field.value.from}
                                selected={field.value as DateRange}
                                onSelect={field.onChange}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                        <FormDescription>
                            Select the start and end month for the subscription payment.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="p-4 bg-muted/50 rounded-lg border space-y-2">
                    <h4 className="font-medium text-lg">Payment Summary</h4>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Monthly Rate:</span>
                        <span className="font-semibold">${MONTHLY_SUBSCRIPTION_AMOUNT.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Months Selected:</span>
                        <span className="font-semibold">{numberOfMonths}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl pt-2 border-t mt-2">
                        <span className="font-bold">Total Amount:</span>
                        <span className="font-bold text-primary">${totalAmount.toFixed(2)}</span>
                    </div>
                 </div>
            </div>
            
          </CardContent>
          <CardFooter className="flex justify-end pt-4 border-t p-6">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Payment
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
