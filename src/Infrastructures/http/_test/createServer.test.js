import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentTableTestHelper from '../../../../tests/CommentTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

describe('HTTP server', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const app = await createServer({});

    // Action
    const response = await request(app).get('/unregisteredRoute');

    // Assert
    expect(response.status).toEqual(404);
  });

  describe('when POST /users', () => {
    it('should response 400 when request body is malformed JSON', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send('{"username":');

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('request body harus berupa JSON yang valid');
    });

    it('should response 201 and persisted user', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/users').send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedUser).toBeDefined();

      const { id: addedUserId, username, fullname } = response.body.data.addedUser;
      const users = await UsersTableTestHelper.findUsersById(addedUserId);
      expect(users).toHaveLength(1);
      expect(users[0].username).toEqual(username);
      expect(users[0].fullname).toEqual(fullname);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        fullname: 'Dicoding Indonesia',
        password: 'secret',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/users').send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: ['Dicoding Indonesia'],
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/users').send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena tipe data tidak sesuai');
    });

    it('should response 400 when username more than 50 character', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/users').send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena karakter username melebihi batas limit');
    });

    it('should response 400 when username contain restricted character', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding indonesia',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/users').send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena username mengandung karakter terlarang');
    });

    it('should response 400 when username unavailable', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const requestPayload = {
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
        password: 'super_secret',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/users').send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username tidak tersedia');
    });
  });

  describe('when POST /authentications', () => {
    it('should response 201 and new authentication', async () => {
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const app = await createServer(container);

      await request(app).post('/users').send({
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      const response = await request(app).post('/authentications').send(requestPayload);

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should response 400 if username not found', async () => {
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const app = await createServer(container);

      const response = await request(app).post('/authentications').send(requestPayload);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username tidak ditemukan');
    });

    it('should response 401 if password wrong', async () => {
      const requestPayload = {
        username: 'dicoding',
        password: 'wrong_password',
      };
      const app = await createServer(container);

      await request(app).post('/users').send({
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      const response = await request(app).post('/authentications').send(requestPayload);

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('kredensial yang Anda masukkan salah');
    });

    it('should response 400 if login payload not contain needed property', async () => {
      const requestPayload = {
        username: 'dicoding',
      };
      const app = await createServer(container);

      const response = await request(app).post('/authentications').send(requestPayload);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan username dan password');
    });

    it('should response 400 if login payload wrong data type', async () => {
      const requestPayload = {
        username: 123,
        password: 'secret',
      };
      const app = await createServer(container);

      const response = await request(app).post('/authentications').send(requestPayload);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username dan password harus string');
    });
  });

  describe('when PUT /authentications', () => {
    it('should return 200 and new access token', async () => {
      const app = await createServer(container);

      await request(app).post('/users').send({
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      const loginResponse = await request(app).post('/authentications').send({
        username: 'dicoding',
        password: 'secret',
      });

      const { refreshToken } = loginResponse.body.data;
      const response = await request(app).put('/authentications').send({ refreshToken });

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.accessToken).toBeDefined();
      expect(typeof response.body.data.accessToken).toEqual('string');
      expect(response.body.data.accessToken.length).toBeGreaterThan(0);
    });

    it('should return 400 payload not contain refresh token', async () => {
      const app = await createServer(container);

      const response = await request(app).put('/authentications').send({});

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan token refresh');
    });

    it('should return 400 if refresh token not string', async () => {
      const app = await createServer(container);

      const response = await request(app).put('/authentications').send({ refreshToken: 123 });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token harus string');
    });

    it('should return 400 if refresh token not valid', async () => {
      const app = await createServer(container);

      const response = await request(app).put('/authentications').send({ refreshToken: 'invalid_refresh_token' });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak valid');
    });

    it('should return 400 if refresh token not registered in database', async () => {
      const app = await createServer(container);
      const refreshToken = await container.getInstance(AuthenticationTokenManager.name).createRefreshToken({ username: 'dicoding' });

      const response = await request(app).put('/authentications').send({ refreshToken });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak ditemukan di database');
    });
  });

  describe('when DELETE /authentications', () => {
    it('should response 200 if refresh token valid', async () => {
      const app = await createServer(container);
      const refreshToken = 'refresh_token';
      await AuthenticationsTableTestHelper.addToken(refreshToken);

      const response = await request(app).delete('/authentications').send({ refreshToken });

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');

      const tokens = await AuthenticationsTableTestHelper.findToken(refreshToken);
      expect(tokens).toHaveLength(0);
    });

    it('should response 400 if refresh token not registered in database', async () => {
      const app = await createServer(container);
      const refreshToken = 'refresh_token';

      const response = await request(app).delete('/authentications').send({ refreshToken });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak ditemukan di database');
    });

    it('should response 400 if payload not contain refresh token', async () => {
      const app = await createServer(container);

      const response = await request(app).delete('/authentications').send({});

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan token refresh');
    });
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken({
          id: 'user-123',
          username: 'dicoding',
        });

      const app = await createServer(container);
      const requestPayload = {
        title: 'sebuah thread',
        body: 'isi thread',
      };

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual(requestPayload.title);
      expect(response.body.data.addedThread.owner).toEqual('user-123');

      const { id: addedThreadId } = response.body.data.addedThread;
      const threads = await ThreadsTableTestHelper.findThreadById(addedThreadId);
      expect(threads).toHaveLength(1);
      expect(threads[0].title).toEqual(requestPayload.title);
      expect(threads[0].body).toEqual(requestPayload.body);
      expect(threads[0].owner).toEqual('user-123');
    });

    it('should response 400 when payload not contain needed property', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken({
          id: 'user-123',
          username: 'dicoding',
        });

      const app = await createServer(container);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread' });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan title dan body thread');
    });

    it('should response 401 when access token not provided', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post('/threads')
        .send({ title: 'sebuah thread', body: 'isi thread' });

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 403 when access token format invalid', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', 'Basic invalidtoken')
        .send({ title: 'sebuah thread', body: 'isi thread' });

      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Anda harus menyertakan access token yang valid');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and the thread', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'isi thread',
        owner: 'user-123',
      });

      const app = await createServer(container);

      const response = await request(app).get('/threads/thread-123');

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.id).toEqual('thread-123');
      expect(response.body.data.thread.title).toEqual('sebuah thread');
      expect(response.body.data.thread.body).toEqual('isi thread');
      expect(response.body.data.thread.username).toEqual('dicoding');
    });

    it('should response 404 when thread not found', async () => {
      const app = await createServer(container);

      const response = await request(app).get('/threads/thread-404');

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread tidak ditemukan');
    });

    it('should mask deleted comment content in thread detail', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'komentar lama',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      await CommentTableTestHelper.deleteCommentById('comment-123');

      const app = await createServer(container);
      const response = await request(app).get('/threads/thread-123');

      expect(response.status).toEqual(200);
      expect(response.body.data.thread.comments).toHaveLength(1);
      expect(response.body.data.thread.comments[0].content).toEqual('**komentar telah dihapus**');
    });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken({
          id: 'user-123',
          username: 'dicoding',
        });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'isi thread',
        owner: 'user-123',
      });

      const app = await createServer(container);

      const response = await request(app)
        .post('/threads/thread-123/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment).toBeDefined();
      expect(response.body.data.addedComment.content).toEqual('sebuah komentar');
      expect(response.body.data.addedComment.owner).toEqual('user-123');

      const comments = await CommentTableTestHelper.findCommentsByThreadId('thread-123');
      expect(comments).toHaveLength(1);
      expect(comments[0]).toMatchObject({
        content: 'sebuah komentar',
        owner: 'user-123',
        threadId: 'thread-123',
      });
    });

    it('should response 401 when access token not provided', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post('/threads/thread-123/comments')
        .send({ content: 'sebuah komentar' });

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 403 when access token format invalid', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post('/threads/thread-123/comments')
        .set('Authorization', 'Basic invalidtoken')
        .send({ content: 'sebuah komentar' });

      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Anda harus menyertakan access token yang valid');
    });

    it('should response 404 when thread not found', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken({
          id: 'user-123',
          username: 'dicoding',
        });

      const app = await createServer(container);

      const response = await request(app)
        .post('/threads/thread-404/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and soft delete the comment', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken({
          id: 'user-123',
          username: 'dicoding',
        });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'isi thread',
        owner: 'user-123',
      });

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const app = await createServer(container);

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123')
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');

      const comments = await CommentTableTestHelper.findCommentsByThreadId('thread-123');
      expect(comments).toHaveLength(1);
      expect(comments[0].isDelete).toBe(true);
    });

    it('should response 401 when access token not provided', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123')
        .send();

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 403 when access token format invalid', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123')
        .set('Authorization', 'Basic invalidtoken')
        .send();

      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Anda harus menyertakan access token yang valid');
    });

    it('should response 404 when comment not found', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken({
          id: 'user-123',
          username: 'dicoding',
        });

      const app = await createServer(container);

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-404')
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('comment tidak ditemukan');
    });

    it('should response 403 when deleting comment from another owner', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'johndoe',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const accessToken = await container.getInstance(AuthenticationTokenManager.name)
        .createAccessToken({
          id: 'user-456',
          username: 'johndoe',
        });

      const app = await createServer(container);

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123')
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Anda tidak berhak mengakses resource ini');
    });
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const app = await createServer({});

    // Action
    const response = await request(app).post('/users').send(requestPayload);

    // Assert
    expect(response.status).toEqual(500);
    expect(response.body.status).toEqual('error');
    expect(response.body.message).toEqual('terjadi kegagalan pada server kami');
  });
});
