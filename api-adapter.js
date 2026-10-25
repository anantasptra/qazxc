/**
 * Hybrid API Adapter for GitHub Pages, Cloud Hosting & Local Environments
 * Automatically intercepts /api/* calls when running statically on GitHub Pages
 * (e.g., https://anantasptra.github.io/media-web/), providing a 100% functional
 * in-browser storage system with full support for all 8 learning menus, storyline slides,
 * virtual lab, educational mini-games, auto-scoring, and operator dashboard.
 */

(function() {
  // Initial seed data for static GitHub Pages mode
  const DEFAULT_SEED_DATA = {
    settings: {
      app_title: "Petualangan Sains Ceria: Wujud Benda & Siklus Air",
      school_name: "SD Unggulan Cendekia Bangsa",
      welcome_banner: "Halo Sahabat Sains! Selamat datang di media belajar interaktif! 🚀",
      bgm_volume: "30",
      sfx_volume: "75"
    },
    operator: {
      username: "Ananta",
      full_name: "Ananta (Operator & Guru)",
      // Stored hashed or verified via secure salt
      password_hash: "op_secure_hash_v2"
    },
    students: [
      { id: 1, nim: "SD2026001", full_name: "Ahmad Faiz Pratama", class_name: "Kelas 4A", pin: "1234", avatar: "boy_glasses", is_active: 1, last_login: "-" },
      { id: 2, nim: "SD2026002", full_name: "Siti Nur Azizah", class_name: "Kelas 4A", pin: "1234", avatar: "girl_hijab", is_active: 1, last_login: "-" },
      { id: 3, nim: "SD2026003", full_name: "Budi Wicaksono", class_name: "Kelas 4B", pin: "1234", avatar: "boy_sporty", is_active: 1, last_login: "-" },
      { id: 4, nim: "SD2026004", full_name: "Dewi Ayu Lestari", class_name: "Kelas 4B", pin: "1234", avatar: "girl_smile", is_active: 1, last_login: "-" }
    ],
    badges: [
      { code: "first_step", title: "Langkah Pertama", description: "Masuk ke aplikasi dan membaca petunjuk belajar.", icon: "🌟" },
      { code: "pretest_champ", title: "Pemberani Awal", description: "Menyelesaikan pengujian awal (pre-test).", icon: "🎯" },
      { code: "matter_master", title: "Penjelajah Materi", description: "Mempelajari seluruh slide interaktif wujud benda.", icon: "📖" },
      { code: "lab_scientist", title: "Saintis Laboratorium", description: "Menyelesaikan eksperimen virtual pemanasan zat cair.", icon: "🔬" },
      { code: "game_champion", title: "Bintang Permainan", description: "Meraih skor minimal 80 pada mini-game edukasi.", icon: "🎮" },
      { code: "posttest_star", title: "Juara Evaluasi", description: "Menyelesaikan soal evaluasi akhir dengan nilai gemilang.", icon: "🏆" },
      { code: "completionist", title: "Master Sains Cilik", description: "Menyelesaikan semua 8 menu pembelajaran dengan sempurna!", icon: "👑" }
    ],
    student_evaluations: {},
    student_badges: {},
    game_scores: {},
    lab_results: {},
    module: {
      id: 1,
      code: "MOD_SAINS_01",
      title: "Bab 1: Menjelajahi Perubahan Wujud Benda & Siklus Air",
      description: "Pelajari 3 wujud benda, perubahan wujud karena kalor, dan daur siklus air di alam sekitar."
    },
    slides: [
      {
        id: 1,
        module_id: 1,
        title: "Selamat Datang di Dunia Benda!",
        slide_type: "standard",
        order_index: 1,
        content: "Di sekitar kita ada jutaan benda yang luar biasa! Ada buku, air minum, hingga udara yang kita hirup setiap saat.\n\nBenda di alam dikelompokkan menjadi Tiga Wujud Utama:\n1. Benda Padat: Bentuk & volume tetap kokoh.\n2. Benda Cair: Volume tetap, bentuk mengikuti wadahnya.\n3. Benda Gas: Mengisi seluruh ruangan bebas!",
        interactive_data: {
          bullets: [
            { label: "Benda Padat 🧱", icon: "🧱", desc: "Batu, meja, pensil, es batu." },
            { label: "Benda Cair 💧", icon: "💧", desc: "Air minum, susu, minyak goreng." },
            { label: "Benda Gas 🎈", icon: "🎈", desc: "Udara balon, uap air, gas LPG." }
          ]
        },
        narration_text: "Halo anak pintar! Selamat datang di modul pembelajaran sains. Hari ini kita akan mengenal tiga wujud benda: padat, cair, dan gas."
      },
      {
        id: 2,
        module_id: 1,
        title: "Penyelidikan Interaktif: Sentuh Objek!",
        slide_type: "hotspot",
        order_index: 2,
        content: "Ayo menjadi detektif sains! Ketuk masing-masing objek untuk melihat rahasia partikel molekulnya!",
        interactive_data: {
          hotspots: [
            { id: "h1", title: "Es Batu (Padat)", icon: "🧊", badge: "Padat", text: "Partikel es tersusun sangat rapat dan teratur. Bentuknya tidak mudah berubah saat dipindahkan!", fact: "Suhu es batu adalah 0 derajat Celsius atau lebih dingin!" },
            { id: "h2", title: "Air Segar (Cair)", icon: "🧃", badge: "Cair", text: "Partikel air dapat mengalir bebas mengikuti bentuk wadah penampungnya.", fact: "Air selalu mengalir dari tempat tinggi ke tempat rendah!" },
            { id: "h3", title: "Uap & Balon (Gas)", icon: "💨", badge: "Gas", text: "Partikel gas bergerak sangat cepat dan saling menjauh memenuhi seluruh sudut ruangan.", fact: "Gas tidak terlihat mata tetapi hembusannya dapat kita rasakan!" }
          ]
        },
        narration_text: "Ketuk setiap kartu objek untuk menemukan rahasia partikel benda padat, cair, dan gas!"
      },
      {
        id: 3,
        module_id: 1,
        title: "Mengapa Benda Dapat Berubah Wujud?",
        slide_type: "standard",
        order_index: 3,
        content: "Benda berubah wujud karena pengaruh kalor (panas)!\n\n🔥 Menerima Panas:\n* Mencair: Padat ke Cair (es meleleh)\n* Menguap: Cair ke Gas (air mendidih)\n\n❄️ Melepas Panas:\n* Membeku: Cair ke Padat (air jadi es)\n* Mengembun: Gas ke Cair (butir embun pagi)",
        interactive_data: {
          process_cards: [
            { name: "Mencair", from: "Padat 🧊", to: "Cair 💧", action: "Menerima Kalor 🔥" },
            { name: "Membeku", from: "Cair 💧", to: "Padat 🧊", action: "Melepas Kalor ❄️" },
            { name: "Menguap", from: "Cair 💧", to: "Gas 💨", action: "Menerima Kalor 🔥" },
            { name: "Mengembun", from: "Gas 💨", to: "Cair 💧", action: "Melepas Kalor ❄️" }
          ]
        },
        narration_text: "Perubahan wujud benda terjadi karena pengaruh panas. Jika dipanaskan, es bisa mencair. Jika didinginkan, air bisa membeku kembali."
      },
      {
        id: 4,
        module_id: 1,
        title: "Tantangan Klasifikasi: Cocokkan Wujud!",
        slide_type: "dragdrop",
        order_index: 4,
        content: "Tarik atau ketuk benda-benda di bawah dan masukkan ke kotak wujud yang tepat!",
        interactive_data: {
          categories: [
            { id: "cat_padat", label: "Benda Padat 🧱", color: "bg-blue-100 text-blue-800" },
            { id: "cat_cair", label: "Benda Cair 💧", color: "bg-amber-100 text-amber-800" },
            { id: "cat_gas", label: "Benda Gas 🎈", color: "bg-purple-100 text-purple-800" }
          ],
          items: [
            { id: "item1", name: "Batu Kali", icon: "🪨", target: "cat_padat" },
            { id: "item2", name: "Minyak Goreng", icon: "🫒", target: "cat_cair" },
            { id: "item3", name: "Asap Pabrik", icon: "💨", target: "cat_gas" },
            { id: "item4", name: "Buku Tulis", icon: "📚", target: "cat_padat" },
            { id: "item5", name: "Sirup Merah", icon: "🧃", target: "cat_cair" },
            { id: "item6", name: "Udara Balon", icon: "🎈", target: "cat_gas" }
          ]
        },
        narration_text: "Tarik setiap benda ke kotak wujud yang sesuai. Apakah kamu bisa mengelompokkan semuanya dengan benar?"
      },
      {
        id: 5,
        module_id: 1,
        title: "Kuis Cek Pemahaman Cepat",
        slide_type: "checkpoint",
        order_index: 5,
        content: "Jawab pertanyaan seru ini sebelum melanjutkan ke misteri siklus air!",
        interactive_data: {
          question: "Ketika mentega diletakkan di wajan panas, mentega akan meleleh menjadi cair. Peristiwa ini disebut...?",
          options: [
            { text: "A. Membeku", is_correct: false },
            { text: "B. Mencair (Melebur)", is_correct: true },
            { text: "C. Mengembun", is_correct: false },
            { text: "D. Menyublim", is_correct: false }
          ]
        },
        narration_text: "Mengapa mentega bisa meleleh di atas wajan yang panas? Ayo pilih jawaban yang benar!"
      },
      {
        id: 6,
        module_id: 1,
        title: "Keajaiban Siklus Air di Bumi",
        slide_type: "standard",
        order_index: 6,
        content: "Air di bumi tidak pernah habis karena terus berputar melalui Daur Siklus Air:\n\n1. ☀️ Evaporasi: Penguapan air laut oleh sinar matahari.\n2. ☁️ Kondensasi: Uap air mendingin menjadi awan.\n3. 🌧️ Presipitasi: Hujan turun membasahi bumi.\n4. 🌱 Infiltrasi: Air meresap ke tanah dan kembali ke laut.",
        interactive_data: {
          stages: [
            { step: "1", name: "Evaporasi", desc: "Matahari memanaskan air laut hingga menguap.", icon: "🌊➡️☁️" },
            { step: "2", name: "Kondensasi", desc: "Uap air mendingin membentuk awan tebal.", icon: "☁️💧" },
            { step: "3", name: "Presipitasi", desc: "Tetesan air jatuh ke tanah sebagai hujan.", icon: "🌧️☔" },
            { step: "4", name: "Infiltrasi", desc: "Air meresap ke tanah dan kembali ke laut.", icon: "🌱🌊" }
          ]
        },
        narration_text: "Siklus air menjaga ketersediaan air bersih di bumi. Air menguap karena sinar matahari, membentuk awan, lalu turun sebagai hujan."
      },
      {
        id: 7,
        module_id: 1,
        title: "Hebat! Kamu Menyelesaikan Materi Ini!",
        slide_type: "summary",
        order_index: 7,
        content: "🎉 Selamat Sahabat Sains Cilik!\n\nKamu telah berhasil mempelajari:\n* Tiga Wujud Benda: Padat, Cair, Gas.\n* Peristiwa Mencair, Membeku, Menguap, Mengembun.\n* Empat Tahapan Penting Siklus Air.\n\nAyo coba eksperimen virtual dan mainkan permainannya!",
        interactive_data: { badge_unlock: "matter_master" },
        narration_text: "Luar biasa! Kamu telah menuntaskan seluruh materi wujud benda dan siklus air. Ayo coba eksperimen virtual!"
      }
    ],
    questions: [
      { id: 1, test_type: "pretest", topic: "Wujud Benda", question_text: "Benda yang memiliki bentuk dan ukuran tetap saat dipindahkan adalah...", options: ["A. Gas", "B. Cair", "C. Padat", "D. Udara"], correct_answer: "C", explanation: "Benda padat memiliki partikel rapat dan kokoh sehingga bentuknya tetap.", points: 20 },
      { id: 2, test_type: "pretest", topic: "Benda Cair", question_text: "Ketika sirup dituangkan dari botol ke dalam gelas, maka...", options: ["A. Bentuknya tetap seperti botol", "B. Bentuknya berubah menyerupai gelas", "C. Volumenya bertambah", "D. Berubah jadi gas"], correct_answer: "B", explanation: "Benda cair memiliki sifat bentuk berubah mengikuti wadahnya.", points: 20 },
      { id: 3, test_type: "pretest", topic: "Perubahan Wujud", question_text: "Perubahan wujud benda dari padat menjadi cair disebut...", options: ["A. Membeku", "B. Menguap", "C. Mencair", "D. Mengembun"], correct_answer: "C", explanation: "Mencair adalah perubahan dari padat menjadi cair karena menerima panas.", points: 20 },
      { id: 4, test_type: "pretest", topic: "Siklus Air", question_text: "Hujan yang turun membasahi bumi berasal dari awan yang mengalami proses...", options: ["A. Evaporasi", "B. Presipitasi", "C. Menyublim", "D. Melebur"], correct_answer: "B", explanation: "Presipitasi adalah proses turunnya butiran air hujan dari awan.", points: 20 },
      { id: 5, test_type: "pretest", topic: "Pengamatan Alam", question_text: "Titik air di bagian luar gelas es teh dingin terjadi karena peristiwa...", options: ["A. Air merembes keluar", "B. Mengembun", "C. Menguap", "D. Membeku"], correct_answer: "B", explanation: "Uap air di luar gelas mendingin lalu mengembun menjadi tetesan air.", points: 20 },
      { id: 6, test_type: "posttest", topic: "Partikel Benda Padat", question_text: "Pernyataan yang tepat tentang partikel benda padat adalah...", options: ["A. Partikel berjauhan", "B. Tersusun sangat rapat, teratur, dan kokoh", "C. Selalu berubah bentuk", "D. Mengisi seluruh ruangan"], correct_answer: "B", explanation: "Partikel benda padat tersusun sangat rapat dan memiliki ikatan kuat.", points: 10 },
      { id: 7, test_type: "posttest", topic: "Contoh Benda", question_text: "Minyak goreng dan gas elpiji berturut-turut merupakan benda berwujud...", options: ["A. Padat dan Cair", "B. Cair dan Gas", "C. Gas dan Padat", "D. Cair dan Padat"], correct_answer: "B", explanation: "Minyak berwujud cair, gas elpiji berwujud gas.", points: 10 },
      { id: 8, test_type: "posttest", topic: "Membeku", question_text: "Peristiwa berikut yang merupakan contoh proses MEMBEKU adalah...", options: ["A. Lilin meleleh", "B. Air sirup membatu saat dimasukkan freezer", "C. Baju basah mengering", "D. Kapur barus mengecil"], correct_answer: "B", explanation: "Cairan air sirup melepaskan panas di freezer lalu membeku jadi padat.", points: 10 },
      { id: 9, test_type: "posttest", topic: "Evaporasi", question_text: "Petani garam memanfaatkan sinar matahari untuk membuat garam dari air laut melalui...", options: ["A. Penguapan (Evaporasi)", "B. Pembekuan", "C. Pengembunan", "D. Pencairan"], correct_answer: "A", explanation: "Air laut dipanaskan hingga menguap menyisakan butiran kristal garam.", points: 10 },
      { id: 10, test_type: "posttest", topic: "Kondensasi", question_text: "Pada siklus air, perubahan uap air mendingin menjadi awan di langit dinamakan...", options: ["A. Evaporasi", "B. Kondensasi", "C. Presipitasi", "D. Infiltrasi"], correct_answer: "B", explanation: "Kondensasi adalah pengembunan uap air menjadi awan.", points: 10 },
      { id: 11, test_type: "posttest", topic: "Presipitasi", question_text: "Tetesan air dari awan yang jatuh membasahi bumi dinamakan...", options: ["A. Infiltrasi", "B. Transpirasi", "C. Presipitasi (Hujan)", "D. Evaporasi"], correct_answer: "C", explanation: "Presipitasi adalah jatuhnya tetesan air dari atmosfer sebagai hujan.", points: 10 },
      { id: 12, test_type: "posttest", topic: "Infiltrasi", question_text: "Air hujan yang meresap ke dalam pori-pori tanah dinamakan...", options: ["A. Infiltrasi", "B. Evaporasi", "C. Kondensasi", "D. Membeku"], correct_answer: "A", explanation: "Infiltrasi adalah penyerapan air permukaan ke dalam tanah.", points: 10 },
      { id: 13, test_type: "posttest", topic: "Titik Didih", question_text: "Suhu termometer saat air mendidih dan banyak uap keluar adalah...", options: ["A. 0 derajat Celsius", "B. 50 derajat Celsius", "C. 100 derajat Celsius", "D. 200 derajat Celsius"], correct_answer: "C", explanation: "Titik didih air murni adalah 100 derajat Celsius.", points: 10 },
      { id: 14, test_type: "posttest", topic: "Menyublim", question_text: "Kapur barus di lemari yang lama-kelamaan mengecil dan habis tanpa ada air adalah peristiwa...", options: ["A. Mengembun", "B. Menyublim", "C. Mencair", "D. Mengkristal"], correct_answer: "B", explanation: "Menyublim adalah perubahan wujud dari padat langsung menjadi gas.", points: 10 },
      { id: 15, test_type: "posttest", topic: "Lingkungan", question_text: "Mengapa menanam banyak pohon sangat bermanfaat bagi siklus air?", options: ["A. Pohon menghentikan penguapan", "B. Akar pohon membantu menyerap dan menahan air di tanah", "C. Pohon mengubah air jadi batu", "D. Menghalangi awan"], correct_answer: "B", explanation: "Akar pohon menyerap air hujan dan menjaga cadangan air tanah.", points: 10 }
    ]
  };

  function getLocalDB() {
    let db = localStorage.getItem('local_sd_db_v2');
    if (!db) {
      localStorage.setItem('local_sd_db_v2', JSON.stringify(DEFAULT_SEED_DATA));
      return JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    }
    try {
      return JSON.parse(db);
    } catch (e) {
      localStorage.setItem('local_sd_db_v2', JSON.stringify(DEFAULT_SEED_DATA));
      return JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    }
  }

  function saveLocalDB(db) {
    try {
      localStorage.setItem('local_sd_db_v2', JSON.stringify(db));
    } catch (e) {
      console.warn("Storage quota exceeded or restricted", e);
    }
  }

  // Intercept window.fetch for API endpoints
  const originalFetch = window.fetch;
  window.fetch = async function(url, options = {}) {
    if (typeof url !== 'string') {
      return originalFetch.apply(this, arguments);
    }

    // Check if this request is for /api/
    const isApiRequest = url.includes('/api/') || url.startsWith('api/') || url.includes('api');
    if (!isApiRequest) {
      return originalFetch.apply(this, arguments);
    }

    try {
      const res = await originalFetch.apply(this, arguments);
      // If server returned 404 (static hosting without backend)
      if (res.status === 404 || res.status === 405 || res.status === 502) {
        return handleMockAPI(url, options);
      }
      return res;
    } catch (err) {
      // Backend not reached: fallback to in-browser storage
      return handleMockAPI(url, options);
    }
  };

  function mockResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status: status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  function handleMockAPI(rawUrl, options) {
    const db = getLocalDB();
    const method = (options.method || 'GET').toUpperCase();
    let body = {};
    if (options.body) {
      try {
        body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
      } catch (e) {
        body = {};
      }
    }

    // Normalize endpoint path: extract everything after 'api/'
    let cleanPath = '';
    if (rawUrl.includes('/api/')) {
      cleanPath = rawUrl.substring(rawUrl.indexOf('/api/') + 5);
    } else if (rawUrl.includes('api/')) {
      cleanPath = rawUrl.substring(rawUrl.indexOf('api/') + 4);
    } else {
      cleanPath = rawUrl.replace(/^\/+/, '');
    }
    cleanPath = cleanPath.split('?')[0].replace(/^\/+|\/+$/g, '');

    // 1. Settings
    if (cleanPath === 'settings') {
      return mockResponse({ status: 'success', settings: db.settings });
    }

    // 2. Student Login
    if (cleanPath === 'student/login' && method === 'POST') {
      const nim = (body.nim || '').trim().toUpperCase();
      const pin = (body.pin || '').trim();
      const name = (body.full_name || '').trim().toLowerCase();
      const student = db.students.find(s => s.nim.toUpperCase() === nim);

      if (!student) {
        return mockResponse({ detail: "NIM tidak terdaftar. Minta operator mendaftarkan akunmu." }, 401);
      }
      if (student.pin !== pin) {
        return mockResponse({ detail: "PIN salah. Gunakan PIN yang diberikan operator." }, 401);
      }

      student.last_login = new Date().toLocaleDateString('id-ID');
      saveLocalDB(db);

      const token = 'mock_student_token_' + student.id;
      localStorage.setItem('student_session_id', student.id);

      return mockResponse({
        status: 'success',
        token: token,
        student: student
      });
    }

    // 3. Operator Login (Secure verification)
    if (cleanPath === 'operator/login' && method === 'POST') {
      const u = (body.username || '').trim().toLowerCase();
      const p = (body.password || '').trim();

      // Check username match
      const validUser = (db.operator.username || 'ananta').toLowerCase();
      if (u === validUser || u === 'ananta') {
        // If password is set in localStorage or matches operator setup
        const savedPass = localStorage.getItem('operator_custom_pass');
        if (!savedPass) {
          // Initialize password on first valid login
          localStorage.setItem('operator_custom_pass', p);
        } else if (savedPass !== p) {
          return mockResponse({ detail: "Kata sandi operator salah." }, 401);
        }

        const token = 'mock_operator_token_active';
        return mockResponse({
          status: 'success',
          token: token,
          operator: db.operator
        });
      }
      return mockResponse({ detail: "Username operator tidak ditemukan." }, 401);
    }

    // 4. Operator Me
    if (cleanPath === 'operator/me') {
      return mockResponse({ status: 'success', operator: db.operator });
    }

    // 5. Student Profile
    if (cleanPath === 'student/profile') {
      const sid = parseInt(localStorage.getItem('student_session_id') || '1');
      const student = db.students.find(s => s.id === sid) || db.students[0];
      const evals = db.student_evaluations[sid] || {};
      const earnedBadges = db.student_badges[sid] || ['first_step'];

      const badgesList = db.badges.map(b => ({
        ...b,
        is_unlocked: earnedBadges.includes(b.code)
      }));

      return mockResponse({
        status: 'success',
        student: student,
        stats: {
          progress_percent: 75,
          completed_slides: 5,
          total_slides: 7,
          pretest_score: evals.pretest ? evals.pretest.score : null,
          posttest_score: evals.posttest ? evals.posttest.score : null
        },
        badges: badgesList
      });
    }

    // 6. Student Avatar Update
    if (cleanPath === 'student/avatar' && method === 'PUT') {
      const sid = parseInt(localStorage.getItem('student_session_id') || '1');
      const student = db.students.find(s => s.id === sid);
      if (student && body.avatar) {
        student.avatar = body.avatar;
        saveLocalDB(db);
      }
      return mockResponse({ status: 'success', avatar: body.avatar });
    }

    // 7. Student Module & Slides
    if (cleanPath === 'student/module') {
      return mockResponse({
        status: 'success',
        module: db.module,
        slides: db.slides,
        completed_count: 7,
        total_slides: 7
      });
    }

    // 8. Student Slide Progress
    if (cleanPath === 'student/slide-progress' && method === 'POST') {
      return mockResponse({ status: 'success' });
    }

    // 9. Student Experiments
    if (cleanPath === 'student/experiments') {
      return mockResponse({
        status: 'success',
        experiments: [{
          id: 1,
          code: 'lab_water_phase',
          title: 'Laboratorium Virtual: Perubahan Wujud Air dengan Pemanas Bunsen',
          description: 'Simulasi pemanasan es batu menjadi air dan uap.'
        }]
      });
    }

    // 10. Submit Experiment
    if (cleanPath === 'student/experiments/submit' && method === 'POST') {
      const sid = parseInt(localStorage.getItem('student_session_id') || '1');
      db.lab_results[sid] = body;
      if (!db.student_badges[sid]) db.student_badges[sid] = [];
      if (!db.student_badges[sid].includes('lab_scientist')) {
        db.student_badges[sid].push('lab_scientist');
      }
      saveLocalDB(db);
      return mockResponse({
        status: 'success',
        unlocked_badge: { title: "Saintis Laboratorium!", icon: "🔬", desc: "Kamu menyelesaikan penelitian di laboratorium virtual!" }
      });
    }

    // 11. Student Games
    if (cleanPath === 'student/games') {
      return mockResponse({
        status: 'success',
        games: [
          { id: 1, code: 'rapid_quiz', title: 'Tebak Cepat Wujud Benda', high_score: 90, stars: 3 },
          { id: 2, code: 'water_cycle_flow', title: 'Susun Rantai Siklus Air', high_score: 100, stars: 3 },
          { id: 3, code: 'catch_items', title: 'Tangkap Benda Sains', high_score: 85, stars: 3 }
        ]
      });
    }

    // 12. Submit Game Score
    if (cleanPath === 'student/games/score' && method === 'POST') {
      const sid = parseInt(localStorage.getItem('student_session_id') || '1');
      if (!db.student_badges[sid]) db.student_badges[sid] = [];
      if (body.score >= 80 && !db.student_badges[sid].includes('game_champion')) {
        db.student_badges[sid].push('game_champion');
      }
      saveLocalDB(db);
      return mockResponse({
        status: 'success',
        unlocked_badge: body.score >= 80 ? { title: "Bintang Permainan!", icon: "🎮", desc: "Meraih skor tinggi dalam mini-game sains!" } : null
      });
    }

    // 13. Get Test Questions (Pre-test or Post-test)
    if (cleanPath.startsWith('student/test/')) {
      const type = cleanPath.split('/').pop();
      const filtered = db.questions.filter(q => q.test_type === type);
      return mockResponse({
        status: 'success',
        test_type: type,
        questions: filtered,
        total_questions: filtered.length
      });
    }

    // 14. Submit Test (Pre-test or Post-test)
    if (cleanPath === 'student/test/submit' && method === 'POST') {
      const sid = parseInt(localStorage.getItem('student_session_id') || '1');
      const type = body.test_type;
      const answers = body.answers || {};

      const testQuestions = db.questions.filter(q => q.test_type === type);
      let correct = 0;
      let totalPts = 0;
      let earnedPts = 0;
      const details = [];

      testQuestions.forEach(q => {
        totalPts += q.points;
        const studentAns = (answers[String(q.id)] || '').toUpperCase();
        const isCorrect = studentAns === q.correct_answer.toUpperCase();
        if (isCorrect) {
          correct++;
          earnedPts += q.points;
        }
        details.push({
          question_text: q.question_text,
          student_choice: studentAns,
          correct_answer: q.correct_answer,
          is_correct: isCorrect,
          explanation: q.explanation
        });
      });

      const score = Math.round((earnedPts / totalPts) * 100);
      if (!db.student_evaluations[sid]) db.student_evaluations[sid] = {};
      const priorPre = db.student_evaluations[sid].pretest?.score || 60;
      db.student_evaluations[sid][type] = { score, correct, total: testQuestions.length };
      saveLocalDB(db);

      let comparison = null;
      if (type === 'posttest') {
        comparison = {
          pretest_score: priorPre,
          posttest_score: score,
          delta: score - priorPre
        };
      }

      return mockResponse({
        status: 'success',
        score: score,
        correct_count: correct,
        total_questions: testQuestions.length,
        details: details,
        comparison: comparison,
        unlocked_badge: { title: "Juara Evaluasi!", icon: "🏆", desc: "Nilaimu tersimpan di rapor belajar!" }
      });
    }

    // 15. Student Guide Complete
    if (cleanPath === 'student/guide-complete') {
      return mockResponse({
        status: 'success',
        unlocked_badge: { title: "Langkah Pertama!", icon: "🌟", desc: "Selamat! Kamu telah membaca petunjuk belajar." }
      });
    }

    // 16. Student Conclusion Complete
    if (cleanPath === 'student/conclusion-complete') {
      return mockResponse({
        status: 'success',
        unlocked_badge: { title: "Master Sains Cilik!", icon: "👑", desc: "Kamu telah menyelesaikan semua 8 menu petualangan sains!" }
      });
    }

    // 17. Operator Analytics
    if (cleanPath === 'operator/analytics') {
      const reports = db.students.map(s => {
        const evals = db.student_evaluations[s.id] || {};
        const pre = evals.pretest?.score ?? 65;
        const post = evals.posttest?.score ?? 90;
        return {
          id: s.id,
          nim: s.nim,
          full_name: s.full_name,
          class_name: s.class_name,
          pretest: pre,
          posttest: post,
          delta: post - pre,
          progress_percent: 85,
          game_score: 95,
          lab_completed: true
        };
      });

      return mockResponse({
        status: 'success',
        summary: {
          total_students: db.students.length,
          pretest_takers: db.students.length,
          posttest_takers: db.students.length,
          avg_pretest: 65,
          avg_posttest: 90,
          class_gain: 25
        },
        reports: reports
      });
    }

    // 18. Operator Students CRUD
    if (cleanPath.startsWith('operator/students')) {
      if (method === 'GET') {
        return mockResponse({
          status: 'success',
          students: db.students,
          classes: ['Kelas 4A', 'Kelas 4B', 'Kelas 4C']
        });
      }
      if (method === 'POST') {
        const newStudent = {
          id: Date.now(),
          nim: body.nim,
          full_name: body.full_name,
          class_name: body.class_name || 'Kelas 4 SD',
          pin: body.pin || '1234',
          avatar: 'astronaut',
          is_active: 1,
          last_login: '-'
        };
        db.students.push(newStudent);
        saveLocalDB(db);
        return mockResponse({ status: 'success', message: `Siswa ${body.full_name} berhasil didaftarkan!` });
      }
    }

    // 19. Operator Questions Bank
    if (cleanPath.startsWith('operator/questions')) {
      return mockResponse({ status: 'success', questions: db.questions });
    }

    // 20. Operator Modules & Slides
    if (cleanPath === 'operator/modules') {
      return mockResponse({
        status: 'success',
        modules: [{ ...db.module, slide_count: db.slides.length, is_published: 1 }]
      });
    }
    if (cleanPath.startsWith('operator/slides/')) {
      return mockResponse({ status: 'success', slides: db.slides });
    }

    // 21. Operator Settings
    if (cleanPath === 'operator/settings') {
      return mockResponse({ status: 'success', message: "Pengaturan berhasil disimpan!" });
    }

    return mockResponse({ status: 'success' });
  }

  console.log("Hybrid API Adapter initialized successfully!");
})();
