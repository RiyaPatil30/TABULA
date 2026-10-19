import jwt from "jsonwebtoken";

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
  res.cookie("tabula_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/"
  });
};

export const clearAuthCookie = (res) => {
  res.clearCookie("tabula_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
};