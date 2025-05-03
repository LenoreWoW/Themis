# Excel Export Implementation Update

This document provides detailed instructions for updating the Excel export functionality from using the vulnerable `xlsx` package to the more secure `exceljs` package.

## Required Changes

### 1. Update Import Statement

Change the import statement at the top of your `exportUtils.ts` file:

```typescript
// FROM:
import * as XLSX from 'xlsx';

// TO:
import Excel from 'exceljs';
```

### 2. Replace the exportToExcel Function

Replace the entire `exportToExcel` function in `exportUtils.ts` with the implementation below:

```typescript
export const exportToExcel = async (data: any[], columns: any[], title: string): Promise<void> => {
  // Create a new workbook
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet(title);
  
  // Add headers
  worksheet.columns = columns.map(col => ({
    header: col.headerName,
    key: col.field,
    width: 20
  }));
  
  // Add data rows
  data.forEach(item => {
    const row: any = {};
    columns.forEach(col => {
      // Format dates if needed
      if (typeof item[col.field] === 'object' && item[col.field] instanceof Date) {
        row[col.field] = formatDate(item[col.field]);
      } else {
        row[col.field] = item[col.field];
      }
    });
    worksheet.addRow(row);
  });
  
  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2196F3' }
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFF' }
    };
  });
  
  // Generate the Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  // Create download link and trigger click
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
```

### 3. Update Type Definitions for jsPDF

While updating the Excel export functionality, you should also update the jsPDF type definition for consistency:

```typescript
// FROM:
interface CustomJsPDF extends jsPDF {
  autoTable: (options: any) => CustomJsPDF;
  internal: {
    pageSize: {
      width: number;
      height: number;
      getWidth: () => number;
      getHeight: () => number;
    };
    pages: any[];
    events: any;
    scaleFactor: number;
    getNumberOfPages: () => number;
    getEncryptor: (objectId: number) => (data: string) => string;
  };
}

// TO:
interface ExtendedJsPDF extends jsPDF {
  autoTable: (options: any) => void;
  internal: any;
}
```

Replace all instances of `CustomJsPDF` with `ExtendedJsPDF` in your file.

## Key Differences Between xlsx and exceljs

1. **API Structure**:
   - `xlsx` uses a more functional approach
   - `exceljs` uses a more object-oriented approach

2. **Async vs Sync**:
   - `xlsx` operations are mostly synchronous
   - `exceljs` file generation is asynchronous (returns Promises)

3. **Styling**:
   - `exceljs` provides more granular control over cell styling

## Testing Your Changes

After implementing these changes, test the export functionality by:

1. Exporting projects, tasks, or any other data that uses the Excel export
2. Verify that the generated Excel file has the correct data and formatting
3. Check that the column headers are bold and properly colored
4. Ensure dates and other special data types are properly formatted

## Troubleshooting

If you encounter issues:

1. **Type Errors**: Ensure you've imported `Excel` correctly and that type definitions are properly updated
2. **Missing Data**: Verify that the column field names match the property names in your data objects
3. **Styling Issues**: Check that the styling properties match the exceljs documentation

## Further Customization

The provided implementation includes basic styling for headers. You can further customize the appearance by:

1. Adding alternating row colors
2. Applying conditional formatting
3. Adjusting column widths based on content
4. Adding borders or other styling features

Refer to the [exceljs documentation](https://github.com/exceljs/exceljs) for additional customization options. 