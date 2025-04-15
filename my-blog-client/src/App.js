import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [gridData, setGridData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch articles when component mounts
  useEffect(() => {
    fetchArticles();
  }, []);

  // Get all articles from API
  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://localhost:7257/api/Article');
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API response:", data); // Debug to see actual property names
      
      // Map the response data to match what our component expects
      const normalizedData = data.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        createdDate: item.createdDate,
        imageBase64: item.imageBase64, // Already includes the full data URL
        imageMimeType: item.imageMimeType
      }));
      
      setGridData(normalizedData);
      
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      setError('Failed to load articles. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  };

  // Submit article to API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Create FormData object for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      
      // Add image file if selected
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }
      
      const response = await fetch('https://test-task-api-dbfmcab7c0bqdret.canadacentral-01.azurewebsites.net/api/Article', {
        method: 'POST',
        // Do not set Content-Type header when using FormData
        // The browser will set it automatically with the correct boundary
        body: formDataToSend
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Clear form and fetch updated articles
      setFormData({ title: '', content: '' });
      setSelectedFile(null);
      setFilePreview(null);
      await fetchArticles();
      alert('Blog post saved successfully!');
      
    } catch (err) {
      console.error('Failed to save article:', err);
      setError('Failed to save article. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="tab-container">
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            Create Post
          </button>
          <button 
            className={`tab-button ${activeTab === 'grid' ? 'active' : ''}`}
            onClick={() => setActiveTab('grid')}
          >
            Posts
          </button>
        </div>

        <div className="tab-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        
          {activeTab === 'form' && (
            <div className="form-tab">
              <h2>New Blog Post</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="content">Content</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows="6"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-group attachment-field">
                  <label htmlFor="attachment" className="attachment-label">
                    <span className="paperclip-icon">📎</span>
                    {selectedFile ? 'Change Image' : 'Add Image'}
                  </label>
                  <input
                    type="file"
                    id="attachment"
                    name="attachment"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                  {selectedFile ? (
                    <span className="file-name">{selectedFile.name}</span>
                  ) : (
                    <span className="attachment-note">Add an image to your post</span>
                  )}
                </div>
                
                {filePreview && (
                  <div className="image-preview">
                    <img 
                      src={filePreview} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '200px' }} 
                    />
                  </div>
                )}
                
                <button type="submit" className="save-button" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Publish'}
                </button>
              </form>
            </div>
          )}
          
          {activeTab === 'grid' && (
            <div className="grid-tab">
              <h2>Blog Posts</h2>
              {isLoading ? (
                <p>Loading articles...</p>
              ) : gridData.length > 0 ? (
                <div className="blog-posts-grid">
                  {gridData.map(post => (
                    <div key={post.id} className="blog-post-card">
                      <div className="post-image-container">
                        {post.imageBase64 ? (
                          <img 
                            src={post.imageBase64}
                            alt={post.title}
                            className="post-image"
                            onError={(e) => {
                              console.error("Image failed to load:", post.id);
                              e.target.onerror = null;
                              e.target.src = ''; // Clear src on error
                              e.target.parentElement.innerHTML = 'Image Error';
                            }}
                          />
                        ) : (
                          <div className="post-image-placeholder">No Image</div>
                        )}
                      </div>
                      <div className="post-details">
                        <div className="post-id">#{post.id}</div>
                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-content">
                        {post.content.length > 150 
                          ? `${post.content.substring(0, 150)}...` 
                          : post.content
                        }
                      </p>
                        <p className="post-date">Created on: {post.createdDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No posts available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
