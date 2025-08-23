'use client';
import { useState, useMemo } from 'react';
import { API_BASE } from '@/lib/api';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState<any>(null);
  const [grayscale, setGrayscale] = useState(false);

  const previewURL = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
  const uploadedURL = uploaded ? `${API_BASE}${uploaded.url}` : '';

  const onUpload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE}/uploads`, { method: 'POST', body: fd });
    const data = await res.json();
    setUploaded(data);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">อัปโหลดไฟล์เพื่อพิมพ์</h1>

      <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} />

      {file && (
        <div className="border rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={grayscale} onChange={e => setGrayscale(e.target.checked)} />
              พรีวิวแบบขาวดำ (เฉพาะพรีวิว)
            </label>
          </div>

          {file.type === 'application/pdf' ? (
            <p className="text-sm text-gray-500">* พรีวิว PDF แบบย่อ (กรุณาดาวน์โหลดหรืออัปโหลดเพื่อใช้งานจริง)</p>
          ) : (
            <img
              src={previewURL}
              alt="preview"
              className="max-h-96"
              style={{ filter: grayscale ? 'grayscale(100%)' : 'none' }}
            />
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onUpload} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50" disabled={!file}>
          อัปโหลด
        </button>
        {uploaded && (
          <a href={uploadedURL} target="_blank" className="px-4 py-2 rounded border">ดูไฟล์ที่อัปโหลด</a>
        )}
      </div>
    </div>
  );
}