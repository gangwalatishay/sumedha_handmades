import HeroBanner
from "../components/HeroBanner";

import CategoryIcons
from "../components/CategoryIcons";

import FeaturedProducts
from "../components/FeaturedProducts";

import BestSellers
from "../components/BestSellers";

import TrendingProducts
from "../components/TrendingProducts";

import Testimonials
from "../components/Testimonials";

import "../styles/home.css";

const Home = () => {

  return (
    <div className="home-page">

      {/* HERO */}

      <HeroBanner />

      {/* SHOP BY CATEGORY */}

      <CategoryIcons />

      {/* FEATURED */}

      <FeaturedProducts />

      {/* BEST SELLERS */}

      <BestSellers />

      {/* TRENDING */}

      <TrendingProducts />

      {/* TESTIMONIALS */}

      <Testimonials />

    </div>
  );
};

export default Home;