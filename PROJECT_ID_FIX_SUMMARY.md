# Project ID Data Inconsistency Fix

## Problem Description

The tasks collection had a data inconsistency where the `projectId` field contained mixed formats:
- Some tasks had `projectId` as ObjectId references (e.g., `'68958a8d58c688838d7b2fd8'`)
- Other tasks had `projectId` as string values (e.g., `'Admin Portal'`, `'Query Tracker'`)

This caused issues with the project endpoints not returning all associated tasks when querying by project ID.

## Solution Implemented

### 1. Updated Project Controller Methods

**Modified `getProjectById` method:**
- Now searches for tasks using `$or` query to match both project ID and project title
- Query: `{ $or: [{ projectId: project._id.toString() }, { projectId: project._id }, { projectId: project.title }] }`

**Modified `getProjectTasks` method:**
- First fetches the project to get both ID and title
- Then searches for tasks using the same `$or` query pattern
- Added proper error handling for project not found scenarios

### 2. Created Migration Script

**File:** `migration-standardize-project-ids.js`

**Purpose:** Standardize all task projectId references to use ObjectId format

**Features:**
- Finds tasks with string projectId values
- Looks up corresponding projects by title
- Updates tasks with proper ObjectId references
- Validates existing ObjectId references
- Reports orphaned or invalid references
- Provides detailed migration summary

### 3. Updated Package.json Scripts

Added new migration script:
```json
"migrate:standardize-project-ids": "node migration-standardize-project-ids.js"
```

Updated the `migrate:all` script to include the new migration.

### 4. Updated Documentation

- Updated API documentation to explain mixed format handling
- Added migration endpoint documentation
- Updated response examples to show both formats

## Usage

### Running the Migration

```bash
# Run only the project ID standardization
npm run migrate:standardize-project-ids

# Run all migrations
npm run migrate:all
```

### API Endpoints Affected

1. **GET /api/projects/{projectId}** - Now returns all tasks regardless of projectId format
2. **GET /api/projects/{projectId}/tasks** - Now returns all tasks regardless of projectId format

### Query Logic

The updated endpoints now use this query pattern:
```javascript
const tasks = await Task.find({ 
  $or: [
    { projectId: project._id.toString() },  // String ObjectId
    { projectId: project._id },             // ObjectId
    { projectId: project.title }            // Project title string
  ]
})
```

## Benefits

1. **Backward Compatibility:** Existing tasks with string projectId values continue to work
2. **Complete Data Retrieval:** All tasks are returned regardless of projectId format
3. **Data Standardization:** Migration script helps clean up inconsistent data
4. **Future-Proof:** New tasks should use ObjectId references for consistency

## Recommendations

1. **Run the migration** to standardize existing data
2. **Update task creation logic** to always use ObjectId references for projectId
3. **Monitor the migration output** for any orphaned references that need manual attention
4. **Consider adding validation** to prevent future string projectId values

## Migration Output Example

```
Starting project ID standardization migration...
Connected to MongoDB
Found 15 tasks with string projectId values
✓ Updated task TASK-0001: "Admin Portal" -> "Admin Portal" (68958a8d58c688838d7b2fd8)
✓ Updated task TASK-0002: "Query Tracker" -> "Query Tracker" (68958a8d58c688838d7b2fd9)
Found 45 tasks with ObjectId projectId values
⚠ Task TASK-0003: Invalid ObjectId reference "invalid-id" - no project found

=== Migration Summary ===
Total tasks with string projectId: 15
Successfully updated: 14
Total tasks with ObjectId projectId: 45
Errors encountered: 2

Project ID standardization completed!
```

## Files Modified

1. `controllers/projectController.js` - Updated query logic
2. `migration-standardize-project-ids.js` - New migration script
3. `package.json` - Added migration script
4. `API_DOCUMENTATION.md` - Updated documentation
5. `PROJECT_ID_FIX_SUMMARY.md` - This summary document
