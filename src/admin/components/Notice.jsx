import React, { useState, useEffect } from 'react';
import { __ } from "@wordpress/i18n";
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('/wp-json/linkboss/v1/notices', {
          params: { who: 'dashboardApp' },
          headers: { 'X-WP-Nonce': SkyAddonsConfig.nonce }
        });
        const fetchedNotices = response?.data?.data?.notices || [];
        setNotices(fetchedNotices);
      } catch (error) {
        console.error('Error fetching notices.', error);
        setError(__('Error fetching notices.', 'sky-elementor-addons'));
      }
    };

    fetchReports();
  }, []);

  const handleDismiss = (index) => {
    setNotices(notices.filter((_, i) => i !== index));

    const response = axios.get('/wp-json/linkboss/v1/notices', {
      params: { action: 'cron_dismiss', who: 'dashboardApp' },
      headers: { 'X-WP-Nonce': SkyAddonsConfig.nonce }
    });
    
  };

  if (error) {
    return (
      <div className="flex items-center p-4 mb-4 text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-400" role="alert">
        <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4" />
        <div className="ms-3 text-sm font-medium">
          {error}
        </div>
        <button
          type="button"
          className="ms-auto -mx-1.5 -my-1.5 bg-yellow-50 text-yellow-500 rounded-lg focus:ring-2 focus:ring-yellow-400 p-1.5 hover:bg-yellow-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-yellow-400 dark:hover:bg-gray-700"
          aria-label="Close"
          onClick={() => setError(null)}
        >
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // if (notices.length === 0) {
  //   return null;
  // }

  return (
    <>
      {notices.map((notice, index) => (
        <div key={index} className="flex items-center p-4 mb-4 text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-400" role="alert">
          <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4" />
          <div className="ms-3 text-sm font-medium">
            {notice.message}
          </div>
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
            aria-label="Close"
            onClick={() => handleDismiss(index)}
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>
      ))}
    </>
  );
};

export default Notice;
