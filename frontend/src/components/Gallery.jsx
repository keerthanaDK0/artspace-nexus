import React, { useState, useEffect } from 'react';
import './Gallery.css';

const Gallery = ({ artworks }) => {
    const [filteredArtworks, setFilteredArtworks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    // Get unique categories from uploaded artworks
    const categories = ['all', ...new Set(artworks.map(art => art.category))];

    useEffect(() => {
        let filtered = artworks;

        if (searchTerm) {
            filtered = filtered.filter(art =>
                art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                art.artist.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(art => art.category === selectedCategory);
        }

        setFilteredArtworks(filtered);
    }, [searchTerm, selectedCategory, artworks]);

    const handleLike = (id) => {
        const updatedArtworks = artworks.map(art =>
            art.id === id ? { ...art, likes: (art.likes || 0) + 1 } : art
        );
        localStorage.setItem('artworks', JSON.stringify(updatedArtworks));
        window.dispatchEvent(new Event('storage'));
    };

    useEffect(() => {
        const handleStorageChange = () => {
            window.location.reload();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <div className="gallery-container">
            <div className="gallery-header">
                <h1>🎨 Art Gallery</h1>
                <p>Your personal collection of uploaded masterpieces</p>
            </div>

            {artworks.length === 0 ? (
                <div className="empty-gallery">
                    <div className="empty-gallery-content">
                        <div className="empty-icon">🖼️</div>
                        <h2>Your Gallery is Empty</h2>
                        <p>You haven't uploaded any artworks yet.</p>
                        <button
                            className="btn-primary upload-btn"
                            onClick={() => window.location.href = '/add'}
                        >
                            ✨ Upload Your First Artwork
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="gallery-controls">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search by title or artist..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <span className="search-icon">🔍</span>
                        </div>

                        {categories.length > 1 && (
                            <div className="filter-tabs">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat === 'all' ? 'All Artworks' : cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="view-controls">
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                ⊞ Grid
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                ≡ List
                            </button>
                        </div>
                    </div>

                    <div className={`artworks-container ${viewMode}`}>
                        {filteredArtworks.map((art) => (
                            <div key={art.id} className="artwork-item">
                                <div className="artwork-image-container">
                                    <img
                                        src={art.imageData}
                                        alt={art.title}
                                        className="artwork-img"
                                    />
                                    <div className="artwork-overlay">
                                        <button className="quick-view">Quick View</button>
                                    </div>
                                </div>
                                <div className="artwork-details">
                                    <h3>{art.title}</h3>
                                    <p className="artist-name">by {art.artist}</p>
                                    <div className="artwork-meta">
                                        <span className="category">{art.category}</span>
                                        <span className="year">{art.year}</span>
                                        {art.medium && <span className="medium">{art.medium}</span>}
                                    </div>
                                    {art.price && (
                                        <div className="artwork-price">💰 ${art.price}</div>
                                    )}
                                    {art.dimensions && (
                                        <div className="artwork-dimensions">📏 {art.dimensions}</div>
                                    )}
                                    <div className="artwork-stats">
                                        <button className="like-btn" onClick={() => handleLike(art.id)}>
                                            ❤️ {art.likes || 0}
                                        </button>
                                        <span className="views">👁️ {art.views || 0}</span>
                                        <span className="date-added">
                                            📅 {new Date(art.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredArtworks.length === 0 && (
                        <div className="no-results">
                            <p>No artworks found matching your criteria</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Gallery;