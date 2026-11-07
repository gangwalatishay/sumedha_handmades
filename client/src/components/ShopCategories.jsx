import { useNavigate } from "react-router-dom";

const categories = [
  {
    name: "Greeting Cards",
    emoji: "💌",
    category: "greeting-cards",
  },

  {
    name: "Chocolate Bouquet",
    emoji: "🍫",
    category: "chocolate-bouquet",
  },

  {
    name: "Hampers",
    emoji: "🎁",
    category: "hampers",
  },

  {
    name: "Explosion Box",
    emoji: "💥",
    category: "explosion-box",
  },

  {
    name: "Frames",
    emoji: "🖼️",
    category: "frames",
  },

  {
    name: "Surprise Cake Box",
    emoji: "🎂",
    category: "cake-box",
  },

  {
    name: "Custom Keepsakes",
    emoji: "✨",
    category: "keepsakes",
  },

  {
    name: "Plushies",
    emoji: "🧸",
    category: "plushies",
  },
];

const ShopCategories = () => {

  const navigate = useNavigate();

  return (
    <section className="home-section">

      <div className="section-heading">

        <span>
          Curated Collections
        </span>

        <h2>
          Shop By Category
        </h2>

      </div>

      <div className="lux-category-grid">

        {categories.map((item) => (

          <div
            key={item.category}

            className="lux-category-card"

            onClick={() =>
              navigate(
                `/shop?category=${item.category}`
              )
            }
          >

            <div className="category-icon">
              {item.emoji}
            </div>

            <h3>
              {item.name}
            </h3>

          </div>

        ))}

      </div>

    </section>
  );
};

export default ShopCategories;