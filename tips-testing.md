Tips Dalam Mengerjakan Submission
Ketika mengerjakan proyek submission mungkin Anda mengalami kendala. Oleh karena itu kami telah mengumpulkan beberapa kendala yang sebelumnya sering ditemui oleh siswa-siswa lain. Agar kendala tersebut tidak terulang kepada Anda, maka kami telah membuat kumpulan tips untuk menanggulanginya.   

Berikut adalah beberapa tips yang dapat Anda gunakan sebagai bantuan dalam pembuatan submission.

Jangan gunakan expected value sebagai nilai kembalian fungsi yang di-mock
Ketika melakukan testing, jangan gunakan expected value sebagai nilai kembalian fungsi yang di-mock. Contohnya seperti ini:
GetPreparedEngineUseCase.test.js
GetPreparedEngineUseCase.js
class GetPreparedEngineUseCase {
constructor(engineRepository) {
    this.engineRepository = engineRepository;
}

    execute() {
        let engine = this.engineRepository.getEngine();

        engine.fuel = 50
        engine.start = false

        return engine
    }

}
Kode di atas akan menghasilkan output dari kedua  console.log()  (pada kode testing) menjadi seperti berikut: 

Output pertama sebelum fungsi getPreparedEngineUseCase.execute()dijalankan:
{
name: 'engine1',
fuel: 100,
start: true
}
Output kedua setelah fungsi getPreparedEngineUseCase.execute()dijalankan:
{    
name: 'engine1',
fuel: 50,
start: false
}
Bisa dilihat bahwa variable expectedEngine di atas berubah nilainya.

Jika diperhatikan lagi, kode use case di atas juga masih tidak sesuai dengan spesifikasi testing yang dibuat. Pada spesifikasi testing, dituliskan 'should fill fuel engine to 100 and start engine'. Tetapi nilai expectedEngine malah berubah menjadi fuel: 50 dan start: false.

Walaupun testing masih belum sesuai, namun ia akan tetap berhasil karena expectedEngine dijadikan nilai kembalian fungsi yang di-mock.

Oleh karena itu, kode testing yang benar seharusnya seperti ini:

GetPreparedEngineUseCase.test.js
it('should fill fuel engine to 100 and should start engine', function () {
const expectedEngine = {
    name: 'engine1',
    fuel: 100,
    start: true
};

 const engineRepository = {}
engineRepository.getEngine = vi.fn(() => ({
    name: 'engine1',
        fuel: 0,
    start: false
}));

 
const getPreparedEngineUseCase = new GetPreparedEngineUseCase(engineRepository);

  console.log(expectedEngine)
const engine = getPreparedEngineUseCase.execute()
console.log(expectedEngine)

    expect(engine).toStrictEqual(expectedEngine)

});
Nilai kembalian pada fungsi yang di-mock bersifat netral dan biasanya berbeda dengan expected result. Ketika test di atas dijalankan maka akan terjadi error seperti ini.
Error: expect(received).toStrictEqual(expected) // deep equality

 

- Expected - 2

* Received + 2

 
Object {

- "fuel": 100,

* "fuel": 50,
      "name": "engine1",
      "start": true,
* "start": false,
  }  
  Hal ini wajar karena kode pada use case yang dibuat memang masih salah dan dengan ini kita tahu bahwa ada bug yang terjadi pada kode yang kita buat. Jadi, kita bisa memperbaiki bug yang terjadi pada use case tersebut. Inilah salah satu kegunaan testing, yaitu mendeteksi bug sedini mungkin.

Kode use case yang benar adalah seperti berikut
GetPreparedEngineUseCase.js
class GetPreparedEngineUseCase {
    constructor(engineRepository) {
        this.engineRepository = engineRepository;
    }

 
    execute() {
        let engine = this.engineRepository.getEngine();

 
        engine.fuel = 100
        engine.start = true

 
        return engine
    }
}
Saat testing pastikan verifikasi semua fungsi yang di-mock
Ketika melakukan mock pada sebuah fungsi, pastikan fungsi tersebut sudah diverifikasi bahwa memang benar-benar dipanggil. Karena jika tidak, maka bisa saja kode yang di-test tersebut menjadi tidak valid. Contohnya seperti ini:

AddEngineUseCase.test.js
AddEngineUseCase.js
it('should return the engine properly', async () => {
    const expectedEngine = {
        name: 'Faster Speed 3000',
        manufacture: 'Faster Speed Inc',
        maxFuel: 200,
    }

 
    const engineRepository = {}
    const manufacturerRepository = {}

 
    const getEngineUseCase = new GetEngineUseCase(engineRepository, manufacturerRepository);

 
    engineRepository.add = vi.fn(() => Promise.resolve())
    manufacturerRepository.verifyManufactureIsRegistered = vi.fn(()=>Promise.resolve())

 
    const engine = await getEngineUseCase.execute('Faster Speed 3000', 'Faster Speed Inc', 200);

 
    expect(engine).toStrictEqual(expectedEngine)
});
Test di atas akan berjalan dengan baik, tetapi jika suatu saat ada developer lain yang mengubah kode use casenya sebenarnya akan ada masalah yang muncul. Misal ada developer lain yang mengapus semua pemanggilan fungsi repository dari kode di atas, menjadi seperti ini:

