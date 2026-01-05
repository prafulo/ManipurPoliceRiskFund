'use client';

import { useEffect, useState } from 'react';
import type { Member, Unit } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface ReportRow {
  unitName: string;
  retired: number;
  expired: number;
  doubling: number;
  totalDeleted: number;
  newEnrolled: number;
}

export default function StatementReportPage() {
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    retired: 0,
    expired: 0,
    doubling: 0,
    totalDeleted: 0,
    newEnrolled: 0,
  });

  useEffect(() => {
    const membersString = localStorage.getItem('members');
    const unitsString = localStorage.getItem('units');
    const members: Member[] = membersString ? JSON.parse(membersString) : [];
    const units: Unit[] = unitsString ? JSON.parse(unitsString) : [];

    const startDate = new Date('2025-07-01');
    const endDate = new Date('2025-09-30');

    const data: ReportRow[] = units.map(unit => {
      const unitMembers = members.filter(m => m.unitId === unit.id);

      const retired = unitMembers.filter(m => 
        m.status === 'Closed' && m.closureReason === 'Retirement' && m.dateOfDischarge && new Date(m.dateOfDischarge) >= startDate && new Date(m.dateOfDischarge) <= endDate
      ).length;

      const expired = unitMembers.filter(m => 
        m.status === 'Closed' && m.closureReason === 'Death' && m.dateOfDischarge && new Date(m.dateOfDischarge) >= startDate && new Date(m.dateOfDischarge) <= endDate
      ).length;

      const doubling = unitMembers.filter(m => 
        m.status === 'Closed' && m.closureReason === 'Doubling' && m.dateOfDischarge && new Date(m.dateOfDischarge) >= startDate && new Date(m.dateOfDischarge) <= endDate
      ).length;
      
      const newEnrolled = unitMembers.filter(m => 
        m.status === 'Opened' && new Date(m.allotmentDate) >= startDate && new Date(m.allotmentDate) <= endDate
      ).length;

      const totalDeleted = retired + expired + doubling;
      
      return {
        unitName: unit.name,
        retired,
        expired,
        doubling,
        totalDeleted,
        newEnrolled,
      };
    });

    const totalRow = data.reduce((acc, row) => ({
      retired: acc.retired + row.retired,
      expired: acc.expired + row.expired,
      doubling: acc.doubling + row.doubling,
      totalDeleted: acc.totalDeleted + row.totalDeleted,
      newEnrolled: acc.newEnrolled + row.newEnrolled,
    }), { retired: 0, expired: 0, doubling: 0, totalDeleted: 0, newEnrolled: 0 });

    setReportData(data);
    setTotals(totalRow);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Generating report...</div>;
  }
  
  const handlePrint = () => {
    window.print();
  }

  return (
    <div>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">Membership Statement</h2>
                <p className="text-muted-foreground">Statement of data entered and deleted during July, August & September, 2025</p>
            </div>
            <Button onClick={handlePrint} variant="outline" className="print:hidden">
                <Printer className="mr-2 h-4 w-4" />
                Print Report
            </Button>
        </div>
        <Card>
            <CardContent className="p-0">
                 <div className="text-center p-4 print:block hidden">
                    <h2 className="text-xl font-bold">Statement of data entered and deleted during July, August & September, 2025.</h2>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">SL. No.</TableHead>
                            <TableHead>Units/District</TableHead>
                            <TableHead colSpan={3} className="text-center">Deleted Members</TableHead>
                            <TableHead className="text-center">Total</TableHead>
                            <TableHead className="text-center">New Members Enrolled/Retrieved</TableHead>
                        </TableRow>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead></TableHead>
                            <TableHead className="text-center">Retired</TableHead>
                            <TableHead className="text-center">Expired</TableHead>
                            <TableHead className="text-center">Doubling</TableHead>
                            <TableHead></TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{row.unitName}</TableCell>
                                <TableCell className="text-center">{row.retired || ''}</TableCell>
                                <TableCell className="text-center">{row.expired || ''}</TableCell>
                                <TableCell className="text-center">{row.doubling || ''}</TableCell>
                                <TableCell className="text-center font-semibold">{row.totalDeleted || ''}</TableCell>
                                <TableCell className="text-center">{row.newEnrolled || ''}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                         <TableRow className="font-bold bg-muted/50">
                            <TableCell colSpan={2} className="text-right">TOTAL</TableCell>
                            <TableCell className="text-center">{totals.retired}</TableCell>
                            <TableCell className="text-center">{totals.expired}</TableCell>
                            <TableCell className="text-center">{totals.doubling}</TableCell>
                            <TableCell className="text-center">{totals.totalDeleted}</TableCell>
                            <TableCell className="text-center">{totals.newEnrolled}</TableCell>
                         </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
        <div className="text-right mt-12 print:block hidden">
            <p>(Ningshen Worngam), IPS</p>
            <p>Dy. IG of Police (Telecom),</p>
            <p>Manipur, Imphal.</p>
        </div>
    </div>
  );
}
