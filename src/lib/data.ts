// This file is now deprecated as data is fetched from the MySQL database via API routes.
// It can be removed in the future.
// It is left in place to avoid breaking any reports that may still temporarily reference it.

import type { Unit, Member, Payment, Transfer } from './types';

// These arrays are now empty as they are no longer the source of truth.
export const units: Unit[] = [];
export const members: Member[] = [];
export const payments: Payment[] = [];
export const transfers: Transfer[] = [];
