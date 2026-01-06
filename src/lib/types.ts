import type { Timestamp } from 'firebase/firestore';

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
  dateOfBirth: Timestamp;
  dateOfEnrollment: Timestamp;
  superannuationDate: Timestamp;
  dateOfDischarge?: Timestamp;
  address: string;
  phone: string;
  unitId: string;
  status: MembershipStatus;
  closureReason?: ClosureReason;
  closureNotes?: string;
  subscriptionStartDate: Timestamp;
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
  dateApplied: Timestamp;
  receiptDate: Timestamp;
  allotmentDate: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type Payment = {
  id: string;
  memberId: string;
  memberName: string;
  membershipCode: string;
  unitName: string;
  amount: number;
  months: (Date | Timestamp)[]; 
  paymentDate: Timestamp;
};

export type Transfer = {
  id: string;
  memberId: string;
  memberName: string;
  fromUnitId: string;
  toUnitId: string;
  transferDate: Date | Timestamp;
  createdAt?: Timestamp;
};
