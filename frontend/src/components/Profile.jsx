import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = ({ user, setUser }) => {
    const [loading, setLoading] = useState(true);
    const [artworks, setArtworks] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        location: user?.location || '',
        website: user?.website || ''
    });

    useEffect(() => {
        fetchUserArtworks();
    }, []);

    const fetchUserArtworks = async () => {
        try {
            const res = await axios.get('/artworks');
            const userArtworks = res.data.artworks.filter(
                art => art.user?._id === user?.id
            );
            setArtworks(userArtworks);
        } catch (error) {
            console.error('Error fetching user artworks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => setIsEditing(true);
    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || '',
            bio: user?.bio || '',
            location: user?.location || '',
            website: user?.website || ''
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('/auth/profile', formData);
            setUser(res.data.user);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="loading-container">Loading profile...</div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">👤</div>
                <div className="profile-info">
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="profile-edit-form">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                />
                            </div>
                            <div className="form-group">
                                <label>Website</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                            <div className="profile-actions">
                                <button type="submit" className="save-btn">💾 Save</button>
                                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <h1>{user?.name}</h1>
                            <p className="profile-email">{user?.email}</p>
                            {user?.bio && <p className="profile-bio">{user.bio}</p>}
                            <div className="profile-details">
                                {user?.location && <span>📍 {user.location}</span>}
                                {user?.website && <span>🔗 <a href={user.website} target="_blank">{user.website}</a></span>}
                            </div>
                            <button className="edit-btn" onClick={handleEdit}>✏️ Edit Profile</button>
                        </>
                    )}
                </div>
            </div>

            <div className="profile-stats">
                <div className="stat-box">
                    <span className="stat-number">{artworks.length}</span>
                    <span className="stat-label">Artworks</span>
                </div>
                <div className="stat-box">
                    <span className="stat-number">{user?.followers?.length || 0}</span>
                    <span className="stat-label">Followers</span>
                </div>
                <div className="stat-box">
                    <span className="stat-number">{user?.following?.length || 0}</span>
                    <span className="stat-label">Following</span>
                </div>
            </div>

            <div className="profile-artworks">
                <h2>My Artworks</h2>
                {artworks.length === 0 ? (
                    <div className="empty-artworks">
                        <p>You haven't uploaded any artworks yet.</p>
                        <Link to="/add" className="upload-link">➕ Upload Your First Artwork</Link>
                    </div>
                ) : (
                    <div className="artworks-grid">
                        {artworks.map(art => (
                            <Link to={`/artwork/${art._id}`} key={art._id} className="artwork-card">
                                <img src={art.imageUrl} alt={art.title} />
                                <div className="artwork-info">
                                    <h3>{art.title}</h3>
                                    <p>{art.category} • {art.year}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;