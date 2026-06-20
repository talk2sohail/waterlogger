import type { WaterEntry } from '@/lib/types';

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string): string {
  const cleaned = value.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/"/g, '""');
  return `"${cleaned}"`;
}

export function exportAsCSV(entries: WaterEntry[]) {
  const header = 'id,amountMl,timestamp,type,note\n';
  const rows = entries
    .map((e) => [e.id, e.amountMl, e.timestamp, e.type, escapeCsvField(e.note ?? '')].join(','))
    .join('\n');
  downloadBlob(header + rows, `waterlogger-export-${Date.now()}.csv`, 'text/csv');
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && i + 1 < line.length && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) { result.push(cur); cur = ''; }
    else cur += c;
  }
  result.push(cur);
  return result;
}

export function parseCSV(text: string): WaterEntry[] {
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  const entries: WaterEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const v = parseCSVLine(lines[i]);
    if (v.length < 4) continue;
    const amount = Number(v[1]);
    if (!amount || amount <= 0) continue;
    entries.push({
      id: v[0] || crypto.randomUUID(),
      amountMl: amount,
      timestamp: v[2] || new Date().toISOString(),
      type: (['water', 'tea', 'coffee', 'juice', 'other'].includes(v[3]) ? v[3] : 'water') as WaterEntry['type'],
      note: v[4] || undefined,
    });
  }
  return entries;
}
