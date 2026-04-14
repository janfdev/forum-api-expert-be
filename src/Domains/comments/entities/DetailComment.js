class DetailComment {
  constructor(payload) {
    const { id, username, date, content } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
  }

}

export default DetailComment;