import express from 'express';

const createCommentsRouter = (handler) => {
  const router = express.Router();

  router.post('/', handler.postCommentHandler);
  router.delete('/:commentId', handler.deleteCommentHandler);

  return router;
};

export default createCommentsRouter;