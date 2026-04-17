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
class GetEngineUseCase {
    constructor(engineRepository) {
        this.engineRepository = engineRepository;
    }
 
 
    async execute() {
        return await this.engineRepository.get();
    }
}
Jika kita menerapkan Clean Architecture maka kode yang benar untuk contoh kasus di atas adalah seperti ini: 

EngineRepository.js
GetEngineUseCase.js
class GetEngineUseCase {
    constructor(engineRepository) {
        this.engineRepository = engineRepository;
    }
 
    async execute() {
        const engine = await this.engineRepository.get();
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
const EnginesTableTestHelper = {
    findEngineById: function(name) {
        const query = {
            text: 'SELECT * FROM engines WHERE name = $1',
            values: [name]
        }
        const result = pool.query(query)
        return result.rows[0]
    },
}

Pada test di atas kita membuat object baru bernama EnginesTableTestHelper yang berfungsi untuk membantu jalannya testing. Dengan fungsi yang ada di dalam object tersebut, kita bisa mengambil data yang ada di dalam database dan menggunakan data tersebut sebagai validasi testing.