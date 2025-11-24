
export const convertToCSV = (objArray: any[]) => {
  if (objArray.length === 0) return '';
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = '';
  
  // Header
  str += Object.keys(array[0]).join(',') + '\r\n';
  
  // Rows
  for (let i = 0; i < array.length; i++) {
      let line = '';
      for (const index in array[i]) {
          if (line !== '') line += ',';
          const val = array[i][index];
          const stringVal = val === null || val === undefined ? '' : val.toString();
          // Escape quotes and handle commas
          const escapedVal = stringVal.replace(/"/g, '""');
          line += `"${escapedVal}"`;
      }
      str += line + '\r\n';
  }
  return str;
};

export const downloadCSV = (data: any[], filename: string) => {
  const csvData = convertToCSV(data);
  // Add BOM for Excel to recognize UTF-8
  const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
