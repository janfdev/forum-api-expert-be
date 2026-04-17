# Testing Audit dan Panduan Praktis

Dokumen ini menjelaskan dua aturan testing yang Anda minta, kondisi penerapannya di project ini, bagian yang masih bermasalah, serta contoh perbaikannya langsung dari kode project.

## 1. Aturan: jangan kembalikan expected value yang sama dari fungsi mock

Inti masalah:

- Jika nilai return mock memakai object yang sama persis dengan object expected, test bisa lolos walaupun logic di use case salah atau terjadi mutasi object.
- Test menjadi kurang sensitif terhadap bug.

### Status di project ini

Sudah diperbaiki pada:

- src/Applications/use_case/\_test/AddThreadUseCase.test.js
- src/Applications/use_case/\_test/AddCommentUseCase.test.js

Perbaikan yang dilakukan:

- Mock sekarang mengembalikan object baru (fresh object), bukan object expected yang sama persis referensinya.
- Tetap mempertahankan assertion hasil akhir.
- Menambahkan verifikasi jumlah pemanggilan mock (toHaveBeenCalledTimes(1)).

### Contoh pola yang disarankan

```js
const expectedAddedThread = new AddedThread({
  id: "thread-123",
  title: useCasePayload.title,
  owner: useCasePayload.owner
});

mockThreadRepository.addNewThread = vi.fn().mockImplementation(() =>
  Promise.resolve(
    new AddedThread({
      id: "thread-123",
      title: useCasePayload.title,
      owner: useCasePayload.owner
    })
  )
);

const addedThread = await addThreadUseCase.execute(useCasePayload);

expect(addedThread).toStrictEqual(expectedAddedThread);
expect(mockThreadRepository.addNewThread).toHaveBeenCalledTimes(1);
```

Catatan:

- Untuk use case yang memang hanya mengorkestrasi (pass-through), hasil akhir biasanya memang mengikuti return repository.
- Yang penting adalah tidak berbagi object expected yang sama sebagai return mock.

## 2. Aturan: setiap fungsi yang di-mock wajib diverifikasi dipanggil

Inti masalah:

- Tanpa verifikasi pemanggilan mock, test bisa tetap hijau walaupun use case tidak memanggil dependency yang seharusnya.

### Status di project ini

Mayoritas use case test sudah baik dan sudah memverifikasi pemanggilan mock.

Contoh yang sudah benar:

- src/Applications/use_case/\_test/AddUserUseCase.test.js
- src/Applications/use_case/\_test/DeleteCommentUseCase.test.js
- src/Applications/use_case/\_test/LoginUserUseCase.test.js
- src/Applications/use_case/\_test/RefreshAuthenticationUseCase.test.js

Pola yang sudah benar di project:

- toHaveBeenCalledWith(...)
- toBeCalledWith(...)
- dan kini ditambah toHaveBeenCalledTimes(1) pada beberapa test

## 3. Temuan yang masih perlu dibenahi (di luar dua file yang sudah diperbaiki)

### A. Integration HTTP test: nama test mengatakan data persisted, tapi belum cek DB

File:

- src/Infrastructures/http/\_test/createServer.test.js

Kasus:

- should response 201 and persisted user
- should response 201 and persisted thread

Masalah:

- Assertion saat ini hanya memeriksa response HTTP.
- Belum ada verifikasi ke database melalui TestHelper (misalnya findUsersById atau findThreadById) untuk membuktikan benar-benar tersimpan.

Saran:

- Setelah request sukses, tambahkan query via helper table test lalu assert row di DB.

### B. Integration HTTP test delete authentication belum verifikasi perubahan external agency

File:

- src/Infrastructures/http/\_test/createServer.test.js

Kasus:

- should response 200 if refresh token valid

Masalah:

- Belum memastikan token benar-benar terhapus dari tabel authentications.

Saran:

- Setelah DELETE sukses, cek AuthenticationsTableTestHelper.findToken(refreshToken) dan pastikan length = 0.

### C. Konsistensi skenario dan assertion

File:

- src/Infrastructures/http/\_test/createServer.test.js

Kasus:

- Nama test menyebut 403 saat token tidak ada, tetapi assertion memeriksa 401.

Saran:

- Samakan judul test dengan perilaku aktual API (atau sebaliknya) agar tidak menyesatkan maintainer.

## 4. Checklist cepat untuk test berikutnya

- Mock return tidak memakai object expected yang sama referensinya.
- Semua fungsi mock yang relevan diverifikasi pemanggilannya.
- Gunakan toHaveBeenCalledTimes(1) untuk mencegah pemanggilan berlebih.
- Untuk integration test insert/update/delete, selalu verifikasi perubahan DB.
- Judul test harus konsisten dengan assertion.

## 5. Ready to Submit Gate (Wajib sebelum submit)

Anggap submission belum siap jika salah satu poin di bawah belum terpenuhi.

- Semua test wajib hijau.
- Integration test untuk insert/update/delete benar-benar memverifikasi perubahan database.
- Mock di unit test diverifikasi pemanggilannya.
- Mock tidak mengembalikan object expected yang sama referensi.
- Nama skenario test konsisten dengan assertion (misalnya status code).

## 6. Ringkasan

- Aturan verifikasi mock call: sudah diterapkan dengan baik di project ini.
- Aturan jangan return expected object yang sama dari mock: sempat ada celah di 2 use case test, sekarang sudah diperbaiki.
- Gap terbesar saat ini: beberapa integration HTTP test belum memverifikasi perubahan database walaupun judul test menyatakan "persisted".
