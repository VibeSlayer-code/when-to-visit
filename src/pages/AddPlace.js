// This page lets you add a new place to the app! Super useful for expanding our crowd tracker.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPlace } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { searchPlaces, reverseGeocode } from '../services/osmService';

// Helper to get a static map image from OpenStreetMap (no API key needed, yay!)
const getOsmStaticMapUrl = (lat, lon, zoom = 16, width = 400, height = 200) => {
  // Using OSM static map provider (no API key required)
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=${zoom}&size=${width}x${height}&markers=${lat},${lon},red-pushpin`;
};

// All the types of places you can add. Add more if you want!
const categories = [
  { id: 'health', name: 'Health' },
  { id: 'food', name: 'Food' },
  { id: 'fitness', name: 'Fitness' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'education', name: 'Education' },
  { id: 'entertainment', name: 'Entertainment' }
];

// Main AddPlace component - this is the form for adding new places
const AddPlace = () => {
    // Name of the place (e.g. 'Central Park Gym')
  const [name, setName] = useState('');
    // What kind of place is it? (health, food, etc)
  const [category, setCategory] = useState('');
    // The address or coordinates of the place
  const [location, setLocation] = useState('');
    // If something goes wrong, the error message goes here
  const [error, setError] = useState('');
    // Show a spinner while things are loading (like when you submit)
  const [loading, setLoading] = useState(false);
    // Are we using the user's current location?
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
    // What the user types to search for a place
  const [placeQuery, setPlaceQuery] = useState('');
    // The list of search results from OpenStreetMap
  const [searchResults, setSearchResults] = useState([]);
    // The place the user picked from search results
  const [selectedPlace, setSelectedPlace] = useState(null);

    // Get the current logged-in user (so we know who added the place!)
  const { currentUser } = useAuth();
    // For navigating to other pages after adding a place
  const navigate = useNavigate();

    // Try to get the user's current location using the browser's geolocation
  const handleGetCurrentLocation = async () => {
    if (navigator.geolocation) {
      setUseCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const result = await reverseGeocode(latitude, longitude);
            if (result && result.display_name) {
              setLocation(result.display_name);
              setSelectedPlace({
                name: result.display_name,
                address: result.display_name,
                location: { lat: latitude, lng: longitude },
                osm_id: result.osm_id,
                osm_type: result.osm_type
              });
            } else {
              setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
          } catch (err) {
            setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
          setUseCurrentLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Failed to get your current location. Please enter it manually.');
          setUseCurrentLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please enter location manually.');
    }
  };

    // When the user submits the form, add the place to Firestore!
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return setError('Please enter a place name');
    }
    
    if (!category) {
      return setError('Please select a category');
    }
    
    try {
      setError('');
      setLoading(true);
      
      await addPlace({
        name: name.trim(),
        category,
        location: selectedPlace
          ? `${selectedPlace.location.lat},${selectedPlace.location.lng}`
          : (location.trim() || null),
        address: selectedPlace ? selectedPlace.address : location.trim(),
        osm_id: selectedPlace ? selectedPlace.osm_id : null,
        osm_type: selectedPlace ? selectedPlace.osm_type : null,
        addedBy: currentUser.uid,
        addedByEmail: currentUser.email
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error adding place:', error);
      setError('Failed to add place. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google Maps Place Search
    // Search for places using OpenStreetMap when the user types in the search box
  const handlePlaceSearch = async () => {
    setError('');
    setSearchResults([]);
    setSelectedPlace(null);
    if (!placeQuery.trim()) return;
    try {
      const results = await searchPlaces(placeQuery.trim());
      setSearchResults(results.map(place => ({
        name: place.display_name,
        address: place.display_name,
        location: { lat: parseFloat(place.lat), lng: parseFloat(place.lon) },
        osm_id: place.osm_id,
        osm_type: place.osm_type
      })));
      if (results.length === 0) setError('No places found.');
    } catch (e) {
      setError('Error searching places.');
    }
  };

    // When the user clicks a search result, set it as the selected place
  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    setLocation(place.address);
    setSearchResults([]);
    setPlaceQuery(place.name);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add a New Place</h1>
        <p className="text-gray-600">
          Help the community by adding a new location to track. All address and map features are powered by <a href="https://www.openstreetmap.org/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> (OSM).
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Place Name*
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., Central Park Gym"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
              Category*
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
              required
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
              Location (Search address using OSM or use your current location)
            </label>
            <div className="flex mb-2">
              <input
                type="text"
                id="placeQuery"
                value={placeQuery}
                onChange={(e) => setPlaceQuery(e.target.value)}
                className="input rounded-r-none"
                placeholder="Search for a place or address (powered by OpenStreetMap)"
              />
              <button
                type="button"
                onClick={handlePlaceSearch}
                className="btn btn-secondary rounded-l-none flex items-center"
                disabled={loading}
              >
                Search
              </button>
            </div>
            {searchResults.length > 0 && (
              <ul className="bg-white border rounded shadow max-h-40 overflow-auto mb-2">
                {searchResults.map((place) => (
                  <li
                    key={place.placeId}
                    className="p-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleSelectPlace(place)}
                  >
                    <div className="font-semibold">{place.name}</div>
                    <div className="text-xs text-gray-600">{place.address}</div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex">
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input rounded-r-none"
                placeholder="Address (auto-filled from OSM search or your current location)"
              />
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="btn btn-secondary rounded-l-none flex items-center"
                disabled={useCurrentLocation}
              >
                {useCurrentLocation ? (
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {useCurrentLocation ? 'Getting...' : 'Use My Location (Get Address)'}
              </button>
            </div>
            {selectedPlace && (
              <div className="mt-2">
                <div className="text-xs text-gray-700">Selected: {selectedPlace.name} ({selectedPlace.address})</div>
                <img
                  src={getOsmStaticMapUrl(selectedPlace.location.lat, selectedPlace.location.lng)}
                  alt="Map preview from OpenStreetMap"
                  className="rounded mt-1 border"
                  style={{ width: 300, height: 150 }}
                />
                <div className="text-xs text-gray-400 mt-1">Map & address by <a href="https://www.openstreetmap.org/" className="underline" target="_blank" rel="noopener noreferrer">OpenStreetMap</a></div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Search for a place or address using OpenStreetMap, or use the button to get your current address from your device location.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary mr-3"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Place...
                </span>
              ) : 'Add Place'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Export so we can use this AddPlace component elsewhere
export default AddPlace;
