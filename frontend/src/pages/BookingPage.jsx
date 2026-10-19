
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import toast from "react-hot-toast";
import api from "../lib/axios";

function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [guests, setGuests] = useState("2");
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [checkedAvailability, setCheckedAvailability] = useState(false);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  function resetAvailability() {
    setTables([]);
    setSelectedTable("");
    setCheckedAvailability(false);
  }

  function getEndTime() {
    if (!startTime) return null;

    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + 60;

    if (totalMinutes >= 24 * 60) return null;

    return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(
      totalMinutes % 60
    ).padStart(2, "0")}`;
  }

  async function handleCheckAvailability() {
    if (!date || !startTime || !guests) {
      toast.error("Please select date, time and guests.");
      return;
    }

    if (date < minDate) {
      toast.error("Please select today or a future date.");
      return;
    }

    const endTime = getEndTime();

    if (!endTime) {
      toast.error("Please select a start time before 11:00 PM.");
      return;
    }

    setChecking(true);
    resetAvailability();

    try {
      const response = await api.get(
        `/api/tables/restaurant/${id}/availability`,
        {
          params: {
            date,
            startTime,
            endTime,
            guests: Number(guests),
          },
        }
      );

      const availableTables = response.data.tables || [];

      setTables(availableTables);
      setCheckedAvailability(true);

      if (availableTables.length === 0) {
        toast.error("No tables available for this time.");
      } else {
        toast.success("Available tables found.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not check availability."
      );
    } finally {
      setChecking(false);
    }
  }

  async function handleBooking(event) {
    event.preventDefault();

    if (!checkedAvailability) {
      toast.error("Please check availability first.");
      return;
    }

    if (!selectedTable) {
      toast.error("Please select an available table.");
      return;
    }

    const endTime = getEndTime();

    if (!endTime) {
      toast.error("Please select a start time before 11:00 PM.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/bookings", {
        restaurantId: id,
        tableId: selectedTable,
        date,
        startTime,
        endTime,
        guests: Number(guests),
        specialRequests: "",
      });

      toast.success(
        response.data.message || "Booking request submitted!"
      );

      navigate("/my-bookings");
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please log in before booking.");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Booking failed. Please try again."
        );

        if (error.response?.status === 409) {
          resetAvailability();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="booking-page">
      <h1>Reserve Your Table</h1>

      <form onSubmit={handleBooking}>
        <label htmlFor="date">Select Date</label>
        <input
          id="date"
          type="date"
          min={minDate}
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            resetAvailability();
          }}
          required
        />

        <label htmlFor="startTime">Select Time</label>
        <input
          id="startTime"
          type="time"
          value={startTime}
          onChange={(event) => {
            setStartTime(event.target.value);
            resetAvailability();
          }}
          required
        />

        <label htmlFor="guests">Number of Guests</label>
        <input
          id="guests"
          type="number"
          min="1"
          max="20"
          value={guests}
          onChange={(event) => {
            setGuests(event.target.value);
            resetAvailability();
          }}
          required
        />

        <button
          type="button"
          onClick={handleCheckAvailability}
          disabled={checking || loading}
        >
          {checking ? "Checking..." : "Check Availability"}
        </button>

        {checkedAvailability && (
          <section>
            <h2>Available Tables</h2>

            {tables.length === 0 ? (
              <p>No tables available for this selection.</p>
            ) : (
              tables.map((table) => (
                <label
                  key={table._id}
                  style={{
                    display: "block",
                    padding: "10px",
                    margin: "8px 0",
                    border: selectedTable === table._id
                      ? "2px solid #16a34a"
                      : "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                >
                  <input
                    type="radio"
                    name="selectedTable"
                    value={table._id}
                    checked={selectedTable === table._id}
                    onChange={() => setSelectedTable(table._id)}
                  />
                  {" "}Table {table.tableNumber}
                  {" — Capacity: "}{table.capacity}
                  {table.location ? ` — ${table.location}` : ""}
                </label>
              ))
            )}
          </section>
        )}

        <button
          type="submit"
          disabled={
            loading || checking || !checkedAvailability || !selectedTable
          }
        >
          {loading ? "Submitting..." : "Request Booking"}
        </button>
      </form>

      <br />
      <Link to="/restaurants">Back to Restaurants</Link>
    </div>
  );
}

export default BookingPage;
