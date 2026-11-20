'use client';

import { useEffect, useState, type InputHTMLAttributes } from 'react';
import { normalizeTime } from '@/lib/date';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  /** Nilai "HH:MM" (24 jam), atau string kosong. */
  value: string;
  /** Dipanggil dengan "HH:MM" yang valid, atau string kosong jika kolom dikosongkan. */
  onChange: (v: string) => void;
  /** Jika false, kolom tidak boleh dikosongkan dan akan kembali ke nilai sebelumnya. */
  allowEmpty?: boolean;
  'data-ov'?: string;
};

/**
 * Kolom jam 24 jam. Pengganti <input type="time"> yang tampil AM/PM mengikuti pengaturan bahasa
 * komputer. Ketik 0830, 8:30, atau 08.30; saat kolom ditinggalkan atau Enter, nilainya dirapikan
 * menjadi 08:30. Ketikan yang bukan jam (misalnya 25:00) ditandai merah dan tidak disimpan.
 */
export default function TimeInput({ value, onChange, allowEmpty = true, ...rest }: Props) {
  const [text, setText] = useState(value);
  const [bad, setBad] = useState(false);

  // Ikuti perubahan dari luar, misalnya setelah tombol reset atau ganti karyawan.
  useEffect(() => {
    setText(value);
    setBad(false);
  }, [value]);

  const commit = () => {
    if (text.trim() === '') {
      if (allowEmpty) {
        setBad(false);
        if (value !== '') onChange('');
      } else {
        setText(value);
        setBad(false);
      }
      return;
    }
    const n = normalizeTime(text);
    if (n === null) {
      setBad(true);
      return;
    }
    setText(n);
    setBad(false);
    if (n !== value) onChange(n);
  };

  return (
    <input
      {...rest}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      maxLength={5}
      placeholder="HH:MM"
      value={text}
      aria-invalid={bad ? true : undefined}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
      }}
    />
  );
}
