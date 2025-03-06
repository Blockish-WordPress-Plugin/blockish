import React, { useState, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import { DarkThemeToggle, Flowbite, } from "flowbite-react";

import Notice from "../Notice";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWifi } from "@fortawesome/free-solid-svg-icons";

export default function Nav() {
  const [title, setTitle] = useState("Welcome to My Website");

  useEffect(() => {
    // You can add any side effects or data fetching here if needed
  }, []);

  return (
    <>
      {/* <Notice /> */}
      <nav className="bg-white border-gray-200 px-4 rounded-xl lg:px-6 py-4 dark:bg-gray-900 shadow-sm">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex justify-start items-center">
            <a
              href="https://skyaddons.com"
              target="_blank"
              className="flex mr-4 items-center"
            >
              <img
                src={BlockishConfig.logo}
                className="mr-3 h-10 rounded"
                alt="Sky Addons"
              />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                SKY ADDONS
              </span>
            </a>
          </div>
          <div className="flex items-center lg:order-2">
            <DarkThemeToggle
              className="mr-4 ring-2 ring-gray-300 dark:ring-gray-600 py-2 px-2"
            />
            {/* Notifications */}
            <button
              type="button"
              data-dropdown-toggle="notification-dropdown"
              className="hidden p-2 mr-1 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              <span className="sr-only">View notifications</span>
              {/* Bell icon */}
              <svg
                aria-hidden="true"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
              </svg>
            </button>
            {/* Dropdown menu */}
            <div
              className="hidden overflow-hidden z-50 my-4 max-w-sm text-base list-none bg-white rounded divide-y divide-gray-100 shadow-lg dark:divide-gray-600 dark:bg-gray-700"
              id="notification-dropdown"
            >
              <div className="block py-2 px-4 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                {/*?php esc_html_e( 'Notifications (Empty)', 'sky-elementor-addons' ); ?*/}
              </div>
              <div></div>
              <a
                href="#"
                className="block py-2 text-base font-normal text-center text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:underline"
              >
                <div className="inline-flex items-center ">
                  <svg
                    aria-hidden="true"
                    className="mr-2 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {/*?php esc_html_e( 'View all', 'sky-elementor-addons' ); ?*/}
                </div>
              </a>
            </div>
            <button
              type="button"
              className="relative flex mx-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              id="user-menu-button"
              aria-expanded="false"
              data-dropdown-toggle="dropdown"
            >
              <span className="sr-only">
                {/*?php esc_html_e( 'Open user menu', 'sky-elementor-addons' ); ?*/}
              </span>
              <img className="w-9 h-9 rounded-full" src={BlockishConfig.current_user.avatar} alt="%s" />
              <span className="top-0 left-7 absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"
              ></span>
            </button>
            {/* Dropdown menu */}
            <div
              className="hidden z-50 my-4 w-56 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600"
              id="dropdown"
            >
              <div className="py-3 px-4">
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                  {/*?php printf( '%s', esc_html( $user_name ) ); ?*/}
                </span>
                <span className="block text-sm font-light text-gray-500 truncate dark:text-gray-400">
                  {/*?php printf( '%s', esc_html( $user_mail ) ); ?*/}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
