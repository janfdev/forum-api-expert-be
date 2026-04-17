import pool from '../../database/postgres/pool.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentTableTestHelper from '../../../../tests/CommentTableTestHelper.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123-add-comment',
        username: 'dicoding-add-comment',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123-add-comment',
        owner: 'user-123-add-comment',
      });

      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepository.addComment({
        content: 'sebuah komentar',
        owner: 'user-123-add-comment',
        threadId: 'thread-123-add-comment',
      });

      // Assert
      const comments = await CommentTableTestHelper.findCommentsByThreadId('thread-123-add-comment');
      expect(comments).toHaveLength(1);
      expect(comments[0]).toMatchObject({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-123-add-comment',
        threadId: 'thread-123-add-comment',
      });
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-123-add-comment',
      }));
    });
  });

  describe('verifyCommentInThread function', () => {
    it('should throw NotFoundError when comment unavailable in thread', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(commentRepository.verifyCommentInThread('comment-123', 'thread-123'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when comment is available in thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123-verify-thread', username: 'dicoding-verify-thread' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123-verify-thread', owner: 'user-123-verify-thread' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123-verify-thread',
        owner: 'user-123-verify-thread',
        threadId: 'thread-123-verify-thread',
      });
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(commentRepository.verifyCommentInThread('comment-123-verify-thread', 'thread-123-verify-thread'))
        .resolves
        .toBeUndefined();
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when owner does not match', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123-owner-mismatch', username: 'dicoding-owner-mismatch' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123-owner-mismatch', owner: 'user-123-owner-mismatch' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123-owner-mismatch',
        owner: 'user-123-owner-mismatch',
        threadId: 'thread-123-owner-mismatch',
      });
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(commentRepository.verifyCommentOwner('comment-123-owner-mismatch', 'user-456'))
        .rejects
        .toThrow(AuthorizationError);
    });

    it('should not throw when owner matches', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123-owner-match', username: 'dicoding-owner-match' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123-owner-match', owner: 'user-123-owner-match' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123-owner-match',
        owner: 'user-123-owner-match',
        threadId: 'thread-123-owner-match',
      });
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(commentRepository.verifyCommentOwner('comment-123-owner-match', 'user-123-owner-match'))
        .resolves
        .toBeUndefined();
    });
  });

  describe('deleteComment function', () => {
    it('should soft delete comment in database', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123-delete-comment', username: 'dicoding-delete-comment' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123-delete-comment', owner: 'user-123-delete-comment' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123-delete-comment',
        owner: 'user-123-delete-comment',
        threadId: 'thread-123-delete-comment',
      });
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');

      // Action
      await commentRepository.deleteComment('comment-123-delete-comment', 'thread-123-delete-comment');

      // Assert
      const comments = await CommentTableTestHelper.findCommentsByThreadId('thread-123-delete-comment');
      expect(comments).toHaveLength(1);
      expect(comments[0].isDelete).toBe(true);
    });

    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(commentRepository.deleteComment('comment-404', 'thread-123'))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});
