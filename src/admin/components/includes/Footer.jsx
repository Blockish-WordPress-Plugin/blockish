import React from "react";
import { __ } from "@wordpress/i18n";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faYoutube,
    faFacebook,
    faTwitter,
    faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

export default function Footer() {

    return (
        <>
            <div
                className="bg-white dark:bg-gray-900 rounded-lg shadow sm:flex sm:items-center sm:justify-between p-4 sm:p-6 xl:p-8
						dark:bg-stone-900"
            >
                <p className="mb-4 text-sm text-center text-gray-500 dark:text-gray-400 sm:mb-0">
            {__("Thank You for Using ", "sky-elementor-addons")}<a target="_blank" href="https://wowdevs.com" className="hover:underline dark:text-white"><strong>wowDevs.com (v{BlockishConfig.version})</strong></a>
                    {" "}© 2023 - {new Date().getFullYear()}{" "}
                    {" "}{__("All rights reserved.", "sky-elementor-addons")}
                </p>
                <div className="flex justify-center items-center space-x-1">
                    <a
                        href="https://www.facebook.com/groups/wowdevs/"
                        target="_blank"
                        data-tooltip-target="tooltip-facebook"
                        className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer dark:text-gray-400 dark:hover:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                        <FontAwesomeIcon icon={faFacebook} className="w-5 h-5" />
                    </a>
                    <div
                        className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip dark:bg-gray-700"
                    >
                        {__("Follow us on Facebook", "sky-elementor-addons")}
                        <div className="tooltip-arrow" data-popper-arrow="" />
                    </div>
                    <a
                        href="https://twitter.com/wowdevscom"
                        target="_blank"
                        data-tooltip-target="tooltip-twitter"
                        className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer dark:text-gray-400 dark:hover:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                        <FontAwesomeIcon icon={faTwitter} className="w-5 h-5" />
                    </a>
                    <div
                        id="tooltip-twitter"
                        role="tooltip"
                        className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip dark:bg-gray-700"
                    >
                        {/*?php esc_html_e( 'Follow us on Twitter', 'sky-elementor-addons' ); ?*/}
                        <div className="tooltip-arrow" data-popper-arrow="" />
                    </div>
                    <a
                        href="https://www.linkedin.com/company/wowdevs/"
                        target="_blank"
                        data-tooltip-target="tooltip-github"
                        className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer dark:text-gray-400 dark:hover:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                        <FontAwesomeIcon icon={faLinkedin} className="w-5 h-5" />
                    </a>
                    <div
                        id="tooltip-github"
                        role="tooltip"
                        className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip dark:bg-gray-700"
                    >
                        {/*?php esc_html_e( 'Follow us on Linkedin', 'sky-elementor-addons' ); ?*/}
                        <div className="tooltip-arrow" data-popper-arrow="" />
                    </div>
                    <a
                        href="https://www.youtube.com/@wowdevs?sub_confirmation=1"
                        target="_blank"
                        data-tooltip-target="tooltip-dribbble"
                        className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer dark:text-gray-400 dark:hover:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                        <FontAwesomeIcon icon={faYoutube} className="w-5 h-5" />
                    </a>
                    <div
                        id="tooltip-dribbble"
                        role="tooltip"
                        className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip dark:bg-gray-700"
                    >
                        {/*?php esc_html_e( 'Follow us on YouTube', 'sky-elementor-addons' ); ?*/}
                        <div className="tooltip-arrow" data-popper-arrow="" />
                    </div>
                </div>
            </div>
        </>
    );

}
