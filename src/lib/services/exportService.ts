import type { WaterEntry, Settings } from '@/lib/types';

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

export function exportAsJSON(entries: WaterEntry[], settings: Settings) {
  const data = { exportedAt: new Date().toISOString(), entries, settings };
  downloadBlob(JSON.stringify(data, null, 2), `waterlogger-export-${Date.now()}.json`, 'application/json');
}
