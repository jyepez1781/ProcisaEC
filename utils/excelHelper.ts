
// @ts-ignore
import { utils, writeFile, read } from 'xlsx';

// Genera una plantilla Excel vacía con encabezados
export const generateExcelTemplate = (headers: string[], filename: string) => {
  const ws = utils.aoa_to_sheet([headers]);
  
  const wscols = headers.map(h => ({ wch: h.length + 5 }));
  ws['!cols'] = wscols;

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Plantilla");

  writeFile(wb, `${filename}.xlsx`);
};

// Genera un Excel con datos prellenados con auto-ajuste de columnas
export const generateExcelFromData = (data: any[], filename: string) => {
  const ws = utils.json_to_sheet(data);
  
  // Calcular ancho de columnas basado en contenido y encabezados
  if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const wscols = headers.map(header => {
          let maxLen = header.length;
          
          // Escanear las primeras 50 filas para determinar ancho óptimo
          const previewRows = data.slice(0, 50);
          previewRows.forEach(row => {
              const val = row[header];
              const len = val ? String(val).length : 0;
              if (len > maxLen) maxLen = len;
          });

          return { wch: Math.min(maxLen + 5, 50) }; // Buffer de 5 caracteres, max 50 ancho
      });
      ws['!cols'] = wscols;
  }

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Datos");
  writeFile(wb, `${filename}.xlsx`);
};

export const parseExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
