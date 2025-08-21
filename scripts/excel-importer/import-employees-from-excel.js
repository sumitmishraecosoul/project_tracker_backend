const path = require('path');
const fs = require('fs');
// Prefer .env next to this script; fallback to CWD
const localEnvPath = path.resolve(__dirname, '.env');
if (fs.existsSync(localEnvPath)) {
  require('dotenv').config({ path: localEnvPath });
} else {
  require('dotenv').config();
}
// IMPORTANT: Use the root mongoose instance so models and connection match
const mongoose = require('../../node_modules/mongoose');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');

// Use project's User model by resolving relative path to root
const User = require('../../models/User');

const MONGO_URI = "mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/project-tracker?retryWrites=true&w=majority" || process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set. Create a .env file in this folder or set env var.');
  process.exit(1);
}

async function hashDefaultPassword() {
  const defaultPassword = "123456" || process.env.DEFAULT_EMPLOYEE_PASSWORD || 'ChangeMe@123';
  return bcrypt.hash(defaultPassword, 10);
}

function readSheet(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
}

function normalizeRole(roleCellValue) {
  const v = String(roleCellValue || '').trim().toLowerCase();
  return v === 'manager' ? 'manager' : 'employee';
}

function normalizeDepartment(dep) {
  const map = new Map([
    ['supply chain-operations', 'Supply Chain-Operations'],
    ['supply chain & operation', 'Supply Chain & Operation'],
    ['supply chain', 'Supply Chain'],
    ['human resources and administration', 'Human Resources and Administration'],
    ['hr', 'Human Resources and Administration'],
    ['new product design', 'New Product Design'],
    ['india e-commerce', 'India E-commerce'],
    ['e-commerce', 'E-commerce'],
    ['retail e-commerce', 'Retail E-commerce'],
    ['data analytics', 'Data Analytics'],
    ['finance & accounts', 'Finance & Accounts'],
    ['finance', 'Finance & Accounts'],
    ['zonal sales (india)- horeca', 'Zonal Sales (India)- HORECA'],
    ['zonal sales (india)', 'Zonal Sales (India)'],
    ['zonal sales', 'Zonal Sales'],
    ['digital marketing', 'Digital Marketing']
  ]);
  const key = String(dep || '').trim().toLowerCase();
  return map.get(key) || 'India E-commerce';
}

async function run() {
  try {
    const excelPathArg = process.argv[2];
    if (!excelPathArg) {
      console.error('Usage: node import-employees-from-excel.js <path-to-excel-file>');
      process.exit(1);
    }
    const excelPath = path.resolve(excelPathArg);
    const rows = readSheet(excelPath);
    if (!rows.length) {
      console.log('No rows found in the Excel file');
      process.exit(0);
    }

    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const hashed = await hashDefaultPassword();

    let createdCount = 0;
    let updatedCount = 0;
    let linkedManagers = 0;
    const errors = [];

    // First pass: upsert all users without relying on manager links
    const existingUsers = await User.find({}).select('email _id employeeNumber name');
    const emailToId = new Map(existingUsers.map(u => [String(u.email).toLowerCase(), u._id]));
    const empNoToId = new Map(existingUsers.filter(u => u.employeeNumber).map(u => [String(u.employeeNumber).toLowerCase(), u._id]));
    const nameToId = new Map(existingUsers.map(u => [String(u.name).toLowerCase(), u._id]));

    for (const row of rows) {
      try {
        const employeeNumber = String(row['Employee Number'] || row['employeeNumber'] || row['EmpNo'] || '').trim() || null;
        const fullName = String(row['Full Name'] || row['fullName'] || row['Name'] || '').trim();
        const workEmail = String(row['Work Email'] || row['workEmail'] || row['Email'] || '').trim().toLowerCase();
        const department = normalizeDepartment(row['Department'] || row['department']);
        const location = String(row['Location'] || row['location'] || '').trim() || null;
        const jobTitle = String(row['Job Title'] || row['jobTitle'] || '').trim() || null;
        const role = normalizeRole(row['Role'] || row['role']);

        if (!fullName || !workEmail) {
          errors.push({ workEmail, reason: 'Missing Full Name or Work Email' });
          continue;
        }

        const existing = await User.findOne({ email: workEmail }).select('_id');
        if (!existing) {
          const created = await User.create({
            name: fullName,
            email: workEmail,
            password: hashed,
            role,
            department,
            employeeNumber,
            jobTitle,
            location
          });
          createdCount += 1;
          emailToId.set(workEmail, created._id);
          if (employeeNumber) empNoToId.set(employeeNumber.toLowerCase(), created._id);
          nameToId.set(fullName.toLowerCase(), created._id);
        } else {
          await User.updateOne({ _id: existing._id }, { $set: {
            name: fullName,
            role,
            department,
            employeeNumber,
            jobTitle,
            location
          }});
          updatedCount += 1;
          emailToId.set(workEmail, existing._id);
          if (employeeNumber) empNoToId.set(employeeNumber.toLowerCase(), existing._id);
          nameToId.set(fullName.toLowerCase(), existing._id);
        }
      } catch (rowErr) {
        errors.push({ row, reason: rowErr.message });
      }
    }

    // Second pass: link managers by email, employee number, or name
    for (const row of rows) {
      try {
        const fullName = String(row['Full Name'] || row['fullName'] || row['Name'] || '').trim();
        const workEmail = String(row['Work Email'] || row['workEmail'] || row['Email'] || '').trim().toLowerCase();
        const managerEmailRaw = String(row['Manager Email'] || row['managerEmail'] || '').trim().toLowerCase();
        const managerEmpNo = String(row['Manager Employee Number'] || row['managerEmployeeNumber'] || '').trim().toLowerCase();
        const managerName = String(row['Manager Name'] || row['managerName'] || '').trim().toLowerCase();

        const userId = emailToId.get(workEmail);
        if (!userId) continue;

        let managerId = null;
        if (managerEmailRaw) managerId = emailToId.get(managerEmailRaw) || null;
        if (!managerId && managerEmpNo) managerId = empNoToId.get(managerEmpNo) || null;
        if (!managerId && managerName) managerId = nameToId.get(managerName) || null;

        if (managerId) {
          await User.updateOne({ _id: userId }, { $set: { manager: managerId } });
          linkedManagers += 1;
        }
      } catch (rowErr) {
        errors.push({ row, reason: rowErr.message });
      }
    }

    console.log(`Import complete. Created: ${createdCount}, Updated: ${updatedCount}, Manager links: ${linkedManagers}, Errors: ${errors.length}`);
    if (errors.length) {
      console.log('Errors sample:', errors.slice(0, 5));
    }
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
}

run();


