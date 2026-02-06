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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, Trash2, PlusCircle, Lock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format, addYears, isValid } from 'date-fns';
import type { Member, Unit, Rank } from '@/lib/types';
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
  serviceNumber: z.string().min(1, "Employee Identification Number(EIN) is required."),
  dateOfBirth: z.date({ required_error: "Date of birth is required." }),
  dateOfEnrollment: z.date({ required_error: "Date of enrollment is required." }),
  address: z.string().min(5, "Address is required."),
  phone: z.string().min(10, "A valid phone number is required."),
  unitId: z.string({ required_error: "Unit is required." }),
  status: z.enum(["Opened", "Closed"]),
  nominees: z.array(nomineeSchema).min(1, 'At least one nominee is required.'),
  closureReason: z.enum(["", "Retirement", "Death", "Doubling", "Expelled"]),
  closureNotes: z.string().optional(),
  dateOfDischarge: z.date().optional(),
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
  subscriptionStartDate: z.date({ required_error: "Subscription start date is required." }),
}).refine(data => {
  if (data.status === 'Closed') {
    return data.closureReason !== "";
  }
  return true;
}, {
  message: "Reason for closure is required when status is 'Closed'.",
  path: ["closureReason"],
}).refine(data => {
  if (data.status === 'Closed') {
    return !!data.dateOfDischarge;
  }
  return true;
}, {
  message: "Date of discharge is required when status is 'Closed'.",
  path: ["dateOfDischarge"],
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
  member?: Member | null;
};

function memberToForm(member: Member) {
    const formValues: any = {};
    
    for (const key in member) {
        const memberKey = key as keyof Member;
        const value = member[memberKey];

        if (typeof value === 'string') {
            formValues[memberKey] = value;
        } else if (value instanceof Date) {
            formValues[memberKey] = value;
        } else if (value === null || value === undefined) {
             if (['closureReason', 'closureNotes', 'parentDepartment'].includes(memberKey)) {
                formValues[memberKey] = '';
             } else {
                formValues[memberKey] = undefined;
             }
        } else {
            formValues[memberKey] = value;
        }
    }

    const dateFields: (keyof Member)[] = ['dateOfBirth', 'dateOfEnrollment', 'superannuationDate', 'dateOfDischarge', 'subscriptionStartDate', 'dateApplied', 'receiptDate', 'allotmentDate', 'createdAt', 'updatedAt'];
    dateFields.forEach(field => {
        if (formValues[field] && typeof formValues[field] === 'string') {
            formValues[field] = new Date(formValues[field]);
        }
    });

    if (member.firstWitness) {
        formValues.firstWitnessName = (member.firstWitness as any).name || '';
        formValues.firstWitnessAddress = (member.firstWitness as any).address || '';
    } else {
        formValues.firstWitnessName = '';
        formValues.firstWitnessAddress = '';
    }
    if (member.secondWitness) {
        formValues.secondWitnessName = (member.secondWitness as any).name || '';
        formValues.secondWitnessAddress = (member.secondWitness as any).address || '';
    } else {
        formValues.secondWitnessName = '';
        formValues.secondWitnessAddress = '';
    }

    let nomineesArray = [];
    if (typeof member.nominees === 'string') {
        try {
            nomineesArray = JSON.parse(member.nominees);
        } catch (e) {
            console.error("Failed to parse nominees JSON string", e);
            nomineesArray = [];
        }
    } else if (Array.isArray(member.nominees)) {
        nomineesArray = member.nominees;
    }
    formValues.nominees = nomineesArray;

    return formValues;
}


export function MemberForm({ member }: MemberFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
        const [unitsRes, ranksRes] = await Promise.all([
            fetch('/api/units'),
            fetch('/api/ranks')
        ]);
        const unitsData = await unitsRes.json();
        const ranksData = await ranksRes.json();
        setUnits(unitsData.units || []);
        setRanks(ranksData.ranks || []);
    }
    loadInitialData();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: member ? memberToForm(member) : {
      name: '',
      fatherName: '',
      rank: '',
      trade: '',
      serviceNumber: '',
      address: '',
      phone: '',
      unitId: '',
      status: 'Opened',
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
  const dob = form.watch("dateOfBirth");

  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      if (isValid(birthDate)) {
        const calculatedDate = addYears(birthDate, 60);
        form.setValue("superannuationDate", calculatedDate, { 
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      }
    } else {
      form.setValue("superannuationDate", undefined as any);
    }
  }, [dob, form]);

  useEffect(() => {
    async function generateCode() {
        if (!member && selectedUnitId) {
            const unit = units?.find(u => u.id === selectedUnitId);
            if (unit) {
                const res = await fetch(`/api/members/next-code?unitId=${selectedUnitId}&unitName=${unit.name}`);
                const data = await res.json();
                if (data.code) {
                    setGeneratedCode(data.code);
                }
            }
        } else if (member) {
            setGeneratedCode(member.membershipCode);
        }
    }
    generateCode();
  }, [selectedUnitId, member, units]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    const method = member ? 'PUT' : 'POST';
    const url = member ? `/api/members/${member.id}` : '/api/members/new';
    
    const finalValues = {
        ...values,
        membershipCode: generatedCode
    };

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalValues)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Something went wrong');
        }

        toast({
            title: `Member ${member ? 'updated' : 'created'}`,
            description: `Member profile for ${values.name} has been successfully saved.`,
        });

        router.push('/members');
        router.refresh();

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
        });
    }
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
                              {field.value ? format(new Date(field.value), "MM/dd/yyyy") : <span>Pick a date</span>}
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
                    <FormItem><FormLabel>Employee Identification Number(EIN)</FormLabel><FormControl><Input placeholder="e.g. 12345" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField name="badgeNumber" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Badge No.</FormLabel><FormControl><Input placeholder="BN123" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField control={form.control} name="joiningRank" render={({ field }) => (
                    <FormItem><FormLabel>Joining Rank</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select rank" /></SelectTrigger></FormControl>
                        <SelectContent>{(ranks || []).map(rank => (<SelectItem key={rank.id} value={rank.name}>{rank.name}</SelectItem>))}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="rank" render={({ field }) => (
                    <FormItem><FormLabel>Present Rank</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select rank" /></SelectTrigger></FormControl>
                        <SelectContent>{(ranks || []).map(rank => (<SelectItem key={rank.id} value={rank.name}>{rank.name}</SelectItem>))}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
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
                              {field.value ? format(new Date(field.value), "MM/dd/yyyy") : <span>Pick a date</span>}
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
                    <FormItem>
                      <FormLabel>Superannuation Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            readOnly 
                            value={field.value ? format(new Date(field.value), "MM/dd/yyyy") : ""} 
                            className="bg-muted cursor-not-allowed pr-10"
                            placeholder="Calculated from DOB"
                          />
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                        </div>
                      </FormControl>
                      <FormDescription>Calculated automatically (DOB + 60 years)</FormDescription>
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
                        <SelectContent>{(units || []).map(unit => (<SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>))}</SelectContent>
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
                 <FormField control={form.control} name="subscriptionStartDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Subscription Start Date</FormLabel>
                       <Popover>
                        <PopoverTrigger asChild><FormControl>
                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                              {field.value ? format(new Date(field.value), "MM/dd/yyyy") : <span>Pick a date</span>}
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
                {status === 'Closed' && (
                  <div className="col-span-3 grid md:grid-cols-3 gap-8">
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
                    <FormField control={form.control} name="dateOfDischarge" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Date of Discharge</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild><FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                                  {field.value ? format(new Date(field.value), "MM/dd/yyyy") : <span>Pick a date</span>}
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
                          <FormItem><FormLabel>Relation</FormLabel><FormControl><Input placeholder="Spouse" {...field} /></FormControl><FormMessage />
                          </FormItem>
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
                  <FormField control={form.control} name="dateApplied" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date Applied</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(new Date(field.value), "MM/dd/yyyy") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="receiptDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Receipt Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(new Date(field.value), "MM/dd/yyyy") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="allotmentDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Allotment Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(new Date(field.value), "MM/dd/yyyy") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
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
