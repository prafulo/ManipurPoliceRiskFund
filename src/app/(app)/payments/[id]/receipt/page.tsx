'use client';

import { use, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, ChevronLeft, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { format } from 'date-fns';
import { numberToWords } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

async function getPayment(id: string) {
    const res = await fetch(`/api/payments/${id}`);
    if (!res.ok) throw new Error('Failed to fetch payment details');
    return res.json();
}

export default function PaymentReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getPayment(id)
            .then(res => setData(res.payment))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <Skeleton className="h-10 w-32" />
                <Card><CardContent className="p-12 space-y-8"><Skeleton className="h-20 w-full" /><Skeleton className="h-64 w-full" /></CardContent></Card>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-destructive font-medium">Error: {error || 'Receipt not found'}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const monthsPaid = Array.isArray(data.months) 
        ? data.months.map((m: any) => format(new Date(m), 'MMM yyyy')).join(', ')
        : 'N/A';

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Payments
                </Button>
                <div className="flex gap-2">
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Receipt
                    </Button>
                </div>
            </div>

            <Card className="shadow-none border-2 print:border-none print:shadow-none">
                <CardContent className="p-8 md:p-12 space-y-10">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-8">
                        <div className="flex items-center gap-4">
                            <Logo className="w-16 h-16" />
                            <div>
                                <h1 className="text-2xl font-bold font-headline text-primary">Manipur Police Risk Fund</h1>
                                <p className="text-sm text-muted-foreground font-medium">PHQ, Imphal, Manipur</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-2">
                                Subscription Receipt
                            </div>
                            <p className="text-sm font-mono font-medium">No: {data.id.split('-')[0].toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">Date: {format(new Date(data.paymentDate), 'PP')}</p>
                        </div>
                    </div>

                    {/* Member Info */}
                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <div className="space-y-4">
                            <div>
                                <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mb-1">Received From</p>
                                <p className="text-lg font-bold">{data.memberName}</p>
                                <p className="text-muted-foreground">{data.rank}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mb-1">Membership Code</p>
                                <p className="font-mono font-semibold">{data.membershipCode}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mb-1">Unit / District</p>
                                <p className="font-semibold">{data.unitName}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mb-1">EIN</p>
                                <p className="font-semibold">{data.serviceNumber}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50 border-b">
                                    <th className="px-4 py-3 text-left font-bold">Description</th>
                                    <th className="px-4 py-3 text-right font-bold">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-6">
                                        <p className="font-medium">Subscription Payment</p>
                                        <p className="text-xs text-muted-foreground mt-1">Months: {monthsPaid}</p>
                                    </td>
                                    <td className="px-4 py-6 text-right font-bold text-lg">
                                        Rs. {data.amount.toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr className="bg-muted/30 border-t">
                                    <td className="px-4 py-3 text-right font-bold uppercase text-[10px] tracking-wider">Total Received</td>
                                    <td className="px-4 py-3 text-right font-bold text-xl text-primary">Rs. {data.amount.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Amount in words */}
                    <div className="bg-muted/20 p-4 rounded-md border border-dashed">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Amount in words</p>
                        <p className="italic font-medium">Rupees {numberToWords(Math.round(data.amount))} only.</p>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="pt-12 grid grid-cols-2 gap-12 items-end">
                        <div className="text-xs text-muted-foreground italic">
                            * This is a computer generated receipt and does not require a physical signature.
                        </div>
                        <div className="text-center space-y-1">
                            <div className="border-b-2 border-primary/20 w-48 mx-auto mb-2 h-12"></div>
                            <p className="font-bold text-sm">Authorized Signatory</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Manipur Police Risk Fund</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
