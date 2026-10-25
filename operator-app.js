/**
 * Operator / Teacher Dashboard SPA Controller
 * Manages students, storyline slides, questions bank, learning analytics, and media settings.
 */

window.operatorApp = {
  token: null,
  operator: null,
  currentTab: 'analytics',
  students: [],
  classes: [],
  modules: [],
  questions: [],
  analyticsData: null,
  settings: {},

  async init() {
    this.token = localStorage.getItem('operator_token');
    if (this.token) {
      const ok = await this.fetchMe();
      if (ok) {
        this.renderDashboard();
        this.switchTab('analytics');
        return;
      }
    }
    this.renderLogin();
  },

  async fetchMe() {
    try {
      const res = await fetch('/api/operator/me', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.operator = data.operator;
        return true;
      } else {
        localStorage.removeItem('operator_token');
        return false;
      }
    } catch (e) {
      return false;
    }
  },

  renderLogin() {
    const root = document.getElementById('operator-root');
    root.innerHTML = `
      <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
          <div class="text-center space-y-2">
            <div class="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
              🔐
            </div>
            <h2 class="text-2xl font-fun font-bold text-slate-800">Portal Masuk Operator / Guru</h2>
            <p class="text-xs text-slate-500">Kelola akun siswa, materi slide Storyline, bank soal, dan laporan nilai.</p>
          </div>

          <div id="op-login-error" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold"></div>

          <form onsubmit="window.operatorApp.handleLogin(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Username Operator:</label>
              <input type="text" id="op-user" required value="Ananta" placeholder="Contoh: Ananta" class="w-full text-sm font-semibold p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Kata Sandi (Password):</label>
              <input type="password" id="op-pass" required value="12345" placeholder="•••••" class="w-full text-sm font-semibold p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
            </div>

            <button type="submit" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow transition">
              Masuk Dashboard Operator 🚀
            </button>
          </form>

          <div class="pt-4 border-t border-slate-100 text-center">
            <a href="/" class="text-xs text-indigo-600 font-bold hover:underline">⬅️ Kembali ke Portal Pembelajaran Siswa</a>
          </div>
        </div>
      </div>
    `;
  },

  async handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('op-user').value.trim();
    const p = document.getElementById('op-pass').value.trim();
    const errBox = document.getElementById('op-login-error');

    try {
      const res = await fetch('/api/operator/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('operator_token', data.token);
        this.token = data.token;
        this.operator = data.operator;
        this.renderDashboard();
        this.switchTab('analytics');
      } else {
        errBox.innerText = data.detail || "Gagal masuk operator.";
        errBox.classList.remove('hidden');
      }
    } catch (err) {
      errBox.innerText = "Gagal terhubung ke server.";
      errBox.classList.remove('hidden');
    }
  },

  logout() {
    if (confirm("Keluar dari dashboard operator?")) {
      localStorage.removeItem('operator_token');
      this.token = null;
      this.operator = null;
      this.renderLogin();
    }
  },

  renderDashboard() {
    const root = document.getElementById('operator-root');
    root.innerHTML = `
      <div class="min-h-screen bg-slate-50 flex flex-col">
        <!-- Top Navbar -->
        <header class="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow">
              ⚙️
            </div>
            <div>
              <h1 class="font-fun font-bold text-base text-slate-800">Panel Operator & Guru Sains</h1>
              <p class="text-[11px] text-slate-500">Operator: <b class="text-indigo-600">${this.operator?.full_name || 'Ananta'}</b></p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <a href="/" target="_blank" class="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1">
              <span>🌐</span> Buka Tampilan Siswa
            </a>
            <button onclick="window.operatorApp.logout()" class="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold flex items-center gap-1 border border-red-200">
              <span>🚪</span> Keluar
            </button>
          </div>
        </header>

        <div class="flex-grow flex flex-col md:flex-row">
          <!-- Sidebar Navigation -->
          <aside class="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-1 shrink-0">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">Menu Utama</span>
            
            <button onclick="window.operatorApp.switchTab('analytics')" id="tab-btn-analytics" class="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition">
              <span>📊</span> Laporan Nilai & Rapor
            </button>
            <button onclick="window.operatorApp.switchTab('students')" id="tab-btn-students" class="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition">
              <span>👥</span> Manajemen Akun Siswa
            </button>
            <button onclick="window.operatorApp.switchTab('modules')" id="tab-btn-modules" class="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition">
              <span>📖</span> Materi & Slide Storyline
            </button>
            <button onclick="window.operatorApp.switchTab('questions')" id="tab-btn-questions" class="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition">
              <span>📝</span> Bank Soal Evaluasi
            </button>
            <button onclick="window.operatorApp.switchTab('settings')" id="tab-btn-settings" class="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition">
              <span>⚙️</span> Pengaturan Media
            </button>
          </aside>

          <!-- Main Workspace -->
          <main id="op-content" class="flex-grow p-6 overflow-y-auto"></main>
        </div>
      </div>

      <!-- Modal Container -->
      <div id="op-modal-container"></div>
    `;
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    ['analytics', 'students', 'modules', 'questions', 'settings'].forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}`);
      if (btn) {
        if (t === tabName) {
          btn.className = "w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 bg-indigo-50 text-indigo-700 shadow-sm";
        } else {
          btn.className = "w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 text-slate-600 hover:bg-slate-100 transition";
        }
      }
    });

    const mount = document.getElementById('op-content');
    if (!mount) return;

    switch (tabName) {
      case 'analytics':
        this.renderAnalyticsTab(mount);
        break;
      case 'students':
        this.renderStudentsTab(mount);
        break;
      case 'modules':
        this.renderModulesTab(mount);
        break;
      case 'questions':
        this.renderQuestionsTab(mount);
        break;
      case 'settings':
        this.renderSettingsTab(mount);
        break;
    }
  },

  /* ---------------- TAB 1: ANALYTICS & GRADEBOOK ---------------- */
  async renderAnalyticsTab(mount) {
    mount.innerHTML = `<div class="p-8 text-center text-slate-500 font-bold">Memuat Analisis Hasil Belajar...</div>`;

    try {
      const res = await fetch('/api/operator/analytics', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await res.json();
      this.analyticsData = data;
      const sum = data.summary;
      const reports = data.reports;

      mount.innerHTML = `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-fun font-bold text-slate-800">Laporan Hasil Belajar Siswa</h2>
              <p class="text-xs text-slate-500">Perbandingan nilai pre-test & post-test, progres materi, dan ketuntasan lab.</p>
            </div>
            <a href="/api/operator/analytics/export-csv" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5">
              <span>📥</span> Ekspor Rapor ke CSV
            </a>
          </div>

          <!-- 4 Summary Metric Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span class="text-[10px] font-bold text-slate-400 uppercase block">Total Siswa Aktif</span>
              <span class="text-2xl font-fun font-bold text-slate-800">${sum.total_students} Siswa</span>
            </div>
            <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span class="text-[10px] font-bold text-amber-600 uppercase block">Rata-rata Pre-Test</span>
              <span class="text-2xl font-fun font-bold text-amber-700">${sum.avg_pretest}</span>
              <span class="text-[10px] text-slate-400 block">${sum.pretest_takers} peserta</span>
            </div>
            <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span class="text-[10px] font-bold text-purple-600 uppercase block">Rata-rata Post-Test</span>
              <span class="text-2xl font-fun font-bold text-purple-700">${sum.avg_posttest}</span>
              <span class="text-[10px] text-slate-400 block">${sum.posttest_takers} peserta</span>
            </div>
            <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span class="text-[10px] font-bold text-green-600 uppercase block">Peningkatan Kelas</span>
              <span class="text-2xl font-fun font-bold text-green-700">+${sum.class_gain} Poin</span>
              <span class="text-[10px] text-green-600 font-bold block">Peningkatan Positif ✨</span>
            </div>
          </div>

          <!-- Gradebook Table -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th class="p-3.5">NIM</th>
                    <th class="p-3.5">Nama Siswa</th>
                    <th class="p-3.5">Kelas</th>
                    <th class="p-3.5">Pre-test</th>
                    <th class="p-3.5">Post-test</th>
                    <th class="p-3.5">Peningkatan</th>
                    <th class="p-3.5">Progres Slide</th>
                    <th class="p-3.5">Skor Game</th>
                    <th class="p-3.5">Lab Air</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  ${reports.map(r => `
                    <tr class="hover:bg-slate-50/70">
                      <td class="p-3.5 font-bold text-indigo-600">${r.nim}</td>
                      <td class="p-3.5 font-bold">${r.full_name}</td>
                      <td class="p-3.5">${r.class_name}</td>
                      <td class="p-3.5 font-bold text-amber-700">${r.pretest !== null ? r.pretest : '-'}</td>
                      <td class="p-3.5 font-bold text-purple-700">${r.posttest !== null ? r.posttest : '-'}</td>
                      <td class="p-3.5 font-bold ${r.delta > 0 ? 'text-green-600' : (r.delta < 0 ? 'text-red-600' : 'text-slate-400')}">
                        ${r.delta !== null ? (r.delta > 0 ? `+${r.delta}` : r.delta) : '-'}
                      </td>
                      <td class="p-3.5">
                        <div class="flex items-center gap-2">
                          <span class="font-bold">${r.progress_percent}%</span>
                          <div class="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-blue-500 h-1.5" style="width: ${r.progress_percent}%;"></div>
                          </div>
                        </div>
                      </td>
                      <td class="p-3.5 font-bold">${r.game_score}</td>
                      <td class="p-3.5">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${r.lab_completed ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}">
                          ${r.lab_completed ? '✅ Tuntas' : '⏳ Belum'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      mount.innerHTML = `<div class="p-6 text-center text-red-600 font-bold">Gagal memuat analitik.</div>`;
    }
  },

  /* ---------------- TAB 2: STUDENT MANAGEMENT ---------------- */
  async renderStudentsTab(mount) {
    mount.innerHTML = `<div class="p-8 text-center text-slate-500 font-bold">Memuat Data Siswa...</div>`;

    try {
      const res = await fetch('/api/operator/students', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await res.json();
      this.students = data.students;
      this.classes = data.classes;

      mount.innerHTML = `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-fun font-bold text-slate-800">Manajemen Akun Siswa</h2>
              <p class="text-xs text-slate-500">Tambah siswa, ubah kelas, reset PIN, atau buat akun massal.</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="window.operatorApp.openBatchStudentModal()" class="px-3.5 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl text-xs font-bold">
                ⚡ Buat Akun Massal
              </button>
              <button onclick="window.operatorApp.openCreateStudentModal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1">
                <span>➕</span> Tambah Siswa Baru
              </button>
            </div>
          </div>

          <!-- Search & Filter Controls -->
          <div class="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
            <input type="text" id="student-search-input" oninput="window.operatorApp.filterStudents()" placeholder="Cari berdasarkan nama atau NIM..." class="text-xs p-2.5 rounded-xl border border-slate-200 w-full sm:w-64 focus:outline-none focus:border-indigo-500">
            
            <div class="flex items-center gap-2">
              <a href="/api/operator/students/export-csv" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">
                📥 Ekspor CSV
              </a>
              <label class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">
                📤 Impor CSV
                <input type="file" accept=".csv" onchange="window.operatorApp.importCsv(this)" class="hidden">
              </label>
            </div>
          </div>

          <!-- Students List Table -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th class="p-3.5">NIM</th>
                    <th class="p-3.5">Nama Lengkap</th>
                    <th class="p-3.5">Kelas</th>
                    <th class="p-3.5">Status Akun</th>
                    <th class="p-3.5">Login Terakhir</th>
                    <th class="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody id="student-table-body" class="divide-y divide-slate-100 text-slate-700">
                  ${this.renderStudentRows(this.students)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      mount.innerHTML = `<div class="p-6 text-center text-red-600 font-bold">Gagal memuat siswa.</div>`;
    }
  },

  renderStudentRows(list) {
    if (!list || list.length === 0) {
      return `<tr><td colspan="6" class="p-6 text-center text-slate-400">Tidak ada data siswa.</td></tr>`;
    }
    return list.map(s => `
      <tr class="hover:bg-slate-50/70">
        <td class="p-3.5 font-bold text-indigo-600">${s.nim}</td>
        <td class="p-3.5 font-bold">${s.full_name}</td>
        <td class="p-3.5">${s.class_name}</td>
        <td class="p-3.5">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
            ${s.is_active ? 'Aktif' : 'Nonaktif'}
          </span>
        </td>
        <td class="p-3.5 text-slate-500">${s.last_login || '-'}</td>
        <td class="p-3.5 text-right space-x-2">
          <button onclick="window.operatorApp.openEditStudentModal(${s.id})" class="text-xs text-indigo-600 font-bold hover:underline">Edit / Reset PIN</button>
          <button onclick="window.operatorApp.deleteStudent(${s.id}, '${s.full_name}')" class="text-xs text-red-600 font-bold hover:underline">Hapus</button>
        </td>
      </tr>
    `).join('');
  },

  filterStudents() {
    const q = document.getElementById('student-search-input').value.toLowerCase();
    const filtered = this.students.filter(s => s.full_name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q));
    document.getElementById('student-table-body').innerHTML = this.renderStudentRows(filtered);
  },

  openCreateStudentModal() {
    const container = document.getElementById('op-modal-container');
    container.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border space-y-4">
          <h3 class="font-fun text-lg font-bold text-slate-800">Tambah Akun Siswa Baru</h3>
          
          <form onsubmit="window.operatorApp.saveNewStudent(event)" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">NIM / Nomor Induk Siswa:</label>
              <input type="text" id="new-nim" required placeholder="Contoh: SD2026006" class="w-full text-xs p-2.5 rounded-xl border uppercase">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa:</label>
              <input type="text" id="new-name" required placeholder="Contoh: Rian Hidayat" class="w-full text-xs p-2.5 rounded-xl border">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Kelas:</label>
              <input type="text" id="new-class" required value="Kelas 4 SD" class="w-full text-xs p-2.5 rounded-xl border">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">PIN Awal (4 angka):</label>
              <input type="text" id="new-pin" required value="1234" class="w-full text-xs p-2.5 rounded-xl border tracking-widest">
            </div>

            <div class="pt-3 flex items-center justify-end gap-2">
              <button type="button" onclick="document.getElementById('op-modal-container').innerHTML=''" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Batal</button>
              <button type="submit" class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow">Simpan Akun Siswa</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async saveNewStudent(e) {
    e.preventDefault();
    const nim = document.getElementById('new-nim').value.trim();
    const name = document.getElementById('new-name').value.trim();
    const cls = document.getElementById('new-class').value.trim();
    const pin = document.getElementById('new-pin').value.trim();

    try {
      const res = await fetch('/api/operator/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ nim, full_name: name, class_name: cls, pin, is_active: 1 })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        document.getElementById('op-modal-container').innerHTML = '';
        this.renderStudentsTab(document.getElementById('op-content'));
      } else {
        alert(data.detail || "Gagal menambah siswa.");
      }
    } catch (e) {
      alert("Terjadi kesalahan.");
    }
  },

  openEditStudentModal(studentId) {
    const s = this.students.find(x => x.id === studentId);
    if (!s) return;

    const container = document.getElementById('op-modal-container');
    container.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border space-y-4">
          <h3 class="font-fun text-lg font-bold text-slate-800">Edit Siswa: ${s.full_name} (${s.nim})</h3>
          
          <form onsubmit="window.operatorApp.saveEditStudent(event, ${s.id})" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap:</label>
              <input type="text" id="edit-name" required value="${s.full_name}" class="w-full text-xs p-2.5 rounded-xl border">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Kelas:</label>
              <input type="text" id="edit-class" required value="${s.class_name}" class="w-full text-xs p-2.5 rounded-xl border">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Reset PIN (Kosongkan jika tidak diubah):</label>
              <input type="text" id="edit-pin" placeholder="Masukkan PIN baru jika ingin reset..." class="w-full text-xs p-2.5 rounded-xl border">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Status Akun:</label>
              <select id="edit-active" class="w-full text-xs p-2.5 rounded-xl border">
                <option value="1" ${s.is_active ? 'selected' : ''}>Aktif</option>
                <option value="0" ${!s.is_active ? 'selected' : ''}>Nonaktif</option>
              </select>
            </div>

            <div class="pt-3 flex items-center justify-end gap-2">
              <button type="button" onclick="document.getElementById('op-modal-container').innerHTML=''" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Batal</button>
              <button type="submit" class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow">Perbarui Data</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async saveEditStudent(e, studentId) {
    e.preventDefault();
    const name = document.getElementById('edit-name').value.trim();
    const cls = document.getElementById('edit-class').value.trim();
    const pin = document.getElementById('edit-pin').value.trim();
    const active = parseInt(document.getElementById('edit-active').value);

    try {
      const res = await fetch(`/api/operator/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          full_name: name,
          class_name: cls,
          pin: pin || null,
          is_active: active
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        document.getElementById('op-modal-container').innerHTML = '';
        this.renderStudentsTab(document.getElementById('op-content'));
      } else {
        alert(data.detail);
      }
    } catch (e) {
      alert("Gagal memperbarui.");
    }
  },

  async deleteStudent(studentId, name) {
    if (confirm(`Yakin ingin menghapus akun siswa ${name}? Semua nilai dan lencana siswa ini akan ikut terhapus.`)) {
      try {
        const res = await fetch(`/api/operator/students/${studentId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        const data = await res.json();
        alert(data.message);
        this.renderStudentsTab(document.getElementById('op-content'));
      } catch (e) {
        alert("Gagal menghapus.");
      }
    }
  },

  openBatchStudentModal() {
    const container = document.getElementById('op-modal-container');
    container.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border space-y-4">
          <h3 class="font-fun text-lg font-bold text-slate-800">Buat Akun Siswa Massal</h3>
          <p class="text-xs text-slate-500">Sistem akan secara otomatis membuat N akun siswa dengan nomor urut NIM.</p>

          <form onsubmit="window.operatorApp.saveBatchStudents(event)" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nama Kelas:</label>
              <input type="text" id="batch-class" required value="Kelas 4C" class="w-full text-xs p-2.5 rounded-xl border">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Jumlah Akun yang Dibuat:</label>
              <input type="number" id="batch-count" min="1" max="50" required value="10" class="w-full text-xs p-2.5 rounded-xl border">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Awalan NIM (Prefix):</label>
              <input type="text" id="batch-prefix" required value="SD" class="w-full text-xs p-2.5 rounded-xl border uppercase">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">PIN Default:</label>
              <input type="text" id="batch-pin" required value="1234" class="w-full text-xs p-2.5 rounded-xl border">
            </div>

            <div class="pt-3 flex items-center justify-end gap-2">
              <button type="button" onclick="document.getElementById('op-modal-container').innerHTML=''" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Batal</button>
              <button type="submit" class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow">Proses Buat Akun</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async saveBatchStudents(e) {
    e.preventDefault();
    const cls = document.getElementById('batch-class').value.trim();
    const count = parseInt(document.getElementById('batch-count').value);
    const prefix = document.getElementById('batch-prefix').value.trim();
    const pin = document.getElementById('batch-pin').value.trim();

    try {
      const res = await fetch('/api/operator/students/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ class_name: cls, count: count, prefix: prefix, default_pin: pin })
      });
      const data = await res.json();
      alert(data.message);
      document.getElementById('op-modal-container').innerHTML = '';
      this.renderStudentsTab(document.getElementById('op-content'));
    } catch (e) {
      alert("Gagal memproses pembuatan massal.");
    }
  },

  async importCsv(input) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/operator/students/import-csv', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` },
        body: formData
      });
      const data = await res.json();
      alert(data.message);
      this.renderStudentsTab(document.getElementById('op-content'));
    } catch (e) {
      alert("Gagal mengimpor CSV.");
    }
  },

  /* ---------------- TAB 3: MODULES & STORYLINE SLIDES ---------------- */
  async renderModulesTab(mount) {
    mount.innerHTML = `<div class="p-8 text-center text-slate-500 font-bold">Memuat Kurikulum & Slide...</div>`;

    try {
      const res = await fetch('/api/operator/modules', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await res.json();
      this.modules = data.modules;

      mount.innerHTML = `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-fun font-bold text-slate-800">Manajemen Materi & Slide Storyline</h2>
              <p class="text-xs text-slate-500">Edit slide interaktif tanpa menyentuh kode program.</p>
            </div>
            <button onclick="alert('Bab materi sains default sudah aktif. Anda dapat mengedit slide di bawah!')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow">
              Bab Sains Aktif (7 Slide)
            </button>
          </div>

          <div class="space-y-4">
            ${this.modules.map(m => `
              <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full uppercase">${m.code}</span>
                    <h3 class="font-fun text-lg font-bold text-slate-800 mt-1">${m.title}</h3>
                    <p class="text-xs text-slate-500">${m.description}</p>
                  </div>
                  <span class="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
                    Dipublikasikan (${m.slide_count} Slide)
                  </span>
                </div>

                <div class="pt-3 border-t flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-600">Daftar Slide Interaktif:</span>
                  <button onclick="window.operatorApp.loadSlidesForModule(${m.id})" class="text-xs font-bold text-indigo-600 hover:underline">
                    Buka Editor Slide Storyline ➡️
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <div id="slides-editor-section" class="pt-4"></div>
        </div>
      `;

      if (this.modules.length > 0) {
        this.loadSlidesForModule(this.modules[0].id);
      }
    } catch (e) {
      mount.innerHTML = `<div class="p-6 text-center text-red-600 font-bold">Gagal memuat materi.</div>`;
    }
  },

  async loadSlidesForModule(moduleId) {
    const sec = document.getElementById('slides-editor-section');
    if (!sec) return;
    sec.innerHTML = `<div class="p-4 text-center text-xs text-slate-400 font-bold">Memuat daftar slide...</div>`;

    try {
      const res = await fetch(`/api/operator/slides/${moduleId}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await res.json();
      const slides = data.slides;

      sec.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div class="flex items-center justify-between border-b pb-3">
            <h4 class="font-fun font-bold text-base text-slate-800">Daftar Slide Interaktif (${slides.length} Slide)</h4>
            <span class="text-xs text-slate-500">Tipe: Standard, Hotspot, DragDrop, Checkpoint, Summary</span>
          </div>

          <div class="space-y-3">
            ${slides.map((s, idx) => `
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                    ${idx + 1}
                  </span>
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Tipe: ${s.slide_type}
                    </span>
                    <h5 class="font-bold text-sm text-slate-800 mt-0.5">${s.title}</h5>
                    <p class="text-xs text-slate-500 line-clamp-1">${s.content}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold text-slate-400">Order: ${s.order_index}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (e) {
      sec.innerHTML = `<div class="text-red-600 text-xs font-bold">Gagal memuat slide.</div>`;
    }
  },

  /* ---------------- TAB 4: QUESTION BANK ---------------- */
  async renderQuestionsTab(mount) {
    mount.innerHTML = `<div class="p-8 text-center text-slate-500 font-bold">Memuat Bank Soal...</div>`;

    try {
      const res = await fetch('/api/operator/questions', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await res.json();
      this.questions = data.questions;

      mount.innerHTML = `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-fun font-bold text-slate-800">Bank Soal Evaluasi SD</h2>
              <p class="text-xs text-slate-500">Kelola soal Pre-test dan Post-test beserta kunci jawaban dan pembahasan.</p>
            </div>
            <button onclick="window.operatorApp.openCreateQuestionModal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1">
              <span>➕</span> Tambah Soal Baru
            </button>
          </div>

          <!-- Questions Table -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th class="p-3.5">Tipe Ujian</th>
                    <th class="p-3.5">Topik</th>
                    <th class="p-3.5">Teks Soal</th>
                    <th class="p-3.5">Kunci Jawaban</th>
                    <th class="p-3.5">Bobot Poin</th>
                    <th class="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  ${this.questions.map(q => `
                    <tr class="hover:bg-slate-50/70">
                      <td class="p-3.5">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${q.test_type === 'pretest' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}">
                          ${q.test_type}
                        </span>
                      </td>
                      <td class="p-3.5 font-bold">${q.topic}</td>
                      <td class="p-3.5 max-w-sm line-clamp-2">${q.question_text}</td>
                      <td class="p-3.5 font-bold text-green-700">${q.correct_answer}</td>
                      <td class="p-3.5 font-bold">${q.points} Poin</td>
                      <td class="p-3.5 text-right">
                        <button onclick="window.operatorApp.deleteQuestion(${q.id})" class="text-xs text-red-600 font-bold hover:underline">Hapus</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      mount.innerHTML = `<div class="p-6 text-center text-red-600 font-bold">Gagal memuat soal.</div>`;
    }
  },

  openCreateQuestionModal() {
    const container = document.getElementById('op-modal-container');
    container.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4">
          <h3 class="font-fun text-lg font-bold text-slate-800">Tambah Soal Evaluasi Baru</h3>
          
          <form onsubmit="window.operatorApp.saveNewQuestion(event)" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Tipe Pengujian:</label>
                <select id="q-type" class="w-full text-xs p-2.5 rounded-xl border">
                  <option value="posttest">Post-test (Evaluasi Akhir)</option>
                  <option value="pretest">Pre-test (Pengujian Awal)</option>
                  <option value="both">Keduanya (Pre & Post)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Topik Sains:</label>
                <input type="text" id="q-topic" required value="Wujud Benda & Siklus Air" class="w-full text-xs p-2.5 rounded-xl border">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Pertanyaan:</label>
              <textarea id="q-text" rows="3" required placeholder="Tuliskan pertanyaan soal untuk anak SD..." class="w-full text-xs p-2.5 rounded-xl border"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <input type="text" id="q-opt-a" required placeholder="Pilihan A" class="text-xs p-2 rounded-xl border">
              <input type="text" id="q-opt-b" required placeholder="Pilihan B" class="text-xs p-2 rounded-xl border">
              <input type="text" id="q-opt-c" required placeholder="Pilihan C" class="text-xs p-2 rounded-xl border">
              <input type="text" id="q-opt-d" required placeholder="Pilihan D" class="text-xs p-2 rounded-xl border">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Kunci Jawaban Benar:</label>
                <select id="q-key" class="w-full text-xs p-2.5 rounded-xl border font-bold">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Bobot Poin:</label>
                <input type="number" id="q-points" required value="10" class="w-full text-xs p-2.5 rounded-xl border">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Pembahasan Jawaban (Penjelasan):</label>
              <textarea id="q-expl" rows="2" placeholder="Penjelasan mengapa jawaban tersebut benar..." class="w-full text-xs p-2.5 rounded-xl border"></textarea>
            </div>

            <div class="pt-3 flex items-center justify-end gap-2">
              <button type="button" onclick="document.getElementById('op-modal-container').innerHTML=''" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Batal</button>
              <button type="submit" class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow">Simpan Soal</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async saveNewQuestion(e) {
    e.preventDefault();
    const type = document.getElementById('q-type').value;
    const topic = document.getElementById('q-topic').value.trim();
    const text = document.getElementById('q-text').value.trim();
    const opts = [
      document.getElementById('q-opt-a').value.trim(),
      document.getElementById('q-opt-b').value.trim(),
      document.getElementById('q-opt-c').value.trim(),
      document.getElementById('q-opt-d').value.trim()
    ];
    const key = document.getElementById('q-key').value;
    const pts = parseInt(document.getElementById('q-points').value) || 10;
    const expl = document.getElementById('q-expl').value.trim();

    try {
      const res = await fetch('/api/operator/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          test_type: type,
          topic: topic,
          question_text: text,
          options: opts,
          correct_answer: key,
          points: pts,
          explanation: expl,
          is_active: 1
        })
      });
      const data = await res.json();
      alert(data.message);
      document.getElementById('op-modal-container').innerHTML = '';
      this.renderQuestionsTab(document.getElementById('op-content'));
    } catch (e) {
      alert("Gagal menyimpan soal.");
    }
  },

  async deleteQuestion(qid) {
    if (confirm("Hapus soal ini dari bank soal?")) {
      try {
        const res = await fetch(`/api/operator/questions/${qid}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        const data = await res.json();
        alert(data.message);
        this.renderQuestionsTab(document.getElementById('op-content'));
      } catch (e) {
        alert("Gagal menghapus.");
      }
    }
  },

  /* ---------------- TAB 5: MEDIA SETTINGS ---------------- */
  async renderSettingsTab(mount) {
    mount.innerHTML = `<div class="p-8 text-center text-slate-500 font-bold">Memuat Pengaturan...</div>`;

    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      const s = data.settings || {};

      mount.innerHTML = `
        <div class="max-w-2xl space-y-6">
          <div>
            <h2 class="text-xl font-fun font-bold text-slate-800">Pengaturan Identitas Media Pembelajaran</h2>
            <p class="text-xs text-slate-500">Sesuaikan judul, nama sekolah, dan tema tampilan aplikasi.</p>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Judul Media Pembelajaran:</label>
              <input type="text" id="set-title" value="${s.app_title || ''}" class="w-full text-xs p-2.5 rounded-xl border">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nama Sekolah / Instansi:</label>
              <input type="text" id="set-school" value="${s.school_name || ''}" class="w-full text-xs p-2.5 rounded-xl border">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Pesan Sambutan Siswa:</label>
              <input type="text" id="set-banner" value="${s.welcome_banner || ''}" class="w-full text-xs p-2.5 rounded-xl border">
            </div>

            <button onclick="window.operatorApp.saveSettings()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow">
              💾 Simpan Pengaturan Media
            </button>
          </div>
        </div>
      `;
    } catch (e) {
      mount.innerHTML = `<div class="text-red-600 text-xs font-bold">Gagal memuat pengaturan.</div>`;
    }
  },

  async saveSettings() {
    const title = document.getElementById('set-title').value.trim();
    const school = document.getElementById('set-school').value.trim();
    const banner = document.getElementById('set-banner').value.trim();

    try {
      const res = await fetch('/api/operator/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          settings: {
            app_title: title,
            school_name: school,
            welcome_banner: banner
          }
        })
      });
      const data = await res.json();
      alert(data.message);
    } catch (e) {
      alert("Gagal menyimpan.");
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.operatorApp.init();
});
