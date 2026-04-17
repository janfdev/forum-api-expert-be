import { vi } from 'vitest';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import AddThreadUseCase from '../AddThreadUseCase.js';

describe('AddThreadUseCase', () => {
  it('should orchestrate add thread action correctly', async () => {
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'isi thread',
      owner: 'user-123',
    };

    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addNewThread = vi.fn()
      .mockImplementation(() => Promise.resolve(new AddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: useCasePayload.owner,
      })));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const addedThread = await addThreadUseCase.execute(useCasePayload);

    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addNewThread).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.addNewThread)
      .toHaveBeenCalledWith({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      });
  });

  it('should throw error when payload not contain needed property', async () => {
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: {},
    });

    await expect(addThreadUseCase.execute({ body: 'isi thread' }))
      .rejects.toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', async () => {
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: {},
    });

    await expect(addThreadUseCase.execute({ title: 'sebuah thread', body: 123 }))
      .rejects.toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});