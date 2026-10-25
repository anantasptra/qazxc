/**
 * Articulate Storyline-like Slide Engine for Elementary Students
 * Features interactive slide types: Standard, Hotspots, Drag & Drop, Checkpoints, and Summary.
 * Built with integrated Web Speech audio narration, cheerful transitions, and progress tracking.
 */

window.StorylinePlayer = {
  module: null,
  slides: [],
  currentIndex: 0,
  container: null,
  isNarrating: false,

  init(containerId, moduleData, slidesData) {
    this.container = document.getElementById(containerId);
    this.module = moduleData;
    this.slides = slidesData || [];
    this.currentIndex = 0;

    // Check if student had a last slide
    if (this.slides.length > 0) {
      this.render();
    } else {
      this.container.innerHTML = `
        <div class="comic-card p-12 text-center text-slate-500">
          <p class="text-4xl mb-2">📭</p>
          <p class="font-fun text-lg font-bold">Belum ada slide materi yang dipublikasikan.</p>
        </div>
      `;
    }
  },

  render() {
    if (!this.container || this.slides.length === 0) return;
    const currentSlide = this.slides[this.currentIndex];
    const total = this.slides.length;
    const progressPercent = Math.round(((this.currentIndex + 1) / total) * 100);

    this.container.innerHTML = `
      <div class="comic-card overflow-hidden border-sky-300 shadow-xl bg-white slide-content-enter">
        
        <!-- Storyline Top Navigation Bar -->
        <div class="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 px-6 py-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl animate-float">📖</span>
            <div>
              <span class="text-[10px] uppercase tracking-wider font-bold bg-white/20 px-2.5 py-0.5 rounded-full">Slide Pembelajaran Interaktif</span>
              <h3 class="font-fun text-lg md:text-xl font-bold truncate max-w-md">${currentSlide.title}</h3>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Audio Narration Controls -->
            <button id="narration-btn" onclick="window.StorylinePlayer.toggleAudioNarration()" class="btn-fun bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-white/30">
              <span id="narration-icon">🔊</span>
              <span id="narration-text">Dengarkan Suara</span>
            </button>

            <!-- Jump-to-Slide Selector -->
            <select onchange="window.StorylinePlayer.goToSlide(parseInt(this.value))" class="bg-white/20 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-white/30 focus:outline-none cursor-pointer">
              ${this.slides.map((s, idx) => `
                <option value="${idx}" class="text-slate-800" ${idx === this.currentIndex ? 'selected' : ''}>
                  Slide ${idx + 1}: ${s.title.substring(0, 20)}...
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Storyline Progress Stepper -->
        <div class="w-full bg-slate-100 h-2 relative">
          <div class="bg-amber-400 h-2 transition-all duration-300" style="width: ${progressPercent}%;"></div>
        </div>

        <!-- Slide Interactive Workspace -->
        <div class="p-6 md:p-10 min-h-[420px] flex flex-col justify-between">
          <div id="slide-interactive-area">
            ${this.renderSlideContent(currentSlide)}
          </div>

          <!-- Bottom Storyline Controls -->
          <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <button onclick="window.StorylinePlayer.prevSlide()" ${this.currentIndex === 0 ? 'disabled' : ''} class="btn-fun ${this.currentIndex === 0 ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'} px-5 py-2.5 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2">
              <span>⬅️</span> Slide Sebelumnya
            </button>

            <span class="text-xs font-bold text-slate-400">
              Halaman <b class="text-sky-600 font-fun text-sm">${this.currentIndex + 1}</b> dari ${total}
            </span>

            ${this.currentIndex < total - 1 ? `
              <button onclick="window.StorylinePlayer.nextSlide()" class="btn-fun btn-fun-primary px-6 py-2.5 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-md">
                Slide Selanjutnya <span>➡️</span>
              </button>
            ` : `
              <button onclick="window.studentApp.navigate('experiment')" class="btn-fun btn-fun-success px-6 py-2.5 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-md">
                Lanjut ke Eksperimen Lab <span>🔬</span>
              </button>
            `}
          </div>
        </div>

      </div>
    `;

    // Save progress to server
    this.recordCurrentProgress();
  },

  renderSlideContent(slide) {
    const type = slide.slide_type;
    const data = slide.interactive_data || {};

    if (type === 'hotspot') {
      return this.renderHotspotSlide(slide, data);
    } else if (type === 'dragdrop') {
      return this.renderDragDropSlide(slide, data);
    } else if (type === 'checkpoint') {
      return this.renderCheckpointSlide(slide, data);
    } else if (type === 'summary') {
      return this.renderSummarySlide(slide, data);
    } else {
      return this.renderStandardSlide(slide, data);
    }
  },

  renderStandardSlide(slide, data) {
    let bulletsHtml = '';
    if (data.bullets && data.bullets.length) {
      bulletsHtml = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          ${data.bullets.map(b => `
            <div class="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3 hover:scale-105 transition shadow-sm">
              <span class="text-3xl">${b.icon}</span>
              <div>
                <h4 class="font-fun font-bold text-sky-900 text-sm">${b.label}</h4>
                <p class="text-xs text-slate-600 mt-1">${b.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    let cardsHtml = '';
    if (data.process_cards && data.process_cards.length) {
      cardsHtml = `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          ${data.process_cards.map(c => `
            <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center hover:shadow-md transition">
              <span class="text-xs font-bold text-amber-800 block uppercase tracking-wider">${c.name}</span>
              <div class="my-2 text-sm font-bold text-slate-700">${c.from} ➡️ ${c.to}</div>
              <span class="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-bold">${c.action}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    let stagesHtml = '';
    if (data.stages && data.stages.length) {
      stagesHtml = `
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          ${data.stages.map(st => `
            <div class="p-4 rounded-2xl bg-gradient-to-b from-blue-50 to-indigo-50 border border-blue-200 text-center space-y-2">
              <span class="w-7 h-7 rounded-full bg-blue-600 text-white font-fun font-bold flex items-center justify-center text-xs mx-auto">${st.step}</span>
              <span class="text-3xl block">${st.icon}</span>
              <h4 class="font-fun font-bold text-slate-800 text-sm">${st.name}</h4>
              <p class="text-xs text-slate-600 leading-relaxed">${st.desc}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    return `
      <div class="space-y-4">
        <h2 class="text-2xl md:text-3xl font-fun font-bold text-slate-800">${slide.title}</h2>
        <div class="prose text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium">
          ${slide.content}
        </div>
        ${bulletsHtml}
        ${cardsHtml}
        ${stagesHtml}
      </div>
    `;
  },

  renderHotspotSlide(slide, data) {
    const hotspots = data.hotspots || [];
    return `
      <div class="space-y-6">
        <div>
          <span class="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Aktivitas Sentuh Objek</span>
          <h2 class="text-2xl md:text-3xl font-fun font-bold text-slate-800 mt-2">${slide.title}</h2>
          <p class="text-sm text-slate-600 mt-1">${slide.content}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          ${hotspots.map((h, idx) => `
            <div onclick="window.StorylinePlayer.openHotspotModal(${idx})" class="comic-card p-6 cursor-pointer hover:border-amber-400 group transition relative bg-white">
              <div class="hotspot-dot absolute top-4 right-4"></div>
              <div class="text-6xl mb-4 group-hover:scale-110 transition duration-300 text-center">${h.icon}</div>
              <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">${h.badge}</span>
              <h4 class="font-fun font-bold text-lg text-slate-800 mt-1">${h.title}</h4>
              <p class="text-xs text-slate-500 mt-2 line-clamp-2">${h.text}</p>
              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-amber-600 text-xs font-bold">
                <span>Klik untuk Rahasia</span>
                <span>👉</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Hotspot Detail Modal Box (Hidden initially) -->
        <div id="hotspot-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-4 border-amber-300 comic-card space-y-4 animate-bounce-gentle">
            <div class="text-center">
              <span id="hotspot-modal-icon" class="text-6xl block mb-2"></span>
              <span id="hotspot-modal-badge" class="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full"></span>
              <h3 id="hotspot-modal-title" class="font-fun text-2xl font-bold text-slate-800 mt-2"></h3>
            </div>
            <p id="hotspot-modal-text" class="text-sm text-slate-700 leading-relaxed text-center font-medium"></p>
            <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span class="text-xs font-bold text-amber-900 flex items-center gap-1 mb-1">
                <span>💡</span> Tahukah Kamu?
              </span>
              <p id="hotspot-modal-fact" class="text-xs text-amber-800"></p>
            </div>
            <button onclick="document.getElementById('hotspot-modal').classList.add('hidden')" class="btn-fun btn-fun-amber w-full py-3 rounded-2xl font-bold text-sm">
              Keren, Saya Mengerti! 🚀
            </button>
          </div>
        </div>
      </div>
    `;
  },

  openHotspotModal(index) {
    window.sound.playClick();
    const currentSlide = this.slides[this.currentIndex];
    const data = currentSlide.interactive_data || {};
    const h = (data.hotspots || [])[index];
    if (!h) return;

    document.getElementById('hotspot-modal-icon').innerText = h.icon;
    document.getElementById('hotspot-modal-badge').innerText = h.badge;
    document.getElementById('hotspot-modal-title').innerText = h.title;
    document.getElementById('hotspot-modal-text').innerText = h.text;
    document.getElementById('hotspot-modal-fact').innerText = h.fact;
    document.getElementById('hotspot-modal').classList.remove('hidden');

    window.sound.playStar();
  },

  renderDragDropSlide(slide, data) {
    const categories = data.categories || [];
    const items = data.items || [];

    return `
      <div class="space-y-6">
        <div>
          <span class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Aktivitas Mencocokkan</span>
          <h2 class="text-2xl md:text-3xl font-fun font-bold text-slate-800 mt-2">${slide.title}</h2>
          <p class="text-sm text-slate-600 mt-1">${slide.content}</p>
        </div>

        <!-- 3 Category Drop Zones -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${categories.map(c => `
            <div id="${c.id}" class="drop-zone p-4 rounded-3xl border-3 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-between text-center min-h-[160px] transition">
              <span class="font-fun font-bold text-sm ${c.color} px-3 py-1 rounded-full mb-3">${c.label}</span>
              <div class="dropped-items-container w-full flex flex-wrap gap-2 justify-center items-center flex-grow">
                <span class="text-xs text-slate-400 font-bold placeholder-text">Tarik / Klik Benda Ke Sini</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Draggable Items Pool -->
        <div class="p-4 rounded-3xl bg-slate-100 border border-slate-200">
          <span class="text-xs font-bold text-slate-500 block mb-3 uppercase tracking-wider">Benda yang Perlu Dikelompokkan:</span>
          <div id="drag-items-pool" class="flex flex-wrap gap-3">
            ${items.map(item => `
              <div id="${item.id}" data-target="${item.target}" onclick="window.StorylinePlayer.handleItemClick('${item.id}')" class="draggable-item bg-white px-4 py-2.5 rounded-2xl shadow-sm border-2 border-slate-200 flex items-center gap-2 cursor-pointer hover:border-sky-400 transition">
                <span class="text-2xl">${item.icon}</span>
                <span class="text-xs font-fun font-bold text-slate-800">${item.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  handleItemClick(itemId) {
    const el = document.getElementById(itemId);
    if (!el) return;
    const targetZoneId = el.getAttribute('data-target');
    const targetZone = document.getElementById(targetZoneId);

    if (targetZone) {
      window.sound.playSuccess();
      const placeholder = targetZone.querySelector('.placeholder-text');
      if (placeholder) placeholder.remove();

      el.classList.add('animate-bounce-gentle', 'border-green-400', 'bg-green-50');
      targetZone.querySelector('.dropped-items-container').appendChild(el);

      // Check if all sorted
      const pool = document.getElementById('drag-items-pool');
      if (pool && pool.children.length === 0) {
        window.sound.playFanfare();
        alert("🎉 Hebat! Kamu berhasil mengelompokkan semua wujud benda dengan benar!");
      }
    }
  },

  renderCheckpointSlide(slide, data) {
    const opts = data.options || [];
    return `
      <div class="max-w-2xl mx-auto space-y-6 text-center py-4">
        <span class="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Cek Pemahaman Cepat</span>
        <h2 class="text-2xl md:text-3xl font-fun font-bold text-slate-800">${slide.title}</h2>
        <div class="p-6 rounded-3xl bg-purple-50/70 border-2 border-purple-200 shadow-sm">
          <p class="text-base md:text-lg font-bold text-purple-950 leading-relaxed">${data.question}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          ${opts.map((opt, idx) => `
            <button onclick="window.StorylinePlayer.checkCheckpointAnswer(${idx}, ${opt.is_correct})" class="checkpoint-opt-btn btn-fun bg-white border-2 border-slate-200 hover:border-purple-400 p-4 rounded-2xl font-bold text-xs md:text-sm text-slate-800 flex items-center justify-between transition">
              <span>${opt.text}</span>
              <span class="opt-result-icon text-lg"></span>
            </button>
          `).join('')}
        </div>

        <div id="checkpoint-feedback" class="hidden p-4 rounded-2xl text-xs md:text-sm font-bold"></div>
      </div>
    `;
  },

  checkCheckpointAnswer(optIdx, isCorrect) {
    const btns = document.querySelectorAll('.checkpoint-opt-btn');
    const feedbackEl = document.getElementById('checkpoint-feedback');

    if (isCorrect) {
      window.sound.playSuccess();
      btns[optIdx].classList.add('bg-green-50', 'border-green-500', 'text-green-900');
      feedbackEl.className = 'p-4 rounded-2xl text-xs md:text-sm font-bold bg-green-100 text-green-900 border border-green-300';
      feedbackEl.innerHTML = '🎉 Jawabanmu Benar Sekali! Mentega menyerap panas sehingga meleleh dari padat menjadi cair.';
      feedbackEl.classList.remove('hidden');
    } else {
      window.sound.playError();
      btns[optIdx].classList.add('bg-red-50', 'border-red-400', 'text-red-900');
      feedbackEl.className = 'p-4 rounded-2xl text-xs md:text-sm font-bold bg-amber-100 text-amber-900 border border-amber-300';
      feedbackEl.innerHTML = '💡 Belum tepat, coba lagi ya! Ingat bahwa mentega menjadi cair karena terkena panas api wajan.';
      feedbackEl.classList.remove('hidden');
    }
  },

  renderSummarySlide(slide, data) {
    return `
      <div class="max-w-xl mx-auto text-center space-y-6 py-6">
        <div class="text-7xl animate-bounce-gentle">🏆</div>
        <div>
          <span class="bg-yellow-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Selamat!</span>
          <h2 class="text-2xl md:text-3xl font-fun font-bold text-slate-800 mt-2">${slide.title}</h2>
        </div>
        <div class="prose text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line bg-amber-50/70 p-6 rounded-3xl border border-amber-200 text-left font-medium">
          ${slide.content}
        </div>
        <button onclick="window.studentApp.navigate('experiment')" class="btn-fun btn-fun-success w-full py-4 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg">
          <span>🔬</span> Lanjut Ke Laboratorium Eksperimen Virtual!
        </button>
      </div>
    `;
  },

  nextSlide() {
    window.sound.playClick();
    if (this.currentIndex < this.slides.length - 1) {
      this.currentIndex++;
      this.render();
    }
  },

  prevSlide() {
    window.sound.playClick();
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.render();
    }
  },

  goToSlide(idx) {
    window.sound.playClick();
    if (idx >= 0 && idx < this.slides.length) {
      this.currentIndex = idx;
      this.render();
    }
  },

  toggleAudioNarration() {
    const currentSlide = this.slides[this.currentIndex];
    const textToSpeak = currentSlide.narration_text || currentSlide.content || currentSlide.title;

    window.sound.toggleNarration(textToSpeak, (isPlaying) => {
      this.isNarrating = isPlaying;
      const icon = document.getElementById('narration-icon');
      const text = document.getElementById('narration-text');
      if (icon && text) {
        icon.innerText = isPlaying ? '⏹️' : '🔊';
        text.innerText = isPlaying ? 'Hentikan Suara' : 'Dengarkan Suara';
      }
    });
  },

  async recordCurrentProgress() {
    const currentSlide = this.slides[this.currentIndex];
    const token = localStorage.getItem('student_token');
    if (!token || !currentSlide) return;

    try {
      const res = await fetch('/api/student/slide-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          module_id: currentSlide.module_id,
          slide_id: currentSlide.id,
          is_completed: this.currentIndex === this.slides.length - 1
        })
      });
      const data = await res.json();
      if (data.unlocked_badge && window.showBadgeModal) {
        window.showBadgeModal(data.unlocked_badge);
      }
    } catch (e) {
      // ignore network errors for background progress sync
    }
  }
};
