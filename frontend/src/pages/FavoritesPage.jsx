import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Heart, MapPin, UtensilsCrossed, ArrowRight } from "lucide-react";
import api from "../lib/axios";

function FavoritesPage() {
const [favorites, setFavorites] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const fetchFavorites = async () => {
try {
const response = await api.get("/api/favorites");
const data = response.data;

setFavorites(  
      Array.isArray(data)  
        ? data  
        : data.favorites || data.data || []  
    );  
  } catch (err) {  
    setError(  
      err.response?.data?.message ||  
        "Unable to load favorite restaurants. Please try again."  
    );  
  } finally {  
    setLoading(false);  
  }  
};  

fetchFavorites();

}, []);

const getRestaurant = (favorite) => {
return favorite.restaurant || favorite;
};

if (loading) {
return (
<main className="min-h-screen bg-[#f7f5ec] px-4 py-12 text-center">
<p className="font-semibold text-emerald-900">
Loading favorite restaurants...
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
        My Favorite Restaurants  
      </h1>  

      <p className="mt-3 text-gray-600">  
        Your saved restaurants in one place.  
      </p>  
    </div>  

    {error && (  
      <div className="mb-6 rounded-xl bg-red-100 p-4 text-red-800">  
        {error}  
      </div>  
    )}  

    {!error && favorites.length === 0 && (  
      <section className="rounded-3xl border border-emerald-100 bg-white px-6 py-14 text-center shadow-lg shadow-emerald-950/5">  
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50">  
          <Heart size={38} className="text-emerald-800" />  
        </div>  

        <h2 className="mt-6 text-2xl font-bold text-emerald-950">  
          No Favorites Yet  
        </h2>  

        <p className="mx-auto mt-3 max-w-md text-gray-600">  
          Save your favorite restaurants to find them here  
          whenever you want.  
        </p>  

        <Link  
          to="/restaurants"  
          className="mx-auto mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-700"  
        >  
          <UtensilsCrossed size={19} />  
          Explore Restaurants  
          <ArrowRight size={18} />  
        </Link>  
      </section>  
    )}  

    <div className="grid gap-5 sm:grid-cols-2">  
      {favorites.map((favorite) => {  
        const restaurant = getRestaurant(favorite);  
        const id = restaurant?._id || restaurant?.id;  

        if (!id) return null;  

        return (  
          <section  
            key={favorite._id || id}  
            className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-md shadow-emerald-950/5"  
          >  
            <div className="flex items-start justify-between gap-3">  
              <h2 className="text-xl font-bold text-emerald-950">  
                {restaurant.name || "Restaurant"}  
              </h2>  

              <Heart  
                size={22}  
                className="shrink-0 fill-red-500 text-red-500"  
              />  
            </div>  

            <p className="mt-3 text-gray-600">  
              Cuisine: {restaurant.cuisine || "Not specified"}  
            </p>  

            <p className="mt-2 flex items-center gap-2 text-gray-600">  
              <MapPin size={17} className="text-emerald-700" />  
              {restaurant.address ||  
                restaurant.location ||  
                "Location not available"}  
            </p>  

            <Link  
              to={`/restaurants/${id}`}  
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"  
            >  
              View Restaurant  
              <ArrowRight size={17} />  
            </Link>  
          </section>  
        );  
      })}  
    </div>  

    <div className="mt-8 flex flex-wrap justify-center gap-6">  
      <Link  
        to="/restaurants"  
        className="font-semibold text-emerald-800"  
      >  
        Explore Restaurants  
      </Link>  

      <Link to="/" className="font-semibold text-gray-600">  
        Back to Home  
      </Link>  
    </div>  
  </div>  
</main>

);
}

export default FavoritesPage;