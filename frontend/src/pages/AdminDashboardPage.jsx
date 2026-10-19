
import { useEffect, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Store,
  CalendarDays,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  UtensilsCrossed,
  ArrowLeft,
  X,
  Pencil,
  Users,
  Table2,
  MapPin,
} from "lucide-react";
import api from "../lib/axios";

const emptyForm = {
  name: "",
  cuisine: "",
  address: "",
  description: "",
  phone: "",
  openingHours: "",
};

const emptyTableForm = {
  restaurantId: "",
  tableNumber: "",
  capacity: "4",
  location: "Indoor",
};

function AdminDashboardPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tables, setTables] = useState([]);

  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingTables, setLoadingTables] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingTable, setSavingTable] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showTableForm, setShowTableForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [tableForm, setTableForm] = useState(emptyTableForm);

  const [availabilityDate, setAvailabilityDate] = useState("");
  const [availabilityTime, setAvailabilityTime] = useState("19:00");
  const [availabilityGuests, setAvailabilityGuests] = useState("2");
  const [availableTables, setAvailableTables] = useState([]);

  const inputStyle =
    "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400";

  const loadRestaurants = async () => {
    try {
      const response = await api.get("/api/restaurants");
      const list = response.data.restaurants || [];

      setRestaurants(list);

      setTableForm((current) => ({
        ...current,
        restaurantId:
          current.restaurantId || list[0]?._id || "",
      }));
    } catch (error) {
      console.error("Load restaurants:", error);
      toast.error("Could not load restaurants.");
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await api.get("/api/bookings/admin/all");
      setBookings(
        response.data.bookings || response.data.requests || []
      );
    } catch (error) {
      console.error("Load bookings:", error);
      setBookings([]);
    }
  };

  const loadTables = async (restaurantId) => {
    if (!restaurantId) {
      setTables([]);
      return;
    }

    setLoadingTables(true);

    try {
      const response = await api.get(
        `/api/tables/restaurant/${restaurantId}`
      );
      setTables(response.data.tables || []);
    } catch (error) {
      console.error("Load tables:", error);
      setTables([]);
      toast.error(
        error.response?.data?.message || "Could not load tables."
      );
    } finally {
      setLoadingTables(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
    loadBookings();
  }, []);

  useEffect(() => {
    if (tableForm.restaurantId) {
      loadTables(tableForm.restaurantId);
      setAvailableTables([]);
    } else {
      setTables([]);
      setAvailableTables([]);
    }
  }, [tableForm.restaurantId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTableChange = (e) => {
    setTableForm({
      ...tableForm,
      [e.target.name]: e.target.value,
    });
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEditForm = (restaurant) => {
    setEditingId(restaurant._id);
    setForm({
      name: restaurant.name || "",
      cuisine: restaurant.cuisine || "",
      address: restaurant.address || "",
      description: restaurant.description || "",
      phone: restaurant.phone || "",
      openingHours: restaurant.openingHours || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleSaveRestaurant = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = editingId
        ? await api.patch(`/api/restaurants/${editingId}`, form)
        : await api.post("/api/restaurants", form);

      toast.success(
        response.data.message ||
          (editingId ? "Restaurant updated!" : "Restaurant added!")
      );

      closeForm();
      await loadRestaurants();
    } catch (error) {
      console.error("Save restaurant:", error);
      toast.error(
        error.response?.data?.message || "Could not save restaurant."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm("Delete this restaurant?")) return;

    try {
      await api.delete(`/api/restaurants/${id}`);
      toast.success("Restaurant deleted.");
      await loadRestaurants();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not delete restaurant."
      );
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();

    if (!tableForm.restaurantId) {
      toast.error("Please select a restaurant.");
      return;
    }

    if (!tableForm.tableNumber.trim()) {
      toast.error("Enter a table number.");
      return;
    }

    const parsedCapacity = Number(tableForm.capacity);

    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
      toast.error("Capacity must be a positive whole number.");
      return;
    }

    setSavingTable(true);

    try {
      const response = await api.post(
        `/api/tables/restaurant/${tableForm.restaurantId}`,
        {
          tableNumber: tableForm.tableNumber.trim(),
          capacity: parsedCapacity,
          location: tableForm.location.trim(),
        }
      );

      toast.success(
        response.data.message || "Table added successfully."
      );

      setTableForm((current) => ({
        ...current,
        tableNumber: "",
        capacity: "4",
        location: "Indoor",
      }));

      await loadTables(tableForm.restaurantId);
    } catch (error) {
      console.error("Add table:", error);
      toast.error(
        error.response?.data?.message ||
          "Could not add table. Check your admin login and permissions."
      );
    } finally {
      setSavingTable(false);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm("Deactivate this table?")) return;

    try {
      const response = await api.delete(`/api/tables/${tableId}`);
      toast.success(response.data.message || "Table deactivated.");

      await loadTables(tableForm.restaurantId);
      setAvailableTables([]);
    } catch (error) {
      console.error("Delete table:", error);
      toast.error(
        error.response?.data?.message || "Could not deactivate table."
      );
    }
  };

  const handleCheckTableAvailability = async (e) => {
    e.preventDefault();

    if (!tableForm.restaurantId || !availabilityDate || !availabilityTime) {
      toast.error("Select a restaurant, date and time.");
      return;
    }

    if (
      !Number.isInteger(Number(availabilityGuests)) ||
      Number(availabilityGuests) < 1
    ) {
      toast.error("Enter a valid number of guests.");
      return;
    }

    const [hours, minutes] = availabilityTime.split(":").map(Number);
    const endTotal = hours * 60 + minutes + 120;

    if (endTotal >= 24 * 60) {
      toast.error("Choose a start time that allows a two-hour booking.");
      return;
    }

    const endTime = `${String(Math.floor(endTotal / 60)).padStart(2, "0")}:${String(endTotal % 60).padStart(2, "0")}`;

    setCheckingAvailability(true);
    setAvailableTables([]);

    try {
      const response = await api.get(
        `/api/tables/restaurant/${tableForm.restaurantId}/availability`,
        {
          params: {
            date: availabilityDate,
            startTime: availabilityTime,
            endTime,
            guests: Number(availabilityGuests),
          },
        }
      );

      const resultTables = response.data.tables || [];
      setAvailableTables(resultTables);

      if (resultTables.length === 0) {
        toast("No tables available for this time.");
      } else {
        toast.success(`${resultTables.length} available table(s) found.`);
      }
    } catch (error) {
      console.error("Check availability:", error);
      toast.error(
        error.response?.data?.message ||
          "Could not check table availability."
      );
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBookingAction = async (id, status) => {
    try {
      const response = await api.patch(
        `/api/bookings/admin/${id}/status`,
        { status }
      );

      toast.success(
        response.data.message || `Booking ${status} successfully.`
      );

      await loadBookings();
    } catch (error) {
      console.error("Update booking:", error);
      toast.error(
        error.response?.data?.message || "Booking update failed."
      );
    }
  };

  const pendingCount = bookings.filter(
    (booking) => booking.status?.toLowerCase() === "pending"
  ).length;

  const stats = [
    {
      title: "Total Restaurants",
      value: restaurants.length,
      icon: Store,
      color: "text-emerald-300",
      bg: "bg-emerald-400/10",
    },
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: CalendarDays,
      color: "text-sky-300",
      bg: "bg-sky-400/10",
    },
    {
      title: "Pending Requests",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-300",
      bg: "bg-amber-400/10",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
              <UtensilsCrossed size={23} />
            </span>
            <span>
              <span className="block text-xl font-black tracking-widest">
                TABULA
              </span>
              <span className="text-xs text-slate-400">
                Restaurant Administration
              </span>
            </span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-5 py-8 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 p-7 sm:p-10">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-300">
            <LayoutDashboard size={17} /> Admin Workspace
          </p>
          <h1 className="text-3xl font-black sm:text-4xl">
            Dashboard Overview
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Manage restaurants, dining tables and customer reservations.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-300"
            >
              <Plus size={19} /> Add Restaurant
            </button>

            <button
              type="button"
              onClick={() => setShowTableForm((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-slate-900 px-5 py-3 font-bold text-emerald-300 hover:bg-slate-800"
            >
              <Table2 size={19} />
              {showTableForm ? "Close Table Manager" : "Manage Tables"}
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-slate-900 p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{item.title}</p>
                  <span className={`rounded-xl p-3 ${item.bg} ${item.color}`}>
                    <Icon size={21} />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-black">{item.value}</p>
              </div>
            );
          })}
        </section>

        {/* Table Manager */}
        {showTableForm && (
          <section className="rounded-3xl border border-emerald-400/20 bg-slate-900 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Table2 className="text-emerald-300" />
                Manage Restaurant Tables
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Add tables and check which tables are available for a booking.
              </p>
            </div>

            {restaurants.length === 0 ? (
              <p className="rounded-xl bg-slate-950 p-4 text-slate-400">
                {loadingRestaurants
                  ? "Loading restaurants..."
                  : "Add a restaurant first before creating tables."}
              </p>
            ) : (
              <>
                <label className="mb-2 block text-sm text-slate-300">
                  Select Restaurant
                </label>
                <select
                  className={`${inputStyle} mb-6`}
                  value={tableForm.restaurantId}
                  onChange={(e) =>
                    setTableForm((current) => ({
                      ...current,
                      restaurantId: e.target.value,
                    }))
                  }
                  required
                >
                  {restaurants.map((restaurant) => (
                    <option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>

                <form
                  onSubmit={handleAddTable}
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Table Number
                    </label>
                    <input
                      className={inputStyle}
                      name="tableNumber"
                      placeholder="e.g. T1"
                      value={tableForm.tableNumber}
                      onChange={handleTableChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Seating Capacity
                    </label>
                    <input
                      className={inputStyle}
                      name="capacity"
                      type="number"
                      min="1"
                      max="20"
                      value={tableForm.capacity}
                      onChange={handleTableChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Location
                    </label>
                    <select
                      className={inputStyle}
                      name="location"
                      value={tableForm.location}
                      onChange={handleTableChange}
                    >
                      <option value="Indoor">Indoor</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Window">Window</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={savingTable}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
                    >
                      <Plus size={18} />
                      {savingTable ? "Adding..." : "Add Table"}
                    </button>
                  </div>
                </form>

                {/* Existing Tables */}
                <div className="mt-8 border-t border-white/10 pt-6">
                  <h3 className="mb-4 text-lg font-bold">
                    Existing Tables
                  </h3>

                  {loadingTables ? (
                    <p className="text-sm text-slate-400">
                      Loading tables...
                    </p>
                  ) : tables.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">
                      No active tables found for this restaurant. Add your first table above.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {tables.map((table) => (
                        <article
                          key={table._id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950 p-4"
                        >
                          <div>
                            <p className="font-bold">
                              <Table2
                                size={16}
                                className="mr-2 inline text-emerald-300"
                              />
                              Table {table.tableNumber}
                            </p>
                            <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                              <Users size={15} />
                              Capacity: {table.capacity}
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                              <MapPin size={15} />
                              {table.location || "Unspecified"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteTable(table._id)}
                            title="Deactivate table"
                            className="rounded-lg p-2 text-rose-300 hover:bg-rose-400/10"
                          >
                            <Trash2 size={18} />
                          </button>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                {/* Table Availability */}
                <div className="mt-8 border-t border-white/10 pt-6">
                  <h3 className="mb-2 text-lg font-bold">
                    Check Table Availability
                  </h3>
                  <p className="mb-5 text-sm text-slate-400">
                    Check active tables for a selected date, time and guest count.
                    The duration checked is two hours.
                  </p>

                  <form
                    onSubmit={handleCheckTableAvailability}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Booking Date
                      </label>
                      <input
                        className={inputStyle}
                        type="date"
                        min={new Date().toLocaleDateString("en-CA")}
                        value={availabilityDate}
                        onChange={(e) => setAvailabilityDate(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Start Time
                      </label>
                      <input
                        className={inputStyle}
                        type="time"
                        value={availabilityTime}
                        onChange={(e) => setAvailabilityTime(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Number of Guests
                      </label>
                      <input
                        className={inputStyle}
                        type="number"
                        min="1"
                        value={availabilityGuests}
                        onChange={(e) =>
                          setAvailabilityGuests(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={checkingAvailability}
                        className="w-full rounded-xl bg-sky-400 px-4 py-3 font-bold text-slate-950 hover:bg-sky-300 disabled:opacity-50"
                      >
                        {checkingAvailability
                          ? "Checking..."
                          : "Check Availability"}
                      </button>
                    </div>
                  </form>

                  <div className="mt-5">
                    <h4 className="mb-3 font-semibold">
                      Available Tables ({availableTables.length})
                    </h4>

                    {availableTables.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
                        No availability results yet. Choose a date, time and guest count, then click Check Availability.
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {availableTables.map((table) => (
                          <div
                            key={table._id}
                            className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4"
                          >
                            <p className="font-bold text-emerald-300">
                              Table {table.tableNumber}
                            </p>
                            <p className="mt-2 text-sm text-slate-300">
                              Capacity: {table.capacity} guests
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              Location: {table.location || "Unspecified"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {/* Add/Edit Restaurant */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4">
            <div className="my-auto w-full max-w-lg rounded-2xl border border-emerald-400/30 bg-slate-900 p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editingId ? "Edit Restaurant" : "Add a New Restaurant"}
                </h2>
                <button
                  onClick={closeForm}
                  type="button"
                  aria-label="Close"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleSaveRestaurant} className="space-y-4">
                <input
                  className={inputStyle}
                  name="name"
                  placeholder="Restaurant Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <input
                  className={inputStyle}
                  name="cuisine"
                  placeholder="Cuisine"
                  value={form.cuisine}
                  onChange={handleChange}
                  required
                />
                <input
                  className={inputStyle}
                  name="address"
                  placeholder="Restaurant Address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
                <input
                  className={inputStyle}
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                />
                <input
                  className={inputStyle}
                  name="openingHours"
                  placeholder="Opening Hours"
                  value={form.openingHours}
                  onChange={handleChange}
                />
                <textarea
                  className={inputStyle}
                  name="description"
                  placeholder="Restaurant Description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                />

                <div className="flex gap-3">
                  <button
                    disabled={saving}
                    className="flex-1 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Restaurant"
                        : "Save Restaurant"}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-xl border border-slate-700 px-5 py-3"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manage Restaurants */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Manage Restaurants</h2>
            <p className="mt-1 text-sm text-slate-400">
              Add, edit and manage restaurant details.
            </p>
          </div>

          {loadingRestaurants ? (
            <p className="py-8 text-slate-400">Loading restaurants...</p>
          ) : restaurants.length === 0 ? (
            <p className="rounded-2xl bg-slate-900 p-8 text-slate-400">
              No restaurants found.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {restaurants.map((restaurant) => (
                <article
                  key={restaurant._id}
                  className="rounded-2xl border border-white/10 bg-slate-900 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                        <Store size={22} />
                      </span>
                      <div>
                        <h3 className="font-bold">{restaurant.name}</h3>
                        <p className="mt-1 text-sm text-emerald-300">
                          {restaurant.cuisine}
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                          {restaurant.address}
                        </p>
                        {restaurant.phone && (
                          <p className="mt-2 text-sm text-slate-300">
                            Phone: {restaurant.phone}
                          </p>
                        )}
                        {restaurant.openingHours && (
                          <p className="mt-1 text-sm text-slate-300">
                            Hours: {restaurant.openingHours}
                          </p>
                        )}
                        {restaurant.description && (
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {restaurant.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => openEditForm(restaurant)}
                        title="Edit restaurant"
                        className="rounded-lg p-2 text-sky-300 hover:bg-sky-400/10"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRestaurant(restaurant._id)}
                        title="Delete restaurant"
                        className="rounded-lg p-2 text-rose-300 hover:bg-rose-400/10"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Booking Requests */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Booking Requests</h2>
            <p className="mt-1 text-sm text-slate-400">
              Review customer reservations and approve or reject them.
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-5 py-10 text-center">
              <CalendarDays
                className="mx-auto text-slate-500"
                size={35}
              />
              <p className="mt-3 font-semibold">
                No booking requests found
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Customer requests will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {bookings.map((booking) => {
                const status = booking.status || "Pending";
                const normalizedStatus = status.toLowerCase();
                const pending = normalizedStatus === "pending";

                const customer =
                  booking.user?.name ||
                  booking.customer?.name ||
                  (typeof booking.customer === "string"
                    ? booking.customer
                    : null) ||
                  "Customer";

                const restaurant =
                  booking.restaurant?.name ||
                  booking.restaurantName ||
                  "Restaurant";

                const rawDate = booking.bookingDate || booking.date;
                const dateText = rawDate
                  ? String(rawDate).slice(0, 10)
                  : "Date unavailable";

                const guests =
                  booking.guests ?? booking.members ?? "Not specified";
                const startTime = booking.startTime || "Time unavailable";
                const endTime = booking.endTime || "";

                return (
                  <article
                    key={booking._id || booking.id}
                    className="rounded-2xl border border-white/10 bg-slate-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold">{restaurant}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Customer: {customer}
                        </p>
                        {booking.user?.email && (
                          <p className="mt-1 text-sm text-slate-400">
                            Email: {booking.user.email}
                          </p>
                        )}
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          pending
                            ? "bg-amber-400/10 text-amber-300"
                            : normalizedStatus === "confirmed"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : normalizedStatus === "rejected"
                                ? "bg-rose-400/10 text-rose-300"
                                : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-300">
                      <p className="flex items-center gap-2">
                        <Users size={16} className="text-emerald-300" />
                        Members: {guests}
                      </p>
                      <p className="flex items-center gap-2">
                        <CalendarDays
                          size={16}
                          className="text-emerald-300"
                        />
                        Date: {dateText}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock size={16} className="text-emerald-300" />
                        Time: {startTime}
                        {endTime ? ` - ${endTime}` : ""}
                      </p>
                      {booking.table?.tableNumber && (
                        <p>Table: {booking.table.tableNumber}</p>
                      )}
                      {booking.specialRequests && (
                        <p>Requests: {booking.specialRequests}</p>
                      )}
                    </div>

                    {pending && (
                      <div className="mt-5 flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleBookingAction(
                              booking._id || booking.id,
                              "confirmed"
                            )
                          }
                          className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-300"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleBookingAction(
                              booking._id || booking.id,
                              "rejected"
                            )
                          }
                          className="rounded-xl border border-rose-400/30 px-4 py-2.5 text-sm font-semibold text-rose-300 hover:bg-rose-400/10"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboardPage;
