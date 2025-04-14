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

  useEffect(() => {
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

    console.log('Submitting review:', { comment, rating, productId });

    try {
      // Submit comment if provided
      if (comment.trim() !== '') {
        console.log('Posting comment...');
        await fetch('http://localhost:5001/api/comments', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: productId,
            comment: comment.trim(),
          }),
        });
      }

      // Submit rating if provided
      if (rating !== 0) {
        console.log('Posting rating...');
        const ratingRes = await fetch('http://localhost:5001/api/ratings', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: productId,
            rating,
          }),
        });

        const result = await ratingRes.json();
        if (!result.success && result.message.includes('already')) {
          alert("You've already rated this product.");
        }
      }

      // Clear inputs
      setComment('');
      setRating(0);
      setHover(0);

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
    }
  };


  return (
    <div className="review-container">
      <div className="review-box">
        <textarea
          className="review-textarea"
          rows="4"
          placeholder="Write a review"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
  
        <div className="review-controls">
          <div className="star-rating">
            <span>Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
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
            POST
          </button>
        </div>
  
        <div className="responses-section">
          <p>{reviews.length} Responses</p>
          {reviews.map((r, i) => {
            console.log("Rendering review:", r.comment, "Rating:", r.rating); // optional debug
  
            return (
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}  


