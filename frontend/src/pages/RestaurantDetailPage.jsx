
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Utensils,
  CalendarDays,
  Star,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";

function RestaurantDetailPage() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);

  // Check the current user's login state and own review.
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/restaurants/${id}`);
      setRestaurant(data.restaurant || data.data || data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load restaurant details."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewLoading(true);

      const { data } = await api.get(
        `/api/reviews/restaurant/${id}`
      );

      const reviewList = data.reviews || [];

      setReviews(reviewList);
      setAverageRating(Number(data.averageRating || 0));

      // If the current user's review is returned, prefill the form.
      const savedReview = reviewList.find(
        (review) =>
          review.user?._id === currentUserId ||
          review.user === currentUserId
      );

      if (savedReview) {
        setRating(savedReview.rating);
        setComment(savedReview.comment || "");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load restaurant reviews."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRestaurant();
  }, [id]);

  useEffect(() => {
    if (id) fetchReviews();
  }, [id, currentUserId]);

  // Try to identify the current user from the existing auth setup.
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data } = await api.get("/api/auth/me");
        const user =
          data.user || data.data?.user || data.data || data;

        setCurrentUserId(user?._id || user?.id || null);
      } catch {
        // The user may not be logged in.
        setCurrentUserId(null);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!currentUserId) {
      toast.error("Please login to submit a review.");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating from 1 to 5 stars.");
      return;
    }

    try {
      setSubmitting(true);

      const { data } = await api.put(
        `/api/reviews/restaurant/${id}`,
        {
          rating,
          comment: comment.trim(),
        }
      );

      toast.success(data.message || "Review saved successfully.");
      await fetchReviews();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to save review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    const ownReview = reviews.find(
      (review) =>
        review.user?._id === currentUserId ||
        review.user === currentUserId
    );

    if (!ownReview) {
      toast.error("Your review was not found.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete your review?"
    );

    if (!confirmed) return;

    try {
      setDeletingReview(true);

      const { data } = await api.delete(
        `/api/reviews/${ownReview._id}`
      );

      toast.success(data.message || "Review deleted successfully.");

      setRating(5);
      setComment("");

      await fetchReviews();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete review. Please try again."
      );
    } finally {
      setDeletingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#faf8f2]">
        <p className="text-green-800">Loading restaurant...</p>
      </div>
    );
  }

  if (!restaurant || restaurant.message) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#faf8f2]">
        <h2 className="text-xl font-semibold">Restaurant not found</h2>
        <Link to="/restaurants" className="text-green-800 underline">
          Back to Restaurants
        </Link>
      </div>
    );
  }

  const ownReview = reviews.find(
    (review) =>
      review.user?._id === currentUserId ||
      review.user === currentUserId
  );

  return (
    <div className="min-h-screen bg-[#faf8f2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/restaurants"
          className="mb-5 inline-flex items-center gap-2 text-sm text-green-800 hover:underline"
        >
          <ArrowLeft size={17} />
          Back to Restaurants
        </Link>

        <div className="rounded-2xl border border-[#e8e4d8] bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-green-700">
                TABULA · RESTAURANT DETAILS
              </p>

              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {restaurant.name}
              </h1>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#edf3e8] px-3 py-1.5 text-sm text-green-900">
                <Utensils size={15} />
                {restaurant.cuisine}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={19} fill="currentColor" />
                </div>
                <span className="font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            </div>

            <Link
              to={`/booking/${id}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-green-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              <CalendarDays size={17} />
              Book a Table
            </Link>
          </div>

          {restaurant.description?.trim() && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h2 className="mb-2 font-semibold text-gray-900">
                About this Restaurant
              </h2>
              <p className="text-sm leading-6 text-gray-600">
                {restaurant.description}
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-3 border-t border-gray-100 pt-5 sm:grid-cols-2">
            <div className="flex gap-3 rounded-xl bg-[#f7f7f2] p-4">
              <MapPin className="mt-0.5 shrink-0 text-green-800" size={20} />
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Address
                </h2>
                <p className="mt-1 text-sm leading-5 text-gray-600">
                  {restaurant.address || "Address not available"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-xl bg-[#f7f7f2] p-4">
              <Clock className="mt-0.5 shrink-0 text-green-800" size={20} />
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Opening Hours
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {restaurant.openingHours || "Hours not available"}
                </p>
              </div>
            </div>

            {restaurant.phone && (
              <div className="flex gap-3 rounded-xl bg-[#f7f7f2] p-4 sm:col-span-2">
                <Phone className="mt-0.5 shrink-0 text-green-800" size={20} />
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Contact
                  </h2>
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="mt-1 block text-sm text-green-800 hover:underline"
                  >
                    {restaurant.phone}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Choose your preferred date, time and number of guests.
            </p>
            <Link
              to="/restaurants"
              className="text-sm font-semibold text-green-800 hover:underline"
            >
              Explore More Restaurants
            </Link>
          </div>
        </div>

        {/* Ratings and Reviews */}
        <section className="mt-7 rounded-2xl border border-[#e8e4d8] bg-white p-5 shadow-sm sm:p-8">
          <div className="border-b border-gray-100 pb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
              CUSTOMER FEEDBACK
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Ratings & Reviews
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Share your experience after completing a restaurant booking.
            </p>
          </div>

          <form onSubmit={handleSubmitReview} className="mt-6">
            <h3 className="font-semibold text-gray-900">
              {ownReview ? "Update Your Review" : "Rate This Restaurant"}
            </h3>

            <div className="mt-3 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} out of 5 stars`}
                  className="rounded p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-700"
                >
                  <Star
                    size={30}
                    className={
                      star <= rating
                        ? "text-amber-400"
                        : "text-gray-300"
                    }
                    fill={star <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-semibold text-gray-600">
                {rating}/5
              </span>
            </div>

            <label
              htmlFor="review-comment"
              className="mt-5 block text-sm font-semibold text-gray-800"
            >
              Your Review
            </label>

            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Tell us about your dining experience..."
              className="mt-2 w-full rounded-xl border border-gray-200 bg-[#fdfdfb] p-4 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-green-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : ownReview
                    ? "Update Review"
                    : "Submit Review"}
              </button>

              {ownReview && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  disabled={deletingReview}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 size={17} />
                  {deletingReview ? "Deleting..." : "Delete My Review"}
                </button>
              )}
            </div>

            {!currentUserId && (
              <p className="mt-3 text-sm text-gray-500">
                Please{" "}
                <Link to="/login" className="font-semibold text-green-800 underline">
                  login
                </Link>{" "}
                to submit a review.
              </p>
            )}

            {currentUserId && !ownReview && (
              <p className="mt-3 text-sm text-gray-500">
                Only customers with a completed booking can submit a review.
              </p>
            )}
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="text-lg font-bold text-gray-900">
              Customer Reviews
            </h3>

            {reviewLoading ? (
              <p className="mt-4 text-sm text-gray-500">
                Loading reviews...
              </p>
            ) : reviews.length === 0 ? (
              <p className="mt-4 rounded-xl bg-[#f7f7f2] p-5 text-sm text-gray-600">
                No reviews yet. Complete a booking and be the first to share your experience!
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <article
                    key={review._id}
                    className="rounded-xl border border-gray-100 bg-[#fdfdfb] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {review.user?.name || "Customer"}
                        </h4>

                        <div className="mt-2 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={
                                star <= review.rating
                                  ? "text-amber-400"
                                  : "text-gray-300"
                              }
                              fill={
                                star <= review.rating
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <span className="text-xs text-gray-500">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString("en-IN")
                          : ""}
                      </span>
                    </div>

                    {review.comment?.trim() && (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                        {review.comment}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default RestaurantDetailPage;
