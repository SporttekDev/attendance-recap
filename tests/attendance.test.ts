import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyPatch, buildRows, bulanText, calc, rowDates, summarize } from '../lib/attendance';
import { buildEmployees, parseStamp, periodOf } from '../lib/parse';
import { createSample } from '../lib/sample';
import type { Ctx, Employee } from '../lib/types';

const cfg = { masuk: '08:00', tol: 10, lemburMulai: '17:30', lemburBatas: '18:30' };
const ctxFor = (start: string, end: string, holidays: string[] = []): Ctx => ({ cfg, holidays, period: { start, end } });

const emp = (scans: Employee['scans'], edits: Employee['edits'] = {}): Employee => ({
  key: 't|T', name: 'T', dept: '', full: 'T', scans, edits,
});

describe('data contoh (cocok dengan PDF referensi)', () => {
  const sample = createSample();
  const ctx = ctxFor('2026-09-21', '2026-10-20');
  const rows = buildRows(sample, ctx);
  const t = summarize(rows);

  it('menampilkan 23 baris: 22 hari kerja + 26/09 manual', () => {
    assert.equal(rows.length, 23);
    assert.ok(rows.some((r) => r.iso === '2026-09-26'));
  });
  it('total menit telat 243', () => assert.equal(t.telat, 243));
  it('total menit lembur 365 dari input manual', () => assert.equal(t.lembur, 365));
  it('hari lembur 0 karena tidak ada kerja di akhir pekan', () => assert.equal(t.hari, 0));
  it('hanya 12/10 yang belum ada keterangan', () => {
    assert.deepEqual(rows.filter((r) => r.c.missing).map((r) => r.iso), ['2026-10-12']);
  });
  it('periode otomatis dari scan, judul bulan dari tanggal akhir', () => {
    const p = periodOf([sample]);
    assert.deepEqual(p, { start: '2026-09-21', end: '2026-10-20' });
    assert.equal(bulanText(p, ''), 'OKTOBER 2026');
    assert.equal(bulanText(p, 'NOVEMBER 2026'), 'NOVEMBER 2026');
  });
});

describe('menit telat', () => {
  const ctx = ctxFor('2026-10-05', '2026-10-05');
  const telat = (min: number) => calc(emp({ '2026-10-05': [min, 1020] }), '2026-10-05', ctx).telat;
  it('08:10 tidak telat', () => assert.equal(telat(490), 0));
  it('08:11 telat 1 menit', () => assert.equal(telat(491), 1));
  it('09:10 telat 60 menit', () => assert.equal(telat(550), 60));
  it('bisa ditimpa manual, termasuk 0', () => {
    const e = emp({ '2026-10-05': [550, 1020] }, { '2026-10-05': { telat: 0 } });
    assert.equal(calc(e, '2026-10-05', ctx).telat, 0);
  });
});

describe('lembur', () => {
  const ctx = ctxFor('2026-10-05', '2026-10-05');
  const c = (pulang: number, edit = {}) => calc(emp({ '2026-10-05': [480, pulang] }, { '2026-10-05': edit }), '2026-10-05', ctx);
  it('tidak pernah terisi otomatis', () => assert.equal(c(1134).lembur, 0));
  it('saran muncul jika pulang lewat 18:30 (dari 17:30)', () => assert.equal(c(1134).saran, 84));
  it('tidak ada saran tepat 18:30 atau lebih awal', () => {
    assert.equal(c(1110).saran, 0);
    assert.equal(c(1108).saran, 0);
  });
  it('saran hilang setelah lembur diisi', () => assert.equal(c(1134, { lembur: 60 }).saran, 0));
});

describe('hari lembur', () => {
  const ctx = ctxFor('2026-10-03', '2026-10-05');
  it('scan hari Sabtu dihitung 1 hari lembur tanpa telat', () => {
    const r = calc(emp({ '2026-10-03': [600, 780] }), '2026-10-03', ctx);
    assert.equal(r.hari, 1);
    assert.equal(r.telat, 0);
  });
  it('status Proyek tidak dihitung hari lembur', () => {
    const r = calc(emp({ '2026-10-03': [600, 780] }, { '2026-10-03': { status: 'Proyek' } }), '2026-10-03', ctx);
    assert.equal(r.hari, 0);
  });
  it('tanggal merah di hari kerja dengan scan dihitung hari lembur', () => {
    const c2 = ctxFor('2026-10-05', '2026-10-05', ['2026-10-05']);
    assert.equal(calc(emp({ '2026-10-05': [480, 1020] }), '2026-10-05', c2).hari, 1);
  });
  it('baris manual akhir pekan dengan jam diisi sendiri dihitung 1', () => {
    const e = emp({}, { '2026-10-04': { manual: true, masuk: '09:00', pulang: '13:00' } });
    assert.equal(calc(e, '2026-10-04', ctx).hari, 1);
  });
  it('hari lembur bisa diisi langsung tanpa jam', () => {
    const e = emp({}, { '2026-10-04': { manual: true, hari: 1 } });
    assert.equal(calc(e, '2026-10-04', ctx).hari, 1);
  });
});

describe('baris yang tampil', () => {
  it('akhir pekan tanpa scan tidak tampil, baris manual tampil', () => {
    const ctx = ctxFor('2026-10-02', '2026-10-06');
    const e = emp({}, { '2026-10-04': { manual: true, status: 'Proyek' } });
    assert.deepEqual(rowDates(e, ctx), ['2026-10-02', '2026-10-04', '2026-10-05', '2026-10-06']);
  });
  it('tanggal merah di hari kerja tanpa scan tidak tampil', () => {
    const ctx = ctxFor('2026-10-05', '2026-10-06', ['2026-10-05']);
    assert.deepEqual(rowDates(emp({}), ctx), ['2026-10-06']);
  });
  it('scan di luar periode diabaikan', () => {
    const ctx = ctxFor('2026-10-05', '2026-10-05');
    assert.deepEqual(rowDates(emp({ '2026-10-02': [480] }), ctx), ['2026-10-05']);
  });
});

