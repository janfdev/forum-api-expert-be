Kriteria Forum API
Terdapat 4 kriteria yang harus Anda penuhi dalam mengembangkan proyek Forum API kali ini.

Menerapkan Continuous Integration
Berikut ketentuannya:

Menjalankan proses pengujian aplikasi secara otomatis, mulai dari Unit Test, Integration Test, hingga Functional Test.
Diterapkan pada event pull request ke branch utama (master/main).
Menggunakan GitHub Actions.
Pastikan Repository Anda memiliki minimal dua proses CI yang sudah berjalan. Satu skenario gagal, dan satu skenario berhasil. Contohnya seperti ini:

Catatan:

Untuk men-trigger CI, Anda harus melakukan pull request terhadap repository.
Silakan buat fitur baru beserta pengujiannya dan lakukan pull request.
Pastikan ada skenario pengujian gagal dan berhasil.
Fitur baru bebas Anda tentukan sendiri. Bahkan, menampilkan pesan Hello World pun boleh. Namun, bila Anda ingin mendapatkan nilai lebih, cobalah kerjakan fitur opsional yang akan dijelaskan nanti.
Integration Test membutuhkan database test yang dapat diakses secara publik. Anda bisa menyediakan database server seperti Amazon RDS namun tidak menutup kemungkinan bila Anda ingin menggunakan service lain.
Atau Jika Anda familiar dengan sistem containerize, Anda bisa manfaatkan PostgreSQL service containers yang tersedia pada GitHub Action, menggunakan container akan lebih cepat karena PostgreSQL dijalankan secara lokal.


Menerapkan Continuous Deployment
Berikut ketentuannya:

Melakukan deploying secara otomatis ke server Anda.
Diterapkan pada event push ke branch utama (master/main).
Pastikan repository Anda memiliki minimal satu proses CD yang sudah berhasil. Contohnya seperti ini:



Catatan:

Proses deployment dilakukan ke server EC2 instance, namun tidak menutup kemungkinan bila Anda mendeploy pada layanan lain.
Proses deployment dapat dilakukan menggunakan SSH untuk GitHub Actions atau mekanisme lain sesuai layanan yang Anda gunakan. Anda juga boleh menggunakan services CodeDeploy bila memanfaatkan EC2 instances.


Menerapkan Limit Access
Forum API harus menerapkan Limit Access agar terhindar dari serangan DDoS Attack, berikut ketentuannya:

Resource yang dibatasi adalah resource /threads dan path yang di dalamnya.
Batasi permintaan yang masuk sebanyak 90 request per menit.
(Baru) Melampirkan file konfigurasi NGINX pada root proyek submission.


Menggunakan Protokol HTTPS
Forum API harus diakses melalui protokol HTTPS agar terhindar dari MITM.

Anda bisa menggunakan subdomain dcdg.xyz atau menggunakan domain Anda sendiri.
Wajib melampirkan URL Forum API Anda pada student notes.
Forum API yang diakses melalui URL HTTPS wajib lulus pengujian Postman.
Catatan: Reviewer akan memeriksa link yang Anda lampirkan. Jadi, harap pastikan link tersebut bisa diakses ya.