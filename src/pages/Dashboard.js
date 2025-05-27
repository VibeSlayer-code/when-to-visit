// Yo! This is your Dashboard page. Here you can see your reports and profile stuff.
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserReports, deleteReport, getPlaces } from '../services/firestoreService';
import { formatDistanceToNow } from 'date-fns';

// Main Dashboard component - this is what shows up when you go to your dashboard!
const Dashboard = () => {
    // All your crowd reports will live here
  const [reports, setReports] = useState([]);
    // Loading spinner state (so we can show a spinner while stuff loads)
  const [loading, setLoading] = useState(true);
    // If something goes wrong, we'll keep the error message here
  const [error, setError] = useState('');
    // All the places you track, mapped by their IDs
  const [places, setPlaces] = useState({});
    // Which tab is active? (reports or profile)
  const [activeTab, setActiveTab] = useState('reports');
  
    // Grab the current logged-in user from our Auth context
  const { currentUser } = useAuth();

    // This runs when the component loads or when the user changes
  useEffect(() => {
        // Helper function to get all your data from Firestore
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all places to map place IDs to names
        const placesData = await getPlaces();
        const placesMap = {};
        placesData.forEach(place => {
          placesMap[place.id] = place;
        });
        setPlaces(placesMap);
        
        // Get user reports
                // Fetch all reports made by the current user
        const userReports = await getUserReports(currentUser.uid);
        setReports(userReports);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load your data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);

    // Delete a report if the user clicks delete (with a confirm popup!)
  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteReport(reportId);
        setReports(reports.filter(report => report.id !== reportId));
      } catch (error) {
        console.error('Error deleting report:', error);
        setError('Failed to delete report. Please try again.');
      }
    }
  };

    // Nicely format Firestore timestamps to "x minutes ago"
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    try {
      // Convert Firestore timestamp to Date object
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown time';
    }
  };

    // Turn the crowd level number into a nice label (Low/Medium/High)
  const getCrowdLevelLabel = (level) => {
    switch (level) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Unknown';
    }
  };

    // Pick a color for the badge depending on crowd level
  const getCrowdLevelColor = (level) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Dashboard</h1>
        <p className="text-gray-600">
          Manage your reports and account information
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Your Reports
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>
        
        <div className="p-6">
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
          
          {activeTab === 'reports' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Crowd Reports</h2>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
                </div>
              ) : reports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Place
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Crowd Level
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comment
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.map((report) => (
                        <tr key={report.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {places[report.placeId]?.name || 'Unknown Place'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {places[report.placeId]?.category || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCrowdLevelColor(report.crowdLevel)}`}>
                              {getCrowdLevelLabel(report.crowdLevel)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatTimestamp(report.timestamp)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {report.comment || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    You haven't submitted any reports yet.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Profile</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="bg-primary-100 text-primary-600 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                    <p className="text-gray-600">{currentUser.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Reports</p>
                        <p className="text-2xl font-semibold text-gray-900">{reports.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {currentUser.metadata?.creationTime 
                            ? new Date(currentUser.metadata.creationTime).toLocaleDateString() 
                            : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export so other parts of the app can use this Dashboard
export default Dashboard;
