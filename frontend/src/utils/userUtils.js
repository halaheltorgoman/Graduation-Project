// utils/userUtils.js
export const normalizeUser = (user) => {
  if (!user) return null;

  // Ensure both id and _id are always available and consistent
  const id = user._id || user.id;

  return {
    ...user,
    _id: id,
    id: id,
  };
};

export const getUserId = (user) => {
  return user?._id || user?.id; // Safely get either format
};
