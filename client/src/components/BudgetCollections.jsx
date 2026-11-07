import { useNavigate } from "react-router-dom";

const budgets = [
  {
    title: "Under ₹499",
    emoji: "🎀",
    price: 499,
  },

  {
    title: "Under ₹999",
    emoji: "💝",
    price: 999,
  },

  {
    title: "Under ₹1499",
    emoji: "✨",
    price: 1499,
  },

  {
    title: "Under ₹2499",
    emoji: "🌸",
    price: 2499,
  },
];

const BudgetCollections = () => {

  const navigate = useNavigate();

  return (
    <section className="home-section">

      <div className="section-heading">

        <span>
          Curated By Budget
        </span>

        <h2>
          Shop By Budget
        </h2>

      </div>

      <div className="budget-grid">

        {budgets.map((item, index) => (

          <div
            key={index}

            className="budget-card"

            onClick={() =>
              navigate("/shop")
            }
          >

            <div className="budget-icon">
              {item.emoji}
            </div>

            <h3>
              {item.title}
            </h3>

            <p>
              Luxury gifting thoughtfully
              curated within your budget.
            </p>

          </div>

        ))}

      </div>

    </section>
  );
};

export default BudgetCollections;