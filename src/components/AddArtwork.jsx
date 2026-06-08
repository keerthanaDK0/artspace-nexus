import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddArtwork.css';

const AddArtwork = ({ addArtwork }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        year: '',
        category: '',
        medium: '',
        dimensions: '',
        price: '',
        description: ''
    });

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const categories = ['Painting', 'Sculpture', 'Digital Art', 'Photography', 'Drawing', 'Mixed Media'];
    const mediums = ['Oil', 'Acrylic', 'Watercolor', 'Digital', 'Charcoal', 'Clay', 'Bronze'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, image: 'Please upload a valid image file (JPEG, PNG, GIF, WEBP)' }));
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
                return;
            }

            setSelectedImage(file);
            setErrors(prev => ({ ...prev, image: '' }));

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const currentYear = new Date().getFullYear();

        if (!formData.title.trim()) {
            newErrors.title = 'Artwork title is required';
        } else if (formData.title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }

        if (!formData.artist.trim()) {
            newErrors.artist = 'Artist name is required';
        }

        if (!formData.year) {
            newErrors.year = 'Year is required';
        } else {
            const yearNum = parseInt(formData.year);
            if (isNaN(yearNum) || yearNum < 1000 || yearNum > currentYear) {
                newErrors.year = `Year must be between 1000 and ${currentYear}`;
            }
        }

        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }

        if (!formData.medium) {
            newErrors.medium = 'Please select a medium';
        }

        if (!selectedImage) {
            newErrors.image = 'Please upload an image';
        }

        if (formData.price && isNaN(parseFloat(formData.price))) {
            newErrors.price = 'Price must be a valid number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Convert image to base64 for storage
            const reader = new FileReader();

            reader.onloadend = () => {
                const newArtwork = {
                    id: Date.now(),
                    title: formData.title,
                    artist: formData.artist,
                    year: parseInt(formData.year),
                    category: formData.category,
                    medium: formData.medium,
                    dimensions: formData.dimensions,
                    price: formData.price,
                    imageData: reader.result, // Store base64 image data
                    description: formData.description,
                    likes: 0,
                    views: 0,
                    createdAt: new Date().toISOString()
                };

                addArtwork(newArtwork);

                setSubmitSuccess(true);
                setIsSubmitting(false);

                // Reset form
                setFormData({
                    title: '',
                    artist: '',
                    year: '',
                    category: '',
                    medium: '',
                    dimensions: '',
                    price: '',
                    description: ''
                });
                setSelectedImage(null);
                setImagePreview('');

                setTimeout(() => {
                    navigate('/gallery');
                }, 2000);
            };

            reader.readAsDataURL(selectedImage);

        } catch (error) {
            console.error('Error submitting artwork:', error);
            setIsSubmitting(false);
            alert('Failed to submit artwork. Please try again.');
        }
    };

    return (
        <div className="add-artwork-container">
            <div className="add-artwork-header">
                <h1>🖼️ Add New Masterpiece</h1>
                <p>Share your creativity with the world</p>
            </div>

            <div className="form-wrapper">
                {submitSuccess && (
                    <div className="success-alert">
                        ✨ Artwork added successfully! Redirecting to gallery...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="artwork-form">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Artwork Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={errors.title ? 'error' : ''}
                                placeholder="e.g., Starry Night Over the Rhône"
                            />
                            {errors.title && <span className="error-message">{errors.title}</span>}
                        </div>

                        <div className="form-group">
                            <label>Artist Name *</label>
                            <input
                                type="text"
                                name="artist"
                                value={formData.artist}
                                onChange={handleInputChange}
                                className={errors.artist ? 'error' : ''}
                                placeholder="e.g., Vincent van Gogh"
                            />
                            {errors.artist && <span className="error-message">{errors.artist}</span>}
                        </div>

                        <div className="form-group">
                            <label>Year Created *</label>
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                className={errors.year ? 'error' : ''}
                                placeholder="e.g., 1888"
                            />
                            {errors.year && <span className="error-message">{errors.year}</span>}
                        </div>

                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className={errors.category ? 'error' : ''}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {errors.category && <span className="error-message">{errors.category}</span>}
                        </div>

                        <div className="form-group">
                            <label>Medium *</label>
                            <select
                                name="medium"
                                value={formData.medium}
                                onChange={handleInputChange}
                                className={errors.medium ? 'error' : ''}
                            >
                                <option value="">Select Medium</option>
                                {mediums.map(med => (
                                    <option key={med} value={med}>{med}</option>
                                ))}
                            </select>
                            {errors.medium && <span className="error-message">{errors.medium}</span>}
                        </div>

                        <div className="form-group">
                            <label>Dimensions</label>
                            <input
                                type="text"
                                name="dimensions"
                                value={formData.dimensions}
                                onChange={handleInputChange}
                                placeholder="e.g., 24 x 36 inches"
                            />
                        </div>

                        <div className="form-group">
                            <label>Price (USD)</label>
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className={errors.price ? 'error' : ''}
                                placeholder="e.g., 2500"
                            />
                            {errors.price && <span className="error-message">{errors.price}</span>}
                        </div>

                        <div className="form-group full-width">
                            <label>Upload Image *</label>
                            <div className="file-upload-area">
                                <input
                                    type="file"
                                    accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                                    onChange={handleImageUpload}
                                    className="file-input"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="file-label">
                                    <span className="upload-icon">📤</span>
                                    <span>Click to upload or drag and drop</span>
                                    <span className="file-types">JPEG, PNG, GIF, WEBP (Max 5MB)</span>
                                </label>
                            </div>
                            {errors.image && <span className="error-message">{errors.image}</span>}

                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                    <button
                                        type="button"
                                        className="remove-image"
                                        onClick={() => {
                                            setSelectedImage(null);
                                            setImagePreview('');
                                        }}
                                    >
                                        ✖ Remove
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="5"
                                placeholder="Describe your artwork, inspiration, and story..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate('/')}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : '✨ Submit Artwork'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddArtwork;