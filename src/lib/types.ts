export type MembershipStatus = "Opened" | "Closed";
export type ClosureReason = "Retirement" | "Death" | "Doubling" | "Expelled" | "";
export type UserRole = "Super Admin" | "Unit Admin";
export type MemberPostType = "Officiating" | "Temporary" | "Substantive";

export type Unit = {
  id: string;
  name: string;
};

export type Nominee = {
  name: string;
  relation: string;
  age: number;
  share: number;
};

export type Member = {
  id: string;
  membershipCode: string;
  name: string;
  fatherName: string;
  rank: string;
  trade: string;
  serviceNumber: string;
  badgeNumber: string;
  bloodGroup: string;
  memberPostType: MemberPostType;
  joiningRank: string;
  dateOfBirth: Date;
  dateOfEnrolment: Date;
  superannuationDate: Date;
  dateOfDischarge?: Date;
  address: string;
  phone: string;
  unitId: string;
  status: MembershipStatus;
  closureReason?: ClosureReason;
  isDoubling: boolean;
  subscriptionStartDate: Date;
  nominees: Nominee[];
  firstWitness: {
    name: string;
    address: string;
  };
  secondWitness: {
    name: string;
    address: string;
  };
  parentDepartment?: string;
  dateApplied: Date;
  receiptDate: Date;
  allotmentDate: Date;
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
