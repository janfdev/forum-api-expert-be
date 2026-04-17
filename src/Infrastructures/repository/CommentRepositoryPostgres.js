import AddedComment from '../../Domains/comments/entities/AddedComment.js';
import CommentRepository from '../../Domains/comments/CommentRepository.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';
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

  async verifyCommentInThread(commentId, threadId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND "threadId" = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteComment(commentId, threadId) {
    const query = {
      text: 'UPDATE comments SET "isDelete" = true WHERE id = $1 AND "threadId" = $2 RETURNING id',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    return result.rows[0];
  }
}

export default CommentRepositoryPostgres;