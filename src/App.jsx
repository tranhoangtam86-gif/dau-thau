import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FileText, ClipboardList, Handshake, FileSignature, Search, Trash2,
  Printer, Pencil, Plus, X, ChevronLeft, LayoutDashboard, Loader2,
  Save, Inbox, FolderKanban, Shield, UserPlus, EyeOff, Eye, Users, History,
  UserCog, Mail, Lock, Unlock, LogIn, LogOut, AlertCircle, Upload, CheckCircle2, XCircle,
  Tags, Download, FileSpreadsheet, Settings2, Send, ClipboardCheck, FileType2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { supabase } from './supabaseClient';

/* ------------------------------------------------------------------ */
/* Document type schemas                                               */
/* ------------------------------------------------------------------ */

const DOC_TYPES = {
  bao_gia: {
    key: 'bao_gia',
    label: 'Thu thập báo giá',
    short: 'Báo giá',
    icon: ClipboardList,
    docTitle: 'PHIẾU THU THẬP BÁO GIÁ',
    signLeft: 'Người thu thập',
    signRight: 'Người kiểm tra',
    dateField: 'ngayBaoGia',
    fields: [
      { name: 'maGoiThau', label: 'Mã gói thầu', type: 'text', required: true },
      { name: 'tenGoiThau', label: 'Tên gói thầu', type: 'text', required: true, wide: true },
      { name: 'tenDonVi', label: 'Tên đơn vị báo giá', type: 'text', required: true },
      { name: 'maSoThue', label: 'Mã số thuế', type: 'text' },
      { name: 'diaChi', label: 'Địa chỉ', type: 'text', wide: true },
      { name: 'ngayBaoGia', label: 'Ngày báo giá', type: 'date' },
      { name: 'nguoiThuThap', label: 'Người thu thập', type: 'text' },
      { name: 'hangMuc', label: 'Hạng mục hàng hóa / dịch vụ', type: 'items', wide: true },
      { name: 'ghiChu', label: 'Ghi chú', type: 'textarea', wide: true },
    ],
    listColumns: [
      { key: 'maGoiThau', label: 'Mã gói thầu' },
      { key: 'tenGoiThau', label: 'Tên gói thầu' },
      { key: 'tenDonVi', label: 'Đơn vị báo giá' },
      { key: 'ngayBaoGia', label: 'Ngày báo giá', date: true },
    ],
  },
  ho_so_yeu_cau: {
    key: 'ho_so_yeu_cau',
    label: 'Hồ sơ yêu cầu',
    short: 'Hồ sơ yêu cầu',
    icon: FileText,
    docTitle: 'HỒ SƠ YÊU CẦU CHỈ ĐỊNH THẦU',
    signLeft: 'Người lập',
    signRight: 'Người phê duyệt',
    dateField: 'ngayPhatHanh',
    fields: [
      { name: 'maGoiThau', label: 'Mã gói thầu', type: 'text', required: true },
      { name: 'tenGoiThau', label: 'Tên gói thầu', type: 'text', required: true, wide: true },
      { name: 'chuDauTu', label: 'Chủ đầu tư', type: 'text', wide: true },
      { name: 'giaGoiThau', label: 'Giá gói thầu (VNĐ)', type: 'number' },
      { name: 'hinhThuc', label: 'Hình thức chỉ định thầu', type: 'select',
        options: ['Chỉ định thầu rút gọn', 'Chỉ định thầu thông thường'] },
      { name: 'thoiGianThucHien', label: 'Thời gian thực hiện', type: 'text' },
      { name: 'ngayPhatHanh', label: 'Ngày phát hành', type: 'date' },
      { name: 'ngayDongThau', label: 'Ngày đóng thầu', type: 'date' },
      { name: 'tieuChuanNangLuc', label: 'Tiêu chuẩn đánh giá năng lực, kinh nghiệm', type: 'textarea', wide: true },
      { name: 'tieuChuanKyThuat', label: 'Tiêu chuẩn đánh giá kỹ thuật', type: 'textarea', wide: true },
      { name: 'dieuKienHopDong', label: 'Điều kiện về hợp đồng', type: 'textarea', wide: true },
      { name: 'nguoiLap', label: 'Người lập', type: 'text' },
    ],
    listColumns: [
      { key: 'maGoiThau', label: 'Mã gói thầu' },
      { key: 'tenGoiThau', label: 'Tên gói thầu' },
      { key: 'hinhThuc', label: 'Hình thức' },
      { key: 'ngayPhatHanh', label: 'Ngày phát hành', date: true },
    ],
  },
  bien_ban: {
    key: 'bien_ban',
    label: 'Biên bản thương thảo',
    short: 'Biên bản',
    icon: Handshake,
    docTitle: 'BIÊN BẢN THƯƠNG THẢO HỢP ĐỒNG',
    signLeft: 'Đại diện chủ đầu tư',
    signRight: 'Đại diện nhà thầu',
    dateField: 'ngayThuongThao',
    fields: [
      { name: 'maGoiThau', label: 'Mã gói thầu', type: 'text', required: true },
      { name: 'tenGoiThau', label: 'Tên gói thầu', type: 'text', required: true, wide: true },
      { name: 'tenNhaThau', label: 'Tên nhà thầu', type: 'text', wide: true },
      { name: 'ngayThuongThao', label: 'Ngày thương thảo', type: 'date' },
      { name: 'diaDiem', label: 'Địa điểm', type: 'text' },
      { name: 'daiDienChuDauTu', label: 'Đại diện chủ đầu tư', type: 'text' },
      { name: 'daiDienNhaThau', label: 'Đại diện nhà thầu', type: 'text' },
      { name: 'giaTruocThuongThao', label: 'Giá trước thương thảo (VNĐ)', type: 'number' },
      { name: 'giaSauThuongThao', label: 'Giá sau thương thảo (VNĐ)', type: 'number' },
      { name: 'noiDungThuongThao', label: 'Nội dung thương thảo', type: 'textarea', wide: true },
      { name: 'ketLuan', label: 'Kết luận', type: 'textarea', wide: true },
    ],
    listColumns: [
      { key: 'maGoiThau', label: 'Mã gói thầu' },
      { key: 'tenNhaThau', label: 'Nhà thầu' },
      { key: 'ngayThuongThao', label: 'Ngày thương thảo', date: true },
      { key: 'giaSauThuongThao', label: 'Giá sau TT', money: true },
    ],
  },
  hop_dong: {
    key: 'hop_dong',
    label: 'Hợp đồng',
    short: 'Hợp đồng',
    icon: FileSignature,
    docTitle: 'HỢP ĐỒNG',
    signLeft: 'Đại diện Bên A',
    signRight: 'Đại diện Bên B',
    dateField: 'ngayKy',
    fields: [
      { name: 'soHopDong', label: 'Số hợp đồng', type: 'text', required: true },
      { name: 'tenGoiThau', label: 'Tên gói thầu', type: 'text', required: true, wide: true },
      { name: 'benA_TenDonVi', label: 'Bên A – Tên đơn vị', type: 'text', wide: true },
      { name: 'benA_DaiDien', label: 'Bên A – Người đại diện', type: 'text' },
      { name: 'benA_ChucVu', label: 'Bên A – Chức vụ', type: 'text' },
      { name: 'benB_TenDonVi', label: 'Bên B – Tên đơn vị', type: 'text', wide: true },
      { name: 'benB_DaiDien', label: 'Bên B – Người đại diện', type: 'text' },
      { name: 'benB_ChucVu', label: 'Bên B – Chức vụ', type: 'text' },
      { name: 'benB_MaSoThue', label: 'Bên B – Mã số thuế', type: 'text' },
      { name: 'giaTriHopDong', label: 'Giá trị hợp đồng (VNĐ)', type: 'number' },
      { name: 'hinhThucHopDong', label: 'Hình thức hợp đồng', type: 'select',
        options: ['Trọn gói', 'Theo đơn giá cố định', 'Theo thời gian', 'Theo tỷ lệ phần trăm'] },
      { name: 'thoiGianThucHien', label: 'Thời gian thực hiện', type: 'text' },
      { name: 'ngayKy', label: 'Ngày ký', type: 'date' },
      { name: 'dieuKhoanChinh', label: 'Điều khoản chính', type: 'textarea', wide: true },
    ],
    listColumns: [
      { key: 'soHopDong', label: 'Số hợp đồng' },
      { key: 'tenGoiThau', label: 'Tên gói thầu' },
      { key: 'benB_TenDonVi', label: 'Bên B' },
      { key: 'ngayKy', label: 'Ngày ký', date: true },
    ],
  },
};

const TYPE_ORDER = ['bao_gia', 'ho_so_yeu_cau', 'bien_ban', 'hop_dong'];

// UUID đặc biệt đại diện cho "áp dụng cho mọi loại dự án" (thay vì để trống)
const GENERIC_TYPE_ID = '00000000-0000-0000-0000-000000000000';
// Schema giả cho "Dự án" — không có trường cố định, chỉ chứa trường tùy chỉnh do admin khai báo
const PROJECT_BASE_SCHEMA = { key: 'project', label: 'Dự án (thông tin chung)', fields: [] };
// Schema giả cho "Gói thầu" — tương tự, chỉ chứa trường tùy chỉnh
const GOI_THAU_BASE_SCHEMA = { key: 'goi_thau', label: 'Gói thầu (thông tin riêng)', fields: [] };

