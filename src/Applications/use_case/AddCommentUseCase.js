import NewComment from '../../Domains/comments/entities/NewComment.js';

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    const comment = new NewComment(useCasePayload);

    await this._threadRepository.verifyAvailableThread(threadId);

    return this._commentRepository.addComment({
      ...comment,
      owner: useCasePayload.owner,
      threadId,
    });
  }
}

export default AddCommentUseCase;