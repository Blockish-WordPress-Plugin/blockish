import React, { useState, useEffect, useContext, useRef } from 'react';
import { __ } from "@wordpress/i18n";
import axios from 'axios';
import Swal from 'sweetalert2';
import Switch from "react-switch";
import { AppContext } from "./AppContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCopy,
  faCheck,
  faClock,
  faTrash,
  faCheckDouble,
  faFloppyDisk,
  faSearch
} from "@fortawesome/free-solid-svg-icons";
import {
  faYoutube
} from "@fortawesome/free-brands-svg-icons";

const RenderWidgets = ({ featuresType }) => {
  const { refreshKey } = useContext(AppContext);
  const { triggerRefresh } = useContext(AppContext);

  const [countUsed, setCountUsed] = useState(0);
  const [countUnused, setCountUnused] = useState(0);

  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState([]);
  const formRef = useRef(featuresType);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        setLoading(true); // Ensure loading state starts before fetch

        const response = await axios.get('/wp-json/skyaddons/v1/widget-settings', {
          params: { action: featuresType },
          headers: { 'X-WP-Nonce': BlockishConfig.nonce }
        });

        const widgets = Array.isArray(response?.data) ? response.data : [];
        setWidgets(widgets);

        // Count used & unused widgets using reduce()
        const { used, unused } = widgets.reduce(
          (acc, widget) => {
            if (widget.total_used > 0) {
              acc.used += 1;
            } else {
              acc.unused += 1;
            }
            return acc;
          },
          { used: 0, unused: 0 } // Initial count values
        );

        setCountUsed(used);
        setCountUnused(unused);
      } catch (error) {
        console.error('Error fetching settings:', error.message);
      } finally {
        setLoading(false); // Ensure loading state updates even if an error occurs
      }
    };

    fetchWidgets();
  }, []); // Dependency array


  if (loading) {
    return (
      <>
        <div className="text-center">{__('Loading', 'sky-elementor-addons')}...</div>
        <div className="flex justify-center items-center h-40 mt-12"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div></div>
      </>
    )
  }

  const submitForm = (event) => {
    event.preventDefault();

    const updatedWidgets = {};
    const formData = new FormData(event.target);
    for (const [key, value] of formData.entries()) {
      updatedWidgets[key] = value;
    }

    Swal.fire({
      title: 'Loading...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    axios.post('/wp-json/skyaddons/v1/widget-settings', {
      action: featuresType,
      widgets: updatedWidgets // Send all updated checkboxes in one request
    }, {
      headers: { 'X-WP-Nonce': BlockishConfig.nonce }
    }).then((response) => {
      triggerRefresh();
      if ('success' === response?.data?.status) {
        const Toast = Swal.mixin({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'success',
          title: response?.data?.title,
          text: response?.data?.msg
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: response?.data?.title,
          text: response?.data?.msg
        });
      }
    }).catch((error) => {
      console.error('Error updating widget settings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while updating widget settings.'
      });
    });

  };

  const WidgetCard = ({ data }) => {
    const [isChecked, setIsChecked] = useState(data.value === "on");

    const handleSwitchChange = () => {
      setIsChecked(!isChecked);
      setTimeout(() => {
        //update the data value
        const updatedWidgets = {};
        updatedWidgets[data.name] = !isChecked ? "on" : "off";
        // console.log('Updated widget:', updatedWidgets);

        setWidgets((prevWidgets) => {
          const updatedWidgets = prevWidgets.map((widget) => {
            if (widget.name === data.name) {
              return { ...widget, value: !isChecked ? "on" : "off" };
            }
            return widget;
          });
          return updatedWidgets;
        });
      }, 1000);

      // Delay request to avoid multiple requests at once
      clearTimeout(window.widgetUpdateTimeout);
      window.widgetUpdateTimeout = setTimeout(() => {
        // console.log('Submitting form...');
        formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }, 2000); // Delay request by 1000ms to batch updates
    };

    let badgeValue = data?.content_type?.includes('new') ? 'New' : false;
    const badge = ('pro' !== data?.widget_type ? badgeValue : (BlockishConfig?.pro_init ? badgeValue : 'Pro'));

    return (
      <div className="sky-widgets-items w-100 px-5 py-4 flex items-center gap-3 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 relative overflow-hidden"
        data-used-status={data?.total_used > 0 ? 'used' : 'unused'}
        data-widget-type={data?.widget_type}
      >
        {badge && (
          <div className="absolute left-0 top-0 h-16 w-16">
            <div
              className="absolute transform -rotate-45 text-center text-white text-xs font-semibold py-1 left-[-64px] top-[8px] w-[170px] bg-gradient-to-r from-[#e052bd] via-[#8445a2] to-[#8441a4]">
              {badge}
            </div>
          </div>
        )}
        <div className="sa-icon-wrap text-5xl text-[#8441A4] bg-[#ebcff926] p-2.5 rounded-md dark:text-white">
          <i className={`sky-icon-${data.name}`}></i>
        </div>
        <div className="flex flex-col">
          <h6 className="text-l font-medium text-gray-800 dark:text-white leading-[1.3] mb-1">
            <a href={data?.demo_url} target="_blank" rel="noreferrer" className="hover:text-[#8441A4]" title="Click to view demo">
              {data.label}
            </a>
          </h6>
          {'get_extensions' !== featuresType && (
            <p className="text-gray-500 dark:text-gray-300">
              Used - <strong>{data?.total_used < 10 && data?.total_used > 0 ? `0${data?.total_used}` : 0}</strong> times
            </p>
          )}
        </div>
        <div className="flex items-center ml-auto mr-0">
          <label htmlFor={`switch-${data.name}`}>
            <input type="hidden" value="off" name={`${data.name}`}></input>
            <Switch
              checked={'pro' !== data?.widget_type ? isChecked : (BlockishConfig?.pro_init && isChecked ? isChecked : false)}
              onChange={handleSwitchChange}
              onColor="#b47fcc"
              onHandleColor="#8441A4"
              handleDiameter={30}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              height={18}
              width={48}
              className="react-switch"
              id={`switch-${data.name}`}
              name={`${data.name}`}
            />
          </label>
        </div>
      </div>
    );
  }

  return (

    <form method="post" name={`sky-addons-${featuresType}`} onSubmit={submitForm} ref={formRef}>
      <div className='flex w-100 mb-5 justify-between'>
        <div>
          <button type="button" className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-3.5 py-1.5 rounded-md dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200"
            onClick={() => {
              const usedItems = document.querySelectorAll('.sky-widgets-items[data-used-status="used"]');
              const unusedItems = document.querySelectorAll('.sky-widgets-items[data-used-status="unused"]');
              usedItems.forEach(item => {
                item.style.display = 'flex';
              });
              unusedItems.forEach(item => {
                item.style.display = 'flex';
              });
            }
            }
          >
            <FontAwesomeIcon icon={faCheck} className="me-1" />
            All
            <span className="ms-1">({countUsed + countUnused})</span>
          </button>
          {featuresType !== 'get_extensions' && (
            <>
              <button type="button" className="bg-green-100 text-green-800 text-sm font-medium me-2 px-3.5 py-1.5 rounded-md dark:bg-green-900 dark:text-green-300 hover:bg-green-200"
                onClick={() => {
                  const usedItems = document.querySelectorAll('.sky-widgets-items[data-used-status="used"]');
                  const unusedItems = document.querySelectorAll('.sky-widgets-items[data-used-status="unused"]');

                  if (usedItems.length > 0) {
                    unusedItems.forEach(item => {
                      item.style.display = 'none';
                    });
                    usedItems.forEach(item => {
                      item.style.display = 'flex';
                    });
                  }
                }
                }
              >
                <FontAwesomeIcon icon={faClock} className="me-1" />
                Used
                <span className="ms-1">({countUsed})</span>
              </button>
              <button type="button" className="bg-red-100 text-red-800 text-sm font-medium me-2 px-3.5 py-1.5 rounded-md dark:bg-red-900 dark:text-red-300 hover:bg-red-200"
                onClick={() => {
                  const usedItems = document.querySelectorAll('.sky-widgets-items[data-used-status="used"]');
                  const unusedItems = document.querySelectorAll('.sky-widgets-items[data-used-status="unused"]');

                  if (unusedItems.length > 0) {
                    usedItems.forEach(item => {
                      item.style.display = 'none';
                    });
                    unusedItems.forEach(item => {
                      item.style.display = 'flex';
                    });
                  }
                }
                }
              >
                <FontAwesomeIcon icon={faCopy} className="me-1" />
                Unused
                <span className="ms-1">({countUnused})</span>
              </button>
            </>
          )}
        </div>
        <div>
          <input type="search" className=" w-[130px] border border-gray-200 text-sm font-medium px-3.5 py-1.5 rounded-md dark:border-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-300 dark:bg-gray-800 mr-2"
            placeholder="Search ..."
            onChange={(event) => {
              const searchValue = event.target.value.toLowerCase();
              const allItems = document.querySelectorAll('.sky-widgets-items');
              allItems.forEach(item => {
                const widgetName = item.querySelector('h6,p').textContent.toLowerCase();
                if (widgetName.includes(searchValue)) {
                  item.style.display = 'flex';
                } else {
                  item.style.display = 'none';
                }

                // if not found, append notice to the DOM
                const notFound = document.querySelector('.widget-not-found');
                if (notFound) {
                  notFound.remove();
                }
                if (document.querySelectorAll('.sky-widgets-items[style*="display: none"]').length === allItems.length) {
                  const widgetContainer = document.querySelector('.sky-widgets-items');
                  const notFound = document.createElement('div');
                  notFound.classList.add('widget-not-found', 'text-center', 'text-gray-500', 'dark:text-gray-300', 'mt-5');

                  notFound.textContent = 'Sorry, not found. Please contact support for more informations.';
                  widgetContainer.parentNode.appendChild(notFound);
                }
              });
            }}
          />
          {/* <button type="button" className="border border-blue-100 text-blue-800 text-sm font-medium me-2 px-3.5 py-1.5 rounded-md dark:border-blue-900 dark:text-blue-300 hover:border-blue-200"
          
          >
            <FontAwesomeIcon icon={faSearch} className="me-1" />
          </button> */}
          <button
            className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-3.5 py-1.5 rounded-md dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200"
            onClick={() => {
              const allSwitches = document.querySelectorAll('.react-switch input[type="checkbox"]');
              allSwitches.forEach(switchInput => {
                switchInput.checked = true;
                switchInput.dispatchEvent(new Event('change', { cancelable: true, bubbles: true }));
                setWidgets((prevWidgets) => {
                  const updatedWidgets = prevWidgets.map((widget) => {
                    return { ...widget, value: "on" };
                  });
                  return updatedWidgets;
                });
              });
            }}
          >
            <FontAwesomeIcon icon={faCheckDouble} className="me-1" />
            Enable All
          </button>

          <button className="bg-red-100 text-red-800 text-sm font-medium me-2 px-3.5 py-1.5 rounded-md dark:bg-red-900 dark:text-red-300 hover:bg-red-200"
            onClick={() => {
              const allSwitches = document.querySelectorAll('.react-switch input[type="checkbox"]');
              allSwitches.forEach(switchInput => {
                switchInput.checked = false;
                switchInput.dispatchEvent(new Event('change', { cancelable: true, bubbles: true }));
                setWidgets((prevWidgets) => {
                  const updatedWidgets = prevWidgets.map((widget) => {
                    return { ...widget, value: "off" };
                  });
                  return updatedWidgets;
                });
              });
            }}
          >
            <FontAwesomeIcon icon={faTrash} className="me-1" />
            Disable All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget, index) => (
          <WidgetCard key={index} data={widget} />
        ))}
      </div>
      <button type="submit" className="hidden">Submit</button>
    </form>
  );
};

export default RenderWidgets;
