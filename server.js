const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Ganti password admin di sini sesuai keinginanmu
const ADMIN_PASSWORD = "firrnovv01"; 

const dbFile = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) console.error('Gagal koneksi database', err.message);
});

db.run(`CREATE TABLE IF NOT EXISTS transaksi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jenis TEXT,
    nama TEXT,
    tujuan TEXT,
    nomor TEXT,
    nominal INTEGER,
    adminFee INTEGER,
    total INTEGER,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== API ENDPOINTS ====================
app.post('/api/transaksi', (req, res) => {
    const { jenis, nama, tujuan, nomor, nominal, adminFee, total } = req.body;
    const query = `INSERT INTO transaksi (jenis, nama, tujuan, nomor, nominal, adminFee, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`;
    db.run(query, [jenis, nama, tujuan, nomor, nominal, adminFee, total], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

app.get('/api/transaksi', (req, res) => {
    db.all(`SELECT * FROM transaksi ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, data: rows });
    });
});

app.post('/api/transaksi/konfirmasi/:id', (req, res) => {
    const id = req.params.id;
    db.run(`UPDATE transaksi SET status = 'Berhasil' WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true });
    });
});

// Endpoint untuk cek password login admin
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Password salah!" });
    }
});

// ==================== TAMPILAN FRONTEND ====================
app.get('*', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Firr Pay - Fullstack System</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-dark: #020617; --bg-card: rgba(15, 23, 42, 0.9); --primary: #38bdf8; 
            --primary-gradient: linear-gradient(135deg, #38bdf8, #2563eb);
            --text-main: #f8fafc; --text-muted: #94a3b8; --border-glow: rgba(56, 189, 248, 0.3);
            --wa-color: #25D366; --danger: #ef4444; --success: #22c55e; --warning: #eab308;
            --transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; -webkit-tap-highlight-color: transparent; }
        body { background: radial-gradient(circle at top right, #1e3a8a 0%, var(--bg-dark) 60%, var(--bg-dark) 100%); color: var(--text-main); display: flex; justify-content: center; align-items: flex-start; width: 100%; min-height: 100vh; padding: 12px; }
        .app-card { background: var(--bg-card); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); width: 100%; max-width: 600px; border-radius: 24px; padding: 20px 16px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5); margin-top: 10px; margin-bottom: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { width: 50px; height: 50px; background: var(--primary-gradient); border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; color: white; box-shadow: 0 0 20px var(--border-glow); }
        .header h1 { font-size: 20px; font-weight: 700; }
        .header p { font-size: 11px; color: var(--text-muted); }
        .nav-switch { display: flex; gap: 8px; margin-bottom: 16px; }
        .nav-btn { flex: 1; padding: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; }
        .nav-btn.active { background: var(--primary); color: #020617; }
        .tabs { display: flex; background: rgba(0, 0, 0, 0.4); padding: 4px; border-radius: 14px; margin-bottom: 16px; }
        .tab-btn { flex: 1; padding: 8px 0; background: transparent; border: none; color: var(--text-muted); font-size: 12px; font-weight: 600; border-radius: 10px; cursor: pointer; }
        .tab-btn.active { background: var(--primary-gradient); color: white; }
        .info-box { background: rgba(56, 189, 248, 0.1); border-left: 4px solid var(--primary); padding: 10px; border-radius: 8px; margin-bottom: 14px; font-size: 11px; line-height: 1.4; }
        .info-box.warning { background: rgba(234, 179, 8, 0.1); border-left-color: var(--warning); color: #fef08a; }
        .form-group { margin-bottom: 12px; }
        .form-group label { display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
        .form-group input { width: 100%; background: rgba(0, 0, 0, 0.25); border: 1.5px solid rgba(255, 255, 255, 0.06); padding: 12px; border-radius: 10px; color: var(--text-main); font-size: 13px; outline: none; }
        .form-group input:focus { border-color: var(--primary); }
        .qris-box { display: none; background: rgba(56, 189, 248, 0.05); border: 1px dashed var(--primary); border-radius: 12px; padding: 12px; text-align: center; margin-bottom: 14px; }
        .qris-box img { max-width: 130px; border-radius: 8px; margin: 6px 0; }
        .summary { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 12px; margin-bottom: 14px; font-size: 12px; }
        .sum-row { display: flex; justify-content: space-between; color: var(--text-muted); margin-bottom: 6px; }
        .sum-row span:last-child { color: var(--text-main); }
        .sum-total { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); }
        .sum-total .price { font-size: 18px; font-weight: 700; color: var(--primary); }
        .btn-submit { width: 100%; background: var(--wa-color); color: white; padding: 14px; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; }
        
        /* ADMIN SECTION & LOGIN */
        .admin-section { display: none; }
        .login-box { text-align: center; padding: 30px 10px; }
        .table-container { overflow-x: auto; max-height: 400px; margin-top: 10px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; }
        th, td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        th { color: var(--text-muted); background: rgba(0,0,0,0.2); }
        .badge { padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
        .badge.Pending { background: rgba(234, 179, 8, 0.2); color: var(--warning); }
        .badge.Berhasil { background: rgba(34, 197, 94, 0.2); color: var(--success); }
        .btn-confirm { background: var(--success); color: white; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="app-card">
        <div class="header">
            <div class="logo">F</div>
            <h1>Firr Pay System</h1>
            <p>XI RPL 3 • Full-Stack App</p>
        </div>
        <div class="nav-switch">
            <button class="nav-btn active" id="btnTabUser" onclick="switchView('user')">📱 Sisi Pengguna</button>
            <button class="nav-btn" id="btnTabAdmin" onclick="switchView('admin')">⚙️ Sisi Admin</button>
        </div>

        <div id="userView">
            <div class="tabs">
                <button class="tab-btn active" onclick="setMode('ewallet', this)">E-Wallet</button>
                <button class="tab-btn" onclick="setMode('bank', this)">Bank</button>
                <button class="tab-btn" onclick="setMode('tarik', this)">Tarik Tunai</button>
            </div>
            <div class="info-box" id="infoBox"></div>
            <div class="qris-box" id="qrisBox">
                <div style="font-size: 11px; color: var(--primary); font-weight: 600;">SCAN QRIS</div>
                <img src="https://i.ibb.co.com/cKN4dQrz/Screenshot-2026-09-26-18-08-54-626-com-gojek-gopay-edit.jpg" alt="QRIS">
                <div style="font-size: 10px; color: var(--text-muted);">ShopeePay: 085707530814 | SeaBank: 901113171908</div>
            </div>
            <div class="form-group"><label>Nama & Kelas</label><input type="text" id="nama" placeholder="Contoh: Budi (XI RPL 1)"></div>
            <div class="form-group"><label id="labelTujuan">Tujuan</label><input type="text" id="tujuan" placeholder="DANA / GoPay"></div>
            <div class="form-group"><label id="labelNomor">Nomor HP / Rekening</label><input type="number" id="nomor" placeholder="0812xxxxxx"></div>
            <div class="form-group"><label>Nominal (Rp)</label><input type="number" id="nominal" placeholder="10000" oninput="calculate()"></div>
            <div class="summary">
                <div class="sum-row"><span>Nominal</span><span id="txtNominal">Rp 0</span></div>
                <div class="sum-row"><span>Biaya Admin</span><span id="txtAdmin">Rp 0</span></div>
                <div class="sum-total"><span>Total Bayar</span><span class="price" id="txtTotal">Rp 0</span></div>
            </div>
            <button class="btn-submit" onclick="submitTransaksi()">Kirim & Simpan ke Server</button>
        </div>

        <!-- TAMPILAN ADMIN & LOGIN -->
        <div id="adminView" class="admin-section">
            <!-- Form Login Admin (Awalnya Muncul) -->
            <div id="adminLoginBox" class="login-box">
                <h3 style="font-size: 15px; margin-bottom: 10px; color: var(--primary);">🔒 Login Admin</h3>
                <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 15px;">Masukkan password admin untuk melihat daftar transaksi.</p>
                <div class="form-group">
                    <input type="password" id="adminPasswordInput" placeholder="Masukkan Password Admin">
                </div>
                <button onclick="verifyAdminLogin()" style="width:100%; padding:12px; background:var(--primary); color:#020617; border:none; border-radius:10px; font-weight:700; cursor:pointer; font-size:13px;">Masuk Dashboard</button>
            </div>

            <!-- Dashboard Admin (Muncul Setelah Password Benar) -->
            <div id="adminDashboardBox" style="display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="font-size: 14px; color: var(--primary);">Daftar Transaksi Masuk</h3>
                    <button onclick="logoutAdmin()" style="padding:4px 8px; background:rgba(239,68,68,0.2); color:var(--danger); border:1px solid var(--danger); border-radius:6px; cursor:pointer; font-size:10px;">Keluar</button>
                </div>
                <div class="table-container">
                    <table>
                        <thead><tr><th>Waktu & Nama</th><th>Detail</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead>
                        <tbody id="adminTableBody"></tbody>
                    </table>
                </div>
                <button onclick="loadAdminData()" style="width:100%; margin-top:10px; padding:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px; cursor:pointer; font-size:11px;">🔄 Refresh Data</button>
            </div>
        </div>
    </div>

    <script>
        let currentMode = 'ewallet';
        const ownerWA = "6285707530814";

        function switchView(view) {
            if(view === 'user') {
                document.getElementById('userView').style.display = 'block';
                document.getElementById('adminView').style.display = 'none';
                document.getElementById('btnTabUser').classList.add('active');
                document.getElementById('btnTabAdmin').classList.remove('active');
            } else {
                document.getElementById('userView').style.display = 'none';
                document.getElementById('adminView').style.display = 'block';
                document.getElementById('btnTabAdmin').classList.add('active');
                document.getElementById('btnTabUser').classList.remove('active');
            }
        }

        function verifyAdminLogin() {
            let pass = document.getElementById('adminPasswordInput').value;
            fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: pass })
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    document.getElementById('adminLoginBox').style.display = 'none';
                    document.getElementById('adminDashboardBox').style.display = 'block';
                    loadAdminData();
                } else {
                    alert(data.message);
                }
            });
        }

        function logoutAdmin() {
            document.getElementById('adminPasswordInput').value = '';
            document.getElementById('adminDashboardBox').style.display = 'none';
            document.getElementById('adminLoginBox').style.display = 'block';
        }

        function setMode(mode, element) {
            currentMode = mode;
            if(element) {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                element.classList.add('active');
            }
            const infoBox = document.getElementById('infoBox');
            const qrisBox = document.getElementById('qrisBox');
            if (mode === 'tarik') {
                infoBox.className = 'info-box warning';
                infoBox.innerHTML = '⚠️ Pastikan saldo tersedia sebelum tarik tunai!';
                qrisBox.style.display = 'block';
            } else {
                infoBox.className = 'info-box';
                infoBox.innerHTML = '💡 Isi data dengan benar, lalu serahkan uang tunai ke Firnanda di kelas.';
                qrisBox.style.display = 'none';
            }
            calculate();
        }

        function formatRupiah(angka) {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
        }

        function getAdminFee(mode, amount) {
            if (mode === 'ewallet') return amount < 100000 ? 1000 : 2000;
            if (mode === 'bank') return amount < 100000 ? 2000 : 4000;
            return 2000;
        }

        function calculate() {
            let amount = parseInt(document.getElementById('nominal').value) || 0;
            let adminFee = amount > 0 ? getAdminFee(currentMode, amount) : 0;
            document.getElementById('txtNominal').innerText = formatRupiah(amount);
            document.getElementById('txtAdmin').innerText = formatRupiah(adminFee);
            document.getElementById('txtTotal').innerText = formatRupiah(amount + adminFee);
        }

        function submitTransaksi() {
            let nama = document.getElementById('nama').value;
            let tujuan = document.getElementById('tujuan').value;
            let nomor = document.getElementById('nomor').value;
            let amount = parseInt(document.getElementById('nominal').value) || 0;
            let minTrans = currentMode === 'tarik' ? 15000 : 10000;

            if (!nama || !tujuan || !nomor || amount < minTrans) {
                alert("Data belum lengkap atau nominal kurang dari batas minimal!");
                return;
            }

            let adminFee = getAdminFee(currentMode, amount);
            let total = amount + adminFee;
            let jenis = currentMode === 'ewallet' ? 'Top Up E-Wallet' : currentMode === 'bank' ? 'Transfer Bank' : 'Tarik Tunai';

            fetch('/api/transaksi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jenis, nama, tujuan, nomor, nominal: amount, adminFee, total })
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    alert("Transaksi berhasil dikirim ke server! Silahkan serahkan uang ke Firnanda.");
                    let pesan = \`Halo *Firr Pay* 🚀\\n\\n*Jenis:* \${jenis}\\n*Nama:* \${nama}\\n*Tujuan:* \${tujuan} (\${nomor})\\n*Total:* \${formatRupiah(total)}\\n\\n_Saya sudah input data ke website._\`;
                    window.open(\`https://wa.me/\${ownerWA}?text=\${encodeURIComponent(pesan)}\`, '_blank');
                    location.reload();
                } else {
                    alert("Gagal menyimpan transaksi.");
                }
            });
        }

        function loadAdminData() {
            fetch('/api/transaksi')
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    let html = '';
                    data.data.forEach(row => {
                        html += \`<tr>
                            <td><b>\${row.nama}</b><br><span style="color:var(--text-muted);">\${row.created_at}</span></td>
                            <td>\${row.jenis}<br>\${row.tujuan} (\${row.nomor})</td>
                            <td>\${formatRupiah(row.total)}</td>
                            <td><span class="badge \${row.status}">\${row.status}</span></td>
                            <td>\${row.status === 'Pending' ? \`<button class="btn-confirm" onclick="konfirmasi(\${row.id})">Konfirmasi</button>\` : 'Selesai'}</td>
                        </tr>\`;
                    });
                    document.getElementById('adminTableBody').innerHTML = html;
                }
            });
        }

        function konfirmasi(id) {
            fetch('/api/transaksi/konfirmasi/' + id, { method: 'POST' })
            .then(res => res.json())
            .then(data => { if(data.success) loadAdminData(); });
        }

        window.onload = function() { setMode('ewallet', document.querySelector('.tab-btn.active')); };
    </script>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
