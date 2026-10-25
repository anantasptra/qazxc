/**
 * Educational Mini-Games Component for Elementary Students
 * Contains 3 playable, engaging games:
 * 1. Rapid Quiz (Tebak Cepat Wujud Benda)
 * 2. Water Cycle Flow (Susun Rantai Siklus Air)
 * 3. Catch Items (Tangkap Benda Sains)
 */

window.EduGames = {
  currentGame: null,
  container: null,

  init(containerId) {
    this.container = document.getElementById(containerId);
    this.renderMenu();
  },

  renderMenu() {
    if (!this.container) return;
    this.stopAnyGame();

    this.container.innerHTML = `
      <div class="space-y-6">
        <!-- Games Header -->
        <div class="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl shadow-inner animate-float">
              🎮
            </div>
            <div>
              <span class="bg-yellow-300 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Arena Bermain & Belajar</span>
              <h2 class="text-2xl md:text-3xl font-fun font-bold mt-1">Permainan Edukasi Sains</h2>
              <p class="text-purple-100 text-sm">Mainkan 3 mini game seru, kumpulkan bintang, dan jadilah juara kelas!</p>
            </div>
          </div>
          <button onclick="window.studentApp.navigate('dashboard')" class="btn-fun bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-2xl text-sm flex items-center gap-2 border border-white/30">
            🏠 Kembali ke Dashboard
          </button>
        </div>

        <!-- 3 Game Selection Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Game 1 Card -->
          <div class="comic-card p-6 flex flex-col justify-between border-blue-200 hover:border-blue-400 group">
            <div class="space-y-3">
              <div class="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl group-hover:scale-110 transition">
                ⚡
              </div>
              <span class="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">Refleks Cepat • 60 Detik</span>
              <h3 class="font-fun text-xl font-bold text-slate-800">Tebak Cepat Wujud Benda</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Tebak secepat kilat apakah benda yang meluncur adalah Padat, Cair, atau Gas sebelum waktu habis!
              </p>
            </div>
            <div class="pt-6">
              <button onclick="window.EduGames.startRapidQuiz()" class="btn-fun btn-fun-primary w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
                <span>▶️</span> Mainkan Sekarang
              </button>
            </div>
          </div>

          <!-- Game 2 Card -->
          <div class="comic-card p-6 flex flex-col justify-between border-cyan-200 hover:border-cyan-400 group">
            <div class="space-y-3">
              <div class="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center text-3xl group-hover:scale-110 transition">
                🧩
              </div>
              <span class="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700">Teka-teki Urutan • Santai</span>
              <h3 class="font-fun text-xl font-bold text-slate-800">Susun Rantai Siklus Air</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Susun 4 kartu tahapan daur air agar tetesan air dapat kembali berputar mengalir ke samudera!
              </p>
            </div>
            <div class="pt-6">
              <button onclick="window.EduGames.startWaterCycleFlow()" class="btn-fun btn-fun-amber w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
                <span>▶️</span> Mainkan Sekarang
              </button>
            </div>
          </div>

          <!-- Game 3 Card -->
          <div class="comic-card p-6 flex flex-col justify-between border-purple-200 hover:border-purple-400 group">
            <div class="space-y-3">
              <div class="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl group-hover:scale-110 transition">
                🪣
              </div>
              <span class="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">Aksi Tangkap • 45 Detik</span>
              <h3 class="font-fun text-xl font-bold text-slate-800">Tangkap Benda Sains</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Kendalikan keranjang sains ke kiri dan ke kanan untuk menangkap benda yang meluncur jatuh sesuai misi!
              </p>
            </div>
            <div class="pt-6">
              <button onclick="window.EduGames.startCatchGame()" class="btn-fun btn-fun-purple w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
                <span>▶️</span> Mainkan Sekarang
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  stopAnyGame() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  },

  /* =========================================================================
     GAME 1: TEBAK CEPAT WUJUD BENDA (RAPID QUIZ)
     ========================================================================= */
  startRapidQuiz() {
    window.sound.playClick();
    this.stopAnyGame();
    this.currentGame = 'rapid_quiz';

    const itemsBank = [
      { name: "Batu Kali", icon: "🪨", type: "padat" },
      { name: "Susu Cokelat", icon: "🥛", type: "cair" },
      { name: "Udara Balon", icon: "🎈", type: "gas" },
      { name: "Minyak Goreng", icon: "🫒", type: "cair" },
      { name: "Buku Tulis", icon: "📚", type: "padat" },
      { name: "Uap Kopi Panas", icon: "☕", type: "gas" },
      { name: "Sirup Merah", icon: "🍹", type: "cair" },
      { name: "Kelereng Kaca", icon: "🔮", type: "padat" },
      { name: "Asap Truk", icon: "💨", type: "gas" },
      { name: "Es Krim Meleleh", icon: "🍦", type: "cair" },
      { name: "Meja Kayu", icon: "🪑", type: "padat" },
      { name: "Gas LPG", icon: "♨️", type: "gas" },
      { name: "Air Sungai", icon: "💧", type: "cair" },
      { name: "Pensil Warna", icon: "✏️", type: "padat" },
      { name: "Angin Sejuk", icon: "🍃", type: "gas" }
    ];

    let score = 0;
    let combo = 0;
    let timeLeft = 60;
    let currentItem = null;

    const pickItem = () => {
      const idx = Math.floor(Math.random() * itemsBank.length);
      currentItem = itemsBank[idx];
    };
    pickItem();

    const renderGame = () => {
      this.container.innerHTML = `
        <div class="max-w-2xl mx-auto space-y-6">
          <div class="flex items-center justify-between bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-200">
            <button onclick="window.EduGames.renderMenu()" class="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
              ⬅️ Keluar Game
            </button>
            <div class="flex items-center gap-6">
              <div class="text-center">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Waktu</span>
                <span class="text-2xl font-fun font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-800'}">${timeLeft}s</span>
              </div>
              <div class="text-center">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Skor</span>
                <span class="text-2xl font-fun font-bold text-blue-600">${score}</span>
              </div>
              <div class="text-center">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Kombo</span>
                <span class="text-2xl font-fun font-bold text-amber-500">🔥 ${combo}x</span>
              </div>
            </div>
          </div>

          <div class="comic-card p-10 text-center space-y-6 bg-gradient-to-b from-white to-blue-50/50">
            <span class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Tebak Wujud Benda Ini!</span>
            
            <div class="py-4">
              <div class="text-7xl mb-4 animate-bounce-gentle">${currentItem.icon}</div>
              <h2 class="text-3xl font-fun font-bold text-slate-800">${currentItem.name}</h2>
            </div>

            <div class="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4">
              <button onclick="window.EduGames.answerRapid('padat')" class="btn-fun btn-fun-primary py-4 rounded-2xl font-bold text-base flex flex-col items-center gap-1">
                <span class="text-2xl">🧱</span>
                <span>PADAT</span>
              </button>
              <button onclick="window.EduGames.answerRapid('cair')" class="btn-fun btn-fun-amber py-4 rounded-2xl font-bold text-base flex flex-col items-center gap-1">
                <span class="text-2xl">💧</span>
                <span>CAIR</span>
              </button>
              <button onclick="window.EduGames.answerRapid('gas')" class="btn-fun btn-fun-purple py-4 rounded-2xl font-bold text-base flex flex-col items-center gap-1">
                <span class="text-2xl">🎈</span>
                <span>GAS</span>
              </button>
            </div>
          </div>
        </div>
      `;
    };

    window.EduGames.answerRapid = (ans) => {
      if (ans === currentItem.type) {
        window.sound.playSuccess();
        combo++;
        const bonus = combo > 3 ? 15 : 10;
        score += bonus;
      } else {
        window.sound.playError();
        combo = 0;
      }
      pickItem();
      renderGame();
    };

    renderGame();

    this.gameInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        this.stopAnyGame();
        this.finishGame('rapid_quiz', score);
      } else {
        renderGame();
      }
    }, 1000);
  },

  /* =========================================================================
     GAME 2: SUSUN RANTAI SIKLUS AIR (SEQUENCE PUZZLE)
     ========================================================================= */
  startWaterCycleFlow() {
    window.sound.playClick();
    this.stopAnyGame();
    this.currentGame = 'water_cycle_flow';

    const stages = [
      { id: 1, name: "Evaporasi", icon: "☀️🌊", desc: "Air laut dipanaskan matahari lalu menguap ke langit." },
      { id: 2, name: "Kondensasi", icon: "☁️💧", desc: "Uap air mendingin menjadi partikel awan tebal." },
      { id: 3, name: "Presipitasi", icon: "🌧️☔", desc: "Tetesan air jatuh ke tanah sebagai hujan lebat." },
      { id: 4, name: "Infiltrasi", icon: "🌱🏞️", desc: "Air meresap ke tanah dan kembali mengalir ke samudera." }
    ];

    // Shuffled available cards
    let available = [...stages].sort(() => Math.random() - 0.5);
    let slots = [null, null, null, null];

    const render = () => {
      const isComplete = slots.every(s => s !== null);
      let isAllCorrect = false;
      if (isComplete) {
        isAllCorrect = slots.every((s, i) => s.id === (i + 1));
      }

      this.container.innerHTML = `
        <div class="max-w-3xl mx-auto space-y-6">
          <div class="flex items-center justify-between bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-200">
            <button onclick="window.EduGames.renderMenu()" class="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
              ⬅️ Keluar Game
            </button>
            <h3 class="font-fun text-lg font-bold text-cyan-800">Teka-teki Rantai Siklus Air</h3>
            <button onclick="window.EduGames.startWaterCycleFlow()" class="text-xs font-bold text-cyan-600 hover:underline">
              🔄 Acak Ulang
            </button>
          </div>

          <!-- Flow slots (1 to 4) -->
          <div class="comic-card p-6 bg-gradient-to-b from-sky-50 to-white space-y-6">
            <p class="text-center text-xs font-bold text-slate-600">Klik kartu di bawah untuk menempatkannya pada urutan siklus air 1 sampai 4:</p>
            
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
              ${slots.map((item, idx) => `
                <div class="flex flex-col items-center">
                  <span class="w-8 h-8 rounded-full bg-cyan-600 text-white font-fun font-bold flex items-center justify-center text-sm mb-2 shadow">
                    ${idx + 1}
                  </span>
                  <div onclick="window.EduGames.removeFromSlot(${idx})" class="w-full min-h-[140px] rounded-2xl border-2 border-dashed ${item ? 'border-cyan-400 bg-cyan-50/70 cursor-pointer shadow-sm' : 'border-slate-300 bg-slate-50'} p-3 flex flex-col items-center justify-center text-center transition">
                    ${item ? `
                      <span class="text-3xl mb-1">${item.icon}</span>
                      <span class="font-fun font-bold text-sm text-cyan-900">${item.name}</span>
                      <span class="text-[10px] text-slate-500 mt-1 line-clamp-2">${item.desc}</span>
                      <span class="text-[10px] text-red-500 font-bold mt-2">Ketuk untuk lepas</span>
                    ` : `
                      <span class="text-xs text-slate-400 font-bold">Slot Urutan ${idx + 1}</span>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>

            ${isComplete ? `
              <div class="pt-4 text-center">
                ${isAllCorrect ? `
                  <div class="p-4 rounded-2xl bg-green-50 border border-green-300 text-green-800 space-y-2">
                    <p class="text-2xl">🎉 Hebat Sekali! Urutan Siklus Air Sempurna!</p>
                    <p class="text-xs">Kamu memahami bahwa air terus berputar dari laut, awan, hujan, tanah, dan kembali ke laut!</p>
                    <button onclick="window.EduGames.finishGame('water_cycle_flow', 100)" class="btn-fun btn-fun-success font-bold px-6 py-2.5 rounded-2xl text-sm mt-2">
                      Selesai & Catat Skor (100 Poin)
                    </button>
                  </div>
                ` : `
                  <div class="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-800 space-y-2">
                    <p class="text-base font-bold">Masih ada urutan yang belum pas! 🤔</p>
                    <p class="text-xs">Ingat: 1. Menguap (Evaporasi) ➡️ 2. Membentuk Awan (Kondensasi) ➡️ 3. Hujan (Presipitasi) ➡️ 4. Meresap ke Tanah (Infiltrasi).</p>
                  </div>
                `}
              </div>
            ` : ''}

          </div>

          <!-- Cards Available to Pick -->
          <div class="comic-card p-6 bg-white space-y-3">
            <h4 class="font-fun text-sm font-bold text-slate-700">Kartu Tersedia:</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              ${available.map((item, idx) => `
                <div onclick="window.EduGames.placeInSlot(${idx})" class="p-3 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:border-cyan-400 hover:bg-cyan-50/50 cursor-pointer transition text-center shadow-sm">
                  <span class="text-2xl block mb-1">${item.icon}</span>
                  <span class="font-fun font-bold text-xs text-slate-800 block">${item.name}</span>
                  <span class="text-[10px] text-slate-500 block mt-1">${item.desc}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    };

    window.EduGames.placeInSlot = (availIdx) => {
      window.sound.playClick();
      const item = available[availIdx];
      // Find first empty slot
      const emptyIdx = slots.indexOf(null);
      if (emptyIdx !== -1) {
        slots[emptyIdx] = item;
        available.splice(availIdx, 1);
        render();
        if (slots.every(s => s !== null)) {
          if (slots.every((s, i) => s.id === (i + 1))) {
            window.sound.playFanfare();
          } else {
            window.sound.playError();
          }
        }
      }
    };

    window.EduGames.removeFromSlot = (slotIdx) => {
      if (slots[slotIdx]) {
        window.sound.playClick();
        available.push(slots[slotIdx]);
        slots[slotIdx] = null;
        render();
      }
    };

    render();
  },

  /* =========================================================================
     GAME 3: TANGKAP BENDA SAINS (CATCH ITEMS ARCADE)
     ========================================================================= */
  startCatchGame() {
    window.sound.playClick();
    this.stopAnyGame();
    this.currentGame = 'catch_items';

    let score = 0;
    let timeLeft = 45;
    let targetType = 'padat'; // padat, cair, gas (alternates)
    let basketX = 50; // percentage (0 to 100)

    const itemsTypes = {
      padat: [{ name: "Batu", icon: "🪨" }, { name: "Buku", icon: "📚" }, { name: "Meja", icon: "🪑" }, { name: "Pensil", icon: "✏️" }],
      cair:  [{ name: "Air", icon: "💧" }, { name: "Susu", icon: "🥛" }, { name: "Minyak", icon: "🫒" }, { name: "Sirup", icon: "🍹" }],
      gas:   [{ name: "Uap", icon: "💨" }, { name: "Balon Gas", icon: "🎈" }, { name: "Asap", icon: "♨️" }, { name: "Angin", icon: "🍃" }]
    };

    let activeDrops = [];
    let dropTimer = 0;

    const render = () => {
      const targetLabel = targetType === 'padat' ? 'BENDA PADAT 🧱' : (targetType === 'cair' ? 'BENDA CAIR 💧' : 'BENDA GAS 🎈');
      const targetBg = targetType === 'padat' ? 'bg-blue-600' : (targetType === 'cair' ? 'bg-amber-600' : 'bg-purple-600');

      this.container.innerHTML = `
        <div class="max-w-2xl mx-auto space-y-4">
          <div class="flex items-center justify-between bg-white px-6 py-3 rounded-3xl shadow-sm border border-slate-200">
            <button onclick="window.EduGames.renderMenu()" class="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
              ⬅️ Keluar Game
            </button>
            <div class="flex items-center gap-6">
              <span class="text-xs font-bold text-slate-500">Waktu: <b class="text-base text-slate-800 font-fun">${timeLeft}s</b></span>
              <span class="text-xs font-bold text-slate-500">Skor: <b class="text-base text-purple-600 font-fun">${score}</b></span>
            </div>
          </div>

          <!-- Target Objective Banner -->
          <div class="text-center p-3 rounded-2xl text-white ${targetBg} shadow-md transition-all duration-300">
            <span class="text-[10px] font-bold uppercase tracking-wider block opacity-80">Misi Saat Ini: Tangkap</span>
            <span class="text-xl font-fun font-bold">${targetLabel}</span>
          </div>

          <!-- Canvas / Playfield -->
          <div id="catch-arena" class="relative w-full h-[360px] bg-gradient-to-b from-sky-100 via-indigo-50 to-blue-100 rounded-3xl overflow-hidden border-4 border-white shadow-inner select-none">
            <!-- Falling Items -->
            ${activeDrops.map(d => `
              <div class="absolute flex flex-col items-center pointer-events-none transition-all duration-75" style="left: ${d.x}%; top: ${d.y}px;">
                <span class="text-3xl filter drop-shadow">${d.icon}</span>
                <span class="text-[9px] font-bold bg-white/90 px-1.5 py-0.5 rounded shadow">${d.name}</span>
              </div>
            `).join('')}

            <!-- Player Basket -->
            <div id="catch-basket" class="absolute bottom-2 -translate-x-1/2 flex flex-col items-center transition-all duration-75" style="left: ${basketX}%;">
              <div class="w-20 h-10 bg-amber-700 border-2 border-amber-900 rounded-b-2xl shadow-lg flex items-center justify-center text-white text-xs font-bold">
                🧺 Keranjang
              </div>
            </div>
          </div>

          <!-- Touch / Button Controls for Mobile & Tablet -->
          <div class="grid grid-cols-2 gap-4">
            <button onclick="window.EduGames.moveBasket(-12)" class="btn-fun bg-white border-2 border-slate-300 py-4 rounded-2xl font-bold text-lg text-slate-700 flex items-center justify-center gap-2 active:bg-slate-100">
              <span>⬅️</span> GESER KIRI
            </button>
            <button onclick="window.EduGames.moveBasket(12)" class="btn-fun bg-white border-2 border-slate-300 py-4 rounded-2xl font-bold text-lg text-slate-700 flex items-center justify-center gap-2 active:bg-slate-100">
              GESER KANAN <span>➡️</span>
            </button>
          </div>
          <p class="text-[11px] text-center text-slate-400">Kamu juga bisa menggunakan tombol Panah Kiri dan Panah Kanan pada keyboard!</p>
        </div>
      `;
    };

    window.EduGames.moveBasket = (delta) => {
      basketX = Math.max(10, Math.min(90, basketX + delta));
      render();
    };

    // Keyboard listener
    const keyHandler = (e) => {
      if (e.key === 'ArrowLeft') window.EduGames.moveBasket(-8);
      else if (e.key === 'ArrowRight') window.EduGames.moveBasket(8);
    };
    window.addEventListener('keydown', keyHandler);

    render();

    // Game loop
    let tickCount = 0;
    this.gameInterval = setInterval(() => {
      tickCount++;
      // Spawn new drop every 12 ticks
      if (tickCount % 12 === 0) {
        const types = ['padat', 'cair', 'gas'];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        const list = itemsTypes[chosenType];
        const item = list[Math.floor(Math.random() * list.length)];
        activeDrops.push({
          x: Math.floor(Math.random() * 80) + 10,
          y: 0,
          type: chosenType,
          name: item.name,
          icon: item.icon
        });
      }

      // Alternate target every 15 seconds
      if (tickCount % 30 === 0) {
        const types = ['padat', 'cair', 'gas'];
        targetType = types[Math.floor(Math.random() * types.length)];
      }

      // Move drops down
      const remainingDrops = [];
      activeDrops.forEach(d => {
        d.y += 8;
        // Check collision with basket
        if (d.y >= 300 && d.y <= 340 && Math.abs(d.x - basketX) < 14) {
          if (d.type === targetType) {
            score += 15;
            window.sound.playStar();
          } else {
            score = Math.max(0, score - 5);
            window.sound.playError();
          }
        } else if (d.y < 350) {
          remainingDrops.push(d);
        }
      });
      activeDrops = remainingDrops;

      if (tickCount % 2 === 0) {
        timeLeft--;
        if (timeLeft <= 0) {
          window.removeEventListener('keydown', keyHandler);
          this.stopAnyGame();
          this.finishGame('catch_items', score);
          return;
        }
      }

      render();
    }, 500);
  },

  /* =========================================================================
     END GAME MODAL & SCORE SUBMIT
     ========================================================================= */
  async finishGame(gameCode, score) {
    window.sound.playFanfare();

    let stars = 1;
    if (score >= 80) stars = 3;
    else if (score >= 40) stars = 2;

    const starsHtml = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    this.container.innerHTML = `
      <div class="max-w-md mx-auto comic-card p-8 text-center space-y-6">
        <div class="text-6xl animate-bounce-gentle">🏆</div>
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-purple-600 block">Permainan Selesai</span>
          <h2 class="text-2xl font-fun font-bold text-slate-800 mt-1">Luar Biasa, Sahabat Sains!</h2>
        </div>

        <div class="bg-purple-50 p-4 rounded-2xl border border-purple-200">
          <div class="text-3xl mb-1">${starsHtml}</div>
          <span class="text-xs font-bold text-slate-500 block">Skor Akhir Kamu:</span>
          <span class="text-4xl font-fun font-bold text-purple-700">${score}</span>
        </div>

        <div class="space-y-3 pt-2">
          <button onclick="window.EduGames.renderMenu()" class="btn-fun btn-fun-primary w-full py-3 rounded-2xl font-bold text-sm">
            🎮 Pilih Permainan Lain
          </button>
          <button onclick="window.studentApp.navigate('dashboard')" class="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800">
            🏠 Kembali ke Dashboard Utama
          </button>
        </div>
      </div>
    `;

    // Submit score to database
    const token = localStorage.getItem('student_token');
    if (token) {
      try {
        const res = await fetch('/api/student/games/score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            game_code: gameCode,
            score: score,
            stars: stars
          })
        });
        const data = await res.json();
        if (data.unlocked_badge && window.showBadgeModal) {
          window.showBadgeModal(data.unlocked_badge);
        }
      } catch (e) {
        console.warn("Failed saving game score:", e);
      }
    }
  }
};
