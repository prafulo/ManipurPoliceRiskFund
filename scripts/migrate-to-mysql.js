
require('dotenv').config({ path: '.env.development.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const mysql = require('mysql2/promise');
const { format } = require('date-fns');

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// --- MySQL Configuration ---
const mysqlConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
};

// --- Helper Functions ---
const toMySQLDatetime = (timestamp) => {
  if (!timestamp) return null;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return format(date, 'yyyy-MM-dd HH:mm:ss');
};

const toMySQLDate = (timestamp) => {
    if (!timestamp) return null;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'yyyy-MM-dd');
};

async function migrate() {
  let mysqlConnection;
  try {
    // --- Initialize Firebase ---
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('Firebase initialized successfully.');

    // --- Connect to MySQL ---
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('MySQL connected successfully.');

    // --- 1. Migrate Units ---
    console.log('\nMigrating units...');
    const unitsRef = collection(db, 'units');
    const unitsSnapshot = await getDocs(unitsRef);
    const unitsData = unitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    for (const unit of unitsData) {
      await mysqlConnection.execute(
        'INSERT INTO units (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
        [unit.id, unit.name]
      );
    }
    console.log(`Migrated ${unitsData.length} units.`);

    // --- 2. Migrate Members ---
    console.log('\nMigrating members...');
    const membersRef = collection(db, 'members');
    const membersSnapshot = await getDocs(membersRef);
    const membersData = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    let membersMigrated = 0;
    for (const member of membersData) {
      try {
        const sql = `
          INSERT INTO members (id, membership_code, name, father_name, rank, trade, service_number, badge_number, blood_group, member_post_type, joining_rank, date_of_birth, date_of_enrollment, superannuation_date, date_of_discharge, address, phone, unit_id, status, closure_reason, closure_notes, subscription_start_date, parent_department, date_applied, receipt_date, allotment_date, created_at, updated_at, first_witness, second_witness, nominees)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            membership_code=VALUES(membership_code), name=VALUES(name), father_name=VALUES(father_name), rank=VALUES(rank), trade=VALUES(trade), service_number=VALUES(service_number), badge_number=VALUES(badge_number), blood_group=VALUES(blood_group), member_post_type=VALUES(member_post_type), joining_rank=VALUES(joining_rank), date_of_birth=VALUES(date_of_birth), date_of_enrollment=VALUES(date_of_enrollment), superannuation_date=VALUES(superannuation_date), date_of_discharge=VALUES(date_of_discharge), address=VALUES(address), phone=VALUES(phone), unit_id=VALUES(unit_id), status=VALUES(status), closure_reason=VALUES(closure_reason), closure_notes=VALUES(closure_notes), subscription_start_date=VALUES(subscription_start_date), parent_department=VALUES(parent_department), date_applied=VALUES(date_applied), receipt_date=VALUES(receipt_date), allotment_date=VALUES(allotment_date), updated_at=VALUES(updated_at), first_witness=VALUES(first_witness), second_witness=VALUES(second_witness), nominees=VALUES(nominees)
        `;
        const params = [
          member.id,
          member.membershipCode,
          member.name,
          member.fatherName,
          member.rank,
          member.trade,
          member.serviceNumber,
          member.badgeNumber,
          member.bloodGroup,
          member.memberPostType,
          member.joiningRank,
          toMySQLDate(member.dateOfBirth),
          toMySQLDate(member.dateOfEnrollment),
          toMySQLDate(member.superannuationDate),
          toMySQLDate(member.dateOfDischarge),
          member.address,
          member.phone,
          member.unitId,
          member.status,
          member.closureReason || null,
          member.closureNotes || null,
          toMySQLDate(member.subscriptionStartDate),
          member.parentDepartment || null,
          toMySQLDate(member.dateApplied),
          toMySQLDate(member.receiptDate),
          toMySQLDate(member.allotmentDate),
          toMySQLDatetime(member.createdAt),
          toMySQLDatetime(member.updatedAt),
          JSON.stringify(member.firstWitness),
          JSON.stringify(member.secondWitness),
          JSON.stringify(member.nominees)
        ];
        await mysqlConnection.execute(sql, params);
        membersMigrated++;
      } catch (error) {
        console.error(`Failed to migrate member ${member.id} (${member.name}):`, error.message);
      }
    }
    console.log(`Migrated ${membersMigrated} of ${membersData.length} members.`);

    // --- 3. Migrate Payments ---
    console.log('\nMigrating payments...');
    const paymentsRef = collection(db, 'payments');
    const paymentsSnapshot = await getDocs(paymentsRef);
    const paymentsData = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    for (const payment of paymentsData) {
        const months = payment.months.map(m => toMySQLDate(m));
        await mysqlConnection.execute(
            'INSERT INTO payments (id, member_id, amount, payment_date, months) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE amount=VALUES(amount), payment_date=VALUES(payment_date), months=VALUES(months)',
            [payment.id, payment.memberId, payment.amount, toMySQLDatetime(payment.paymentDate), JSON.stringify(months)]
        );
    }
    console.log(`Migrated ${paymentsData.length} payments.`);

    // --- 4. Migrate Transfers ---
    console.log('\nMigrating transfers...');
    const transfersRef = collection(db, 'transfers');
    const transfersSnapshot = await getDocs(transfersRef);
    const transfersData = transfersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    for (const transfer of transfersData) {
        await mysqlConnection.execute(
            'INSERT INTO transfers (id, member_id, from_unit_id, to_unit_id, transfer_date, created_at) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE from_unit_id=VALUES(from_unit_id), to_unit_id=VALUES(to_unit_id), transfer_date=VALUES(transfer_date), created_at=VALUES(created_at)',
            [transfer.id, transfer.memberId, transfer.fromUnitId, transfer.toUnitId, toMySQLDatetime(transfer.transferDate), toMySQLDatetime(transfer.createdAt)]
        );
    }
    console.log(`Migrated ${transfersData.length} transfers.`);


    console.log('\n\n--- Migration Complete! ---');

  } catch (error) {
    console.error('\n--- A critical error occurred during migration: ---');
    console.error(error);
    process.exit(1);
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log('\nMySQL connection closed.');
    }
    // We need to explicitly exit because the Firebase connection keeps the process alive.
    process.exit(0);
  }
}

migrate();
