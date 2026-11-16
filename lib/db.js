import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { DEPARTMENTS } from './departments';

const DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DIR, 'db.json');

const PAST = [
  ['health', 'Copies of vaccination records and stock position of vaccines at the District Hospital for 2023-24', 'The District Hospital maintains a vaccine stock register. Month-wise vaccination figures for 2023-24 are enclosed as Annexure-A. Stock position as on 31 March 2024 is provided in Annexure-B.'],
  ['education', 'Details of mid-day meal expenditure and inspection reports of Government Primary Schools in the block', 'Mid-day meal expenditure of the block for the last financial year is provided school-wise in the enclosed statement. Inspection reports of the last two quarters are attached.'],
  ['works', 'Status of repair work, tender and contractor details for the city bypass road with potholes', 'The repair of the city bypass was awarded through e-tender. Contractor name, work order date and completion status are enclosed. Pothole patchwork is scheduled after the monsoon.'],
  ['municipal', 'Complaints received and action taken on garbage collection and sanitation in Ward 12', 'A total of 46 complaints were received for Ward 12. Action-taken details are annexed. Daily door-to-door collection has been assigned to a new contractor.'],
  ['water', 'Information on drinking water supply schedule and pipeline repair works in village Rampur', 'Water supply in village Rampur is provided twice daily (6-8 AM and 5-7 PM). Pipeline repair work was completed on the date mentioned in the enclosed completion certificate.'],
  ['power', 'Number of electricity transformer failures and average restoration time in the sub-division', 'During the last year, transformer failures in the sub-division are listed month-wise in the annexure. Average restoration time was 14 hours.'],
  ['police', 'Status of FIR and action taken report on theft complaint filed at the police station', 'The FIR was registered and investigation is in progress. Under Section 8(1)(h) of the RTI Act, details that may impede the investigation cannot be disclosed at this stage.'],
  ['revenue', 'Copy of land mutation record and khasra details for plot in Tehsil', 'Certified copy of the mutation entry and khasra details are enclosed upon payment of the prescribed copying fee. Record is available with the Patwari.'],
  ['transport', 'Details of driving licence applications pending and bus permits issued by the RTO', 'As on date, 212 driving licence applications are pending, all within the service-level timeline. Bus permits issued in the last year are listed in the annexure.'],
  ['food', 'Ration card allotment list and fair price shop stock register for the village', 'The ration card allotment list and stock register of the fair price shop are publicly available under Section 4 and are enclosed with this reply.'],
  ['welfare', 'Beneficiary list and sanction status under old-age pension and widow pension schemes', 'The beneficiary list with sanction status is enclosed. Personal bank details have been withheld under Section 8(1)(j) of the RTI Act.'],
  ['agri', 'Details of fertilizer subsidy and crop insurance claims paid to farmers of the district', 'Fertilizer subsidy released and crop insurance claims settled in the district are provided block-wise in the enclosed statement.'],
  ['finance', 'Budget allocation and expenditure statement of the district for the last financial year', 'The department-wise budget allocation and expenditure statement for the last financial year is attached as Annexure-1.'],
  ['health', 'Number of doctors and nurses posted and vacant posts at the Community Health Centre', 'Sanctioned posts, working strength and vacant posts of doctors and nurses at the Community Health Centre are enclosed in tabular form.'],
  ['education', 'Scholarship disbursement list and pending applications for SC/ST students in the college', 'Scholarship disbursement details are provided in the enclosed list. 38 applications are pending verification and will be cleared within the current quarter.'],
];

function seed() {
  fs.mkdirSync(DIR, { recursive: true });
  const officerHash = bcrypt.hashSync('officer123', 10);
  const citizenHash = bcrypt.hashSync('citizen123', 10);

  const users = [{ id: 'u_citizen', name: 'Aarav Sharma', email: 'citizen@example.com', role: 'citizen', passwordHash: citizenHash }];
  DEPARTMENTS.forEach((d) =>
    users.push({ id: `u_off_${d.id}`, name: `PIO, ${d.name}`, email: `officer.${d.id}@gov.in`, role: 'officer', departmentId: d.id, passwordHash: officerHash })
  );

  const records = PAST.map(([dep, subject, response], i) => {
    const created = new Date(Date.now() - (260 - i * 15) * 86400000);
    const resp = new Date(created.getTime() + (6 + (i % 9)) * 86400000);
    return {
      id: `RTI-2025-${String(i + 1).padStart(4, '0')}`,
      userId: 'u_archive',
      applicantName: 'Archived Applicant',
      subject,
      description: subject,
      bpl: false,
      urgent: false,
      fee: 10,
      createdAt: created.toISOString(),
      dueDate: new Date(created.getTime() + 30 * 86400000).toISOString(),
      status: 'responded',
      departmentId: dep,
      ai: { category: dep, departmentId: dep, similar: [], engine: 'seed', confidence: 95, keywords: [], summary: subject },
      draft: response,
      finalResponse: response,
      responseDate: resp.toISOString(),
      timeline: [
        { at: created.toISOString(), status: 'submitted', note: 'Application received' },
        { at: resp.toISOString(), status: 'responded', note: 'Response issued by PIO' },
      ],
    };
  });

  fs.writeFileSync(FILE, JSON.stringify({ users, records }, null, 2));
}

export function getDB() {
  if (!fs.existsSync(FILE)) seed();
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

export function saveDB(db) {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

export function nextRtiId(db) {
  const year = new Date().getFullYear();
  let n = db.records.length + 1;
  let id;
  do {
    id = `RTI-${year}-${String(n).padStart(4, '0')}`;
    n++;
  } while (db.records.some((r) => r.id === id));
  return id;
}

export const safeUser = (u) => {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
};

export function getStats() {
  const db = getDB();
  const done = db.records.filter((r) => r.status === 'responded');
  const avgDays = done.length
    ? Math.round(done.reduce((a, r) => a + (new Date(r.responseDate) - new Date(r.createdAt)) / 86400000, 0) / done.length)
    : 0;
  return { total: db.records.length, responded: done.length, avgDays, departments: DEPARTMENTS.length };
}
