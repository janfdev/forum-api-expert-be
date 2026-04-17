import NewComment from '../NewComment.js';

describe('a NewComment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
    };

    // Action and Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'sebuah komentar',
    };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment.content).toEqual(payload.content);
  });
});
