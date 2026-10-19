import { useEffect, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import {
CalendarDays,
Clock,
Users,
UtensilsCrossed,
ArrowRight,
History,
XCircle,
} from "lucide-react";
import api from "../lib/axios";

function MyBookingsPage() {
const [bookings, setBookings] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [showCancelPopup, setShowCancelPopup] = useState(false);
const [selectedBookingId, setSelectedBookingId] = useState(null);
const [cancellingId, setCancellingId] = useState(null);

const fetchBookings = async () => {
try {
setError("");

const response = await api.get("/api/bookings/my");  
  const data = response.data;  

  setBookings(  
    Array.isArray(data)  
      ? data  
      : data.bookings || data.data || []  
  );  
} catch (err) {  
  setError(  
    err.response?.data?.message ||  
      "Unable to load bookings. Please login again and try."  
  );  
} finally {  
  setLoading(false);  
}

};

useEffect(() => {
fetchBookings();
}, []);

const openCancelPopup = (bookingId) => {
setSelectedBookingId(bookingId);
setShowCancelPopup(true);
};

const closeCancelPopup = () => {
if (cancellingId !== null) return;

setShowCancelPopup(false);  
setSelectedBookingId(null);

};

const confirmCancelBooking = async () => {
if (!selectedBookingId || cancellingId !== null) return;

setCancellingId(selectedBookingId);  

try {  
  const response = await api.patch(  
    `/api/bookings/${selectedBookingId}/cancel`  
  );  

  toast.success(  
    response.data?.message || "Booking cancelled successfully."  
  );  

  setShowCancelPopup(false);  
  setSelectedBookingId(null);  

  await fetchBookings();  
} catch (err) {  
  toast.error(  
    err.response?.data?.message ||  
      "Unable to cancel booking. Please try again."  
  );  
} finally {  
  setCancellingId(null);  
}

};

const getStatusStyle = (status) => {
const styles = {
pending: "bg-amber-100 text-amber-800",
confirmed: "bg-emerald-100 text-emerald-800",
rejected: "bg-red-100 text-red-800",
cancelled: "bg-gray-200 text-gray-700",
};

return (  
  styles[status?.toLowerCase()] ||  
  "bg-gray-100 text-gray-700"  
);

};

const formatDate = (date) => {
if (!date) return "Date not available";

return new Date(date).toLocaleDateString("en-IN", {  
  day: "numeric",  
  month: "short",  
  year: "numeric",  
});

};

if (loading) {
return (
<main className="min-h-screen bg-[#f7f5ec] px-4 py-12 text-center">
<p className="font-semibold text-emerald-900">
Loading your bookings...
</p>
</main>
);
}

return (
<main className="min-h-screen bg-[#f7f5ec] px-4 py-12 sm:px-6">
<div className="mx-auto max-w-5xl">
<div className="mb-8">
<p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
Your Tabula Account
</p>

<h1 className="mt-2 text-3xl font-extrabold text-emerald-950 sm:text-4xl">  
        My Bookings  
      </h1>  

      <p className="mt-3 text-gray-600">  
        Manage your table reservations and view their status.  
      </p>  
    </div>  

    {error && (  
      <div className="mb-6 rounded-xl bg-red-100 p-4 text-red-800">  
        {error}  
      </div>  
    )}  

    {!error && bookings.length === 0 && (  
      <section className="rounded-3xl border border-emerald-100 bg-white px-6 py-14 text-center shadow-lg shadow-emerald-950/5 sm:px-12">  
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50">  
          <CalendarDays size={38} className="text-emerald-800" />  
        </div>  

        <h2 className="mt-6 text-2xl font-bold text-emerald-950">  
          No Bookings Yet  
        </h2>  

        <p className="mx-auto mt-3 max-w-md leading-7 text-gray-600">  
          You haven't made any table reservations yet.  
          Explore our restaurants and book a table for your  
          next dining experience.  
        </p>  

        <Link  
          to="/restaurants"  
          className="mx-auto mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-700"  
        >  
          <UtensilsCrossed size={19} />  
          Explore Restaurants  
          <ArrowRight size={18} />  
        </Link>  
      </section>  
    )}  

    <div className="grid gap-5">  
      {bookings.map((booking) => {  
        const restaurant =  
          typeof booking.restaurant === "object"  
            ? booking.restaurant  
            : null;  

        const status = booking.status || "pending";  
        const canCancel = ["pending", "confirmed"].includes(  
          status.toLowerCase()  
        );  

        return (  
          <section  
            key={booking._id}  
            className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-md shadow-emerald-950/5"  
          >  
            <div className="flex flex-wrap items-start justify-between gap-4">  
              <div>  
                <h2 className="text-xl font-bold text-emerald-950">  
                  {restaurant?.name ||  
                    (typeof booking.restaurant === "string"  
                      ? booking.restaurant  
                      : "Restaurant")}  
                </h2>  

                <p className="mt-1 text-sm text-gray-500">  
                  {restaurant?.address || ""}  
                </p>  
              </div>  

              <span  
                className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${getStatusStyle(status)}`}  
              >  
                {status}  
              </span>  
            </div>  

            <div className="mt-5 grid gap-4 text-gray-700 sm:grid-cols-3">  
              <p className="flex items-center gap-2">  
                <CalendarDays size={19} className="text-emerald-700" />  
                {formatDate(booking.bookingDate)}  
              </p>  

              <p className="flex items-center gap-2">  
                <Clock size={19} className="text-emerald-700" />  
                {booking.startTime || "Time not available"}  
              </p>  

              <p className="flex items-center gap-2">  
                <Users size={19} className="text-emerald-700" />  
                {booking.guests} guests  
              </p>  
            </div>  

            {booking.specialRequests && (  
              <p className="mt-4 text-sm text-gray-600">  
                <strong>Special requests:</strong>{" "}  
                {booking.specialRequests}  
              </p>  
            )}  

            {canCancel && (  
              <button  
                type="button"  
                onClick={() => openCancelPopup(booking._id)}  
                disabled={cancellingId !== null}  
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"  
              >  
                <XCircle size={18} />  
                Cancel Booking  
              </button>  
            )}  
          </section>  
        );  
      })}  
    </div>  

    <div className="mt-8 flex flex-wrap justify-center gap-6">  
      <Link  
        to="/booking-history"  
        className="inline-flex items-center gap-2 font-semibold text-emerald-800"  
      >  
        <History size={18} />  
        View Booking History  
      </Link>  

      <Link to="/" className="font-semibold text-gray-600">  
        ← Back to Home  
      </Link>  
    </div>  
  </div>  

  {showCancelPopup && (  
    <div  
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"  
      onClick={(e) => {  
        if (e.target === e.currentTarget) closeCancelPopup();  
      }}  
    >  
      <div  
        role="dialog"  
        aria-modal="true"  
        aria-labelledby="cancel-booking-title"  
        className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl"  
      >  
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">  
          <XCircle size={34} className="text-red-600" />  
        </div>  

        <h2  
          id="cancel-booking-title"  
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
            onClick={closeCancelPopup}  
            disabled={cancellingId !== null}  
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-bold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"  
          >  
            Keep Booking  
          </button>  

          <button  
            type="button"  
            onClick={confirmCancelBooking}  
            disabled={cancellingId !== null}  
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"  
          >  
            {cancellingId !== null ? "Cancelling..." : "Yes, Cancel"}  
          </button>  
        </div>  
      </div>  
    </div>  
  )}  
</main>

);
}

export default MyBookingsPage;