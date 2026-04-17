import { vi } from 'vitest';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import AddCommentUseCase from '../AddCommentUseCase.js';

describe('AddCommentUseCase', () => {
  it('should orchestrate add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah komentar',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyAvailableThread = vi.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.addComment = vi.fn()
      .mockImplementation(() => Promise.resolve(new AddedComment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      })));

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.addComment)
      .toHaveBeenCalledWith({
        content: useCasePayload.content,
        owner: useCasePayload.owner,
        threadId: useCasePayload.threadId,
      });
  });

  it('should throw error when payload not contain needed property', async () => {
    // Arrange
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: {},
      threadRepository: {},
    });

    // Action & Assert
    await expect(addCommentUseCase.execute({ owner: 'user-123', threadId: 'thread-123' }))
      .rejects
      .toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', async () => {
    // Arrange
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: {},
      threadRepository: {},
    });

    // Action & Assert
    await expect(addCommentUseCase.execute({
      content: 123,
      owner: 'user-123',
      threadId: 'thread-123',
    }))
      .rejects
      .toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});

