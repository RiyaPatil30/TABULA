import { Link } from "react-router";

function RestaurantNotFound() {
  return (
    <div className="restaurant-not-found">
      <h2>No Restaurants Found</h2>

      <p>
        Sorry, no restaurants are available right now.
        Please try again later.
      </p>

      <Link to="/restaurants">View Restaurants</Link>
    </div>
  );
}

export default RestaurantNotFound;
