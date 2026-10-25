"""
Seed data module: Populates the database with rich curriculum content,
sample students, operator account, slides, experiments, games, questions, and achievements.
"""

import json
from database import get_db_connection, init_db
from auth import hash_password

def seed_all():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Seed Operator (Guru/Admin)
    cursor.execute("""
    INSERT OR REPLACE INTO operators (username, full_name, password_hash)
    VALUES (?, ?, ?)
    """, ('Ananta', 'Ananta', hash_password('12345')))
    cursor.execute("""
    INSERT OR REPLACE INTO operators (username, full_name, password_hash)
    VALUES (?, ?, ?)
    """, ('ananta', 'Ananta', hash_password('12345')))
    print("Operator Ananta created (username: 'Ananta', password: '12345')")

    # 2. Seed Sample Students
    sample_students = [
        ('SD2026001', 'Ahmad Faiz Pratama', 'Kelas 4A', '1234', 'boy_glasses'),
        ('SD2026002', 'Siti Nur Azizah', 'Kelas 4A', '1234', 'girl_hijab'),
        ('SD2026003', 'Budi Wicaksono', 'Kelas 4B', '1234', 'boy_sporty'),
        ('SD2026004', 'Dewi Ayu Lestari', 'Kelas 4B', '1234', 'girl_smile'),
        ('SD2026005', 'Kevin Pratama', 'Kelas 4A', '1234', 'astronaut')
    ]
    for nim, name, class_name, pin, avatar in sample_students:
        cursor.execute("SELECT id FROM students WHERE nim = ?", (nim,))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO students (nim, full_name, class_name, pin_hash, avatar)
            VALUES (?, ?, ?, ?, ?)
            """, (nim, name, class_name, hash_password(pin), avatar))
    print(f"Sample students seeded ({len(sample_students)} students).")

    # 3. Seed Achievements
    achievements = [
        ('first_step', 'Langkah Pertama', 'Masuk ke aplikasi dan membaca petunjuk belajar.', '🌟', 'guide'),
        ('pretest_champ', 'Pemberani Awal', 'Menyelesaikan pengujian awal (pre-test).', '🎯', 'test'),
        ('matter_master', 'Penjelajah Materi', 'Mempelajari seluruh slide interaktif wujud benda.', '📖', 'lesson'),
        ('lab_scientist', 'Saintis Laboratorium', 'Menyelesaikan eksperimen virtual pemanasan zat cair.', '🔬', 'experiment'),
        ('game_champion', 'Bintang Permainan', 'Meraih skor minimal 80 pada mini-game edukasi.', '🎮', 'game'),
        ('posttest_star', 'Juara Evaluasi', 'Menyelesaikan soal evaluasi akhir dengan nilai gemilang.', '🏆', 'test'),
        ('completionist', 'Master Sains Cilik', 'Menyelesaikan semua 8 menu pembelajaran dengan sempurna!', '👑', 'master')
    ]
    for code, title, desc, icon, cat in achievements:
        cursor.execute("SELECT id FROM achievements WHERE code = ?", (code,))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO achievements (code, title, description, icon, category)
            VALUES (?, ?, ?, ?, ?)
            """, (code, title, desc, icon, cat))

    # 4. Seed Media Settings
    settings = [
        ('app_title', 'Petualangan Sains Ceria: Wujud Benda & Siklus Air'),
        ('school_name', 'SD Unggulan Cendekia Bangsa'),
        ('theme_color', 'blue-amber'),
        ('bgm_volume', '30'),
        ('sfx_volume', '75'),
        ('welcome_banner', 'Halo Sahabat Sains! Ayo jelajahi keajaiban ilmu pengetahuan bersama kami! 🚀')
    ]
    for k, v in settings:
        cursor.execute("INSERT OR REPLACE INTO media_settings (key, value) VALUES (?, ?)", (k, v))

    # 5. Seed Module
    cursor.execute("SELECT id FROM modules WHERE code = 'MOD_SAINS_01'")
    module_row = cursor.fetchone()
    if not module_row:
        cursor.execute("""
        INSERT INTO modules (code, title, description, order_index, is_published)
        VALUES (?, ?, ?, ?, ?)
        """, (
            'MOD_SAINS_01',
            'Bab 1: Menjelajahi Perubahan Wujud Benda & Siklus Air',
            'Pelajari 3 wujud benda (padat, cair, gas), proses perubahan wujudnya, dan siklus air di alam sekitar kita.',
            1,
            1
        ))
        module_id = cursor.lastrowid
    else:
        module_id = module_row['id']

    # 6. Seed Interactive Slides (Storyline-like slides)
    slides_data = [
        {
            "title": "Selamat Datang di Dunia Benda!",
            "slide_type": "standard",
            "order_index": 1,
            "content": """Di sekitar kita ada jutaan benda yang luar biasa! Ada buku, air minum, hingga udara yang kita hirup setiap saat. 
            
Tahukah kamu? Benda di alam ini dikelompokkan menjadi **Tiga Wujud Utama**:
1. **Benda Padat** 🧱: Memiliki bentuk dan volume yang tetap.
2. **Benda Cair** 💧: Memiliki volume tetap, tetapi bentuknya mengikuti wadahnya.
3. **Benda Gas** 🎈: Bentuk dan volumenya selalu berubah memenuhi seluruh ruangan!""",
            "interactive_data": json.dumps({
                "bullets": [
                    {"label": "Benda Padat", "icon": "🧱", "desc": "Contoh: Meja, pensil, es batu, batu kali."},
                    {"label": "Benda Cair", "icon": "💧", "desc": "Contoh: Air mineral, susu cokelat, minyak goreng."},
                    {"label": "Benda Gas", "icon": "🎈", "desc": "Contoh: Udara dalam balon, uap air, gas LPG."}
                ]
            }),
            "narration_text": "Halo anak pintar! Selamat datang di modul pembelajaran sains. Hari ini kita akan mengenal tiga wujud benda: padat, cair, dan gas. Yuk tekan tombol selanjutnya untuk melanjutkan petualangan!",
            "image_url": "slide1_three_matters"
        },
        {
            "title": "Penyelidikan Interaktif: Sentuh Objek!",
            "slide_type": "hotspot",
            "order_index": 2,
            "content": "Ayo menjadi detektif sains! **Ketuk atau klik masing-masing objek** di bawah ini untuk melihat keunikan partikel dan sifatnya!",
            "interactive_data": json.dumps({
                "hotspots": [
                    {
                        "id": "h1",
                        "title": "Es Batu (Benda Padat)",
                        "icon": "🧊",
                        "color": "from-cyan-400 to-blue-500",
                        "badge": "Padat",
                        "text": "Es batu memiliki partikel yang tersusun sangat rapat dan teratur. Bentuknya tidak mudah berubah saat dipindahkan ke mangkuk atau meja!",
                        "fact": "Tahukah kamu? Suhu es batu adalah 0 derajat Celsius atau lebih dingin!"
                    },
                    {
                        "id": "h2",
                        "title": "Air Dalam Gelas (Benda Cair)",
                        "icon": "🧃",
                        "color": "from-amber-400 to-orange-500",
                        "badge": "Cair",
                        "text": "Partikel air dapat mengalir bebas! Saat dituangkan dari botol ke mangkuk, bentuk air berubah mengikuti mangkuk, tetapi volumenya tetap sama.",
                        "fact": "Air selalu mengalir dari tempat tinggi ke tempat yang lebih rendah!"
                    },
                    {
                        "id": "h3",
                        "title": "Uap Panas & Balon (Benda Gas)",
                        "icon": "💨",
                        "color": "from-purple-400 to-indigo-500",
                        "badge": "Gas",
                        "text": "Partikel gas bergerak sangat cepat dan saling menjauh. Gas mengisi seluruh sudut ruangan atau balon secara merata!",
                        "fact": "Gas tidak terlihat dengan mata telanjang, tetapi kita bisa merasakan hembusannya!"
                    }
                ]
            }),
            "narration_text": "Ketuk setiap kartu objek untuk menemukan rahasia partikel benda padat, cair, dan gas!",
            "image_url": "slide2_hotspots"
        },
        {
            "title": "Mengapa Benda Dapat Berubah Wujud?",
            "slide_type": "standard",
            "order_index": 3,
            "content": """Benda tidak selamanya diam dalam satu wujud! Benda dapat **berubah wujud** karena dipengaruhi oleh **Suhu / Panas (Kalor)**.

Ada dua kunci utama:
🔥 **Menerima Panas (Dipanaskan):**
* **Mencair:** Dari padat menjadi cair (contoh: es batu meleleh).
* **Menguap:** Dari cair menjadi gas (contoh: air mendidih jadi uap).
* **Menyublim:** Dari padat langsung menjadi gas (contoh: kapur barus mengecil).

❄️ **Melepas Panas (Didinginkan):**
* **Membeku:** Dari cair menjadi padat (contoh: air dimasukkan ke freezer).
* **Mengembun:** Dari gas menjadi cair (contoh: titik-titik air di luar gelas dingin).
* **Mengkristal/Deposisi:** Dari gas menjadi padat (contoh: terbentuknya salju).""",
            "interactive_data": json.dumps({
                "process_cards": [
                    {"name": "Mencair", "from": "Padat 🧊", "to": "Cair 💧", "action": "Menerima Kalor 🔥"},
                    {"name": "Membeku", "from": "Cair 💧", "to": "Padat 🧊", "action": "Melepas Kalor ❄️"},
                    {"name": "Menguap", "from": "Cair 💧", "to": "Gas 💨", "action": "Menerima Kalor 🔥"},
                    {"name": "Mengembun", "from": "Gas 💨", "to": "Cair 💧", "action": "Melepas Kalor ❄️"}
                ]
            }),
            "narration_text": "Perubahan wujud benda terjadi karena adanya pengaruh panas atau kalor. Jika dipanaskan, es bisa mencair. Jika didinginkan, air bisa membeku kembali.",
            "image_url": "slide3_heat_diagram"
        },
        {
            "title": "Tantangan Klasifikasi: Drag & Drop!",
            "slide_type": "dragdrop",
            "order_index": 4,
            "content": "Ayo uji ketangkasanmu! **Tarik atau ketuk benda-benda** berikut dan masukkan ke kotak wujud yang tepat!",
            "interactive_data": json.dumps({
                "categories": [
                    {"id": "cat_padat", "label": "Benda Padat 🧱", "color": "bg-blue-100 border-blue-400 text-blue-800"},
                    {"id": "cat_cair", "label": "Benda Cair 💧", "color": "bg-amber-100 border-amber-400 text-amber-800"},
                    {"id": "cat_gas", "label": "Benda Gas 🎈", "color": "bg-purple-100 border-purple-400 text-purple-800"}
                ],
                "items": [
                    {"id": "item1", "name": "Batu Kali", "icon": "🪨", "target": "cat_padat"},
                    {"id": "item2", "name": "Minyak Goreng", "icon": "🫒", "target": "cat_cair"},
                    {"id": "item3", "name": "Asap Cerobong", "icon": "💨", "target": "cat_gas"},
                    {"id": "item4", "name": "Buku Pelajaran", "icon": "📚", "target": "cat_padat"},
                    {"id": "item5", "name": "Sirup Manis", "icon": "🧃", "target": "cat_cair"},
                    {"id": "item6", "name": "Udara Ban Sepeda", "icon": "🚲", "target": "cat_gas"}
                ]
            }),
            "narration_text": "Tarik setiap benda ke kotak wujud yang sesuai. Apakah kamu bisa mengelompokkan semuanya dengan benar?",
            "image_url": "slide4_dragdrop"
        },
        {
            "title": "Kuis Pemahaman Cepat (Checkpoint)",
            "slide_type": "checkpoint",
            "order_index": 5,
            "content": "Jawab pertanyaan seru ini sebelum melanjutkan ke misteri siklus air!",
            "interactive_data": json.dumps({
                "question": "Ketika kamu meletakkan mentega di atas wajan yang panas, mentega akan meleleh menjadi cair. Peristiwa ini disebut...?",
                "options": [
                    {"text": "A. Membeku", "is_correct": False, "feedback": "Kurang tepat. Membeku adalah perubahan dari cair menjadi padat."},
                    {"text": "B. Mencair (Melebur)", "is_correct": True, "feedback": "Hebat sekali! Benar! Mentega menyerap panas wajan sehingga mencair."},
                    {"text": "C. Mengembun", "is_correct": False, "feedback": "Belum tepat. Mengembun adalah perubahan dari gas menjadi butiran air."},
                    {"text": "D. Menyublim", "is_correct": False, "feedback": "Belum tepat. Menyublim adalah perubahan padat langsung ke gas."}
                ]
            }),
            "narration_text": "Ayo jawab pertanyaan kuis berikut! Mengapa mentega bisa meleleh di atas wajan yang panas?",
            "image_url": "slide5_checkpoint"
        },
        {
            "title": "Keajaiban Siklus Air di Bumi",
            "slide_type": "standard",
            "order_index": 6,
            "content": """Pernahkah kamu berpikir: Mengapa air di bumi tidak pernah habis meskipun jutaan orang meminumnya setiap hari?

Jawabannya adalah karena **Siklus Air (Daur Air)**! Air di bumi terus berputar tanpa henti melalui 4 tahap utama:

1. ☀️ **Evaporasi (Penguapan):** Air laut, danau, dan sungai dipanaskan sinar matahari lalu menguap menjadi uap air ke angkasa.
2. ☁️ **Kondensasi (Pengembunan):** Uap air naik ke tempat tinggi yang dingin, lalu mengembun menjadi titik-titik air pembentuk awan.
3. 🌧️ **Presipitasi (Hujan):** Awan semakin berat dan tidak kuat menampung air lagi, lalu turunlah tetesan air hujan ke bumi!
4. 🌱 **Infiltrasi (Penyerapan):** Air hujan meresap ke dalam tanah dan mengalir kembali ke sungai dan laut untuk mengulang siklus!""",
            "interactive_data": json.dumps({
                "stages": [
                    {"step": "1", "name": "Evaporasi", "desc": "Matahari memanaskan air laut hingga menguap.", "icon": "🌊➡️☁️"},
                    {"step": "2", "name": "Kondensasi", "desc": "Uap air mendingin membentuk gumpalan awan tebal.", "icon": "☁️💧"},
                    {"step": "3", "name": "Presipitasi", "desc": "Tetesan air jatuh ke tanah sebagai hujan riang.", "icon": "🌧️☔"},
                    {"step": "4", "name": "Infiltrasi", "desc": "Air meresap ke tanah dan kembali ke laut lepas.", "icon": "🌱🌊"}
                ]
            }),
            "narration_text": "Siklus air menjaga ketersediaan air bersih di bumi. Air menguap karena sinar matahari, membentuk awan, lalu turun sebagai hujan.",
            "image_url": "slide6_water_cycle"
        },
        {
            "title": "Hebat! Kamu Menyelesaikan Materi Ini!",
            "slide_type": "summary",
            "order_index": 7,
            "content": """🎉 **Selamat Sahabat Sains Cilik!**

Kamu telah berhasil mempelajari:
* Tiga Wujud Benda: Padat, Cair, dan Gas.
* Proses Mencair, Membeku, Menguap, dan Mengembun.
* Empat Tahapan Penting Siklus Air di Bumi.

Langkah berikutnya:
* Uji langsung teorimu di menu **Eksperimen Virtual**.
* Mainkan **Permainan Edukasi** untuk mengumpulkan bintang.
* Ukur pemahamanmu di menu **Evaluasi Soal**.
""",
            "interactive_data": json.dumps({
                "badge_unlock": "matter_master",
                "badge_title": "Penjelajah Materi",
                "badge_icon": "📖"
            }),
            "narration_text": "Luar biasa! Kamu telah menuntaskan seluruh materi wujud benda dan siklus air. Ayo coba eksperimen virtual dan mainkan permainannya!",
            "image_url": "slide7_trophy"
        }
    ]

    # Insert slides if not present
    cursor.execute("SELECT COUNT(*) as cnt FROM slides WHERE module_id = ?", (module_id,))
    if cursor.fetchone()['cnt'] == 0:
        for s in slides_data:
            cursor.execute("""
            INSERT INTO slides (module_id, title, slide_type, content, interactive_data, narration_text, image_url, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                module_id,
                s['title'],
                s['slide_type'],
                s['content'],
                s['interactive_data'],
                s['narration_text'],
                s['image_url'],
                s['order_index']
            ))
        print(f"Slides inserted ({len(slides_data)} slides).")

    # 7. Seed Virtual Experiment
    cursor.execute("SELECT id FROM experiments WHERE code = 'lab_water_phase'")
    if not cursor.fetchone():
        instructions = [
            {"step": 1, "title": "Siapkan Es Batu", "desc": "Klik tombol 'Masukkan Es Batu' ke dalam gelas kimia beker."},
            {"step": 2, "title": "Nyalakan Pembakar Bunsen", "desc": "Geser saklar pemanas ke 'Api Sedang' untuk mulai memanaskan es batu."},
            {"step": 3, "title": "Amati Termometer & Perubahan Wujud", "desc": "Perhatikan suhu naik dari -5°C ke 0°C (es mencair jadi air) lalu ke 100°C (air mendidih menghasilkan uap)."},
            {"step": 4, "title": "Pasang Penutup Kaca Dingin", "desc": "Klik 'Pasang Tutup Kaca Dingin' untuk melihat uap air berubah kembali menjadi butiran air embun (Kondensasi)!"}
        ]
        options = [
            "Es batu akan langsung menghilang seketika tanpa menjadi air",
            "Es batu akan mencair menjadi air, lalu menguap menjadi gas uap air",
            "Es batu tidak akan mengalami perubahan apa pun"
        ]
        cursor.execute("""
        INSERT INTO experiments (code, title, description, instruction_steps, hypothesis_question, hypothesis_options, conclusion_prompt, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            'lab_water_phase',
            'Laboratorium Virtual: Perubahan Wujud Air dari Padat, Cair, hingga Gas',
            'Simulasi interaktif menggunakan pemanas Bunsen, gelas beaker, es batu, dan termometer digital untuk membuktikan perubahan wujud benda akibat kalor.',
            json.dumps(instructions),
            'Sebelum memulai pemanasan, apa dugaanmu (hipotesis) terhadap apa yang akan terjadi pada es batu saat diberi panas bertahap?',
            json.dumps(options),
            'Berdasarkan pengamatanmu, ketika es dipanaskan suhunya naik hingga mencair pada suhu 0°C. Saat terus dipanaskan hingga 100°C, air mendidih dan berubah menjadi uap air. Saat uap mengenai permukaan dingin, ia mengembun menjadi tetesan air kembali.'
        ))
        print("Experiment seeded.")

    # 8. Seed Games
    games_data = [
        (
            'rapid_quiz',
            'Tebak Cepat Wujud Benda',
            'rapid_quiz',
            'Game ketangkasan refleks! Tebak apakah benda yang meluncur adalah Padat, Cair, atau Gas sebelum waktu habis.',
            'Klik tombol PADAT, CAIR, atau GAS secepat mungkin sesuai gambar dan nama benda. Setiap jawaban benar menghasilkan +10 poin dan kombo bintang!',
            'Sedang',
            60
        ),
        (
            'water_cycle_flow',
            'Susun Rantai Siklus Air',
            'water_cycle_flow',
            'Teka-teki menyusun 4 kartu tahapan daur air agar tetesan air dapat berputar kembali ke laut dengan selamat.',
            'Seret atau klik kartu tahapan siklus air (Evaporasi, Kondensasi, Presipitasi, Infiltrasi) ke urutan yang benar dari angka 1 sampai 4.',
            'Mudah',
            90
        ),
        (
            'catch_items',
            'Tangkap Benda Sains',
            'catch_items',
            'Kendalikan keranjang sains untuk menangkap benda yang jatuh sesuai wujud yang diminta!',
            'Gunakan tombol Panah Kiri dan Kanan (atau tombol layar di HP) untuk mengarahkan keranjang. Tangkap benda yang cocok untuk meraih bintang emas!',
            'Menantang',
            45
        )
    ]
    for code, title, gtype, desc, inst, diff, tlim in games_data:
        cursor.execute("SELECT id FROM games WHERE code = ?", (code,))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO games (code, title, game_type, description, instructions, difficulty, time_limit_sec, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            """, (code, title, gtype, desc, inst, diff, tlim))
    print(f"Games seeded ({len(games_data)} games).")

    # 9. Seed Questions (Pre-test & Post-test)
    cursor.execute("SELECT COUNT(*) as cnt FROM questions")
    if cursor.fetchone()['cnt'] == 0:
        questions_data = [
            # Pre-test questions (Diagnostic)
            {
                "test_type": "pretest",
                "topic": "Pengenalan Wujud Benda",
                "question_text": "Benda yang memiliki bentuk dan ukuran tetap meskipun dipindahkan ke tempat berbeda adalah benda...",
                "question_type": "multiple_choice",
                "options": json.dumps(["A. Gas", "B. Cair", "C. Padat", "D. Udara"]),
                "correct_answer": "C",
                "explanation": "Benda padat memiliki partikel yang sangat rapat dan kuat sehingga bentuk dan volumenya selalu tetap.",
                "points": 20,
                "order_index": 1
            },
            {
                "test_type": "pretest",
                "topic": "Sifat Benda Cair",
                "question_text": "Ketika air sirup dituangkan dari botol ke dalam gelas, maka...",
                "question_type": "multiple_choice",
                "options": json.dumps([
                    "A. Bentuknya tetap seperti botol",
                    "B. Bentuknya berubah menyerupai gelas",
                    "C. Volumenya bertambah banyak",
                    "D. Berubah menjadi benda gas"
                ]),
                "correct_answer": "B",
                "explanation": "Benda cair memiliki sifat bentuk berubah-ubah mengikuti bentuk wadah penampungnya.",
                "points": 20,
                "order_index": 2
            },
            {
                "test_type": "pretest",
                "topic": "Perubahan Wujud",
                "question_text": "Peristiwa perubahan wujud benda dari padat menjadi cair disebut...",
                "question_type": "multiple_choice",
                "options": json.dumps(["A. Membeku", "B. Menguap", "C. Mencair", "D. Mengembun"]),
                "correct_answer": "C",
                "explanation": "Mencair atau melebur adalah perubahan wujud benda dari padat menjadi cair karena menerima panas.",
                "points": 20,
                "order_index": 3
            },
            {
                "test_type": "pretest",
                "topic": "Siklus Air",
                "question_text": "Hujan yang turun membasahi bumi berasal dari awan yang mengalami proses...",
                "question_type": "multiple_choice",
                "options": json.dumps(["A. Evaporasi", "B. Presipitasi", "C. Menyublim", "D. Melebur"]),
                "correct_answer": "B",
                "explanation": "Presipitasi adalah proses jatuhnya tetesan air dari awan ke permukaan bumi dalam bentuk hujan.",
                "points": 20,
                "order_index": 4
            },
            {
                "test_type": "pretest",
                "topic": "Pengamatan Alam",
                "question_text": "Titik-titik air di bagian luar gelas yang berisi es teh dingin terjadi karena peristiwa...",
                "question_type": "multiple_choice",
                "options": json.dumps(["A. Air merembes keluar", "B. Mengembun", "C. Menguap", "D. Membeku"]),
                "correct_answer": "B",
                "explanation": "Uap air di udara sekitar gelas yang dingin melepaskan kalor sehingga berubah menjadi titik-titik air embun.",
                "points": 20,
                "order_index": 5
            },

            # Post-test questions (Comprehensive Evaluation)
            {
                "test_type": "posttest",
                "topic": "Sifat Benda Padat & Partikel",
                "question_text": "Manakah pernyataan di bawah ini yang paling tepat tentang partikel benda padat?",
                "question_type": "multiple_choice",
                "options": json.dumps([
                    "A. Partikelnya berjauhan dan bebas bergerak",
                    "B. Tersusun sangat rapat, teratur, dan bentuknya kokoh",
                    "C. Selalu berubah bentuk mengikuti volume wadahnya",
                    "D. Mengisi seluruh ruangan yang kosong"
                ]),
                "correct_answer": "B",
                "explanation": "Partikel benda padat tersusun sangat teratur dan memiliki ikatan antarmolekul yang kuat.",
                "points": 10,
                "order_index": 1
            },
            {
                "test_type": "posttest",
                "topic": "Contoh Benda Sehari-hari",
                "question_text": "Ibu menggoreng ikan menggunakan minyak, lalu menyalakan kompor gas. Minyak dan gas berturut-turut merupakan wujud benda...",
                "question_type": "multiple_choice",
                "options": json.dumps([
                    "A. Padat dan Cair",
                    "B. Cair dan Gas",
                    "C. Gas dan Padat",
                    "D. Cair dan Padat"
                ]),
                "correct_answer": "B",
                "explanation": "Minyak goreng berwujud cair, sedangkan gas elpiji pembakar kompor berwujud gas.",
                "points": 10,
                "order_index": 2
            },
            {
                "test_type": "posttest",
                "topic": "Perubahan Wujud Melepas Kalor",
                "question_text": "Peristiwa berikut ini yang merupakan contoh proses MEMBEKU adalah...",
                "question_type": "multiple_choice",
                "options": json.dumps([
                    "A. Lilin meleleh saat dinyalakan apinya",
                    "B. Air sirup membatu saat dimasukkan ke dalam freezer kulkas",
                    "C. Pakaian basah mengering saat dijemur terik",
                    "D. Kapur barus di lemari mengecil"
                ]),
                "correct_answer": "B",
                "explanation": "Air sirup cair melepaskan panas di dalam freezer sehingga berubah menjadi padatan es (membeku).",
                "points": 10,
                "order_index": 3
            },
            {
                "test_type": "posttest",
                "topic": "Penguapan (Evaporasi)",
                "question_text": "Petani garam memanfaatkan sinar matahari untuk membuat garam dari air laut. Proses perubahan wujud yang terjadi adalah...",
                "question_type": "multiple_choice",
                "options": json.dumps([
                    "A. Penguapan (Evaporasi)",
                    "B. Pembekuan",
                    "C. Pengembunan",
                    "D. Pencairan"
                ]),
                "correct_answer": "A",
                "explanation": "Air laut dipanaskan terik matahari hingga airnya menguap, meninggalkan kristal garam putih.",
                "points": 10,
                "order_index": 4
            },
            {
                "test_type": "posttest",
                "topic": "Siklus Air: Tahap Kondensasi",
                "question_text": "Pada siklus air, perubahan uap air menjadi butiran air di awan akibat suhu dingin di langit dinamakan...",
                "question_type": "multiple_choice",
                "options": json.dumps([
                    "A. Evaporasi",
                    "B. Kondensasi",
                    "C. Presipitasi",
                    "D. Infiltrasi"
                ]),
                "correct_answer": "B",
                "explanation": "Kondensasi atau pengembunan terjadi ketika uap air yang naik ke atmosfer mendingin menjadi partikel awan.",
                "points": 10,
                "order_index": 5
            },
            {
                "test_type": "posttest",
                "topic": "Hujan dan Presipitasi",
                "question_text": "Tahapan siklus air ketika butiran air di awan sudah terlalu berat lalu jatuh kembali ke bumi sebagai tetesan hujan disebut...",
                "question_type": "multiple_choice",
                "options": json.dumps([
                    "A. Infiltrasi",
                    "B. Transpirasi",
                    "C. Presipitasi",
                    "D. Evaporasi"
                ]),
                "correct_answer": "C",
                "explanation": "Presipitasi mencakup hujan air, hujan es, maupun salju yang turun dari awan.",
                "points": 10,
                "order_index": 6
            },
            {
                "test_type": "posttest",
                "topic": "Penyerapan Air Tanah",
                "question_text": "Air hujan yang meresap ke dalam pori-pori tanah dan akar pohon disebut proses...",
                "question_type": "multiple_choice",
                "options": json.dumps([
                    "A. Infiltrasi",
                    "B. Evaporasi",
                    "C. Kondensasi",
                    "D. Pembekuan"
                ]),
                "correct_answer": "A",
                "explanation": "Infiltrasi adalah aliran masuknya air dari permukaan ke dalam lapisan tanah menjadi cadangan air tanah.",
                "points": 10,
                "order_index": 7
            },
            {
                "test_type": "posttest",
                "topic": "Suhu & Titik Didih",
                "question_text": "Pada saat kita merebus air di laboratorium virtual hingga mendidih dan banyak uap keluar, termometer menunjukkan angka...",
                "question_type": "multiple_choice",
                "options": json.dumps([
                    "A. 0 derajat Celsius",
                    "B. 50 derajat Celsius",
                    "C. 100 derajat Celsius",
                    "D. 200 derajat Celsius"
                ]),
                "correct_answer": "C",
                "explanation": "Titik didih air murni pada tekanan normal adalah 100 derajat Celsius.",
                "points": 10,
                "order_index": 8
            },
            {
                "test_type": "posttest",
                "topic": "Menyublim",
                "question_text": "Kapur barus (kamper) pengharum lemari yang lama-kelamaan mengecil dan habis tanpa meninggalkan cairan basah merupakan contoh peristiwa...",
                "question_type": "multiple_choice",
                "options": json.dumps([
                    "A. Mengembun",
                    "B. Menyublim",
                    "C. Mencair",
                    "D. Mengkristal"
                ]),
                "correct_answer": "B",
                "explanation": "Menyublim adalah perubahan wujud benda dari padat langsung menjadi gas.",
                "points": 10,
                "order_index": 9
            },
            {
                "test_type": "posttest",
                "topic": "Sains untuk Kehidupan",
                "question_text": "Mengapa menanam banyak pohon di sekitar rumah sangat bermanfaat bagi siklus air?",
                "question_type": "multiple_choice",
                "options": json.dumps([
                    "A. Pohon membuat air laut berhenti menguap",
                    "B. Akar pohon membantu menyerap dan menyimpan air hujan di dalam tanah",
                    "C. Pohon dapat mengubah air menjadi batu",
                    "D. Pohon menghalangi turunnya awan hujan"
                ]),
                "correct_answer": "B",
                "explanation": "Akar tumbuhan sangat penting untuk menahan air hujan dan meningkatkan proses infiltrasi air tanah.",
                "points": 10,
                "order_index": 10
            }
        ]
        for q in questions_data:
            cursor.execute("""
            INSERT INTO questions (test_type, topic, question_text, question_type, options, correct_answer, explanation, points, order_index, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (
                q['test_type'],
                q['topic'],
                q['question_text'],
                q['question_type'],
                q['options'],
                q['correct_answer'],
                q['explanation'],
                q['points'],
                q['order_index']
            ))
        print(f"Questions bank seeded ({len(questions_data)} questions).")

    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_all()
