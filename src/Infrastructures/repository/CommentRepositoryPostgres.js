import AddedComment from '../../Domains/comments/entities/AddedComment';
import CommentRepository from '../../Domains/comments/CommentRepository.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, owner, threadId } = newComment;

    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments (id, content, owner, "threadId") VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, threadId]
    };

    const result = await this._pool.query(query);
    return new AddedComment(result.rows[0]);
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET "isDelete" = true WHERE id = $1 RETURNING id',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }
}

export default CommentRepositoryPostgres;