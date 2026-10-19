import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import toast from "react-hot-toast";
import {
  MapPin,
  Utensils,
  ArrowRight,
  Clock,
  Heart,
} from "lucide-react";
import api from "../lib/axios";

function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingFavorites, setUpdatingFavorites] = useState([]);

  const location = useLocation();
  const selectedCuisine = location.state?.cuisine;

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get("/api/restaurants");
        const data = response.data.restaurants;

        if (Array.isArray(data)) {
          setRestaurants(data);
        } else {
          setRestaurants([]);
          setError("Restaurant data format is incorrect.");
        }
      } catch (err) {
        const message =
          err.response?.data?.message ||
          "Unable to load restaurants. Please try again.";

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await api.get("/api/favorites");
        const data = response.data.favorites || [];

        setFavorites(
          data
            .map((item) => {
              const restaurant = item.restaurant || item;
              return restaurant._id || restaurant.id;
            })
            .filter(Boolean)
            .map(String)
        );
      } catch (err) {
        if (err.response?.status !== 401) {
          toast.error(
            err.response?.data?.message ||
              "Unable to load saved favorites."
          );
        }
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const toggleFavorite = async (restaurantId) => {
    const id = String(restaurantId);

    if (updatingFavorites.includes(id) || favoritesLoading) return;

    const isFavorite = favorites.includes(id);

    setUpdatingFavorites((previous) => [...previous, id]);

    try {
      if (isFavorite) {
        await api.delete(`/api/favorites/${id}`);

        setFavorites((previous) =>
          previous.filter((favoriteId) => favoriteId !== id)
        );

        toast.success("Removed from favorites.");
      } else {
        await api.post(`/api/favorites/${id}`);

        setFavorites((previous) =>
          previous.includes(id) ? previous : [...previous, id]
        );

        toast.success("Added to favorites.");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Unable to update favorites. Please try again."
      );
    } finally {
      setUpdatingFavorites((previous) =>
        previous.filter((favoriteId) => favoriteId !== id)
      );
    }
  };

  const filteredRestaurants = selectedCuisine
    ? restaurants.filter((restaurant) => {
        const cuisine = restaurant.cuisine ?? restaurant.cuisines;

        const restaurantCuisines = Array.isArray(cuisine)
          ? cuisine
          : typeof cuisine === "string"
            ? cuisine.split(",")
            : [];

        return restaurantCuisines.some(
          (item) =>
            String(item).trim().toLowerCase() ===
            selectedCuisine.trim().toLowerCase()
        );
      })
    : restaurants;

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center gap-3 bg-stone-50">
        <span className="loading loading-spinner loading-lg text-emerald-700" />
        <p className="font-medium text-gray-700">
          Loading restaurants...
        </p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-stone-50 px-5 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-bold uppercase tracking-widest text-emerald-700">
              Discover your next favourite
            </p>

            <h1 className="mt-2 text-4xl font-black text-gray-900">
              {selectedCuisine
                ? `${selectedCuisine} Restaurants`
                : "Explore Restaurants"}
            </h1>

            <p className="mt-3 text-gray-600">
              {selectedCuisine
                ? `Discover restaurants serving ${selectedCuisine} cuisine.`
                : "Find a place for your next memorable dining experience."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {selectedCuisine && (
              <Link
                to="/restaurants"
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
              >
                All Restaurants
              </Link>
            )}

            <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-900 shadow-sm">
              {filteredRestaurants.length} restaurant
              {filteredRestaurants.length !== 1 ? "s" : ""} available
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
            <h2 className="text-xl font-bold text-red-700">
              Unable to load restaurants
            </h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <Utensils
              className="mx-auto text-emerald-700"
              size={42}
            />

            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              {selectedCuisine
                ? `No ${selectedCuisine} restaurants found`
                : "No restaurants yet"}
            </h2>

            <p className="mt-2 text-gray-600">
              {selectedCuisine
                ? "Try exploring all available restaurants."
                : "No restaurants were returned by the server."}
            </p>

            {selectedCuisine && (
              <Link
                to="/restaurants"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
              >
                View All Restaurants
                <ArrowRight size={18} />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => {
              const id = String(restaurant._id);
              const isFavorite = favorites.includes(id);
              const isUpdating = updatingFavorites.includes(id);

              return (
                <article
                  key={restaurant._id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-800 to-gray-950">
                    <div className="rounded-full border border-white/25 bg-white/10 p-6 text-white">
                      <Utensils size={48} strokeWidth={1.8} />
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(id)}
                      disabled={isUpdating || favoritesLoading}
                      aria-label={
                        isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      aria-pressed={isFavorite}
                      title={
                        isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-200 hover:scale-110 hover:border-red-300 hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Heart
                        size={26}
                        strokeWidth={2.5}
                        className={
                          isFavorite
                            ? "fill-red-600 text-red-600"
                            : "fill-none text-white"
                        }
                      />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xl font-bold text-gray-950">
                        {restaurant.name}
                      </h2>

                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                        {Array.isArray(restaurant.cuisine)
                          ? restaurant.cuisine.join(", ")
                          : restaurant.cuisine ||
                            (Array.isArray(restaurant.cuisines)
                              ? restaurant.cuisines.join(", ")
                              : restaurant.cuisines) ||
                            "Restaurant"}
                      </span>
                    </div>

                    <p className="mt-3 min-h-12 leading-6 text-gray-600">
                      {restaurant.description ||
                        "Enjoy a memorable dining experience."}
                    </p>

                    <div className="mt-5 space-y-3 text-sm text-gray-700">
                      <p className="flex items-start gap-2">
                        <MapPin
                          size={18}
                          className="mt-0.5 shrink-0 text-emerald-800"
                        />
                        <span>
                          {restaurant.address || "Address unavailable"}
                        </span>
                      </p>

                      <p className="flex items-start gap-2">
                        <Clock
                          size={18}
                          className="mt-0.5 shrink-0 text-emerald-800"
                        />
                        <span>
                          {restaurant.openingHours || "Hours unavailable"}
                        </span>
                      </p>
                    </div>

                    <Link
                      to={`/restaurants/${restaurant._id}`}
                      className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 font-bold text-white transition hover:bg-emerald-800"
                    >
                      View Details
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default RestaurantListPage;