import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { CustomerContext } from "../context/CustomerContext";

const ProtectedCustomerRoute = ({ children }) => {
  const { customer } = useContext(CustomerContext);

  if (!customer) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedCustomerRoute;
