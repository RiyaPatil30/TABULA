import { Link } from "react-router";

function RestaurantCard({ restaurant }) {
  return (
    <div className="restaurant-card">
      <h2>{restaurant.name}</h2>

      <p>Cuisine: {restaurant.cuisine}</p>
      <p>Location: {restaurant.location}</p>

      <Link to={`/restaurants/${restaurant.id}`}>
        View Details
      </Link>
    </div>
  );
}

export default RestaurantCard;
