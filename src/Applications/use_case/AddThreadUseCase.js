import NewThread from '../../Domains/threads/entities/NewThread.js';

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const thread = new NewThread(useCasePayload);

    return this._threadRepository.addNewThread({
      ...thread,
      owner: useCasePayload.owner,
    });
  }
}

export default AddThreadUseCase;
