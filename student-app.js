/**
 * Student Portal Single Page Application Orchestrator
 * Controls navigation among the 8 core learning menus, authentication, and state.
 */

window.studentApp = {
  currentView: 'login',
  student: null,
  stats: null,
  badges: [],
  settings: {},

  async init() {
    try {
      await this.loadSettings();

      const token = localStorage.getItem('student_token');
      if (token) {
        const ok = await this.fetchProfile();
        if (ok) {
          this.navigate('dashboard');
          return;
        }
      }
      this.navigate('login');
    } catch (err) {
      console.warn("Init fallback to login:", err);
      this.navigate('login');
    }
  },

  async loadSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      this.settings = data.settings || {};
    } catch (e) {
      console.warn("Failed loading public settings", e);
    }
  },

  async fetchProfile() {
    const token = localStorage.getItem('student_token');
    if (!token) return false;
    try {
      const res = await fetch('/api/student/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.student = data.student;
        this.stats = data.stats;
        this.badges = data.badges;
        return true;
      } else {
        localStorage.removeItem('student_token');
        return false;
      }
    } catch (e) {
      return false;
    }
  },

  navigate(viewName) {
    window.sound.playClick();
    this.currentView = viewName;
    this.renderHeader();

    const mainContainer = document.getElementById('app-main-content');
    if (!mainContainer) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (viewName) {
      case 'login':
        this.renderLogin(mainContainer);
        break;
      case 'dashboard':
        this.renderDashboard(mainContainer);
        break;
      case 'guide':
        this.renderGuide(mainContainer);
        break;
      case 'pretest':
        this.renderPretest(mainContainer);
        break;
      case 'profile':
        this.renderProfile(mainContainer);
        break;
      case 'materi':
        this.renderMateri(mainContainer);
        break;
      case 'experiment':
        this.renderExperiment(mainContainer);
        break;
      case 'conclusion':
        this.renderConclusion(mainContainer);
        break;
      case 'posttest':
        this.renderPosttest(mainContainer);
        break;
      case 'games':
        this.renderGames(mainContainer);
        break;
      default:
        this.renderDashboard(mainContainer);
    }
  },

  renderHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    const isLoggedIn = !!this.student && this.currentView !== 'login';
    const isMuted = window.sound ? window.sound.isMuted : false;

    headerContainer.innerHTML = `
      <header class="bg-white/90 backdrop-blur-md border-b-2 border-sky-100 sticky top-0 z-40 px-4 md:px-8 py-3">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          
          <!-- Logo & Brand -->
          <div onclick="${isLoggedIn ? "window.studentApp.navigate('dashboard')" : "window.studentApp.navigate('login')"}" class="flex items-center gap-3 cursor-pointer">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white text-2xl shadow-md border-2 border-white">
              🚀
            </div>
            <div>
              <h1 class="font-fun text-lg md:text-xl font-bold text-sky-900 leading-tight">
                ${this.settings.app_title || 'Petualangan Sains Ceria SD'}
              </h1>
              <p class="text-[11px] font-semibold text-slate-500">${this.settings.school_name || 'SD Unggulan Nusantara'}</p>
            </div>
          </div>

          <!-- Sound & User Controls -->
          <div class="flex items-center gap-3">
            
            <!-- Sound Audio Controls Toggle -->
            <div class="relative">
              <button onclick="window.studentApp.toggleSoundPopup()" class="btn-fun bg-amber-100 hover:bg-amber-200 text-amber-900 p-2.5 rounded-2xl flex items-center gap-1.5 text-xs font-bold border border-amber-300">
                <span id="sound-btn-icon">${isMuted ? '🔇' : '🎵'}</span>
                <span class="hidden sm:inline">Musik & Suara</span>
              </button>

              <!-- Sound Control Popover Modal -->
              <div id="sound-popover" class="hidden absolute right-0 mt-2 w-64 comic-card p-4 bg-white z-50 shadow-2xl border-2 border-amber-300">
                <div class="flex items-center justify-between pb-2 border-b">
                  <h4 class="font-fun font-bold text-xs text-amber-900">Pengaturan Suara</h4>
                  <button onclick="window.studentApp.toggleMuteFromUI()" class="text-xs font-bold ${isMuted ? 'text-red-600' : 'text-green-600'}">
                    ${isMuted ? 'Suara Mati 🔇' : 'Suara Nyala 🔊'}
                  </button>
                </div>
                <div class="space-y-3 pt-3">
                  <div>
                    <label class="text-[11px] font-bold text-slate-600 block mb-1">Volume Musik Latar (BGM):</label>
                    <input type="range" min="0" max="100" value="${Math.round((window.sound ? window.sound.bgmVolume : 0.25) * 100)}" oninput="window.sound.setBgmVolume(this.value / 100)" class="w-full accent-amber-500 cursor-pointer">
                  </div>
                  <div>
                    <label class="text-[11px] font-bold text-slate-600 block mb-1">Volume Efek Suara (SFX):</label>
                    <input type="range" min="0" max="100" value="${Math.round((window.sound ? window.sound.sfxVolume : 0.70) * 100)}" oninput="window.sound.setSfxVolume(this.value / 100)" class="w-full accent-blue-500 cursor-pointer">
                  </div>
                  <button onclick="window.sound.startBgm()" class="btn-fun btn-fun-amber w-full py-1.5 rounded-xl font-bold text-[11px]">
                    ▶️ Mulai Putar Musik
                  </button>
                </div>
              </div>
            </div>

            ${isLoggedIn ? `
              <!-- Student Profile Pill -->
              <div onclick="window.studentApp.navigate('profile')" class="flex items-center gap-2 bg-sky-50 border-2 border-sky-200 hover:border-sky-400 px-3 py-1.5 rounded-2xl cursor-pointer transition">
                <span class="text-2xl">${this.getAvatarEmoji(this.student.avatar)}</span>
                <div class="hidden sm:block text-left">
                  <span class="font-fun text-xs font-bold text-slate-800 block">${this.student.full_name.split(' ')[0]}</span>
                  <span class="text-[10px] text-sky-600 font-bold">${this.student.class_name}</span>
                </div>
              </div>

              <button onclick="window.studentApp.logout()" class="btn-fun bg-red-100 hover:bg-red-200 text-red-700 p-2.5 rounded-2xl font-bold text-xs" title="Keluar">
                🚪
              </button>
            ` : `
              <a href="operator.html" class="btn-fun bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 border border-slate-300">
                <span>🔐</span> Portal Operator
              </a>
            `}

          </div>
        </div>
      </header>
    `;
  },

  toggleSoundPopup() {
    window.sound.playClick();
    const p = document.getElementById('sound-popover');
    if (p) p.classList.toggle('hidden');
  },

  toggleMuteFromUI() {
    const isMuted = window.sound.toggleMute();
    const icon = document.getElementById('sound-btn-icon');
    if (icon) icon.innerText = isMuted ? '🔇' : '🎵';
    this.renderHeader();
  },

  getAvatarEmoji(code) {
    const map = {
      astronaut: '🧑‍🚀',
      boy_glasses: '👦',
      girl_hijab: '🧕',
      boy_sporty: '🧢',
      girl_smile: '👧',
      scientist_kid: '🔬',
      cat_pilot: '🐱',
      robot_buddy: '🤖'
    };
    return map[code] || '🧑‍🚀';
  },

  /* =========================================================================
     1. LOGIN SISWA
     ========================================================================= */
  renderLogin(container) {
    container.innerHTML = `
      <div class="min-h-[80vh] flex items-center justify-center py-10 px-4">
        <div class="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <!-- Cheerful Welcome Illustration (5 cols) -->
          <div class="md:col-span-5 text-center md:text-left space-y-4">
            <span class="bg-sky-100 text-sky-800 text-xs font-bold px-3.5 py-1.5 rounded-full inline-block shadow-sm">
              ✨ Media Pembelajaran Interaktif SD
            </span>
            <h2 class="text-3xl md:text-4xl font-fun font-bold text-slate-800 leading-tight">
              Belajar Sains Jadi Sangat <span class="text-sky-600 underline decoration-amber-400 decoration-wavy">Seru & Ceria!</span>
            </h2>
            <p class="text-slate-600 text-sm leading-relaxed">
              Jelajahi wujud benda, ikuti petualangan tetesan air, lakukan eksperimen laboratorium virtual, dan raih bintang emas!
            </p>

            <div class="p-4 rounded-3xl bg-white border-2 border-sky-200 shadow-sm flex items-center gap-3">
              <span class="text-4xl animate-bounce-gentle">🧑‍🔬</span>
              <div class="text-xs text-left">
                <b class="text-sky-900 block font-fun">Karakter Edukasi: Prof. Kiki</b>
                <span class="text-slate-500">"Siapkah kamu menjadi penjelajah sains hebat hari ini?"</span>
              </div>
            </div>

            <!-- Demo Mode Helper Card -->
            <div class="comic-card p-4 bg-amber-50 border-amber-300">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <span>⚡</span> Akun Coba Instan (Mode Demo)
                </span>
                <span class="text-[9px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">1-Klik Masuk</span>
              </div>
              <p class="text-[11px] text-amber-800 mb-2">Klik nama siswa di bawah untuk langsung mencoba login:</p>
              <div class="flex flex-wrap gap-1.5">
                <button onclick="window.studentApp.quickLogin('SD2026001', 'Ahmad Faiz Pratama', '1234')" class="text-[11px] font-bold bg-white hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl text-amber-900">
                  👦 Ahmad (SD2026001)
                </button>
                <button onclick="window.studentApp.quickLogin('SD2026002', 'Siti Nur Azizah', '1234')" class="text-[11px] font-bold bg-white hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl text-amber-900">
                  🧕 Siti (SD2026002)
                </button>
                <button onclick="window.studentApp.quickLogin('SD2026003', 'Budi Wicaksono', '1234')" class="text-[11px] font-bold bg-white hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl text-amber-900">
                  🧢 Budi (SD2026003)
                </button>
              </div>
            </div>
          </div>

          <!-- Student Login Form Card (7 cols) -->
          <div class="md:col-span-7">
            <div class="comic-card p-8 md:p-10 border-sky-300 shadow-2xl relative bg-white">
              
              <div class="text-center mb-6">
                <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white text-3xl flex items-center justify-center mx-auto mb-3 shadow-md animate-float">
                  🎒
                </div>
                <h3 class="text-2xl font-fun font-bold text-slate-800">Masuk Akun Siswa</h3>
                <p class="text-xs text-slate-500">Gunakan Nama, NIM, dan PIN yang diberikan oleh gurumu.</p>
              </div>

              <div id="login-error-alert" class="hidden mb-4 p-3 rounded-2xl bg-red-100 border border-red-300 text-red-800 text-xs font-bold flex items-center gap-2">
                <span>⚠️</span>
                <span id="login-error-msg"></span>
              </div>

              <form onsubmit="window.studentApp.handleLoginSubmit(event)" class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap Siswa:</label>
                  <input type="text" id="login-name" required placeholder="Contoh: Ahmad Faiz Pratama" class="w-full text-sm font-semibold p-3.5 rounded-2xl border-2 border-slate-200 focus:border-sky-500 focus:outline-none transition">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">NIM / Nomor Induk Siswa:</label>
                  <input type="text" id="login-nim" required placeholder="Contoh: SD2026001" class="w-full text-sm font-semibold p-3.5 rounded-2xl border-2 border-slate-200 focus:border-sky-500 focus:outline-none uppercase transition">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">PIN / Kata Sandi (4-6 angka):</label>
                  <input type="password" id="login-pin" required placeholder="••••" class="w-full text-sm font-semibold p-3.5 rounded-2xl border-2 border-slate-200 focus:border-sky-500 focus:outline-none transition tracking-widest">
                </div>

                <div class="pt-2">
                  <button type="submit" class="btn-fun btn-fun-primary w-full py-4 rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-2 shadow-lg">
                    <span>🚀</span> Masuk dan Mulai Belajar!
                  </button>
                </div>
              </form>

              <div class="mt-6 pt-4 border-t border-slate-100 text-center">
                <p class="text-xs text-slate-500">
                  Guru atau Pengelola? 
                  <a href="operator.html" class="font-bold text-sky-600 hover:underline">Masuk ke Dashboard Operator 🔐</a>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    `;
  },

  quickLogin(nim, name, pin) {
    document.getElementById('login-nim').value = nim;
    document.getElementById('login-name').value = name;
    document.getElementById('login-pin').value = pin;
    window.sound.playClick();
  },

  async handleLoginSubmit(e) {
    e.preventDefault();
    window.sound.playClick();

    const name = document.getElementById('login-name').value.trim();
    const nim = document.getElementById('login-nim').value.trim();
    const pin = document.getElementById('login-pin').value.trim();
    const errBox = document.getElementById('login-error-alert');
    const errMsg = document.getElementById('login-error-msg');

    try {
      const res = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, nim: nim, pin: pin })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('student_token', data.token);
        this.student = data.student;
        window.sound.playSuccess();
        window.sound.startBgm(); // Start cheerful BGM upon login
        await this.fetchProfile();
        this.navigate('dashboard');
      } else {
        window.sound.playError();
        errMsg.innerText = data.detail || "Gagal masuk. Periksa Nama dan NIM.";
        errBox.classList.remove('hidden');
      }
    } catch (err) {
      window.sound.playError();
      errMsg.innerText = "Terjadi gangguan koneksi ke server.";
      errBox.classList.remove('hidden');
    }
  },

  logout() {
    window.sound.playClick();
    if (confirm("Apakah kamu yakin ingin keluar dari sesi belajar?")) {
      localStorage.removeItem('student_token');
      this.student = null;
      window.sound.stopNarration();
      this.navigate('login');
    }
  },

  /* =========================================================================
     2. DASHBOARD UTAMA SISWA
     ========================================================================= */
  renderDashboard(container) {
    const s = this.student || { full_name: 'Siswa Hebat', nim: 'SD2026001', class_name: 'Kelas 4' };
    const stats = this.stats || { progress_percent: 0, completed_slides: 0, total_slides: 7, pretest_score: null, posttest_score: null };
    const earnedBadgesCount = (this.badges || []).filter(b => b.is_unlocked).length;

    container.innerHTML = `
      <div class="max-w-7xl mx-auto py-6 px-4 space-y-8">
        
        <!-- Welcome Hero Banner -->
        <div class="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          <div class="flex items-center gap-5 z-10">
            <div onclick="window.studentApp.navigate('profile')" class="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/20 border-3 border-white/50 flex items-center justify-center text-5xl md:text-6xl shadow-inner cursor-pointer hover:scale-105 transition" title="Ganti Avatar">
              ${this.getAvatarEmoji(s.avatar)}
            </div>
            <div>
              <span class="bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                ${s.class_name} • NIM: ${s.nim}
              </span>
              <h2 class="text-2xl md:text-4xl font-fun font-bold mt-1">
                Halo, ${s.full_name}! 👋
              </h2>
              <p class="text-sky-100 text-xs md:text-sm mt-1 max-w-lg">
                Senang melihatmu kembali! Ayo lanjutkan petualangan sains dan selesaikan semua misimu hari ini!
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-3 z-10 w-full md:w-auto">
            <button onclick="window.studentApp.navigate('materi')" class="btn-fun btn-fun-amber w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg">
              <span>🚀</span> Lanjutkan Pembelajaran
            </button>
          </div>

        </div>

        <!-- 3 Quick Progress Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="comic-card p-5 flex items-center gap-4 bg-white border-blue-200">
            <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
              📊
            </div>
            <div>
              <span class="text-[11px] font-bold text-slate-400 block uppercase">Progres Materi</span>
              <span class="text-2xl font-fun font-bold text-slate-800">${stats.progress_percent}%</span>
              <div class="w-32 bg-slate-100 h-1.5 rounded-full mt-1">
                <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${stats.progress_percent}%;"></div>
              </div>
            </div>
          </div>

          <div class="comic-card p-5 flex items-center gap-4 bg-white border-green-200">
            <div class="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-2xl font-bold">
              🎯
            </div>
            <div>
              <span class="text-[11px] font-bold text-slate-400 block uppercase">Nilai Terakhir</span>
              <span class="text-xl font-fun font-bold text-slate-800">
                ${stats.posttest_score !== null ? `${stats.posttest_score} (Post-test)` : (stats.pretest_score !== null ? `${stats.pretest_score} (Pre-test)` : 'Belum Tes')}
              </span>
              <span class="text-[10px] text-green-600 font-bold block mt-0.5">Ujian Terverifikasi Server</span>
            </div>
          </div>

          <div class="comic-card p-5 flex items-center gap-4 bg-white border-amber-200">
            <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl font-bold">
              🌟
            </div>
            <div>
              <span class="text-[11px] font-bold text-slate-400 block uppercase">Lencana Diraih</span>
              <span class="text-2xl font-fun font-bold text-amber-600">${earnedBadgesCount} / ${(this.badges || []).length}</span>
              <span class="text-[10px] text-slate-400 font-bold block mt-0.5">Kumpulkan semuanya!</span>
            </div>
          </div>
        </div>

        <!-- 8 Core Learning Menu Navigation Grid -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl md:text-2xl font-fun font-bold text-slate-800 flex items-center gap-2">
                <span>🗺️</span> Menu Navigasi Pembelajaran
              </h3>
              <p class="text-xs text-slate-500">Pilih menu di bawah ini untuk memulai petualangan belajarmu:</p>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            
            <!-- 1. Petunjuk -->
            <div onclick="window.studentApp.navigate('guide')" class="menu-card comic-card p-5 cursor-pointer bg-gradient-to-b from-white to-sky-50/60 hover:border-sky-400 flex flex-col justify-between">
              <span class="w-7 h-7 rounded-full bg-sky-500 text-white font-fun font-bold flex items-center justify-center text-xs mb-3">1</span>
              <div class="text-center py-2">
                <span class="text-5xl block mb-2 animate-float">💡</span>
                <h4 class="font-fun text-base md:text-lg font-bold text-slate-800">Petunjuk</h4>
                <p class="text-[11px] text-slate-500 mt-1">Panduan langkah cara belajar seru</p>
              </div>
              <span class="text-[10px] font-bold text-sky-600 text-center block mt-2">Buka Panduan 👉</span>
            </div>

            <!-- 2. Pengujian Awal -->
            <div onclick="window.studentApp.navigate('pretest')" class="menu-card comic-card p-5 cursor-pointer bg-gradient-to-b from-white to-amber-50/60 hover:border-amber-400 flex flex-col justify-between">
              <span class="w-7 h-7 rounded-full bg-amber-500 text-white font-fun font-bold flex items-center justify-center text-xs mb-3">2</span>
              <div class="text-center py-2">
                <span class="text-5xl block mb-2 animate-float" style="animation-delay: 0.3s;">🎯</span>
                <h4 class="font-fun text-base md:text-lg font-bold text-slate-800">Pengujian</h4>
                <p class="text-[11px] text-slate-500 mt-1">Pre-test pemahaman awal siswa</p>
              </div>
              <span class="text-[10px] font-bold text-amber-600 text-center block mt-2">Mulai Tes 👉</span>
            </div>

            <!-- 3. Profil -->
            <div onclick="window.studentApp.navigate('profile')" class="menu-card comic-card p-5 cursor-pointer bg-gradient-to-b from-white to-pink-50/60 hover:border-pink-400 flex flex-col justify-between">
              <span class="w-7 h-7 rounded-full bg-pink-500 text-white font-fun font-bold flex items-center justify-center text-xs mb-3">3</span>
              <div class="text-center py-2">
                <span class="text-5xl block mb-2 animate-float" style="animation-delay: 0.6s;">👦</span>
                <h4 class="font-fun text-base md:text-lg font-bold text-slate-800">Profil</h4>
                <p class="text-[11px] text-slate-500 mt-1">Biodata, avatar & lencana piala</p>
              </div>
              <span class="text-[10px] font-bold text-pink-600 text-center block mt-2">Lihat Profil 👉</span>
            </div>

            <!-- 4. Materi Pembelajaran -->
            <div onclick="window.studentApp.navigate('materi')" class="menu-card comic-card p-5 cursor-pointer bg-gradient-to-b from-white to-blue-50/60 hover:border-blue-400 flex flex-col justify-between">
              <span class="w-7 h-7 rounded-full bg-blue-500 text-white font-fun font-bold flex items-center justify-center text-xs mb-3">4</span>
              <div class="text-center py-2">
                <span class="text-5xl block mb-2 animate-float" style="animation-delay: 0.9s;">📖</span>
                <h4 class="font-fun text-base md:text-lg font-bold text-slate-800">Materi</h4>
                <p class="text-[11px] text-slate-500 mt-1">Slide interaktif Storyline & audio</p>
              </div>
              <span class="text-[10px] font-bold text-blue-600 text-center block mt-2">Buka Slide 👉</span>
            </div>

            <!-- 5. Eksperimen Virtual -->
            <div onclick="window.studentApp.navigate('experiment')" class="menu-card comic-card p-5 cursor-pointer bg-gradient-to-b from-white to-cyan-50/60 hover:border-cyan-400 flex flex-col justify-between">
              <span class="w-7 h-7 rounded-full bg-cyan-500 text-white font-fun font-bold flex items-center justify-center text-xs mb-3">5</span>
              <div class="text-center py-2">
                <span class="text-5xl block mb-2 animate-float" style="animation-delay: 1.2s;">🔬</span>
                <h4 class="font-fun text-base md:text-lg font-bold text-slate-800">Eksperimen</h4>
                <p class="text-[11px] text-slate-500 mt-1">Lab virtual pemanasan zat cair</p>
              </div>
              <span class="text-[10px] font-bold text-cyan-600 text-center block mt-2">Masuk Lab 👉</span>
            </div>

            <!-- 6. Kesimpulan -->
            <div onclick="window.studentApp.navigate('conclusion')" class="menu-card comic-card p-5 cursor-pointer bg-gradient-to-b from-white to-emerald-50/60 hover:border-emerald-400 flex flex-col justify-between">
              <span class="w-7 h-7 rounded-full bg-emerald-500 text-white font-fun font-bold flex items-center justify-center text-xs mb-3">6</span>
              <div class="text-center py-2">
                <span class="text-5xl block mb-2 animate-float" style="animation-delay: 1.5s;">🧩</span>
                <h4 class="font-fun text-base md:text-lg font-bold text-slate-800">Kesimpulan</h4>
                <p class="text-[11px] text-slate-500 mt-1">Peta konsep & rangkuman visual</p>
              </div>
              <span class="text-[10px] font-bold text-emerald-600 text-center block mt-2">Buka Rangkuman 👉</span>
            </div>

            <!-- 7. Soal Evaluasi -->
            <div onclick="window.studentApp.navigate('posttest')" class="menu-card comic-card p-5 cursor-pointer bg-gradient-to-b from-white to-violet-50/60 hover:border-violet-400 flex flex-col justify-between">
              <span class="w-7 h-7 rounded-full bg-violet-500 text-white font-fun font-bold flex items-center justify-center text-xs mb-3">7</span>
              <div class="text-center py-2">
                <span class="text-5xl block mb-2 animate-float" style="animation-delay: 1.8s;">📝</span>
                <h4 class="font-fun text-base md:text-lg font-bold text-slate-800">Soal</h4>
                <p class="text-[11px] text-slate-500 mt-1">Post-test & evaluasi nilai akhir</p>
              </div>
              <span class="text-[10px] font-bold text-violet-600 text-center block mt-2">Kerjakan Soal 👉</span>
            </div>

            <!-- 8. Permainan Edukasi -->
            <div onclick="window.studentApp.navigate('games')" class="menu-card comic-card p-5 cursor-pointer bg-gradient-to-b from-white to-purple-50/60 hover:border-purple-400 flex flex-col justify-between">
              <span class="w-7 h-7 rounded-full bg-purple-500 text-white font-fun font-bold flex items-center justify-center text-xs mb-3">8</span>
              <div class="text-center py-2">
                <span class="text-5xl block mb-2 animate-float" style="animation-delay: 2.1s;">🎮</span>
                <h4 class="font-fun text-base md:text-lg font-bold text-slate-800">Permainan</h4>
                <p class="text-[11px] text-slate-500 mt-1">3 mini game seru & kuis cepat</p>
              </div>
              <span class="text-[10px] font-bold text-purple-600 text-center block mt-2">Mainkan Game 👉</span>
            </div>

          </div>
        </div>

      </div>
    `;
  },

  /* =========================================================================
     MENU 1: PETUNJUK PENGGUNAAN
     ========================================================================= */
  renderGuide(container) {
    container.innerHTML = `
      <div class="max-w-4xl mx-auto py-6 px-4 space-y-6">
        <div class="flex items-center justify-between">
          <button onclick="window.studentApp.navigate('dashboard')" class="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
            ⬅️ Kembali ke Dashboard
          </button>
          <span class="text-xs font-bold bg-sky-100 text-sky-800 px-3 py-1 rounded-full">Menu 1: Petunjuk</span>
        </div>

        <div class="comic-card p-6 md:p-8 space-y-6 bg-white">
          <div class="text-center max-w-xl mx-auto">
            <span class="text-5xl block mb-2 animate-bounce-gentle">💡</span>
            <h2 class="text-2xl md:text-3xl font-fun font-bold text-slate-800">Panduan Menggunakan Media Pembelajaran</h2>
            <p class="text-xs md:text-sm text-slate-600 mt-1">Ikuti langkah-langkah mudah di bawah ini agar belajarmu semakin menyenangkan dan berprestasi!</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
              <span class="font-fun font-bold text-sm text-sky-900 flex items-center gap-2">
                <span>📖</span> 1. Membaca Materi Slide Storyline
              </span>
              <p class="text-xs text-slate-600 leading-relaxed">
                Tekan tombol "Slide Selanjutnya" atau "Sebelumnya". Tekan tombol <b>"Dengarkan Suara"</b> untuk mendengarkan narasi audio otomatis. Kamu juga bisa mengetuk objek interaktif dan menyeret benda ke kotaknya!
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 space-y-2">
              <span class="font-fun font-bold text-sm text-cyan-900 flex items-center gap-2">
                <span>🔬</span> 2. Menjalankan Eksperimen Lab
              </span>
              <p class="text-xs text-slate-600 leading-relaxed">
                Masukkan es batu ke gelas kimia, atur saklar pembakar Bunsen, lalu amati kenaikan termometer hingga 100°C. Jangan lupa catat hasil pengamatanmu di buku jurnal lab!
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
              <span class="font-fun font-bold text-sm text-purple-900 flex items-center gap-2">
                <span>🎮</span> 3. Bermain Permainan Edukasi
              </span>
              <p class="text-xs text-slate-600 leading-relaxed">
                Tersedia 3 mini game: Tebak Cepat Wujud Benda, Susun Rantai Siklus Air, dan Tangkap Benda Sains. Kumpulkan skor di atas 80 untuk meraih piala dan lencana emas!
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <span class="font-fun font-bold text-sm text-amber-900 flex items-center gap-2">
                <span>📝</span> 4. Mengerjakan Soal & Evaluasi
              </span>
              <p class="text-xs text-slate-600 leading-relaxed">
                Kerjakan <b>Pengujian Awal (Pre-test)</b> sebelum belajar, dan selesaikan <b>Evaluasi Akhir (Post-test)</b> setelah belajar. Nilaimu langsung dihitung oleh sistem dan bisa kamu bandingkan peningkatannya!
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-green-50 border border-green-200 space-y-2">
              <span class="font-fun font-bold text-sm text-green-900 flex items-center gap-2">
                <span>🎵</span> 5. Mengatur Musik & Efek Suara
              </span>
              <p class="text-xs text-slate-600 leading-relaxed">
                Tekan tombol speaker di pojok kanan atas untuk mematikan atau menyalakan musik latar. Kamu juga bisa mengatur volume suara musik dan efek bunyi tombol sesukamu.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-pink-50 border border-pink-200 space-y-2">
              <span class="font-fun font-bold text-sm text-pink-900 flex items-center gap-2">
                <span>👑</span> 6. Profil & Pengumpulan Lencana
              </span>
              <p class="text-xs text-slate-600 leading-relaxed">
                Buka menu Profil untuk mengganti avatarmu dengan astronaut, saintis, atau karakter favorit lainnya. Lihat juga koleksi medali yang telah kamu buka!
              </p>
            </div>
          </div>

          <div class="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <span class="text-xs font-bold text-slate-500">Sudah paham petunjuknya? Ayo kita mulai!</span>
            <button onclick="window.studentApp.completeGuideAndStart()" class="btn-fun btn-fun-primary px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md">
              🚀 Mulai Belajar Sekarang!
            </button>
          </div>
        </div>
      </div>
    `;
  },

  async completeGuideAndStart() {
    window.sound.playClick();
    const token = localStorage.getItem('student_token');
    if (token) {
      try {
        const res = await fetch('/api/student/guide-complete', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.unlocked_badge) {
          this.showBadgeModal(data.unlocked_badge);
        }
      } catch (e) {}
    }
    // Navigate to Pre-test or Materi
    this.navigate('pretest');
  },

  /* =========================================================================
     MENU 2: PENGUJIAN AWAL (PRE-TEST)
     ========================================================================= */
  async renderPretest(container) {
    container.innerHTML = `
      <div class="max-w-2xl mx-auto py-12 text-center">
        <span class="text-4xl animate-bounce-gentle">⏳</span>
        <p class="font-fun text-lg font-bold text-slate-700 mt-2">Menyiapkan Soal Pengujian Awal...</p>
      </div>
    `;

    const token = localStorage.getItem('student_token');
    try {
      const res = await fetch('/api/student/test/pretest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      this.renderTestUI(container, 'pretest', data.questions, data.prior_attempt);
    } catch (e) {
      container.innerHTML = `<div class="p-6 text-center text-red-600 font-bold">${e.message}</div>`;
    }
  },

  /* =========================================================================
     MENU 7: EVALUASI AKHIR (POST-TEST)
     ========================================================================= */
  async renderPosttest(container) {
    container.innerHTML = `
      <div class="max-w-2xl mx-auto py-12 text-center">
        <span class="text-4xl animate-bounce-gentle">⏳</span>
        <p class="font-fun text-lg font-bold text-slate-700 mt-2">Menyiapkan Soal Evaluasi Akhir...</p>
      </div>
    `;

    const token = localStorage.getItem('student_token');
    try {
      const res = await fetch('/api/student/test/posttest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      this.renderTestUI(container, 'posttest', data.questions, data.prior_attempt);
    } catch (e) {
      container.innerHTML = `<div class="p-6 text-center text-red-600 font-bold">${e.message}</div>`;
    }
  },

  renderTestUI(container, testType, questions, priorAttempt) {
    if (!questions || questions.length === 0) {
      container.innerHTML = `
        <div class="comic-card max-w-md mx-auto p-8 text-center space-y-4">
          <span class="text-5xl">📭</span>
          <h3 class="font-fun text-xl font-bold">Belum Ada Soal</h3>
          <p class="text-xs text-slate-500">Operator belum mengunggah soal untuk sesi ini.</p>
          <button onclick="window.studentApp.navigate('dashboard')" class="btn-fun btn-fun-primary py-2 px-4 rounded-xl text-xs font-bold">
            Kembali ke Dashboard
          </button>
        </div>
      `;
      return;
    }

    let currentIndex = 0;
    const studentAnswers = {};
    const total = questions.length;
    const isPretest = testType === 'pretest';

    const renderCurrentQuestion = () => {
      const q = questions[currentIndex];
      const selected = studentAnswers[String(q.id)] || '';

      container.innerHTML = `
        <div class="max-w-3xl mx-auto py-6 px-4 space-y-6">
          
          <div class="flex items-center justify-between">
            <button onclick="window.studentApp.navigate('dashboard')" class="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
              ⬅️ Dashboard
            </button>
            <span class="text-xs font-bold ${isPretest ? 'bg-amber-100 text-amber-900' : 'bg-purple-100 text-purple-900'} px-3 py-1 rounded-full">
              ${isPretest ? 'Pengujian Awal (Pre-test)' : 'Evaluasi Akhir (Post-test)'}
            </span>
          </div>

          <!-- Progress Header -->
          <div class="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Nomor Soal</span>
              <span class="text-lg font-fun font-bold text-slate-800">Soal ${currentIndex + 1} dari ${total}</span>
            </div>
            <div class="w-40 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div class="${isPretest ? 'bg-amber-400' : 'bg-purple-500'} h-2 transition-all duration-300" style="width: ${((currentIndex + 1) / total) * 100}%;"></div>
            </div>
          </div>

          <!-- Question Card -->
          <div class="comic-card p-6 md:p-8 space-y-6 bg-white">
            <span class="text-xs font-bold text-sky-600 uppercase tracking-wider block">Topik: ${q.topic}</span>
            <h3 class="text-lg md:text-xl font-bold text-slate-800 leading-relaxed">${q.question_text}</h3>

            <div class="space-y-3 pt-2">
              ${q.options.map(opt => {
                const optLetter = opt.trim().substring(0, 1).toUpperCase();
                const isChosen = (selected === optLetter || selected === opt);
                return `
                  <button onclick="window.studentApp.selectTestOption('${q.id}', '${optLetter}')" class="btn-fun w-full p-4 rounded-2xl border-2 ${isChosen ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'} text-left text-xs md:text-sm flex items-center gap-3 transition">
                    <span class="w-8 h-8 rounded-xl ${isChosen ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'} font-fun font-bold flex items-center justify-center text-sm shrink-0">
                      ${optLetter}
                    </span>
                    <span class="leading-relaxed">${opt}</span>
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Question Stepper Nav -->
            <div class="pt-6 border-t flex items-center justify-between">
              <button onclick="window.studentApp.navTestStep(-1)" ${currentIndex === 0 ? 'disabled' : ''} class="btn-fun ${currentIndex === 0 ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white border-2 border-slate-200 text-slate-700'} px-5 py-2.5 rounded-2xl font-bold text-xs">
                ⬅️ Sebelumnya
              </button>

              ${currentIndex < total - 1 ? `
                <button onclick="window.studentApp.navTestStep(1)" class="btn-fun btn-fun-primary px-6 py-2.5 rounded-2xl font-bold text-xs">
                  Selanjutnya ➡️
                </button>
              ` : `
                <button onclick="window.studentApp.confirmSubmitTest('${testType}')" class="btn-fun btn-fun-success px-6 py-2.5 rounded-2xl font-bold text-xs shadow-md">
                  Kirim Jawaban 🚀
                </button>
              `}
            </div>
          </div>

        </div>
      `;
    };

    window.studentApp.selectTestOption = (qid, optLetter) => {
      window.sound.playClick();
      studentAnswers[String(qid)] = optLetter;
      renderCurrentQuestion();
    };

    window.studentApp.navTestStep = (delta) => {
      window.sound.playClick();
      currentIndex = Math.max(0, Math.min(total - 1, currentIndex + delta));
      renderCurrentQuestion();
    };

    window.studentApp.confirmSubmitTest = async (tType) => {
      window.sound.playClick();
      const answeredCount = Object.keys(studentAnswers).length;
      if (answeredCount < total) {
        if (!confirm(`Kamu baru menjawab ${answeredCount} dari ${total} soal. Yakin ingin mengirim sekarang?`)) {
          return;
        }
      }

      // Submit to backend
      const token = localStorage.getItem('student_token');
      try {
        const res = await fetch('/api/student/test/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            test_type: tType,
            answers: studentAnswers
          })
        });
        const result = await res.json();
        if (res.ok) {
          window.studentApp.renderTestResult(container, tType, result);
        } else {
          alert(result.detail || "Gagal mengirim jawaban tes.");
        }
      } catch (e) {
        alert("Gagal menghubungi server.");
      }
    };

    renderCurrentQuestion();
  },

  renderTestResult(container, testType, result) {
    window.sound.playFanfare();
    const isPretest = testType === 'pretest';

    container.innerHTML = `
      <div class="max-w-3xl mx-auto py-6 px-4 space-y-6">
        <div class="comic-card p-8 text-center space-y-6 bg-white">
          <div class="text-6xl animate-bounce-gentle">🎉</div>
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-sky-600 block">
              ${isPretest ? 'Hasil Pengujian Awal (Pre-test)' : 'Hasil Evaluasi Akhir (Post-test)'}
            </span>
            <h2 class="text-2xl md:text-3xl font-fun font-bold text-slate-800 mt-1">
              ${result.score >= 70 ? 'Luar Biasa, Kamu Hebat Sekali!' : 'Bagus! Tetap Semangat Belajar!'}
            </h2>
          </div>

          <!-- Score Card -->
          <div class="p-6 rounded-3xl bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 max-w-sm mx-auto">
            <span class="text-xs font-bold text-slate-500 block">Nilai Tes Kamu:</span>
            <span class="text-5xl font-fun font-bold text-sky-700 my-1 block">${result.score}</span>
            <span class="text-xs font-bold text-slate-600 block">
              Benar: <b class="text-green-600">${result.correct_count}</b> dari ${result.total_questions} Soal
            </span>
          </div>

          <!-- Comparison Delta if Post-test -->
          ${result.comparison ? `
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-300 max-w-md mx-auto text-left space-y-1">
              <span class="font-fun text-sm font-bold text-amber-900 flex items-center gap-1">
                <span>📈</span> Peningkatan Nilaimu:
              </span>
              <p class="text-xs text-amber-800">
                Nilai Pre-test: <b>${result.comparison.pretest_score}</b> ➡️ Nilai Post-test: <b>${result.comparison.posttest_score}</b>
              </p>
              <p class="text-xs font-bold ${result.comparison.delta >= 0 ? 'text-green-700' : 'text-slate-600'}">
                Peningkatan: ${result.comparison.delta >= 0 ? `+${result.comparison.delta} Poin! 🌟` : `${result.comparison.delta} Poin`}
              </p>
            </div>
          ` : ''}

          <!-- Detailed Answer Explanations (Pembahasan) -->
          <div class="text-left space-y-4 pt-4 border-t">
            <h4 class="font-fun text-base font-bold text-slate-800 flex items-center gap-2">
              <span>🔍</span> Pembahasan Jawaban Lengkap:
            </h4>
            <div class="space-y-3">
              ${(result.details || []).map((d, i) => `
                <div class="p-4 rounded-2xl ${d.is_correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'} space-y-1 text-xs">
                  <div class="flex items-center justify-between font-bold">
                    <span class="text-slate-800">Soal ${i + 1}: ${d.question_text}</span>
                    <span class="${d.is_correct ? 'text-green-700' : 'text-red-700'}">${d.is_correct ? '✅ Benar' : '❌ Kurang Tepat'}</span>
                  </div>
                  <p class="text-slate-600">Jawabanmu: <b>${d.student_choice || '-'}</b> | Kunci Benar: <b class="text-green-800">${d.correct_answer}</b></p>
                  <p class="text-slate-500 italic mt-1">${d.explanation || ''}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pt-4 flex items-center justify-center gap-4">
            <button onclick="window.studentApp.navigate('dashboard')" class="btn-fun btn-fun-primary px-8 py-3 rounded-2xl font-bold text-sm">
              🏠 Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    `;

    if (result.unlocked_badge) {
      this.showBadgeModal(result.unlocked_badge);
    }
  },

  /* =========================================================================
     MENU 3: PROFIL SISWA & PRESTASI
     ========================================================================= */
  renderProfile(container) {
    const s = this.student || {};
    const stats = this.stats || {};
    const badges = this.badges || [];

    const avatars = [
      { id: 'astronaut', icon: '🧑‍🚀', name: 'Astronaut' },
      { id: 'boy_glasses', icon: '👦', name: 'Kacamata' },
      { id: 'girl_hijab', icon: '🧕', name: 'Hijab' },
      { id: 'boy_sporty', icon: '🧢', name: 'Sporty' },
      { id: 'girl_smile', icon: '👧', name: 'Senyum' },
      { id: 'scientist_kid', icon: '🔬', name: 'Saintis' },
      { id: 'cat_pilot', icon: '🐱', name: 'Kucing' },
      { id: 'robot_buddy', icon: '🤖', name: 'Robot' }
    ];

    container.innerHTML = `
      <div class="max-w-4xl mx-auto py-6 px-4 space-y-6">
        
        <div class="flex items-center justify-between">
          <button onclick="window.studentApp.navigate('dashboard')" class="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
            ⬅️ Kembali ke Dashboard
          </button>
          <span class="text-xs font-bold bg-pink-100 text-pink-800 px-3 py-1 rounded-full">Menu 3: Profil Siswa</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          <!-- Column 1: Info Card & Avatar Selector (5 cols) -->
          <div class="md:col-span-5 space-y-4">
            <div class="comic-card p-6 text-center space-y-4 bg-white">
              <div class="w-24 h-24 rounded-3xl bg-sky-100 flex items-center justify-center text-6xl mx-auto shadow-inner border-2 border-sky-300">
                ${this.getAvatarEmoji(s.avatar)}
              </div>
              <div>
                <h3 class="font-fun text-xl font-bold text-slate-800">${s.full_name}</h3>
                <span class="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold inline-block mt-1">
                  ${s.class_name} • NIM: ${s.nim}
                </span>
              </div>

              <!-- Avatar Selection Grid -->
              <div class="pt-4 border-t text-left">
                <span class="text-xs font-bold text-slate-700 block mb-2">Pilih Avatar Favoritmu:</span>
                <div class="grid grid-cols-4 gap-2">
                  ${avatars.map(av => `
                    <button onclick="window.studentApp.updateAvatar('${av.id}')" class="p-2 rounded-2xl border-2 ${s.avatar === av.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300'} text-center transition">
                      <span class="text-2xl block">${av.icon}</span>
                      <span class="text-[9px] font-bold text-slate-500 block truncate">${av.name}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="pt-4 border-t">
                <button onclick="window.studentApp.logout()" class="btn-fun bg-red-100 hover:bg-red-200 text-red-700 w-full py-2.5 rounded-2xl font-bold text-xs">
                  🚪 Keluar dari Akun Siswa
                </button>
              </div>
            </div>
          </div>

          <!-- Column 2: Scorecard & Badges (7 cols) -->
          <div class="md:col-span-7 space-y-4">
            
            <!-- Learning Scorecard -->
            <div class="comic-card p-6 bg-white space-y-4">
              <h4 class="font-fun text-base font-bold text-slate-800 flex items-center gap-2">
                <span>📊</span> Catatan Prestasi Belajar
              </h4>
              <div class="grid grid-cols-2 gap-3 text-center">
                <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <span class="text-[10px] font-bold text-amber-800 block uppercase">Nilai Pre-test</span>
                  <span class="text-2xl font-fun font-bold text-amber-900">${stats.pretest_score !== null ? stats.pretest_score : '-'}</span>
                </div>
                <div class="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                  <span class="text-[10px] font-bold text-purple-800 block uppercase">Nilai Post-test</span>
                  <span class="text-2xl font-fun font-bold text-purple-900">${stats.posttest_score !== null ? stats.posttest_score : '-'}</span>
                </div>
              </div>
            </div>

            <!-- Badges Collection -->
            <div class="comic-card p-6 bg-white space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="font-fun text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>🏆</span> Lemari Piala & Lencana
                </h4>
                <span class="text-xs font-bold text-amber-600">
                  ${badges.filter(b => b.is_unlocked).length} / ${badges.length} Terkumpul
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${badges.map(b => `
                  <div class="p-3 rounded-2xl border-2 ${b.is_unlocked ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50 opacity-60'} flex items-center gap-3">
                    <span class="text-3xl ${b.is_unlocked ? 'animate-bounce-gentle' : 'grayscale'}">${b.icon}</span>
                    <div>
                      <h5 class="font-fun font-bold text-xs text-slate-800">${b.title}</h5>
                      <p class="text-[10px] text-slate-500 line-clamp-2">${b.description}</p>
                      <span class="text-[9px] font-bold ${b.is_unlocked ? 'text-green-700' : 'text-slate-400'}">
                        ${b.is_unlocked ? '✅ Terbuka' : '🔒 Masih Terkunci'}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

        </div>

      </div>
    `;
  },

  async updateAvatar(avatarId) {
    window.sound.playClick();
    const token = localStorage.getItem('student_token');
    if (!token) return;

    try {
      const res = await fetch('/api/student/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatar: avatarId })
      });
      if (res.ok) {
        this.student.avatar = avatarId;
        window.sound.playSuccess();
        this.renderProfile(document.getElementById('app-main-content'));
        this.renderHeader();
      }
    } catch (e) {}
  },

  /* =========================================================================
     MENU 4: MATERI SLIDE STORYLINE
     ========================================================================= */
  async renderMateri(container) {
    container.innerHTML = `
      <div class="max-w-4xl mx-auto py-12 text-center">
        <span class="text-4xl animate-bounce-gentle">📖</span>
        <p class="font-fun text-lg font-bold text-slate-700 mt-2">Memuat Slide Interaktif Storyline...</p>
      </div>
    `;

    const token = localStorage.getItem('student_token');
    try {
      const res = await fetch('/api/student/module', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      container.innerHTML = `<div id="storyline-player-mount" class="max-w-4xl mx-auto py-6 px-4"></div>`;
      window.StorylinePlayer.init('storyline-player-mount', data.module, data.slides);
    } catch (e) {
      container.innerHTML = `<div class="p-6 text-center text-red-600 font-bold">${e.message}</div>`;
    }
  },

  /* =========================================================================
     MENU 5: EKSPERIMEN VIRTUAL
     ========================================================================= */
  async renderExperiment(container) {
    container.innerHTML = `
      <div class="max-w-4xl mx-auto py-12 text-center">
        <span class="text-4xl animate-bounce-gentle">🔬</span>
        <p class="font-fun text-lg font-bold text-slate-700 mt-2">Menyiapkan Laboratorium Virtual...</p>
      </div>
    `;

    const token = localStorage.getItem('student_token');
    try {
      const res = await fetch('/api/student/experiments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      const exp = (data.experiments && data.experiments[0]) || {};
      container.innerHTML = `<div id="virtual-lab-mount" class="max-w-6xl mx-auto py-6 px-4"></div>`;
      window.VirtualLab.init('virtual-lab-mount', exp);
    } catch (e) {
      container.innerHTML = `<div class="p-6 text-center text-red-600 font-bold">${e.message}</div>`;
    }
  },

  /* =========================================================================
     MENU 6: KESIMPULAN & REFLEKSI
     ========================================================================= */
  renderConclusion(container) {
    container.innerHTML = `
      <div class="max-w-4xl mx-auto py-6 px-4 space-y-6">
        <div class="flex items-center justify-between">
          <button onclick="window.studentApp.navigate('dashboard')" class="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
            ⬅️ Kembali ke Dashboard
          </button>
          <span class="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">Menu 6: Kesimpulan</span>
        </div>

        <div class="comic-card p-6 md:p-8 space-y-8 bg-white">
          <div class="text-center max-w-xl mx-auto">
            <span class="text-5xl block mb-2 animate-bounce-gentle">🧩</span>
            <h2 class="text-2xl md:text-3xl font-fun font-bold text-slate-800">Rangkuman Konsep Sains</h2>
            <p class="text-xs md:text-sm text-slate-600 mt-1">Peta pikiran perubahan wujud benda dan perjalanan siklus air di alam.</p>
          </div>

          <!-- Concept Map Visual Diagram -->
          <div class="p-6 rounded-3xl bg-gradient-to-b from-sky-50 via-indigo-50 to-emerald-50 border-2 border-emerald-200">
            <h4 class="font-fun text-sm font-bold text-emerald-900 text-center uppercase tracking-wider mb-4">
              Segitiga Perubahan Wujud Zat
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div class="p-4 rounded-2xl bg-white shadow-sm border border-cyan-200">
                <span class="text-4xl block mb-1">🧱</span>
                <b class="text-sm font-fun text-cyan-900 block">Zat Padat</b>
                <span class="text-[11px] text-slate-500">Bentuk & volume tetap kokoh.</span>
              </div>
              <div class="p-4 rounded-2xl bg-white shadow-sm border border-amber-200">
                <span class="text-4xl block mb-1">💧</span>
                <b class="text-sm font-fun text-amber-900 block">Zat Cair</b>
                <span class="text-[11px] text-slate-500">Volume tetap, bentuk ikuti wadah.</span>
              </div>
              <div class="p-4 rounded-2xl bg-white shadow-sm border border-purple-200">
                <span class="text-4xl block mb-1">🎈</span>
                <b class="text-sm font-fun text-purple-900 block">Zat Gas</b>
                <span class="text-[11px] text-slate-500">Mengisi seluruh ruangan bebas.</span>
              </div>
            </div>

            <!-- Flow Arrows -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs font-bold text-center">
              <div class="p-2 rounded-xl bg-orange-100 text-orange-900">🔥 Mencair (Padat ➡️ Cair)</div>
              <div class="p-2 rounded-xl bg-blue-100 text-blue-900">❄️ Membeku (Cair ➡️ Padat)</div>
              <div class="p-2 rounded-xl bg-red-100 text-red-900">🔥 Menguap (Cair ➡️ Gas)</div>
              <div class="p-2 rounded-xl bg-purple-100 text-purple-900">❄️ Mengembun (Gas ➡️ Cair)</div>
            </div>
          </div>

          <!-- 4 Bullet Summary Points -->
          <div class="space-y-3">
            <h4 class="font-fun text-base font-bold text-slate-800">3 Poin Inti Yang Wajib Diingat:</h4>
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
              <span class="text-xl">☀️</span>
              <p><b>1. Peran Kalor/Panas:</b> Benda mencair dan menguap karena menyerap kalor, sedangkan membeku dan mengembun karena melepaskan kalor.</p>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
              <span class="text-xl">🌊</span>
              <p><b>2. Daur Siklus Air:</b> Air di bumi tidak pernah habis karena terus bersirkulasi: Evaporasi ➡️ Kondensasi ➡️ Presipitasi (Hujan) ➡️ Infiltrasi.</p>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
              <span class="text-xl">🌱</span>
              <p><b>3. Menjaga Alam:</b> Menjaga kelestarian hutan dan pohon membantu proses peresapan air tanah agar terhindar dari banjir dan kekeringan.</p>
            </div>
          </div>

          <!-- Reflection & Master Check -->
          <div class="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <span class="text-xs font-bold text-slate-500">Sudah menguasai semua materi hari ini?</span>
            <button onclick="window.studentApp.confirmMastery()" class="btn-fun btn-fun-success px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md">
              👑 Saya Sudah Paham Semuanya!
            </button>
          </div>
        </div>
      </div>
    `;
  },

  async confirmMastery() {
    window.sound.playClick();
    const token = localStorage.getItem('student_token');
    if (token) {
      try {
        const res = await fetch('/api/student/conclusion-complete', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.unlocked_badge) {
          this.showBadgeModal(data.unlocked_badge);
        } else {
          window.sound.playFanfare();
          alert("🎉 Luar biasa! Pemahamanmu tercatat di raport siswa. Ayo kerjakan Post-test evaluasi akhir!");
        }
      } catch (e) {}
    }
    this.navigate('posttest');
  },

  /* =========================================================================
     MENU 8: PERMAINAN EDUKASI
     ========================================================================= */
  renderGames(container) {
    container.innerHTML = `<div id="games-mount" class="max-w-5xl mx-auto py-6 px-4"></div>`;
    window.EduGames.init('games-mount');
  },

  /* =========================================================================
     BADGE UNLOCK MODAL CELEBRATION
     ========================================================================= */
  showBadgeModal(badge) {
    window.sound.playFanfare();
    const existing = document.getElementById('badge-celebration-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'badge-celebration-modal';
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="comic-card bg-white p-8 max-w-sm w-full text-center space-y-4 border-4 border-amber-300 animate-bounce-gentle shadow-2xl">
        <span class="text-7xl block animate-float">${badge.icon || '🌟'}</span>
        <span class="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Lencana Baru Terbuka!</span>
        <h3 class="font-fun text-2xl font-bold text-slate-800">${badge.title}</h3>
        <p class="text-xs text-slate-600 leading-relaxed">${badge.desc}</p>
        <button onclick="document.getElementById('badge-celebration-modal').remove()" class="btn-fun btn-fun-amber w-full py-3 rounded-2xl font-bold text-sm">
          Terima Kasih! 🎉
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }
};

window.showBadgeModal = (b) => window.studentApp.showBadgeModal(b);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.studentApp.init();
  });
} else {
  window.studentApp.init();
}
