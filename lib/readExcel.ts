/** Baca sheet pertama dari file Excel/CSV di browser. SheetJS dimuat hanya saat dibutuhkan. */
export async function readExcelRows(file: File): Promise<unknown[][]> {
  const XLSX = await import('xlsx');
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) throw new Error('File tidak punya sheet.');
  return XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: null });
}
