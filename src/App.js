import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AddArtwork from './components/AddArtwork';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [theme, setTheme] = useState('light');
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Load saved artworks from localStorage
    const savedArtworks = localStorage.getItem('artworks');
    if (savedArtworks) {
      setArtworks(JSON.parse(savedArtworks));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const addArtwork = (newArtwork) => {
    const updatedArtworks = [newArtwork, ...artworks];
    setArtworks(updatedArtworks);
    localStorage.setItem('artworks', JSON.stringify(updatedArtworks));
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddArtwork addArtwork={addArtwork} />} />
          <Route path="/gallery" element={<Gallery artworks={artworks} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;