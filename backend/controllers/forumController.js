const ForumPost = require('../models/ForumPost');
const User = require('../models/User');
const { sendVoteNotification, sendCommentNotification } = require('./notificationController');

// 1. GET ALL POSTS
const getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate('user', 'username name email role trustScore')
      .populate('postedBy', 'username name email role trustScore')
      .populate('comments.user', 'username name role')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. CREATE POST
const createPost = async (req, res) => {
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
      isAnonymous: Boolean(isAnonymous),
      upvotes: [],
      downvotes: [],
      votes: 0
    });

    await newPost.save();

    const populatedPost = await ForumPost.findById(newPost._id)
      .populate('user', 'username name email role trustScore')
      .populate('postedBy', 'username name email role trustScore');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post detailed:', error);
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

// 3. ADD COMMENT
const addComment = async (req, res) => {
  try {
    const { text, content, userId, user, username } = req.body;
    const commentText = text || content;

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    let rawUserId = req.user?._id || user || userId || null;
    if (typeof rawUserId === 'object' && rawUserId !== null) {
      rawUserId = rawUserId._id || rawUserId.id || null;
    }

    const authorName = req.user?.username || username || 'User';

    post.comments.push({
      text: commentText,
      user: rawUserId,
      username: authorName
    });

    await post.save();

    const targetAuthorId = post.user || post.postedBy;
    if (targetAuthorId && !post.isAnonymous && typeof sendCommentNotification === 'function') {
      sendCommentNotification({
        recipientId: targetAuthorId,
        senderId: rawUserId,
        senderName: authorName,
        contentType: 'forum post',
        contentTitle: post.title || post.content,
        commentText: commentText,
        contentId: post._id
      });
    }

    const updatedPost = await ForumPost.findById(req.params.id)
      .populate('user', 'username name email role trustScore')
      .populate('comments.user', 'username name role');

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
};

// 4. VOTE POST
const votePost = async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'You must be logged in to vote.' });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.upvotes = post.upvotes || [];
    post.downvotes = post.downvotes || [];

    const targetAuthorId = post.user || post.postedBy;
    const hasUpvoted = post.upvotes.some((id) => id.toString() === userId.toString());
    const hasDownvoted = post.downvotes.some((id) => id.toString() === userId.toString());

    if (type === 'upvote') {
      if (hasUpvoted) {
        post.upvotes = post.upvotes.filter((id) => id.toString() !== userId.toString());
        if (targetAuthorId && !post.isAnonymous) {
          await User.findByIdAndUpdate(targetAuthorId, { $inc: { trustScore: -1 } });
        }
      } else {
        post.upvotes.push(userId);
        let trustDelta = 1;
        if (hasDownvoted) {
          post.downvotes = post.downvotes.filter((id) => id.toString() !== userId.toString());
          trustDelta = 2;
        }
        if (targetAuthorId && !post.isAnonymous) {
          await User.findByIdAndUpdate(targetAuthorId, { $inc: { trustScore: trustDelta } });

          if (typeof sendVoteNotification === 'function') {
            sendVoteNotification({
              recipientId: targetAuthorId,
              senderId: userId,
              senderName: req.user?.username,
              actionType: 'upvote',
              contentType: 'forum post',
              contentTitle: post.title || post.content,
              contentId: post._id
            });
          }
        }
      }
    } else if (type === 'downvote') {
      if (hasDownvoted) {
        post.downvotes = post.downvotes.filter((id) => id.toString() !== userId.toString());
        if (targetAuthorId && !post.isAnonymous) {
          await User.findByIdAndUpdate(targetAuthorId, { $inc: { trustScore: 1 } });
        }
      } else {
        post.downvotes.push(userId);
        let trustDelta = -1;
        if (hasUpvoted) {
          post.upvotes = post.upvotes.filter((id) => id.toString() !== userId.toString());
          trustDelta = -2;
        }
        if (targetAuthorId && !post.isAnonymous) {
          await User.findByIdAndUpdate(targetAuthorId, { $inc: { trustScore: trustDelta } });

          if (typeof sendVoteNotification === 'function') {
            sendVoteNotification({
              recipientId: targetAuthorId,
              senderId: userId,
              senderName: req.user?.username,
              actionType: 'downvote',
              contentType: 'forum post',
              contentTitle: post.title || post.content,
              contentId: post._id
            });
          }
        }
      }
    }

    post.votes = post.upvotes.length - post.downvotes.length;
    await post.save();

    const populatedPost = await ForumPost.findById(post._id)
      .populate('user', 'username name email role trustScore')
      .populate('postedBy', 'username name email role trustScore');

    res.status(200).json(populatedPost);
  } catch (error) {
    console.error('Vote Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 5. DELETE POST
const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    const currentUserId = req.user?._id?.toString();
    const currentUserRole = (req.user?.role || '').toString().toLowerCase().trim();

    const postAuthorId = (post.user?._id || post.user || post.postedBy?._id || post.postedBy || '').toString();
    const isAuthor = currentUserId && postAuthorId === currentUserId;
    const isPrivileged = ['authority', 'moderator', 'community moderator', 'admin'].includes(currentUserRole);

    if (!isAuthor && !isPrivileged) {
      return res.status(403).json({ message: 'Not authorized to delete this forum post.' });
    }

    await ForumPost.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  createPost,
  addComment,
  votePost,
  deletePost
};