import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
UserRound,
Mail,
Phone,
CalendarDays,
Heart,
History,
Pencil,
Save,
X,
LogOut,
UtensilsCrossed,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";

const ProfilePage = () => {
const navigate = useNavigate();

const [user, setUser] = useState(null);
const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [editing, setEditing] = useState(false);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

useEffect(() => {
const fetchProfile = async () => {
try {
const { data } = await api.get("/api/auth/me");
setUser(data.user);
setName(data.user.name || "");
setPhone(data.user.phone || "");
} catch (error) {
setUser(null);
toast.error(
error.response?.status === 401
? "Please log in to view your profile."
: "Could not load profile. Please try again."
);
} finally {
setLoading(false);
}
};

fetchProfile();

}, []);

const handleSave = async (e) => {
e.preventDefault();

if (!name.trim()) {  
  toast.error("Name cannot be empty.");  
  return;  
}  

setSaving(true);  

try {  
  const { data } = await api.patch("/api/auth/profile", {  
    name: name.trim(),  
    phone: phone.trim(),  
  });  

  setUser(data.user);  
  setName(data.user.name || "");  
  setPhone(data.user.phone || "");  
  setEditing(false);  
  toast.success(data.message || "Profile updated successfully.");  
} catch (error) {  
  toast.error(  
    error.response?.data?.message || "Could not update profile."  
  );  
} finally {  
  setSaving(false);  
}

};

const handleLogout = async () => {
try {
await api.post("/api/auth/logout");
setUser(null);
toast.success("Logged out successfully.");
navigate("/login");
} catch (error) {
toast.error(
error.response?.data?.message || "Logout failed. Please try again."
);
}
};

const cancelEditing = () => {
setName(user?.name || "");
setPhone(user?.phone || "");
setEditing(false);
};

const shortcutStyle =
"flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-4 font-semibold text-gray-700 transition hover:border-emerald-400 hover:bg-emerald-50";

if (loading) {
return (
<div className="flex min-h-[60vh] items-center justify-center bg-[#f7f5ec] text-emerald-900">
Loading your profile...
</div>
);
}

if (!user) {
return (
<div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#f7f5ec] px-5 text-center">
<UserRound size={48} className="mb-4 text-emerald-800" />

<h1 className="text-2xl font-bold text-emerald-950">  
      Login to View Your Profile  
    </h1>  

    <p className="mt-2 text-gray-600">  
      Sign in to manage your Tabula account and bookings.  
    </p>  

    <Link  
      to="/login"  
      className="mt-5 rounded-xl bg-emerald-800 px-6 py-3 font-semibold text-white hover:bg-emerald-700"  
    >  
      Login / Register  
    </Link>  
  </div>  
);

}

return (
<main className="min-h-screen bg-[#f7f5ec] px-4 py-10 sm:px-6">
<div className="mx-auto max-w-5xl">
<section className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-emerald-950/10">

<div className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-700 px-6 py-9 text-white sm:px-10">  
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">  
          <div className="flex items-center gap-4">  
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15">  
              <UserRound size={38} className="text-white" />  
            </div>  

            <div className="min-w-0">  
              <p className="text-sm font-medium text-emerald-100">  
                Welcome to Tabula  
              </p>  

              <h1 className="mt-1 break-words text-2xl font-bold !text-white drop-shadow-lg">  
                {user.name}  
              </h1>  

              <p className="mt-1 break-all text-sm font-medium !text-white">  
                {user.email}  
              </p>  
            </div>  
          </div>  

          {!editing && (  
            <button  
              onClick={() => setEditing(true)}  
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-50"  
            >  
              <Pencil size={17} />  
              Edit Profile  
            </button>  
          )}  
        </div>  
      </div>  

      <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1.2fr_0.8fr]">  
        <section>  
          <h2 className="text-xl font-bold text-emerald-950">  
            Account Details  
          </h2>  

          <p className="mt-1 text-sm text-gray-500">  
            Manage your personal information.  
          </p>  

          {editing ? (  
            <form onSubmit={handleSave} className="mt-6 space-y-5">  
              <div>  
                <label className="mb-2 block text-sm font-semibold text-gray-700">  
                  Full Name  
                </label>  

                <input  
                  type="text"  
                  value={name}  
                  onChange={(e) => setName(e.target.value)}  
                  required  
                  maxLength={100}  
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"  
                  placeholder="Enter your name"  
                />  
              </div>  

              <div>  
                <label className="mb-2 block text-sm font-semibold text-gray-700">  
                  Email Address  
                </label>  

                <input  
                  type="email"  
                  value={user.email || ""}  
                  readOnly  
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"  
                />  

                <p className="mt-1 text-xs text-gray-500">  
                  Email cannot be changed here.  
                </p>  
              </div>  

              <div>  
                <label className="mb-2 block text-sm font-semibold text-gray-700">  
                  Phone Number  
                </label>  

                <input  
                  type="tel"  
                  value={phone}  
                  onChange={(e) => setPhone(e.target.value)}  
                  maxLength={20}  
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"  
                  placeholder="Enter your phone number"  
                />  
              </div>  

              <div className="flex flex-wrap gap-3">  
                <button  
                  type="submit"  
                  disabled={saving}  
                  className="flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"  
                >  
                  <Save size={17} />  
                  {saving ? "Saving..." : "Save Changes"}  
                </button>  

                <button  
                  type="button"  
                  onClick={cancelEditing}  
                  disabled={saving}  
                  className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"  
                >  
                  <X size={17} />  
                  Cancel  
                </button>  
              </div>  
            </form>  
          ) : (  
            <div className="mt-6 space-y-4">  
              <div className="flex items-start gap-4 rounded-xl bg-[#f7f5ec] p-4">  
                <UserRound className="mt-1 text-emerald-800" size={20} />  
                <div className="min-w-0">  
                  <p className="text-sm text-gray-500">Full Name</p>  
                  <p className="break-words font-semibold text-gray-900">  
                    {user.name || "Not provided"}  
                  </p>  
                </div>  
              </div>  

              <div className="flex items-start gap-4 rounded-xl bg-[#f7f5ec] p-4">  
                <Mail className="mt-1 text-emerald-800" size={20} />  
                <div className="min-w-0">  
                  <p className="text-sm text-gray-500">Email Address</p>  
                  <p className="break-all font-semibold text-gray-900">  
                    {user.email}  
                  </p>  
                </div>  
              </div>  

              <div className="flex items-start gap-4 rounded-xl bg-[#f7f5ec] p-4">  
                <Phone className="mt-1 text-emerald-800" size={20} />  
                <div className="min-w-0">  
                  <p className="text-sm text-gray-500">Phone Number</p>  
                  <p className="break-words font-semibold text-gray-900">  
                    {user.phone || "Not added yet"}  
                  </p>  
                </div>  
              </div>  

              <div className="flex items-start gap-4 rounded-xl bg-[#f7f5ec] p-4">  
                <CalendarDays  
                  className="mt-1 text-emerald-800"  
                  size={20}  
                />  
                <div>  
                  <p className="text-sm text-gray-500">Member Since</p>  
                  <p className="font-semibold text-gray-900">  
                    {user.createdAt  
                      ? new Date(user.createdAt).toLocaleDateString()  
                      : "Tabula Member"}  
                  </p>  
                </div>  
              </div>  
            </div>  
          )}  
        </section>  

        <aside>  
          <h2 className="text-xl font-bold text-emerald-950">  
            Your Tabula  
          </h2>  

          <p className="mt-1 text-sm text-gray-500">  
            Quick access to your account.  
          </p>  

          <div className="mt-6 space-y-3">  
            <Link to="/my-bookings" className={shortcutStyle}>  
              <CalendarDays className="text-emerald-800" size={21} />  
              <span>My Bookings</span>  
            </Link>  

            <Link to="/booking-history" className={shortcutStyle}>  
              <History className="text-emerald-800" size={21} />  
              <span>Booking History</span>  
            </Link>  

            <Link to="/favorites" className={shortcutStyle}>  
              <Heart className="text-emerald-800" size={21} />  
              <span>My Favorites</span>  
            </Link>  

            <Link to="/restaurants" className={shortcutStyle}>  
              <UtensilsCrossed className="text-emerald-800" size={21} />  
              <span>Explore Restaurants</span>  
            </Link>  
          </div>  

          <button  
            onClick={handleLogout}  
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-700 transition hover:bg-red-50"  
          >  
            <LogOut size={18} />  
            Logout  
          </button>  
        </aside>  
      </div>  
    </section>  
  </div>  
</main>

);
};

export default ProfilePage;