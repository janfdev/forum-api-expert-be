import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';
import AuthorizationError from '../../../../Commons/exceptions/AuthorizationError.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/DeleteCommentUseCase.js';
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';
import NotFoundError from '../../../../Commons/exceptions/NotFoundError.js';

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(req, res, next) {
    try {
      const { threadId } = req.params;
      const accessToken = this._getAccessToken(req);
      const tokenManager = this._container.getInstance(AuthenticationTokenManager.name);
      const { id: owner } = await tokenManager.decodePayload(accessToken);

      const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
      const addedComment = await addCommentUseCase.execute({
        ...req.body,
        threadId,
        owner
      });

      res.status(201).json({
        status: 'success',
        data: {
          addedComment,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentHandler(req, res, next) {
    try {
      const { threadId, commentId } = req.params;

      if (!threadId) {
        throw new NotFoundError('thread tidak ditemukan');
      }

      if (!commentId) {
        throw new NotFoundError('comment tidak ditemukan');
      }

      const accessToken = this._getAccessToken(req);
      const tokenManager = this._container.getInstance(AuthenticationTokenManager.name);
      const { id: owner } = await tokenManager.decodePayload(accessToken);

      const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
      await deleteCommentUseCase.execute({
        threadId,
        commentId,
        owner
      });

      res.status(200).json({
        status: 'success'
      });
    } catch (error) {
      next(error);
    }
  }

  _getAccessToken(req) {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      throw new AuthenticationError('Missing authentication');
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AuthorizationError('Anda harus menyertakan access token yang valid');
    }

    return token;
  }
}

export default CommentsHandler;