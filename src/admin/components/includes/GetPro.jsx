import React from 'react';
import { __ } from "@wordpress/i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadset,
  faLayerGroup,
  faBriefcase,
  faChartLine,
  faUserFriends,
  faUserShield,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";

const features = [
  {
    icon: faHeadset,
    title: __('Premium Support', 'sky-elementor-addons'),
    description: __('24/7 expert support for all customers.', 'sky-elementor-addons'),
  },
  {
    icon: faBriefcase,
    title: __('Limitless Features', 'sky-elementor-addons'),
    description: __('Unlimited widgets, features & Templates.', 'sky-elementor-addons'),
  },
  {
    icon: faUserFriends,
    title: __('White Label', 'sky-elementor-addons'),
    description: __('Remove all branding and replace with your own.', 'sky-elementor-addons'),
  },
  {
    icon: faLayerGroup,
    title: __('Unlimited Templates', 'sky-elementor-addons'),
    description: __('Get access to all premium templates.', 'sky-elementor-addons'),
  },
  {
    icon: faChartLine,
    title: __('100% Responsive', 'sky-elementor-addons'),
    description: __('Fully responsive and optimized for all devices.', 'sky-elementor-addons'),
  },
  {
    icon: faUserShield,
    title: __('Prevent Cyber Attacks', 'sky-elementor-addons'),
    description: __('Regular updates to keep your site secure.', 'sky-elementor-addons'),
  },
];

const GetPro = () => (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div className="max-w-screen-md mb-8 lg:mb-16 mx-auto text-center">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            {__('Built for teams like yours to thrive.', 'sky-elementor-addons')}
            
          </h2>
          <p className="text-gray-500 sm:text-xl dark:text-gray-400">
            {__('Designed for teams of all sizes and industries. Experience every feature risk-free with our 14-day money-back guarantee!', 'sky-elementor-addons')}
          </p>
        </div>
        <div className="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
          {features.map((feature, index) => (
            <div key={index}>
              <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900">
                <FontAwesomeIcon icon={feature.icon} className="w-5 h-5 text-primary-600 lg:w-10 lg:h-10 dark:text-primary-300" />
              </div>
              <h3 className="mb-2 text-xl font-bold dark:text-white">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="pt-2 pb-12 text-center">
        <a target="_blank" href="https://skyaddons.com"
          className="text-white focus:ring-4 focus:outline-none focus:ring-[#3b5998]/50 font-medium rounded-lg text-sm px-8 py-4 text-center inline-flex items-center dark:focus:ring-[#3b5998]/55 bg-gradient-to-br from-pink-500 to-purple-700 hover:bg-gradient-to-bl">
          <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 me-2" />
          {__('Let\'s Try Premium', 'sky-elementor-addons')}
        </a>
      </div>
    </section>
);

export default GetPro;
