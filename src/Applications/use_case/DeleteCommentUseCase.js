class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { commentId } = useCasePayload;

    await this._commentRepository.deleteComment(commentId);
  }
}

export default DeleteCommentUseCase;