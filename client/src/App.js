// import { BrowserRouter, Routes, Route } from "react-router-dom";

// /* Pages */
// import Navbar from "./components/Navbar";
// import Home from "./pages/Home";
// import Shop from "./pages/Shop";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Cart from "./pages/Cart";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Wishlist from "./pages/Wishlist";
// import MyOrders from "./pages/MyOrders";
// import Profile from "./pages/Profile";
// import OrderSuccess from "./pages/OrderSuccess";
// import ProductDetails
// from "./pages/ProductDetails";
// import Footer
// from "./components/Footer";
// /* Admin Pages */
// import AdminLogin from "./pages/AdminLogin";
// import AdminPanel from "./pages/AdminPanel";
// import AdminAnalytics from "./pages/AdminAnalytics";
// import Admin from "./pages/Admin";
// import AdminProducts
// from "./pages/AdminProducts";

// import EditProduct
// from "./pages/EditProduct";
// /* Auth / OTP */
// import ForgotPassword from "./pages/ForgotPassword";
// import VerifyOtp from "./pages/VerifyOtp";
// import ResetPassword from "./pages/ResetPassword";

// /* Route Protection */
// import ProtectedCustomerRoute from "./components/ProtectedCustomerRoute";
// import AdminOnlyRoute from "./components/AdminOnlyRoute";

// /* Context Providers */
// import CustomerProvider from "./context/CustomerContext";
// import CartProvider from "./context/CartContext";
// import WishlistProvider from "./context/WishlistContext";
// import VerifyInvoice from "./pages/VerifyInvoice";
// // import AdminInvoiceDashboard from "./components/AdminInvoiceDashboard";
// import AdminInvoiceDashboard from "./pages/AdminInvoiceDashboard";
// import AdminOrders from "./pages/AdminOrders";


// function App() {
//   return (
//     <CustomerProvider>
//       <CartProvider>
//         <WishlistProvider>
//           <BrowserRouter>
//             <Navbar />

//             <Routes>
//               {/* 🌍 Public */}
//               <Route path="/" element={<Home />} />
//               <Route path="/shop" element={<Shop />} />
//               <Route path="/about" element={<About />} />
//               <Route path="/contact" element={<Contact />} />
//               <Route path="/login" element={<Login />} />
//               <Route path="/signup" element={<Signup />} />

//               {/* 🔐 Forgot Password Flow */}
//               <Route path="/forgot-password" element={<ForgotPassword />} />
//               <Route path="/verify-otp" element={<VerifyOtp />} />
//               <Route path="/reset-password" element={<ResetPassword />} />

//               {/* 👤 Customer */}
//               <Route
//                 path="/profile"
//                 element={
//                   <ProtectedCustomerRoute>
//                     <Profile />
//                   </ProtectedCustomerRoute>
//                 }
//               />
//               <Route path="/cart" element={<Cart />} />
//               <Route path="/wishlist" element={<Wishlist />} />
//               <Route path="/orders" element={<MyOrders />} />
//               <Route path="/order-success" element={<OrderSuccess />} />

//               {/* 🔐 Admin */}
//               <Route path="/admin-login" element={<AdminLogin />} />

//               <Route
//                 path="/admin-panel"
//                 element={
//                   <AdminOnlyRoute>
//                     <AdminPanel />
//                   </AdminOnlyRoute>
//                 }
//               />
//               <Route
//   path="/admin/products"
//   element={
//     <AdminOnlyRoute>
//       <AdminProducts />
//     </AdminOnlyRoute>
//   }

// />

// <Route
//   path="/admin/products/edit/:id"
//   element={
//     <AdminOnlyRoute>
//       <EditProduct />
//     </AdminOnlyRoute>
//   }
// />



//               <Route
//                 path="/admin/analytics"
//                 element={
//                   <AdminOnlyRoute>
//                     <AdminAnalytics />
//                   </AdminOnlyRoute>
//                 }

//               />

//               <Route
//                 path="/admin"
//                 element={
//                   <AdminOnlyRoute>
//                     <Admin />
//                   </AdminOnlyRoute>
//                 }
//               />

//               <Route path="/invoice/verify" element={<VerifyInvoice />} />

//               <Route
//   path="/admin/invoices"
//   element={<AdminInvoiceDashboard />}
// />
// <Route path="/admin/orders" element={<AdminOrders />} />

// <Route
//   path="/product/:id"
//   element={<ProductDetails />}
// />
// <Route
//   path="/edit-product/:id"
//   element={<EditProduct />}
// />

//             </Routes>
//             <Footer />
//           </BrowserRouter>
//         </WishlistProvider>
//       </CartProvider>
//     </CustomerProvider>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

/* =========================================
   COMPONENTS
========================================= */

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminNav from "./components/AdminNav";

/* =========================================
   PUBLIC PAGES
========================================= */

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetails from "./pages/ProductDetails";

/* =========================================
   AUTH PAGES
========================================= */

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";

/* =========================================
   CUSTOMER PAGES
========================================= */

import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import OrderSuccess from "./pages/OrderSuccess";

