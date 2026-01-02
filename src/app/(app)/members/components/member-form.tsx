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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { units } from '@/lib/data';
import type { Member } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  fatherName: z.string().min(2, "Father's name must be at least 2 characters."),
  rank: z.string().min(1, "Rank is required."),
  trade: z.string().min(1, "Trade is required."),
  serviceNumber: z.string().min(1, "Service number is required."),
  dateOfBirth: z.date({ required_error: "Date of birth is required." }),
  dateOfEnrolment: z.date({ required_error: "Date of enrolment is required." }),
  address: z.string().min(5, "Address is required."),
  phone: z.string().min(10, "A valid phone number is required."),
  unitId: z.string({ required_error: "Unit is required." }),
  status: z.enum(["Opened", "Closed"]),
  isDoubling: z.boolean().default(false),
  nomineeName: z.string().min(2, "Nominee name is required."),
  nomineeRelation: z.string().min(2, "Nominee relation is required."),
  closureReason: z.enum(["", "Retirement", "Death", "Doubling", "Expelled"]),
}).refine(data => {
  if (data.status === 'Closed') {
    return data.closureReason !== "";
  }
  return true;
}, {
  message: "Reason for closure is required when status is 'Closed'.",
  path: ["closureReason"],
});


type MemberFormProps = {
  member?: Member;
};

export function MemberForm({ member }: MemberFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  // In a real app, the unique number would come from a database sequence.
  // We simulate it here for demonstration.
  const newMemberCode = `1MR-${31004 + Math.floor(Math.random() * 100)}-${format(new Date(), 'MMdd')}`;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: member?.name ?? '',
      fatherName: member?.fatherName ?? '',
      rank: member?.rank ?? '',
      trade: member?.trade ?? '',
      serviceNumber: member?.serviceNumber ?? '',
      dateOfBirth: member?.dateOfBirth,
      dateOfEnrolment: member?.dateOfEnrolment,
      address: member?.address ?? '',
      phone: member?.phone ?? '',
      unitId: member?.unitId ?? '',
      status: member?.status ?? 'Opened',
      isDoubling: member?.isDoubling ?? false,
      nomineeName: member?.nominee.name ?? '',
      nomineeRelation: member?.nominee.relation ?? '',
      closureReason: member?.closureReason ?? '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: member ? "Member Updated" : "Member Created",
      description: `Profile for ${values.name} has been saved successfully.`,
    });
    router.push('/members');
    console.log(values);
  }

  const status = form.watch("status");

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8 items-start">
              <FormField name="name" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField name="fatherName" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father's Name</FormLabel>
                    <FormControl><Input placeholder="Richard Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="p-3 bg-muted/50 rounded-lg border">
                <FormLabel>Membership Code</FormLabel>
                <p className="text-lg font-mono font-semibold pt-2 text-primary">{member?.membershipCode ?? newMemberCode}</p>
                <FormDescription>Auto-generated on creation.</FormDescription>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FormField name="rank" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Rank</FormLabel><FormControl><Input placeholder="Sergeant" {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
              <FormField name="trade" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Trade</FormLabel><FormControl><Input placeholder="Infantry" {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
              <FormField name="serviceNumber" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Service No.</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild><FormControl>
                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus/>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="dateOfEnrolment" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Date of Enrolment</FormLabel>
                       <Popover>
                        <PopoverTrigger asChild><FormControl>
                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus/>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                <FormField name="address" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Main St..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />
                <FormField name="phone" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="555-123-4567" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />
            </div>

            <Separator className="my-8" />

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-medium font-headline">Membership Details</h3>
                <FormField control={form.control} name="unitId" render={({ field }) => (
                    <FormItem><FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a unit" /></SelectTrigger></FormControl>
                        <SelectContent>{units.map(unit => (<SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>))}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Membership Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Opened">Opened</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {status === 'Closed' && (
                  <FormField control={form.control} name="closureReason" render={({ field }) => (
                      <FormItem><FormLabel>Reason for Closure</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Retirement">Retirement</SelectItem>
                            <SelectItem value="Death">Death</SelectItem>
                            <SelectItem value="Doubling">Doubling</SelectItem>
                            <SelectItem value="Expelled">Expelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField control={form.control} name="isDoubling" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Membership Doubling</FormLabel>
                        <FormDescription>If checked, this member will not appear in lists or reports.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-6">
                <h3 className="text-lg font-medium font-headline">Nominee Details</h3>
                <FormField control={form.control} name="nomineeName" render={({ field }) => (
                    <FormItem><FormLabel>Nominee Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />
                <FormField control={form.control} name="nomineeRelation" render={({ field }) => (
                    <FormItem><FormLabel>Relation</FormLabel><FormControl><Input placeholder="Spouse" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {member ? 'Save Changes' : 'Create Member'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
