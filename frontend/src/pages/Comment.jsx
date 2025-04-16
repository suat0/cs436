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


  // Fetch current user
  fetch('http://localhost:5001/api/comments/me', {
    credentials: 'include'
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) setCurrentUserId(data.user.id);
  });


  useEffect(() => {
    setErrorMessage('');
    // Fetch comments
    fetch(`http://localhost:5001/api/comments/product/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReviews(data.comments);
      });

    // Fetch average rating
    fetch(`http://localhost:5001/api/ratings/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAverage(data.average);
      });
  }, [productId]);

  const handlePost = async () => {
    if (comment.trim() === '' && rating === 0) return;

    setErrorMessage('');

    try {
      // Submit comment if provided
      if (comment.trim() !== '') {
        console.log('Posting comment...');
        const commentRes= await fetch('http://localhost:5001/api/comments', {
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
    }

      // Submit rating if provided
      if (rating !== 0) {
        console.log('Posting rating...');
        const ratingRes = await fetch('http://localhost:5001/api/ratings', {
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
      }

      // Clear inputs
      setComment('');
      setRating(0);
      setHover(0);
      setIsEditing(false);
      setEditingReviewId(null);

      // Refresh comments
      const res = await fetch(`http://localhost:5001/api/comments/product/${productId}`);
      const commentData = await res.json();
      if (commentData.success) setReviews(commentData.comments);

      // Refresh rating
      const ratingRefresh = await fetch(`http://localhost:5001/api/ratings/${productId}`);
      const ratingData = await ratingRefresh.json();
      if (ratingData.success) setAverage(ratingData.average);
    } catch (err) {
      console.error('Error submitting review:', err);
      setErrorMessage('Something went wrong. Please try again.');
    }
    
  };


  return (
    <div className="review-container">
      <div className="review-box">
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
              {r.comment && <p>{r.comment}</p>}
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

