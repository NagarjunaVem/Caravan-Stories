// import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Footer from '../components/Footer';
import HeroSection from './sections/HeroSection';
import Team from './sections/Team';
import GlobalSummaryCharts from './sections/GlobalSummaryCharts';
import Header from '../components/Header';

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <HeroSection />
      <GlobalSummaryCharts />
      <Team />
      <Footer />
    </>
  );
};

export default Home;
