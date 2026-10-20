import jwt from "jsonwebtoken";

const COOKIE_NAME = "tabula_token";
const MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

const isProduction = process.env.NODE_ENV === "production";

// Cross-site (frontend aur backend alag domains) ke liye production me
// secure:true + sameSite:"none" zaruri hai. Local me lax + non-secure.
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export const signAuthToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

export const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: MAX_AGE });
};

export const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
};
