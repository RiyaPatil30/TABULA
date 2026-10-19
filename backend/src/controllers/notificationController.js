
import Notification from "../models/notificationModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id
  }).sort({ createdAt: -1 });

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  res.json({
    success: true,
    unreadCount,
    notifications
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id
    },
    { $set: { isRead: true } },
    { returnDocument: "after" }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found."
    });
  }

  res.json({
    success: true,
    message: "Notification marked as read.",
    notification
  });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({
    success: true,
    message: "All notifications marked as read."
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found."
    });
  }

  res.json({
    success: true,
    message: "Notification deleted."
  });
});
