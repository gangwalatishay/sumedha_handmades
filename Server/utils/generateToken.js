const jwt = require("jsonwebtoken");

module.exports = function generateToken(customer) {
  return jwt.sign(
    {
      id: customer._id,
      email: customer.email,
      isAdmin: customer.isAdmin || false,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
