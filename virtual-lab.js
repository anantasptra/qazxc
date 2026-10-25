/**
 * Virtual Science Laboratory Component for Elementary Students
 * Experiment: Perubahan Wujud Zat (Padat -> Cair -> Gas -> Kondensasi)
 */

window.VirtualLab = {
  state: {
    hasIce: false,
    burnerLevel: 0, // 0: off, 1: medium, 2: high
    temperature: 25,
    phase: 'empty', // empty, solid, melting, liquid, boiling, condensing
    hasLid: false,
    intervalId: null,
    hypothesis: '',
    notes: '',
    conclusion: '',
    experimentId: 1
  },

  init(containerId, experimentData) {
    this.container = document.getElementById(containerId);
    if (experimentData && experimentData.id) {
      this.state.experimentId = experimentData.id;
    }
    this.render();
  },

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="space-y-6">
        <!-- Lab Header Banner -->
        <div class="bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl shadow-inner animate-float">
              🔬
            </div>
            <div>
              <span class="bg-yellow-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Laboratorium Virtual SD</span>
              <h2 class="text-2xl md:text-3xl font-fun font-bold mt-1">Eksperimen: Perubahan Wujud Air</h2>
              <p class="text-blue-100 text-sm">Amati bagaimana es batu berubah wujud saat dipanaskan dengan Bunsen!</p>
            </div>
          </div>
          <button onclick="window.VirtualLab.resetLab()" class="btn-fun bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-2xl text-sm flex items-center gap-2 border border-white/30">
            🔄 Ulangi Eksperimen
          </button>
        </div>

        <!-- 3-Column Interactive Workspace -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Column 1: Step Instructions & Hypothesis (3 cols) -->
          <div class="lg:col-span-4 space-y-4">
            <div class="comic-card p-5">
              <h3 class="font-fun text-lg font-bold text-sky-800 flex items-center gap-2 mb-3">
                <span>📋</span> Langkah Eksperimen
              </h3>
              <ol class="space-y-3 text-xs md:text-sm text-slate-700">
                <li class="flex items-start gap-2.5 p-2.5 rounded-xl ${this.state.hasIce ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-slate-50'}">
                  <span class="w-6 h-6 rounded-full ${this.state.hasIce ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700'} font-bold flex items-center justify-center text-xs shrink-0">1</span>
                  <div>
                    <p class="font-bold">Masukkan Es Batu 🧊</p>
                    <p class="text-xs text-slate-500">Klik tombol untuk memasukkan es bersuhu -5°C.</p>
                  </div>
                </li>
                <li class="flex items-start gap-2.5 p-2.5 rounded-xl ${this.state.burnerLevel > 0 ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-slate-50'}">
                  <span class="w-6 h-6 rounded-full ${this.state.burnerLevel > 0 ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700'} font-bold flex items-center justify-center text-xs shrink-0">2</span>
                  <div>
                    <p class="font-bold">Nyalakan Api Bunsen 🔥</p>
                    <p class="text-xs text-slate-500">Beri kalor agar suhu es naik dan mencair.</p>
                  </div>
                </li>
                <li class="flex items-start gap-2.5 p-2.5 rounded-xl ${this.state.temperature >= 100 ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-slate-50'}">
                  <span class="w-6 h-6 rounded-full ${this.state.temperature >= 100 ? 'bg-green-50 text-white' : 'bg-slate-300 text-slate-700'} font-bold flex items-center justify-center text-xs shrink-0">3</span>
                  <div>
                    <p class="font-bold">Didihkan Air Hingga 100°C 💨</p>
                    <p class="text-xs text-slate-500">Amati terbentuknya gelembung dan uap air.</p>
                  </div>
                </li>
                <li class="flex items-start gap-2.5 p-2.5 rounded-xl ${this.state.hasLid ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-slate-50'}">
                  <span class="w-6 h-6 rounded-full ${this.state.hasLid ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700'} font-bold flex items-center justify-center text-xs shrink-0">4</span>
                  <div>
                    <p class="font-bold">Pasang Tutup Kaca Dingin 💧</p>
                    <p class="text-xs text-slate-500">Uap air mengembun kembali menjadi tetesan.</p>
                  </div>
                </li>
              </ol>
            </div>

            <!-- Hypothesis Box -->
            <div class="comic-card p-5 bg-amber-50/60 border-amber-200">
              <h3 class="font-fun text-sm font-bold text-amber-900 flex items-center gap-2 mb-2">
                <span>💡</span> Dugaan Awal (Hipotesis)
              </h3>
              <p class="text-xs text-amber-800 mb-2">Apa yang akan terjadi pada suhu es saat terus dipanaskan?</p>
              <select id="lab-hypothesis-select" onchange="window.VirtualLab.state.hypothesis = this.value" class="w-full text-xs p-2.5 rounded-xl border border-amber-300 bg-white font-medium focus:ring-2 focus:ring-amber-400">
                <option value="">-- Pilih Hipotesismu --</option>
                <option value="Suhu naik, es mencair jadi air lalu menguap di 100°C">Es mencair jadi air, lalu mendidih jadi uap pada suhu 100°C</option>
                <option value="Suhu tidak akan pernah berubah sama sekali">Suhu tidak akan berubah sama sekali</option>
                <option value="Es langsung meledak hilang seketika">Es langsung lenyap seketika tanpa mencair</option>
              </select>
            </div>
          </div>

          <!-- Column 2: Interactive Simulation Apparatus (5 cols) -->
          <div class="lg:col-span-5 comic-card p-6 flex flex-col items-center justify-between bg-gradient-to-b from-sky-50/50 via-white to-blue-50/50 min-h-[480px]">
            
            <!-- Digital Thermometer & Status Badge -->
            <div class="w-full flex items-center justify-between px-2">
              <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl shadow-sm border border-slate-200">
                <span class="text-xl">🌡️</span>
                <div>
                  <span class="text-[10px] text-slate-500 font-bold block uppercase">Suhu Termometer</span>
                  <span class="text-xl font-fun font-bold ${this.state.temperature >= 100 ? 'text-red-600' : (this.state.temperature <= 0 ? 'text-cyan-600' : 'text-amber-600')}">
                    ${this.state.temperature}°C
                  </span>
                </div>
              </div>

              <div class="text-right">
                <span class="text-[10px] text-slate-500 font-bold block uppercase">Wujud Benda Saat Ini</span>
                <span class="px-3 py-1 rounded-full text-xs font-bold ${this.getPhaseBadgeClass()}">
                  ${this.getPhaseLabel()}
                </span>
              </div>
            </div>

            <!-- Visual Rig: Beaker & Bunsen Burner -->
            <div class="relative my-6 flex flex-col items-center">
              
              <!-- Cold Condenser Lid (if placed) -->
              <div class="h-6 w-44 transition-all duration-500 flex items-center justify-center">
                ${this.state.hasLid ? `
                  <div class="w-40 h-4 bg-sky-200/80 border-2 border-sky-400 rounded-full shadow flex items-center justify-center gap-1">
                    <span class="text-[10px] font-bold text-sky-800">Tutup Kaca Dingin (Titik Embun 💧)</span>
                  </div>
                ` : ''}
              </div>

              <!-- Beaker Glassware -->
              <div class="lab-beaker">
                <!-- Condensation droplets under lid -->
                ${this.state.hasLid && this.state.temperature >= 70 ? `
                  <div class="absolute top-1 left-0 right-0 flex justify-around text-xs animate-bounce-gentle">
                    <span>💧</span><span>💧</span><span>💧</span><span>💧</span>
                  </div>
                ` : ''}

                <!-- Rising Steam Bubbles (when boiling) -->
                ${this.state.temperature >= 90 ? `
                  <div class="steam-bubble" style="left: 20%; animation-delay: 0s;"></div>
                  <div class="steam-bubble" style="left: 45%; animation-delay: 0.6s;"></div>
                  <div class="steam-bubble" style="left: 70%; animation-delay: 1.2s;"></div>
                ` : ''}

                <!-- Liquid Water in Beaker -->
                <div class="lab-water" style="height: ${this.getWaterHeight()}%; background: ${this.getWaterColor()};"></div>

                <!-- Ice Cubes in Beaker -->
                ${this.state.hasIce && this.state.temperature < 20 ? `
                  <div class="lab-ice" style="opacity: ${this.state.temperature <= 0 ? '1' : '0.4'};">
                    <span class="text-3xl animate-float">🧊</span>
                    <span class="text-2xl animate-float" style="animation-delay: 0.5s;">🧊</span>
                  </div>
                ` : ''}
              </div>

              <!-- Beaker Stand / Tripod -->
              <div class="w-44 h-3 bg-slate-400 rounded-full my-1 shadow-inner"></div>
              <div class="w-36 flex justify-between h-8 -mt-1 px-3">
                <div class="w-2.5 h-full bg-slate-500 rounded-b"></div>
                <div class="w-2.5 h-full bg-slate-500 rounded-b"></div>
              </div>

              <!-- Bunsen Burner & Flame -->
              <div class="relative -mt-3 flex flex-col items-center">
                ${this.state.burnerLevel > 0 ? `
                  <div class="lab-burner-flame" style="transform: scale(${this.state.burnerLevel === 2 ? '1.3' : '0.9'});"></div>
                ` : '<div class="h-[50px]"></div>'}
                
                <div class="w-12 h-14 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-700 rounded-t-lg shadow flex flex-col items-center justify-end pb-1 border-b-4 border-slate-800">
                  <div class="w-4 h-4 rounded-full bg-amber-400 border border-amber-600"></div>
                </div>
              </div>

            </div>

            <!-- Interactive Action Controls -->
            <div class="w-full grid grid-cols-2 gap-3 mt-2">
              <button onclick="window.VirtualLab.addIce()" ${this.state.hasIce ? 'disabled' : ''} class="btn-fun ${this.state.hasIce ? 'bg-slate-200 text-slate-400 border-none cursor-not-allowed' : 'btn-fun-primary'} font-bold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5">
                <span>🧊</span> Masukkan Es Batu
              </button>

              <button onclick="window.VirtualLab.toggleLid()" ${!this.state.hasIce ? 'disabled' : ''} class="btn-fun ${!this.state.hasIce ? 'bg-slate-200 text-slate-400 border-none cursor-not-allowed' : 'btn-fun-purple'} font-bold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5">
                <span>🛡️</span> ${this.state.hasLid ? 'Lepas Tutup Kaca' : 'Pasang Tutup Kaca'}
              </button>

              <div class="col-span-2 flex items-center justify-between bg-slate-100 p-2.5 rounded-2xl border border-slate-200">
                <span class="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>🔥</span> Pembakar Bunsen:
                </span>
                <div class="flex items-center gap-1">
                  <button onclick="window.VirtualLab.setBurner(0)" class="px-2.5 py-1 text-xs font-bold rounded-xl transition ${this.state.burnerLevel === 0 ? 'bg-slate-700 text-white shadow' : 'bg-white text-slate-700'}">Mati</button>
                  <button onclick="window.VirtualLab.setBurner(1)" class="px-2.5 py-1 text-xs font-bold rounded-xl transition ${this.state.burnerLevel === 1 ? 'bg-orange-500 text-white shadow' : 'bg-white text-slate-700'}">Api Sedang</button>
                  <button onclick="window.VirtualLab.setBurner(2)" class="px-2.5 py-1 text-xs font-bold rounded-xl transition ${this.state.burnerLevel === 2 ? 'bg-red-500 text-white shadow' : 'bg-white text-slate-700'}">Api Besar</button>
                </div>
              </div>
            </div>

          </div>

          <!-- Column 3: Science Journal & Save Results (3 cols) -->
          <div class="lg:col-span-3 space-y-4">
            <div class="comic-card p-5 bg-white flex flex-col justify-between min-h-[480px]">
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b pb-2">
                  <h3 class="font-fun text-sm font-bold text-indigo-900 flex items-center gap-2">
                    <span>📓</span> Jurnal Saintis Cilik
                  </h3>
                  <span class="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-md">Wajib Dicatat</span>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Catatan Pengamatan:</label>
                  <textarea id="lab-notes-input" rows="4" placeholder="Tuliskan apa yang kamu lihat saat es dipanaskan (contoh: es mulai mencair pada suhu 0°C, lalu mendidih di 100°C)..." class="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none leading-relaxed" oninput="window.VirtualLab.state.notes = this.value"></textarea>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Kesimpulan Eksperimen:</label>
                  <textarea id="lab-conclusion-input" rows="3" placeholder="Apa kesimpulanmu tentang pengaruh kalor terhadap perubahan wujud benda?" class="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none leading-relaxed" oninput="window.VirtualLab.state.conclusion = this.value"></textarea>
                </div>
              </div>

              <div class="pt-4 border-t space-y-2">
                <button onclick="window.VirtualLab.submitResults()" class="btn-fun btn-fun-success w-full font-bold py-3 rounded-2xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-md">
                  <span>💾</span> Simpan Hasil Eksperimen
                </button>
                <p class="text-[10px] text-center text-slate-400">Hasilmu akan tersimpan ke rapor dan membuka lencana saintis!</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  addIce() {
    window.sound.playClick();
    this.state.hasIce = true;
    this.state.temperature = -5;
    this.state.phase = 'solid';
    this.render();
  },

  toggleLid() {
    window.sound.playClick();
    this.state.hasLid = !this.state.hasLid;
    this.render();
  },

  setBurner(level) {
    window.sound.playClick();
    this.state.burnerLevel = level;
    if (level > 0) {
      if (!this.state.intervalId) {
        this.startHeatingLoop();
      }
    } else {
      this.stopHeatingLoop();
    }
    this.render();
  },

  startHeatingLoop() {
    if (this.state.intervalId) clearInterval(this.state.intervalId);

    this.state.intervalId = setInterval(() => {
      if (this.state.burnerLevel === 0) {
        // Cooling down slowly towards room temperature (25°C)
        if (this.state.temperature > 25) this.state.temperature -= 1;
        else if (this.state.temperature < 25) this.state.temperature += 1;
      } else {
        // Heating up based on level
        const step = this.state.burnerLevel === 2 ? 4 : 2;
        if (this.state.temperature < 100) {
          this.state.temperature += step;
          if (this.state.temperature >= 100) this.state.temperature = 100;
        }
      }

      this.updateSimulationState();
      this.render();
    }, 800);
  },

  stopHeatingLoop() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
  },

  updateSimulationState() {
    const t = this.state.temperature;
    if (!this.state.hasIce) {
      this.state.phase = 'empty';
    } else if (t <= 0) {
      this.state.phase = 'solid';
    } else if (t > 0 && t < 25) {
      this.state.phase = 'melting';
    } else if (t >= 25 && t < 95) {
      this.state.phase = 'liquid';
    } else if (t >= 95) {
      this.state.phase = this.state.hasLid ? 'condensing' : 'boiling';
      window.sound.playStar();
    }
  },

  getWaterHeight() {
    if (!this.state.hasIce) return 0;
    if (this.state.temperature <= 0) return 15;
    if (this.state.temperature <= 25) return 30;
    if (this.state.temperature < 100) return 55;
    return 65;
  },

  getWaterColor() {
    if (this.state.temperature <= 0) return 'rgba(186, 230, 253, 0.5)';
    if (this.state.temperature < 60) return 'rgba(56, 189, 248, 0.7)';
    return 'rgba(239, 68, 68, 0.4)'; // Hot water indicator
  },

  getPhaseLabel() {
    switch (this.state.phase) {
      case 'solid': return 'Padat (Es Batu) 🧊';
      case 'melting': return 'Sedang Mencair 💧';
      case 'liquid': return 'Cair (Air Hangat) 🧃';
      case 'boiling': return 'Mendidih & Menguap (Gas) 💨';
      case 'condensing': return 'Mengembun (Kondensasi) 🌧️';
      default: return 'Gelas Kosong 🧪';
    }
  },

  getPhaseBadgeClass() {
    switch (this.state.phase) {
      case 'solid': return 'bg-cyan-100 text-cyan-800';
      case 'melting': return 'bg-blue-100 text-blue-800';
      case 'liquid': return 'bg-amber-100 text-amber-800';
      case 'boiling': return 'bg-red-100 text-red-800 animate-pulse';
      case 'condensing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  },

  resetLab() {
    window.sound.playClick();
    this.stopHeatingLoop();
    this.state = {
      hasIce: false,
      burnerLevel: 0,
      temperature: 25,
      phase: 'empty',
      hasLid: false,
      intervalId: null,
      hypothesis: '',
      notes: '',
      conclusion: '',
      experimentId: this.state.experimentId
    };
    this.render();
  },

  async submitResults() {
    window.sound.playClick();
    const token = localStorage.getItem('student_token');
    if (!token) {
      alert("Silakan login sebagai siswa terlebih dahulu.");
      return;
    }

    const hypothesis = this.state.hypothesis || document.getElementById('lab-hypothesis-select')?.value || 'Pengamatan perubahan wujud zat';
    const notes = this.state.notes || document.getElementById('lab-notes-input')?.value || 'Es mencair saat dipanaskan lalu menguap';
    const conclusion = this.state.conclusion || document.getElementById('lab-conclusion-input')?.value || 'Kalor menyebabkan perubahan wujud dari padat ke cair lalu gas';

    try {
      const res = await fetch('/api/student/experiments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          experiment_id: this.state.experimentId,
          hypothesis_answer: hypothesis,
          notes: notes,
          conclusion_answer: conclusion
        })
      });

      const data = await res.json();
      if (res.ok) {
        window.sound.playFanfare();
        if (data.unlocked_badge && window.showBadgeModal) {
          window.showBadgeModal(data.unlocked_badge);
        } else {
          alert("🎉 Hasil eksperimenmu berhasil disimpan di jurnal belajarmu!");
        }
      } else {
        window.sound.playError();
        alert(data.detail || "Gagal menyimpan hasil eksperimen.");
      }
    } catch (e) {
      window.sound.playError();
      alert("Terjadi kesalahan koneksi server.");
    }
  }
};
