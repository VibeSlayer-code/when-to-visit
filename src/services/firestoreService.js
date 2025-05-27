// All the Firestore magic imports! This is where we talk to our database.
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// ----- COMMENTS SECTION -----
// Add a comment to a place (each place has its own lil' comments collection)
export const addCommentToPlace = async (placeId, commentData) => {
  try {
    const commentsRef = collection(db, 'places', placeId, 'comments');
    const newComment = {
      ...commentData,
      createdAt: serverTimestamp()
    };
    return await addDoc(commentsRef, newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Get the most recent comments for a place (default 20)
export const getCommentsForPlace = async (placeId, maxCount = 20) => {
  try {
    const commentsRef = collection(db, 'places', placeId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'), limit(maxCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// ----- PLACES SECTION -----
// Danger zone! This deletes ALL places from the DB. Use with caution, bro.
export const clearAllPlaces = async () => {
  try {
    const placesRef = collection(db, 'places');
    const snapshot = await getDocs(placesRef);
    const batchDeletes = [];
    snapshot.forEach(docSnap => {
      batchDeletes.push(deleteDoc(doc(db, 'places', docSnap.id)));
    });
    await Promise.all(batchDeletes);
    return true;
  } catch (error) {
    console.error('Error clearing all places:', error);
    throw error;
  }
};

// Add a new place to Firestore (sanitize the data first)
export const addPlace = async (placeData) => {
  try {
    // Remove undefined/null fields from placeData
    const sanitizedData = Object.fromEntries(
      Object.entries(placeData).filter(([_, v]) => v !== undefined && v !== null)
    );

    const placesRef = collection(db, 'places');
    const newPlace = {
      ...sanitizedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    // Extra debug logging
    console.log('Attempting to add place:', newPlace);
    const result = await addDoc(placesRef, newPlace);
    console.log('Place added successfully:', result.id);
    return result;
  } catch (error) {
    // Enhanced error logging
    if (error && error.code && error.message) {
      console.error(`Firestore error [${error.code}]: ${error.message}`);
    } else {
      console.error('Unknown error adding place:', error);
    }
    throw error;
  }
};

// Get all places, sorted by name (for dropdowns, lists, etc)
export const getPlaces = async () => {
  try {
    const placesRef = collection(db, 'places');
    const q = query(placesRef, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting places:', error);
    throw error;
  }
};

// Get places filtered by category (e.g., only 'food' places)
export const getPlacesByCategory = async (category) => {
  try {
    const placesRef = collection(db, 'places');
    const q = query(
      placesRef, 
      where('category', '==', category),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting places by category:', error);
    throw error;
  }
};

// ----- REPORTS SECTION -----
// Add a new crowd report for a place (expires in 2 hours)
export const addReport = async (reportData) => {
  try {
    const reportsRef = collection(db, 'reports');
    const newReport = {
      ...reportData,
      timestamp: serverTimestamp(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
    };
    return await addDoc(reportsRef, newReport);
  } catch (error) {
    console.error('Error adding report:', error);
    throw error;
  }
};

// Get recent (not expired) reports for a place, newest first
export const getRecentReportsByPlace = async (placeId) => {
  try {
    const reportsRef = collection(db, 'reports');
    const now = new Date();
    
    const q = query(
      reportsRef,
      where('placeId', '==', placeId),
      where('expiresAt', '>', now),
      orderBy('expiresAt', 'desc'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting recent reports:', error);
    throw error;
  }
};

// Get all reports made by a specific user (sorted by newest)
export const getUserReports = async (userId) => {
  try {
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user reports:', error);
    throw error;
  }
};

// Delete a report by its ID (used in the dashboard)
export const deleteReport = async (reportId) => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};
