export type MembershipStatus = "Opened" | "Closed";
export type ClosureReason = "Retirement" | "Death" | "Doubling" | "Expelled" | "";
export type UserRole = "Super Admin" | "Unit Admin";

export type Unit = {
  id: string;
  name: string;
};

export type Member = {
  id: string;
  membershipCode: string;
  name: string;
  fatherName: string;
  rank: string;
  trade: string;
  serviceNumber: string;
  dateOfBirth: Date;
  dateOfEnrolment: Date;
  dateOfDischarge?: Date;
  address: string;
  phone: string;
  unitId: string;
  status: MembershipStatus;
  closureReason?: ClosureReason;
  isDoubling: boolean;
  subscriptionStartDate: Date;
  nominee: {
    name: string;
    relation: string;
  };
};

export type Payment = {
  id: string;
  memberId: string;
  amount: number;
  months: Date[]; // Represents the months paid for, e.g. [new Date('2024-07-01'), new Date('2024-08-01')]
  paymentDate: Date;
};

export type Transfer = {
  id: string;
  memberId: string;
  fromUnitId: string;
  toUnitId: string;
  transferDate: Date;
};
