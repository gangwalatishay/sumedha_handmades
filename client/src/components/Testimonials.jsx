import "../styles/testimonials.css";

const testimonials = [

  {
    name: "Riya Sharma",

    city: "Delhi",

    image:
      "https://randomuser.me/api/portraits/women/44.jpg",

    review:
      "Absolutely beautiful packaging and the handmade detailing felt incredibly personal. It genuinely made gifting feel emotional and memorable.",

    rating: 5,
  },

  {
    name: "Aarav Mehta",

    city: "Mumbai",

    image:
      "https://randomuser.me/api/portraits/men/32.jpg",

    review:
      "The quality exceeded expectations. The hamper looked premium, aesthetic and thoughtfully curated. Will definitely order again.",

    rating: 5,
  },

  {
    name: "Sneha Kapoor",

    city: "Bangalore",

    image:
      "https://randomuser.me/api/portraits/women/68.jpg",

    review:
      "You can genuinely feel the warmth and care behind every product. It doesn’t feel mass produced — it feels meaningful.",

    rating: 5,
  },
];

const Testimonials = () => {

  return (
    <section className="lux-testimonials">

      {/* GLOW */}

      <div className="testimonial-glow glow-1"></div>
      <div className="testimonial-glow glow-2"></div>

      <div className="testimonial-header">

        <span>
          ✨ Loved by Customers
        </span>

        <h2>
          Real Stories,
          Real Emotions
        </h2>

        <p>
          Every handmade creation carries
          warmth, love and thoughtful emotion.
          Here’s what our customers beautifully
          shared with us.
        </p>

      </div>

      {/* TESTIMONIAL GRID */}

      <div className="testimonial-grid">

        {testimonials.map(
          (item, index) => (

            <div
              className="testimonial-card"
              key={index}
            >

              {/* TOP */}

              <div className="testimonial-top">

                <img
                  src={item.image}
                  alt={item.name}
                />

                <div>

                  <h4>
                    {item.name}
                  </h4>

                  <span>
                    {item.city}
                  </span>

                </div>

              </div>

              {/* STARS */}

              <div className="testimonial-stars">

                {"⭐".repeat(
                  item.rating
                )}

              </div>

              {/* REVIEW */}

              <p className="testimonial-review">

                “{item.review}”

              </p>

            </div>

          )
        )}

      </div>

    </section>
  );
};

export default Testimonials;