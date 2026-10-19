
import { useState } from "react";
import { XCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";

function BookingCard({ booking, onCancelled }) {
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!booking?._id || cancelling) return;

    setCancelling(true);

    try {
      const response = await api.patch(
        `/api/bookings/${booking._id}/cancel`
      );

      toast.success(
        response.data?.message || "Booking cancelled successfully."
      );

      setShowCancelPopup(false);

      if (onCancelled) {
        onCancelled(booking._id);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to cancel booking. Please try again."
      );
    } finally {
      setCancelling(false);
    }
  };

  const status = booking?.status?.toLowerCase() || "pending";

  return (
    <>
      <div className="booking-card">
        <h2>
          {typeof booking.restaurant === "object"
            ? booking.restaurant?.name
            : booking.restaurant}
        </h2>

        <p>Date: {booking.bookingDate || booking.date}</p>
        <p>Time: {booking.startTime || booking.time}</p>
        <p>Guests: {booking.guests}</p>

        <p>
          Status: <strong>{status}</strong>
        </p>

        {["pending", "confirmed"].includes(status) && (
          <button
            type="button"
            onClick={() => setShowCancelPopup(true)}
            disabled={cancelling}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700"
          >
            Cancel Booking
          </button>
        )}
      </div>

      {showCancelPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
            className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle size={34} className="text-red-600" />
            </div>

            <h2
              id="cancel-title"
              className="mt-5 text-2xl font-extrabold text-gray-900"
            >
              Cancel Booking?
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Are you sure you want to cancel this booking?
              This action cannot be undone.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelPopup(false)}
                disabled={cancelling}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BookingCard;
