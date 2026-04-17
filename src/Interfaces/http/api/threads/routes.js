import express from 'express';

const createThreadsRouter = (handler) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', handler.postThreadHandler);
  router.get('/:threadId', handler.getThreadDetailHandler);

  return router;
};

export default createThreadsRouter;
