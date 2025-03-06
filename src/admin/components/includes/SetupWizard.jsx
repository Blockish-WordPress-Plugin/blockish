import React, { useState, useEffect, lazy, useContext } from 'react';
import { __ } from "@wordpress/i18n";
import { Wizard, useWizard } from 'react-use-wizard';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey,
  faArrowsRotate,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faListCheck
} from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "./AppContext";

const Settings = lazy(() => import("../Settings"));
const SyncPosts = lazy(() => import("./SyncPosts"));

const SetupWizard = () => {
  const { refreshKey } = useContext(AppContext);

  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem('linkboss_setup_wizard_step');
    return savedStep ? parseInt(savedStep, 10) : 0;
  });

  const Step1 = ({ setCurrentStep }) => {
    const { handleStep, previousStep, nextStep } = useWizard();

    handleStep(() => {
      setCurrentStep(0);
    });

    return (
      <>
        <Settings isWizard={true} />
        <div className="flex mt-10 w-full justify-center">
          <button type="button" className="text-white border-indigo-800 bg-indigo-700 hover:bg-indigo-900 focus:ring-4 focus:ring-indigo-500 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-indigo-500 me-2 mb-2"
            onClick={() => {
              nextStep();
              setCurrentStep(1);
              localStorage.setItem('linkboss_setup_wizard_step', 1);
            }}
          >
            {__('Next', 'semantic-linkboss')}
            <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 ml-2" />
          </button>
        </div>
      </>
    );
  };

  const Step2 = ({ setCurrentStep }) => {
    const { handleStep, previousStep, nextStep } = useWizard();

    handleStep(() => {
      setCurrentStep(1);
    });

    useEffect(() => {
      const savedStep = localStorage.getItem('linkboss_setup_wizard_step');
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
      }
    }, [refreshKey]);
    

    return (
      <>
        <SyncPosts isWizard={true} />
        <div className="flex mt-10 w-full justify-center">
          <div className="flex">
            <button type="button" className="text-white border-indigo-800 bg-indigo-700 hover:bg-indigo-900 focus:ring-4 focus:ring-indigo-500 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-indigo-500 me-2 mb-2"
              onClick={() => {
                previousStep();
                setCurrentStep(0);
              }}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 mr-2" />
              {__('Previous', 'semantic-linkboss')}
            </button>
            <button type="button" className="text-white border-indigo-800 bg-indigo-700 hover:bg-indigo-900 focus:ring-4 focus:ring-indigo-500 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-indigo-500 me-2 mb-2"
              onClick={() => {
                nextStep();
                setCurrentStep(2);
              }}>
              {__('Next', 'semantic-linkboss')}
              <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </>
    );
  };

  const Step3 = ({ setCurrentStep }) => {
    const { handleStep, previousStep } = useWizard();

    handleStep(() => {
      setCurrentStep(2);
    });

    return (
      <>
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon icon={faListCheck} className="w-12 h-12 text-indigo-600 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            {__('Setup Completed', 'semantic-linkboss')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            {__('You have successfully completed the setup wizard.', 'semantic-linkboss')}
          </p>
          <button type="button" className="text-white border-indigo-800 bg-indigo-700 hover:bg-indigo-900 focus:ring-4 focus:ring-indigo-500 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-indigo-500 me-2 mb-2 mt-10"
            onClick={() => {
              const closeButton = document.querySelector('.react-responsive-modal-closeButton');
              if (closeButton) {
                closeButton.click();
                const url = window.location.href;
                if (url.includes('tab=setupWizard')) {
                  window.history.pushState({}, document.title, url.replace(/&?tab=setupWizard/, ''));
                }
              }
            }}
          >
            {__('Go to Dashboard', 'semantic-linkboss')}
          </button>
        </div>
        <div className="flex mt-10 w-full justify-center">
          <button type="button" className="text-white border-indigo-800 bg-indigo-700 hover:bg-indigo-900 focus:ring-4 focus:ring-indigo-500 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-indigo-500 me-2 mb-2"
            onClick={() => {
              previousStep();
              setCurrentStep(1);
              localStorage.setItem('linkboss_setup_wizard_step', 1);
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 mr-2" />
            {__('Previous', 'semantic-linkboss')}
          </button>
        </div>
      </>
    );
  };

  useEffect(() => {
    localStorage.setItem('linkboss_setup_wizard_step', currentStep);
  }, [currentStep]);

  return (
    <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-900 dark:border-gray-900">
      <ol className="linkboss-setup-wizard-step flex items-center max-w-[50%] mx-auto pt-6">
        {[
          { icon: faKey, step: 0 },
          { icon: faArrowsRotate, step: 1 },
          { icon: faCheck, step: 2 },
        ].map(({ icon, step }) => (
          <li key={step} className={`flex ${step <= 1 ? 'w-full relative z-10 after:-z-10 after:absolute items-center after:content-[""] after:w-full after:border-b after:border-gray-100 after:border-4 after:inline-block' : 'w-auto'} items-center ${step < currentStep ? "active" : ""} `}>
            <span className={`flex items-center justify-center cursor-pointer w-10 h-10 rounded-full lg:h-12 lg:w-12 ${currentStep >= step ? "bg-indigo-600 text-white" : "bg-gray-300 text-gray-500 shrink-0"
              }`}>
              <FontAwesomeIcon icon={icon} className="w-4 h-4 lg:w-5 lg:h-5" />
            </span>
          </li>
        ))}
      </ol>

      <div className="pt-8">
        <Wizard
          key={currentStep}
          startIndex={currentStep}
          >
          <Step1 setCurrentStep={setCurrentStep} />
          <Step2 setCurrentStep={setCurrentStep} />
          <Step3 setCurrentStep={setCurrentStep} />
        </Wizard>
      </div>
    </div>
  );
};

export default SetupWizard;
