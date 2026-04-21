# Panduan Setup Deployment, Nginx, dan HTTPS (Forum API)

Dokumen ini menjelaskan langkah-langkah untuk memenuhi kriteria **Limit Access** dan **HTTPS** pada Submission 2.

## 1. Persiapan Domain (Link)
Untuk mendapatkan URL seperti `https://namasubdomain.dcdg.xyz`:
1. Dapatkan IP Publik instance EC2 Anda dari AWS Console.
2. Gunakan layanan subdomain gratis dari Dicoding (dcdg.xyz) atau domain pribadi Anda.
3. Buat **A Record** pada DNS Management yang mengarahkan subdomain tersebut ke **IP Publik EC2** Anda.

## 2. Instalasi Nginx di EC2
Masuk ke terminal EC2 Anda (SSH) dan jalankan:
```bash
sudo apt update
sudo apt install nginx
```

## 3. Konfigurasi Nginx
Gunakan file `nginx.conf` yang sudah tersedia di root proyek ini:
1. Salin isi `nginx.conf` ke konfigurasi Nginx di server:
   ```bash
   sudo nano /etc/nginx/sites-available/forum-api
   ```
2. Tempel isinya, lalu simpan (Ctrl+O, Enter, Ctrl+X).
3. Aktifkan konfigurasi:
   ```bash
   sudo ln -s /etc/nginx/sites-available/forum-api /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 4. Setup HTTPS (Certbot)
Agar link bisa diakses melalui HTTPS:
1. Instal Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```
2. Jalankan Certbot untuk mendapatkan sertifikat Let's Encrypt:
   ```bash
   sudo certbot --nginx -d namasubdomain.dcdg.xyz
   ```
3. Ikuti instruksi di layar (pilih opsi untuk redirect HTTP ke HTTPS).

## 5. Menjalankan Aplikasi dengan PM2
Pastikan aplikasi Node.js Anda berjalan di background:
```bash
sudo npm install -g pm2
pm2 start src/app.js --name "forum-api"
pm2 save
pm2 startup
```

## 6. Verifikasi Rate Limit
Untuk memastikan pembatasan 90 request/menit pada `/threads` berhasil:
- Gunakan tool seperti `autocannon` atau `ab` (Apache Benchmark) untuk menembak endpoint `/threads`.
- Setelah melewati limit, server harus mengembalikan status code `429 Too Many Requests`.
