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

const Settings = ({ isWizard = false }) => {

  const [apiKeyShown, setapiKeyShown] = useState(false);
  const togglePasswordVisiblity = () => {
    setapiKeyShown(apiKeyShown ? false : true);
  };

  const [domain, setDomain] = useState('');
  useEffect(() => {
    setDomain(LinkBossConfig?.current_user?.domain);
  }, []);

  const copyDomainName = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(domain).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Domain copied successfully',
          showConfirmButton: false,
          timer: 1500
        });
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    } else {
      console.error('Clipboard API not supported');
    }
  };

  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await axios.get('/wp-json/linkboss/v1/settings', {
          params: { action: 'api_key' },
          headers: { 'X-WP-Nonce': LinkBossConfig.nonce }
        });
        setApiKey(response?.data?.api_key || '');
        setInputApiKey(response?.data?.api_key || '');
        // console.log(response);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  const [inputApiKey, setInputApiKey] = useState('');

  const handleChange = (e) => {
    setInputApiKey(e.target.value);
    setApiKey(e.target.value);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (inputApiKey === '') {
      Swal.fire({
        icon: 'error',
        title: 'API Key is required',
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

      const response = await axios.post('/wp-json/linkboss/v1/auth', null, {
        params: {
          api_key: apiKey,
        },
        headers: { 'X-WP-Nonce': LinkBossConfig.nonce }
      });
      
      /**
       * For the setup wizard Features
       */
      localStorage.setItem('linkboss_setup_wizard_step', 1);

      Swal.fire({
        icon: 'success',
        title: __('Success', 'semantic-linkboss'),
        html: response?.data?.message,
        showConfirmButton: false,
        timer: 2500,
        willClose: () => {
          window.location.reload();
        }
      });

      if (isWizard){
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

  if (loading) {
    return (
      <>
        <div className="text-center">{__('Loading', 'semantic-linkboss')}...</div>
        <div className="flex justify-center items-center h-40 mt-12"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div></div>
      </>
    )
  }

  return (
    <div className="mt-12 pt-6">
      <div className="mb-12 relative flex flex-col bg-clip-border rounded-xl bg-white dark:bg-gray-900 text-gray-700 shadow-sm">
        <PageHeader
          title="System Settings"
          desc="It is important to be aware of your system settings and make sure that they are correctly configured for optimal performance." />
        <div className="p-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            <div>
              <form onSubmit={handleAuthSubmit}>
                <div className="flex items-center gap-6">
                  <div className="w-[80%]">
                    <h6 className="mb-2 text-slate-800 text-lg font-semibold dark:text-white">
                      {__('Connect your WP site with LinkBoss App', 'semantic-linkboss')}
                    </h6>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                      You can get your API Key <strong>free</strong> from
                      <a href="https://app.linkboss.io" target="_blank" className="font-medium text-blue-600 underline dark:text-blue-500 ml-1 mr-1">https://app.linkboss.io</a>
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
                      value={apiKey || ''}
                      type={apiKeyShown ? "text" : "password"}
                      onChange={handleChange}
                      name="linkboss_api_key"
                      className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                    <div className="text-white absolute end-2.5 bottom-2.5 bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2.5 py-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-blue-800 cursor-pointer leading-none" onClick={togglePasswordVisiblity}>
                      <FontAwesomeIcon icon={apiKeyShown ? faEye : faEyeSlash} className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-6 text-white bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md w-full sm:w-auto px-6 py-3.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-blue-800"
                >
                  {__('Save Settings', 'semantic-linkboss')}
                </button>
              </form>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {__('Authentication Process:', 'semantic-linkboss')}
              </h3>
              <ol className="relative border-s border-gray-200 dark:border-gray-700">
                <li className="mb-10 ms-4">
                  <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                  <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                    Step 1
                  </time>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Copy the API Key from LinkBoss App
                  </h3>
                  <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                    Login/Register at <a href="https://app.linkboss.io" target="_blank" className="font-medium text-blue-600 underline dark:text-blue-500">https://app.linkboss.io</a>
                    <br />
                    Add this domain url <strong>({LinkBossConfig?.current_user?.domain})</strong>
                    <span onClick={copyDomainName} className="font-medium text-blue-600 underline dark:text-blue-500">
                      <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
                    </span> on the app. <br />Then Copy the API Key from there.
                  </p>

                  <a href="https://www.youtube.com/watch?v=rZX93rkjG2c" target="_blank" className="inline-flex items-center justify-center px-4 py-3 text-base font-medium text-white rounded-lg bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:hover:text-white">
                    <FontAwesomeIcon icon={faYoutube} className="h-6 w-6 me-2" />
                    Watch Tutorial
                  </a>
                </li>
                <li className="mb-10 ms-4">
                  <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                  <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                    Step 2
                  </time>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Paste API Key on LinkBoss Plugin Settings
                  </h3>
                  <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Paste the API key inside the "API Key" field and click "Save Settings".
                  </p>
                </li>
                <li className="ms-4">
                  <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                  <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                    Step 3
                  </time>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sync Site with LinkBoss APP
                  </h3>
                  <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Go to the "Sync" tab, click on "Prepare Data" and wait. Then click on "Sync Now" button.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
