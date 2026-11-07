import { API_BASE } from "../utils/api";
import { useState } from "react";

const VerifyInvoice = () => {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const verifyInvoice = async () => {
    const normalizedInvoiceNo = invoiceNo.trim().toUpperCase();
    if (!/^INV-[A-F0-9]{6}$/.test(normalizedInvoiceNo)) {
      setError("Enter a valid invoice number, for example INV-A1B2C3.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/invoice/verify/${encodeURIComponent(normalizedInvoiceNo)}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Invoice Verification</h1>

      <p style={styles.sub}>
        Enter invoice number to verify authenticity
      </p>

      <form className="invoice-verify-form" style={styles.inputBox} onSubmit={(event) => { event.preventDefault(); verifyInvoice(); }}>
        <input
          aria-label="Invoice number"
          className="invoice-verify-input"
          required
          disabled={loading}
          value={invoiceNo}
          onChange={(e) => setInvoiceNo(e.target.value.toUpperCase())}
          placeholder="INV-XXXXXX"
          style={styles.input}
        />

        <button type="submit" className="btn-primary" style={styles.button} disabled={loading || !invoiceNo.trim()}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <div style={styles.card}>
          <h3 style={{ color: "#16a34a" }}>✅ Invoice Verified</h3>

          <p><strong>Invoice No:</strong> {result.invoiceNo}</p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(result.createdAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "80px auto",
    padding: "30px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "6px",
  },
  sub: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "24px",
  },
  inputBox: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  },
  button: {
    whiteSpace: "nowrap",
  },
  error: {
    color: "#dc2626",
    marginTop: "12px",
    textAlign: "center",
  },
  card: {
    marginTop: "30px",
    padding: "20px",
    background: "#f9fafb",
    borderRadius: "12px",
  },
};

export default VerifyInvoice;