describe('scan tunggal dan penimpaan jam', () => {
  const ctx = ctxFor('2026-10-05', '2026-10-05');
  it('satu scan pagi = jam masuk', () => {
    const r = calc(emp({ '2026-10-05': [483] }), '2026-10-05', ctx);
    assert.equal(r.masuk, 483);
    assert.equal(r.pulang, null);
  });
  it('satu scan setelah 12:00 = jam pulang, tanpa telat', () => {
    const r = calc(emp({ '2026-10-05': [1044] }), '2026-10-05', ctx);
    assert.equal(r.masuk, null);
    assert.equal(r.pulang, 1044);
    assert.equal(r.telat, 0);
  });
  it('"-" mengosongkan jam dari mesin', () => {
    const r = calc(emp({ '2026-10-05': [483, 1044] }, { '2026-10-05': { pulang: '-' } }), '2026-10-05', ctx);
    assert.equal(r.pulang, null);
  });
});

describe('keterangan PDF', () => {
  const ctx = ctxFor('2026-10-05', '2026-10-05');
  const ket = (edit = {}) => calc(emp({}, { '2026-10-05': edit }), '2026-10-05', ctx).ket;
  it('izin diawali status', () => assert.equal(ket({ status: 'Izin', note: 'Acara keluarga' }), 'Izin: Acara keluarga'));
  it('sakit tanpa catatan hanya status', () => assert.equal(ket({ status: 'Sakit' }), 'Sakit'));
  it('proyek memakai catatan apa adanya', () => assert.equal(ket({ status: 'Proyek', note: 'Event X' }), 'Event X'));
  it('catatan tanpa status', () => assert.equal(ket({ note: 'Update data' }), 'Update data'));
});

describe('parseStamp', () => {
  it('teks dd/mm/yyyy hh:mm', () => assert.deepEqual(parseStamp('21/09/2026 08:25'), { iso: '2026-09-21', min: 505 }));
  it('teks ISO', () => assert.deepEqual(parseStamp('2026-09-21 18:54'), { iso: '2026-09-21', min: 1134 }));
  it('serial Excel', () => {
    const days = (Date.UTC(2026, 8, 21) - Date.UTC(1899, 11, 30)) / 86400000;
    assert.deepEqual(parseStamp(days + 505 / 1440), { iso: '2026-09-21', min: 505 });
  });
  it('objek Date lokal', () => assert.deepEqual(parseStamp(new Date(2026, 8, 21, 8, 25)), { iso: '2026-09-21', min: 505 }));
  it('sel kosong atau sampah', () => {
    assert.equal(parseStamp(null), null);
    assert.equal(parseStamp('bukan tanggal'), null);
  });
});

describe('buildEmployees', () => {
  const head = ['Departemen', 'Nama', 'No.ID', 'Tgl/Waktu', 'Lokasi ID', 'No.PIN', 'Kode Verifikasi'];
  it('membaca format ekspor mesin dan mengelompokkan per karyawan', () => {
    const rows = [
      head,
      ['STI', 'RIFQI', '28', '21/09/2026 08:25', '207', null, 'Sidik Jari'],
      ['STI', 'RIFQI', '28', '21/09/2026 18:54', '207', null, 'Sidik Jari'],
      ['STI', 'BUDI', '31', '21/09/2026 08:00', '207', null, 'Sidik Jari'],
      [null, null, null, null, null, null, null],
    ];
    const { employees, scanCount } = buildEmployees(rows);
    assert.equal(employees.length, 2);
    assert.equal(scanCount, 3);
    assert.deepEqual(employees[0].scans['2026-09-21'], [505, 1134]);
    assert.equal(employees[0].full, 'RIFQI');
  });
  it('scan ganda pada menit yang sama dihitung sekali', () => {
    const rows = [head, ['STI', 'A', '1', '21/09/2026 08:25', '', '', ''], ['STI', 'A', '1', '21/09/2026 08:25', '', '', '']];
    assert.equal(buildEmployees(rows).scanCount, 1);
  });
  it('memakai nama lengkap tersimpan', () => {
    const rows = [head, ['STI', 'RIFQI', '28', '21/09/2026 08:25', '', '', '']];
    const { employees } = buildEmployees(rows, { names: { '28|RIFQI': 'MUHAMMAD RIFQI AZHAR' } });
    assert.equal(employees[0].full, 'MUHAMMAD RIFQI AZHAR');
  });
  it('error jelas jika kolom Tgl/Waktu tidak ada', () => {
    assert.throws(() => buildEmployees([['a', 'b'], ['1', '2']]), /Tgl\/Waktu/);
  });
});

describe('applyPatch', () => {
  it('menambah dan menghapus field, dan membuang entri kosong', () => {
    let e = applyPatch({}, '2026-10-05', { status: 'Izin', note: 'x' });
    assert.deepEqual(e['2026-10-05'], { status: 'Izin', note: 'x' });
    e = applyPatch(e, '2026-10-05', { status: '' as never, note: undefined });
    assert.equal(e['2026-10-05'], undefined);
  });
  it('tidak mengubah objek asli', () => {
    const before = { '2026-10-05': { note: 'a' } };
    applyPatch(before, '2026-10-05', { note: 'b' });
    assert.equal(before['2026-10-05'].note, 'a');
  });
});
