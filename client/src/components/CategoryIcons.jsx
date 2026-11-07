import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const categories = [
  {
    emoji: "🎂",
    title: "Birthday",
    filter: "birthday",
  },
  {
    emoji: "💍",
    title: "Anniversary",
    filter: "anniversary",
  },
  {
    emoji: "💒",
    title: "Wedding / Engagement",
    filter: "wedding",
  },
  {
    emoji: "🌍",
    title: "Long Distance",
    filter: "long-distance",
  },
  {
    emoji: "❤️",
    title: "Love",
    filter: "love",
  },
  {
    emoji: "🎁",
    title: "Surprise Gifts",
    filter: "surprise",
  },
  {
    emoji: "🥺",
    title: "Apology",
    filter: "apology",
  },
  {
    emoji: "💌",
    title: "Proposal",
    filter: "proposal",
  },
  {
    emoji: "🫶",
    title: "Friendship",
    filter: "friendship",
  },
  {
    emoji: "👶",
    title: "Baby Shower / New Born",
    filter: "baby",
  },
];

const CategoryIcons = () => {

  const navigate = useNavigate();

  const handleFilter = (filter) => {

    navigate(
      `/shop?category=${filter}`
    );
  };

  return (
    <section className="home-categories">

      <div className="section-heading">

        <span>
          💖 Shop by Emotion
        </span>

        <h2>
          Find Gifts for Every Feeling
        </h2>

        <p>
          Thoughtfully handcrafted gifts
          designed for every special bond
          and unforgettable moment.
        </p>

      </div>

      <div className="emotion-grid">

        {categories.map((item, index) => (

          <div
            key={index}
            className="emotion-card"
            onClick={() =>
              handleFilter(item.filter)
            }
          >

            <div className="emotion-icon">
              {item.emoji}
            </div>

            <h3>{item.title}</h3>

          </div>

        ))}

      </div>

    </section>
  );
};

export default CategoryIcons;