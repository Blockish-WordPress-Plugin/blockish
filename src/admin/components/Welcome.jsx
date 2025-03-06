import React, { useState, useContext, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import axios from "axios";

import { AppContext } from "./includes/AppContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadset,
  faGlobe,
  faFile
} from "@fortawesome/free-solid-svg-icons";

import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js/auto';
import { Line, Bar } from 'react-chartjs-2';
// Register the necessary Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const Welcome = () => {
  const [loading, setLoading] = useState(true);
  const { refreshKey } = useContext(AppContext);

  // Chart Options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      // title: {
      //   display: true,
      //   text: 'Title Data'
      // }
    }
  };
  const barOptions = {
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      // title: {
      //   display: true,
      //   text: 'Title Data'
      // }
    }
  };

  const features = [
    {
      icon: faFile,
      title: __('Documentation', 'sky-elementor-addons'),
      description: __('It\'s hard to create good documentation.It\'s even harder to make it awesome. But we think we\'ve solved this for you.We\'ve created a complete package, with everything you need to make your documentation as awesome as the product you\'re building.', 'sky-elementor-addons'),
    },
    {
      icon: faGlobe,
      title: __('Widgets Demo', 'sky-elementor-addons'),
      description: __('We are making an easy way to create your own website. With Widget Demo, you can launch your website in just a few minutes. You can create unlimited free demo site with more than 1000+ design layouts. All designs are fully responsive and ready-to-use.', 'sky-elementor-addons'),
    },
    {
      icon: faHeadset,
      title: __('Need Help?', 'sky-elementor-addons'),
      description: __('Customer satisfaction is our top priority. We take pride in the support we provide our users. Whether you need help with our app or want to provide feedback or ask a question, please don\'t hesitate to contact us right away.', 'sky-elementor-addons'),
    },
  ];

  return (
    <>
      <div className="sky-welcome-hero-bg rounded-md overflow-hidden relative">
        <div
          className="sky-welcome-hero-overlay text-center lg:text-left shadow-sm sm:p-8"
          style={{
            backgroundImage: `url("${BlockishConfig.assets_url}images/rocket-bg.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
        </div>
        <div className="absolute w-100 top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-left p-8">
          <h3 className="text-5xl font-bold text-white dark:text-white">
            Welcome to Sky Elementor Addons
          </h3>
          <p className="mt-4 text-base text-white dark:text-gray-300">
            Power to create stunning websites with one-click. Create beautiful, mobile-ready sites in minutes.
          </p>
        </div>
      </div>
      <section className="bg-white dark:bg-gray-900">
            <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
              <div className="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
                {features.map((feature, index) => (
                  <div key={index}>
                    <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900">
                      <FontAwesomeIcon icon={feature.icon} className="w-5 h-5 text-primary-600 lg:w-10 lg:h-10 dark:text-primary-300" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold dark:text-white">{feature.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

    </>
  );
};

export default Welcome;
