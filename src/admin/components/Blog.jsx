import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from "@wordpress/i18n";

const Blog = () => {
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [blogsPerPage] = useState(6);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const cachedBlogs = localStorage.getItem('linkboss_blogs');
                if (cachedBlogs) {
                    setBlogs(JSON.parse(cachedBlogs));
                    setLoading(false);
                } else {
                    const response = await axios.get('https://linkboss.io/feed/');
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(response.data.contents, 'text/xml');
                    const items = Array.from(xml.querySelectorAll('item')).map(item => ({
                        title: item.querySelector('title').textContent,
                        link: item.querySelector('link').textContent,
                        description: item.querySelector('description').textContent,
                        pubDate: item.querySelector('pubDate').textContent,
                        thumbnail: item.querySelector('media\\:thumbnail')?.getAttribute('url') || '/default-thumbnail.jpg'
                    }));
                    setBlogs(items);
                    localStorage.setItem('linkboss_blogs', JSON.stringify(items));
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setError(true);
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="text-center">{__('Loading', 'semantic-linkboss')}...</div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500">
                {__('No internet connection. Please check your connection and try again.', 'semantic-linkboss')}
            </div>
        );
    }

    return (
        <div className="mt-12 pt-6">
            <div className="mb-12 relative flex flex-col bg-clip-border rounded-xl bg-white dark:bg-gray-900 text-gray-700 shadow-sm">
                <div className="relative bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-blue-500/40 shadow-lg -mt-12 mb-8 p-6">
                    <div className="dc-insights-table-header flex w-full items-center justify-between">
                        <div>
                            <h6 className="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-white mt-0 mb-1">
                                Blog
                            </h6>
                            <div className="block antialiased font-sans text-md font-normal dark:text-gray-300">
                                Blog your data with the LinkBoss App.
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {currentBlogs.map((blog, index) => (
                            <div key={index} className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                <a href={blog.link} target="_blank" rel="noopener noreferrer">
                                    <img className="rounded-t-lg" src={blog.thumbnail} alt={blog.title} />
                                </a>
                                <div className="p-5">
                                    <a href={blog.link} target="_blank" rel="noopener noreferrer">
                                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{blog.title}</h5>
                                    </a>
                                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{blog.description}</p>
                                    <a href={blog.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-blue-800">
                                        Read more
                                        <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center mt-6">
                        <nav>
                            <ul className="inline-flex items-center -space-x-px">
                                {Array.from({ length: Math.ceil(blogs.length / blogsPerPage) }, (_, index) => (
                                    <li key={index}>
                                        <button
                                            onClick={() => paginate(index + 1)}
                                            className={`px-3 py-2 leading-tight ${currentPage === index + 1 ? 'text-blue-600 bg-blue-50' : 'text-gray-500 bg-white'} border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
                                        >
                                            {index + 1}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blog;