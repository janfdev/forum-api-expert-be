/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const CommentTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'sebuah comment',
    owner = 'user-123',
    threadId = 'thread-123',
  }) {
    const query = {
      text: 'INSERT INTO comments (id, content, owner, "threadId") VALUES($1, $2, $3, $4)',
      values: [id, content, owner, threadId],
    };

    await pool.query(query);
  },

  async findCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT * FROM comments WHERE "threadId" = $1',
      values: [threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

export default CommentTableTestHelper;
