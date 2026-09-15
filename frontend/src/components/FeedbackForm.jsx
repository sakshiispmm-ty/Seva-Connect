import React, { useState, useEffect } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { feedbackService } from '../services/api';
import Alert from './Alert';
import Button from './Button';

export default function FeedbackForm({
  targetType,
  targetId,
  targetTitle,
  initialFeedback = null,
  isOpen = false,
  onClose,
  onSuccess
}) {
  const [rating, setRating] = useState(initialFeedback?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialFeedback?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialFeedback) {
      setRating(initialFeedback.rating || 5);
      setComment(initialFeedback.comment || '');
    } else {
      setRating(5);
      setComment('');
    }
    setError(null);
  }, [initialFeedback, isOpen]);

  if (!isOpen) return null;

  const ratingLabels = {
    1: 'Poor — Needs Improvement',
    2: 'Fair — Acceptable',
    3: 'Good — Satisfactory',
    4: 'Very Good — Highly Appreciated',
    5: 'Excellent — Outstanding Experience'
  };

  const getTargetTypeLabel = () => {
    switch (targetType) {
      case 'Donation':
        return 'Donation Experience Feedback';
      case 'VolunteerTask':
        return 'Volunteer Assistance Task Feedback';
      case 'Campaign':
        return 'Campaign Review & Feedback';
      default:
        return 'Provide Feedback';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let res;
      if (initialFeedback?.id) {
        res = await feedbackService.update(initialFeedback.id, {
          rating: Number(rating),
          comment: comment.trim() || null
        });
      } else {
        res = await feedbackService.submit({
          target_type: targetType,
          target_id: Number(targetId),
          rating: Number(rating),
          comment: comment.trim() || null
        });
      }

      if (onSuccess) {
        onSuccess(res.data?.data || res.data);
      }
      if (onClose) onClose();
    } catch (err) {
      console.error('Feedback submit error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit feedback. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#087F73] to-[#05665D] text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{getTargetTypeLabel()}</h3>
            {targetTitle && (
              <p className="text-xs text-emerald-100 mt-0.5 line-clamp-1">{targetTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {/* Rating selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Overall Rating <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = starVal <= (hoverRating || rating);
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#087F73]/30 transition-transform"
                    aria-label={`Rate ${starVal} out of 5 stars`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-medium text-gray-500">
                {ratingLabels[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Comment text area */}
          <div>
            <label htmlFor="feedback-comment" className="block text-sm font-semibold text-gray-700 mb-1">
              Comments / Suggestions <span className="text-xs font-normal text-gray-400">(Optional)</span>
            </label>
            <textarea
              id="feedback-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              placeholder="Tell us what went well or how we can improve our service..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#087F73]/20 focus:border-[#087F73] transition-all"
            />
            <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
              <span>Feedback is reviewed internally by NGO administrators</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#087F73] hover:bg-[#05665D] text-white flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialFeedback?.id ? 'Update Feedback' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
