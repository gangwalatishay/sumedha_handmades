import {
  FaInstagram,
  FaPinterest,
  FaHeart,
} from "react-icons/fa";
import { useState } from "react";

import {
  Link,
} from "react-router-dom";

import "../styles/footer.css";

const Footer = () => {
  const [newsletterNotice, setNewsletterNotice] = useState("");

  return (
    <footer className="lux-footer">

      {/* GLOW */}
      <div className="footer-glow footer-glow-1"></div>
      <div className="footer-glow footer-glow-2"></div>

      <div className="footer-container">

        {/* BRAND */}

        <div className="footer-brand">

          <span className="footer-badge">
            Handmade with Love ✨
          </span>

          <h2>
            Sumedha Handmade
          </h2>

          <p>
            Thoughtfully handcrafted gifts
            designed to celebrate emotions,
            relationships and unforgettable
            moments beautifully.
          </p>

          <div className="footer-socials">

            <a href="/">
              <FaInstagram />
            </a>

            <a href="/">
              <FaPinterest />
            </a>

            <a href="/">
              <FaHeart />
            </a>

          </div>

        </div>

        {/* QUICK LINKS */}

        <div className="footer-links">

          <h4>
            Quick Links
          </h4>

          <Link to="/">
            Home
          </Link>

          <Link to="/shop">
            Shop
          </Link>

          <Link to="/wishlist">
            Wishlist
          </Link>

          <Link to="/cart">
            Cart
          </Link>

        </div>

        {/* GIFTING */}

        <div className="footer-links">

          <h4>
            Gift Categories
          </h4>

          <Link to="/shop?category=birthday">
            Birthday Gifts
          </Link>

          <Link to="/shop?category=anniversary">
            Anniversary
          </Link>

          <Link to="/shop?category=love">
            Love & Romance
          </Link>

          <Link to="/shop?category=proposal">
            Proposal Gifts
          </Link>

        </div>

        {/* NEWSLETTER */}

        <div className="footer-newsletter">

          <h4>
            Stay Connected
          </h4>

          <p>
            Get updates on new arrivals,
            exclusive hampers and curated
            handmade collections.
          </p>

          <div className="newsletter-box">

            <input
              type="email"
              aria-label="Email address for newsletter"
              placeholder="Enter your email"
            />

            <button
              type="button"
              className="btn-primary"
              onClick={() => setNewsletterNotice("Newsletter sign-up is coming soon.")}
            >
              Join
            </button>

          </div>
          {newsletterNotice && <p role="status" className="newsletter-notice">{newsletterNotice}</p>}

        </div>

      </div>

      {/* BOTTOM */}

      <div className="footer-bottom">

        © 2026 Sumedha Handmade —
        Crafted beautifully with love 🤍

      </div>

    </footer>
  );
};

export default Footer;
