'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
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
import { CalendarIcon, Save, Trash2, PlusCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { units, members as allMembers } from '@/lib/data';
import type { Member } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

const nomineeSchema = z.object({
  name: z.string().min(2, 'Nominee name is required.'),
  relation: z.string().min(2, 'Relation is required.'),
  age: z.coerce.number().min(1, 'Age must be at least 1.').max(120),
  share: z.coerce.number().min(1, 'Share must be at least 1%').max(100, 'Share cannot exceed 100%'),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  fatherName: z.string().min(2, "Father's name must be at least 2 characters."),
  rank: z.string().min(1, "Rank is required."),
  trade: z.string().min(1, "Trade is required."),
  serviceNumber: z.string().min(1, "Service number is required."),
  dateOfBirth: z.date({ required_error: "Date of birth is required." }),
  dateOfEnrollment: z.date({ required_error: "Date of enrollment is required." }),
  address: z.string().min(5, "Address is required."),
  phone: z.string().min(10, "A valid phone number is required."),
  unitId: z.string({ required_error: "Unit is required." }),
  status: z.enum(["Opened", "Closed"]),
  isDoubling: z.boolean().default(false),
  nominees: z.array(nomineeSchema).min(1, 'At least one nominee is required.'),
  closureReason: z.enum(["", "Retirement", "Death", "Doubling", "Expelled"]),
  closureNotes: z.string().optional(),
  badgeNumber: z.string().min(1, "Badge number is required."),
  bloodGroup: z.string().min(1, "Blood group is required."),
  memberPostType: z.enum(["Officiating", "Temporary", "Substantive"]),
  joiningRank: z.string().min(1, "Joining rank is required."),
  superannuationDate: z.date({ required_error: "Superannuation date is required." }),
  firstWitnessName: z.string().min(2, "First witness name is required."),
  firstWitnessAddress: z.string().min(5, "First witness address is required."),
  secondWitnessName: z.string().min(2, "Second witness name is required."),
  secondWitnessAddress: z.string().min(5, "Second witness address is required."),
  parentDepartment: z.string().optional(),
  dateApplied: z.date({ required_error: "Date applied is required." }),
  receiptDate: z.date({ required_error: "Receipt date is required." }),
  allotmentDate: z.date({ required_error: "Allotment date is required." }),
}).refine(data => {
  if (data.status === 'Closed') {
    return data.closureReason !== "";
  }
  return true;
}, {
  message: "Reason for closure is required when status is 'Closed'.",
  path: ["closureReason"],
}).refine(data => {
  if (data.nominees.length > 0) {
    const totalShare = data.nominees.reduce((sum, nominee) => sum + nominee.share, 0);
    return totalShare === 100;
  }
  return true;
}, {
  message: "Total share for all nominees must be 100%.",
  path: ["nominees"],
});


type MemberFormProps = {
  member?: Member;
};

// In a real app, these would come from a database or a config file.
const initialSerialNumbers: Record<string, number> = {
  '1': 31000, // 1MR
  '2': 31000, // 2MR
  '3': 31000, // 3MR
  '4': 51000, // HQ
};

function getNextSerialNumber(unitId: string): number {
  const membersOfUnit = allMembers.filter(m => m.unitId === unitId);
  if (membersOfUnit.length === 0) {
    return initialSerialNumbers[unitId] || 10000;
  }
  const lastMember = membersOfUnit.reduce((latest, current) => {
    const latestNum = parseInt(latest.membershipCode.split('-')[1], 10);
    const currentNum = parseInt(current.membershipCode.split('-')[1], 10);
    return currentNum > latestNum ? current : latest;
  });
  const lastSerialNumber = parseInt(lastMember.membershipCode.split('-')[1], 10);
  return lastSerialNumber + 1;
}


export function MemberForm({ member }: MemberFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [generatedCode, setGeneratedCode] = useState<string | null>(member?.membershipCode ?? null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: member ? {
      ...member,
      closureNotes: member.closureNotes || '',
      firstWitnessName: member.firstWitness.name,
      firstWitnessAddress: member.firstWitness.address,
      secondWitnessName: member.secondWitness.name,
      secondWitnessAddress: member.secondWitness.address,
    } : {
      name: '',
      fatherName: '',
      rank: '',
      trade: '',
      serviceNumber: '',
      address: '',
      phone: '',
      unitId: '',
      status: 'Opened',
      isDoubling: false,
      nominees: [{ name: '', relation: '', age: 0, share: 100 }],
      closureReason: '',
      closureNotes: '',
      badgeNumber: '',
      bloodGroup: '',
      memberPostType: 'Substantive',
      joiningRank: '',
      firstWitnessName: '',
      firstWitnessAddress: '',
      secondWitnessName: '',
      secondWitnessAddress: '',
      parentDepartment: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "nominees",
  });

  const selectedUnitId = form.watch("unitId");

  useEffect(() => {
    if (!member && selectedUnitId) {
      const unit = units.find(u => u.id === selectedUnitId);
      if (unit) {
        const nextSerial = getNextSerialNumber(selectedUnitId);
        const datePart = format(new Date(), 'MMyy');
        setGeneratedCode(`${unit.name}-${nextSerial}-${datePart}`);
      }
    }
  }, [selectedUnitId, member]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalValues = {
      ...values,
      membershipCode: member?.membershipCode || generatedCode,
    };
    toast({
      title: member ? "Member Updated" : "Member Created",
      description: `Profile for ${values.name} has been saved successfully.`,
    });
    router.push('/members');
    console.log(finalValues);
  }

  const status = form.watch("status");
  const nomineeValues = form.watch("nominees");
  const totalShare = nomineeValues.reduce((acc, nominee) => acc + (Number(nominee.share) || 0), 0);

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-headline text-primary">Personal Information</h3>
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
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <FormField name="address" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Main St..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />
                <FormField name="phone" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="555-123-4567" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />
                <FormField name="bloodGroup" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Blood Group</FormLabel><FormControl><Input placeholder="O+" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />
            
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-headline text-primary">Service Details</h3>
              <div className="grid md:grid-cols-4 gap-8">
                <FormField name="serviceNumber" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Service No.</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField name="badgeNumber" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Badge No.</FormLabel><FormControl><Input placeholder="BN123" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField name="joiningRank" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Joining Rank</FormLabel><FormControl><Input placeholder="Recruit" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                 <FormField name="rank" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Present Rank</FormLabel><FormControl><Input placeholder="Sergeant" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField name="trade" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Trade</FormLabel><FormControl><Input placeholder="Infantry" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField control={form.control} name="memberPostType" render={({ field }) => (
                  <FormItem><FormLabel>Member Post Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select post type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Officiating">Officiating</SelectItem>
                        <SelectItem value="Temporary">Temporary</SelectItem>
                        <SelectItem value="Substantive">Substantive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
                />
                <FormField control={form.control} name="dateOfEnrollment" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Date of Enrollment</FormLabel>
                       <Popover>
                        <PopoverTrigger asChild><FormControl>
                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="superannuationDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Superannuation Date</FormLabel>
                       <Popover>
                        <PopoverTrigger asChild><FormControl>
                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField name="parentDepartment" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Parent Department (for Deputationist)</FormLabel><FormControl><Input placeholder="e.g. Ministry of Defense" {...field} /></FormControl><FormDescription>Only fill if the member is on deputation.</FormDescription><FormMessage /></FormItem>
                )}
              />
            </div>

            <Separator />
            
            <div className="space-y-6">
               <h3 className="text-xl font-bold font-headline text-primary">Membership Details</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <FormLabel>Membership Code</FormLabel>
                  <p className="text-lg font-mono font-semibold pt-2 text-primary">{generatedCode ?? 'Select a unit'}</p>
                  <FormDescription>{member ? 'Assigned membership code' : 'Auto-generated on creation'}</FormDescription>
                </div>
                <FormField control={form.control} name="unitId" render={({ field }) => (
                    <FormItem><FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!member}>
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
                  <div className="col-span-3 grid md:grid-cols-2 gap-8">
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
                    <FormField control={form.control} name="closureNotes" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Closure Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Add any relevant notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                <FormField control={form.control} name="isDoubling" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50 col-span-3">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Membership Doubling</FormLabel>
                        <FormDescription>If checked, this member will not appear in lists or reports.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-headline text-primary">Nominees</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', relation: '', age: 0, share: 0 })}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Nominee
                </Button>
              </div>

              {form.formState.errors.nominees?.root && <FormMessage>{form.formState.errors.nominees.root.message}</FormMessage>}
              
              <div className="space-y-6">
                {fields.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-md relative space-y-4 bg-muted/20">
                     {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="grid md:grid-cols-4 gap-6 items-end">
                      <FormField control={form.control} name={`nominees.${index}.name`} render={({ field }) => (
                          <FormItem><FormLabel>Nominee Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                      />
                      <FormField control={form.control} name={`nominees.${index}.relation`} render={({ field }) => (
                          <FormItem><FormLabel>Relation</FormLabel><FormControl><Input placeholder="Spouse" {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                      />
                      <FormField control={form.control} name={`nominees.${index}.age`} render={({ field }) => (
                          <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="35" {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                      />
                      <FormField control={form.control} name={`nominees.${index}.share`} render={({ field }) => (
                          <FormItem><FormLabel>Share (%)</FormLabel><FormControl><Input type="number" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
               <div className="text-right font-medium text-primary pr-4">Total Share: {totalShare}%</div>

            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="text-xl font-bold font-headline text-primary">Witnesses</h3>
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4 p-4 border rounded-md">
                     <h4 className="font-medium">First Witness</h4>
                     <FormField control={form.control} name="firstWitnessName" render={({ field }) => (<FormItem><FormLabel>Witness Name</FormLabel><FormControl><Input placeholder="Witness One" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="firstWitnessAddress" render={({ field }) => (<FormItem><FormLabel>Witness Address</FormLabel><FormControl><Input placeholder="123 Witness Ave" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                   <div className="space-y-4 p-4 border rounded-md">
                     <h4 className="font-medium">Second Witness</h4>
                     <FormField control={form.control} name="secondWitnessName" render={({ field }) => (<FormItem><FormLabel>Witness Name</FormLabel><FormControl><Input placeholder="Witness Two" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="secondWitnessAddress" render={({ field }) => (<FormItem><FormLabel>Witness Address</FormLabel><FormControl><Input placeholder="456 Witness Blvd" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
               </div>
            </div>
            
            <Separator />
            
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-headline text-primary">Application Dates</h3>
               <div className="grid md:grid-cols-3 gap-8">
                  <FormField control={form.control} name="dateApplied" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date Applied</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="receiptDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Receipt Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="allotmentDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Allotment Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
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
