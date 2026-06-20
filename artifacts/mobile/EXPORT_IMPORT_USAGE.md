still nmo mport Endpoints Usage Guide

This document explains how to use the newly implemented export and import endpoints in the mobile app.

## Available Endpoints

### Export Endpoints

1. **Export Members to Excel**
   - Endpoint: `GET /api/v1/orgs/{org_slug}/export/members/excel/`
   - Service Method: `exportService.downloadMembersExcel(slug, search?, filter?)`
   - Parameters:
     - `slug` (required): Organization slug
     - `search` (optional): Search term for filtering members
     - `filter` (optional): Status filter (not_started, incomplete, complete, exceeded, pledged)
   - Returns: Blob (Excel file)

2. **Export Transactions to Excel**
   - Endpoint: `GET /api/v1/orgs/{org_slug}/export/transactions/excel/`
   - Service Method: `exportService.downloadTransactionsExcel(slug, dateFrom?, dateTo?)`
   - Parameters:
     - `slug` (required): Organization slug
     - `dateFrom` (optional): Filter transactions from this date (YYYY-MM-DD)
     - `dateTo` (optional): Filter transactions until this date (YYYY-MM-DD)
   - Returns: Blob (Excel file)

3. **Export Report to PDF**
   - Endpoint: `GET /api/v1/orgs/{org_slug}/export/report/pdf/`
   - Service Method: `exportService.downloadReportPDF(slug, search?, filter?)`
   - Parameters:
     - `slug` (required): Organization slug
     - `search` (optional): Search term for filtering members
     - `filter` (optional): Status filter (not_started, incomplete, complete, exceeded, pledged)
   - Returns: Blob (PDF file)

### Import Endpoint

1. **Import Members from Excel**
   - Endpoint: `POST /api/v1/orgs/{org_slug}/import/members/excel/`
   - Service Method: `importService.importMembersExcel(slug, file, updateExisting?, defaultPledge?)`
   - Parameters:
     - `slug` (required): Organization slug
     - `file` (required): Excel file to import
     - `updateExisting` (optional): Boolean to update existing members (default: false)
     - `defaultPledge` (optional): Default pledge amount (default: 70000)
   - Returns: Object with created_count, updated_count, transaction_count, errors, total_errors

## Usage Examples

### Export Members to Excel

```typescript
import { exportService } from '../services';

// Download all members
const blob = await exportService.downloadMembersExcel('my-org');

// Download with filters
const blob = await exportService.downloadMembersExcel('my-org', 'John', 'complete');

// Save the file (React Native example)
import { FileSystem } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const uri = FileSystem.cacheDirectory + 'members_export.xlsx';
await FileSystem.writeAsStringAsync(uri, await blob.text(), {
  encoding: FileSystem.EncodingType.Base64,
});
await Sharing.shareAsync(uri);
```

### Export Transactions to Excel

```typescript
import { exportService } from '../services';

// Download all transactions
const blob = await exportService.downloadTransactionsExcel('my-org');

// Download with date range
const blob = await exportService.downloadTransactionsExcel('my-org', '2025-01-01', '2025-01-31');
```

### Export Report to PDF

```typescript
import { exportService } from '../services';

// Download full report
const blob = await exportService.downloadReportPDF('my-org');

// Download with filters
const blob = await exportService.downloadReportPDF('my-org', '', 'incomplete');
```

### Import Members from Excel

```typescript
import { importService } from '../services';
import * as DocumentPicker from 'expo-document-picker';

// Pick a file
const result = await DocumentPicker.getDocumentAsync({
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
});

if (result.type === 'success') {
  // Import with default settings
  const importResult = await importService.importMembersExcel('my-org', result.file);
  
  console.log(`Created: ${importResult.created_count}`);
  console.log(`Updated: ${importResult.updated_count}`);
  console.log(`Transactions: ${importResult.transaction_count}`);
  console.log(`Errors: ${importResult.total_errors}`);
  
  // Import with custom settings
  const importResult = await importService.importMembersExcel(
    'my-org', 
    result.file, 
    true,  // update existing
    80000  // default pledge
  );
}
```

## Excel File Format for Import

The Excel file should have the following columns (first row as headers):

| Column | Required | Description |
|--------|----------|-------------|
| Name | Yes | Member name |
| Pledge | No | Pledge amount (default: 70000) |
| Paid | No | Amount already paid (default: 0) |
| Phone | No | Phone number |
| Email | No | Email address |
| Course | No | Course/field of study |
| Year | No | Year of study |

### Example Excel Data

```
Name | Pledge | Paid | Phone | Email | Course | Year
John Doe | 70000 | 20000 | +255123456789 | john@example.com | Computer Science | 3
Jane Smith | 80000 | 0 | +255987654321 | jane@example.com | Business | 2
```

## Error Handling

All service methods throw `ApiError` when something goes wrong. Always wrap calls in try-catch:

```typescript
try {
  const blob = await exportService.downloadMembersExcel('my-org');
  // Process the blob
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Export failed:', error.message);
    // Show error to user
  }
}
```

## Permissions

- **Export Members**: Requires organization member role
- **Export Transactions**: Requires organization admin role
- **Export Report PDF**: Requires organization member role
- **Import Members**: Requires organization staff role and active subscription

## File Size Limits

- Excel export: No specific limit (depends on data size)
- PDF export: No specific limit (depends on data size)
- Excel import: Recommended max 10MB for performance
