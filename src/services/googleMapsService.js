// Google Maps API Services
const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your actual API key

// Get place details and coordinates from a search query
export const searchPlaces = async (query) => {
  try {
    // Note: For client-side requests, you'll need a proxy server or use Places Autocomplete widget
    // This direct fetch won't work in browser due to CORS restrictions
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${API_KEY}`,
      { mode: 'cors' }
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return data.results.map(place => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      types: place.types,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      photoReference: place.photos?.[0]?.photo_reference
    }));
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
};

// Get place details from a place ID
export const getPlaceDetails = async (placeId) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,photos,rating,types,opening_hours&key=${API_KEY}`,
      { mode: 'cors' }
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
};

// Get a static map image URL for a location
export const getStaticMapUrl = (lat, lng, zoom = 15, width = 400, height = 200) => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${lat},${lng}&key=${API_KEY}`;
};

// Get directions between two points
export const getDirections = async (origin, destination, mode = 'driving') => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(
        destination
      )}&mode=${mode}&key=${API_KEY}`,
      { mode: 'cors' }
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting directions:', error);
    throw error;
  }
};

// Get nearby places of a specific type
export const getNearbyPlaces = async (lat, lng, radius = 1500, type = 'restaurant') => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${API_KEY}`,
      { mode: 'cors' }
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error getting nearby places:', error);
    throw error;
  }
};
