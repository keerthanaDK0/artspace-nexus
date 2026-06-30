import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ArtworkDetail.css';

const ArtworkDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [artwork, setArtwork] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const imageRef = useRef(null);

    useEffect(() => {
        fetchArtwork();
        if (user) {
            checkSavedStatus();
        }
    }, [id, user]);

    const fetchArtwork = async () => {
        try {
            const res = await axios.get(`/artworks/${id}`);
            setArtwork(res.data.artwork);
            setComments(res.data.comments || []);
            setLikeCount(res.data.artwork.likes?.length || 0);
            if (user && res.data.artwork.likes) {
                setIsLiked(res.data.artwork.likes.includes(user.id));
            }
        } catch (error) {
            console.error('Error fetching artwork:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkSavedStatus = async () => {
        try {
            const res = await axios.get('/auth/me');
            const saved = res.data.user.savedArtworks || [];
            setIsSaved(saved.includes(id));
        } catch (error) {
            console.error('Error checking saved status:', error);
        }
    };

    const handleLike = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            const res = await axios.put(`/artworks/${id}/like`);
            setIsLiked(res.data.liked);
            setLikeCount(res.data.likes);
        } catch (error) {
            console.error('Error liking artwork:', error);
        }
    };

    const handleSave = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            const res = await axios.put(`/artworks/${id}/save`);
            setIsSaved(res.data.saved);
        } catch (error) {
            console.error('Error saving artwork:', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        if (!newComment.trim()) return;

        try {
            const res = await axios.post('/comments', {
                text: newComment,
                artworkId: id
            });
            setComments([res.data.comment, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const handleShare = async (platform) => {
        try {
            await axios.put(`/artworks/${id}/share`);
            const url = window.location.href;
            let shareUrl = '';

            switch (platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(artwork.title)}&url=${encodeURIComponent(url)}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                    break;
                case 'copy':
                    await navigator.clipboard.writeText(url);
                    alert('Link copied to clipboard!');
                    return;
                default:
                    return;
            }

            window.open(shareUrl, '_blank');
            setShowShareMenu(false);
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleDownload = async () => {
        try {
            await axios.put(`/artworks/${id}/download`);
            const link = document.createElement('a');
            link.href = artwork.imageUrl;
            link.download = `${artwork.title}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading:', error);
        }
    };

    const handleZoomToggle = () => {
        setIsZoomed(!isZoomed);
    };

    if (loading) return <div className="loading-container">Loading...</div>;
    if (!artwork) return <div className="loading-container">Artwork not found</div>;

    return (
        <div className="artwork-detail-container">
            <div className="artwork-detail-grid">
                {/* Image Section */}
                <div className="artwork-image-section">
                    <div
                        className={`image-wrapper ${isZoomed ? 'zoomed' : ''}`}
                        onClick={handleZoomToggle}
                    >
                        <img
                            ref={imageRef}
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="artwork-detail-image"
                        />
                        <div className="image-zoom-hint">
                            <span>🔍 Click to {isZoomed ? 'zoom out' : 'zoom in'}</span>
                        </div>
                    </div>
                    <div className="image-actions">
                        <button className="action-btn" onClick={handleZoomToggle}>
                            {isZoomed ? '🔍 Zoom Out' : '🔍 Zoom In'}
                        </button>
                        <button className="action-btn" onClick={handleDownload}>
                            ⬇️ Download
                        </button>
                        <button className="action-btn" onClick={() => setShowShareMenu(!showShareMenu)}>
                            📤 Share
                        </button>
                        {showShareMenu && (
                            <div className="share-menu">
                                <button onClick={() => handleShare('facebook')}>📘 Facebook</button>
                                <button onClick={() => handleShare('twitter')}>🐦 Twitter</button>
                                <button onClick={() => handleShare('linkedin')}>💼 LinkedIn</button>
                                <button onClick={() => handleShare('copy')}>📋 Copy Link</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Section */}
                <div className="artwork-details-section">
                    <h1 className="artwork-title">{artwork.title}</h1>
                    <p className="artwork-artist">by {artwork.artist}</p>

                    <div className="artwork-meta-grid">
                        <div className="meta-item">
                            <span className="meta-label">📅 Year</span>
                            <span className="meta-value">{artwork.year}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">🎨 Category</span>
                            <span className="meta-value">{artwork.category}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">🖌️ Medium</span>
                            <span className="meta-value">{artwork.medium}</span>
                        </div>
                        {artwork.dimensions && (
                            <div className="meta-item">
                                <span className="meta-label">📏 Dimensions</span>
                                <span className="meta-value">{artwork.dimensions}</span>
                            </div>
                        )}
                        {artwork.price > 0 && (
                            <div className="meta-item">
                                <span className="meta-label">💰 Price</span>
                                <span className="meta-value">${artwork.price}</span>
                            </div>
                        )}
                    </div>

                    {artwork.description && (
                        <div className="artwork-description">
                            <h3>📝 Description</h3>
                            <p>{artwork.description}</p>
                        </div>
                    )}

                    <div className="artwork-stats">
                        <button className={`stat-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                            ❤️ {likeCount}
                        </button>
                        <button className={`stat-btn ${isSaved ? 'saved' : ''}`} onClick={handleSave}>
                            📌 {isSaved ? 'Saved' : 'Save'}
                        </button>
                        <span className="stat-item">👁️ {artwork.views}</span>
                        <span className="stat-item">⬇️ {artwork.downloads}</span>
                        <span className="stat-item">📤 {artwork.shares}</span>
                    </div>

                    {/* Comments Section */}
                    <div className="comments-section">
                        <h3>💬 Comments ({comments.length})</h3>
                        {user ? (
                            <form onSubmit={handleComment} className="comment-form">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="comment-input"
                                />
                                <button type="submit" className="comment-btn">Post</button>
                            </form>
                        ) : (
                            <p className="login-to-comment">Login to leave a comment</p>
                        )}
                        <div className="comments-list">
                            {comments.map(comment => (
                                <div key={comment._id} className="comment-item">
                                    <div className="comment-avatar">👤</div>
                                    <div className="comment-content">
                                        <p className="comment-user">{comment.user?.name || 'Anonymous'}</p>
                                        <p className="comment-text">{comment.text}</p>
                                        <p className="comment-date">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtworkDetail;