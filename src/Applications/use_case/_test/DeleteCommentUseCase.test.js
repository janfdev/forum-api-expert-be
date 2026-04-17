import { vi } from 'vitest';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';

describe('DeleteCommentUseCase', () => {
  it('should orchestrate delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = vi.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyCommentInThread = vi.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyCommentOwner = vi.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.deleteComment = vi.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentInThread)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentOwner)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.owner);
    expect(mockCommentRepository.deleteComment)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);
  });
});
