import React, { useState } from 'react';
import { __ } from "@wordpress/i18n";
import PageHeader from './includes/PageHeader';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
} from "@fortawesome/free-solid-svg-icons";

import Faq from 'react-faq-component';

const data = {
  title: "FAQ (Frequently asked questions)",
  rows: [
    {
      title: "What are the types of licenses?",
      content: `There are many different types of licenses that are usually available for commercial use. These all have their own attributes for using purpose.`,
    },
    {
      title: "Can I ask for a refund if I'm not pleased?",
      content: `Yes, why not? We have a 14-day money-back guarantee, meaning that you can try our product for a month
and if you don’t love it, we’ll refund your purchase.`,
    },
    {
      title: "Interlink was created from Linkboss but why I am still not seeing the link on my site?",
      content: `Most of the time it’s a caching issue. If you have “object cache” or something similar enabled,  flush it and check the content again.`,
    },
    {
      title: "Can I upgrade/switch packages?",
      content: `Why not? It’s easily possible to upgrade yearly to yearly licenses. But a little bit difficult to upgrade lifetime licenses. However, you may contact us anytime we also have another great solution for it.`,
    },
    {
      title: "Do you offer a trial?",
      content: `We offer a FREE 14-day trial for all our products. You can try our product for a two weeks and if you don’t love it, we’ll refund your purchase.`,
    },
    {
      title: "What is the Plugin version?",
      content: <div>Current Core version is <strong>v{BlockishConfig.version}</strong></div>,
    },
  ],
};

const styles = {
  transitionDuration: ".3s",
  timingFunc: "linear",
  titleTextColor: "#2e186a",
  rowTitleColor: "#2e186a",
  arrowColor: "#2e186a",
};

const FAQs = () => {
  return (
    <div className="mt-12 pt-6">
      <div className="mb-12 relative flex flex-col bg-clip-border rounded-xl bg-white dark:bg-gray-900 text-gray-700 shadow-sm">
        <PageHeader
          title="FAQ (Frequently asked questions)"
          desc="Frequently asked questions about LinkBoss."
        />
        <div className="p-8">
          <Faq
            data={data}
            styles={styles}
            config={{
              tabFocus: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FAQs;
