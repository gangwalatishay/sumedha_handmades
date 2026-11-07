import "../styles/home.css";

const categories = [
  { icon: "🧵", name: "Handcrafted" },
  { icon: "🪔", name: "Home Decor" },
  { icon: "🎁", name: "Gifts" },
  { icon: "🌿", name: "Eco Friendly" },
];

const Categories = () => {
  return (
    <section className="categories">
      {categories.map((c) => (
        <div className="category-card" key={c.name}>
          <span>{c.icon}</span>
          <p>{c.name}</p>
        </div>
      ))}
    </section>
  );
};

export default Categories;
