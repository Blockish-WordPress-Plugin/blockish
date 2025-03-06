import React from 'react';
import { __ } from "@wordpress/i18n";

const PageHeader = ({title, desc}) => {

  return (
    <div className="relative bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-purple-800 to-purple-400 text-white shadow-purple-500/40 shadow-lg -mt-12 mb-8 p-6">
      <div className="flex w-full items-center justify-between">
        <div>
          <h6 className="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-white mt-0 mb-1">
            {__(title, 'sky-elementor-addons')}
          </h6>
          <div className="block antialiased font-sans text-md font-normal dark:text-gray-300">
            {__(desc, 'sky-elementor-addons')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
