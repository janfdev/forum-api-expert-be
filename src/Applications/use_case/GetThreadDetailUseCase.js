class GetThreadDetailUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    const threadDetail = await this._threadRepository.getThreadDetailById(threadId);

    return {
      ...threadDetail,
      comments: threadDetail.comments.map((comment) => ({
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      })),
    };
  }
}

export default GetThreadDetailUseCase;