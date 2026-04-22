import express from 'express';

const createCommentsRouter = (handler) => {
  const router = express.Router();

  router.post('/:threadId/comments', handler.postCommentHandler);
  router.delete('/:threadId/comments/:commentId', handler.deleteCommentHandler);

  return router;
};

export default createCommentsRouter;