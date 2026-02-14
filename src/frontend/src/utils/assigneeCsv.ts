// Utility for generating and parsing assignee/captain CSV files

export interface AssigneeRow {
  assigneeName: string;
  captainName: string;
}

export function generateAssigneeTemplate(): string {
  const headers = ['Assignee Name', 'Captain Name'];
  const exampleRow = ['John Doe', 'Jane Smith'];
  
  return [headers.join(','), exampleRow.join(',')].join('\n');
}

export function downloadAssigneeTemplate(): void {
  const csvContent = generateAssigneeTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'assignee_import_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseAssigneeCsv(csvText: string): { data: AssigneeRow[]; errors: string[] } {
  const errors: string[] = [];
  const data: AssigneeRow[] = [];
  
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length === 0) {
    errors.push('CSV file is empty');
    return { data, errors };
  }
  
  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const assigneeIndex = headers.findIndex(h => 
    h.toLowerCase() === 'assignee name' || h.toLowerCase() === 'assignee'
  );
  const captainIndex = headers.findIndex(h => 
    h.toLowerCase() === 'captain name' || h.toLowerCase() === 'captain'
  );
  
  if (assigneeIndex === -1) {
    errors.push('Missing required column: "Assignee Name"');
  }
  if (captainIndex === -1) {
    errors.push('Missing required column: "Captain Name"');
  }
  
  if (errors.length > 0) {
    return { data, errors };
  }
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    
    const values = parseCSVLine(line);
    
    const assigneeName = values[assigneeIndex]?.trim() || '';
    const captainName = values[captainIndex]?.trim() || '';
    
    // Skip completely blank rows
    if (!assigneeName && !captainName) {
      continue;
    }
    
    if (!assigneeName) {
      errors.push(`Row ${i + 1}: Missing assignee name`);
      continue;
    }
    if (!captainName) {
      errors.push(`Row ${i + 1}: Missing captain name`);
      continue;
    }
    
    data.push({
      assigneeName,
      captainName,
    });
  }
  
  return { data, errors };
}

// Helper to parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}
