import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import ThreadsRepositoryPostgres from '../ThreadsRepositoryPostgres.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';

describe('ThreadsRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  it('should persist new thread and return added thread correctly', async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'dicoding',
    });

    const fakeIdGenerator = () => '123';
    const threadRepository = new ThreadsRepositoryPostgres(pool, fakeIdGenerator);

    const addedThread = await threadRepository.addNewThread({
      title: 'sebuah thread',
      body: 'isi thread',
      owner: 'user-123',
    });

    const threads = await ThreadsTableTestHelper.findThreadById('thread-123');

    expect(threads).toHaveLength(1);
    expect(threads[0]).toMatchObject({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'isi thread',
      owner: 'user-123',
    });
    expect(addedThread).toStrictEqual(new AddedThread({
      id: 'thread-123',
      title: 'sebuah thread',
      owner: 'user-123',
    }));
  });
});