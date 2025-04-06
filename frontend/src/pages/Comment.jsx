import React, { useState } from 'react';
import './Comment.css';

export default function Comment() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);

  const handlePost = () => {
    if (comment.trim() === '' || rating === 0) return;
    const newReview = { comment, rating };
    setReviews([newReview, ...reviews]);
    setComment('');
    setRating(0);
    setHover(0);
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
          {reviews.map((r, i) => (
            <div className="single-review" key={i}>
              <div className="review-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={r.rating >= star ? 'star active' : 'star inactive'}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



