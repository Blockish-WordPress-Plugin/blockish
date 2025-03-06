import React, { useState, useEffect } from 'react';
import { __ } from "@wordpress/i18n";
import axios from 'axios';
import Swal from 'sweetalert2';
import PageHeader from './includes/PageHeader';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCopy
} from "@fortawesome/free-solid-svg-icons";

import {
  faYoutube
} from "@fortawesome/free-brands-svg-icons";

const License = ({ isWizard = false }) => {

  const [licenseKeyShown, setlicenseKeyShown] = useState(false);
  const togglePasswordVisiblity = () => {
    setlicenseKeyShown(licenseKeyShown ? false : true);
  };

  const [licenseKey, setLicenseKey] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [licenseStatus, setLicenseStatus] = useState(true);
  const [licenseData, setLicenseData] = useState({});

  useEffect(() => {
    const fetchLicenseInfo = async () => {
      try {
        const response = await axios.get('/wp-json/skyaddons/v1/manage-license', {
          params: { who: 'license_tab' },
          headers: { 'X-WP-Nonce': SkyAddonsConfig.nonce }
        });
        setLicenseKey(response?.data?.license_key || '');
        setInputLicenseKey(response?.data?.license_key || '');
        setEmail(response?.data?.license_email || '');
        setLicenseStatus(response?.data?.license_key ? true : false);
        console.log(response?.data?.data);
        setLicenseData(response?.data?.data || {});
        setLoading(false);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setLoading(false);
        setLicenseStatus(false);
      }
    };

    fetchLicenseInfo();
  }, []);

  const [inputLicenseKey, setInputLicenseKey] = useState('');

  const handleChange = (e) => {
    setInputLicenseKey(e.target.value);
    setLicenseKey(e.target.value);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (inputLicenseKey === '') {
      Swal.fire({
        icon: 'error',
        title: 'License Key is required',
        showConfirmButton: true
      });
      return;
    }

    if (email === '') {
      Swal.fire({
        icon: 'error',
        title: 'Email is required',
        showConfirmButton: true
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Loading...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await axios.post('/wp-json/skyaddons/v1/manage-license', null, {
        params: {
          sky_addons_pro_license_key: licenseKey,
          sky_addons_pro_license_email: email,
          who: 'license_tab'
        },
        headers: { 'X-WP-Nonce': SkyAddonsConfig.nonce }
      });

      /**
       * For the setup wizard Features
       */
      localStorage.setItem('sky_addons_setup_wizard_step', 1);

      Swal.fire({
        icon: 'success',
        title: __('Success', 'sky-elementor-addons'),
        html: response?.data?.message,
        showConfirmButton: false,
        timer: 2500,
        willClose: () => {
          window.location.reload();
        }
      });

      if (isWizard) {
        setTimeout(() => {
          Swal.fire({
            title: 'Loading...',
            allowOutsideClick: false,
            didOpen: () => {
              window.location.reload();
              Swal.showLoading();
            }
          });
        }, 2000);
      }
    } catch (error) {
      // console.error('Error saving settings:', error);
      Swal.fire({
        icon: 'error',
        title: error?.response?.data?.data?.title || 'An error occurred',
        showConfirmButton: true,
        html: error?.response?.data?.message || 'Please try again'
      });
    }
  };

  const deactivateLicense = async () => {
    try {
      Swal.fire({
        title: 'Loading...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await axios.delete('/wp-json/skyaddons/v1/manage-license', {
        params: {
          who: 'license_tab'
        },
        headers: { 'X-WP-Nonce': SkyAddonsConfig.nonce }
      });

      Swal.fire({
        icon: 'success',
        title: __('Success', 'sky-elementor-addons'),
        html: response?.data?.message,
        showConfirmButton: false,
        timer: 2500,
        willClose: () => {
          window.location.reload();
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: error?.response?.data?.data?.title || 'An error occurred',
        showConfirmButton: true,
        html: error?.response?.data?.message || 'Please try again'
      });
    }
  };

  if (loading) {
    return (
      <>
        <div className="text-center">{__('Loading', 'sky-elementor-addons')}...</div>
        <div className="flex justify-center items-center h-40 mt-12"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div></div>
      </>
    )
  }

  return (
    <div className="mb-12 relative flex flex-col bg-clip-border rounded-xl bg-white dark:bg-gray-900 text-gray-700 shadow-sm">
      <div className="p-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div>
            {!licenseStatus && (
              <form onSubmit={handleAuthSubmit}>
                <div className="flex items-center gap-6">
                  <div className="w-[80%]">
                    <h6 className="mb-2 text-slate-800 text-lg font-semibold dark:text-white">
                      {__('Activate your Sky Addons Premium', 'sky-elementor-addons')}
                    </h6>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                      {__('Without a valid license key, you won\'t be able to access the premium features of Sky Addons.', 'sky - elementor - addons')}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">API Key</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-500 dark:text-gray-400">
                      <svg fill="currentColor" className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"></path>
                      </svg>
                    </div>
                    <input
                      value={licenseKey || ''}
                      type={licenseKeyShown ? "text" : "password"}
                      onChange={handleChange}
                      name="sky_addons_pro_license_key"
                      className="blur-xs block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                    <div className="text-white absolute end-2.5 bottom-2.5 bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2.5 py-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-blue-800 cursor-pointer leading-none" onClick={togglePasswordVisiblity}>
                      <FontAwesomeIcon icon={licenseKeyShown ? faEye : faEyeSlash} className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <div className="relative mt-6">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                  <input
                    value={email || ''}
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    name="sky_addons_pro_license_email"
                    className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                </div>

                <button
                  type="submit"
                  className="mt-6 text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-md w-full sm:w-auto px-6 py-3.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                >
                  {__('Activate', 'sky-elementor-addons')}
                </button>
              </form>

            )}
            {licenseStatus && (
              <div className="relative">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <caption className="pb-5 text-lg font-semibold text-left rtl:text-right text-gray-900 dark:text-white">
                    {__('License Information', 'sky-elementor-addons')}
                    <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                      {__('This is your current license information.', 'sky-elementor-addons')}
                    </p>
                  </caption>
                  <tbody>
                    <tr className="border-b border-t dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        License Title
                      </th>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {licenseData?.license_title}
                      </td>
                    </tr>
                    <tr className="border-b dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        License Key
                      </th>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {licenseData?.license_key?.substr(0, 9) + "XXXXXXXX-XXXXXXXX" + licenseData?.license_key?.substr(-9)}
                      </td>
                    </tr>
                    <tr className="border-b dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        Is Valid
                      </th>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {licenseData?.is_valid ? <span className="text-white bg-green-600 px-2 py-1 rounded">Valid</span> : <span className="text-red-600 dark:text-red-400">Invalid</span>}
                      </td>
                    </tr>
                    <tr className="border-b dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        Expire Date
                      </th>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {licenseData?.expire_date}
                      </td>
                    </tr>
                    <tr className="border-b dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        Status
                      </th>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {licenseData?.msg}
                      </td>
                    </tr>
                    <tr className="border-b dark:border-gray-700 border-gray-200">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        Support End
                      </th>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {licenseData?.support_end}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button
                  type="button"
                  className="mt-6 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-md w-full sm:w-auto px-6 py-3 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                  onClick={deactivateLicense}
                >
                  {__('Deactivate', 'sky-elementor-addons')}
                </button>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {__('How to get License Key', 'sky-elementor-addons')}
            </h3>
            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
              License Key is very important for you. Otherwise, you will not able to use premium features.
            </p>
            <ul className="list-disc pl-5">
              <li className="mb-2 text-base font-normal text-gray-500 dark:text-gray-400">
                <strong>Step 1:</strong> Go to your account on <a href="https://account.wowdevs.com/" target="_blank" className="text-blue-500">https://account.wowdevs.com/</a>
              </li>
              <li className="mb-2 text-base font-normal text-gray-500 dark:text-gray-400">
                <strong>Step 2:</strong> You if you don't have an account, create an account with the same email you used to purchase the plugin.
              </li>
              <li className="mb-2 text-base font-normal text-gray-500 dark:text-gray-400">
                <strong>Step 3:</strong> If you are facing any issue, please contact us on <a href="https://wowdevs.com/support" target="_blank" className="text-blue-500">https://wowdevs.com/support</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default License;
