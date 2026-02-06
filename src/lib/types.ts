export type MembershipStatus = "Opened" | "Closed";
export type ClosureReason = "Retirement" | "Death" | "Doubling" | "Expelled" | "";
export type UserRole = "SuperAdmin" | "UnitAdmin";
export type MemberPostType = "Officiating" | "Temporary" | "Substantive";

export type Unit = {
  id: string;
  name: string;
};

export type Rank = {
  id: string;
  name: string;
};

export type Nominee = {
  name: string;
  relation: string;
  age: number;
  share: number;
};

export type User = {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    unitId?: string | null;
};

// This type represents the data structure as used in the components.
// It will differ slightly from the direct database schema (e.g., Timestamps vs. Dates/Strings).
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
  dateOfBirth: Date | string;
  dateOfEnrollment: Date | string;
  superannuationDate: Date | string;
  dateOfDischarge?: Date | string;
  address: string;
  phone: string;
  unitId: string;
  status: MembershipStatus;
  closureReason?: ClosureReason;
  closureNotes?: string;
  subscriptionStartDate: Date | string;
  nominees: Nominee[] | string;
  firstWitness: {
    name: string;
    address: string;
  };
  secondWitness: {
    name: string;
    address: string;
  };
  parentDepartment?: string;
  dateApplied: Date | string;
  receiptDate: Date | string;
  allotmentDate: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  // New fields for recording the release
  releaseDate?: Date | string | null;
  releaseAmount?: number | null;
  releaseNotes?: string | null;
};

export type Payment = {
  id: string;
  memberId: string;
  memberName: string;
  membershipCode: string;
  unitName: string;
  amount: number;
  months: (Date | string)[] | string; 
  paymentDate: Date | string;
};

export type Transfer = {
  id: string;
  memberId: string;
  memberName: string;
  fromUnitId: string;
  toUnitId: string;
  fromUnitName?: string;
  toUnitName?: string;
  transferDate: Date | string;
  createdAt?: Date | string;
};

export type SubscriptionRelease = {
  id: string;
  memberId: string;
  amount: number;
  releaseDate: Date | string;
  notes?: string;
  createdAt: Date | string;
  // For display in table
  memberName?: string;
  membershipCode?: string;
  unitName?: string;
};

export type ActivityType = 'new-member' | 'payment' | 'transfer';

export type Activity = {
  id: string; // e.g. "payment-xyz123"
  type: ActivityType;
  date: Date | string;
  description: string;
  details: string;
  amount?: number | null; // For payments
};
