import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { payments } from "@/lib/data";
import { PaymentTable } from "./components/payment-table";

export default function PaymentsPage() {
  // In a real app, this data would be fetched from a database
  const paymentData = payments;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Payments</h2>
          <p className="text-muted-foreground">Manage member subscription payments.</p>
        </div>
        <Link href="/payments/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Payment
          </Button>
        </Link>
      </div>
      <PaymentTable data={paymentData} />
    </div>
  );
}
