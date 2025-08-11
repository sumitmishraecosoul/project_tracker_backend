# Project Tracker Backend Migration Guide

This guide explains how to fix the backend issues in your project tracker API.

## Issues Fixed

1. **Task ID Counter Issue**: Fixed the stuck task ID counter that was causing duplicate key errors (E11000)
2. **Inconsistent assignedTo Field**: Updated tasks to always store user IDs instead of names/emails
3. **API Response Format**: Ensured consistent response formats across all endpoints
4. **Error Handling**: Added proper error handling for duplicate key errors

## Migration Steps

### Step 1: Stop the Server
First, stop your running server to prevent any conflicts during migration.

### Step 2: Run the Migration Scripts

#### Option A: Run All Migrations at Once
```bash
npm run migrate:all
```

#### Option B: Run Migrations Separately

1. **Reset Task ID Counter** (fixes the stuck TASK-0006 issue):
   ```bash
   npm run migrate:reset-task-counter
   ```

2. **Fix Task User References** (converts names/emails to user IDs):
   ```bash
   npm run migrate:fix-task-users
   ```

### Step 3: Restart the Server
```bash
npm start
```

## What the Migrations Do

### Task ID Counter Reset (`migrate:reset-task-counter`)
- Analyzes all existing tasks to find the highest task ID number
- Identifies any gaps in the task numbering sequence
- Ensures the next task will get the correct sequential ID
- Fixes the issue where the counter was stuck on 'TASK-0006'

### Task User Migration (`migrate:fix-task-users`)
- Scans all existing tasks for `assignedTo` and `reporter` fields
- Converts string values (names/emails) to proper MongoDB ObjectIds
- Links tasks to actual User documents in the database
- Reports any users that couldn't be found for manual review

## API Changes

### Task Model Updates
- `assignedTo` and `reporter` fields now reference User model ObjectIds
- Added pre-save middleware with retry logic for task ID generation
- Added post-save middleware to handle duplicate key errors

### Response Format Changes
- **GET /api/tasks**: Returns array directly, not wrapped in data/items
- **GET /api/users**: Returns array directly, not wrapped in data/items  
- **POST /api/tasks**: Returns created task with populated user details
- All endpoints now include proper error handling with specific error messages

### Error Handling Improvements
- Specific error messages for duplicate key errors (409 status)
- Better validation for user references
- Consistent error response format across all endpoints

## Frontend Compatibility

The updated API now:
- Always returns user IDs in `assignedTo` and `reporter` fields
- Provides consistent response structures
- Includes populated user details (name, email) for display
- Handles errors gracefully with specific messages

## Verification

After running migrations, verify the fixes:

1. **Check Task Creation**: Try creating a new task - it should get the next sequential ID
2. **Check User References**: Verify that tasks show proper user IDs in assignedTo/reporter fields
3. **Check API Responses**: Ensure all endpoints return consistent formats

## Troubleshooting

### If Migration Fails
- Check your MongoDB connection string in `.env`
- Ensure you have proper permissions to read/write to the database
- Review the error logs for specific issues

### If Users Are Not Found
- The migration will report any users that couldn't be matched
- You may need to manually create missing users or update task assignments

### If Task ID Issues Persist
- Run the reset counter script again
- Check for any manual task ID assignments that might conflict

## Rollback (If Needed)

If you need to rollback the changes:
1. Restore your database from a backup taken before migration
2. Revert the code changes in the model and controller files
3. Restart the server

## Support

If you encounter any issues during migration, check the console output for detailed error messages and ensure your MongoDB connection is working properly.
