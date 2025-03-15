import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Avatar,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch posts');
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) return;
    try {
      await axios.post(`http://localhost:5000/api/posts/${postId}/like`);
      fetchPosts(); // Refresh posts to update likes
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box className="loading-spinner">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <TextField
        fullWidth
        label="Search posts or users"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <Grid container spacing={3}>
        {filteredPosts.map((post) => (
          <Grid item xs={12} key={post._id}>
            <Card className="post-card">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={post.author.profilePicture}
                    alt={post.author.username}
                    sx={{ mr: 1 }}
                  />
                  <Box>
                    <Typography
                      component={RouterLink}
                      to={`/profile/${post.author._id}`}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {post.author.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {moment(post.createdAt).fromNow()}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" paragraph>
                  {post.content}
                </Typography>
                {post.image && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <img
                      src={post.image}
                      alt="Post content"
                      style={{ maxWidth: '100%', borderRadius: '4px' }}
                    />
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <IconButton
                  onClick={() => handleLike(post._id)}
                  color={post.likes.includes(user?._id) ? 'secondary' : 'default'}
                >
                  {post.likes.includes(user?._id) ? (
                    <FavoriteIcon />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {post.likes.length} likes
                </Typography>
                <IconButton>
                  <CommentIcon />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {post.comments.length} comments
                </Typography>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {user && (
        <Button
          component={RouterLink}
          to="/create-post"
          variant="contained"
          color="primary"
          sx={{ position: 'fixed', bottom: 20, right: 20 }}
        >
          Create Post
        </Button>
      )}
    </Container>
  );
};

export default Home;
