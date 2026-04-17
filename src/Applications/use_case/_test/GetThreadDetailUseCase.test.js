import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate get thread detail action correctly and mask deleted comment', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const threadDetail = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'isi thread',
      date: '2026-01-01T00:00:00.000Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2026-01-01T00:00:00.000Z',
          content: 'komentar aktif',
          ['is_delete']: false,
        },
        {
          id: 'comment-456',
          username: 'johndoe',
          date: '2026-01-01T00:01:00.000Z',
          content: 'komentar terhapus',
          ['is_delete']: true,
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadDetailById = vi.fn()
      .mockImplementation(() => Promise.resolve(threadDetail));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const result = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadDetailById)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(result).toStrictEqual({
      ...threadDetail,
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2026-01-01T00:00:00.000Z',
          content: 'komentar aktif',
        },
        {
          id: 'comment-456',
          username: 'johndoe',
          date: '2026-01-01T00:01:00.000Z',
          content: '**komentar telah dihapus**',
        },
      ],
    });
  });
});
