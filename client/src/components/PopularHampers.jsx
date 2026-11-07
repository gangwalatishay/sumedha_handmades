import { useNavigate } from "react-router-dom";

const hampers = [
  {
    name: "100 Shades of Love",
    original: "₹ 2,199",
    sale: "₹ 1,699",
    save: "23%",
    emoji: "💖",
  },

  {
    name: "200 Love Doses",
    original: "₹ 2,649",
    sale: "₹ 2,499",
    save: "6%",
    emoji: "💌",
  },

  {
    name: "52 Shades of Love",
    original: "₹ 1,499",
    sale: "₹ 1,249",
    save: "17%",
    emoji: "🌸",
  },

  {
    name: "BFF Jar",
    original: "₹ 1,249",
    sale: "₹ 799",
    save: "36%",
    emoji: "🫶",
  },

  {
    name: "Birthday Bliss",
    original: "₹ 2,649",
    sale: "₹ 1,649",
    save: "38%",
    emoji: "🎂",
  },

  {
    name: "Birthday Indulgence",
    original: "₹ 2,199",
    sale: "₹ 1,499",
    save: "32%",
    emoji: "🎁",
  },

  {
    name: "Bridesmaid Bliss Box",
    original: "₹ 3,199",
    sale: "₹ 2,599",
    save: "19%",
    emoji: "💍",
  },

  {
    name: "Bundle of Joy for Her",
    original: "₹ 3,300",
    sale: "₹ 2,749",
    save: "17%",
    emoji: "🌷",
  },

  {
    name: "Bundle of Joy for Him",
    original: "₹ 3,300",
    sale: "₹ 2,949",
    save: "11%",
    emoji: "🖤",
  },

  {
    name: "Celebrate Him Hamper",
    original: "₹ 2,999",
    sale: "₹ 2,549",
    save: "15%",
    emoji: "✨",
  },
];

const PopularHampers = () => {

  const navigate = useNavigate();

  return (
    <section className="home-section">

      <div className="section-heading">

        <span>
          Bestselling Hampers
        </span>

        <h2>
          Popular Gift Hampers
        </h2>

      </div>

      <div className="hamper-scroll">

        {hampers.map((item, index) => (

          <div
            key={index}
            className="hamper-card"

            onClick={() => navigate("/shop")}
          >

            <div className="hamper-top">

              <div className="hamper-emoji">
                {item.emoji}
              </div>

              <div className="sale-tag">
                Sale
              </div>

            </div>

            <h3>
              {item.name}
            </h3>

            <div className="hamper-pricing">

              <p className="old-price">
                {item.original}
              </p>

              <p className="new-price">
                {item.sale}
              </p>

            </div>

            <div className="save-badge">
              Save {item.save}
            </div>

          </div>

        ))}

      </div>

    </section>
  );
};

export default PopularHampers;