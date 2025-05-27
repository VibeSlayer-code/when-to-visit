import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlaces, getRecentReportsByPlace } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

// Import UI components for displaying places, reporting, and details
import PlaceCard from '../components/PlaceCard';
import ReportModal from '../components/ReportModal';
import PlaceDetailsModal from '../components/PlaceDetailsModal';

// List of categories for filtering places
const categories = [
  { id: 'all', name: 'All Places' },
  { id: 'health', name: 'Health' },
  { id: 'food', name: 'Food' },
  { id: 'fitness', name: 'Fitness' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'education', name: 'Education' },
  { id: 'entertainment', name: 'Entertainment' }
];

const Home = () => {
  // State for all places, filtered places, loading spinner, category/search filters, and modals
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null); // For reporting
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState(null); // For details/comments
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Only one modal (report or details) should be open at a time
  useEffect(() => {
    if (isReportModalOpen) {
      setIsDetailsModalOpen(false);
    }
  }, [isReportModalOpen]);
  
  const { currentUser } = useAuth();

  // Show place details/comments modal
  const handleOpenDetailsModal = (place) => {
    setSelectedPlaceDetails(place);
    setIsDetailsModalOpen(true);
  };
  // Close details modal
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPlaceDetails(null);
  };

  // Fetch places and their recent crowd reports when the page loads
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const placesData = await getPlaces();
        
        // For each place, get recent reports and calculate crowd level
        const placesWithReports = await Promise.all(
          placesData.map(async (place) => {
            const reports = await getRecentReportsByPlace(place.id);
            // Default values
            let crowdLevel = 'Unknown';
            let lastReportTime = null;
            
            if (reports.length > 0) {
              // Average the crowdLevel from recent reports
              const sum = reports.reduce((acc, report) => acc + report.crowdLevel, 0);
              const avgLevel = Math.round(sum / reports.length);
              if (avgLevel <= 1) crowdLevel = 'Low';
              else if (avgLevel === 2) crowdLevel = 'Medium';
              else crowdLevel = 'High';
              // Use the most recent report's timestamp
              lastReportTime = reports[0].timestamp;
            }
            return {
              ...place,
              crowdLevel,
              lastReportTime,
              reportCount: reports.length
            };
          })
        );
        setPlaces(placesWithReports);
        setFilteredPlaces(placesWithReports);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching places:', error);
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // Filter places by category and search query whenever those change
  useEffect(() => {
    let filtered = places;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(place => place.category === selectedCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(place => 
        place.name.toLowerCase().includes(query) || 
        place.location?.toLowerCase().includes(query)
      );
    }
    setFilteredPlaces(filtered);
  }, [selectedCategory, searchQuery, places]);

  // Handle category button click
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };
  // Handle search box change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Open report modal for a place (if logged in)
  const handleOpenReportModal = (place) => {
    if (currentUser) {
      setSelectedPlace(place);
      setIsReportModalOpen(true);
      // Don't open details modal at the same time
    } else {
      // Not logged in? Prompt to log in
      alert('Please log in to submit a report');
    }
  };
  // Close report modal
  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setSelectedPlace(null);
  };

  // --- UI rendering ---
  return (
    <div>
      {/* Hero section at the top */}
      <section className="mb-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Know Before You Go
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Check real-time crowd levels at your favorite places and avoid the rush.
          </p>
          {/* Show login/register buttons if not logged in */}
          {!currentUser && (
            <div className="flex justify-center space-x-4">
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Category filters and search bar */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <div className="flex overflow-x-auto pb-2 space-x-2">
              {/* Category filter buttons */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          {/* Search box for places */}
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="input"
            />
          </div>
        </div>

        {/* Show loading, empty, or the grid of places */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading places...</div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center text-gray-400 py-20">No places found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onReportClick={() => handleOpenReportModal(place)}
                onClick={() => handleOpenDetailsModal(place)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Place details/comments modal */}
      <PlaceDetailsModal
        open={isDetailsModalOpen}
        place={selectedPlaceDetails}
        onClose={handleCloseDetailsModal}
        currentUser={currentUser}
        hideClose={isReportModalOpen && selectedPlace && selectedPlaceDetails && selectedPlace.id === selectedPlaceDetails.id}
      />

      {/* Floating add place button for logged-in users */}
      {currentUser && (
        <div className="fixed bottom-6 right-6">
          <Link
            to="/add-place"
            className="btn btn-primary flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </Link>
        </div>
      )}

      {/* Report modal for submitting a new crowd report */}
      {isReportModalOpen && selectedPlace && (
        <ReportModal
          place={selectedPlace}
          onClose={handleCloseReportModal}
        />
      )}
    </div>
  );
};

export default Home;
