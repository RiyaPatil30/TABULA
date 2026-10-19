
import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
  Users,
  Wine,
} from "lucide-react";
import api from "../lib/axios";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Easy Reservations",
    text: "Request your table in just a few clicks.",
  },
  {
    icon: Clock,
    title: "Plan Ahead",
    text: "Choose a date and time that works for you.",
  },
  {
    icon: Star,
    title: "Discover Favourites",
    text: "Explore dining spots for your next outing.",
  },
];

const getCuisineEmoji = (cuisine) => {
  const name = cuisine.toLowerCase();

  if (name.includes("south indian")) return "🥞";
  if (name.includes("north indian")) return "🍲";
  if (name.includes("punjabi")) return "🫓";
  if (name.includes("indian")) return "🍛";
  if (name.includes("italian")) return "🍕";
  if (name.includes("chinese")) return "🥡";
  if (name.includes("japanese")) return "🍣";
  if (name.includes("mexican")) return "🌮";
  if (name.includes("thai")) return "🍜";
  if (name.includes("korean")) return "🥢";
  if (name.includes("asian")) return "🍜";
  if (name.includes("healthy")) return "🥗";
  if (name.includes("dessert")) return "🍰";
  if (name.includes("bakery")) return "🥐";
  if (name.includes("seafood")) return "🦐";
  if (name.includes("burger")) return "🍔";
  if (name.includes("pizza")) return "🍕";
  if (name.includes("cafe") || name.includes("coffee")) return "☕";
  if (name.includes("biryani")) return "🍚";
  if (name.includes("vegetarian")) return "🥦";
  if (name.includes("vegan")) return "🥑";
  if (name.includes("street food")) return "🌯";

  return "🍽️";
};

function HomePage() {
  const [cuisines, setCuisines] = useState([]);

  useEffect(() => {
    api
      .get("/api/restaurants")
      .then(({ data }) => {
        const restaurants = Array.isArray(data)
          ? data
          : data?.restaurants || data?.data?.restaurants || [];

        const allCuisines = restaurants.flatMap((restaurant) => {
          const cuisine = restaurant.cuisine ?? restaurant.cuisines;

          if (Array.isArray(cuisine)) return cuisine;

          return typeof cuisine === "string"
            ? cuisine.split(",")
            : [];
        });

        const uniqueCuisines = [
          ...new Set(
            allCuisines
              .filter((item) => typeof item === "string")
              .map((item) => item.trim())
              .filter(Boolean)
          ),
        ];

        setCuisines(uniqueCuisines.slice(0, 5));
      })
      .catch((error) => {
        console.error("Failed to load cuisines:", error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24 lg:px-10">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              <Sparkles size={16} />
              Your next dining experience starts here
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Good food.
              <span className="block text-emerald-400">
                Great company.
              </span>
              <span className="block">Your table awaits.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Discover wonderful restaurants, find your favourite cuisine,
              and plan your next dining experience with Tabula.
            </p>

            <div className="mt-9">
              <Link
                to="/restaurants"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-4 font-bold text-gray-950 transition hover:-translate-y-1 hover:bg-emerald-300"
              >
                Explore Restaurants
                <ArrowRight size={19} />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-emerald-400" />
                Simple booking process
              </span>
              <span className="flex items-center gap-2">
                <Users size={17} className="text-emerald-400" />
                Plan for your group
              </span>
            </div>
          </div>

          {/* Dining Illustration */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-5 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-900 via-gray-900 to-gray-950 p-8 sm:p-10">
                <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border border-amber-300/30 bg-amber-100/10 shadow-[0_0_60px_rgba(251,191,36,0.10)]">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-amber-200/70">
                    <Utensils size={55} className="text-amber-200" />
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">
                    The art of dining
                  </p>
                  <h2 className="mt-3 text-3xl font-bold">
                    Make it a moment.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-gray-300">
                    The right place, the right people, and a table saved just
                    for your plans.
                  </p>
                </div>

                <div className="mt-7 flex items-center justify-center gap-5 border-t border-white/10 pt-5 text-sm text-gray-300">
                  <span className="flex items-center gap-2">
                    <Wine size={17} className="text-amber-300" />
                    Great ambience
                  </span>
                  <span className="flex items-center gap-2">
                    <Star size={17} className="text-amber-300" />
                    Memorable meals
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cuisine Section */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
              Explore by taste
            </p>
            <h2 className="mt-2 text-3xl font-black">
              What are you craving?
            </h2>
            <p className="mt-2 text-gray-500">
              Find inspiration for your next dining plan.
            </p>
          </div>

          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 font-bold text-emerald-800 hover:text-emerald-600"
          >
            All Restaurants
            <ArrowRight size={17} />
          </Link>
        </div>

        {cuisines.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cuisines.map((cuisine) => (
              <Link
                key={cuisine}
                to="/restaurants"
                state={{ cuisine }}
                className="group rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg"
              >
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-4xl transition group-hover:bg-emerald-50">
                  {getCuisineEmoji(cuisine)}
                </span>

                <h3 className="mt-4 font-bold">{cuisine}</h3>

                <p className="mt-1 text-xs text-gray-500">
                  Discover this cuisine
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-gray-500">
            No cuisines available yet.
          </p>
        )}
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
              Dining, made easier
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Your plans deserve a great start.
            </h2>

            <p className="mt-4 leading-7 text-gray-500">
              Tabula helps you organise your restaurant visit before you arrive.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-7 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="inline-flex rounded-2xl bg-emerald-100 p-4 text-emerald-800">
                  <Icon size={27} />
                </span>

                <h3 className="mt-5 text-xl font-bold">{title}</h3>

                <p className="mt-2 leading-7 text-gray-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Brand Section - No Repeated Button */}
      <section className="px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-3xl bg-emerald-950 px-7 py-10 text-white sm:px-12 sm:py-14">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-300">
            <Sparkles size={16} />
            Your next meal starts here
          </p>

          <h2 className="mt-3 max-w-2xl text-3xl font-black sm:text-4xl">
            Make room for moments worth sharing.
          </h2>

          <p className="mt-4 max-w-xl leading-7 text-emerald-100/80">
            Discover a new favourite, plan a meal with friends, and make
            every dining experience count.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/"
              className="flex items-center gap-3 text-xl font-black tracking-widest text-emerald-900"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-950 text-amber-300">
                <Utensils size={22} />
              </span>
              TABULA
            </Link>

            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-600"
            >
              Browse Dining Options
              <MapPin size={16} />
            </Link>
          </div>

          <div className="border-t border-stone-200 pt-5">
            <p className="text-lg font-semibold text-emerald-950">
              Where Unforgettable Meals Begin.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Discover a place. Reserve a table. Make it memorable.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
