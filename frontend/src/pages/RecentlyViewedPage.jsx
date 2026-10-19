import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Clock, ArrowLeft, Utensils, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";

function RecentlyViewedPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const { data } = await api.get(
          "/api/restaurants/recently-viewed"
        );

        setRestaurants(data.restaurants || []);
      } catch (error) {
        if (error.response?.status !== 401) {
          toast.error(
            error.response?.data?.message ||
              "Unable to load recently viewed restaurants."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, []);

  return (
    <section className="min-h-screen bg-stone-50 px-5 py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/restaurants"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-600"
        >
          <ArrowLeft size={17} />
          Back to Restaurants
        </Link>

        <div className="mb-10">
          <p className="font-bold uppercase tracking-widest text-emerald-700">
            Your Activity
          </p>

          <h1 className="mt-2 flex flex-wrap items-center gap-3 text-3xl font-black text-gray-900 sm:text-4xl">
            <Clock size={32} className="text-emerald-800" />
            Recently Viewed Restaurants
          </h1>

          <p className="mt-3 text-gray-600">
            Revisit restaurants you have explored recently.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center gap-3">
            <span className="loading loading-spinner loading-lg text-emerald-700" />
            <p className="font-medium text-gray-700">
              Loading recently viewed restaurants...
            </p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <Utensils
              size={42}
              className="mx-auto text-emerald-700"
            />

            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              No recently viewed restaurants
            </h2>

            <p className="mt-2 text-gray-600">
              Explore a restaurant to see it here.
            </p>

            <Link
              to="/restaurants"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
            >
              Explore Restaurants
              <ArrowLeft size={18} className="rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <article
                key={restaurant._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-gray-950">
                  <Utensils
                    size={44}
                    className="text-white"
                    strokeWidth={1.8}
                  />
                </div>

                <h2 className="text-xl font-bold text-gray-950">
                  {restaurant.name}
                </h2>

                <p className="mt-2 text-sm text-emerald-800">
                  {restaurant.cuisine || "Restaurant"}
                </p>

                <p className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-800"
                  />
                  {restaurant.address || "Address unavailable"}
                </p>

                {restaurant.viewedAt && (
                  <p className="mt-3 text-xs text-gray-500">
                    Last viewed:{" "}
                    {new Date(
                      restaurant.viewedAt
                    ).toLocaleString("en-IN")}
                  </p>
                )}

                <Link
                  to={`/restaurants/${restaurant._id}`}
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 font-bold text-white transition hover:bg-emerald-800"
                >
                  View Details
                  <ArrowLeft size={18} className="rotate-180" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default RecentlyViewedPage;