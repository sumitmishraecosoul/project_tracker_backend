# Excel Employee Importer (Temporary Tool)

This is a standalone, throwaway helper to bulk import employees from an Excel file into your Project Tracker database. It is not required by the app and can be deleted anytime.

## Usage

1. Create a `.env` file in this folder:
```
MONGO_URI=mongodb://localhost:27017/project-tracker
DEFAULT_EMPLOYEE_PASSWORD=ChangeMe@123
```

2. Install dependencies locally in this folder:
```
npm install
```

3. Run the importer:
```
node import-employees-from-excel.js "C:\\path\\to\\employees.xlsx"
```

## Columns (case-insensitive)
- Employee Number
- Full Name
- Work Email
- Department
- Location
- Job Title
- Role (value "Manager" => manager, anything else => employee)
- Manager Email (optional)

## Notes
- Upsert by Work Email.
- Existing users are updated; new users are created with the default password.
- Manager is linked by matching Manager Email to an existing user.


