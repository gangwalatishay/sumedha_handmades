// utils/authHeader.js
export const authHeader = () => ({
  Authorization: "Bearer " + localStorage.getItem("token"),
});
