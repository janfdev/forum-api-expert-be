import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';
import GetThreadDetailUseCase from '../../../../Applications/use_case/GetThreadDetailUseCase.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';
import AuthorizationError from '../../../../Commons/exceptions/AuthorizationError.js';
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadDetailHandler = this.getThreadDetailHandler.bind(this);
  }

  async postThreadHandler(req, res, next) {
    try {
      const accessToken = this._getAccessToken(req);
      const tokenManager = this._container.getInstance(AuthenticationTokenManager.name);
      const { id: owner } = await tokenManager.decodePayload(accessToken);

      const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
      const addedThread = await addThreadUseCase.execute({
        ...req.body,
        owner,
      });

      res.status(201).json({
        status: 'success',
        data: {
          addedThread,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getThreadDetailHandler(req, res, next) {
    try {
      const { threadId } = req.params;

      const getThreadDetailUseCase = this._container.getInstance(GetThreadDetailUseCase.name);
      const thread = await getThreadDetailUseCase.execute({ threadId });

      res.status(200).json({
        status: 'success',
        data: {
          thread,
        },
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

export default ThreadsHandler;