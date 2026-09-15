import React from 'react';
import { Star, MessageSquare, Calendar, User, HeartHandshake, Briefcase, Award } from 'lucide-react';

export default function FeedbackList({ items = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-12 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-sm">
        <div className="w-14 h-14 mx-auto mb-4 bg-emerald-50 text-[#087F73] rounded-2xl flex items-center justify-center">
          <MessageSquare className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">No feedback entries found</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Feedback submitted by donors and volunteers will appear here for administrative review.
        </p>
      </div>
    );
  }

  const getTargetBadge = (item) => {
    const type = item.target_type || item.feedback_type;
    const id = item.target_id || item.reference_id;
    const title = item.target_title || item.reference_title;

    switch (type) {
      case 'Donation':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#087F73] border border-emerald-200">
            <HeartHandshake className="w-3.5 h-3.5" />
            Donation #{id} {title ? `· ${title}` : ''}
          </span>
        );
      case 'VolunteerTask':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Briefcase className="w-3.5 h-3.5" />
            Task #{id} {title ? `· ${title}` : ''}
          </span>
        );
      case 'Campaign':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Award className="w-3.5 h-3.5" />
            Campaign {title ? `· ${title}` : `#${id}`}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {type} #{id}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const rating = Number(item.rating) || 0;
        const formattedDate = item.created_at
          ? new Date(item.created_at).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '—';

        return (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow transition-shadow space-y-3"
          >
            {/* Header: User & Target Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EAF6F3] text-[#087F73] font-bold text-sm flex items-center justify-center">
                  {item.user_name ? item.user_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {item.user_name || 'Anonymous User'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-gray-100 text-gray-600">
                      {item.user_role || 'User'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{item.user_email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getTargetBadge(item)}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Rating Stars & Comment */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <Star
                    key={starVal}
                    className={`w-4 h-4 ${
                      starVal <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
                <span className="ml-1.5 text-xs font-bold text-gray-700">
                  {rating} / 5
                </span>
              </div>

              {item.comment ? (
                <p className="text-sm text-gray-700 bg-gray-50/80 border border-gray-100 rounded-lg p-3 italic">
                  "{item.comment}"
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic">No written comment provided.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
