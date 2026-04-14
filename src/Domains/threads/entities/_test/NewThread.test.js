import NewThread from '../NewThread.js';

describe('NewThread entity', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      title: 'sebuah thread',
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      title: 'sebuah thread',
      body: 123,
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewThread entity correctly', () => {
    const payload = {
      title: 'sebuah thread',
      body: 'isi thread',
    };

    const newThread = new NewThread(payload);

    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
  });
});