import React, { useEffect, useState } from 'react';
import { getCommentsForPlace, addCommentToPlace } from '../services/firestoreService';
import Toast from './Toast';

function getRelativeTime(date) {
  if (!date) return '';
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function crowdLevelBadge(level) {
  if (level === undefined || level === null) return null;
  let label = '';
  let color = '';
  if (level === 1 || level === 'Low') { label = 'Low'; color = 'bg-green-100 text-green-700'; }
  else if (level === 2 || level === 'Medium') { label = 'Medium'; color = 'bg-yellow-100 text-yellow-800'; }
  else if (level === 3 || level === 'High') { label = 'High'; color = 'bg-red-100 text-red-700'; }
  else { label = String(level); color = 'bg-gray-100 text-gray-700'; }
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${color} mr-2`}>{label} Traffic</span>;
}


const PlaceDetailsModal = ({ place, open, onClose, currentUser, hideClose }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (open && place?.id) {
      fetchComments();
    }
    // eslint-disable-next-line
  }, [open, place?.id]);

  const fetchComments = async () => {
    try {
      const data = await getCommentsForPlace(place.id);
      setComments(data);
    } catch (error) {
      setToast({ message: 'Failed to load comments', type: 'error' });
      setShowToast(true);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      await addCommentToPlace(place.id, {
        text: commentText.trim(),
        userId: currentUser?.uid || 'anonymous',
        userEmail: currentUser?.email || 'Anonymous',
      });
      setCommentText('');
      setToast({ message: 'Comment added!', type: 'success' });
      setShowToast(true);
      fetchComments();
    } catch (error) {
      setToast({ message: 'Failed to add comment', type: 'error' });
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !place) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        {!hideClose && (
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-blue-600 text-xl font-bold"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        )}
        <h2 className="text-2xl font-bold mb-2">{place.name}</h2>
        <p className="text-gray-600 mb-1">{place.address}</p>
        <p className="text-sm text-gray-400 mb-2">Category: {place.category}</p>
        {place.addedByEmail && (
          <p className="text-xs text-gray-400 mb-2">Added by: {place.addedByEmail}</p>
        )}
        <hr className="my-3" />
        <h3 className="font-semibold mb-3 text-lg">Recent Comments</h3>
        <div className="text-xs text-gray-400 mb-2">Comments are public. Please be respectful.</div>
        <div className="max-h-60 overflow-y-auto mb-4 space-y-3">
          {comments.length === 0 ? (
            <div className="text-gray-400 text-sm">No comments yet.</div>
          ) : (
            comments.map((c) => {
              // Support for crowdLevel (if present in comment)
              const createdAt = c.createdAt?.toDate ? c.createdAt.toDate() : null;
              return (
                <div key={c.id} className="flex items-start gap-3 bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-2 shadow-sm">
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {crowdLevelBadge(c.crowdLevel)}
                      <span className="font-medium text-gray-700 text-sm">{c.userEmail && c.userEmail.includes('@') ? c.userEmail.split('@')[0] : 'User'}</span>
                      <span className="mx-2 text-gray-300">·</span>
                      <span className="text-xs text-gray-500">{getRelativeTime(createdAt)}</span>
                    </div>
                    <div className="text-gray-800 text-base leading-snug whitespace-pre-line">
                      {c.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {currentUser && (
          <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm"
              placeholder="Add a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              disabled={loading}
              maxLength={200}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
              disabled={loading || !commentText.trim()}
            >
              Post
            </button>
          </form>
        )}
        {showToast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setShowToast(false)} />
        )}
      </div>
    </div>
  );
};

export default PlaceDetailsModal;
