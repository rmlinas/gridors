import React, { useState, useEffect } from 'react';

export default function StarRatingInput({ initialRating, reviewSlug, totalStars = 5, readOnly = false }) {
  const [currentRating, setCurrentRating] = useState(initialRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setCurrentRating(initialRating || 0);
  }, [initialRating]);

  const handleStarClick = async (ratingValue) => {
    if (readOnly || isSubmitting) return;

    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      // PAKEISTAS URL: Dabar nukreipia į PHP API failą
      const response = await fetch('/api/rate.php', { // <--- PAKEISKITE ŠIĄ EILUTĘ
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: reviewSlug, rating: ratingValue }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentRating(data.newAverageRating || ratingValue);
        setMessage(data.message || 'Įvertinimas išsaugotas sėkmingai!');
      } else {
        setError(data.message || 'Nepavyko išsaugoti įvertinimo.');
      }
    } catch (err) {
      setError('Įvyko tinklo klaida. Bandykite dar kartą.');
      console.error('Rating submission error:', err);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
    }
  };

  const stars = [];
  for (let i = 1; i <= totalStars; i++) {
    stars.push(
      <span
        key={i}
        className={`cursor-pointer text-2xl transition-colors duration-150 ${
          i <= (hoverRating || currentRating) ? 'text-yellow-500' : 'text-gray-400'
        } ${readOnly ? 'cursor-default' : ''}`}
        onMouseEnter={() => !readOnly && setHoverRating(i)}
        onMouseLeave={() => !readOnly && setHoverRating(0)}
        onClick={() => handleStarClick(i)}
      >
        <i className="fa-solid fa-star"></i>
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center space-x-1">
        {stars}
      </div>
      {isSubmitting && <p className="text-blue-500 text-sm mt-2">Siunčiama...</p>}
      {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {!readOnly && <p className="text-gray-600 text-xs mt-2">Spustelėkite, kad įvertintumėte!</p>}
    </div>
  );
}