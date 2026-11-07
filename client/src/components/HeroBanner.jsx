import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="lux-hero">

      {/* Glow Effects */}
      <div className="hero-blob blob-1"></div>
      <div className="hero-blob blob-2"></div>

      <div className="lux-hero-container">

        {/* LEFT */}
        <div className="lux-hero-left">

          <span className="lux-badge">
            ✨ Handmade with love
          </span>

          <h1>
            Elegant Handmade
            <span> Creations </span>
            crafted beautifully
            for your space.
          </h1>

          <p>
            Discover aesthetic handcrafted products
            designed with warmth, artistry and emotion.
            Every piece tells a beautiful story.
          </p>

          <div className="lux-buttons">

            <button
              className="lux-primary-btn"
              onClick={() => navigate("/shop")}
            >
              Shop Collection
            </button>

            <button
              className="lux-secondary-btn"
              onClick={() => navigate("/about")}
            >
              Our Story
            </button>

          </div>

        </div>

        {/* RIGHT */}
        <div className="lux-hero-right">

          <div className="glass-card card-1">
            🌸 Handmade
          </div>

          <div className="glass-card card-2">
            💜 Premium Quality
          </div>

          <img
            src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f"
            alt="Handmade"
          />

        </div>

      </div>

    </section>
  );
};

export default HeroBanner;