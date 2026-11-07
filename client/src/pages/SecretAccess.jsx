import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SecretAccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Small delay for realism
    setTimeout(() => {
      navigate("/admin-login");
    }, 500);
  }, [navigate]);

  return (
    <div style={{ padding: "80px", textAlign: "center" }}>
      <h2>Redirecting...</h2>
    </div>
  );
};

export default SecretAccess;
