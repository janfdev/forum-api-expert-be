import AddedComment from '../AddedComment.js';

describe('an AddedComment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah komentar',
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah komentar',
      owner: 123,
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah komentar',
      owner: 'user-123',
    };

    // Action
    const addedComment = new AddedComment(payload);

    // Assert
    expect(addedComment).toEqual(payload);
  });
});