const ROLE_LABELS = { admin: 'Quản trị viên', editor: 'Biên tập', viewer: 'Chỉ xem' };
const ROLE_BADGE_CLASS = {
  admin: 'bg-amber-100 text-amber-800',
  editor: 'bg-teal-100 text-teal-800',
  viewer: 'bg-stone-200 text-stone-600',
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function emptyItemRow() {
  return { id: uid(), tenHangHoa: '', donViTinh: '', soLuong: '', donGia: '' };
}

function emptyTableRow(columns) {
  const row = { id: uid() };
  (columns || []).forEach((c) => { row[c.key] = ''; });
  return row;
}

function defaultFormData(schema) {
  const data = { duAnId: '' };
  schema.fields.forEach((f) => {
    if (f.type === 'items') data[f.name] = [emptyItemRow()];
    else if (f.type === 'table') data[f.name] = [emptyTableRow(f.options)];
    else data[f.name] = '';
  });
  return data;
}

function formatVND(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '';
  return num.toLocaleString('vi-VN') + ' đ';
}

function formatDateVN(d) {
  if (!d) return '';
  const parts = String(d).split('-');
  if (parts.length !== 3) return d;
  const [y, m, day] = parts;
  return `${day}/${m}/${y}`;
}

function lineItemTotal(row) {
  const qty = Number(row.soLuong) || 0;
  const price = Number(row.donGia) || 0;
  return qty * price;
}

function matchesSearch(record, schema, term) {
  if (!term) return true;
  const t = term.toLowerCase();
  return schema.fields.some((f) => {
    if (f.type === 'items') return false;
    const v = record[f.name];
    return v && String(v).toLowerCase().includes(t);
  });
}

function projectById(projects, id) {
  return projects.find((p) => p.id === id) || null;
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Field({ field, value, onChange, error, disabled }) {
  const base =
    'w-full rounded-md border bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 disabled:bg-stone-100 disabled:text-stone-400 ' +
    (error ? 'border-rose-400' : 'border-stone-300');

  if (field.type === 'textarea') {
    return (
      <textarea
        className={base + ' min-h-[96px] resize-y'}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <select className={base} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Chọn —</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
      className={base}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.type === 'text' ? field.label : undefined}
    />
  );
}

function ItemsEditor({ rows, onChange }) {
  const list = rows && rows.length ? rows : [emptyItemRow()];
  const total = list.reduce((sum, r) => sum + lineItemTotal(r), 0);

  const COLS = ['tenHangHoa', 'donViTinh', 'soLuong', 'donGia'];
  const [widths, setWidths] = useState({ tenHangHoa: 220, donViTinh: 96, soLuong: 96, donGia: 128 });
  const dragRef = useRef(null);

  function updateRow(id, key, val) {
    onChange(list.map((r) => (r.id === id ? { ...r, [key]: val } : r)));
    // tự động kéo giãn cột theo độ dài nội dung vừa nhập
    const suggested = Math.min(420, Math.max(60, String(val).length * 8 + 32));
    setWidths((prev) => (suggested > prev[key] ? { ...prev, [key]: suggested } : prev));
  }
  function addRow() {
    onChange([...list, emptyItemRow()]);
  }
  function removeRow(id) {
    onChange(list.length > 1 ? list.filter((r) => r.id !== id) : list);
  }

  function startResize(e, key) {
    e.preventDefault();
    dragRef.current = { key, startX: e.clientX, startWidth: widths[key] };
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  }
  function onDragMove(e) {
    if (!dragRef.current) return;
    const { key, startX, startWidth } = dragRef.current;
    const next = Math.max(50, startWidth + (e.clientX - startX));
    setWidths((prev) => ({ ...prev, [key]: next }));
  }
  function onDragEnd() {
    dragRef.current = null;
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
  }

  function ResizeHandle({ colKey }) {
    return (
      <span
        onMouseDown={(e) => startResize(e, colKey)}
        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none hover:bg-teal-300/60"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-stone-300">
      <table className="text-sm" style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
        <thead className="bg-stone-100 text-stone-600">
          <tr>
            <th className="w-10 px-2 py-2 text-left font-medium">STT</th>
            <th className="relative px-2 py-2 text-left font-medium" style={{ width: widths.tenHangHoa }}>
              Tên hàng hóa / dịch vụ<ResizeHandle colKey="tenHangHoa" />
            </th>
            <th className="relative px-2 py-2 text-left font-medium" style={{ width: widths.donViTinh }}>
              Đơn vị<ResizeHandle colKey="donViTinh" />
            </th>
            <th className="relative px-2 py-2 text-left font-medium" style={{ width: widths.soLuong }}>
              Số lượng<ResizeHandle colKey="soLuong" />
            </th>
            <th className="relative px-2 py-2 text-left font-medium" style={{ width: widths.donGia }}>
              Đơn giá<ResizeHandle colKey="donGia" />
            </th>
            <th className="w-32 px-2 py-2 text-right font-medium">Thành tiền</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((row, idx) => (
            <tr key={row.id} className="border-t border-stone-200">
              <td className="px-2 py-1 text-stone-500">{idx + 1}</td>
              <td className="p-1" style={{ width: widths.tenHangHoa }}>
                <input className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
                  value={row.tenHangHoa} onChange={(e) => updateRow(row.id, 'tenHangHoa', e.target.value)} />
              </td>
              <td className="p-1" style={{ width: widths.donViTinh }}>
                <input className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
                  value={row.donViTinh} onChange={(e) => updateRow(row.id, 'donViTinh', e.target.value)} />
              </td>
              <td className="p-1" style={{ width: widths.soLuong }}>
                <input type="number" className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
                  value={row.soLuong} onChange={(e) => updateRow(row.id, 'soLuong', e.target.value)} />
              </td>
              <td className="p-1" style={{ width: widths.donGia }}>
                <input type="number" className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
                  value={row.donGia} onChange={(e) => updateRow(row.id, 'donGia', e.target.value)} />
              </td>
              <td className="p-1 text-right text-stone-700 pr-2">{formatVND(lineItemTotal(row))}</td>
              <td className="p-1 text-center">
                <button type="button" onClick={() => removeRow(row.id)}
                  className="text-stone-400 hover:text-rose-600" aria-label="Xóa dòng">
                  <X className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-stone-300 bg-stone-50">
            <td colSpan={5} className="px-2 py-2 text-right font-medium text-stone-600">Tổng cộng</td>
            <td className="px-2 py-2 text-right font-semibold text-teal-900">{formatVND(total)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <button type="button" onClick={addRow}
        className="flex w-full items-center justify-center gap-1 border-t border-stone-200 bg-white py-2 text-sm text-teal-800 hover:bg-stone-50">
        <Plus className="h-4 w-4" /> Thêm dòng
      </button>
    </div>
  );
}

/* ---------------- Bảng dữ liệu tùy chỉnh (trường kiểu "table") ---------------- */

function TableFieldEditor({ columns, rows, onChange }) {
  const cols = columns || [];
  const list = rows && rows.length ? rows : [emptyTableRow(cols)];
  const [widths, setWidths] = useState(() => Object.fromEntries(cols.map((c) => [c.key, 140])));
  const dragRef = useRef(null);

  useEffect(() => {
    setWidths((prev) => {
      const next = { ...prev };
      let changed = false;
      cols.forEach((c) => { if (next[c.key] === undefined) { next[c.key] = 140; changed = true; } });
      return changed ? next : prev;
    });
  }, [cols]);

  function updateCell(rowId, key, val) {
    onChange(list.map((r) => (r.id === rowId ? { ...r, [key]: val } : r)));
    const suggested = Math.min(420, Math.max(60, String(val).length * 8 + 32));
    setWidths((prev) => (suggested > (prev[key] || 0) ? { ...prev, [key]: suggested } : prev));
  }
  function addRow() {
    onChange([...list, emptyTableRow(cols)]);
  }
  function removeRow(rowId) {
    onChange(list.length > 1 ? list.filter((r) => r.id !== rowId) : list);
  }

  function startResize(e, key) {
    e.preventDefault();
    dragRef.current = { key, startX: e.clientX, startWidth: widths[key] || 140 };
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  }
  function onDragMove(e) {
    if (!dragRef.current) return;
    const { key, startX, startWidth } = dragRef.current;
    const next = Math.max(50, startWidth + (e.clientX - startX));
    setWidths((prev) => ({ ...prev, [key]: next }));
  }
  function onDragEnd() {
    dragRef.current = null;
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
  }

  return (
    <div className="overflow-x-auto rounded-md border border-stone-300">
      <table className="text-sm" style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
        <thead className="bg-stone-100 text-stone-600">
          <tr>
            <th className="w-10 px-2 py-2 text-left font-medium">STT</th>
            {cols.map((c) => (
              <th key={c.key} className="relative px-2 py-2 text-left font-medium" style={{ width: widths[c.key] || 140 }}>
                {c.label}{c.required && <span className="text-rose-500"> *</span>}
                <span
                  onMouseDown={(e) => startResize(e, c.key)}
                  className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none hover:bg-teal-300/60"
                />
              </th>
            ))}
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((row, idx) => (
            <tr key={row.id} className="border-t border-stone-200">
              <td className="px-2 py-1 text-stone-500">{idx + 1}</td>
              {cols.map((c) => (
                <td key={c.key} className="p-1" style={{ width: widths[c.key] || 140 }}>
                  <input
                    type={c.type === 'number' ? 'number' : c.type === 'date' ? 'date' : 'text'}
                    className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
                    value={row[c.key] ?? ''}
                    onChange={(e) => updateCell(row.id, c.key, e.target.value)}
                  />
                </td>
              ))}
              <td className="p-1 text-center">
                <button type="button" onClick={() => removeRow(row.id)}
                  className="text-stone-400 hover:text-rose-600" aria-label="Xóa dòng">
                  <X className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={addRow}
        className="flex w-full items-center justify-center gap-1 border-t border-stone-200 bg-white py-2 text-sm text-teal-800 hover:bg-stone-50">
        <Plus className="h-4 w-4" /> Thêm dòng
      </button>
    </div>
  );
}

function RoleBadge({ role }) {
  if (!role) return null;
  return (
    <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${ROLE_BADGE_CLASS[role] || 'bg-stone-200 text-stone-600'}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}

function Toast({ message, tone }) {
  if (!message) return null;
  const toneClass = tone === 'error' ? 'bg-rose-800 text-rose-50' : 'bg-teal-900 text-teal-50';
  return (
    <div className={`fixed bottom-5 right-5 z-50 rounded-md px-4 py-2.5 text-sm shadow-lg print:hidden ${toneClass}`}>
      {message}
    </div>
  );
}

function LoadingScreen({ label }) {
  return (
    <div className="flex h-full min-h-[500px] items-center justify-center bg-stone-50">
      <div className="flex items-center gap-2 text-stone-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">{label || 'Đang tải dữ liệu…'}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login (thay cho Onboarding cũ — không còn tự chọn tên, phải có mật khẩu) */
/* ------------------------------------------------------------------ */

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await onLogin(email, password);
    setSubmitting(false);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="flex h-full min-h-[560px] items-center justify-center bg-stone-50 px-6">
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">
          Hồ sơ Đấu thầu
        </div>
        <p className="mt-1 text-sm text-stone-500">Đăng nhập để tiếp tục</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-stone-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/40"
                placeholder="ban@congty.com"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-stone-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/40"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-teal-900 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-400">
          Chưa có tài khoản? Liên hệ quản trị viên để được cấp quyền truy cập.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Project select control (used in the record form)                    */
/* ------------------------------------------------------------------ */

function ProjectSelect({ projects, value, onChange, error }) {
  return (
    <select
      className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 ${error ? 'border-rose-400' : 'border-stone-300'}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">— Chọn dự án —</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>{p.ten}{p.maDuAn ? ` (${p.maDuAn})` : ''}</option>
      ))}
    </select>
  );
}

/* ------------------------------------------------------------------ */
/* Main App                                                             */
/* ------------------------------------------------------------------ */

const ACTIONS = ['view', 'add', 'edit', 'lock', 'delete'];
const ACTION_LABELS = { view: 'Xem', add: 'Thêm', edit: 'Chỉnh sửa', lock: 'Khóa', delete: 'Xóa' };

/* ------------------------------------------------------------------ */
/* Main App                                                             */
/* ------------------------------------------------------------------ */

export default function App() {
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [myProfile, setMyProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [projects, setProjects] = useState([]);         // [{ id, ten, maDuAn, moTa, typeId, typeName, createdAt }]
  const [projectTypes, setProjectTypes] = useState([]);
  const [permissions, setPermissions] = useState([]);    // [{ projectId, userId, docType, can_view, can_add, can_edit, can_lock, can_delete }]
  const [importTemplates, setImportTemplates] = useState({}); // { [docType]: { column_mapping } }
  const [customFields, setCustomFields] = useState({ bao_gia: [], ho_so_yeu_cau: [], bien_ban: [], hop_dong: [], project: [], goi_thau: [] });
  const [hiddenFields, setHiddenFields] = useState({ bao_gia: [], ho_so_yeu_cau: [], bien_ban: [], hop_dong: [], project: [], goi_thau: [] });
  const [fieldOverrides, setFieldOverrides] = useState({ bao_gia: [], ho_so_yeu_cau: [], bien_ban: [], hop_dong: [], project: [], goi_thau: [] });
  const [projectSteps, setProjectSteps] = useState({}); // { [projectId]: [{ id, docType, sortOrder, completed }] }
  const [goiThauList, setGoiThauList] = useState({}); // { [projectId]: [{ id, projectId, maGoiThau, tenGoiThau, data, createdAt }] }
  const [templateFieldMode, setTemplateFieldModeState] = useState({}); // { [docType]: { [projectTypeId]: 'extend' | 'replace' } }
  const [printTemplates, setPrintTemplates] = useState({}); // { [docType]: { layout: [...] } }
  const [docxTemplates, setDocxTemplates] = useState({}); // { [docType]: { storage_path } }
  const [myAssignments, setMyAssignments] = useState([]); // giao việc điền thông tin (của tôi hoặc do tôi giao)
  const [deepLinkAssignmentId, setDeepLinkAssignmentId] = useState(null);
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);
  const [records, setRecords] = useState({ bao_gia: [], ho_so_yeu_cau: [], bien_ban: [], hop_dong: [] });
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeType, setActiveType] = useState('bao_gia');
  const [view, setView] = useState('dashboard'); // dashboard | list | form | detail | users | projects | log
  const [projectFilter, setProjectFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [assigningRecord, setAssigningRecord] = useState(null); // { docType, record } khi đang mở modal giao việc

  const showToast = useCallback((message, tone = 'ok') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 2600);
  }, []);

  /* ---------------- auth session ---------------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Nếu người dùng mở link từ email giao việc (?assignment=<id>), ghi nhớ để mở đúng màn hình sau khi đăng nhập
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const aid = params.get('assignment');
    if (aid) setDeepLinkAssignmentId(aid);
  }, []);

  async function handleLogin(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Email hoặc mật khẩu không đúng.' };
    return {};
  }
  async function handleLogout() {
    await supabase.auth.signOut();
  }

  /* ---------------- load all data once logged in ---------------- */
  useEffect(() => {
    if (!session) { setMyProfile(null); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [profileRes, profilesRes, projectsRes, permsRes, typesRes, auditRes, templatesRes, customFieldsRes, printTemplatesRes, hiddenFieldsRes, fieldOverridesRes, docxTemplatesRes, assignmentsRes, projectStepsRes, goiThauRes, templateModeRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, is_admin').eq('id', session.user.id).single(),
        supabase.from('profiles').select('id, full_name, is_admin').order('full_name'),
        supabase.from('projects').select('id, ten, ma_du_an, mo_ta, type_id, data, created_at').order('created_at'),
        supabase.from('project_permissions').select('project_id, user_id, doc_type, can_view, can_add, can_edit, can_lock, can_delete'),
        supabase.from('project_types').select('id, ten').order('ten'),
        supabase.from('audit_log').select('id, actor_name, action, summary, created_at').order('created_at', { ascending: false }).limit(300),
        supabase.from('import_templates').select('type, column_mapping'),
        supabase.from('custom_fields').select('id, doc_type, field_key, label, field_type, options, columns, required, sort_order, project_type_id').order('sort_order'),
        supabase.from('print_templates').select('doc_type, project_type_id, layout'),
        supabase.from('hidden_builtin_fields').select('doc_type, field_name, project_type_id'),
        supabase.from('field_overrides').select('doc_type, field_name, label, field_type, required, options, project_type_id'),
        supabase.from('docx_templates').select('doc_type, project_type_id, storage_path'),
        supabase.from('document_assignments').select('id, document_id, doc_type, assigned_to, assigned_by, field_keys, status, created_at, completed_at'),
        supabase.from('project_document_types').select('id, project_id, doc_type, sort_order, completed'),
        supabase.from('goi_thau').select('id, project_id, ma_goi_thau, ten_goi_thau, data, created_at'),
        supabase.from('template_field_mode').select('doc_type, project_type_id, mode'),
      ]);

      const nextRecords = {};
      for (const key of TYPE_ORDER) {
        const { data: rows } = await supabase
          .from('documents')
          .select('id, du_an_id, data, locked, created_at, updated_at, created_by')
          .eq('type', key)
          .order('created_at', { ascending: false });
        nextRecords[key] = (rows || []).map((r) => ({
          ...r.data, id: r.id, duAnId: r.du_an_id, locked: !!r.locked,
          createdAt: r.created_at, updatedAt: r.updated_at, createdBy: r.created_by,
        }));
      }

      if (cancelled) return;
      setMyProfile(profileRes.data || null);
      setProfiles(profilesRes.data || []);
      setProjectTypes(typesRes.data || []);
      const typesById = Object.fromEntries((typesRes.data || []).map((t) => [t.id, t.ten]));
      setProjects((projectsRes.data || []).map((p) => ({
        id: p.id, ten: p.ten, maDuAn: p.ma_du_an, moTa: p.mo_ta,
        typeId: p.type_id, typeName: p.type_id ? (typesById[p.type_id] || null) : null,
        data: p.data || {},
        createdAt: p.created_at,
      })));
      const stepsByProject = {};
      (projectStepsRes.data || []).forEach((s) => {
        if (!stepsByProject[s.project_id]) stepsByProject[s.project_id] = [];
        stepsByProject[s.project_id].push({ id: s.id, docType: s.doc_type, sortOrder: s.sort_order, completed: s.completed });
      });
      Object.values(stepsByProject).forEach((list) => list.sort((a, b) => a.sortOrder - b.sortOrder));
      setProjectSteps(stepsByProject);
      const goiThauByProject = {};
      (goiThauRes.data || []).forEach((g) => {
        if (!goiThauByProject[g.project_id]) goiThauByProject[g.project_id] = [];
        goiThauByProject[g.project_id].push({ id: g.id, projectId: g.project_id, maGoiThau: g.ma_goi_thau, tenGoiThau: g.ten_goi_thau, data: g.data || {}, createdAt: g.created_at });
      });
      setGoiThauList(goiThauByProject);
      const modeByType = {};
      (templateModeRes.data || []).forEach((m) => {
        if (!modeByType[m.doc_type]) modeByType[m.doc_type] = {};
        modeByType[m.doc_type][m.project_type_id] = m.mode;
      });
      setTemplateFieldModeState(modeByType);
      setPermissions((permsRes.data || []).map((p) => ({
        projectId: p.project_id, userId: p.user_id, docType: p.doc_type,
        can_view: p.can_view, can_add: p.can_add, can_edit: p.can_edit, can_lock: p.can_lock, can_delete: p.can_delete,
      })));
      setAuditLog((auditRes.data || []).map((l) => ({ id: l.id, time: l.created_at, actor: l.actor_name, action: l.action, summary: l.summary })));
      setImportTemplates(Object.fromEntries((templatesRes.data || []).map((t) => [t.type, { column_mapping: t.column_mapping || {} }])));
      const cfByType = { bao_gia: [], ho_so_yeu_cau: [], bien_ban: [], hop_dong: [], project: [], goi_thau: [] };
      (customFieldsRes.data || []).forEach((f) => { if (cfByType[f.doc_type]) cfByType[f.doc_type].push(f); });
      setCustomFields(cfByType);
      const ptByType = {};
      (printTemplatesRes.data || []).forEach((t) => {
        if (!ptByType[t.doc_type]) ptByType[t.doc_type] = {};
        ptByType[t.doc_type][t.project_type_id] = { layout: t.layout || [] };
      });
      setPrintTemplates(ptByType);
      const hiddenByType = { bao_gia: [], ho_so_yeu_cau: [], bien_ban: [], hop_dong: [], project: [], goi_thau: [] };
      (hiddenFieldsRes.data || []).forEach((h) => { if (hiddenByType[h.doc_type]) hiddenByType[h.doc_type].push(h); });
      setHiddenFields(hiddenByType);
      const overridesByType = { bao_gia: [], ho_so_yeu_cau: [], bien_ban: [], hop_dong: [], project: [], goi_thau: [] };
      (fieldOverridesRes.data || []).forEach((o) => { if (overridesByType[o.doc_type]) overridesByType[o.doc_type].push(o); });
      setFieldOverrides(overridesByType);
      const dtByType = {};
      (docxTemplatesRes.data || []).forEach((t) => {
        if (!dtByType[t.doc_type]) dtByType[t.doc_type] = {};
        dtByType[t.doc_type][t.project_type_id] = { storage_path: t.storage_path };
      });
      setDocxTemplates(dtByType);
      setMyAssignments((assignmentsRes.data || []).map((a) => ({
        id: a.id, documentId: a.document_id, docType: a.doc_type, assignedTo: a.assigned_to, assignedBy: a.assigned_by,
        fieldKeys: a.field_keys, status: a.status, createdAt: a.created_at, completedAt: a.completed_at,
      })));
      setRecords(nextRecords);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [session]);

  // Sau khi tải xong dữ liệu, nếu có link giao việc (?assignment=...), tự mở đúng màn hình điền
  useEffect(() => {
    if (!deepLinkAssignmentId || loading || !myProfile) return;
    const assignment = myAssignments.find((a) => a.id === deepLinkAssignmentId && a.assignedTo === myProfile.id);
    if (assignment) {
      setActiveType(assignment.docType);
      setActiveAssignmentId(assignment.id);
      setView('fill-assignment');
    }
    setDeepLinkAssignmentId(null);
  }, [deepLinkAssignmentId, loading, myProfile, myAssignments]);

  async function appendLog(action, summary) {
    const entry = { actor_id: myProfile?.id, actor_name: myProfile?.full_name, action, summary };
    const { data, error } = await supabase.from('audit_log').insert(entry).select().single();
    if (!error && data) {
      setAuditLog((prev) => [{ id: data.id, time: data.created_at, actor: data.actor_name, action: data.action, summary: data.summary }, ...prev].slice(0, 300));
    }
  }

  /* ---------------- permissions (derived) ---------------- */
  const myId = myProfile?.id;
  const amAdmin = !!myProfile?.is_admin;
  const profilesById = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);
  const nameOf = useCallback((id) => profilesById[id]?.full_name || '(không rõ)', [profilesById]);

  // Trả về schema hiệu lực cho 1 loại hồ sơ, tùy theo Loại dự án (nếu có mẫu riêng cho loại đó)
  function getSchema(docType, projectTypeId) {
    const baseSchema = docType === 'project' ? PROJECT_BASE_SCHEMA : docType === 'goi_thau' ? GOI_THAU_BASE_SCHEMA : DOC_TYPES[docType];
    const typeKey = projectTypeId || GENERIC_TYPE_ID;
    const mode = (templateFieldMode[docType] && templateFieldMode[docType][typeKey]) || 'extend';

    // "Tự thiết kế lại từ đầu": bỏ hẳn trường có sẵn và trường của mẫu chung,
    // chỉ dùng đúng những trường đã khai báo riêng cho loại dự án này.
    if (typeKey !== GENERIC_TYPE_ID && mode === 'replace') {
      const specificOnly = (customFields[docType] || [])
        .filter((f) => f.project_type_id === typeKey)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((f) => ({
          name: f.field_key, label: f.label, type: f.field_type,
          required: f.required, options: f.options || [], columns: f.columns || null,
          wide: f.field_type === 'table', __custom: true, __id: f.id,
        }));
      return { ...baseSchema, fields: specificOnly };
    }

    const hiddenSet = new Set(
      (hiddenFields[docType] || [])
        .filter((h) => h.project_type_id === GENERIC_TYPE_ID || h.project_type_id === typeKey)
        .map((h) => h.field_name)
    );
    const overridesMap = {};
    (fieldOverrides[docType] || [])
      .filter((o) => o.project_type_id === GENERIC_TYPE_ID)
      .forEach((o) => { overridesMap[o.field_name] = o; });
    (fieldOverrides[docType] || [])
      .filter((o) => o.project_type_id === typeKey && typeKey !== GENERIC_TYPE_ID)
      .forEach((o) => { overridesMap[o.field_name] = o; });

    const visibleBuiltIn = baseSchema.fields
      .filter((f) => !hiddenSet.has(f.name))
      .map((f) => {
        const o = overridesMap[f.name];
        if (!o) return f;
        return {
          ...f,
          label: o.label ?? f.label,
          type: o.field_type ?? f.type,
          required: o.required ?? f.required,
          options: o.options ?? f.options,
        };
      });

    const customGeneric = (customFields[docType] || []).filter((f) => f.project_type_id === GENERIC_TYPE_ID);
    const customSpecific = typeKey !== GENERIC_TYPE_ID ? (customFields[docType] || []).filter((f) => f.project_type_id === typeKey) : [];
    const extra = [...customGeneric, ...customSpecific]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((f) => ({
        name: f.field_key, label: f.label, type: f.field_type,
        required: f.required, options: f.options || [], columns: f.columns || null,
        wide: f.field_type === 'table', __custom: true, __id: f.id,
      }));

    return { ...baseSchema, fields: [...visibleBuiltIn, ...extra] };
  }

  async function setTemplateFieldMode(docType, projectTypeId, mode) {
    const { error } = await supabase
      .from('template_field_mode')
      .upsert({ doc_type: docType, project_type_id: projectTypeId, mode, updated_by: myId, updated_at: new Date().toISOString() }, { onConflict: 'doc_type,project_type_id' });
    if (error) { showToast('Không thể cập nhật chế độ mẫu: ' + error.message, 'error'); return; }
    setTemplateFieldModeState((prev) => ({ ...prev, [docType]: { ...(prev[docType] || {}), [projectTypeId]: mode } }));
    showToast(mode === 'replace' ? 'Đã chuyển sang tự thiết kế lại từ đầu cho loại dự án này.' : 'Đã chuyển về kế thừa mẫu chung.');
  }

  function getPerm(projectId, userId, docType) {
    const row = permissions.find((p) => p.projectId === projectId && p.userId === userId && p.docType === docType);
    return {
      view: !!row?.can_view, add: !!row?.can_add, edit: !!row?.can_edit, lock: !!row?.can_lock, delete: !!row?.can_delete,
    };
  }
  // Lấy đúng bố cục in / mẫu Word: ưu tiên bản riêng cho loại dự án, không có thì dùng bản chung
  function resolvePrintLayout(docType, projectTypeId) {
    const byType = printTemplates[docType] || {};
    return (projectTypeId && byType[projectTypeId]) || byType[GENERIC_TYPE_ID] || null;
  }
  function resolveDocxTemplate(docType, projectTypeId) {
    const byType = docxTemplates[docType] || {};
    return (projectTypeId && byType[projectTypeId]) || byType[GENERIC_TYPE_ID] || null;
  }

  function hasAnyPermission(projectId, userId) {
    return permissions.some((p) => p.projectId === projectId && p.userId === userId && (p.can_view || p.can_add || p.can_edit || p.can_lock || p.can_delete));
  }
  function canViewRecord(rec, docType) {
    if (amAdmin) return true;
    if (!rec.duAnId) return false;
    return getPerm(rec.duAnId, myId, docType).view;
  }
  function canEditDoc(rec, docType) {
    if (amAdmin) return true;
    if (!rec.duAnId) return false;
    const perm = getPerm(rec.duAnId, myId, docType);
    if (!perm.edit) return false;
    if (rec.locked && !perm.lock) return false;
    return true;
  }
  function canDeleteDoc(rec, docType) {
    if (amAdmin) return true;
    if (!rec.duAnId) return false;
    const perm = getPerm(rec.duAnId, myId, docType);
    if (!perm.delete) return false;
    if (rec.locked && !perm.lock) return false;
    return true;
  }
  function canLockDoc(rec, docType) {
    if (amAdmin) return true;
    if (!rec.duAnId) return false;
    return getPerm(rec.duAnId, myId, docType).lock;
  }

  // Kiểm tra loại hồ sơ này đã "tới lượt" trong dự án chưa (dựa trên các bước đã cấu hình + thứ tự).
  // Nếu dự án chưa cấu hình bước nào, hoặc loại hồ sơ này không nằm trong danh sách bước, coi như không khóa.
  function isDocTypeUnlockedForProject(projectId, docType) {
    const steps = projectSteps[projectId];
    if (!steps || steps.length === 0) return true;
    const idx = steps.findIndex((s) => s.docType === docType);
    if (idx === -1) return true;
    return steps.slice(0, idx).every((s) => s.completed);
  }

  function canAddInProject(projectId, docType) {
    if (amAdmin) return true;
    if (!isDocTypeUnlockedForProject(projectId, docType)) return false;
    return getPerm(projectId, myId, docType).add;
  }
  function assignableProjectsFor(docType, action) {
    return projects.filter((p) => {
      if (amAdmin) return true;
      if (action === 'add' && !isDocTypeUnlockedForProject(p.id, docType)) return false;
      return getPerm(p.id, myId, docType)[action];
    });
  }

  async function saveProjectSteps(projectId, stepsList) {
    // stepsList: [{ docType }] theo đúng thứ tự mong muốn — xóa cấu hình cũ, ghi lại từ đầu
    const { error: delError } = await supabase.from('project_document_types').delete().eq('project_id', projectId);
    if (delError) { showToast('Không thể cập nhật các bước: ' + delError.message, 'error'); return; }
    if (stepsList.length === 0) {
      setProjectSteps((prev) => ({ ...prev, [projectId]: [] }));
      return;
    }
    const rows = stepsList.map((s, idx) => ({ project_id: projectId, doc_type: s.docType, sort_order: idx }));
    const { data, error } = await supabase.from('project_document_types').insert(rows).select();
    if (error) { showToast('Không thể lưu các bước: ' + error.message, 'error'); return; }
    setProjectSteps((prev) => ({
      ...prev,
      [projectId]: data.map((s) => ({ id: s.id, docType: s.doc_type, sortOrder: s.sort_order, completed: s.completed })).sort((a, b) => a.sortOrder - b.sortOrder),
    }));
    showToast('Đã cập nhật các bước cho dự án.');
  }

  async function toggleStepCompleted(projectId, docType, completed) {
    const { error } = await supabase.from('project_document_types').update({ completed }).eq('project_id', projectId).eq('doc_type', docType);
    if (error) { showToast('Không thể cập nhật trạng thái bước: ' + error.message, 'error'); return; }
    setProjectSteps((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map((s) => (s.docType === docType ? { ...s, completed } : s)),
    }));
    showToast(completed ? 'Đã đánh dấu hoàn thành bước này.' : 'Đã bỏ đánh dấu hoàn thành.');
  }

  /* ---------------- gói thầu (mã tự động sinh theo dự án) ---------------- */
  async function createGoiThau(projectId, tenGoiThau, extraData) {
    const { data, error } = await supabase
      .from('goi_thau')
      .insert({ project_id: projectId, ma_goi_thau: null, ten_goi_thau: tenGoiThau, data: extraData || {}, created_by: myId })
      .select()
      .single();
    if (error) { showToast('Không thể tạo gói thầu: ' + error.message, 'error'); return null; }
    const newPkg = { id: data.id, projectId: data.project_id, maGoiThau: data.ma_goi_thau, tenGoiThau: data.ten_goi_thau, data: data.data || {}, createdAt: data.created_at };
    setGoiThauList((prev) => ({ ...prev, [projectId]: [...(prev[projectId] || []), newPkg] }));
    showToast(`Đã tạo gói thầu ${newPkg.maGoiThau}.`);
    appendLog('create_goi_thau', `${myProfile.full_name} đã tạo gói thầu "${newPkg.maGoiThau} — ${tenGoiThau}".`);
    return newPkg;
  }
  async function deleteGoiThau(id, projectId) {
    const { error } = await supabase.from('goi_thau').delete().eq('id', id);
    if (error) { showToast('Không thể xóa gói thầu (có thể đang được hồ sơ nào đó dùng).', 'error'); return; }
    setGoiThauList((prev) => ({ ...prev, [projectId]: (prev[projectId] || []).filter((g) => g.id !== id) }));
    showToast('Đã xóa gói thầu.');
  }

  const accessibleProjects = useMemo(
    () => projects.filter((p) => amAdmin || hasAnyPermission(p.id, myId)),
    [projects, permissions, myId, amAdmin]
  );

  /* ---------------- navigation ---------------- */
  function openList(typeKey) {
    setActiveType(typeKey);
    setSearch('');
    setView('list');
  }

  function openNewForm(typeKey) {
    const allowed = assignableProjectsFor(typeKey, 'add');
    if (allowed.length === 0) {
      showToast('Bạn chưa được cấp quyền "Thêm" ở dự án nào cho loại hồ sơ này.', 'error');
      return;
    }
    setActiveType(typeKey);
    let preselectedProject = null;
    if (allowed.length === 1) preselectedProject = allowed[0];
    else if (projectFilter !== 'all' && allowed.some((p) => p.id === projectFilter)) preselectedProject = allowed.find((p) => p.id === projectFilter);
    const data = defaultFormData(getSchema(typeKey, preselectedProject?.typeId));
    if (preselectedProject) data.duAnId = preselectedProject.id;
    setFormData(data);
    setFormErrors({});
    setEditingId(null);
    setView('form');
  }

  function openEditForm(typeKey, record) {
    if (!canEditDoc(record, typeKey)) {
      showToast('Bạn không có quyền chỉnh sửa hồ sơ này (có thể do đang bị khóa).', 'error');
      return;
    }
    setActiveType(typeKey);
    setFormData({ ...record });
    setFormErrors({});
    setEditingId(record.id);
    setView('form');
  }

  function openDetail(typeKey, id) {
    setActiveType(typeKey);
    setDetailId(id);
    setView('detail');
  }

  function updateField(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  }

  /* ---------------- documents CRUD (Supabase) ---------------- */
  async function handleSubmit(e) {
    e.preventDefault();
    const targetProject = projectById(projects, formData.duAnId);
    const schema = getSchema(activeType, targetProject?.typeId);
    const errors = {};
    if (!formData.duAnId) errors.duAnId = true;
    if (!formData.goiThauId) errors.goiThauId = true;
    schema.fields.forEach((f) => {
      if (f.required && !String(formData[f.name] || '').trim()) errors[f.name] = true;
      if (f.type === 'table' && Array.isArray(f.options)) {
        const requiredCols = f.options.filter((c) => c.required);
        if (requiredCols.length > 0) {
          const rows = formData[f.name] || [];
          const hasMissing = rows.some((row) => {
            const rowHasAnyValue = f.options.some((c) => String(row[c.key] || '').trim());
            if (!rowHasAnyValue) return false; // bỏ qua dòng trống hoàn toàn
            return requiredCols.some((c) => !String(row[c.key] || '').trim());
          });
          if (hasMissing) errors[f.name] = true;
        }
      }
    });
    const allowed = editingId ? canEditDoc({ duAnId: formData.duAnId, locked: false }, activeType) : canAddInProject(formData.duAnId, activeType);
    if (!allowed) {
      showToast('Bạn không có quyền lưu hồ sơ vào dự án này.', 'error');
      return;
    }
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      showToast('Vui lòng điền các trường bắt buộc, bao gồm Dự án.', 'error');
      return;
    }

    const { duAnId, id: _ignored, createdAt, updatedAt, createdBy, locked, ...dataFields } = formData;

    setSaving(true);
    let result;
    if (editingId) {
      result = await supabase
        .from('documents')
        .update({ du_an_id: duAnId, data: dataFields, updated_at: new Date().toISOString() })
        .eq('id', editingId)
        .select()
        .single();
    } else {
      result = await supabase
        .from('documents')
        .insert({ type: activeType, du_an_id: duAnId, data: dataFields, created_by: myId })
        .select()
        .single();
    }
    setSaving(false);

    if (result.error) {
      showToast('Không thể lưu hồ sơ: ' + result.error.message, 'error');
      return;
    }

    const row = result.data;
    const newRecord = { ...row.data, id: row.id, duAnId: row.du_an_id, locked: !!row.locked, createdAt: row.created_at, updatedAt: row.updated_at, createdBy: row.created_by };
    setRecords((prev) => {
      const list = prev[activeType] || [];
      const newList = editingId ? list.map((r) => (r.id === editingId ? newRecord : r)) : [newRecord, ...list];
      return { ...prev, [activeType]: newList };
    });

    showToast(editingId ? 'Đã cập nhật hồ sơ.' : 'Đã lưu hồ sơ mới.');
    const title = formData.tenGoiThau || formData.soHopDong || formData.maGoiThau || '(không có tiêu đề)';
    appendLog(
      editingId ? 'update_doc' : 'create_doc',
      `${myProfile.full_name} đã ${editingId ? 'cập nhật' : 'tạo'} ${schema.label.toLowerCase()} "${title}" (Dự án: ${targetProject ? targetProject.ten : '—'}).`
    );
    setView('list');
  }

  async function handleDelete(typeKey, id) {
    const rec = (records[typeKey] || []).find((r) => r.id === id);
    if (!canDeleteDoc(rec, typeKey)) {
      showToast('Bạn không có quyền xóa hồ sơ này (có thể do đang bị khóa).', 'error');
      return;
    }
    if (confirmingDelete !== id) {
      setConfirmingDelete(id);
      setTimeout(() => setConfirmingDelete((cur) => (cur === id ? null : cur)), 3000);
      return;
    }
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) {
      showToast('Không thể xóa hồ sơ.', 'error');
      setConfirmingDelete(null);
      return;
    }
    setRecords((prev) => ({ ...prev, [typeKey]: (prev[typeKey] || []).filter((r) => r.id !== id) }));
    showToast('Đã xóa hồ sơ.');
    const proj = projectById(projects, rec?.duAnId);
    const title = rec?.tenGoiThau || rec?.soHopDong || rec?.maGoiThau || '(không có tiêu đề)';
    appendLog('delete_doc', `${myProfile.full_name} đã xóa ${DOC_TYPES[typeKey].label.toLowerCase()} "${title}" (Dự án: ${proj ? proj.ten : '—'}).`);
    setConfirmingDelete(null);
    if (view === 'detail' && detailId === id) setView('list');
  }

  async function toggleLock(typeKey, rec) {
    if (!canLockDoc(rec, typeKey)) {
      showToast('Bạn không có quyền khóa/mở khóa hồ sơ này.', 'error');
      return;
    }
    const newLocked = !rec.locked;
    const { error } = await supabase.from('documents').update({ locked: newLocked }).eq('id', rec.id);
    if (error) { showToast('Không thể cập nhật trạng thái khóa.', 'error'); return; }
    setRecords((prev) => ({ ...prev, [typeKey]: (prev[typeKey] || []).map((r) => (r.id === rec.id ? { ...r, locked: newLocked } : r)) }));
    showToast(newLocked ? 'Đã khóa hồ sơ.' : 'Đã mở khóa hồ sơ.');
    const title = rec.tenGoiThau || rec.soHopDong || rec.maGoiThau || '';
    appendLog(newLocked ? 'lock_doc' : 'unlock_doc', `${myProfile.full_name} đã ${newLocked ? 'khóa' : 'mở khóa'} hồ sơ "${title}".`);
  }

  // rows: [{ duAnId, ...các trường dữ liệu }] — dùng khi nhập hàng loạt từ Excel
  async function bulkImportDocuments(typeKey, rows) {
    // Cache cục bộ trong lần nhập này để tránh tạo trùng gói thầu mới nếu nhiều dòng
    // cùng nhắc tới 1 tên gói thầu chưa từng có (không phụ thuộc state React vốn cập nhật bất đồng bộ).
    const localPackageCache = {}; // { [projectId]: { [tenGoiThauLowerCase]: package } }
    function seedCache(projectId) {
      if (!localPackageCache[projectId]) {
        localPackageCache[projectId] = {};
        (goiThauList[projectId] || []).forEach((g) => { localPackageCache[projectId][g.tenGoiThau.trim().toLowerCase()] = g; });
      }
    }
    async function resolveOrCreatePackage(projectId, tenGoiThauText) {
      seedCache(projectId);
      const key = tenGoiThauText.trim().toLowerCase();
      if (localPackageCache[projectId][key]) return localPackageCache[projectId][key];
      const pkg = await createGoiThau(projectId, tenGoiThauText.trim(), {});
      if (pkg) localPackageCache[projectId][key] = pkg;
      return pkg;
    }

    const toInsert = [];
    const results = [];
    for (const row of rows) {
      const { duAnId, ...dataFields } = row;
      if (!canAddInProject(duAnId, typeKey)) {
        results.push({ ok: false, error: 'Không có quyền "Thêm" ở dự án này' });
        continue;
      }
      if (dataFields.tenGoiThau) {
        const pkg = await resolveOrCreatePackage(duAnId, dataFields.tenGoiThau);
        if (pkg) {
          dataFields.goiThauId = pkg.id;
          dataFields.maGoiThau = pkg.maGoiThau;
          dataFields.tenGoiThau = pkg.tenGoiThau;
        }
      }
      toInsert.push({ type: typeKey, du_an_id: duAnId, data: dataFields, created_by: myId });
    }
    if (toInsert.length === 0) return { insertedCount: 0, results };

    const { data, error } = await supabase.from('documents').insert(toInsert).select();
    if (error) {
      results.push({ ok: false, error: 'Không thể lưu: ' + error.message });
      return { insertedCount: 0, results };
    }

    const newRecords = data.map((r) => ({ ...r.data, id: r.id, duAnId: r.du_an_id, locked: !!r.locked, createdAt: r.created_at, updatedAt: r.updated_at, createdBy: r.created_by }));
    setRecords((prev) => ({ ...prev, [typeKey]: [...newRecords, ...(prev[typeKey] || [])] }));
    toInsert.forEach(() => results.push({ ok: true }));
    showToast(`Đã nhập ${newRecords.length} hồ sơ từ Excel.`);
    appendLog('bulk_import_doc', `${myProfile.full_name} đã nhập ${newRecords.length} hồ sơ "${DOC_TYPES[typeKey].label.toLowerCase()}" từ file Excel.`);
    return { insertedCount: newRecords.length, results };
  }

  async function saveImportTemplate(typeKey, mapping) {
    const { data, error } = await supabase
      .from('import_templates')
      .upsert({ type: typeKey, column_mapping: mapping, updated_by: myId, updated_at: new Date().toISOString() }, { onConflict: 'type' })
      .select()
      .single();
    if (error) { showToast('Không thể lưu mẫu: ' + error.message, 'error'); return; }
    setImportTemplates((prev) => ({ ...prev, [typeKey]: { column_mapping: data.column_mapping } }));
    showToast('Đã ghi nhớ mẫu Excel này cho các lần nhập sau.');
  }

  /* ---------------- custom fields (admin only) ---------------- */
  async function createCustomField(docType, field, projectTypeId) {
    const typeKey = projectTypeId || GENERIC_TYPE_ID;
    const scoped = (customFields[docType] || []).filter((f) => f.project_type_id === typeKey);
    const maxOrder = scoped.reduce((m, f) => Math.max(m, f.sort_order), 0);
    const { data, error } = await supabase
      .from('custom_fields')
      .insert({ doc_type: docType, ...field, project_type_id: typeKey, sort_order: maxOrder + 1 })
      .select()
      .single();
    if (error) { showToast('Không thể thêm trường: ' + error.message, 'error'); return; }
    setCustomFields((prev) => ({ ...prev, [docType]: [...(prev[docType] || []), data] }));
    showToast('Đã thêm trường mới.');
    appendLog('add_custom_field', `${myProfile.full_name} đã thêm trường "${field.label}" vào "${DOC_TYPES[docType].label}".`);
  }
  async function deleteCustomField(docType, id) {
    const { error } = await supabase.from('custom_fields').delete().eq('id', id);
    if (error) { showToast('Không thể xóa trường.', 'error'); return; }
    setCustomFields((prev) => ({ ...prev, [docType]: (prev[docType] || []).filter((f) => f.id !== id) }));
    showToast('Đã xóa trường.');
  }
  async function reorderCustomField(docType, id, direction, projectTypeId) {
    const typeKey = projectTypeId || GENERIC_TYPE_ID;
    const list = (customFields[docType] || []).filter((f) => f.project_type_id === typeKey).sort((a, b) => a.sort_order - b.sort_order);
    const idx = list.findIndex((f) => f.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const a = list[idx], b = list[swapIdx];
    await supabase.from('custom_fields').update({ sort_order: b.sort_order }).eq('id', a.id);
    await supabase.from('custom_fields').update({ sort_order: a.sort_order }).eq('id', b.id);
    setCustomFields((prev) => ({
      ...prev,
      [docType]: prev[docType].map((f) => (f.id === a.id ? { ...f, sort_order: b.sort_order } : f.id === b.id ? { ...f, sort_order: a.sort_order } : f)),
    }));
  }

  async function saveFieldOverride(docType, fieldName, patch, projectTypeId) {
    const typeKey = projectTypeId || GENERIC_TYPE_ID;
    const { data, error } = await supabase
      .from('field_overrides')
      .upsert({ doc_type: docType, field_name: fieldName, project_type_id: typeKey, ...patch }, { onConflict: 'doc_type,project_type_id,field_name' })
      .select()
      .single();
    if (error) { showToast('Không thể lưu thay đổi: ' + error.message, 'error'); return; }
    setFieldOverrides((prev) => ({
      ...prev,
      [docType]: [...(prev[docType] || []).filter((o) => !(o.field_name === fieldName && o.project_type_id === typeKey)), data],
    }));
    showToast('Đã cập nhật trường.');
  }

  async function updateCustomField(docType, id, patch) {
    const { data, error } = await supabase.from('custom_fields').update(patch).eq('id', id).select().single();
    if (error) { showToast('Không thể cập nhật trường: ' + error.message, 'error'); return; }
    setCustomFields((prev) => ({ ...prev, [docType]: prev[docType].map((f) => (f.id === id ? data : f)) }));
    showToast('Đã cập nhật trường.');
  }

  async function toggleBuiltinFieldVisibility(docType, fieldName, hide, projectTypeId) {
    const typeKey = projectTypeId || GENERIC_TYPE_ID;
    if (hide) {
      const { data, error } = await supabase.from('hidden_builtin_fields').insert({ doc_type: docType, field_name: fieldName, project_type_id: typeKey }).select().single();
      if (error) { showToast('Không thể ẩn trường: ' + error.message, 'error'); return; }
      setHiddenFields((prev) => ({ ...prev, [docType]: [...(prev[docType] || []), data] }));
    } else {
      const { error } = await supabase.from('hidden_builtin_fields').delete().eq('doc_type', docType).eq('field_name', fieldName).eq('project_type_id', typeKey);
      if (error) { showToast('Không thể hiện lại trường.', 'error'); return; }
      setHiddenFields((prev) => ({ ...prev, [docType]: (prev[docType] || []).filter((h) => !(h.field_name === fieldName && h.project_type_id === typeKey)) }));
    }
  }

  /* ---------------- print template (admin only) ---------------- */
  async function savePrintTemplate(docType, layout, projectTypeId) {
    const typeKey = projectTypeId || GENERIC_TYPE_ID;
    const { data, error } = await supabase
      .from('print_templates')
      .upsert({ doc_type: docType, project_type_id: typeKey, layout, updated_by: myId, updated_at: new Date().toISOString() }, { onConflict: 'doc_type,project_type_id' })
      .select()
      .single();
    if (error) { showToast('Không thể lưu mẫu in: ' + error.message, 'error'); return; }
    setPrintTemplates((prev) => ({ ...prev, [docType]: { ...(prev[docType] || {}), [typeKey]: { layout: data.layout } } }));
    showToast('Đã lưu bố cục mẫu in.');
  }

  /* ---------------- mẫu file Word (.docx) ---------------- */
  async function uploadDocxTemplate(docType, file, projectTypeId) {
    const typeKey = projectTypeId || GENERIC_TYPE_ID;
    const path = `${docType}_${typeKey}.docx`;
    const { error: uploadError } = await supabase.storage.from('docx-templates').upload(path, file, { upsert: true });
    if (uploadError) { showToast('Không thể tải lên file mẫu: ' + uploadError.message, 'error'); return; }
    const { data, error } = await supabase
      .from('docx_templates')
      .upsert({ doc_type: docType, project_type_id: typeKey, storage_path: path, updated_by: myId, updated_at: new Date().toISOString() }, { onConflict: 'doc_type,project_type_id' })
      .select()
      .single();
    if (error) { showToast('Không thể lưu thông tin mẫu: ' + error.message, 'error'); return; }
    setDocxTemplates((prev) => ({ ...prev, [docType]: { ...(prev[docType] || {}), [typeKey]: { storage_path: data.storage_path } } }));
    showToast('Đã tải lên mẫu Word.');
  }

  async function exportDocx(docType, record, project) {
    const tpl = resolveDocxTemplate(docType, project?.typeId);
    if (!tpl) { showToast('Chưa có mẫu Word cho loại hồ sơ này.', 'error'); return; }
    try {
      const { data: fileBlob, error } = await supabase.storage.from('docx-templates').download(tpl.storage_path);
      if (error) throw error;
      const arrayBuffer = await fileBlob.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      const schema = getSchema(docType, project?.typeId);
      const mergeData = { du_an: project ? project.ten : '' };
      schema.fields.forEach((f) => {
        let v = record[f.name];
        if (f.type === 'number') v = formatVND(v);
        if (f.type === 'date') v = formatDateVN(v);
        mergeData[f.name] = v ?? '';
      });

      doc.render(mergeData);
      const out = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const title = record.tenGoiThau || record.soHopDong || record.maGoiThau || 'ho_so';
      const url = URL.createObjectURL(out);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Không thể xuất file Word: ' + (err.message || 'lỗi không xác định. Kiểm tra lại các thẻ {ten_truong} trong file mẫu.'), 'error');
    }
  }

  /* ---------------- giao việc điền thông tin ---------------- */
  async function sendNotificationEmail(toUserId, subject, html) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ to_user_id: toUserId, subject, html }),
      });
    } catch (e) { /* gửi email thất bại không nên chặn luồng chính */ }
  }

  async function createAssignment(documentId, docType, assignedToUserId, fieldKeys, recordTitle) {
    const { data, error } = await supabase
      .from('document_assignments')
      .insert({ document_id: documentId, doc_type: docType, assigned_to: assignedToUserId, assigned_by: myId, field_keys: fieldKeys })
      .select()
      .single();
    if (error) { showToast('Không thể giao việc: ' + error.message, 'error'); return; }
    setMyAssignments((prev) => [...prev, {
      id: data.id, documentId: data.document_id, docType: data.doc_type, assignedTo: data.assigned_to, assignedBy: data.assigned_by,
      fieldKeys: data.field_keys, status: data.status, createdAt: data.created_at, completedAt: data.completed_at,
    }]);
    const link = `${window.location.origin}${window.location.pathname}?assignment=${data.id}`;
    await sendNotificationEmail(
      assignedToUserId,
      `Bạn được giao điền thông tin: ${recordTitle || DOC_TYPES[docType].label}`,
      `<p>${myProfile.full_name} đã giao cho bạn điền một phần thông tin trong hồ sơ "<b>${recordTitle || DOC_TYPES[docType].label}</b>".</p>
       <p><a href="${link}">Bấm vào đây để điền thông tin</a></p>`
    );
    showToast('Đã giao việc và gửi email thông báo.');
    appendLog('assign_field', `${myProfile.full_name} đã giao điền thông tin (${fieldKeys.length} trường) cho "${nameOf(assignedToUserId)}" trong hồ sơ "${recordTitle || ''}".`);
    return data.id;
  }

  async function saveAssignmentDraft(assignment, typeKey, patchFields) {
    const rec = (records[typeKey] || []).find((r) => r.id === assignment.documentId);
    if (!rec) return;
    const { id: _id, duAnId, createdAt, updatedAt, createdBy, locked, ...rest } = rec;
    const newData = { ...rest, ...patchFields };
    const { error } = await supabase.from('documents').update({ data: newData, updated_at: new Date().toISOString() }).eq('id', assignment.documentId);
    if (error) { showToast('Không thể lưu: ' + error.message, 'error'); return false; }
    setRecords((prev) => ({
      ...prev,
      [typeKey]: (prev[typeKey] || []).map((r) => (r.id === assignment.documentId ? { ...r, ...patchFields } : r)),
    }));
    return true;
  }

  async function completeAssignment(assignment, typeKey, recordTitle) {
    const { error } = await supabase.from('document_assignments').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', assignment.id);
    if (error) { showToast('Không thể xác nhận hoàn thành: ' + error.message, 'error'); return; }
    setMyAssignments((prev) => prev.map((a) => (a.id === assignment.id ? { ...a, status: 'completed', completedAt: new Date().toISOString() } : a)));
    await sendNotificationEmail(
      assignment.assignedBy,
      `${myProfile.full_name} đã hoàn thành phần điền thông tin`,
      `<p>${myProfile.full_name} đã điền xong phần được giao trong hồ sơ "<b>${recordTitle || DOC_TYPES[typeKey].label}</b>" và xác nhận gửi lại cho bạn.</p>`
    );
    showToast('Đã xác nhận hoàn thành và gửi lại cho người giao việc.');
    appendLog('complete_assignment', `${myProfile.full_name} đã hoàn thành phần điền thông tin được giao trong hồ sơ "${recordTitle || ''}".`);
  }

  /* ---------------- project types (admin only) ---------------- */
  async function createProjectType(ten) {
    const { data, error } = await supabase.from('project_types').insert({ ten }).select().single();
    if (error) { showToast('Không thể tạo loại dự án: ' + error.message, 'error'); return; }
    setProjectTypes((prev) => [...prev, { id: data.id, ten: data.ten }].sort((a, b) => a.ten.localeCompare(b.ten)));
    showToast('Đã tạo loại dự án.');
    appendLog('create_project_type', `${myProfile.full_name} đã tạo loại dự án "${ten}".`);
  }
  async function deleteProjectType(typeId) {
    const { error } = await supabase.from('project_types').delete().eq('id', typeId);
    if (error) { showToast('Không thể xóa loại dự án (có thể đang được dự án nào đó sử dụng).', 'error'); return; }
    setProjectTypes((prev) => prev.filter((t) => t.id !== typeId));
    showToast('Đã xóa loại dự án.');
  }

  /* ---------------- projects (admin only) ---------------- */
  async function createProject(ten, moTa, typeId, projectData, stepsList) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ ten, ma_du_an: null, mo_ta: moTa, type_id: typeId || null, data: projectData || {}, created_by: myId })
      .select()
      .single();
    if (error) { showToast('Không thể tạo dự án: ' + error.message, 'error'); return; }
    const typeName = typeId ? (projectTypes.find((t) => t.id === typeId)?.ten || null) : null;
    setProjects((prev) => [...prev, { id: data.id, ten: data.ten, maDuAn: data.ma_du_an, moTa: data.mo_ta, typeId: data.type_id, typeName, data: data.data || {}, createdAt: data.created_at }]);
    if (stepsList && stepsList.length > 0) {
      await saveProjectSteps(data.id, stepsList);
    }
    showToast(`Đã tạo dự án với mã ${data.ma_du_an}.`);
    appendLog('create_project', `${myProfile.full_name} đã tạo dự án "${ten}" (mã ${data.ma_du_an}).`);
  }
  async function deleteProject(project) {
    const { error } = await supabase.from('projects').delete().eq('id', project.id);
    if (error) { showToast('Không thể xóa dự án.', 'error'); return; }
    setProjects((prev) => prev.filter((p) => p.id !== project.id));
    setPermissions((prev) => prev.filter((p) => p.projectId !== project.id));
    setProjectSteps((prev) => { const next = { ...prev }; delete next[project.id]; return next; });
    setGoiThauList((prev) => { const next = { ...prev }; delete next[project.id]; return next; });
    setRecords((prev) => {
      const next = {};
      for (const k of TYPE_ORDER) next[k] = (prev[k] || []).map((r) => (r.duAnId === project.id ? { ...r, duAnId: null } : r));
      return next;
    });
    showToast('Đã xóa dự án. Hồ sơ thuộc dự án này sẽ hiển thị là "Chưa gán".');
    appendLog('delete_project', `${myProfile.full_name} đã xóa dự án "${project.ten}".`);
  }

  /* ---------------- permissions (admin only) ---------------- */
  async function setPermission(projectId, userId, docType, key, value) {
    const existing = permissions.find((p) => p.projectId === projectId && p.userId === userId && p.docType === docType) || {};
    const payload = {
      project_id: projectId, user_id: userId, doc_type: docType,
      can_view: key === 'view' ? value : !!existing.can_view,
      can_add: key === 'add' ? value : !!existing.can_add,
      can_edit: key === 'edit' ? value : !!existing.can_edit,
      can_lock: key === 'lock' ? value : !!existing.can_lock,
      can_delete: key === 'delete' ? value : !!existing.can_delete,
    };
    const { data, error } = await supabase.from('project_permissions').upsert(payload, { onConflict: 'project_id,user_id,doc_type' }).select().single();
    if (error) { showToast('Không thể cập nhật quyền: ' + error.message, 'error'); return; }
    setPermissions((prev) => {
      const others = prev.filter((p) => !(p.projectId === projectId && p.userId === userId && p.docType === docType));
      return [...others, { projectId: data.project_id, userId: data.user_id, docType: data.doc_type, can_view: data.can_view, can_add: data.can_add, can_edit: data.can_edit, can_lock: data.can_lock, can_delete: data.can_delete }];
    });
  }
  async function removeUserFromProject(projectId, userId) {
    const { error } = await supabase.from('project_permissions').delete().eq('project_id', projectId).eq('user_id', userId);
    if (error) { showToast('Không thể gỡ quyền.', 'error'); return; }
    setPermissions((prev) => prev.filter((p) => !(p.projectId === projectId && p.userId === userId)));
    showToast('Đã gỡ toàn bộ quyền của người dùng khỏi dự án.');
    appendLog('remove_permissions', `${myProfile.full_name} đã gỡ quyền của "${nameOf(userId)}" khỏi một dự án.`);
  }

  /* ---------------- users (admin only, via Edge Function for create/delete) ---------------- */
  async function callUserFunction(body) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    return { ok: res.ok, result };
  }
  async function createUser(email, password, fullName, isAdmin) {
    const { ok, result } = await callUserFunction({ action: 'create', email, password, full_name: fullName, is_admin: isAdmin });
    if (!ok) { showToast('Không thể tạo người dùng: ' + (result.error || ''), 'error'); return; }
    setProfiles((prev) => [...prev, { id: result.user.id, full_name: fullName, is_admin: isAdmin }]);
    showToast('Đã tạo người dùng.');
    appendLog('create_user', `${myProfile.full_name} đã tạo tài khoản người dùng "${fullName}"${isAdmin ? ' với quyền Quản trị viên' : ''}.`);
  }
  async function bulkCreateUsers(rows) {
    const { ok, result } = await callUserFunction({ action: 'bulk_create', users: rows });
    if (!ok) { showToast('Không thể nhập danh sách: ' + (result.error || ''), 'error'); return { results: [] }; }
    const succeeded = result.results.filter((r) => r.success);
    if (succeeded.length > 0) {
      setProfiles((prev) => [...prev, ...succeeded.map((r) => ({ id: r.id, full_name: r.full_name, is_admin: false }))]);
      appendLog('bulk_create_user', `${myProfile.full_name} đã nhập danh sách và tạo ${succeeded.length} tài khoản người dùng mới.`);
    }
    showToast(`Đã tạo ${succeeded.length}/${rows.length} tài khoản.`, succeeded.length === rows.length ? 'ok' : 'error');
    return { results: result.results };
  }
  async function removeUser(userId) {
    const target = profiles.find((p) => p.id === userId);
    if (target?.is_admin) {
      const otherAdmins = profiles.filter((p) => p.is_admin && p.id !== userId);
      if (otherAdmins.length === 0) { showToast('Không thể xóa vì đây là Quản trị viên duy nhất.', 'error'); return; }
    }
    const { ok, result } = await callUserFunction({ action: 'delete', user_id: userId });
    if (!ok) { showToast('Không thể xóa người dùng: ' + (result.error || ''), 'error'); return; }
    const removedName = nameOf(userId);
    setProfiles((prev) => prev.filter((p) => p.id !== userId));
    setPermissions((prev) => prev.filter((p) => p.userId !== userId));
    showToast('Đã xóa người dùng.');
    appendLog('delete_user', `${myProfile.full_name} đã xóa tài khoản người dùng "${removedName}" khỏi hệ thống.`);
  }
  async function toggleUserAdmin(userId, makeAdmin) {
    if (!makeAdmin) {
      const otherAdmins = profiles.filter((p) => p.is_admin && p.id !== userId);
      if (otherAdmins.length === 0) { showToast('Phải có ít nhất một Quản trị viên.', 'error'); return; }
    }
    const { error } = await supabase.from('profiles').update({ is_admin: makeAdmin }).eq('id', userId);
    if (error) { showToast('Không thể cập nhật quyền.', 'error'); return; }
    setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, is_admin: makeAdmin } : p)));
    appendLog(makeAdmin ? 'grant_admin' : 'revoke_admin', `${myProfile.full_name} đã ${makeAdmin ? 'cấp' : 'gỡ'} quyền Quản trị viên cho "${nameOf(userId)}".`);
  }

  const schema = getSchema(activeType, GENERIC_TYPE_ID);
  const currentList = records[activeType] || [];

  const viewableList = currentList.filter((r) => canViewRecord(r, activeType));
  const projectScopedList = projectFilter === 'all' ? viewableList : viewableList.filter((r) => r.duAnId === projectFilter);
  const filteredList = projectScopedList.filter((r) => matchesSearch(r, schema, search));
  const addableProjectsForActiveType = assignableProjectsFor(activeType, 'add');

  const detailRecord = view === 'detail' ? currentList.find((r) => r.id === detailId) : null;
  const detailProject = detailRecord ? projectById(projects, detailRecord.duAnId) : null;
  const detailCanView = detailRecord ? canViewRecord(detailRecord, activeType) : false;
  const detailCanEdit = detailRecord ? canEditDoc(detailRecord, activeType) : false;
  const detailCanDelete = detailRecord ? canDeleteDoc(detailRecord, activeType) : false;
  const detailCanLock = detailRecord ? canLockDoc(detailRecord, activeType) : false;

  if (authChecking) return <LoadingScreen label="Đang kiểm tra đăng nhập…" />;
  if (!session) return <Login onLogin={handleLogin} />;
  if (loading || !myProfile) return <LoadingScreen />;

  return (
    <div className="flex h-full min-h-[640px] bg-stone-50 text-stone-800">
      <style>{`
        @page { margin: 1.4cm; }
        @media print { body { background: white; } }
      `}</style>

      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-teal-950 text-teal-50 print:hidden">
        <div className="border-b border-teal-900 px-5 py-5">
          <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-lg leading-tight">
            Hồ sơ Đấu thầu
          </div>
          <div className="mt-0.5 text-xs text-teal-300/80">Quản lý biểu mẫu &amp; hồ sơ</div>
        </div>

        <div className="flex flex-col gap-1 px-3 pt-4">
          <button
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
              view === 'dashboard' ? 'bg-teal-800/70 text-white' : 'text-teal-200 hover:bg-teal-900/60'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Tổng quan
          </button>
          <button
            onClick={() => { setActiveAssignmentId(null); setView('my-assignments'); }}
            className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
              view === 'my-assignments' || view === 'fill-assignment' ? 'bg-teal-800/70 text-white' : 'text-teal-200 hover:bg-teal-900/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Nhiệm vụ của tôi
            </span>
            {myAssignments.filter((a) => a.assignedTo === myId && a.status === 'pending').length > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 text-xs text-white">
                {myAssignments.filter((a) => a.assignedTo === myId && a.status === 'pending').length}
              </span>
            )}
          </button>
          {amAdmin && (
            <button
              onClick={() => setView('projects')}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                view === 'projects' ? 'bg-teal-800/70 text-white' : 'text-teal-200 hover:bg-teal-900/60'
              }`}
            >
              <FolderKanban className="h-4 w-4" />
              Dự án
            </button>
          )}
          {amAdmin && (
            <button
              onClick={() => setView('users')}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                view === 'users' ? 'bg-teal-800/70 text-white' : 'text-teal-200 hover:bg-teal-900/60'
              }`}
            >
              <UserCog className="h-4 w-4" />
              Người dùng
            </button>
          )}
          {amAdmin && (
            <button
              onClick={() => setView('template-editor')}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                view === 'template-editor' ? 'bg-teal-800/70 text-white' : 'text-teal-200 hover:bg-teal-900/60'
              }`}
            >
              <Settings2 className="h-4 w-4" />
              Tùy chỉnh mẫu
            </button>
          )}
          {amAdmin && (
            <button
              onClick={() => setView('log')}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                view === 'log' ? 'bg-teal-800/70 text-white' : 'text-teal-200 hover:bg-teal-900/60'
              }`}
            >
              <History className="h-4 w-4" />
              Nhật ký hoạt động
            </button>
          )}
        </div>

        <div className="mt-4 px-5 text-[11px] font-medium uppercase tracking-wide text-teal-400/70">Dự án của tôi</div>
        <div className="mt-1 flex flex-col gap-0.5 px-3">
          <button
            onClick={() => setProjectFilter('all')}
            className={`flex items-center justify-between rounded-md px-3 py-1.5 text-sm ${
              projectFilter === 'all' ? 'bg-teal-800/70 text-white' : 'text-teal-200 hover:bg-teal-900/60'
            }`}
          >
            Tất cả dự án
          </button>
          {accessibleProjects.length === 0 && (
            <div className="px-3 py-2 text-xs text-teal-400/70">Chưa có dự án nào được cấp quyền.</div>
          )}
          {accessibleProjects.map((p) => (
            <button
              key={p.id}
              onClick={() => setProjectFilter(p.id)}
              className={`truncate rounded-md px-3 py-1.5 text-left text-sm ${
                projectFilter === p.id ? 'bg-teal-800/70 text-white' : 'text-teal-200 hover:bg-teal-900/60'
              }`}
            >
              {p.ten}
            </button>
          ))}
        </div>

        <div className="mt-4 px-5 text-[11px] font-medium uppercase tracking-wide text-teal-400/70">Biểu mẫu</div>
        <nav className="mt-1 flex flex-col gap-1 px-3">
          {TYPE_ORDER.map((key) => {
            const t = DOC_TYPES[key];
            const Icon = t.icon;
            const isActive = (view === 'list' || view === 'form' || view === 'detail') && activeType === key;
            const count = (records[key] || []).filter((r) => canViewRecord(r, key) && (projectFilter === 'all' || r.duAnId === projectFilter)).length;
            const stepLocked = projectFilter !== 'all' && !amAdmin && !isDocTypeUnlockedForProject(projectFilter, key);
            return (
              <button
                key={key}
                onClick={() => openList(key)}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-teal-800/70 text-white' : 'text-teal-200 hover:bg-teal-900/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {t.label}
                  {stepLocked && <Lock className="h-3 w-3 text-teal-400/70" />}
                </span>
                <span className="rounded bg-teal-950/60 px-1.5 py-0.5 text-xs text-teal-300">{count}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-teal-900 px-5 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="truncate text-teal-100">{myProfile.full_name}</span>
            {amAdmin && <RoleBadge role="admin" />}
          </div>
          <button onClick={handleLogout} className="mt-1 flex items-center gap-1 text-xs text-teal-400/70 hover:text-teal-200">
            <LogOut className="h-3 w-3" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {view === 'dashboard' && (
          <Dashboard
            records={records}
            projects={accessibleProjects}
            allProjectsEmpty={projects.length === 0}
            amAdmin={amAdmin}
            projectFilter={projectFilter}
            canViewRecord={canViewRecord}
            onOpenType={openList}
            onNew={openNewForm}
            onGoAdmin={() => setView('projects')}
          />
        )}

        {view === 'my-assignments' && (
          <MyAssignmentsView
            assignments={myAssignments.filter((a) => a.assignedTo === myId)}
            records={records}
            nameOf={nameOf}
            onOpen={(assignment) => { setActiveType(assignment.docType); setActiveAssignmentId(assignment.id); setView('fill-assignment'); }}
          />
        )}

        {view === 'fill-assignment' && (() => {
          const assignment = myAssignments.find((a) => a.id === activeAssignmentId);
          const rec = assignment ? (records[assignment.docType] || []).find((r) => r.id === assignment.documentId) : null;
          if (!assignment || !rec) {
            return <div className="p-10 text-center text-stone-400">Không tìm thấy nhiệm vụ này (có thể đã bị xóa).</div>;
          }
          const proj = projectById(projects, rec.duAnId);
          return (
            <AssignmentFillView
              schema={getSchema(assignment.docType, proj?.typeId)}
              record={rec}
              project={proj}
              assignment={assignment}
              onSaveDraft={(patch) => saveAssignmentDraft(assignment, assignment.docType, patch)}
              onComplete={() => completeAssignment(assignment, assignment.docType, rec.tenGoiThau || rec.soHopDong || rec.maGoiThau)}
              onBack={() => setView('my-assignments')}
            />
          );
        })()}

        {view === 'list' && (
          <ListView
            schema={schema}
            list={filteredList}
            projects={projects}
            assignableProjects={addableProjectsForActiveType}
            search={search}
            onSearch={setSearch}
            projectFilter={projectFilter}
            onProjectFilter={setProjectFilter}
            accessibleProjects={accessibleProjects}
            onNew={() => openNewForm(activeType)}
            onView={(id) => openDetail(activeType, id)}
            onEdit={(rec) => openEditForm(activeType, rec)}
            onDelete={(id) => handleDelete(activeType, id)}
            onToggleLock={(rec) => toggleLock(activeType, rec)}
            onBulkImport={(rows) => bulkImportDocuments(activeType, rows)}
            savedTemplate={importTemplates[activeType]}
            onSaveTemplate={(mapping) => saveImportTemplate(activeType, mapping)}
            confirmingDelete={confirmingDelete}
            canEditDoc={(r) => canEditDoc(r, activeType)}
            canDeleteDoc={(r) => canDeleteDoc(r, activeType)}
            canLockDoc={(r) => canLockDoc(r, activeType)}
            currentStep={projectFilter !== 'all' ? (projectSteps[projectFilter] || []).find((s) => s.docType === activeType) : null}
            canToggleStep={projectFilter !== 'all' && (amAdmin || getPerm(projectFilter, myId, activeType).add || getPerm(projectFilter, myId, activeType).edit)}
            onToggleStepCompleted={(completed) => toggleStepCompleted(projectFilter, activeType, completed)}
          />
        )}

        {view === 'form' && formData && (
          <FormView
            schema={getSchema(activeType, projectById(projects, formData.duAnId)?.typeId)}
            formData={formData}
            errors={formErrors}
            editing={!!editingId}
            saving={saving}
            projects={editingId ? assignableProjectsFor(activeType, 'edit') : assignableProjectsFor(activeType, 'add')}
            packages={goiThauList[formData.duAnId] || []}
            onCreatePackage={(ten) => createGoiThau(formData.duAnId, ten, {})}
            onChange={updateField}
            onSubmit={handleSubmit}
            onCancel={() => setView(editingId ? 'detail' : 'list')}
          />
        )}

        {view === 'detail' && detailRecord && detailCanView && (
          <DetailView
            schema={getSchema(activeType, detailProject?.typeId)}
            record={detailRecord}
            project={detailProject}
            canEdit={detailCanEdit}
            canDelete={detailCanDelete}
            canLock={detailCanLock}
            customLayout={resolvePrintLayout(activeType, detailProject?.typeId)?.layout}
            hasDocxTemplate={!!resolveDocxTemplate(activeType, detailProject?.typeId)}
            onExportDocx={() => exportDocx(activeType, detailRecord, detailProject)}
            onAssign={() => setAssigningRecord({ docType: activeType, record: detailRecord })}
            onBack={() => setView('list')}
            onEdit={() => openEditForm(activeType, detailRecord)}
            onDelete={() => handleDelete(activeType, detailRecord.id)}
            onToggleLock={() => toggleLock(activeType, detailRecord)}
            confirmingDelete={confirmingDelete === detailRecord.id}
          />
        )}

        {view === 'detail' && detailRecord && !detailCanView && (
          <div className="p-10 text-center text-stone-400">Bạn không có quyền xem hồ sơ này.</div>
        )}
        {view === 'detail' && !detailRecord && (
          <div className="p-10 text-center text-stone-400">Không tìm thấy hồ sơ.</div>
        )}

        {assigningRecord && (
          <AssignFieldsModal
            schema={getSchema(assigningRecord.docType, projectById(projects, assigningRecord.record.duAnId)?.typeId)}
            profiles={profiles.filter((p) => p.id !== myId)}
            onClose={() => setAssigningRecord(null)}
            onAssign={async (userId, fieldKeys) => {
              const title = assigningRecord.record.tenGoiThau || assigningRecord.record.soHopDong || assigningRecord.record.maGoiThau;
              await createAssignment(assigningRecord.record.id, assigningRecord.docType, userId, fieldKeys, title);
              setAssigningRecord(null);
            }}
          />
        )}

        {view === 'projects' && amAdmin && (
          <ProjectsView
            projects={projects}
            projectTypes={projectTypes}
            projectSchema={getSchema('project', GENERIC_TYPE_ID)}
            goiThauSchema={getSchema('goi_thau', GENERIC_TYPE_ID)}
            projectSteps={projectSteps}
            goiThauList={goiThauList}
            onCreateProject={createProject}
            onDeleteProject={deleteProject}
            onCreateProjectType={createProjectType}
            onDeleteProjectType={deleteProjectType}
            onSaveProjectSteps={saveProjectSteps}
            onToggleStepCompleted={toggleStepCompleted}
            onCreateGoiThau={createGoiThau}
            onDeleteGoiThau={deleteGoiThau}
            showToast={showToast}
          />
        )}

        {view === 'users' && amAdmin && (
          <UsersView
            profiles={profiles}
            projects={projects}
            permissions={permissions}
            myId={myId}
            nameOf={nameOf}
            onCreateUser={createUser}
            onBulkCreateUsers={bulkCreateUsers}
            onRemoveUser={removeUser}
            onToggleAdmin={toggleUserAdmin}
            onSetPermission={setPermission}
            onRemoveUserFromProject={removeUserFromProject}
            showToast={showToast}
          />
        )}

        {view === 'template-editor' && amAdmin && (
          <TemplateEditorView
            getSchema={getSchema}
            projectTypes={projectTypes}
            customFields={customFields}
            hiddenFields={hiddenFields}
            fieldOverrides={fieldOverrides}
            printTemplates={printTemplates}
            docxTemplates={docxTemplates}
            templateFieldMode={templateFieldMode}
            onSetTemplateFieldMode={setTemplateFieldMode}
            onUploadDocxTemplate={uploadDocxTemplate}
            onCreateField={createCustomField}
            onDeleteField={deleteCustomField}
            onReorderField={reorderCustomField}
            onUpdateField={updateCustomField}
            onToggleHideField={toggleBuiltinFieldVisibility}
            onSaveFieldOverride={saveFieldOverride}
            onSavePrintTemplate={savePrintTemplate}
            showToast={showToast}
          />
        )}

        {view === 'log' && amAdmin && <AuditLog entries={auditLog} />}
      </main>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

function Dashboard({ records, projects, allProjectsEmpty, amAdmin, projectFilter, canViewRecord, onOpenType, onNew, onGoAdmin }) {
  function visibleCount(typeKey) {
    return (records[typeKey] || []).filter((r) => {
      if (projectFilter !== 'all' && r.duAnId !== projectFilter) return false;
      return canViewRecord(r, typeKey);
    }).length;
  }
  const totalCount = TYPE_ORDER.reduce((s, k) => s + visibleCount(k), 0);

  const recent = TYPE_ORDER
    .flatMap((k) => (records[k] || []).map((r) => ({ ...r, __type: k })))
    .filter((r) => (projectFilter === 'all' || r.duAnId === projectFilter) && canViewRecord(r, r.__type))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-2xl text-stone-900">
        Tổng quan hồ sơ đấu thầu
      </div>
      <p className="mt-1 text-sm text-stone-500">
        {totalCount === 0
          ? 'Chưa có hồ sơ nào bạn có quyền xem trong phạm vi hiện tại.'
          : `Đang hiển thị ${totalCount} hồ sơ trong phạm vi bạn có quyền truy cập.`}
      </p>

      {amAdmin && allProjectsEmpty && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>Chưa có dự án nào. Tạo dự án đầu tiên để bắt đầu phân quyền và gán hồ sơ.</span>
          <button onClick={onGoAdmin} className="rounded-md bg-amber-800 px-3 py-1.5 text-xs text-white hover:bg-amber-900">
            Tạo dự án
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TYPE_ORDER.map((key) => {
          const t = DOC_TYPES[key];
          const Icon = t.icon;
          return (
            <button key={key} onClick={() => onOpenType(key)}
              className="group flex flex-col items-start gap-3 rounded-lg border border-stone-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md">
              <Icon className="h-5 w-5 text-amber-800" />
              <div>
                <div className="text-2xl font-semibold text-teal-950">{visibleCount(key)}</div>
                <div className="text-xs text-stone-500">{t.short}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {TYPE_ORDER.map((key) => (
          <button key={key} onClick={() => onNew(key)}
            className="flex items-center gap-1.5 rounded-md border border-teal-800 px-3 py-1.5 text-sm text-teal-900 hover:bg-teal-50">
            <Plus className="h-3.5 w-3.5" /> {DOC_TYPES[key].short} mới
          </button>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-3 text-sm font-medium text-stone-600">Hồ sơ gần đây</div>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-stone-300 py-12 text-stone-400">
            <Inbox className="h-6 w-6" />
            <span className="text-sm">Chưa có hồ sơ nào.</span>
          </div>
        ) : (
          <div className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
            {recent.map((r) => {
              const t = DOC_TYPES[r.__type];
              const Icon = t.icon;
              const title = r.tenGoiThau || r.soHopDong || r.maGoiThau || '(không có tiêu đề)';
              return (
                <button key={r.id} onClick={() => onOpenType(r.__type)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-stone-50">
                  <Icon className="h-4 w-4 shrink-0 text-teal-800" />
                  <span className="flex-1 truncate text-sm text-stone-800">{title}</span>
                  {r.locked && <Lock className="h-3.5 w-3.5 shrink-0 text-stone-400" />}
                  <span className="shrink-0 text-xs text-stone-400">{t.short}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* List view                                                            */
/* ------------------------------------------------------------------ */

function ListView({
  schema, list, projects, assignableProjects, search, onSearch, projectFilter, onProjectFilter, accessibleProjects,
  onNew, onView, onEdit, onDelete, onToggleLock, onBulkImport, savedTemplate, onSaveTemplate,
  confirmingDelete, canEditDoc, canDeleteDoc, canLockDoc, currentStep, canToggleStep, onToggleStepCompleted,
}) {
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">
            {schema.label}
          </div>
          <div className="text-sm text-stone-500">{list.length} hồ sơ</div>
        </div>
        <div className="flex items-center gap-2">
          {assignableProjects.length > 0 && (
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 rounded-md border border-teal-800 px-3.5 py-2 text-sm text-teal-900 hover:bg-teal-50">
              <FileSpreadsheet className="h-4 w-4" /> Nhập từ Excel
            </button>
          )}
          <button onClick={onNew} className="flex items-center gap-1.5 rounded-md bg-teal-900 px-3.5 py-2 text-sm text-white hover:bg-teal-800">
            <Plus className="h-4 w-4" /> Thêm mới
          </button>
        </div>
      </div>

      {currentStep && (
        <div className={`mt-3 flex items-center justify-between rounded-md px-3 py-2 text-sm ${currentStep.completed ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'}`}>
          <span className="flex items-center gap-1.5">
            {currentStep.completed ? <CheckCircle2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {currentStep.completed
              ? 'Bước này đã được đánh dấu hoàn thành cho dự án đang chọn.'
              : 'Bước này thuộc quy trình có thứ tự của dự án đang chọn — chưa hoàn thành.'}
          </span>
          {canToggleStep && (
            <button
              onClick={() => onToggleStepCompleted(!currentStep.completed)}
              className={`rounded-md border px-3 py-1 text-xs ${currentStep.completed ? 'border-stone-300 text-stone-600 hover:bg-white' : 'border-teal-700 bg-teal-700 text-white hover:bg-teal-800'}`}
            >
              {currentStep.completed ? 'Bỏ đánh dấu' : 'Đánh dấu hoàn thành'}
            </button>
          )}
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm theo mã gói thầu, tên gói thầu, đơn vị…"
            className="w-full rounded-md border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/40"
          />
        </div>
        <select value={projectFilter} onChange={(e) => onProjectFilter(e.target.value)}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/40">
          <option value="all">Tất cả dự án</option>
          {accessibleProjects.map((p) => <option key={p.id} value={p.id}>{p.ten}</option>)}
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-stone-200 bg-white">
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-stone-400">
            <Inbox className="h-6 w-6" />
            <span className="text-sm">Chưa có hồ sơ phù hợp.</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-100 text-stone-600">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Dự án</th>
                {schema.listColumns.map((c) => <th key={c.key} className="px-4 py-2.5 text-left font-medium">{c.label}</th>)}
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody>
              {list.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map((r) => {
                const proj = projectById(projects, r.duAnId);
                const editable = canEditDoc(r);
                const deletable = canDeleteDoc(r);
                const lockable = canLockDoc(r);
                return (
                  <tr key={r.id} className="border-t border-stone-200 hover:bg-stone-50">
                    <td className="px-4 py-2.5 text-stone-500">
                      {proj ? proj.ten : <span className="italic text-stone-400">Chưa gán</span>}
                    </td>
                    {schema.listColumns.map((c) => (
                      <td key={c.key} className="px-4 py-2.5 text-stone-700">
                        {c.date ? formatDateVN(r[c.key]) : c.money ? formatVND(r[c.key]) : (r[c.key] || '—')}
                      </td>
                    ))}
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {r.locked && <Lock className="h-3.5 w-3.5 text-stone-400" />}
                        <button onClick={() => onView(r.id)} title="Xem" className="rounded p-1.5 text-stone-500 hover:bg-stone-200 hover:text-teal-900">
                          <FileText className="h-4 w-4" />
                        </button>
                        {lockable && (
                          <button onClick={() => onToggleLock(r)} title={r.locked ? 'Mở khóa' : 'Khóa'}
                            className="rounded p-1.5 text-stone-500 hover:bg-stone-200 hover:text-amber-800">
                            {r.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </button>
                        )}
                        {editable && (
                          <button onClick={() => onEdit(r)} title="Sửa" className="rounded p-1.5 text-stone-500 hover:bg-stone-200 hover:text-teal-900">
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {deletable && (
                          <button onClick={() => onDelete(r.id)} title="Xóa"
                            className={`rounded p-1.5 hover:bg-rose-50 ${confirmingDelete === r.id ? 'text-rose-700' : 'text-stone-500 hover:text-rose-700'}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {confirmingDelete === r.id && (
                        <div className="mt-1 text-right text-[11px] text-rose-600">Nhấn lại để xác nhận xóa</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showImport && (
        <ExcelImportModal
          schema={schema}
          assignableProjects={assignableProjects}
          savedTemplate={savedTemplate}
          onSaveTemplate={onSaveTemplate}
          onClose={() => setShowImport(false)}
          onImport={onBulkImport}
        />
      )}
    </div>
  );
}

/* ---------------- Import hồ sơ hàng loạt từ file Excel (có ghi nhớ mẫu cột) ---------------- */

function ExcelImportModal({ schema, assignableProjects, savedTemplate, onSaveTemplate, onClose, onImport }) {
  const importableFields = schema.fields.filter((f) => f.type !== 'items' && f.type !== 'table');
  const FIELD_OPTIONS = [
    { value: '__ignore__', label: '— Bỏ qua cột này —' },
    { value: '__project__', label: 'Dự án' },
    ...importableFields.map((f) => ({ value: f.name, label: f.label })),
  ];

  const [step, setStep] = useState('upload'); // upload | chooseHeader | mapping | preview
  const [rawRows, setRawRows] = useState([]); // toàn bộ dòng thô đọc từ file (mảng của mảng)
  const [headerRowIndex, setHeaderRowIndex] = useState(0);
  const [headerRow, setHeaderRow] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [mapping, setMapping] = useState({}); // { headerText: fieldValue }
  const [rememberTemplate, setRememberTemplate] = useState(true);
  const [preview, setPreview] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  function guessMapping(headers) {
    const saved = savedTemplate?.column_mapping || {};
    const guess = {};
    headers.forEach((h) => {
      const key = h.trim().toLowerCase();
      const savedMatch = Object.keys(saved).find((sh) => sh.trim().toLowerCase() === key);
      if (savedMatch) { guess[h] = saved[savedMatch]; return; }
      if (key === 'dự án' || key === 'du an') { guess[h] = '__project__'; return; }
      const fieldMatch = importableFields.find((f) => f.label.trim().toLowerCase() === key);
      guess[h] = fieldMatch ? fieldMatch.name : '__ignore__';
    });
    return guess;
  }

  function downloadTemplate() {
    const headers = ['Dự án', ...importableFields.map((f) => f.label)];
    const example = [
      assignableProjects[0]?.ten || 'Tên dự án',
      ...importableFields.map((f) => (f.type === 'date' ? '2026-01-15' : f.type === 'number' ? '1000000' : `Ví dụ ${f.label}`)),
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    XLSX.utils.book_append_sheet(wb, ws, schema.short);
    XLSX.writeFile(wb, `mau_${schema.key}.xlsx`);
  }

  function countNonEmpty(row) {
    return (row || []).filter((cell) => String(cell ?? '').trim() !== '').length;
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows2d = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        if (!rows2d || rows2d.length === 0) {
          alert('File không có dữ liệu.');
          return;
        }
        setRawRows(rows2d);
        // Đoán dòng tiêu đề: dòng có nhiều ô không trống nhất trong 15 dòng đầu
        const scanRange = rows2d.slice(0, 15).map(countNonEmpty);
        const bestIdx = scanRange.indexOf(Math.max(...scanRange));
        applyHeaderRow(rows2d, bestIdx);
        setStep('chooseHeader');
      } catch (err) {
        alert('Không đọc được file: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  }

  function applyHeaderRow(rows2d, idx) {
    setHeaderRowIndex(idx);
    const headers = (rows2d[idx] || []).map((h) => String(h ?? '').trim());
    // giữ cả ô trống để không lệch cột, nhưng lọc bỏ khi hiển thị/mapping nếu hoàn toàn trống
    const cleanedHeaders = headers.map((h, i) => h || `Cột ${i + 1}`);
    const rows = rows2d.slice(idx + 1).filter((r) => countNonEmpty(r) > 0);
    setHeaderRow(cleanedHeaders);
    setDataRows(rows);
    setMapping(guessMapping(cleanedHeaders));
  }

  function confirmHeaderRow() {
    setStep('mapping');
  }

  function buildPreview() {
    const projectColIdx = headerRow.findIndex((h) => mapping[h] === '__project__');
    const fieldColIdxByName = {};
    headerRow.forEach((h, idx) => {
      const target = mapping[h];
      if (target && target !== '__ignore__' && target !== '__project__') fieldColIdxByName[target] = idx;
    });
    const rows = dataRows.map((r) => {
      const projectName = projectColIdx >= 0 ? String(r[projectColIdx] || '').trim() : '';
      const project = assignableProjects.find((p) => p.ten.trim().toLowerCase() === projectName.toLowerCase());
      const fields = {};
      importableFields.forEach((f) => {
        const idx = fieldColIdxByName[f.name];
        let v = idx !== undefined ? r[idx] : '';
        if (v instanceof Date) v = v.toISOString().slice(0, 10);
        fields[f.name] = v === undefined || v === null ? '' : String(v);
      });
      let error = null;
      if (!projectName) error = 'Thiếu tên dự án';
      else if (!project) error = 'Không tìm thấy dự án (hoặc bạn không có quyền "Thêm" ở dự án này)';
      else {
        const missing = importableFields.find((f) => f.required && !String(fields[f.name] || '').trim());
        if (missing) error = `Thiếu "${missing.label}"`;
      }
      return { duAnId: project?.id || null, __projectName: projectName, __error: error, ...fields };
    });
    setPreview(rows);
    setResults(null);
    setStep('preview');
    if (rememberTemplate) onSaveTemplate(mapping);
  }

  async function handleSubmit() {
    const validRows = preview.filter((r) => !r.__error).map(({ __error, __projectName, ...rest }) => rest);
    if (validRows.length === 0) return;
    setSubmitting(true);
    const { results } = await onImport(validRows);
    setSubmitting(false);
    setResults(results);
    if (results.every((r) => r.ok)) setTimeout(onClose, 900);
  }

  const validCount = preview.filter((r) => !r.__error).length;
  const mappedProjectCol = Object.values(mapping).includes('__project__');
  const mappedRequired = importableFields.filter((f) => f.required).every((f) => Object.values(mapping).includes(f.name));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-stone-900">Nhập "{schema.label}" từ Excel</div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>

        {step === 'upload' && (
          <>
            <p className="mt-2 text-sm text-stone-500">
              {savedTemplate ? 'Hệ thống đã ghi nhớ mẫu cột từ lần trước — tải file cùng định dạng lên để dùng lại tự động.' : 'Chưa có mẫu nào được ghi nhớ. Tải file mẫu chuẩn, hoặc tải lên file Excel bạn đang dùng — hệ thống sẽ hỏi bạn khớp cột 1 lần rồi ghi nhớ cho các lần sau.'}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button onClick={downloadTemplate} className="flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50">
                <Download className="h-3.5 w-3.5" /> Tải file mẫu
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-md border border-teal-800 px-3 py-1.5 text-sm text-teal-900 hover:bg-teal-50">
                <Upload className="h-3.5 w-3.5" /> Tải lên file Excel
              </button>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
            </div>
          </>
        )}

        {step === 'chooseHeader' && (
          <>
            <p className="mt-2 text-sm text-stone-500">
              Chọn đúng dòng nào trong file là <strong>dòng tiêu đề cột</strong> (tên các cột như "Tên gói thầu", "Ngày báo giá"...).
              Nếu file có dòng quốc hiệu/tiêu đề lớn ở trên, hãy bỏ qua các dòng đó.
            </p>
            <div className="mt-3 max-h-72 overflow-auto rounded-md border border-stone-200">
              <table className="w-full text-xs">
                <tbody>
                  {rawRows.slice(0, 15).map((row, idx) => (
                    <tr
                      key={idx}
                      onClick={() => applyHeaderRow(rawRows, idx)}
                      className={`cursor-pointer border-t border-stone-100 first:border-t-0 ${headerRowIndex === idx ? 'bg-teal-50' : 'hover:bg-stone-50'}`}
                    >
                      <td className="w-8 px-2 py-1.5 text-stone-400">
                        <input type="radio" checked={headerRowIndex === idx} onChange={() => applyHeaderRow(rawRows, idx)} />
                      </td>
                      <td className="px-2 py-1.5 font-mono text-stone-700">
                        {(row || []).filter((c) => String(c ?? '').trim() !== '').slice(0, 8).join(' | ') || <span className="italic text-stone-300">(dòng trống)</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">Đóng</button>
              <button onClick={confirmHeaderRow} className="rounded-md bg-teal-900 px-4 py-2 text-sm text-white hover:bg-teal-800">
                Dùng dòng này làm tiêu đề
              </button>
            </div>
          </>
        )}

        {step === 'mapping' && (
          <>
            <p className="mt-2 text-sm text-stone-500">
              Xác nhận mỗi cột trong file của bạn tương ứng với trường nào. Hệ thống đã tự đoán sẵn — bạn chỉnh lại nếu cần.
            </p>
            {schema.fields.some((f) => f.name === 'tenGoiThau') && (
              <p className="mt-1 text-xs text-teal-700">
                Cột ứng với "Tên gói thầu" sẽ được tự động khớp với gói thầu đã có trong dự án (theo đúng tên), hoặc tự tạo gói thầu mới nếu chưa có — mã gói thầu vẫn do hệ thống tự cấp.
              </p>
            )}
            <div className="mt-3 max-h-72 overflow-y-auto rounded-md border border-stone-200">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-stone-50 text-stone-500">
                  <tr><th className="px-2 py-1.5 text-left">Cột trong file</th><th className="px-2 py-1.5 text-left">Tương ứng với</th></tr>
                </thead>
                <tbody>
                  {headerRow.map((h) => (
                    <tr key={h} className="border-t border-stone-100">
                      <td className="px-2 py-1.5 font-mono">{h}</td>
                      <td className="px-2 py-1.5">
                        <select
                          value={mapping[h] || '__ignore__'}
                          onChange={(e) => setMapping((prev) => ({ ...prev, [h]: e.target.value }))}
                          className="w-full rounded border border-stone-300 px-2 py-1 text-xs"
                        >
                          {FIELD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(!mappedProjectCol || !mappedRequired) && (
              <p className="mt-2 text-xs text-rose-600">
                Cần ánh xạ đủ cột "Dự án"{!mappedRequired && ' và các trường bắt buộc'} trước khi tiếp tục.
              </p>
            )}

            <label className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
              <input type="checkbox" checked={rememberTemplate} onChange={(e) => setRememberTemplate(e.target.checked)} />
              Ghi nhớ cách ánh xạ này làm mẫu chuẩn cho các lần nhập sau
            </label>

            <div className="mt-4 flex justify-between gap-2">
              <button onClick={() => setStep('chooseHeader')} className="text-sm text-stone-500 hover:underline">
                ← Đổi dòng tiêu đề
              </button>
              <div className="flex gap-2">
                <button onClick={onClose} className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">Đóng</button>
                <button
                  onClick={buildPreview}
                  disabled={!mappedProjectCol || !mappedRequired}
                  className="rounded-md bg-teal-900 px-4 py-2 text-sm text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  Xem trước dữ liệu
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'preview' && (
          <>
            <div className="mt-4 max-h-64 overflow-y-auto rounded-md border border-stone-200">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-stone-50 text-stone-500">
                  <tr><th className="px-2 py-1.5 text-left">Dự án</th><th className="px-2 py-1.5 text-left">Tiêu đề</th><th className="px-2 py-1.5 text-left">Trạng thái</th></tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => {
                    const res = results?.[i];
                    const title = r.tenGoiThau || r.soHopDong || r.maGoiThau || '(không có tiêu đề)';
                    return (
                      <tr key={i} className="border-t border-stone-100">
                        <td className="px-2 py-1.5">{r.__projectName || '—'}</td>
                        <td className="px-2 py-1.5">{title}</td>
                        <td className="px-2 py-1.5">
                          {res ? (
                            res.ok ? <span className="flex items-center gap-1 text-teal-700"><CheckCircle2 className="h-3.5 w-3.5" /> Đã nhập</span>
                              : <span className="flex items-center gap-1 text-rose-600"><XCircle className="h-3.5 w-3.5" /> {res.error}</span>
                          ) : r.__error ? (
                            <span className="flex items-center gap-1 text-rose-600"><XCircle className="h-3.5 w-3.5" /> {r.__error}</span>
                          ) : (
                            <span className="text-stone-400">Sẵn sàng</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setStep('mapping')} className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">Sửa ánh xạ cột</button>
              <button
                onClick={handleSubmit}
                disabled={submitting || validCount === 0}
                className="flex items-center gap-1.5 rounded-md bg-teal-900 px-4 py-2 text-sm text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Nhập {validCount} hồ sơ hợp lệ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form view                                                            */
/* ------------------------------------------------------------------ */

function FormView({ schema, formData, errors, editing, saving, projects, packages, onCreatePackage, onChange, onSubmit, onCancel }) {
  return (
    <div className="w-full px-8 py-8">
      <button onClick={onCancel} className="mb-4 flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ChevronLeft className="h-4 w-4" /> Quay lại
      </button>

      <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">
        {editing ? `Chỉnh sửa — ${schema.label}` : `Tạo mới — ${schema.label}`}
      </div>

      <form onSubmit={onSubmit} className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
        <div className="grid grid-cols-3 gap-x-4 gap-y-4">
          <div className="col-span-3">
            <label className="mb-1 block text-xs font-medium text-stone-600">
              Dự án<span className="text-rose-600"> *</span>
            </label>
            <ProjectSelect projects={projects} value={formData.duAnId} onChange={(v) => onChange('duAnId', v)} error={errors.duAnId} />
          </div>

          <div className="col-span-3">
            <label className="mb-1 block text-xs font-medium text-stone-600">
              Gói thầu<span className="text-rose-600"> *</span>
            </label>
            <PackageSelectField
              packages={packages}
              disabled={!formData.duAnId}
              value={formData.goiThauId}
              error={errors.goiThauId}
              onChange={(pkg) => {
                onChange('goiThauId', pkg.id);
                onChange('maGoiThau', pkg.maGoiThau);
                onChange('tenGoiThau', pkg.tenGoiThau);
              }}
              onCreatePackage={onCreatePackage}
            />
          </div>

          {schema.fields.filter((f) => f.name !== 'tenGoiThau' && f.name !== 'maGoiThau').map((f) => (
            <div key={f.name} className={f.wide || f.type === 'items' || f.type === 'table' ? 'col-span-3' : 'col-span-1'}>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                {f.label}{f.required && <span className="text-rose-600"> *</span>}
              </label>
              {f.type === 'items' ? (
                <ItemsEditor rows={formData[f.name]} onChange={(rows) => onChange(f.name, rows)} />
              ) : f.type === 'table' ? (
                <>
                  <TableFieldEditor columns={f.options} rows={formData[f.name]} onChange={(rows) => onChange(f.name, rows)} />
                  {errors[f.name] && <p className="mt-1 text-xs text-rose-600">Vui lòng điền đủ các cột bắt buộc (đánh dấu *) ở những dòng đã có dữ liệu.</p>}
                </>
              ) : (
                <Field field={f} value={formData[f.name] ?? ''} onChange={(v) => onChange(f.name, v)} error={errors[f.name]} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-stone-200 pt-5">
          <button type="button" onClick={onCancel} className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">
            Hủy
          </button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-1.5 rounded-md bg-teal-900 px-4 py-2 text-sm text-white hover:bg-teal-800 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Lưu hồ sơ
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Chọn Gói thầu (mã/tên tự điền theo gói đã chọn) ---------------- */

function PackageSelectField({ packages, disabled, value, error, onChange, onCreatePackage }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleQuickCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const pkg = await onCreatePackage(newName.trim());
    setCreating(false);
    if (pkg) {
      onChange(pkg);
      setShowAdd(false);
      setNewName('');
    }
  }

  if (showAdd) {
    return (
      <div className="flex gap-2">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Tên gói thầu mới"
          className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm" autoFocus />
        <button type="button" onClick={handleQuickCreate} disabled={creating}
          className="rounded-md bg-teal-900 px-3 py-2 text-sm text-white hover:bg-teal-800 disabled:opacity-60">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tạo'}
        </button>
        <button type="button" onClick={() => setShowAdd(false)} className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50">
          Hủy
        </button>
      </div>
    );
  }

  return (
    <select
      disabled={disabled}
      value={value || ''}
      onChange={(e) => {
        if (e.target.value === '__new__') { setShowAdd(true); return; }
        const pkg = packages.find((p) => p.id === e.target.value);
        if (pkg) onChange(pkg);
      }}
      className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-700/40 disabled:bg-stone-100 ${error ? 'border-rose-400' : 'border-stone-300'}`}
    >
      <option value="">{disabled ? '— Chọn dự án trước —' : '— Chọn gói thầu —'}</option>
      {packages.map((p) => <option key={p.id} value={p.id}>{p.maGoiThau} — {p.tenGoiThau}</option>)}
      {!disabled && <option value="__new__">+ Thêm gói thầu mới</option>}
    </select>
  );
}

/* ------------------------------------------------------------------ */
/* Detail / print view                                                 */
/* ------------------------------------------------------------------ */

function DetailView({ schema, record, project, canEdit, canDelete, canLock, customLayout, hasDocxTemplate, onExportDocx, onAssign, onBack, onEdit, onDelete, onToggleLock, confirmingDelete }) {
  const hangMuc = record.hangMuc;
  const dateStr = formatDateVN(record[schema.dateField]);
  const layoutElements = Array.isArray(customLayout) ? customLayout : (customLayout?.elements || []);
  const layoutOrientation = Array.isArray(customLayout) ? 'portrait' : (customLayout?.orientation || 'portrait');
  const hasCustomLayout = layoutElements.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
          <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
        </button>
        <div className="flex items-center gap-2">
          {record.locked && (
            <span className="flex items-center gap-1 rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-500">
              <Lock className="h-3 w-3" /> Đã khóa
            </span>
          )}
          {canLock && (
            <button onClick={onToggleLock}
              className="flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50">
              {record.locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {record.locked ? 'Mở khóa' : 'Khóa'}
            </button>
          )}
          {canEdit && (
            <button onClick={onEdit} className="flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50">
              <Pencil className="h-3.5 w-3.5" /> Sửa
            </button>
          )}
          {canEdit && (
            <button onClick={onAssign} className="flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50">
              <Send className="h-3.5 w-3.5" /> Giao việc
            </button>
          )}
          {canDelete && (
            <button onClick={onDelete}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${confirmingDelete ? 'border-rose-400 text-rose-700' : 'border-stone-300 text-stone-700 hover:bg-stone-50'}`}>
              <Trash2 className="h-3.5 w-3.5" /> {confirmingDelete ? 'Xác nhận xóa' : 'Xóa'}
            </button>
          )}
          {hasDocxTemplate && (
            <button onClick={onExportDocx} className="flex items-center gap-1.5 rounded-md border border-teal-800 px-3 py-1.5 text-sm text-teal-900 hover:bg-teal-50">
              <FileType2 className="h-3.5 w-3.5" /> Xuất Word
            </button>
          )}
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-md bg-teal-900 px-3 py-1.5 text-sm text-white hover:bg-teal-800">
            <Printer className="h-3.5 w-3.5" /> In / Xuất PDF
          </button>
        </div>
      </div>

      {!canEdit && !canDelete && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-stone-100 px-3 py-2 text-xs text-stone-500 print:hidden">
          <EyeOff className="h-3.5 w-3.5" /> Bạn chỉ có quyền xem hồ sơ này.
        </div>
      )}

      {hasCustomLayout ? (
        <CustomPrintOutput schema={schema} record={record} project={project} elements={layoutElements} orientation={layoutOrientation} />
      ) : (
      <div className="rounded-lg border border-stone-200 bg-white p-10 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <div className="text-center">
          <div className="text-sm font-semibold uppercase tracking-wide text-stone-800">Cộng hòa Xã hội Chủ nghĩa Việt Nam</div>
          <div className="text-sm text-stone-700">Độc lập – Tự do – Hạnh phúc</div>
          <div className="mx-auto mt-1 h-px w-16 bg-stone-400" />
        </div>

        <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="mt-8 text-center text-xl font-semibold uppercase text-teal-950">
          {schema.docTitle}
        </div>
        {record.tenGoiThau && <div className="mt-1 text-center text-sm italic text-stone-500">{record.tenGoiThau}</div>}
        {project && <div className="mt-1 text-center text-xs text-stone-400">Dự án: {project.ten}</div>}

        <div className="mt-8 space-y-3">
          {schema.fields.filter((f) => f.type !== 'textarea' && f.type !== 'items' && f.type !== 'table' && f.name !== 'tenGoiThau').map((f) => (
            <div key={f.name} className="flex gap-3 text-sm">
              <div className="w-56 shrink-0 text-stone-500">{f.label}</div>
              <div className="flex-1 text-stone-800">
                {f.type === 'number' ? formatVND(record[f.name]) : f.type === 'date' ? formatDateVN(record[f.name]) : (record[f.name] || '—')}
              </div>
            </div>
          ))}
        </div>

        {hangMuc && hangMuc.length > 0 && (
          <div className="mt-6">
            <div className="mb-2 text-sm font-medium text-stone-600">Hạng mục hàng hóa / dịch vụ</div>
            <table className="w-full border border-stone-300 text-sm">
              <thead className="bg-stone-100">
                <tr>
                  <th className="border border-stone-300 px-2 py-1.5 text-left">Tên hàng hóa / dịch vụ</th>
                  <th className="border border-stone-300 px-2 py-1.5 text-left">Đơn vị</th>
                  <th className="border border-stone-300 px-2 py-1.5 text-right">Số lượng</th>
                  <th className="border border-stone-300 px-2 py-1.5 text-right">Đơn giá</th>
                  <th className="border border-stone-300 px-2 py-1.5 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {hangMuc.map((row) => (
                  <tr key={row.id}>
                    <td className="border border-stone-300 px-2 py-1.5">{row.tenHangHoa}</td>
                    <td className="border border-stone-300 px-2 py-1.5">{row.donViTinh}</td>
                    <td className="border border-stone-300 px-2 py-1.5 text-right">{row.soLuong}</td>
                    <td className="border border-stone-300 px-2 py-1.5 text-right">{formatVND(row.donGia)}</td>
                    <td className="border border-stone-300 px-2 py-1.5 text-right">{formatVND(lineItemTotal(row))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-stone-50 font-medium">
                  <td colSpan={4} className="border border-stone-300 px-2 py-1.5 text-right">Tổng cộng</td>
                  <td className="border border-stone-300 px-2 py-1.5 text-right text-teal-900">
                    {formatVND(hangMuc.reduce((s, r) => s + lineItemTotal(r), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {schema.fields.filter((f) => f.type === 'table').map((f) => {
          const rows = record[f.name];
          if (!rows || rows.length === 0) return null;
          return (
            <div key={f.name} className="mt-6">
              <div className="mb-2 text-sm font-medium text-stone-600">{f.label}</div>
              <table className="w-full border border-stone-300 text-sm">
                <thead className="bg-stone-100">
                  <tr>
                    {(f.options || []).map((c) => <th key={c.key} className="border border-stone-300 px-2 py-1.5 text-left">{c.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {(f.options || []).map((c) => (
                        <td key={c.key} className="border border-stone-300 px-2 py-1.5">
                          {c.type === 'number' ? formatVND(row[c.key]) : c.type === 'date' ? formatDateVN(row[c.key]) : (row[c.key] || '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {schema.fields.filter((f) => f.type === 'textarea').map((f) => (
          record[f.name] ? (
            <div key={f.name} className="mt-6">
              <div className="mb-1 text-sm font-medium text-stone-600">{f.label}</div>
              <div className="whitespace-pre-wrap rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-relaxed text-stone-700 print:border-0 print:bg-transparent print:px-0">
                {record[f.name]}
              </div>
            </div>
          ) : null
        ))}

        <div className="mt-14 flex justify-between text-center text-sm">
          <div className="w-1/2">
            <div className="text-stone-500">{schema.signLeft}</div>
            <div className="text-xs italic text-stone-400">(Ký, ghi rõ họ tên)</div>
          </div>
          <div className="w-1/2">
            <div className="text-stone-500">
              {dateStr ? `..., ngày ${dateStr.split('/')[0]} tháng ${dateStr.split('/')[1]} năm ${dateStr.split('/')[2]}` : '..., ngày ... tháng ... năm ...'}
            </div>
            <div className="mt-6 text-stone-500">{schema.signRight}</div>
            <div className="text-xs italic text-stone-400">(Ký, ghi rõ họ tên)</div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

/* ---------------- Hiển thị bản in theo bố cục tùy chỉnh (kéo-thả) ---------------- */

function CustomPrintOutput({ schema, record, project, elements, orientation }) {
  const isLandscape = orientation === 'landscape';
  const PAGE_W = isLandscape ? 1123 : 794; // A4 @ ~96dpi
  const PAGE_H = isLandscape ? 794 : 1123;

  function valueFor(fieldKey) {
    if (fieldKey === '__project__') return project ? project.ten : '—';
    const f = schema.fields.find((x) => x.name === fieldKey);
    if (!f) return record[fieldKey] ?? '';
    if (f.type === 'number') return formatVND(record[fieldKey]);
    if (f.type === 'date') return formatDateVN(record[fieldKey]);
    return record[fieldKey] ?? '';
  }

  return (
    <>
      <style>{`@page { size: A4 ${orientation || 'portrait'}; margin: 1.4cm; }`}</style>
      <div
        className="relative mx-auto bg-white shadow-sm print:shadow-none"
        style={{ width: PAGE_W, minHeight: PAGE_H }}
      >
        {elements.map((el) => (
        <div
          key={el.id}
          style={{
            position: 'absolute',
            left: el.x, top: el.y, width: el.w,
            fontSize: el.fontSize || 13,
            fontWeight: el.bold ? 700 : 400,
            whiteSpace: 'pre-wrap',
            color: '#292524',
          }}
        >
          {el.type === 'text' ? el.label : (
            <>
              {el.showLabel !== false && <span className="text-stone-500">{el.label}: </span>}
              <span>{String(valueFor(el.fieldKey) || '—')}</span>
            </>
          )}
        </div>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Audit log (admin only)                                               */
/* ------------------------------------------------------------------ */

function AuditLog({ entries }) {
  const [search, setSearch] = useState('');
  const filtered = entries.filter((e) => !search || (e.summary + ' ' + e.actor).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">Nhật ký hoạt động</div>
      <p className="mt-1 text-sm text-stone-500">Lưu 300 hoạt động gần nhất trên toàn hệ thống.</p>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo người thực hiện hoặc nội dung…"
          className="w-full rounded-md border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/40" />
      </div>

      <div className="mt-4 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-14 text-stone-400">
            <History className="h-6 w-6" />
            <span className="text-sm">Chưa có hoạt động nào phù hợp.</span>
          </div>
        )}
        {filtered.map((e) => (
          <div key={e.id} className="px-4 py-3">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>{new Date(e.time).toLocaleString('vi-VN')}</span>
              <span className="font-medium text-teal-800">{e.actor}</span>
            </div>
            <div className="mt-1 text-sm text-stone-700">{e.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Trang "Dự án" — Loại dự án + Dự án (không còn quản lý thành viên ở đây) */
/* ------------------------------------------------------------------ */

function ProjectsView({
  projects, projectTypes, projectSchema, goiThauSchema, projectSteps, goiThauList,
  onCreateProject, onDeleteProject, onCreateProjectType, onDeleteProjectType,
  onSaveProjectSteps, onToggleStepCompleted, onCreateGoiThau, onDeleteGoiThau, showToast,
}) {
  const [newTypeName, setNewTypeName] = useState('');
  const [confirmDeleteType, setConfirmDeleteType] = useState(null);

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectType, setNewProjectType] = useState('');
  const [newProjectData, setNewProjectData] = useState({});
  const [selectedSteps, setSelectedSteps] = useState([]); // [docType] theo đúng thứ tự
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(null);
  const [editingStepsFor, setEditingStepsFor] = useState(null); // projectId đang sửa cấu hình bước
  const [managingPackagesFor, setManagingPackagesFor] = useState(null); // projectId đang quản lý danh sách gói thầu

  async function handleCreateType(e) {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    if (projectTypes.some((t) => t.ten.toLowerCase() === newTypeName.trim().toLowerCase())) {
      showToast('Loại dự án này đã tồn tại.', 'error');
      return;
    }
    await onCreateProjectType(newTypeName.trim());
    setNewTypeName('');
  }
  function countUsing(typeId) { return projects.filter((p) => p.typeId === typeId).length; }
  async function handleDeleteType(typeId) {
    if (confirmDeleteType !== typeId) {
      setConfirmDeleteType(typeId);
      setTimeout(() => setConfirmDeleteType((c) => (c === typeId ? null : c)), 3000);
      return;
    }
    await onDeleteProjectType(typeId);
    setConfirmDeleteType(null);
  }

  function toggleStepSelection(docType) {
    setSelectedSteps((prev) => (prev.includes(docType) ? prev.filter((d) => d !== docType) : [...prev, docType]));
  }
  function moveStep(docType, direction) {
    setSelectedSteps((prev) => {
      const idx = prev.indexOf(docType);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const stepsList = selectedSteps.map((docType) => ({ docType }));
    await onCreateProject(newProjectName.trim(), newProjectDesc.trim(), newProjectType || null, newProjectData, stepsList);
    setNewProjectName(''); setNewProjectDesc(''); setNewProjectType(''); setNewProjectData({}); setSelectedSteps([]);
  }
  async function handleDeleteProject(p) {
    if (confirmDeleteProject !== p.id) {
      setConfirmDeleteProject(p.id);
      setTimeout(() => setConfirmDeleteProject((c) => (c === p.id ? null : c)), 3000);
      return;
    }
    await onDeleteProject(p);
    setConfirmDeleteProject(null);
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">Dự án</div>
      <p className="mt-1 text-sm text-stone-500">
        Khai báo loại dự án và tạo dự án tại đây. Việc chọn ai được làm gì trong từng dự án thực hiện ở mục "Người dùng".
      </p>

      <div className="mt-6 rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <Tags className="h-4 w-4 text-teal-800" /> Loại dự án
        </div>
        <div className="mt-3 divide-y divide-stone-100">
          {projectTypes.length === 0 && <div className="py-2 text-xs text-stone-400">Chưa có loại dự án nào.</div>}
          {projectTypes.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2">
              <div className="text-sm text-stone-700">{t.ten} <span className="text-xs text-stone-400">({countUsing(t.id)} dự án)</span></div>
              <button onClick={() => handleDeleteType(t.id)}
                className={`rounded p-1 hover:bg-rose-50 ${confirmDeleteType === t.id ? 'text-rose-700' : 'text-stone-400 hover:text-rose-700'}`}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={handleCreateType} className="mt-3 flex gap-2 border-t border-stone-100 pt-3">
          <input value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} placeholder="Tên loại dự án mới, ví dụ: Xây dựng"
            className="flex-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm" />
          <button type="submit" className="flex items-center gap-1 rounded-md bg-teal-900 px-3 py-1.5 text-sm text-white hover:bg-teal-800">
            <Plus className="h-3.5 w-3.5" /> Thêm
          </button>
        </form>
      </div>

      <div className="mt-6 rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <FolderKanban className="h-4 w-4 text-teal-800" /> Tạo dự án mới
        </div>
        <form onSubmit={handleCreateProject} className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Tên dự án *"
              className="col-span-2 rounded-md border border-stone-300 px-3 py-1.5 text-sm sm:col-span-1" />
            <div className="flex items-center rounded-md border border-dashed border-stone-300 bg-stone-50 px-3 py-1.5 text-sm text-stone-400">
              Mã dự án: tự động cấp (DA001, DA002...)
            </div>
            <select value={newProjectType} onChange={(e) => setNewProjectType(e.target.value)}
              className="col-span-2 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm sm:col-span-1">
              <option value="">— Chọn loại dự án (tùy chọn) —</option>
              {projectTypes.map((t) => <option key={t.id} value={t.id}>{t.ten}</option>)}
            </select>
            <input value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} placeholder="Mô tả ngắn"
              className="col-span-2 rounded-md border border-stone-300 px-3 py-1.5 text-sm" />
          </div>

          {projectSchema.fields.length > 0 && (
            <div className="grid grid-cols-2 gap-3 border-t border-stone-100 pt-3">
              <div className="col-span-2 text-xs font-medium uppercase tracking-wide text-stone-400">Thông tin chung của dự án</div>
              {projectSchema.fields.map((f) => (
                <div key={f.name} className={f.wide ? 'col-span-2' : 'col-span-1'}>
                  <label className="mb-1 block text-xs font-medium text-stone-600">
                    {f.label}{f.required && <span className="text-rose-600"> *</span>}
                  </label>
                  {f.type === 'table' ? (
                    <TableFieldEditor columns={f.options} rows={newProjectData[f.name] || []} onChange={(rows) => setNewProjectData((prev) => ({ ...prev, [f.name]: rows }))} />
                  ) : (
                    <Field field={f} value={newProjectData[f.name] ?? ''} onChange={(v) => setNewProjectData((prev) => ({ ...prev, [f.name]: v }))} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-stone-100 pt-3">
            <div className="text-xs font-medium uppercase tracking-wide text-stone-400">Biểu mẫu cần thiết &amp; thứ tự thực hiện</div>
            <p className="mt-1 text-xs text-stone-400">Chọn các loại hồ sơ cần cho dự án này. Sẽ khóa loại sau cho đến khi loại trước được đánh dấu hoàn thành.</p>
            <div className="mt-2 space-y-1">
              {TYPE_ORDER.map((docType) => (
                <label key={docType} className="flex items-center gap-2 rounded-md border border-stone-200 px-2 py-1.5 text-sm">
                  <input type="checkbox" checked={selectedSteps.includes(docType)} onChange={() => toggleStepSelection(docType)} />
                  {DOC_TYPES[docType].label}
                </label>
              ))}
            </div>
            {selectedSteps.length > 0 && (
              <div className="mt-2 rounded-md bg-stone-50 p-2">
                <div className="text-xs text-stone-500">Thứ tự thực hiện:</div>
                {selectedSteps.map((docType, idx) => (
                  <div key={docType} className="mt-1 flex items-center justify-between rounded bg-white px-2 py-1 text-sm">
                    <span>{idx + 1}. {DOC_TYPES[docType].label}</span>
                    <div className="flex gap-1">
                      <button type="button" disabled={idx === 0} onClick={() => moveStep(docType, 'up')} className="rounded p-1 text-stone-400 hover:bg-stone-100 disabled:opacity-30">▲</button>
                      <button type="button" disabled={idx === selectedSteps.length - 1} onClick={() => moveStep(docType, 'down')} className="rounded p-1 text-stone-400 hover:bg-stone-100 disabled:opacity-30">▼</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="flex w-full items-center justify-center gap-1.5 rounded-md bg-teal-900 py-2 text-sm text-white hover:bg-teal-800 sm:w-auto sm:px-6">
            <Plus className="h-4 w-4" /> Tạo dự án
          </button>
        </form>
      </div>

      <div className="mt-6 space-y-3">
        {projects.length === 0 && (
          <div className="rounded-lg border border-dashed border-stone-300 py-10 text-center text-sm text-stone-400">Chưa có dự án nào.</div>
        )}
        {projects.map((p) => (
          <div key={p.id} className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-teal-950">{p.ten} {p.maDuAn && <span className="font-normal text-stone-400">({p.maDuAn})</span>}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-stone-500">
                  {p.typeName && <span className="rounded bg-stone-100 px-1.5 py-0.5">{p.typeName}</span>}
                  {p.moTa}
                </div>
              </div>
              <button onClick={() => handleDeleteProject(p)}
                className={`rounded p-1.5 hover:bg-rose-50 ${confirmDeleteProject === p.id ? 'text-rose-700' : 'text-stone-400 hover:text-rose-700'}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {projectSchema.fields.length > 0 && Object.keys(p.data || {}).some((k) => p.data[k]) && (
              <div className="mt-2 space-y-0.5 border-t border-stone-100 pt-2 text-xs text-stone-500">
                {projectSchema.fields.filter((f) => f.type !== 'table' && p.data?.[f.name]).map((f) => (
                  <div key={f.name}>{f.label}: <span className="text-stone-700">{p.data[f.name]}</span></div>
                ))}
              </div>
            )}

            <div className="mt-2 border-t border-stone-100 pt-2">
              {editingStepsFor === p.id ? (
                <ProjectStepsEditor
                  initialSteps={(projectSteps[p.id] || []).map((s) => s.docType)}
                  onCancel={() => setEditingStepsFor(null)}
                  onSave={async (steps) => { await onSaveProjectSteps(p.id, steps.map((docType) => ({ docType }))); setEditingStepsFor(null); }}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {(projectSteps[p.id] || []).length === 0 ? (
                      <span className="text-stone-400">Chưa cấu hình bước nào (không khóa thứ tự).</span>
                    ) : (
                      (projectSteps[p.id] || []).map((s, idx) => (
                        <span key={s.docType} className={`flex items-center gap-1 rounded px-2 py-0.5 ${s.completed ? 'bg-teal-50 text-teal-700' : 'bg-stone-100 text-stone-500'}`}>
                          {idx + 1}. {DOC_TYPES[s.docType].short}
                          {s.completed ? <CheckCircle2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        </span>
                      ))
                    )}
                  </div>
                  <button onClick={() => setEditingStepsFor(p.id)} className="flex items-center gap-1 text-xs text-teal-800 hover:underline">
                    <Settings2 className="h-3 w-3" /> Sửa các bước
                  </button>
                </div>
              )}
            </div>

            <div className="mt-2 border-t border-stone-100 pt-2">
              {managingPackagesFor === p.id ? (
                <GoiThauManager
                  project={p}
                  goiThauSchema={goiThauSchema}
                  packages={goiThauList[p.id] || []}
                  onCreate={(ten, data) => onCreateGoiThau(p.id, ten, data)}
                  onDelete={(id) => onDeleteGoiThau(id, p.id)}
                  onClose={() => setManagingPackagesFor(null)}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-stone-500">
                    {(goiThauList[p.id] || []).length === 0 ? 'Chưa có gói thầu nào.' : `${(goiThauList[p.id] || []).length} gói thầu: ${(goiThauList[p.id] || []).map((g) => g.maGoiThau).join(', ')}`}
                  </div>
                  <button onClick={() => setManagingPackagesFor(p.id)} className="flex items-center gap-1 text-xs text-teal-800 hover:underline">
                    <ClipboardList className="h-3 w-3" /> Quản lý gói thầu
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Quản lý danh sách "Gói thầu" của 1 dự án (mã tự động sinh) ---------------- */

function GoiThauManager({ project, goiThauSchema, packages, onCreate, onDelete, onClose }) {
  const [tenGoiThau, setTenGoiThau] = useState('');
  const [extraData, setExtraData] = useState({});
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function handleCreate(e) {
    e.preventDefault();
    if (!tenGoiThau.trim()) return;
    setCreating(true);
    await onCreate(tenGoiThau.trim(), extraData);
    setCreating(false);
    setTenGoiThau(''); setExtraData({});
  }
  async function handleDelete(id) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete((c) => (c === id ? null : c)), 3000);
      return;
    }
    await onDelete(id);
    setConfirmDelete(null);
  }

  return (
    <div className="rounded-md bg-stone-50 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-stone-700">Danh sách gói thầu — {project.ten}</div>
        <button onClick={onClose} className="text-xs text-stone-500 hover:underline">Đóng</button>
      </div>

      <div className="mt-2 divide-y divide-stone-200 rounded-md border border-stone-200 bg-white">
        {packages.length === 0 && <div className="px-3 py-2 text-xs text-stone-400">Chưa có gói thầu nào.</div>}
        {packages.map((g) => (
          <div key={g.id} className="flex items-center justify-between px-3 py-2 text-sm">
            <div>
              <span className="font-mono text-xs text-teal-800">{g.maGoiThau}</span>
              <span className="ml-2 text-stone-700">{g.tenGoiThau}</span>
            </div>
            <button onClick={() => handleDelete(g.id)}
              className={`rounded p-1 hover:bg-rose-50 ${confirmDelete === g.id ? 'text-rose-700' : 'text-stone-400 hover:text-rose-700'}`}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} className="mt-3 space-y-2">
        <input value={tenGoiThau} onChange={(e) => setTenGoiThau(e.target.value)} placeholder="Tên gói thầu mới *"
          className="w-full rounded-md border border-stone-300 px-3 py-1.5 text-sm" />
        {goiThauSchema.fields.map((f) => (
          <div key={f.name}>
            <label className="mb-1 block text-xs text-stone-500">{f.label}</label>
            {f.type === 'table' ? (
              <TableFieldEditor columns={f.options} rows={extraData[f.name] || []} onChange={(rows) => setExtraData((prev) => ({ ...prev, [f.name]: rows }))} />
            ) : (
              <Field field={f} value={extraData[f.name] ?? ''} onChange={(v) => setExtraData((prev) => ({ ...prev, [f.name]: v }))} />
            )}
          </div>
        ))}
        <p className="text-xs text-stone-400">Mã gói thầu sẽ tự động cấp (ví dụ {project.maDuAn}GT01).</p>
        <button type="submit" disabled={creating}
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-teal-900 py-1.5 text-sm text-white hover:bg-teal-800 disabled:opacity-60">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Thêm gói thầu
        </button>
      </form>
    </div>
  );
}
function ProjectStepsEditor({ initialSteps, onCancel, onSave }) {
  const [steps, setSteps] = useState(initialSteps);

  function toggle(docType) {
    setSteps((prev) => (prev.includes(docType) ? prev.filter((d) => d !== docType) : [...prev, docType]));
  }
  function move(docType, direction) {
    setSteps((prev) => {
      const idx = prev.indexOf(docType);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }

  return (
    <div className="rounded-md bg-stone-50 p-3">
      <div className="space-y-1">
        {TYPE_ORDER.map((docType) => (
          <label key={docType} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={steps.includes(docType)} onChange={() => toggle(docType)} />
            {DOC_TYPES[docType].label}
          </label>
        ))}
      </div>
      {steps.length > 0 && (
        <div className="mt-2 space-y-1">
          {steps.map((docType, idx) => (
            <div key={docType} className="flex items-center justify-between rounded bg-white px-2 py-1 text-sm">
              <span>{idx + 1}. {DOC_TYPES[docType].label}</span>
              <div className="flex gap-1">
                <button type="button" disabled={idx === 0} onClick={() => move(docType, 'up')} className="rounded p-1 text-stone-400 hover:bg-stone-100 disabled:opacity-30">▲</button>
                <button type="button" disabled={idx === steps.length - 1} onClick={() => move(docType, 'down')} className="rounded p-1 text-stone-400 hover:bg-stone-100 disabled:opacity-30">▼</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-md border border-stone-300 px-3 py-1 text-xs text-stone-600 hover:bg-white">Hủy</button>
        <button onClick={() => onSave(steps)} className="rounded-md bg-teal-900 px-3 py-1 text-xs text-white hover:bg-teal-800">Lưu</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Trang "Người dùng" — danh bạ + phân quyền chi tiết theo dự án × loại hồ sơ */
/* ------------------------------------------------------------------ */

function UsersView({
  profiles, projects, permissions, myId, nameOf,
  onCreateUser, onBulkCreateUsers, onRemoveUser, onToggleAdmin,
  onSetPermission, onRemoveUserFromProject, showToast,
}) {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [confirmRemoveUser, setConfirmRemoveUser] = useState(null);

  const [bulkText, setBulkText] = useState('');
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  const fileInputRef = useRef(null);

  const [permProjectId, setPermProjectId] = useState('');
  const [permUserId, setPermUserId] = useState('');

  function normalizeRows(rawRows) {
    return rawRows.map((r) => {
      const full_name = String(r.full_name || '').trim();
      const email = String(r.email || '').trim();
      const password = String(r.password || '').trim();
      let error = null;
      if (!full_name || !email || !password) error = 'Thiếu cột (cần đủ Họ tên, Email, Mật khẩu)';
      else if (password.length < 6) error = 'Mật khẩu phải từ 6 ký tự';
      else if (!email.includes('@')) error = 'Email không hợp lệ';
      return { full_name, email, password, error };
    });
  }
  function parseBulkText() {
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    const rawRows = lines.map((line) => {
      const [full_name, email, password] = line.split(',').map((p) => p.trim());
      return { full_name, email, password };
    });
    setBulkPreview(normalizeRows(rawRows));
    setBulkResults(null);
  }
  function handleExcelFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const rawRows = json.map((row) => {
          const getVal = (keys) => {
            for (const k of Object.keys(row)) {
              if (keys.some((target) => k.trim().toLowerCase() === target)) return row[k];
            }
            return '';
          };
          return {
            full_name: getVal(['họ tên', 'ho ten', 'full_name', 'tên', 'ten']),
            email: getVal(['email']),
            password: getVal(['mật khẩu', 'mat khau', 'password']),
          };
        });
        setBulkPreview(normalizeRows(rawRows));
        setBulkResults(null);
        setBulkText('');
        showToast(`Đã đọc ${rawRows.length} dòng từ file Excel.`);
      } catch (err) {
        showToast('Không đọc được file Excel: ' + err.message, 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  }
  function downloadUserTemplate() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([['Họ tên', 'Email', 'Mật khẩu'], ['Nguyễn Văn A', 'a.nguyen@congty.com', 'Test123456']]);
    XLSX.utils.book_append_sheet(wb, ws, 'Người dùng');
    XLSX.writeFile(wb, 'mau_nhap_nguoi_dung.xlsx');
  }
  async function submitBulk() {
    const validRows = bulkPreview.filter((r) => !r.error);
    if (validRows.length === 0) return;
    setBulkSubmitting(true);
    const { results } = await onBulkCreateUsers(validRows.map((r) => ({ email: r.email, password: r.password, full_name: r.full_name, is_admin: false })));
    setBulkSubmitting(false);
    setBulkResults(results);
    if (results && results.every((r) => r.success)) { setBulkText(''); setBulkPreview([]); }
  }
  async function handleCreateUser(e) {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || newUserPassword.length < 6) {
      showToast('Vui lòng nhập đủ họ tên, email và mật khẩu (tối thiểu 6 ký tự).', 'error');
      return;
    }
    setCreatingUser(true);
    await onCreateUser(newUserEmail.trim(), newUserPassword, newUserName.trim(), newUserIsAdmin);
    setCreatingUser(false);
    setNewUserName(''); setNewUserEmail(''); setNewUserPassword(''); setNewUserIsAdmin(false);
  }
  async function handleRemoveUser(userId) {
    if (confirmRemoveUser !== userId) {
      setConfirmRemoveUser(userId);
      setTimeout(() => setConfirmRemoveUser((c) => (c === userId ? null : c)), 3000);
      return;
    }
    await onRemoveUser(userId);
    setConfirmRemoveUser(null);
  }

  const permProject = projects.find((p) => p.id === permProjectId);
  const usersWithAccess = permProject
    ? profiles.filter((u) => !u.is_admin && permissions.some((p) => p.projectId === permProject.id && p.userId === u.id && (p.can_view || p.can_add || p.can_edit || p.can_lock || p.can_delete)))
    : [];
  const usersWithoutAccess = permProject ? profiles.filter((u) => !u.is_admin && !usersWithAccess.some((x) => x.id === u.id)) : [];

  function permFor(userId, docType) {
    const row = permissions.find((p) => p.projectId === permProjectId && p.userId === userId && p.docType === docType);
    return { view: !!row?.can_view, add: !!row?.can_add, edit: !!row?.can_edit, lock: !!row?.can_lock, delete: !!row?.can_delete };
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-8 space-y-6">
      <div>
        <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">Người dùng</div>
        <p className="mt-1 text-sm text-stone-500">Tạo tài khoản và phân quyền chi tiết (Thêm / Xem / Sửa / Khóa / Xóa) theo từng dự án và từng loại hồ sơ.</p>
      </div>

      {/* Directory */}
      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="text-sm font-medium text-stone-700">Danh bạ người dùng</div>
        <div className="mt-3 divide-y divide-stone-100">
          {profiles.length === 0 && <div className="py-3 text-xs text-stone-400">Chưa có người dùng nào.</div>}
          {profiles.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm text-stone-700">
                {u.full_name || '(chưa đặt tên)'}
                {u.is_admin && <RoleBadge role="admin" />}
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-stone-500">
                  <input type="checkbox" checked={u.is_admin} onChange={(e) => onToggleAdmin(u.id, e.target.checked)} />
                  Quản trị viên
                </label>
                {u.id !== myId && (
                  <button onClick={() => handleRemoveUser(u.id)}
                    className={`rounded p-1 hover:bg-rose-50 ${confirmRemoveUser === u.id ? 'text-rose-700' : 'text-stone-400 hover:text-rose-700'}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleCreateUser} className="mt-3 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3">
          <div className="col-span-2 text-xs font-medium uppercase tracking-wide text-stone-400">Tạo từng người</div>
          <input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Họ tên"
            className="col-span-2 rounded-md border border-stone-300 px-3 py-1.5 text-sm sm:col-span-1" />
          <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="Email đăng nhập"
            className="rounded-md border border-stone-300 px-3 py-1.5 text-sm" />
          <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Mật khẩu tạm thời (tối thiểu 6 ký tự)"
            className="rounded-md border border-stone-300 px-3 py-1.5 text-sm" />
          <label className="col-span-2 flex items-center gap-1.5 text-xs text-stone-500">
            <input type="checkbox" checked={newUserIsAdmin} onChange={(e) => setNewUserIsAdmin(e.target.checked)} />
            Cấp quyền Quản trị viên
          </label>
          <button type="submit" disabled={creatingUser}
            className="col-span-2 flex items-center justify-center gap-1 rounded-md bg-teal-900 px-3 py-1.5 text-sm text-white hover:bg-teal-800 disabled:opacity-60">
            {creatingUser ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
            Tạo người dùng
          </button>
        </form>

        <div className="mt-5 border-t border-stone-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <Upload className="h-4 w-4 text-teal-800" /> Nhập danh sách nhiều người dùng cùng lúc
            </div>
            <button type="button" onClick={downloadUserTemplate} className="flex items-center gap-1 text-xs text-teal-800 hover:underline">
              <Download className="h-3.5 w-3.5" /> Tải file mẫu Excel
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-md border border-teal-800 px-3 py-1.5 text-sm text-teal-900 hover:bg-teal-50">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Tải lên file Excel (.xlsx)
            </button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleExcelFile} className="hidden" />
            <span className="text-xs text-stone-400">— hoặc dán danh sách bên dưới —</span>
          </div>
          <p className="mt-3 text-xs text-stone-400">Mỗi dòng một người: <span className="font-mono">Họ tên, Email, Mật khẩu</span></p>
          <textarea value={bulkText} onChange={(e) => { setBulkText(e.target.value); setBulkPreview([]); setBulkResults(null); }}
            placeholder={'Nguyễn Văn A, a.nguyen@congty.com, Test123456'}
            className="mt-2 min-h-[80px] w-full rounded-md border border-stone-300 px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal-700/40" />
          <div className="mt-2 flex items-center gap-2">
            <button type="button" onClick={parseBulkText} disabled={!bulkText.trim()}
              className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50">
              Xem trước
            </button>
            {bulkPreview.length > 0 && (
              <button type="button" onClick={submitBulk} disabled={bulkSubmitting || bulkPreview.every((r) => r.error)}
                className="flex items-center gap-1.5 rounded-md bg-teal-900 px-3 py-1.5 text-sm text-white hover:bg-teal-800 disabled:opacity-60">
                {bulkSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Nhập {bulkPreview.filter((r) => !r.error).length} người dùng hợp lệ
              </button>
            )}
          </div>
          {bulkPreview.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-md border border-stone-200">
              <table className="w-full text-xs">
                <thead className="bg-stone-50 text-stone-500"><tr><th className="px-2 py-1.5 text-left">Họ tên</th><th className="px-2 py-1.5 text-left">Email</th><th className="px-2 py-1.5 text-left">Trạng thái</th></tr></thead>
                <tbody>
                  {bulkPreview.map((r, i) => {
                    const res = bulkResults?.find((x) => x.email === r.email);
                    return (
                      <tr key={i} className="border-t border-stone-100">
                        <td className="px-2 py-1.5">{r.full_name || '—'}</td>
                        <td className="px-2 py-1.5">{r.email || '—'}</td>
                        <td className="px-2 py-1.5">
                          {res ? (res.success ? <span className="flex items-center gap-1 text-teal-700"><CheckCircle2 className="h-3.5 w-3.5" /> Đã tạo</span> : <span className="flex items-center gap-1 text-rose-600"><XCircle className="h-3.5 w-3.5" /> {res.error}</span>)
                            : r.error ? <span className="flex items-center gap-1 text-rose-600"><XCircle className="h-3.5 w-3.5" /> {r.error}</span> : <span className="text-stone-400">Sẵn sàng</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Phân quyền */}
      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <Settings2 className="h-4 w-4 text-teal-800" /> Phân quyền theo dự án
        </div>
        <p className="mt-1 text-xs text-stone-400">Chọn dự án, chọn người dùng, rồi tick các quyền tương ứng cho từng loại hồ sơ. Quản trị viên luôn có toàn quyền, không cần thiết lập.</p>

        <div className="mt-3 flex gap-2">
          <select value={permProjectId} onChange={(e) => { setPermProjectId(e.target.value); setPermUserId(''); }}
            className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm">
            <option value="">— Chọn dự án —</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.ten}</option>)}
          </select>
        </div>

        {permProject && (
          <>
            <div className="mt-4">
              <div className="text-xs font-medium uppercase tracking-wide text-stone-400">Danh sách người dùng &amp; quyền trong dự án này</div>
              {usersWithAccess.length === 0 && <div className="mt-2 text-xs text-stone-400">Chưa có ai được cấp quyền.</div>}
              {usersWithAccess.length > 0 && (
                <div className="mt-2 overflow-x-auto rounded-md border border-stone-200">
                  <table className="w-full text-xs">
                    <thead className="bg-stone-50 text-stone-500">
                      <tr>
                        <th className="px-3 py-1.5 text-left">Người dùng</th>
                        {TYPE_ORDER.map((dt) => <th key={dt} className="px-2 py-1.5 text-left">{DOC_TYPES[dt].short}</th>)}
                        <th className="w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersWithAccess.map((u) => (
                        <tr
                          key={u.id}
                          onClick={() => setPermUserId(u.id)}
                          className={`cursor-pointer border-t border-stone-100 ${permUserId === u.id ? 'bg-teal-50' : 'hover:bg-stone-50'}`}
                        >
                          <td className="px-3 py-1.5 font-medium text-stone-700">{u.full_name}</td>
                          {TYPE_ORDER.map((dt) => {
                            const perm = permFor(u.id, dt);
                            const SHORT = { view: 'Xem', add: 'Thêm', edit: 'Sửa', lock: 'Khóa', delete: 'Xóa' };
                            const active = ACTIONS.filter((a) => perm[a]).map((a) => SHORT[a]);
                            return (
                              <td key={dt} className="px-2 py-1.5 text-stone-500">
                                {active.length > 0 ? active.join(', ') : <span className="text-stone-300">—</span>}
                              </td>
                            );
                          })}
                          <td className="px-2 py-1.5 text-right text-teal-700">Sửa</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="border-t border-stone-100 bg-stone-50 px-3 py-1.5 text-[11px] text-stone-400">
                    Bấm vào dòng để chỉnh chi tiết bên dưới.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <select value={permUserId} onChange={(e) => setPermUserId(e.target.value)}
                className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm">
                <option value="">— Thêm người dùng khác vào dự án —</option>
                {usersWithoutAccess.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </div>
          </>
        )}

        {permProject && permUserId && (
          <div className="mt-4 rounded-md border border-stone-200 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-stone-800">{nameOf(permUserId)}</div>
              <button onClick={() => { onRemoveUserFromProject(permProjectId, permUserId); setPermUserId(''); }}
                className="text-xs text-rose-600 hover:underline">Gỡ khỏi dự án</button>
            </div>
            <table className="mt-3 w-full text-xs">
              <thead className="text-stone-500">
                <tr>
                  <th className="px-2 py-1 text-left">Loại hồ sơ</th>
                  {ACTIONS.map((a) => <th key={a} className="px-2 py-1 text-center">{ACTION_LABELS[a]}</th>)}
                </tr>
              </thead>
              <tbody>
                {TYPE_ORDER.map((docType) => {
                  const perm = permFor(permUserId, docType);
                  return (
                    <tr key={docType} className="border-t border-stone-100">
                      <td className="px-2 py-1.5 text-stone-700">{DOC_TYPES[docType].short}</td>
                      {ACTIONS.map((a) => (
                        <td key={a} className="px-2 py-1.5 text-center">
                          <input type="checkbox" checked={perm[a]} onChange={(e) => onSetPermission(permProjectId, permUserId, docType, a, e.target.checked)} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Trang "Tùy chỉnh mẫu" — khai báo trường thông tin + thiết kế bản in */
/* ------------------------------------------------------------------ */

function TemplateEditorView({ getSchema, projectTypes, customFields, hiddenFields, fieldOverrides, printTemplates, docxTemplates, templateFieldMode, onSetTemplateFieldMode, onUploadDocxTemplate, onCreateField, onDeleteField, onReorderField, onUpdateField, onToggleHideField, onSaveFieldOverride, onSavePrintTemplate, showToast }) {
  const [docType, setDocType] = useState('bao_gia');
  const [tab, setTab] = useState('fields'); // fields | print | docx
  const [projectTypeId, setProjectTypeId] = useState(GENERIC_TYPE_ID);
  const isProjectFields = docType === 'project' || docType === 'goi_thau';
  const supportsDocx = !isProjectFields && ['ho_so_yeu_cau', 'bien_ban', 'hop_dong'].includes(docType);
  const currentMode = (templateFieldMode[docType] && templateFieldMode[docType][projectTypeId]) || 'extend';

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">Tùy chỉnh mẫu</div>
      <p className="mt-1 text-sm text-stone-500">Khai báo thêm trường thông tin và thiết kế bố cục bản in cho từng loại hồ sơ. Có thể tạo mẫu riêng theo từng loại dự án.</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select value={docType} onChange={(e) => { setDocType(e.target.value); setTab('fields'); }}
          className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm">
          {TYPE_ORDER.map((k) => <option key={k} value={k}>{DOC_TYPES[k].label}</option>)}
          <option value="project">Dự án (thông tin chung)</option>
          <option value="goi_thau">Gói thầu (thông tin riêng)</option>
        </select>

        {!isProjectFields && (
          <select value={projectTypeId} onChange={(e) => setProjectTypeId(e.target.value)}
            className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm">
            <option value={GENERIC_TYPE_ID}>Áp dụng cho tất cả loại dự án</option>
            {projectTypes.map((t) => <option key={t.id} value={t.id}>Riêng cho: {t.ten}</option>)}
          </select>
        )}

        {!isProjectFields && (
          <div className="flex gap-1 border-b border-stone-200">
            <button onClick={() => setTab('fields')}
              className={`border-b-2 px-3 py-1.5 text-sm ${tab === 'fields' ? 'border-teal-800 font-medium text-teal-900' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
              Trường thông tin
            </button>
            <button onClick={() => setTab('print')}
              className={`border-b-2 px-3 py-1.5 text-sm ${tab === 'print' ? 'border-teal-800 font-medium text-teal-900' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
              Bố cục bản in
            </button>
            {supportsDocx && (
              <button onClick={() => setTab('docx')}
                className={`border-b-2 px-3 py-1.5 text-sm ${tab === 'docx' ? 'border-teal-800 font-medium text-teal-900' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
                File mẫu Word
              </button>
            )}
          </div>
        )}
      </div>

      {!isProjectFields && projectTypeId !== GENERIC_TYPE_ID && (
        <p className="mt-2 text-xs text-amber-700">
          Bạn đang chỉnh mẫu <strong>riêng</strong> cho loại dự án này — chỉ áp dụng cho dự án thuộc loại đó. Dự án không có loại (hoặc loại khác) vẫn dùng mẫu chung.
        </p>
      )}

      {!isProjectFields && tab === 'fields' && projectTypeId !== GENERIC_TYPE_ID && (
        <div className="mt-3 flex items-center gap-3 rounded-md border border-stone-200 bg-white p-3">
          <div className="text-xs font-medium text-stone-600">Cách mẫu riêng này hoạt động:</div>
          <label className="flex items-center gap-1.5 text-xs">
            <input type="radio" checked={currentMode === 'extend'} onChange={() => onSetTemplateFieldMode(docType, projectTypeId, 'extend')} />
            Kế thừa mẫu chung (cộng thêm trường riêng)
          </label>
          <label className="flex items-center gap-1.5 text-xs">
            <input type="radio" checked={currentMode === 'replace'} onChange={() => onSetTemplateFieldMode(docType, projectTypeId, 'replace')} />
            Tự thiết kế lại từ đầu (bỏ hẳn trường có sẵn &amp; mẫu chung)
          </label>
        </div>
      )}

      <div className="mt-5">
        {tab === 'fields' && (
          <FieldsManager
            docType={docType}
            projectTypeId={isProjectFields ? GENERIC_TYPE_ID : projectTypeId}
            mode={isProjectFields ? 'extend' : currentMode}
            builtInFields={isProjectFields || currentMode === 'replace' ? [] : DOC_TYPES[docType].fields}
            customFields={customFields[docType] || []}
            hiddenFieldRows={hiddenFields[docType] || []}
            fieldOverrideRows={fieldOverrides[docType] || []}
            onCreateField={onCreateField}
            onDeleteField={onDeleteField}
            onReorderField={onReorderField}
            onUpdateField={onUpdateField}
            onToggleHideField={onToggleHideField}
            onSaveFieldOverride={onSaveFieldOverride}
            showToast={showToast}
          />
        )}
        {!isProjectFields && tab === 'print' && (
          <PrintDesigner
            key={docType + projectTypeId}
            docType={docType}
            schema={getSchema(docType, projectTypeId)}
            savedLayout={printTemplates[docType]?.[projectTypeId]?.layout || []}
            onSave={(layout) => onSavePrintTemplate(docType, layout, projectTypeId)}
          />
        )}
        {!isProjectFields && tab === 'docx' && supportsDocx && (
          <DocxTemplateManager
            key={docType + projectTypeId}
            docType={docType}
            schema={getSchema(docType, projectTypeId)}
            existing={docxTemplates[docType]?.[projectTypeId]}
            onUpload={(file) => onUploadDocxTemplate(docType, file, projectTypeId)}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- Quản lý mẫu file Word ---------------- */

function DocxTemplateManager({ docType, schema, existing, onUpload }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await onUpload(file);
    setUploading(false);
    e.target.value = '';
  }

  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="text-sm font-medium text-stone-700">File mẫu Word (.docx)</div>
        <p className="mt-1 text-xs text-stone-400">
          Tải lên file Word có sẵn của công ty. Trong file, đặt các thẻ theo đúng "khóa trường" ở cột bên phải,
          ví dụ gõ <span className="font-mono">{'{ten_goi_thau}'}</span> ngay tại vị trí muốn chèn dữ liệu.
        </p>
        {existing && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-teal-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã có mẫu Word cho loại hồ sơ này.
          </div>
        )}
        <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-teal-800 py-2 text-sm text-teal-900 hover:bg-teal-50 disabled:opacity-60">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {existing ? 'Tải lên file khác (thay thế)' : 'Tải lên file .docx'}
        </button>
        <input ref={fileInputRef} type="file" accept=".docx" onChange={handleFile} className="hidden" />
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="text-sm font-medium text-stone-700">Danh sách khóa trường để gõ vào file Word</div>
        <div className="mt-2 max-h-72 overflow-y-auto divide-y divide-stone-100 text-sm">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-stone-600">Tên dự án</span>
            <span className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-700">{'{du_an}'}</span>
          </div>
          {schema.fields.filter((f) => f.type !== 'items' && f.type !== 'table').map((f) => (
            <div key={f.name} className="flex items-center justify-between py-1.5">
              <span className="text-stone-600">{f.label}</span>
              <span className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-700">{`{${f.name}}`}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Quản lý trường thông tin tùy chỉnh ---------------- */

function slugifyKey(text) {
  return (text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30) || 'cot') + '_' + Math.random().toString(36).slice(2, 5);
}

function TableColumnsBuilder({ columns, onChange }) {
  const COL_TYPE_LABELS = { text: 'Văn bản', number: 'Số', date: 'Ngày' };

  function addColumn() {
    onChange([...columns, { key: slugifyKey('cot'), label: '', type: 'text', required: false }]);
  }
  function updateColumn(idx, patch) {
    onChange(columns.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }
  function removeColumn(idx) {
    onChange(columns.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-1.5 rounded-md border border-stone-200 p-2">
      <div className="text-xs font-medium text-stone-500">Các cột trong bảng</div>
      {columns.map((c, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <input value={c.label} onChange={(e) => updateColumn(idx, { label: e.target.value })} placeholder="Tên cột"
            className="flex-1 rounded border border-stone-300 px-2 py-1 text-xs" />
          <select value={c.type} onChange={(e) => updateColumn(idx, { type: e.target.value })} className="rounded border border-stone-300 bg-white px-1.5 py-1 text-xs">
            {Object.entries(COL_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <label className="flex items-center gap-1 whitespace-nowrap text-xs text-stone-500">
            <input type="checkbox" checked={!!c.required} onChange={(e) => updateColumn(idx, { required: e.target.checked })} /> Bắt buộc
          </label>
          <button onClick={() => removeColumn(idx)} className="text-stone-400 hover:text-rose-600"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button onClick={addColumn} className="flex items-center gap-1 text-xs text-teal-800 hover:underline">
        <Plus className="h-3 w-3" /> Thêm cột
      </button>
    </div>
  );
}

function FieldEditForm({ initial, onSave, onCancel }) {
  const [label, setLabel] = useState(initial.label || '');
  const [fieldType, setFieldType] = useState(initial.type || 'text');
  const [required, setRequired] = useState(!!initial.required);
  const [optionsText, setOptionsText] = useState(initial.type === 'select' ? (initial.options || []).join(', ') : '');
  const [columns, setColumns] = useState(initial.type === 'table' ? (initial.options || []) : []);
  const FIELD_TYPE_LABELS = { text: 'Văn bản ngắn', textarea: 'Văn bản dài', number: 'Số', date: 'Ngày', select: 'Lựa chọn (dropdown)', table: 'Bảng dữ liệu (nhiều dòng)' };

  function handleSave() {
    if (!label.trim()) return;
    let options = null;
    if (fieldType === 'select') options = optionsText.split(',').map((s) => s.trim()).filter(Boolean);
    if (fieldType === 'table') options = columns.filter((c) => c.label.trim());
    onSave({ label: label.trim(), field_type: fieldType, required, options });
  }

  return (
    <div className="space-y-2 rounded-md bg-stone-50 p-3">
      <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Tên trường"
        className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm" />
      <div className="flex items-center gap-2">
        <select value={fieldType} onChange={(e) => setFieldType(e.target.value)} className="flex-1 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm">
          {Object.entries(FIELD_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-stone-500">
          <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} /> Bắt buộc
        </label>
      </div>
      {fieldType === 'select' && (
        <input value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder="Các lựa chọn, cách nhau bằng dấu phẩy"
          className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm" />
      )}
      {fieldType === 'table' && <TableColumnsBuilder columns={columns} onChange={setColumns} />}
      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onCancel} className="rounded-md border border-stone-300 px-3 py-1 text-xs text-stone-600 hover:bg-white">Hủy</button>
        <button onClick={handleSave} className="rounded-md bg-teal-900 px-3 py-1 text-xs text-white hover:bg-teal-800">Lưu</button>
      </div>
    </div>
  );
}

function FieldsManager({
  docType, projectTypeId, mode, builtInFields, customFields, hiddenFieldRows, fieldOverrideRows,
  onCreateField, onDeleteField, onReorderField, onUpdateField, onToggleHideField, onSaveFieldOverride, showToast,
}) {
  const [label, setLabel] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [required, setRequired] = useState(false);
  const [optionsText, setOptionsText] = useState('');
  const [newTableColumns, setNewTableColumns] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingBuiltin, setEditingBuiltin] = useState(null); // field name
  const [editingCustomId, setEditingCustomId] = useState(null);

  const isGeneric = projectTypeId === GENERIC_TYPE_ID;
  const scopedArg = isGeneric ? undefined : projectTypeId;

  function slugify(text) {
    return 'cf_' + text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || ('cf_' + Date.now());
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!label.trim()) return;
    const field_key = slugify(label) + '_' + Math.random().toString(36).slice(2, 6);
    let options = null;
    if (fieldType === 'select') {
      options = optionsText.split(',').map((s) => s.trim()).filter(Boolean);
      if (options.length === 0) {
        showToast('Vui lòng nhập ít nhất 1 lựa chọn, cách nhau bằng dấu phẩy.', 'error');
        return;
      }
    }
    if (fieldType === 'table') {
      options = newTableColumns.filter((c) => c.label.trim());
      if (options.length === 0) {
        showToast('Vui lòng thêm ít nhất 1 cột cho bảng.', 'error');
        return;
      }
    }
    await onCreateField(docType, { field_key, label: label.trim(), field_type: fieldType, required, options }, scopedArg);
    setLabel(''); setFieldType('text'); setRequired(false); setOptionsText(''); setNewTableColumns([]);
  }

  async function handleDelete(id) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete((c) => (c === id ? null : c)), 3000);
      return;
    }
    await onDeleteField(docType, id);
    setConfirmDelete(null);
  }

  const FIELD_TYPE_LABELS = { text: 'Văn bản ngắn', textarea: 'Văn bản dài', number: 'Số', date: 'Ngày', select: 'Lựa chọn (dropdown)', table: 'Bảng dữ liệu (nhiều dòng)' };

  // Lọc theo cấp độ đang chọn: mẫu chung, hoặc mẫu riêng cho 1 loại dự án cụ thể
  const genericHiddenNames = new Set(hiddenFieldRows.filter((h) => h.project_type_id === GENERIC_TYPE_ID).map((h) => h.field_name));
  const specificHiddenNames = new Set(!isGeneric ? hiddenFieldRows.filter((h) => h.project_type_id === projectTypeId).map((h) => h.field_name) : []);
  const genericOverrides = {};
  fieldOverrideRows.filter((o) => o.project_type_id === GENERIC_TYPE_ID).forEach((o) => { genericOverrides[o.field_name] = o; });
  const specificOverrides = {};
  if (!isGeneric) fieldOverrideRows.filter((o) => o.project_type_id === projectTypeId).forEach((o) => { specificOverrides[o.field_name] = o; });

  // Ở cấp "riêng cho loại dự án", trường đã ẩn theo mẫu chung thì ẩn hẳn, không cần quản lý thêm ở đây
  const baseBuiltIn = builtInFields.filter((f) => !f.__custom && (isGeneric || !genericHiddenNames.has(f.name)));
  const builtInWithOverride = baseBuiltIn.map((f) => {
    const o = (!isGeneric && specificOverrides[f.name]) || genericOverrides[f.name];
    const merged = o ? { ...f, label: o.label ?? f.label, type: o.field_type ?? f.type, required: o.required ?? f.required, options: o.options ?? f.options } : f;
    const hiddenHere = isGeneric ? genericHiddenNames.has(f.name) : specificHiddenNames.has(f.name);
    return { ...merged, __hiddenHere: hiddenHere };
  });

  const genericCustom = mode === 'replace' ? [] : customFields.filter((f) => f.project_type_id === GENERIC_TYPE_ID);
  const specificCustom = !isGeneric ? customFields.filter((f) => f.project_type_id === projectTypeId) : [];
  const sortedCustom = [...specificCustom].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="text-sm font-medium text-stone-700">Trường có sẵn</div>
        {mode === 'replace' ? (
          <p className="mt-2 text-xs text-stone-400">Đang ở chế độ "Tự thiết kế lại từ đầu" — trường có sẵn và trường của mẫu chung không áp dụng cho loại dự án này.</p>
        ) : (
        <div className="mt-2 max-h-[28rem] overflow-y-auto divide-y divide-stone-100">
          {builtInWithOverride.map((f) => {
            const isHidden = f.__hiddenHere;
            const isEditing = editingBuiltin === f.name;
            return (
              <div key={f.name} className="py-1.5">
                {isEditing ? (
                  <FieldEditForm
                    initial={f}
                    onCancel={() => setEditingBuiltin(null)}
                    onSave={(patch) => { onSaveFieldOverride(docType, f.name, patch, scopedArg); setEditingBuiltin(null); }}
                  />
                ) : (
                  <div className={`flex items-center justify-between text-sm ${isHidden ? 'text-stone-400' : 'text-stone-700'}`}>
                    <span className={isHidden ? 'line-through' : ''}>{f.label} {f.required && <span className="text-rose-500">*</span>}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400">{FIELD_TYPE_LABELS[f.type] || f.type}</span>
                      <button onClick={() => setEditingBuiltin(f.name)} className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-teal-800">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleHideField(docType, f.name, !isHidden, scopedArg)}
                        className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs ${isHidden ? 'text-teal-700 hover:bg-teal-50' : 'text-stone-500 hover:bg-stone-100'}`}
                      >
                        {isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {isHidden ? 'Hiện lại' : 'Ẩn'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
        {mode !== 'replace' && (
        <p className="mt-2 text-xs text-stone-400">
          Có thể sửa tên/kiểu/bắt buộc/lựa chọn hoặc ẩn bớt trường không cần dùng — dữ liệu cũ đã nhập vẫn được giữ nguyên, không mất.
        </p>
        )}
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="text-sm font-medium text-stone-700">
          {isGeneric ? 'Trường tùy chỉnh đã thêm' : 'Trường tùy chỉnh riêng cho loại dự án này'}
        </div>

        {!isGeneric && genericCustom.length > 0 && (
          <div className="mt-2 rounded-md bg-stone-50 p-2 text-xs text-stone-500">
            Ngoài ra, các trường chung sau cũng tự động áp dụng: {genericCustom.map((f) => f.label).join(', ')}
          </div>
        )}

        <div className="mt-2 divide-y divide-stone-100">
          {sortedCustom.length === 0 && <div className="py-2 text-xs text-stone-400">Chưa có trường tùy chỉnh nào{!isGeneric ? ' riêng cho loại dự án này' : ''}.</div>}
          {sortedCustom.map((f, idx) => {
            const isEditing = editingCustomId === f.id;
            return (
              <div key={f.id} className="py-1.5">
                {isEditing ? (
                  <FieldEditForm
                    initial={{ label: f.label, type: f.field_type, required: f.required, options: f.options }}
                    onCancel={() => setEditingCustomId(null)}
                    onSave={(patch) => { onUpdateField(docType, f.id, patch); setEditingCustomId(null); }}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-stone-700">
                      {f.label} {f.required && <span className="text-rose-500">*</span>}
                      <span className="ml-1 text-xs text-stone-400">({FIELD_TYPE_LABELS[f.field_type]})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingCustomId(f.id)} className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-teal-800">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button disabled={idx === 0} onClick={() => onReorderField(docType, f.id, 'up', scopedArg)} className="rounded p-1 text-stone-400 hover:bg-stone-100 disabled:opacity-30">▲</button>
                      <button disabled={idx === sortedCustom.length - 1} onClick={() => onReorderField(docType, f.id, 'down', scopedArg)} className="rounded p-1 text-stone-400 hover:bg-stone-100 disabled:opacity-30">▼</button>
                      <button onClick={() => handleDelete(f.id)}
                        className={`rounded p-1 hover:bg-rose-50 ${confirmDelete === f.id ? 'text-rose-700' : 'text-stone-400 hover:text-rose-700'}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleAdd} className="mt-3 space-y-2 border-t border-stone-100 pt-3">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Tên trường mới, ví dụ: Ghi chú nội bộ"
            className="w-full rounded-md border border-stone-300 px-3 py-1.5 text-sm" />
          <div className="flex gap-2">
            <select value={fieldType} onChange={(e) => setFieldType(e.target.value)} className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm">
              {Object.entries(FIELD_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <label className="flex items-center gap-1.5 text-xs text-stone-500">
              <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} /> Bắt buộc
            </label>
          </div>
          {fieldType === 'select' && (
            <input value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder="Các lựa chọn, cách nhau bằng dấu phẩy"
              className="w-full rounded-md border border-stone-300 px-3 py-1.5 text-sm" />
          )}
          {fieldType === 'table' && <TableColumnsBuilder columns={newTableColumns} onChange={setNewTableColumns} />}
          <button type="submit" className="flex w-full items-center justify-center gap-1.5 rounded-md bg-teal-900 py-2 text-sm text-white hover:bg-teal-800">
            <Plus className="h-4 w-4" /> Thêm trường
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Trình thiết kế bản in kéo-thả ---------------- */

function PrintDesigner({ docType, schema, savedLayout, onSave }) {
  const normalizedSaved = Array.isArray(savedLayout) ? { orientation: 'portrait', elements: savedLayout } : savedLayout;
  const [orientation, setOrientation] = useState(normalizedSaved.orientation || 'portrait');
  const isLandscape = orientation === 'landscape';
  const PAGE_W = isLandscape ? 1123 : 794;
  const PAGE_H = isLandscape ? 794 : 1123;

  const availableFields = [
    { fieldKey: '__project__', label: 'Dự án' },
    ...schema.fields.filter((f) => f.type !== 'items' && f.type !== 'table').map((f) => ({ fieldKey: f.name, label: f.label })),
  ];

  const [elements, setElements] = useState(() => normalizedSaved.elements || []);
  const [selectedId, setSelectedId] = useState(null);
  const dragRef = useRef(null); // { id, offsetX, offsetY }
  const canvasRef = useRef(null);

  function addFieldElement(fieldKey, label) {
    const id = uid();
    setElements((prev) => [...prev, { id, type: 'field', fieldKey, label, x: 40, y: 40 + prev.length * 32, w: 260, fontSize: 13, bold: false, showLabel: true }]);
    setSelectedId(id);
  }
  function addTextElement() {
    const id = uid();
    setElements((prev) => [...prev, { id, type: 'text', label: 'Tiêu đề / văn bản', x: 40, y: 40 + prev.length * 32, w: 300, fontSize: 16, bold: true }]);
    setSelectedId(id);
  }
  function updateElement(id, patch) {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...patch } : el)));
  }
  function removeElement(id) {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function onMouseDownElement(e, el) {
    e.stopPropagation();
    setSelectedId(el.id);
    const canvasRect = canvasRef.current.getBoundingClientRect();
    dragRef.current = { id: el.id, offsetX: e.clientX - canvasRect.left - el.x, offsetY: e.clientY - canvasRect.top - el.y };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
  function onMouseMove(e) {
    if (!dragRef.current || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const { id, offsetX, offsetY } = dragRef.current;
    let x = e.clientX - canvasRect.left - offsetX;
    let y = e.clientY - canvasRect.top - offsetY;
    x = Math.max(0, Math.min(x, PAGE_W - 20));
    y = Math.max(0, Math.min(y, PAGE_H - 20));
    updateElement(id, { x: Math.round(x), y: Math.round(y) });
  }
  function onMouseUp() {
    dragRef.current = null;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  const selected = elements.find((el) => el.id === selectedId) || null;
  const usedFieldKeys = new Set(elements.filter((el) => el.type === 'field').map((el) => el.fieldKey));

  return (
    <div className="grid grid-cols-[220px_1fr_240px] gap-4">
      {/* Palette */}
      <div className="rounded-lg border border-stone-200 bg-white p-3">
        <div className="text-xs font-medium uppercase tracking-wide text-stone-400">Khổ giấy A4</div>
        <div className="mt-2 flex gap-1">
          <button onClick={() => setOrientation('portrait')}
            className={`flex-1 rounded-md border py-1.5 text-xs ${!isLandscape ? 'border-teal-800 bg-teal-50 text-teal-900' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
            Dọc
          </button>
          <button onClick={() => setOrientation('landscape')}
            className={`flex-1 rounded-md border py-1.5 text-xs ${isLandscape ? 'border-teal-800 bg-teal-50 text-teal-900' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
            Ngang
          </button>
        </div>

        <div className="mt-4 text-xs font-medium uppercase tracking-wide text-stone-400">Trường dữ liệu</div>
        <div className="mt-2 space-y-1">
          {availableFields.map((f) => (
            <button key={f.fieldKey} onClick={() => addFieldElement(f.fieldKey, f.label)}
              disabled={usedFieldKeys.has(f.fieldKey)}
              className="flex w-full items-center justify-between rounded-md border border-stone-200 px-2 py-1.5 text-left text-xs text-stone-700 hover:bg-stone-50 disabled:opacity-30">
              {f.label} <Plus className="h-3 w-3 text-teal-700" />
            </button>
          ))}
        </div>
        <button onClick={addTextElement}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-teal-800 py-1.5 text-xs text-teal-900 hover:bg-teal-50">
          <Plus className="h-3.5 w-3.5" /> Thêm văn bản tự do
        </button>
        <button onClick={() => onSave({ orientation, elements })}
          className="mt-4 w-full rounded-md bg-teal-900 py-2 text-sm text-white hover:bg-teal-800">
          Lưu bố cục
        </button>
      </div>

      {/* Canvas */}
      <div className="overflow-auto rounded-lg border border-stone-300 bg-stone-100 p-4">
        <div
          ref={canvasRef}
          onMouseDown={() => setSelectedId(null)}
          className="relative mx-auto bg-white shadow"
          style={{ width: PAGE_W, height: PAGE_H }}
        >
          {elements.map((el) => (
            <div
              key={el.id}
              onMouseDown={(e) => onMouseDownElement(e, el)}
              className={`absolute cursor-move select-none rounded px-1 ${selectedId === el.id ? 'outline outline-2 outline-teal-600' : 'hover:outline hover:outline-1 hover:outline-stone-300'}`}
              style={{ left: el.x, top: el.y, width: el.w, fontSize: el.fontSize, fontWeight: el.bold ? 700 : 400 }}
            >
              {el.type === 'text' ? el.label : (
                <>{el.showLabel !== false && <span className="text-stone-400">{el.label}: </span>}<span className="text-stone-700">(dữ liệu)</span></>
              )}
            </div>
          ))}
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-stone-300">
              Chọn trường ở cột bên trái để đặt vào trang in
            </div>
          )}
        </div>
      </div>

      {/* Inspector */}
      <div className="rounded-lg border border-stone-200 bg-white p-3">
        <div className="text-xs font-medium uppercase tracking-wide text-stone-400">Thuộc tính</div>
        {!selected ? (
          <p className="mt-2 text-xs text-stone-400">Chọn 1 phần tử trên trang để chỉnh sửa.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {selected.type === 'text' ? (
              <textarea value={selected.label} onChange={(e) => updateElement(selected.id, { label: e.target.value })}
                className="w-full rounded-md border border-stone-300 px-2 py-1 text-xs" rows={2} />
            ) : (
              <>
                <div className="text-xs text-stone-500">Trường: {selected.label}</div>
                <label className="flex items-center gap-1.5 text-xs text-stone-500">
                  <input type="checkbox" checked={selected.showLabel !== false} onChange={(e) => updateElement(selected.id, { showLabel: e.target.checked })} />
                  Hiện nhãn (ví dụ "Tên gói thầu: ")
                </label>
              </>
            )}
            <div>
              <label className="text-xs text-stone-500">Độ rộng (px)</label>
              <input type="number" value={selected.w} onChange={(e) => updateElement(selected.id, { w: Number(e.target.value) || 100 })}
                className="w-full rounded-md border border-stone-300 px-2 py-1 text-xs" />
            </div>
            <div>
              <label className="text-xs text-stone-500">Cỡ chữ</label>
              <input type="number" value={selected.fontSize} onChange={(e) => updateElement(selected.id, { fontSize: Number(e.target.value) || 13 })}
                className="w-full rounded-md border border-stone-300 px-2 py-1 text-xs" />
            </div>
            <label className="flex items-center gap-1.5 text-xs text-stone-500">
              <input type="checkbox" checked={!!selected.bold} onChange={(e) => updateElement(selected.id, { bold: e.target.checked })} /> In đậm
            </label>
            <button onClick={() => removeElement(selected.id)}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-rose-300 py-1.5 text-xs text-rose-700 hover:bg-rose-50">
              <Trash2 className="h-3.5 w-3.5" /> Xóa phần tử này
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal: giao việc điền thông tin cho người khác                      */
/* ------------------------------------------------------------------ */

function AssignFieldsModal({ schema, profiles, onClose, onAssign }) {
  const [userId, setUserId] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const assignableFields = schema.fields.filter((f) => f.name !== 'maGoiThau' && f.name !== 'tenGoiThau');

  function toggleField(name) {
    setSelectedFields((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  }

  async function handleSubmit() {
    if (!userId || selectedFields.length === 0) return;
    setSubmitting(true);
    await onAssign(userId, selectedFields);
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-stone-900">Giao việc điền thông tin</div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-2 text-sm text-stone-500">Chọn người thực hiện và những trường cần họ điền. Hệ thống sẽ gửi email kèm link cho họ.</p>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-stone-600">Giao cho</label>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm">
            <option value="">— Chọn người dùng —</option>
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-stone-600">Trường cần điền</label>
          <div className="max-h-56 overflow-y-auto rounded-md border border-stone-200 p-2">
            {assignableFields.length === 0 && (
              <p className="p-2 text-xs text-stone-400">
                Chưa có trường nào để giao việc. Hãy vào "Tùy chỉnh mẫu" thêm ít nhất 1 trường cho loại hồ sơ (và loại dự án) này.
              </p>
            )}
            {assignableFields.map((f) => (
              <label key={f.name} className="flex items-center gap-2 py-1 text-sm text-stone-700">
                <input type="checkbox" checked={selectedFields.includes(f.name)} onChange={() => toggleField(f.name)} />
                {f.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">Hủy</button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !userId || selectedFields.length === 0}
            className="flex items-center gap-1.5 rounded-md bg-teal-900 px-4 py-2 text-sm text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Giao việc &amp; gửi email
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Danh sách nhiệm vụ của tôi                                           */
/* ------------------------------------------------------------------ */

function MyAssignmentsView({ assignments, records, nameOf, onOpen }) {
  const pending = assignments.filter((a) => a.status === 'pending');
  const completed = assignments.filter((a) => a.status === 'completed');

  function titleOf(a) {
    const rec = (records[a.docType] || []).find((r) => r.id === a.documentId);
    return rec ? (rec.tenGoiThau || rec.soHopDong || rec.maGoiThau || '(không có tiêu đề)') : '(hồ sơ đã bị xóa)';
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">Nhiệm vụ của tôi</div>
      <p className="mt-1 text-sm text-stone-500">Những phần thông tin bạn được giao điền vào hồ sơ.</p>

      <div className="mt-5">
        <div className="text-xs font-medium uppercase tracking-wide text-stone-400">Đang chờ điền</div>
        <div className="mt-2 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {pending.length === 0 && <div className="px-4 py-6 text-center text-sm text-stone-400">Không có nhiệm vụ nào đang chờ.</div>}
          {pending.map((a) => (
            <button key={a.id} onClick={() => onOpen(a)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-stone-50">
              <div>
                <div className="text-sm font-medium text-stone-800">{titleOf(a)}</div>
                <div className="text-xs text-stone-400">{DOC_TYPES[a.docType].label} · {a.fieldKeys.length} trường cần điền</div>
              </div>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Chờ điền</span>
            </button>
          ))}
        </div>
      </div>

      {completed.length > 0 && (
        <div className="mt-6">
          <div className="text-xs font-medium uppercase tracking-wide text-stone-400">Đã hoàn thành</div>
          <div className="mt-2 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
            {completed.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm text-stone-600">{titleOf(a)}</div>
                  <div className="text-xs text-stone-400">{DOC_TYPES[a.docType].label}</div>
                </div>
                <span className="flex items-center gap-1 text-xs text-teal-700"><CheckCircle2 className="h-3.5 w-3.5" /> Đã gửi lại</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Màn hình điền thông tin được giao + xem trước + xác nhận             */
/* ------------------------------------------------------------------ */

function AssignmentFillView({ schema, record, project, assignment, onSaveDraft, onComplete, onBack }) {
  const [values, setValues] = useState(() => {
    const init = {};
    assignment.fieldKeys.forEach((k) => {
      const f = schema.fields.find((x) => x.name === k);
      if (f && (f.type === 'table' || f.type === 'items')) init[k] = record[k] ?? [];
      else init[k] = record[k] ?? '';
    });
    return init;
  });
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const isDone = assignment.status === 'completed';

  const fields = schema.fields.filter((f) => assignment.fieldKeys.includes(f.name));

  function updateValue(name, v) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  async function handleSaveDraft() {
    setSaving(true);
    await onSaveDraft(values);
    setSaving(false);
  }

  async function handleConfirm() {
    setCompleting(true);
    const ok = await onSaveDraft(values);
    if (ok !== false) await onComplete();
    setCompleting(false);
  }

  const previewRecord = { ...record, ...values };

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <button onClick={onBack} className="mb-4 flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ChevronLeft className="h-4 w-4" /> Quay lại danh sách nhiệm vụ
      </button>

      <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">
        Điền thông tin được giao — {schema.label}
      </div>
      {project && <p className="mt-1 text-sm text-stone-500">Dự án: {project.ten}</p>}

      {isDone && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-800">
          <CheckCircle2 className="h-4 w-4" /> Bạn đã xác nhận hoàn thành phần này.
        </div>
      )}

      {!showPreview ? (
        <div className="mt-5 rounded-lg border border-stone-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {fields.map((f) => (
              <div key={f.name} className={f.wide || f.type === 'items' || f.type === 'table' ? 'col-span-2' : 'col-span-1'}>
                <label className="mb-1 block text-xs font-medium text-stone-600">
                  {f.label}{f.required && <span className="text-rose-600"> *</span>}
                </label>
                {f.type === 'items' ? (
                  <ItemsEditor rows={values[f.name]} onChange={(rows) => updateValue(f.name, rows)} />
                ) : f.type === 'table' ? (
                  <TableFieldEditor columns={f.options} rows={values[f.name]} onChange={(rows) => updateValue(f.name, rows)} />
                ) : (
                  <Field field={f} value={values[f.name] ?? ''} onChange={(v) => updateValue(f.name, v)} disabled={isDone} />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-stone-200 pt-5">
            {!isDone && (
              <button onClick={handleSaveDraft} disabled={saving}
                className="flex items-center gap-1.5 rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Lưu tạm
              </button>
            )}
            <button onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 rounded-md bg-teal-900 px-4 py-2 text-sm text-white hover:bg-teal-800">
              <FileText className="h-4 w-4" /> Xem trước hồ sơ hoàn chỉnh
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <DetailView
            schema={schema}
            record={previewRecord}
            project={project}
            canEdit={false}
            canDelete={false}
            canLock={false}
            onBack={() => setShowPreview(false)}
            onEdit={() => {}}
            onDelete={() => {}}
            onToggleLock={() => {}}
            confirmingDelete={false}
          />
          {!isDone && (
            <div className="mx-auto mt-4 flex max-w-3xl justify-end gap-2 px-8 print:hidden">
              <button onClick={() => setShowPreview(false)} className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">
                Quay lại chỉnh sửa
              </button>
              <button onClick={handleConfirm} disabled={completing}
                className="flex items-center gap-1.5 rounded-md bg-teal-900 px-4 py-2 text-sm text-white hover:bg-teal-800 disabled:opacity-60">
                {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Xác nhận hoàn thành &amp; gửi lại
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
