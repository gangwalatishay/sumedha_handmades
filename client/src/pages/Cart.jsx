import { API_BASE } from "../utils/api";
import {
  useEffect,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  CartContext,
} from "../context/CartContext";

import {
  CustomerContext,
} from "../context/CustomerContext";

import {
  apiFetch,
} from "../utils/api";
import { useToast } from "../context/ToastContext";

import ProductCard from "../components/ProductCard";

import "../styles/cart.css";

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

/* =========================================
   CART PAGE
========================================= */

const Cart = () => {
  const toast = useToast();

  const navigate =
    useNavigate();

  const {
    cartItems,
    removeFromCart,
    setCartItems,
  } = useContext(CartContext);

  const {
    customer,
  } = useContext(CustomerContext);

  /* =====================================
     STATES
  ===================================== */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    coupon,
    setCoupon,
  ] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplying, setCouponApplying] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: customer?.name || "",
    phone: customer?.phone || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  useEffect(() => {
    setShippingAddress((current) => ({
      ...current,
      fullName: current.fullName || customer?.name || "",
      phone: current.phone || customer?.phone || "",
    }));
  }, [customer]);

  const [
    giftWrap,
    setGiftWrap,
  ] = useState(false);

  /* =====================================
     DELIVERY DATE
  ===================================== */

  const estimatedDelivery =
    useMemo(() => {

      const today =
        new Date();

      today.setDate(
        today.getDate() + 4
      );

      return today.toLocaleDateString(
        "en-IN",
        {
          weekday: "short",
          day: "numeric",
          month: "short",
        }
      );

    }, []);

  /* =====================================
     TOTALS
  ===================================== */

  const subtotal =
    cartItems.reduce(

      (sum, item) =>

        sum +
        item.price *
        (item.qty || 1),

      0
    );

  const shipping =
    subtotal > 3000
      ? 0
      : 99;

  const giftCharge =
    giftWrap
      ? 149
      : 0;

  const discount = couponDiscount;

  const total =
    subtotal +
    shipping +
    giftCharge -
    discount;

  const totalSavings =
    discount;

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCoupon("");
      setCouponDiscount(0);
      setCouponMessage("Enter a coupon code first.");
      return;
    }
    setCouponApplying(true);
    setCouponMessage("");
    try {
      const result = await apiFetch("/api/coupons/validate", {
        method: "POST",
        body: JSON.stringify({
          code,
          items: cartItems.map(({ productId, qty }) => ({ productId, qty: qty || 1 })),
        }),
      });
      if (Array.isArray(result.itemPrices)) {
        const livePrices = new Map(result.itemPrices.map((item) => [item.productId, item]));
        setCartItems((current) => current.map((item) => {
          const live = livePrices.get(String(item.productId));
          return live ? { ...item, price: live.price, stock: live.stock } : item;
        }));
      }
      setCoupon(result.code);
      setCouponDiscount(Number(result.discountAmount) || 0);
      setCouponMessage(`${result.code} applied — you save ₹${Number(result.discountAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}.`);
    } catch (error) {
      setCoupon("");
      setCouponDiscount(0);
      setCouponMessage(error.message || "That coupon code could not be applied.");
    } finally {
      setCouponApplying(false);
    }
  };

  /* =====================================
     QUANTITY UPDATE
  ===================================== */

  const updateQuantity =
    (
      productId,
      type
    ) => {

      const updated =
        cartItems.map(
          (item) => {

            if (
              item.productId !==
              productId
            ) {

              return item;
            }

            let qty =
              item.qty || 1;

            if (
              type === "inc"
            ) {

              qty = Math.min(Number(item.stock ?? 20), qty + 1);

            } else {

              qty =
                Math.max(
                  1,
                  qty - 1
                );
            }

            return {
              ...item,
              qty,
            };
          }
        );

      setCartItems(
        updated
      );
      if (coupon) {
        setCoupon("");
        setCouponDiscount(0);
        setCouponMessage("Your cart changed. Apply the coupon again to refresh your discount.");
      }
    };

  /* =====================================
     PLACE ORDER
  ===================================== */

  const placeOrder =
    async () => {

      if (!customer) {

        toast.info("Log in to continue to secure checkout.");

        navigate("/login");

        return;
      }

      if (
        cartItems.length === 0
      ) {

        toast.info("Your cart is empty. Add an item before checkout.");

        return;
      }

      const requiredAddressFields = ["fullName", "phone", "addressLine1", "city", "state", "postalCode"];
      if (requiredAddressFields.some((field) => !shippingAddress[field].trim())) {
        toast.info("Complete the delivery address before placing your order.");
        return;
      }

      try {

        setLoading(true);

        const checkout = await apiFetch("/api/payment/create-order", {
          method: "POST",
          body: JSON.stringify({
            items: cartItems.map(({ productId, qty }) => ({ productId, qty: qty || 1 })),
            giftWrap,
            coupon,
            shippingAddress,
          }),
        });

        const scriptReady = await loadRazorpay();
        if (!scriptReady) {
          await apiFetch("/api/payment/failure", {
            method: "POST",
            body: JSON.stringify({ localOrderId: checkout.localOrderId, reason: "Razorpay checkout could not be loaded" }),
          });
          throw new Error("Secure payment could not be loaded. Please check your connection and try again.");
        }

        const closePayment = async () => {
          try {
            const result = await apiFetch("/api/payment/failure", {
              method: "POST",
              body: JSON.stringify({ localOrderId: checkout.localOrderId, reason: "Customer closed checkout" }),
            });
            if (result.paymentStatus === "Paid") {
              setCartItems([]);
              navigate("/order-success", { state: { orderId: result.orderId, paymentStatus: "Paid" } });
              return;
            }
            if (result.paymentStatus === "Pending") {
              toast.info("Your payment is still being confirmed. Check My Orders before retrying.");
              navigate("/orders");
              return;
            }
          } catch (failureError) {
            console.error("Could not update the payment status", failureError);
          }
          setLoading(false);
        };

        const razorpayCheckout = new window.Razorpay({
          key: checkout.keyId,
          amount: checkout.amount,
          currency: checkout.currency,
          name: "Sumedha Handmades",
          description: "Handmade gifts order",
          order_id: checkout.razorpayOrderId,
          prefill: checkout.customer,
          theme: { color: "#8b514b" },
          handler: async (paymentResult) => {
            try {
              const verified = await apiFetch("/api/payment/verify-payment", {
                method: "POST",
                body: JSON.stringify({ ...paymentResult, localOrderId: checkout.localOrderId }),
              });
              setCartItems([]);
              navigate("/order-success", { state: { orderId: verified.orderId, paymentStatus: verified.paymentStatus } });
            } catch (verificationError) {
              toast.error(verificationError.message || "We’re checking your payment. Please review My Orders before trying again.");
              navigate("/orders");
            } finally {
              setLoading(false);
            }
          },
          modal: { ondismiss: closePayment, escape: false, confirm_close: true },
        });
        razorpayCheckout.on("payment.failed", async (event) => {
          toast.error(event.error?.description || "Payment failed. You can try again from your cart.");
        });
        razorpayCheckout.open();

      } catch (err) {

        toast.error(err.message || "Checkout could not be started. Please try again.");

      } finally {

        setLoading(false);
      }
    };

  /* =====================================
     EMPTY CART
  ===================================== */

  if (
    cartItems.length === 0
  ) {

    return (

      <div className="cart-page">

        <div className="cart-container">

          <div className="empty-cart">

            <h2>
              Your Cart is Empty
            </h2>

            <p>
              Add beautiful handmade gifts
              and create unforgettable
              memories.
            </p>

            <button
              onClick={() =>
                navigate("/shop")
              }
            >
              Explore Collection
            </button>

          </div>

        </div>

      </div>
    );
  }

  return (

    <div className="cart-page">

      <div className="cart-container">

        {/* =================================
           HEADER
        ================================= */}

        <div className="cart-header">

          <span>
            Luxury Checkout
          </span>

          <h1>
            Your Handmade Collection
          </h1>

          <p>
            Carefully selected handcrafted
            gifts made with love and elegance.
          </p>

        </div>

        {/* =================================
           LAYOUT
        ================================= */}

        <div className="cart-layout">

          {/* =================================
             LEFT
          ================================= */}

          <div className="cart-items">

            {cartItems.map(
              (item) => {

                const imageUrl =

                  item.image?.startsWith(
                    "http"
                  )

                    ? item.image

                    : `${API_BASE}${item.image}`;

                return (

                  <div
                    key={
                      item.productId
                    }

                    className="cart-item-card"
                  >

                    {/* IMAGE */}

                    <div className="cart-item-image">

                      <img
                        src={imageUrl}

                        alt={item.name}
                      />

                    </div>

                    {/* INFO */}

                    <div className="cart-item-info">

                      <div>

                        <h3>
                          {item.name}
                        </h3>

                        <p>
                          Premium handcrafted
                          luxury gift designed
                          with elegance and
                          emotion.
                        </p>

                      </div>

                      {/* BOTTOM */}

                      <div className="cart-item-bottom">

                        {/* QUANTITY */}

                        <div className="qty-controls">

                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.name}`}
                            disabled={Number(item.stock) <= 0 || (item.qty || 1) <= 1}
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                "dec"
                              )
                            }
                          >
                            −
                          </button>

                          <span>
                            {item.qty || 1}
                          </span>

                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.name}`}
                            disabled={Number(item.stock) <= 0 || (Number.isFinite(Number(item.stock)) && (item.qty || 1) >= Number(item.stock))}
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                "inc"
                              )
                            }
                          >
                            +
                          </button>

                        </div>

                        {/* PRICE */}

                        <div className="cart-price">

                          ₹
                          {" "}

                          {item.price *
                            (item.qty || 1)}

                          <span>

                            ×
                            {" "}

                            {item.qty || 1}

                          </span>

                        </div>

                        {Number(item.stock) <= 0 && <p className="cart-stock-warning">This item is currently out of stock. Remove it to continue.</p>}

                        {/* REMOVE */}

                        <button
                          type="button"
                          className="btn-danger"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => {
                            removeFromCart(item.productId);
                            toast.success(`${item.name} removed from your cart.`);
                            if (coupon) {
                              setCoupon("");
                              setCouponDiscount(0);
                              setCouponMessage("Your cart changed. Apply the coupon again to refresh your discount.");
                            }
                          }}
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

          {/* =================================
             SUMMARY
          ================================= */}

          <div className="cart-summary">

            <h2>
              Order Summary
            </h2>

            {/* ROWS */}

            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <span>
                ₹ {subtotal}
              </span>

            </div>

            <div className="summary-row">

              <span>
                Shipping
              </span>

              <span>

                {shipping === 0

                  ? "FREE"

                  : `₹ ${shipping}`}

              </span>

            </div>

            <div className="summary-row">

              <span>
                Gift Packaging
              </span>

              <span>

                ₹ {giftCharge}

              </span>

            </div>

            {discount > 0 && (

              <div className="summary-row">

                <span>
                  Discount
                </span>

                <span>
                  − ₹
                  {" "}
                  {discount}
                </span>

              </div>

            )}

            {/* TOTAL */}

            <div className="summary-row total">

              <span>
                Total
              </span>

              <span>
                ₹ {total}
              </span>

            </div>

            {/* SAVINGS */}

            {totalSavings > 0 && (

              <div className="cart-savings">

                🎉 You saved ₹
                {" "}
                {Math.round(
                  totalSavings
                )}

              </div>

            )}

            {/* DELIVERY */}

            <div className="delivery-box">

              🚚 Estimated Delivery:
              {" "}

              <strong>
                {estimatedDelivery}
              </strong>

            </div>

            <section className="checkout-address">
              <h3>Delivery details</h3>
              <p>Your handmade order will be sent to this address.</p>
              <div className="checkout-address-grid">
                <input aria-label="Full name" placeholder="Full name *" autoComplete="name" value={shippingAddress.fullName} onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })} />
                <input aria-label="Phone number" placeholder="Phone number *" inputMode="tel" autoComplete="tel" value={shippingAddress.phone} onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} />
                <input className="address-wide" aria-label="Address" placeholder="Address line 1 *" autoComplete="address-line1" value={shippingAddress.addressLine1} onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })} />
                <input className="address-wide" aria-label="Apartment or landmark" placeholder="Apartment, suite or landmark" autoComplete="address-line2" value={shippingAddress.addressLine2} onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })} />
                <input aria-label="City" placeholder="City *" autoComplete="address-level2" value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} />
                <input aria-label="State" placeholder="State *" autoComplete="address-level1" value={shippingAddress.state} onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })} />
                <input aria-label="Postal code" placeholder="PIN code *" inputMode="numeric" autoComplete="postal-code" value={shippingAddress.postalCode} onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })} />
              </div>
            </section>

            {/* COUPON */}

            <div className="coupon-box">

              <input
                type="text"

                placeholder="Coupon code"
                maxLength={32}

                value={couponInput}

                onChange={(e) =>
                  {
                    setCouponInput(e.target.value);
                    if (coupon) {
                      setCoupon("");
                      setCouponDiscount(0);
                      setCouponMessage("Apply the edited code to update your discount.");
                    }
                  }
                }
              />

              <button type="button" onClick={applyCoupon} disabled={couponApplying}>
                {couponApplying ? "Checking…" : "Apply"}
              </button>

            </div>
            {couponMessage && <p className={`coupon-feedback ${coupon ? "success" : "error"}`} role="status">{couponMessage}</p>}

            {/* GIFT WRAP */}

            <label className="gift-wrap">

              <input
                type="checkbox"

                checked={giftWrap}

                onChange={() =>
                  setGiftWrap(
                    !giftWrap
                  )
                }
              />

              🎁 Add Luxury Gift Packaging

            </label>

            {/* TRUST */}

            <div className="cart-trust">

              <div>
                🔒 Secure Razorpay checkout
              </div>

              <div>
                💝 Handmade Luxury
              </div>

              <div>
                🚚 Fast Delivery
              </div>

            </div>

            {/* CHECKOUT */}

            <button
              className="checkout-btn"

              onClick={
                placeOrder
              }

              disabled={
                loading || cartItems.some((item) => Number(item.stock) <= 0)
              }
            >

              {loading

                ? "Processing..."

                : cartItems.some((item) => Number(item.stock) <= 0)

                  ? "Update your cart"

                : "Pay Securely with Razorpay"}

            </button>
            <p className="checkout-note">Your order is confirmed only after Razorpay verifies payment.</p>

          </div>

        </div>

        {/* =================================
           RECOMMENDED
        ================================= */}

        <section className="related-section">

          <div className="section-heading">

            <span>
              You May Also Love
            </span>

            <h2>
              Recommended Handmade Gifts
            </h2>

          </div>

          <div className="related-grid">

            {cartItems
              .slice(0, 4)
              .map(
                (item) => (

                  <ProductCard
                    key={
                      item.productId
                    }

                    product={{
                      ...item,
                      _id:
                        item.productId,
                    }}
                  />

                )
              )}

          </div>

        </section>

      </div>

    </div>
  );
};

export default Cart;
