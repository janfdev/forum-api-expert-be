import CommentsHandler from '../handler.js';
import NotFoundError from '../../../../../Commons/exceptions/NotFoundError.js';

describe('CommentsHandler', () => {
  it('should pass NotFoundError to next when threadId missing', async () => {
    // Arrange
    const commentsHandler = new CommentsHandler({});
    const req = {
      params: { commentId: 'comment-123' },
      headers: {},
    };
    const res = {};
    const next = vi.fn();

    // Action
    await commentsHandler.deleteCommentHandler(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError);
    expect(next.mock.calls[0][0].message).toEqual('thread tidak ditemukan');
  });

  it('should pass NotFoundError to next when commentId missing', async () => {
    // Arrange
    const commentsHandler = new CommentsHandler({});
    const req = {
      params: { threadId: 'thread-123' },
      headers: {},
    };
    const res = {};
    const next = vi.fn();

    // Action
    await commentsHandler.deleteCommentHandler(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError);
    expect(next.mock.calls[0][0].message).toEqual('comment tidak ditemukan');
  });
});
