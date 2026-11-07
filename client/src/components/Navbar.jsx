import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  FiHeart,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";

import "./Navbar.css";

import {
  CustomerContext,
} from "../context/CustomerContext";

import {
  CartContext,
} from "../context/CartContext";

import {
  WishlistContext,
} from "../context/WishlistContext";

/* =========================================
   NAVBAR
========================================= */

const Navbar = () => {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    customer,
    logout,
  } = useContext(
    CustomerContext
  );

  const {
    cartItems,
  } = useContext(
    CartContext
  );

  const {
    wishlist,
  } = useContext(
    WishlistContext
  );

  const [
    mobileMenu,
    setMobileMenu,
  ] = useState(false);

  const [
    scrolled,
    setScrolled,
  ] = useState(false);

  /* =====================================
     SCROLL EFFECT
  ===================================== */

  useEffect(() => {

    const handleScroll =
      () => {

        setScrolled(
          window.scrollY > 30
        );
      };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>

      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, []);

  /* =====================================
     ACTIVE LINK
  ===================================== */

  const isActive =
    (path) =>
      location.pathname === path;

  /* =====================================
     CLOSE MOBILE
  ===================================== */

  const closeMenu =
    () => {

      setMobileMenu(false);
    };

  return (

    <nav
      className={
        scrolled
          ? "navbar navbar-scrolled"
          : "navbar"
      }
    >

      <div className="navbar-container">

        {/* =================================
           LEFT
        ================================= */}

        <div className="navbar-left">

          <h2
            className="logo"

            onDoubleClick={() =>
              navigate(
                "/admin-login"
              )
            }

            title="Admin Access"
          >

            Sumedha Handmade

          </h2>

        </div>

        {/* =================================
           CENTER LINKS
        ================================= */}

        <ul
          className={
            mobileMenu

              ? "nav-links active"

              : "nav-links"
          }
        >

          <li>

            <Link
              to="/"

              className={
                isActive("/")
                  ? "active-link"
                  : ""
              }

              onClick={
                closeMenu
              }
            >
              Home
            </Link>

          </li>

          <li>

            <Link
              to="/shop"

              className={
                isActive(
                  "/shop"
                )

                  ? "active-link"

                  : ""
              }

              onClick={
                closeMenu
              }
            >
              Shop
            </Link>

          </li>

          <li>

            <Link
              to="/about"

              className={
                isActive(
                  "/about"
                )

                  ? "active-link"

                  : ""
              }

              onClick={
                closeMenu
              }
            >
              About
            </Link>

          </li>

          <li>

            <Link
              to="/contact"

              className={
                isActive(
                  "/contact"
                )

                  ? "active-link"

                  : ""
              }

              onClick={
                closeMenu
              }
            >
              Contact
            </Link>

          </li>

        </ul>

        {/* =================================
           RIGHT
        ================================= */}

        <div className="navbar-right">

          {/* SEARCH */}

          <button
            className="nav-icon-btn"
          >

            <FiSearch />

          </button>

          {/* WISHLIST */}

          <button
            className="nav-icon-btn"

            onClick={() =>
              navigate(
                "/wishlist"
              )
            }
          >

            <FiHeart />

            {wishlist.length >
              0 && (

              <span className="nav-badge">

                {
                  wishlist.length
                }

              </span>

            )}

          </button>

          {/* CART */}

          <button
            className="nav-icon-btn"

            onClick={() =>
              navigate(
                "/cart"
              )
            }
          >

            <FiShoppingBag />

            {cartItems.length >
              0 && (

              <span className="nav-badge">

                {
                  cartItems.length
                }

              </span>

            )}

          </button>

          {/* USER */}

          {customer ? (

            <div className="nav-user">

              <button
                className="nav-user-btn"
              >

                <FiUser />

                <span>

                  {
                    customer.name?.split(
                      " "
                    )[0]
                  }

                </span>

              </button>

              <div className="nav-dropdown">

                <Link
                  to="/profile"
                >
                  My Profile
                </Link>

                <Link
                  to="/orders"
                >
                  My Orders
                </Link>

                <button
                  onClick={() => {

                    logout();

                    navigate("/");
                  }}
                >
                  Logout
                </button>

              </div>

            </div>

          ) : (

            <button
              className="login-btn"

              onClick={() =>
                navigate(
                  "/login"
                )
              }
            >

              Login

            </button>

          )}

          {/* MOBILE MENU */}

          <button
            className="mobile-toggle"

            onClick={() =>
              setMobileMenu(
                !mobileMenu
              )
            }
          >

            {mobileMenu

              ? <FiX />

              : <FiMenu />}

          </button>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;