AddEngineUseCase.js
class AddEngineUseCase {
    constructor(engineRepository, manufacturerRepository) {
        this.engineRepository = engineRepository;
        this.manufacturerRepository = manufacturerRepository;
    }

 
    async execute(name, manufacture, maxFuel) {
        // kode dihapus
        // kode dihapus

 
        return {
            name,
            manufacture,
            maxFuel
        }
    }
}
Maka test tetap lolos meskipun ada kode penting yang dihapus. Dampaknya jika program tersebut dijalankan di production akan terjadi error atau anomali yang susah ditelusuri. 

Agar test tersebut dapat menjadi ‘safety net’ bagi developer lain, maka wajib memverifikasi setiap fungsi yang di-mock, contohnya seperti ini: 

AddEngineUseCase.test.js
it('should return the engine properly', async () => {
    const expectedEngine = {
        name: 'Faster Speed 3000',
        manufacture: 'Faster Speed Inc',
        maxFuel: 200,
    }

 
    const engineRepository = {}
    const manufacturerRepository = {}

 
    const getEngineUseCase = new GetEngineUseCase(engineRepository, manufacturerRepository)

 
    engineRepository.add = vi.fn(() => Promise.resolve())
    manufacturerRepository.verifyManufactureIsRegistered = vi.fn(() => Promise.resolve())

 
    const engine = await getEngineUseCase.execute('Faster Speed 3000', 'Faster Speed Inc', 200)

 
    expect(engine).toStrictEqual(expectedEngine)
expect(engineRepository.add).toHaveBeenCalledWith('Faster Speed 3000', 'Faster Speed Inc', 200)
    expect(manufacturerRepository.verifyManufactureIsRegistered).toHaveBeenCalledWith('Faster Speed Inc')
});
Anda tidak hanya bisa menggunakan fungsi toHaveBeenCalledWith(), tapi bisa juga menggunakan fungsi toBeCalled(), toBeCalledTimes(), dan yang lainnya.

Perlu diingat kembali bahwa use case atau entity-lah yang menjadi tempat logic disimpan
Kode di bawah memiliki business logic yang disimpan di repository dan hal ini tidak bagus karena menurut Clean Architecture, logika bisnis hanya boleh didefinisikan di dalam domain atau use case. Perhatikan kode berikut:

EngineRepository.js
GetEngineUseCase.js
class EngineRepository {
   constructor(pool) {
       this.pool = pool;
   }

 
   async getEngines() {
       const result = await this.pool.query('SELECT \* FROM engine')

 
     const engine = result.row[0]

 
      if (engine.speed > 1000) {
           engine.type = 'Super Engine'
       } else if (engine.speed > 500) {
           engine.type = 'Moderate Engine'
       } else {
           engine.type = 'Light Engine'
}

 
       return engine
   }

 
}
Jika kita menerapkan Clean Architecture maka kode yang benar untuk contoh kasus di atas adalah seperti ini: 

EngineRepository.js
GetEngineUseCase.js
class EngineRepository {
    constructor(pool) {
        this.pool = pool;
    }

 
    async getEngines() {
        const result = await this.pool.query('SELECT \* FROM engine')

 
        const engine = result.row[0]

        
        return engine
  }

    
}

Ketika melakukan integration test yang bersifat perubahan (insert, update, atau delete), pastikan database atau external agency lainnya juga berubah
Kode di bawah ini adalah kode yang tidak menerapkan testing terhadap external agency. Perhatikanlah contoh berikut:

EngineRepository.test.js
describe('AddEngineRepositoryTest', () => {
    it('should return added engine correctly ', function () {
        const engine  = {
            name: 'Faster Speed 3000',
            manufacture: 'Faster Speed Inc',
            maxFuel: 200,
        }

 
        const engineRepository = new EngineRepository();
        const addedEngine = engineRepository.add(engine);
        expect(addedEngine).toStrictEqual(engine);
    });
})
Test di atas sebenarnya sudah hampir benar, tetapi karena ini merupakan integration test, maka Anda juga perlu menguji external agency-nya pada kasus ini external agency-nya adalah database. Sehingga test yang benar adalah seperti ini:

EngineRepository.test.js
EnginesTableTestHelper.js
describe('AddEngineRepositoryTest', () => {
it('should return added engine correctly ', function () {
const engine = {
name: 'Faster Speed 3000',
manufacture: 'Faster Speed Inc',
maxFuel: 200,
}

 
const engineRepository = new EngineRepository();
const addedEngine = engineRepository.add(engine);
expect(addedEngine).toStrictEqual(engine);
});

 
it('should persist add engine', function () {
const enginePayload = {
name: 'Faster Speed 3000',
manufacture: 'Faster Speed Inc',
maxFuel: 200,
}

 
const engineRepository = new EngineRepository();
engineRepository.add(enginePayload);

 
const engine = EnginesTableTestHelper.findEngineByName('Faster Speed 3000')
expect(engine).toHaveLength(1)
});
})
Pada test di atas kita membuat object baru bernama EnginesTableTestHelper yang berfungsi untuk membantu jalannya testing. Dengan fungsi yang ada di dalam object tersebut, kita bisa mengambil data yang ada di dalam database dan menggunakan data tersebut sebagai validasi testing.

Lakukan autentikasi di level interface
Jika sewaktu-waktu aplikasi back-end yang kita buat ini menjadi aplikasi lain, contohnya aplikasi terminal/cmd  (CLI), maka apabila autentikasi berada pada level use case, use case tersebut jadi tidak bisa digunakan kembali karena bisa saja cara autentikasinya berbeda. Contoh kode autentikasi yang benar adalah seperti berikut

handler.js
AddEngineUseCase.js
addEngineHandler(request){
const { id: userId } = request.auth.credentials

 
   AddEngineUseCase.execute(userId, request.payload)
}
