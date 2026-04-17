class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;

    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyCommentInThread(commentId, threadId);
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    await this._commentRepository.deleteComment(commentId, threadId);
  }
}

export default DeleteCommentUseCase;