/* =========================================
   ADMIN PAGES
========================================= */

import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import AdminAnalytics from "./pages/AdminAnalytics";

import Admin from "./pages/Admin";
import AdminProducts from "./pages/AdminProducts";
import EditProduct from "./pages/EditProduct";

import AdminInvoiceDashboard from "./pages/AdminInvoiceDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminPayments from "./pages/AdminPayments";
import AdminCoupons from "./pages/AdminCoupons";

/* =========================================
   INVOICE
========================================= */

import VerifyInvoice from "./pages/VerifyInvoice";

/* =========================================
   ROUTE PROTECTION
========================================= */

import ProtectedCustomerRoute from "./components/ProtectedCustomerRoute";
import AdminOnlyRoute from "./components/AdminOnlyRoute";

/* =========================================
   CONTEXT PROVIDERS
========================================= */

import CustomerProvider from "./context/CustomerContext";
import CartProvider from "./context/CartContext";
import WishlistProvider from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";

/* =========================================
   APP
========================================= */

function AppFrame() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
            {isAdminRoute ? (location.pathname === "/admin-login" ? null : <AdminNav />) : <Navbar />}

            {/* ROUTES */}

            <Routes>

              {/* =====================================
                 PUBLIC ROUTES
              ===================================== */}

              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/shop"
                element={<Shop />}
              />

              <Route
                path="/about"
                element={<About />}
              />

              <Route
                path="/contact"
                element={<Contact />}
              />

              <Route
                path="/product/:id"
                element={<ProductDetails />}
              />

              {/* =====================================
                 AUTH ROUTES
              ===================================== */}

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/signup"
                element={<Signup />}
              />

              <Route
                path="/forgot-password"
                element={<ForgotPassword />}
              />

              <Route
                path="/verify-otp"
                element={<VerifyOtp />}
              />

              <Route
                path="/reset-password"
                element={<ResetPassword />}
              />

              {/* =====================================
                 CUSTOMER ROUTES
              ===================================== */}

              <Route
                path="/profile"
                element={
                  <ProtectedCustomerRoute>
                    <Profile />
                  </ProtectedCustomerRoute>
                }
              />

              <Route
                path="/cart"
                element={<Cart />}
              />

              <Route
                path="/wishlist"
                element={<Wishlist />}
              />

              <Route
                path="/orders"
                element={<MyOrders />}
              />

              <Route
                path="/order-success"
                element={<OrderSuccess />}
              />

              {/* =====================================
                 ADMIN AUTH
              ===================================== */}

              <Route
                path="/admin-login"
                element={<AdminLogin />}
              />

              {/* =====================================
                 ADMIN PANEL
              ===================================== */}

              <Route
                path="/admin-panel"
                element={
                  <AdminOnlyRoute>
                    <AdminPanel />
                  </AdminOnlyRoute>
                }
              />

              {/* =====================================
                 ADD PRODUCT
              ===================================== */}

              <Route
                path="/admin"
                element={
                  <AdminOnlyRoute>
                    <Admin />
                  </AdminOnlyRoute>
                }
              />

              {/* =====================================
                 MANAGE PRODUCTS
              ===================================== */}

              <Route
                path="/admin/products"
                element={
                  <AdminOnlyRoute>
                    <AdminProducts />
                  </AdminOnlyRoute>
                }
              />

              {/* =====================================
                 EDIT PRODUCT
              ===================================== */}

              <Route
                path="/admin/products/edit/:id"
                element={
                  <AdminOnlyRoute>
                    <EditProduct />
                  </AdminOnlyRoute>
                }
              />

              {/* =====================================
                 ANALYTICS
              ===================================== */}

              <Route
                path="/admin/analytics"
                element={
                  <AdminOnlyRoute>
                    <AdminAnalytics />
                  </AdminOnlyRoute>
                }
              />

              {/* =====================================
                 ADMIN ORDERS
              ===================================== */}

              <Route
                path="/admin/orders"
                element={
                  <AdminOnlyRoute>
                    <AdminOrders />
                  </AdminOnlyRoute>
                }
              />

              {/* =====================================
                 ADMIN INVOICES
              ===================================== */}

              <Route
                path="/admin/invoices"
                element={
                  <AdminOnlyRoute>
                    <AdminInvoiceDashboard />
                  </AdminOnlyRoute>
                }
              />

              <Route
                path="/admin/payments"
                element={
                  <AdminOnlyRoute>
                    <AdminPayments />
                  </AdminOnlyRoute>
                }
              />

              <Route
                path="/admin/coupons"
                element={
                  <AdminOnlyRoute>
                    <AdminCoupons />
                  </AdminOnlyRoute>
                }
              />

              {/* =====================================
                 VERIFY INVOICE
              ===================================== */}

              <Route
                path="/invoice/verify"
                element={<VerifyInvoice />}
              />

            </Routes>

            {/* FOOTER */}

            {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <ToastProvider>
    <CustomerProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <AppFrame />
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </CustomerProvider>
    </ToastProvider>
  );
}

export default App;
