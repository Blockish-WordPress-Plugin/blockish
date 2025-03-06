import React, { useState } from 'react';
import { __ } from "@wordpress/i18n";
import PageHeader from './includes/PageHeader';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar,
} from "@fortawesome/free-solid-svg-icons";


const reviews = [
    {
        name: "Massimilano Geraci",
        designation: __("Semantic SEO Specialist", "sky-elementor-addons"),
        avatar: "massimilano-geraci.jpg",
        description: __("My compliments for Linkboss. One of the few SaaS grabbing my attention (I’ve bought the LTD).", "sky-elementor-addons"),
    },
    {
        name: "Kaisar Hamid",
        designation: __("ConchHouse Owner", "sky-elementor-addons"),
        avatar: "kaisar-hamid.jpg",
        description: __("I have 50K+ pages sites and I’ve been using LinkBoss to interlink for all these websites. The growth has been very noticeable since I’ve started using LinkBoss.", "sky-elementor-addons"),
    },
    {
        name: "Casey Keith",
        designation: __("SEO Veteran", "sky-elementor-addons"),
        avatar: "casey.jpg",
        description: __("As someone who’s spent countless hours manually interlinking posts, this tool is seriously impressive. I’ve started using it and honestly, what used to take me hours now takes minutes.", "sky-elementor-addons"),
    },
    {
        name: "Romain Campenon",
        designation: __("SEO Agency Owner", "sky-elementor-addons"),
        avatar: "romain-campenon.jpg",
        description: __("It saves me a lot of time and helps me build healthy internal links on my website (contrary to most of the tools online). I’m using it on one of my main website.", "sky-elementor-addons"),
    },
    {
        name: "Matt Zimmerman",
        designation: __("Founder, ZimmWriter", "sky-elementor-addons"),
        avatar: "matt-zimmerman.jpg",
        description: __("I was reviewing it and found it so good. I had to get the highest plan. I’m going to use it extensively in some of my videos on the sites I’m making.", "sky-elementor-addons"),
    },
    {
        name: "Poods Roni",
        designation: __("Intermet Marketer", "sky-elementor-addons"),
        avatar: "poods-roni.jpg",
        description: __("After a year of using it, I can confidently say it’s the most innovative internal linking tool I’ve seen in ages. The developers actually listen/implement changes", "sky-elementor-addons"),
    },
    {
        name: "Niko Julius",
        designation: __("Founder, Upgraded.id", "sky-elementor-addons"),
        avatar: "niko-julius.jpg",
        description: __("Easy to use, effortlessly insert interlinks that are contextually relevant with bulk link processing. A true saver for someone who manages several blogs like me.", "sky-elementor-addons"),
    },
    {
        name: "Ben Adler",
        designation: __("Founder, KeywordChef", "sky-elementor-addons"),
        avatar: "ben-adler-founder-keyword-chef.jpg",
        description: __("I just tried it and it found all my orphaned pages to link to. They even have a smart link feature to generate new paragraphs in case there aren’t any good places for links.", "sky-elementor-addons"),
    },
    {
        name: "Adam Yong",
        designation: __("Founder, Agility Writer", "sky-elementor-addons"),
        avatar: "adam-yong.jpg",
        description: __("Game-changer for internal linking of existing posts. Their suggestions make the process incredibly smooth and accurate. If you’re looking to fix orphan posts, optimize anchor texts, or create Silo networks, it’s worth considering.", "sky-elementor-addons"),
    },
];

const Reviews = () => {
    const [expanded, setExpanded] = useState(Array(reviews.length).fill(false));

    const toggleExpand = (index) => {
        setExpanded((prev) => {
            const newExpanded = [...prev];
            newExpanded[index] = !newExpanded[index];
            return newExpanded;
        });
    };

    const getShortDescription = (desc, isExpanded) => {
        const words = desc.split(" ");
        return isExpanded || words.length <= 50 ? desc : words.slice(0, 50).join(" ") + "...";
    };

    const layoutOne = (review, index) => (
        <div className="relative grid min-h-[20rem] flex-col items-end justify-center overflow-hidden rounded-lg bg-white" key={index}>
            <div className="absolute inset-0 m-0 h-full w-full overflow-hidden rounded-none bg-transparent  bg-cover bg-center bg-white">
                {SkyAddonsConfig.root_url && (
                    <img src={SkyAddonsConfig.root_url + "/assets/imgs/reviews/" + review.avatar} alt={review.name} className="object-cover w-full h-full" />
                )
                }
                <div className="to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-t from-black/100 via-black/60"></div>
            </div>
            <div className="relative text-left p-8">
                <div>
                    <dd className="flex items-left space-x-1">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-4 h-4" />
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-4 h-4" />
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-4 h-4" />
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-4 h-4" />
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-4 h-4" />
                    </dd>
                    <h4 className="mt-2 mb-6 text-xl font-medium text-white">
                        {review.description}
                    </h4>
                </div>
                <h5 className="mb-0 text-lg font-bold text-white">
                    {review.name}
                </h5>
                <h6 className="text-sm font-semibold text-gray-300 dark:text-gray-200">
                    {review.designation}
                </h6>
            </div>
        </div>
    );

    const layoutTwo = (review, index) => (
        <div className="relative grid min-h-[20rem] flex-col items-start justify-center overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-400" key={index}>
            <div className="absolute inset-0 m-0 h-full w-full overflow-hidden rounded-none bg-transparent  bg-cover bg-center">
                <div className="to-bg-black-10 absolute inset-0 h-full w-full"></div>
            </div>
            <div className="relative text-left p-8 flex flex-col justify-between h-[100%]">
                <div>
                    <dd className="flex items-left space-x-1">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-4 h-4" />
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-4 h-4" />
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-4 h-4" />
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-4 h-4" />
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-4 h-4" />
                    </dd>
                    <h4 className="mt-2 mb-6 text-xl font-medium text-black">
                        {review.description}
                    </h4>
                </div>
                <div className="flex items-center gap-4">
                    <img className="w-14 h-14 rounded-full" src={SkyAddonsConfig.root_url + "/assets/imgs/reviews/" + review.avatar} alt={review.name} />
                    <div className="font-medium dark:text-black">
                        <h4 className="mb-0 text-lg font-bold text-black">{review.name}</h4>
                        <h5 className="mt-0 text-sm font-semibold text-black dark:text-black">{review.designation}</h5>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="mt-12 pt-6">
            <div className="mb-12 relative flex flex-col bg-clip-border rounded-xl bg-white dark:bg-gray-900 text-gray-700 shadow-sm">
                <PageHeader
                    title="What our customers say about us."
                    desc="Read what our customers have to say about their experience with LinkBoss."
                />
                <div className="p-6">
                    <section className="bg-white dark:bg-gray-900">
                        <div className="grid mb-8 lg:mb-12 lg:grid-cols-3 gap-6">
                            {reviews.map((review, index) =>
                                index % 2 === 0 ? layoutOne(review, index) : layoutTwo(review, index)
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Reviews;
