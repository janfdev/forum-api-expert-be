import AddedThread from '../../Domains/threads/entities/AddedThread.js';
import ThreadRepository from '../../Domains/threads/ThreadRepository.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';

class ThreadsRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addNewThread(newThread) {
    const { title, body, owner } = newThread;

    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads (id, title, body, owner) VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);
    return new AddedThread(result.rows[0]);
  }

  async verifyAvailableThread(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async getThreadDetailById(threadId) {
    const threadQuery = {
      text: `
        SELECT threads.id, threads.title, threads.body, threads.date, users.username
        FROM threads
        JOIN users ON users.id = threads.owner
        WHERE threads.id = $1
      `,
      values: [threadId],
    };

    const threadResult = await this._pool.query(threadQuery);

    if (!threadResult.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    const commentsQuery = {
      text: `
        SELECT comments.id, comments.content, comments.date, comments."isDelete" AS is_delete, users.username
        FROM comments
        JOIN users ON users.id = comments.owner
        WHERE comments."threadId" = $1
        ORDER BY comments.date ASC
      `,
      values: [threadId],
    };

    const commentsResult = await this._pool.query(commentsQuery);

    return {
      ...threadResult.rows[0],
      comments: commentsResult.rows,
    };
  }
}

export default ThreadsRepositoryPostgres;
