const ForumPost = require('../models/ForumPost');

// 1. GET ALL POSTS
exports.getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate('user', 'username name email')
      .populate('postedBy', 'username name email')
      .populate('comments.user', 'username name')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. CREATE POST
exports.createPost = async (req, res) => {
  try {
    const { title, content, description, author, user, userId, isAnonymous } = req.body;

    const postContent = content || description || title;

    if (!postContent) {
      return res.status(400).json({ message: 'Post content is required.' });
    }

  
    let rawUserId = req.user?._id || user || userId || null;
    if (typeof rawUserId === 'object' && rawUserId !== null) {
      rawUserId = rawUserId._id || rawUserId.id || null;
    }

    const newPost = new ForumPost({
      content: postContent,
      description: postContent,
      title: title || 'Community Post',
      user: rawUserId,
      postedBy: rawUserId,
      author: author || 'Member',
      isAnonymous: Boolean(isAnonymous)
    });

    await newPost.save();

    const populatedPost = await ForumPost.findById(newPost._id)
      .populate('user', 'username name email')
      .populate('postedBy', 'username name email');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post detailed:', error);
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

// 3. ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const { text, content, userId, user } = req.body;
    const commentText = text || content;

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    let rawUserId = req.user?._id || user || userId || null;
    if (typeof rawUserId === 'object' && rawUserId !== null) {
      rawUserId = rawUserId._id || rawUserId.id || null;
    }

    post.comments.push({
      text: commentText,
      user: rawUserId
    });

    await post.save();

    const updatedPost = await ForumPost.findById(req.params.id)
      .populate('user', 'username name email')
      .populate('comments.user', 'username name');

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
};

// 4. VOTE POST
exports.votePost = async (req, res) => {
  try {
    const { type } = req.body;
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (type === 'upvote') post.votes = (post.votes || 0) + 1;
    if (type === 'downvote') post.votes = (post.votes || 0) - 1;

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. DELETE POST
exports.deletePost = async (req, res) => {
  try {
    await ForumPost.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};