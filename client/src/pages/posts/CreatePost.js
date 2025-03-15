import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  IconButton,
} from '@mui/material';
import { PhotoCamera, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} className="post-form">
        <Typography variant="h5" component="h1" gutterBottom>
          Create New Post
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            required
          />

          <Box sx={{ mt: 2, mb: 2 }}>
            <input
              accept="image/*"
              id="image-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCamera />}
              >
                Add Image
              </Button>
            </label>
          </Box>

          {imagePreview && (
            <Box sx={{ position: 'relative', mt: 2, mb: 2 }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }}
              />
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
                onClick={removeImage}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
            >
              {loading ? 'Creating...' : 'Create Post'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreatePost;
