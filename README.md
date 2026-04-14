# Forum API Roadmap (Kriteria 3-6)

Dokumen ini adalah panduan praktik bertahap agar implementasi Anda memenuhi Kriteria 3, 4, 5, dan 6.

Prinsip kerja:

1. Kerjakan satu fitur kecil.
2. Jalankan test untuk fitur itu.
3. Rapikan arsitektur dan nama method.
4. Lanjut ke fitur berikutnya.

## Prasyarat Sebelum Lanjut

Pastikan Kriteria 2 sudah stabil:

1. POST /threads/:threadId/comments sudah 201.
2. Payload invalid sudah 400.
3. Thread tidak ada sudah 404.
4. Resource komentar sudah restrict (wajib access token).

## Kriteria 3 - Menghapus Komentar pada Thread

Target endpoint:

1. Method: DELETE
2. Path: /threads/:threadId/comments/:commentId
3. Response sukses: 200 { status: success }

Ketentuan penting:

1. Harus pakai access token.
2. Hanya pemilik komentar yang boleh hapus.
3. Jika bukan pemilik, response 403 fail.
4. Jika thread atau komentar tidak ada, response 404 fail.
5. Hapus komentar dengan soft delete (is_delete), bukan hard delete.

Langkah implementasi:

1. Migration:
   - Tambah kolom is_delete boolean default false pada tabel comments.
2. Domain:
   - Tambah kontrak method di CommentRepository, contoh:
     - verifyAvailableComment(commentId)
     - verifyCommentOwner(commentId, owner)
     - deleteCommentById(commentId)
3. Repository Postgres:
   - Implement query cek komentar ada.
   - Implement query cek owner.
   - Implement soft delete dengan update is_delete = true.
4. Use case:
   - Verifikasi thread tersedia.
   - Verifikasi komentar tersedia.
   - Verifikasi owner.
   - Lakukan soft delete.
5. Handler dan route:
   - Ambil owner dari access token.
   - Ambil threadId dan commentId dari params.
   - Return 200 status success.

Checklist test integration Kriteria 3:

1. 200 saat owner menghapus komentar.
2. 403 saat non-owner mencoba menghapus.
3. 404 saat thread tidak ada.
4. 404 saat komentar tidak ada.
5. 403 atau 401 saat token tidak valid/tidak ada (sesuai standar project Anda).

## Kriteria 4 - Melihat Detail Thread

Target endpoint:

1. Method: GET
2. Path: /threads/:threadId
3. Resource ini terbuka (tanpa token).

Response wajib:

1. Thread detail: id, title, body, date, username.
2. Daftar comments pada thread.
3. Komentar soft deleted ditampilkan sebagai: **komentar telah dihapus**.
4. Komentar diurutkan ascending berdasarkan date.

Langkah implementasi:

1. Domain entity:
   - DetailThread entity (thread + comments).
   - Comment detail entity untuk kebutuhan output.
2. Repository:
   - Method ambil thread by id (join users).
   - Method ambil comments by thread id (join users, order by date asc).
3. Use case detail thread:
   - Verifikasi thread ada.
   - Ambil thread.
   - Ambil daftar komentar.
   - Mapping komentar is_delete = true menjadi content **komentar telah dihapus**.
4. Handler dan route:
   - GET /threads/:threadId.
   - Return format response sesuai kriteria.

Checklist test integration Kriteria 4:

1. 200 dan struktur response thread sesuai kontrak.
2. 404 jika thread tidak ada.
3. Semua komentar thread ditampilkan.
4. Komentar terhapus tampil sebagai **komentar telah dihapus**.
5. Urutan komentar ascending berdasarkan waktu.

## Kriteria 5 - Automation Testing

Wajib ada dua lapis test:

1. Unit Testing:
   - Entities (validasi payload, tipe data).
   - Use case (alur bisnis, pemanggilan repository, kondisi gagal).
2. Integration Testing:
   - Repository ke database asli test.
   - HTTP endpoint (createServer.test.js) untuk skenario end-to-end.

Strategi nulis test:

1. Mulai dari skenario sukses.
2. Tambahkan skenario error utama (400/403/404).
3. Gunakan TableTestHelper untuk setup data.
4. Selalu cleanup tabel di afterEach.

Perintah yang dipakai:

1. npm run test
2. npm run test:watch
3. npm run test:coverage

## Kriteria 6 - Clean Architecture

Pastikan tiap kode ditempatkan pada layer yang benar:

1. Entities (Domain):
   - Entitas bisnis dan validasi payload.
2. Use Case (Application):
   - Orkestrasi alur bisnis.
3. Interface Adapters:
   - Repository implementasi Postgres.
   - HTTP handler dan routes.
4. Frameworks:
   - Database, migration, pool, express app.

Aturan praktis:

1. Use case hanya tergantung kontrak repository, bukan detail SQL.
2. Handler jangan berisi logika bisnis kompleks.
3. Validasi bentuk data masuk dilakukan di entity.
4. Jangan campur concern auth, business, dan persistence dalam satu class.

## Urutan Kerja Yang Disarankan

1. Selesaikan Kriteria 3 (delete comment soft delete).
2. Lanjut Kriteria 4 (thread detail + comments + masking deleted content).
3. Lengkapi unit test untuk entity/use case baru.
4. Lengkapi integration test repository dan endpoint.
5. Review ulang struktur folder agar tetap clean architecture.

## Definition of Done Akhir

1. Semua endpoint Kriteria 3 dan 4 lolos sesuai kontrak response.
2. Semua skenario error wajib menghasilkan status code yang tepat.
3. Unit test dan integration test berjalan hijau.
4. Tidak ada pelanggaran clean architecture yang signifikan.
5. Migrasi database rapi, berurutan, dan tidak mengubah file migration yang sudah pernah dijalankan.
