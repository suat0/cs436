import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import './Comment.css';

export default function Comment() {
  const { productId } = useParams();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');


  useEffect(() => {
    fetch('/api/comments/me', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setCurrentUserId(data.user.id);
      });
  }, []);


  useEffect(() => {
    if (currentUserId !== null) {
      setErrorMessage('');
  
      // Fetch comments with userId
      fetch(`/api/comments/product/${productId}?userId=${currentUserId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setReviews(data.comments);
        });
  
      // Fetch average rating
      fetch(`/api/ratings/${productId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setAverage(data.average);
        });
    }
  }, [productId, currentUserId]); 

  const handlePost = async () => {
    if (comment.trim() === '' && rating === 0) return;

    setErrorMessage('');

    try {
      let successText = '';
      // Submit comment if provided
      if (comment.trim() !== '') {
        console.log('Posting comment...');
        const commentRes = await fetch('/api/comments', {
          method: isEditing ? 'PUT' : 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: productId,
            comment: comment.trim(),
          }),
        });
      

      const commentData = await commentRes.json();
      if (!commentData.success) {
        setErrorMessage(commentData.message || 'Failed to submit comment.');
        return;
      }
      if (commentData.success) {
        successText += "Comment submitted for review. ";

      }
      
    }

      // Submit rating if provided
      if (rating !== 0) {
        console.log('Posting rating...');
        const ratingRes = await fetch('/api/ratings', {
          method: isEditing ? 'PUT' : 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: productId,
            rating,
          }),
        });

        const ratingData = await ratingRes.json();
        if (!ratingData.success) {
          setErrorMessage(ratingData.message || 'Failed to submit rating.');
          return;
        }
        if (ratingData.success) {
          successText += "Rating submitted.";
        }
        
      }

      setSuccessMessage(successText.trim());

      // Clear inputs
      setComment('');
      setRating(0);
      setHover(0);
      setIsEditing(false);
      setEditingReviewId(null);

      // Refresh comments
      const res = await fetch(`/api/comments/product/${productId}?userId=${currentUserId}`);
      const refreshCommentData = await res.json();
      if (refreshCommentData.success) setReviews(refreshCommentData.comments);

      // Refresh rating
      const ratingRefresh = await fetch(`/api/ratings/${productId}`);
      const ratingData = await ratingRefresh.json();
      if (ratingData.success) setAverage(ratingData.average);
    } catch (err) {
      console.error('Error submitting review:', err);
      setErrorMessage('Something went wrong. Please try again.');
    }
    
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="review-container">
      <div className="review-box">
      {successMessage && (
        <div className="success-message">
        {successMessage}
        </div>
      )}
        {/* Error message */}
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        <textarea
          className="review-textarea"
          rows="4"
          placeholder="Write a review"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setErrorMessage(''); // clear error on new input
            setSuccessMessage('');
          }}
        ></textarea>

        <div className="review-controls">
          <div className="star-rating">
            <span>Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => {
                  setRating(star);
                  setErrorMessage(''); // clear error on new rating
                }}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="star-button"
              >
                <span
                  className={
                    (hover || rating) >= star ? 'star active' : 'star inactive'
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          <button className="post-button" onClick={handlePost}>
            {isEditing ? 'UPDATE' : 'POST'}
          </button>
        </div>

        <div className="responses-section">
          <p>
            {reviews.length} Responses
            {average !== null && ` — Average Rating: ${average}/5`}
          </p>
          {reviews.map((r, i) => (
            <div className="single-review" key={i}>
              {r.rating != null && (
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={Number(r.rating) >= star ? 'star active' : 'star inactive'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
              {r.comment && (
              <>
              <p>{r.comment}</p>
              {r.user_id === currentUserId && r.status === 'pending' && (
              <div className="pending-label">Not visible to others — pending comment</div>
              )}
              </>
              )}
              <small>by {r.user_name}</small>
              {r.user_id === currentUserId && (
                <button
                className="edit-button"
                onClick={() => {
                  if (isEditing && editingReviewId === r.id) {
                    // Cancel editing
                    setIsEditing(false);
                    setEditingReviewId(null);
                    setComment('');
                    setRating(0);
                    setHover(0);
                  } else {
                    // Start editing
                    setComment(r.comment || '');
                    setRating(r.rating || 0);
                    setIsEditing(true);
                    setEditingReviewId(r.id);
                  }
                }}
              >
                {isEditing && editingReviewId === r.id ? 'Cancel Editing' : 'Edit'}
              </button>
              )}

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

