const ForumPost = require('../models/ForumPost');

exports.getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const newPost = new ForumPost({ title, content, author });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: 'Error creating post', error: err.message });
  }
};

exports.votePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;
    const delta = direction === 'up' ? 1 : -1;

    const post = await ForumPost.findByIdAndUpdate(
      id,
      { $inc: { votes: delta } },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: 'Error updating vote', error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, author } = req.body;
    const post = await ForumPost.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ text, author });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: 'Error adding comment', error: err.message });
  }
};