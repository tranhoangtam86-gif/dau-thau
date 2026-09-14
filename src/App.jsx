import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FileText, ClipboardList, Handshake, FileSignature, Search, Trash2,
  Printer, Pencil, Plus, X, ChevronLeft, LayoutDashboard, Loader2,
  Save, Inbox, FolderKanban, Shield, UserPlus, EyeOff, Users, History,
  UserCog, ShieldCheck,
} from 'lucide-react';

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

function defaultFormData(schema) {
  const data = { duAnId: '' };
  schema.fields.forEach((f) => {
    if (f.type === 'items') data[f.name] = [emptyItemRow()];
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

function isSystemAdmin(name, admins) {
  return !!name && admins.includes(name);
}

function roleInProject(project, name, admins) {
  if (isSystemAdmin(name, admins)) return 'admin';
  if (!project) return null;
  const m = (project.members || []).find((x) => x.name === name);
  return m ? m.role : null;
}

function canViewProject(project, name, admins) {
  return !!roleInProject(project, name, admins);
}

function canEditProject(project, name, admins) {
  const r = roleInProject(project, name, admins);
  return r === 'admin' || r === 'editor';
}

function projectById(projects, id) {
  return projects.find((p) => p.id === id) || null;
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Field({ field, value, onChange, error }) {
  const base =
    'w-full rounded-md border bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 ' +
    (error ? 'border-rose-400' : 'border-stone-300');

  if (field.type === 'textarea') {
    return (
      <textarea
        className={base + ' min-h-[96px] resize-y'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <select className={base} value={value} onChange={(e) => onChange(e.target.value)}>
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
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.type === 'text' ? field.label : undefined}
    />
  );
}

function ItemsEditor({ rows, onChange }) {
  const list = rows && rows.length ? rows : [emptyItemRow()];
  const total = list.reduce((sum, r) => sum + lineItemTotal(r), 0);

  function updateRow(id, key, val) {
    onChange(list.map((r) => (r.id === id ? { ...r, [key]: val } : r)));
  }
  function addRow() {
    onChange([...list, emptyItemRow()]);
  }
  function removeRow(id) {
    onChange(list.length > 1 ? list.filter((r) => r.id !== id) : list);
  }

  return (
    <div className="rounded-md border border-stone-300 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-stone-100 text-stone-600">
          <tr>
            <th className="px-2 py-2 text-left font-medium">Tên hàng hóa / dịch vụ</th>
            <th className="px-2 py-2 text-left font-medium w-24">Đơn vị</th>
            <th className="px-2 py-2 text-left font-medium w-24">Số lượng</th>
            <th className="px-2 py-2 text-left font-medium w-32">Đơn giá</th>
            <th className="px-2 py-2 text-right font-medium w-32">Thành tiền</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((row) => (
            <tr key={row.id} className="border-t border-stone-200">
              <td className="p-1">
                <input className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
                  value={row.tenHangHoa} onChange={(e) => updateRow(row.id, 'tenHangHoa', e.target.value)} />
              </td>
              <td className="p-1">
                <input className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
                  value={row.donViTinh} onChange={(e) => updateRow(row.id, 'donViTinh', e.target.value)} />
              </td>
              <td className="p-1">
                <input type="number" className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
                  value={row.soLuong} onChange={(e) => updateRow(row.id, 'soLuong', e.target.value)} />
              </td>
              <td className="p-1">
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
            <td colSpan={4} className="px-2 py-2 text-right font-medium text-stone-600">Tổng cộng</td>
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

/* ------------------------------------------------------------------ */
/* Onboarding (first-time display name)                                */
/* ------------------------------------------------------------------ */

function Onboarding({ users, onCreateFirst, onSelectUser }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState('');
  const isFirstEver = users.length === 0;

  return (
    <div className="flex h-full min-h-[560px] items-center justify-center bg-stone-50 px-6">
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">
          Hồ sơ Đấu thầu
        </div>

        {isFirstEver ? (
          <>
            <p className="mt-2 text-sm text-stone-500">
              Đây là lần khởi tạo đầu tiên. Nhập tên hiển thị của bạn — bạn sẽ được cấp quyền Quản trị viên để tạo dự án và thêm người dùng khác.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); if (name.trim()) onCreateFirst(name.trim()); }}
              className="mt-5"
            >
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/40"
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="mt-3 w-full rounded-md bg-teal-900 px-4 py-2 text-sm text-white hover:bg-teal-800 disabled:opacity-50"
              >
                Bắt đầu
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-stone-500">
              Chọn tên của bạn trong danh sách người dùng đã được tạo.
            </p>
            <div className="mt-5">
              <select
                autoFocus
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/40"
              >
                <option value="">— Chọn tên của bạn —</option>
                {users.map((u) => <option key={u.name} value={u.name}>{u.name}</option>)}
              </select>
              <button
                onClick={() => selected && onSelectUser(selected)}
                disabled={!selected}
                className="mt-3 w-full rounded-md bg-teal-900 px-4 py-2 text-sm text-white hover:bg-teal-800 disabled:opacity-50"
              >
                Tiếp tục
              </button>
              <p className="mt-3 text-xs text-stone-400">
                Chưa thấy tên của bạn? Liên hệ quản trị viên để được tạo tài khoản.
              </p>
            </div>
          </>
        )}
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

export default function App() {
  const [records, setRecords] = useState({ bao_gia: [], ho_so_yeu_cau: [], bien_ban: [], hop_dong: [] });
  const [projects, setProjects] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const auditLogRef = useRef([]);
  useEffect(() => { auditLogRef.current = auditLog; }, [auditLog]);
  const [myName, setMyName] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeType, setActiveType] = useState('bao_gia');
  const [view, setView] = useState('dashboard'); // dashboard | list | form | detail | admin
  const [projectFilter, setProjectFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = useCallback((message, tone = 'ok') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 2600);
  }, []);

  /* ---------------- load ---------------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let profileName = null;
      try {
        const res = await window.storage.get('my-profile', false);
        profileName = res && res.value ? JSON.parse(res.value).name : null;
      } catch (e) { profileName = null; }

      let adminList = [];
      try {
        const res = await window.storage.get('app:admins', true);
        adminList = res && res.value ? JSON.parse(res.value) : [];
      } catch (e) { adminList = []; }

      let projectList = [];
      try {
        const res = await window.storage.get('records:projects', true);
        projectList = res && res.value ? JSON.parse(res.value) : [];
      } catch (e) { projectList = []; }

      let userList = [];
      try {
        const res = await window.storage.get('records:users', true);
        userList = res && res.value ? JSON.parse(res.value) : [];
      } catch (e) { userList = []; }

      let logList = [];
      try {
        const res = await window.storage.get('records:audit_log', true);
        logList = res && res.value ? JSON.parse(res.value) : [];
      } catch (e) { logList = []; }

      const nextRecords = {};
      for (const key of TYPE_ORDER) {
        try {
          const res = await window.storage.get(`records:${key}`, true);
          nextRecords[key] = res && res.value ? JSON.parse(res.value) : [];
        } catch (e) { nextRecords[key] = []; }
      }

      // bootstrap: first person ever becomes system admin
      if (profileName && adminList.length === 0) {
        adminList = [profileName];
        try { await window.storage.set('app:admins', JSON.stringify(adminList), true); } catch (e) { /* ignore */ }
      }
      // migration: a profile created before user accounts existed still gets a directory entry
      if (profileName && !userList.some((u) => u.name === profileName)) {
        userList = [...userList, { name: profileName, addedAt: new Date().toISOString() }];
        try { await window.storage.set('records:users', JSON.stringify(userList), true); } catch (e) { /* ignore */ }
      }

      if (!cancelled) {
        setMyName(profileName);
        setAdmins(adminList);
        setProjects(projectList);
        setUsers(userList);
        setAuditLog(logList);
        setRecords(nextRecords);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function appendLog(actor, action, summary) {
    const entry = { id: uid(), time: new Date().toISOString(), actor, action, summary };
    const next = [entry, ...auditLogRef.current].slice(0, 300);
    try {
      await window.storage.set('records:audit_log', JSON.stringify(next), true);
      auditLogRef.current = next;
      setAuditLog(next);
    } catch (e) { /* logging failures should not block the underlying action */ }
  }

  // First-ever user: types their own name, becomes the system admin.
  async function handleCreateFirstUser(name) {
    try {
      await window.storage.set('my-profile', JSON.stringify({ name }), false);
    } catch (e) {
      showToast('Không thể lưu tên hiển thị, vui lòng thử lại.', 'error');
      return;
    }
    const nextUsers = [{ name, addedAt: new Date().toISOString() }];
    try { await window.storage.set('records:users', JSON.stringify(nextUsers), true); setUsers(nextUsers); } catch (e) { /* ignore */ }
    setMyName(name);
    if (admins.length === 0) {
      await persistAdmins([name]);
      showToast('Bạn là người dùng đầu tiên nên được cấp quyền Quản trị viên.');
    }
    appendLog(name, 'bootstrap', `${name} là người dùng đầu tiên của hệ thống và được cấp quyền Quản trị viên.`);
  }

  // Returning / invited user: picks their pre-created account, no self-registration.
  async function handleSelectUser(name) {
    try {
      await window.storage.set('my-profile', JSON.stringify({ name }), false);
    } catch (e) {
      showToast('Không thể lưu, vui lòng thử lại.', 'error');
      return;
    }
    setMyName(name);
  }

  async function persistUsers(next) {
    try {
      const res = await window.storage.set('records:users', JSON.stringify(next), true);
      if (!res) throw new Error('empty');
      setUsers(next);
      return true;
    } catch (e) {
      showToast('Không thể lưu danh sách người dùng.', 'error');
      return false;
    }
  }

  async function createUser(name, makeAdmin) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (users.some((u) => u.name === trimmed)) {
      showToast('Người dùng này đã tồn tại.', 'error');
      return;
    }
    const nextUsers = [...users, { name: trimmed, addedAt: new Date().toISOString() }];
    const ok = await persistUsers(nextUsers);
    if (!ok) return;
    if (makeAdmin) await persistAdmins([...admins, trimmed]);
    showToast('Đã tạo người dùng.');
    appendLog(myName, 'create_user', `${myName} đã tạo tài khoản người dùng "${trimmed}"${makeAdmin ? ' với quyền Quản trị viên' : ''}.`);
  }

  async function removeUser(name) {
    if (admins.includes(name) && admins.length === 1) {
      showToast('Không thể xóa vì đây là Quản trị viên duy nhất.', 'error');
      return;
    }
    if (admins.includes(name)) {
      await persistAdmins(admins.filter((a) => a !== name));
    }
    await persistProjects(projects.map((p) => ({ ...p, members: (p.members || []).filter((m) => m.name !== name) })));
    const ok = await persistUsers(users.filter((u) => u.name !== name));
    if (ok) {
      showToast('Đã xóa người dùng.');
      appendLog(myName, 'delete_user', `${myName} đã xóa tài khoản người dùng "${name}" khỏi hệ thống.`);
    }
  }

  async function toggleUserAdmin(name, makeAdmin) {
    if (!makeAdmin && admins.length === 1 && admins[0] === name) {
      showToast('Phải có ít nhất một Quản trị viên.', 'error');
      return;
    }
    const next = makeAdmin ? [...admins, name] : admins.filter((a) => a !== name);
    const ok = await persistAdmins(next);
    if (ok) appendLog(myName, makeAdmin ? 'grant_admin' : 'revoke_admin', `${myName} đã ${makeAdmin ? 'cấp' : 'gỡ'} quyền Quản trị viên cho "${name}".`);
  }

  async function persistAdmins(next) {
    try {
      const res = await window.storage.set('app:admins', JSON.stringify(next), true);
      if (!res) throw new Error('empty');
      setAdmins(next);
      return true;
    } catch (e) {
      showToast('Không thể lưu danh sách quản trị viên.', 'error');
      return false;
    }
  }

  async function persistProjects(next) {
    try {
      const res = await window.storage.set('records:projects', JSON.stringify(next), true);
      if (!res) throw new Error('empty');
      setProjects(next);
      return true;
    } catch (e) {
      showToast('Không thể lưu thông tin dự án.', 'error');
      return false;
    }
  }

  async function persistDocs(typeKey, list) {
    setSaving(true);
    try {
      const res = await window.storage.set(`records:${typeKey}`, JSON.stringify(list), true);
      if (!res) throw new Error('empty');
      setRecords((prev) => ({ ...prev, [typeKey]: list }));
      return true;
    } catch (e) {
      showToast('Không thể lưu hồ sơ — vui lòng thử lại.', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- permissions (derived) ---------------- */
  const amAdmin = isSystemAdmin(myName, admins);
  const accessibleProjects = useMemo(
    () => projects.filter((p) => canViewProject(p, myName, admins)),
    [projects, myName, admins]
  );
  const editableProjects = useMemo(
    () => projects.filter((p) => canEditProject(p, myName, admins)),
    [projects, myName, admins]
  );

  /* ---------------- navigation ---------------- */
  function openList(typeKey) {
    setActiveType(typeKey);
    setSearch('');
    setView('list');
  }

  function openNewForm(typeKey) {
    if (editableProjects.length === 0) {
      showToast('Bạn chưa được cấp quyền biên tập ở dự án nào.', 'error');
      return;
    }
    setActiveType(typeKey);
    const data = defaultFormData(DOC_TYPES[typeKey]);
    if (editableProjects.length === 1) data.duAnId = editableProjects[0].id;
    else if (projectFilter !== 'all' && editableProjects.some((p) => p.id === projectFilter)) data.duAnId = projectFilter;
    setFormData(data);
    setFormErrors({});
    setEditingId(null);
    setView('form');
  }

  function openEditForm(typeKey, record) {
    const proj = projectById(projects, record.duAnId);
    if (!canEditProject(proj, myName, admins)) {
      showToast('Bạn không có quyền chỉnh sửa hồ sơ của dự án này.', 'error');
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

  async function handleSubmit(e) {
    e.preventDefault();
    const schema = DOC_TYPES[activeType];
    const errors = {};
    if (!formData.duAnId) errors.duAnId = true;
    schema.fields.forEach((f) => {
      if (f.required && !String(formData[f.name] || '').trim()) errors[f.name] = true;
    });
    const targetProject = projectById(projects, formData.duAnId);
    if (!canEditProject(targetProject, myName, admins)) {
      showToast('Bạn không có quyền lưu hồ sơ vào dự án này.', 'error');
      return;
    }
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      showToast('Vui lòng điền các trường bắt buộc, bao gồm Dự án.', 'error');
      return;
    }
    const list = records[activeType] || [];
    let newList;
    if (editingId) {
      newList = list.map((r) => (r.id === editingId ? { ...formData, id: editingId, updatedAt: new Date().toISOString() } : r));
    } else {
      newList = [...list, { ...formData, id: uid(), createdAt: new Date().toISOString(), createdBy: myName }];
    }
    const ok = await persistDocs(activeType, newList);
    if (ok) {
      showToast(editingId ? 'Đã cập nhật hồ sơ.' : 'Đã lưu hồ sơ mới.');
      const title = formData.tenGoiThau || formData.soHopDong || formData.maGoiThau || '(không có tiêu đề)';
      appendLog(
        myName,
        editingId ? 'update_doc' : 'create_doc',
        `${myName} đã ${editingId ? 'cập nhật' : 'tạo'} ${schema.label.toLowerCase()} "${title}" (Dự án: ${targetProject ? targetProject.ten : '—'}).`
      );
      setView('list');
    }
  }

  async function handleDelete(typeKey, id) {
    const rec = (records[typeKey] || []).find((r) => r.id === id);
    const proj = projectById(projects, rec?.duAnId);
    if (!canEditProject(proj, myName, admins)) {
      showToast('Bạn không có quyền xóa hồ sơ của dự án này.', 'error');
      return;
    }
    if (confirmingDelete !== id) {
      setConfirmingDelete(id);
      setTimeout(() => setConfirmingDelete((cur) => (cur === id ? null : cur)), 3000);
      return;
    }
    const list = records[typeKey] || [];
    const ok = await persistDocs(typeKey, list.filter((r) => r.id !== id));
    if (ok) {
      showToast('Đã xóa hồ sơ.');
      const title = rec?.tenGoiThau || rec?.soHopDong || rec?.maGoiThau || '(không có tiêu đề)';
      const typeLabel = DOC_TYPES[typeKey].label;
      appendLog(myName, 'delete_doc', `${myName} đã xóa ${typeLabel.toLowerCase()} "${title}" (Dự án: ${proj ? proj.ten : '—'}).`);
    }
    setConfirmingDelete(null);
    if (view === 'detail' && detailId === id) setView('list');
  }

  const schema = DOC_TYPES[activeType];
  const currentList = records[activeType] || [];

  const viewableList = currentList.filter((r) => {
    const proj = projectById(projects, r.duAnId);
    if (!r.duAnId) return amAdmin; // unassigned records: admin only
    return canViewProject(proj, myName, admins);
  });
  const projectScopedList = projectFilter === 'all'
    ? viewableList
    : viewableList.filter((r) => r.duAnId === projectFilter);
  const filteredList = projectScopedList.filter((r) => matchesSearch(r, schema, search));

  const detailRecord = view === 'detail' ? currentList.find((r) => r.id === detailId) : null;
  const detailProject = detailRecord ? projectById(projects, detailRecord.duAnId) : null;
  const detailCanView = detailRecord ? (detailRecord.duAnId ? canViewProject(detailProject, myName, admins) : amAdmin) : false;
  const detailCanEdit = detailRecord ? (detailRecord.duAnId ? canEditProject(detailProject, myName, admins) : amAdmin) : false;

  if (loading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center bg-stone-50">
        <div className="flex items-center gap-2 text-stone-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Đang tải dữ liệu…</span>
        </div>
      </div>
    );
  }

  if (!myName) {
    return <Onboarding users={users} onCreateFirst={handleCreateFirstUser} onSelectUser={handleSelectUser} />;
  }

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
          {amAdmin && (
            <button
              onClick={() => setView('admin')}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                view === 'admin' ? 'bg-teal-800/70 text-white' : 'text-teal-200 hover:bg-teal-900/60'
              }`}
            >
              <Shield className="h-4 w-4" />
              Dự án &amp; phân quyền
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
            onClick={() => { setProjectFilter('all'); }}
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
              className={`flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-left text-sm ${
                projectFilter === p.id ? 'bg-teal-800/70 text-white' : 'text-teal-200 hover:bg-teal-900/60'
              }`}
            >
              <span className="truncate">{p.ten}</span>
              <RoleBadge role={roleInProject(p, myName, admins)} />
            </button>
          ))}
        </div>

        <div className="mt-4 px-5 text-[11px] font-medium uppercase tracking-wide text-teal-400/70">Biểu mẫu</div>
        <nav className="mt-1 flex flex-col gap-1 px-3">
          {TYPE_ORDER.map((key) => {
            const t = DOC_TYPES[key];
            const Icon = t.icon;
            const isActive = (view === 'list' || view === 'form' || view === 'detail') && activeType === key;
            const count = (records[key] || []).filter((r) => {
              const proj = projectById(projects, r.duAnId);
              const visible = r.duAnId ? canViewProject(proj, myName, admins) : amAdmin;
              return visible && (projectFilter === 'all' || r.duAnId === projectFilter);
            }).length;
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
                </span>
                <span className="rounded bg-teal-950/60 px-1.5 py-0.5 text-xs text-teal-300">{count}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-teal-900 px-5 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="truncate text-teal-100">{myName}</span>
            {amAdmin && <RoleBadge role="admin" />}
          </div>
          <button
            onClick={() => { setMyName(null); }}
            className="mt-1 text-xs text-teal-400/70 hover:text-teal-200"
          >
            Đổi tên hiển thị
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
            myName={myName}
            admins={admins}
            projectFilter={projectFilter}
            onOpenType={openList}
            onNew={openNewForm}
            onGoAdmin={() => setView('admin')}
          />
        )}

        {view === 'list' && (
          <ListView
            schema={schema}
            list={filteredList}
            projects={projects}
            search={search}
            onSearch={setSearch}
            projectFilter={projectFilter}
            onProjectFilter={setProjectFilter}
            accessibleProjects={accessibleProjects}
            onNew={() => openNewForm(activeType)}
            onView={(id) => openDetail(activeType, id)}
            onEdit={(rec) => openEditForm(activeType, rec)}
            onDelete={(id) => handleDelete(activeType, id)}
            confirmingDelete={confirmingDelete}
            myName={myName}
            admins={admins}
          />
        )}

        {view === 'form' && formData && (
          <FormView
            schema={schema}
            formData={formData}
            errors={formErrors}
            editing={!!editingId}
            saving={saving}
            projects={editableProjects}
            onChange={updateField}
            onSubmit={handleSubmit}
            onCancel={() => setView(editingId ? 'detail' : 'list')}
          />
        )}

        {view === 'detail' && detailRecord && detailCanView && (
          <DetailView
            schema={schema}
            record={detailRecord}
            project={detailProject}
            canEdit={detailCanEdit}
            onBack={() => setView('list')}
            onEdit={() => openEditForm(activeType, detailRecord)}
            onDelete={() => handleDelete(activeType, detailRecord.id)}
            confirmingDelete={confirmingDelete === detailRecord.id}
          />
        )}

        {view === 'detail' && detailRecord && !detailCanView && (
          <div className="p-10 text-center text-stone-400">Bạn không có quyền xem hồ sơ này.</div>
        )}

        {view === 'detail' && !detailRecord && (
          <div className="p-10 text-center text-stone-400">Không tìm thấy hồ sơ.</div>
        )}

        {view === 'admin' && amAdmin && (
          <ProjectAdmin
            projects={projects}
            admins={admins}
            users={users}
            myName={myName}
            onSaveProjects={persistProjects}
            onCreateUser={createUser}
            onRemoveUser={removeUser}
            onToggleAdmin={toggleUserAdmin}
            showToast={showToast}
            onLog={(action, summary) => appendLog(myName, action, summary)}
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

function Dashboard({ records, projects, allProjectsEmpty, amAdmin, projectFilter, onOpenType, onNew, onGoAdmin }) {
  function visibleCount(typeKey) {
    return (records[typeKey] || []).filter((r) => {
      if (projectFilter !== 'all' && r.duAnId !== projectFilter) return false;
      if (!r.duAnId) return amAdmin;
      return projects.some((p) => p.id === r.duAnId);
    }).length;
  }
  const totalCount = TYPE_ORDER.reduce((s, k) => s + visibleCount(k), 0);

  const recent = TYPE_ORDER
    .flatMap((k) => (records[k] || []).map((r) => ({ ...r, __type: k })))
    .filter((r) => (projectFilter === 'all' || r.duAnId === projectFilter) && (r.duAnId ? projects.some((p) => p.id === r.duAnId) : amAdmin))
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
            <button
              key={key}
              onClick={() => onOpenType(key)}
              className="group flex flex-col items-start gap-3 rounded-lg border border-stone-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
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
          <button
            key={key}
            onClick={() => onNew(key)}
            className="flex items-center gap-1.5 rounded-md border border-teal-800 px-3 py-1.5 text-sm text-teal-900 hover:bg-teal-50"
          >
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
                <button
                  key={r.id}
                  onClick={() => onOpenType(r.__type)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-stone-50"
                >
                  <Icon className="h-4 w-4 shrink-0 text-teal-800" />
                  <span className="flex-1 truncate text-sm text-stone-800">{title}</span>
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
  schema, list, projects, search, onSearch, projectFilter, onProjectFilter, accessibleProjects,
  onNew, onView, onEdit, onDelete, confirmingDelete, myName, admins,
}) {
  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">
            {schema.label}
          </div>
          <div className="text-sm text-stone-500">{list.length} hồ sơ</div>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 rounded-md bg-teal-900 px-3.5 py-2 text-sm text-white hover:bg-teal-800"
        >
          <Plus className="h-4 w-4" /> Thêm mới
        </button>
      </div>

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
        <select
          value={projectFilter}
          onChange={(e) => onProjectFilter(e.target.value)}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/40"
        >
          <option value="all">Tất cả dự án</option>
          {accessibleProjects.map((p) => (
            <option key={p.id} value={p.id}>{p.ten}</option>
          ))}
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
                {schema.listColumns.map((c) => (
                  <th key={c.key} className="px-4 py-2.5 text-left font-medium">{c.label}</th>
                ))}
                <th className="w-28"></th>
              </tr>
            </thead>
            <tbody>
              {list
                .slice()
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .map((r) => {
                  const proj = projectById(projects, r.duAnId);
                  const editable = canEditProject(proj, myName, admins) || (!r.duAnId && isSystemAdmin(myName, admins));
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
                          <button onClick={() => onView(r.id)} title="Xem"
                            className="rounded p-1.5 text-stone-500 hover:bg-stone-200 hover:text-teal-900">
                            <FileText className="h-4 w-4" />
                          </button>
                          {editable && (
                            <>
                              <button onClick={() => onEdit(r)} title="Sửa"
                                className="rounded p-1.5 text-stone-500 hover:bg-stone-200 hover:text-teal-900">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => onDelete(r.id)} title="Xóa"
                                className={`rounded p-1.5 hover:bg-rose-50 ${
                                  confirmingDelete === r.id ? 'text-rose-700' : 'text-stone-500 hover:text-rose-700'
                                }`}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form view                                                            */
/* ------------------------------------------------------------------ */

function FormView({ schema, formData, errors, editing, saving, projects, onChange, onSubmit, onCancel }) {
  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <button onClick={onCancel} className="mb-4 flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ChevronLeft className="h-4 w-4" /> Quay lại
      </button>

      <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">
        {editing ? `Chỉnh sửa — ${schema.label}` : `Tạo mới — ${schema.label}`}
      </div>

      <form onSubmit={onSubmit} className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-stone-600">
              Dự án<span className="text-rose-600"> *</span>
            </label>
            <ProjectSelect projects={projects} value={formData.duAnId} onChange={(v) => onChange('duAnId', v)} error={errors.duAnId} />
          </div>

          {schema.fields.map((f) => (
            <div key={f.name} className={f.wide || f.type === 'items' ? 'col-span-2' : 'col-span-1'}>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                {f.label}{f.required && <span className="text-rose-600"> *</span>}
              </label>
              {f.type === 'items' ? (
                <ItemsEditor rows={formData[f.name]} onChange={(rows) => onChange(f.name, rows)} />
              ) : (
                <Field field={f} value={formData[f.name] ?? ''} onChange={(v) => onChange(f.name, v)} error={errors[f.name]} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-stone-200 pt-5">
          <button type="button" onClick={onCancel}
            className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">
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

/* ------------------------------------------------------------------ */
/* Detail / print view                                                 */
/* ------------------------------------------------------------------ */

function DetailView({ schema, record, project, canEdit, onBack, onEdit, onDelete, confirmingDelete }) {
  const hangMuc = record.hangMuc;
  const dateStr = formatDateVN(record[schema.dateField]);

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
          <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
        </button>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <button onClick={onEdit}
                className="flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50">
                <Pencil className="h-3.5 w-3.5" /> Sửa
              </button>
              <button onClick={onDelete}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${
                  confirmingDelete ? 'border-rose-400 text-rose-700' : 'border-stone-300 text-stone-700 hover:bg-stone-50'
                }`}>
                <Trash2 className="h-3.5 w-3.5" /> {confirmingDelete ? 'Xác nhận xóa' : 'Xóa'}
              </button>
            </>
          )}
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-md bg-teal-900 px-3 py-1.5 text-sm text-white hover:bg-teal-800">
            <Printer className="h-3.5 w-3.5" /> In / Xuất PDF
          </button>
        </div>
      </div>

      {!canEdit && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-stone-100 px-3 py-2 text-xs text-stone-500 print:hidden">
          <EyeOff className="h-3.5 w-3.5" /> Bạn chỉ có quyền xem hồ sơ này.
        </div>
      )}

      <div className="rounded-lg border border-stone-200 bg-white p-10 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <div className="text-center">
          <div className="text-sm font-semibold uppercase tracking-wide text-stone-800">
            Cộng hòa Xã hội Chủ nghĩa Việt Nam
          </div>
          <div className="text-sm text-stone-700">Độc lập – Tự do – Hạnh phúc</div>
          <div className="mx-auto mt-1 h-px w-16 bg-stone-400" />
        </div>

        <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }}
          className="mt-8 text-center text-xl font-semibold uppercase text-teal-950">
          {schema.docTitle}
        </div>
        {record.tenGoiThau && (
          <div className="mt-1 text-center text-sm italic text-stone-500">{record.tenGoiThau}</div>
        )}
        {project && (
          <div className="mt-1 text-center text-xs text-stone-400">Dự án: {project.ten}</div>
        )}

        <div className="mt-8 space-y-3">
          {schema.fields
            .filter((f) => f.type !== 'textarea' && f.type !== 'items' && f.name !== 'tenGoiThau')
            .map((f) => (
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Project & permission administration (admin only)                    */
/* ------------------------------------------------------------------ */

function AuditLog({ entries }) {
  const [search, setSearch] = useState('');
  const filtered = entries.filter(
    (e) => !search || (e.summary + ' ' + e.actor).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">
        Nhật ký hoạt động
      </div>
      <p className="mt-1 text-sm text-stone-500">
        Lưu 300 hoạt động gần nhất trên toàn hệ thống: tạo/sửa/xóa hồ sơ, dự án, thành viên và người dùng.
      </p>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo người thực hiện hoặc nội dung…"
          className="w-full rounded-md border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/40"
        />
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

function ProjectAdmin({ projects, admins, users, myName, onSaveProjects, onCreateUser, onRemoveUser, onToggleAdmin, showToast, onLog }) {
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCode, setNewProjectCode] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [confirmRemoveUser, setConfirmRemoveUser] = useState(null);
  const [memberDrafts, setMemberDrafts] = useState({}); // { [projectId]: { name, role } }

  async function createProject(e) {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const project = {
      id: uid(),
      ten: newProjectName.trim(),
      maDuAn: newProjectCode.trim(),
      moTa: newProjectDesc.trim(),
      members: [],
      createdAt: new Date().toISOString(),
    };
    const ok = await onSaveProjects([...projects, project]);
    if (ok) {
      showToast('Đã tạo dự án.');
      onLog('create_project', `${myName} đã tạo dự án "${project.ten}".`);
      setNewProjectName(''); setNewProjectCode(''); setNewProjectDesc('');
    }
  }

  async function deleteProject(project) {
    const ok = await onSaveProjects(projects.filter((p) => p.id !== project.id));
    if (ok) {
      showToast('Đã xóa dự án. Hồ sơ thuộc dự án này sẽ hiển thị là "Chưa gán".');
      onLog('delete_project', `${myName} đã xóa dự án "${project.ten}".`);
    }
  }

  function updateDraft(projectId, key, value) {
    setMemberDrafts((prev) => ({ ...prev, [projectId]: { ...(prev[projectId] || { name: '', role: 'viewer' }), [key]: value } }));
  }

  async function addMember(project) {
    const draft = memberDrafts[project.id] || { name: '', role: 'viewer' };
    if (!draft.name) return;
    const updated = projects.map((p) =>
      p.id === project.id ? { ...p, members: [...(p.members || []), { name: draft.name, role: draft.role }] } : p
    );
    const ok = await onSaveProjects(updated);
    if (ok) {
      showToast('Đã thêm thành viên.');
      onLog('add_member', `${myName} đã thêm "${draft.name}" vào dự án "${project.ten}" với quyền ${ROLE_LABELS[draft.role]}.`);
      setMemberDrafts((prev) => ({ ...prev, [project.id]: { name: '', role: 'viewer' } }));
    }
  }

  async function removeMember(project, name) {
    const updated = projects.map((p) =>
      p.id === project.id ? { ...p, members: (p.members || []).filter((m) => m.name !== name) } : p
    );
    const ok = await onSaveProjects(updated);
    if (ok) {
      showToast('Đã xóa thành viên khỏi dự án.');
      onLog('remove_member', `${myName} đã xóa "${name}" khỏi dự án "${project.ten}".`);
    }
  }

  async function changeMemberRole(project, name, role) {
    const updated = projects.map((p) =>
      p.id === project.id ? { ...p, members: (p.members || []).map((m) => (m.name === name ? { ...m, role } : m)) } : p
    );
    const ok = await onSaveProjects(updated);
    if (ok) onLog('change_role', `${myName} đã đổi quyền của "${name}" trong dự án "${project.ten}" thành ${ROLE_LABELS[role]}.`);
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    if (!newUserName.trim()) return;
    await onCreateUser(newUserName, newUserIsAdmin);
    setNewUserName('');
    setNewUserIsAdmin(false);
  }

  async function handleRemoveUser(name) {
    if (confirmRemoveUser !== name) {
      setConfirmRemoveUser(name);
      setTimeout(() => setConfirmRemoveUser((cur) => (cur === name ? null : cur)), 3000);
      return;
    }
    await onRemoveUser(name);
    setConfirmRemoveUser(null);
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <div style={{ fontFamily: 'Georgia, "Iowan Old Style", serif' }} className="text-xl text-stone-900">
        Dự án &amp; phân quyền
      </div>
      <p className="mt-1 text-sm text-stone-500">
        Quản trị viên toàn hệ thống có quyền xem và sửa mọi hồ sơ ở mọi dự án. Thành viên "Biên tập" có thể thêm/sửa/xóa hồ sơ trong dự án được gán; "Chỉ xem" chỉ được xem.
      </p>

      {/* Users directory */}
      <div className="mt-6 rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <UserCog className="h-4 w-4 text-teal-800" /> Người dùng
        </div>
        <p className="mt-1 text-xs text-stone-400">
          Chỉ những người có tên trong danh sách này mới đăng nhập được vào ứng dụng.
        </p>

        <div className="mt-3 divide-y divide-stone-100">
          {users.length === 0 && <div className="py-3 text-xs text-stone-400">Chưa có người dùng nào.</div>}
          {users.map((u) => {
            const isAdminUser = admins.includes(u.name);
            return (
              <div key={u.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-stone-700">
                  {u.name}
                  {isAdminUser && <RoleBadge role="admin" />}
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-stone-500">
                    <input
                      type="checkbox"
                      checked={isAdminUser}
                      onChange={(e) => onToggleAdmin(u.name, e.target.checked)}
                    />
                    Quản trị viên
                  </label>
                  <button
                    onClick={() => handleRemoveUser(u.name)}
                    className={`rounded p-1 hover:bg-rose-50 ${confirmRemoveUser === u.name ? 'text-rose-700' : 'text-stone-400 hover:text-rose-700'}`}
                    title="Xóa người dùng"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleCreateUser} className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
          <input
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="Tên hiển thị người dùng mới"
            className="flex-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/40"
          />
          <label className="flex items-center gap-1.5 text-xs text-stone-500">
            <input type="checkbox" checked={newUserIsAdmin} onChange={(e) => setNewUserIsAdmin(e.target.checked)} />
            Cấp quyền Quản trị viên
          </label>
          <button type="submit"
            className="flex items-center gap-1 rounded-md bg-teal-900 px-3 py-1.5 text-sm text-white hover:bg-teal-800">
            <UserPlus className="h-3.5 w-3.5" /> Tạo người dùng
          </button>
        </form>
      </div>

      {/* Create project */}
      <div className="mt-6 rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <FolderKanban className="h-4 w-4 text-teal-800" /> Tạo dự án mới
        </div>
        <form onSubmit={createProject} className="mt-3 grid grid-cols-2 gap-3">
          <input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Tên dự án *" className="col-span-2 rounded-md border border-stone-300 px-3 py-1.5 text-sm sm:col-span-1" />
          <input value={newProjectCode} onChange={(e) => setNewProjectCode(e.target.value)}
            placeholder="Mã dự án" className="rounded-md border border-stone-300 px-3 py-1.5 text-sm" />
          <input value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)}
            placeholder="Mô tả ngắn" className="col-span-2 rounded-md border border-stone-300 px-3 py-1.5 text-sm" />
          <button type="submit" className="col-span-2 flex items-center justify-center gap-1.5 rounded-md bg-teal-900 py-2 text-sm text-white hover:bg-teal-800 sm:col-span-1">
            <Plus className="h-4 w-4" /> Tạo dự án
          </button>
        </form>
      </div>

      {/* Existing projects */}
      <div className="mt-6 space-y-4">
        {projects.length === 0 && (
          <div className="rounded-lg border border-dashed border-stone-300 py-10 text-center text-sm text-stone-400">
            Chưa có dự án nào.
          </div>
        )}
        {projects.map((p) => {
          const draft = memberDrafts[p.id] || { name: '', role: 'viewer' };
          return (
            <div key={p.id} className="rounded-lg border border-stone-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-teal-950">{p.ten} {p.maDuAn && <span className="font-normal text-stone-400">({p.maDuAn})</span>}</div>
                  {p.moTa && <div className="mt-0.5 text-xs text-stone-500">{p.moTa}</div>}
                </div>
                <button onClick={() => deleteProject(p)} className="text-stone-400 hover:text-rose-700" title="Xóa dự án">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-400">
                <Users className="h-3.5 w-3.5" /> Thành viên
              </div>
              <div className="mt-2 space-y-1.5">
                {(p.members || []).length === 0 && (
                  <div className="text-xs text-stone-400">Chưa có thành viên nào — chỉ quản trị viên hệ thống truy cập được dự án này.</div>
                )}
                {(p.members || []).map((m) => (
                  <div key={m.name} className="flex items-center justify-between rounded-md bg-stone-50 px-3 py-1.5">
                    <span className="text-sm text-stone-700">{m.name}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={m.role}
                        onChange={(e) => changeMemberRole(p, m.name, e.target.value)}
                        className="rounded border border-stone-300 bg-white px-2 py-1 text-xs"
                      >
                        <option value="editor">Biên tập</option>
                        <option value="viewer">Chỉ xem</option>
                      </select>
                      <button onClick={() => removeMember(p, m.name)} className="text-stone-400 hover:text-rose-700">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {(() => {
                const available = users.filter((u) => !(p.members || []).some((m) => m.name === u.name));
                if (available.length === 0) {
                  return <p className="mt-3 text-xs text-stone-400">Mọi người dùng đã có mặt trong dự án này, hoặc chưa có người dùng nào để thêm.</p>;
                }
                return (
                  <div className="mt-3 flex gap-2">
                    <select
                      value={draft.name}
                      onChange={(e) => updateDraft(p.id, 'name', e.target.value)}
                      className="flex-1 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm"
                    >
                      <option value="">— Chọn người dùng —</option>
                      {available.map((u) => <option key={u.name} value={u.name}>{u.name}</option>)}
                    </select>
                    <select
                      value={draft.role}
                      onChange={(e) => updateDraft(p.id, 'role', e.target.value)}
                      className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm"
                    >
                      <option value="editor">Biên tập</option>
                      <option value="viewer">Chỉ xem</option>
                    </select>
                    <button onClick={() => addMember(p)}
                      className="flex items-center gap-1 rounded-md border border-teal-800 px-3 py-1.5 text-sm text-teal-900 hover:bg-teal-50">
                      <UserPlus className="h-3.5 w-3.5" /> Thêm
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
