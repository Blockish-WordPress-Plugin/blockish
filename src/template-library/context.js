import { createContext, useContext, useState, useEffect, useCallback } from '@wordpress/element';


const TemplateLibraryContext = createContext();

export const useTemplateLibrary = () => useContext(TemplateLibraryContext);

export const TemplateLibraryProvider = ({ children }) => {
	const [activeTab, setActiveTab] = useState('Patterns');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedTag, setSelectedTag] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('');
	const [selectedPackage, setSelectedPackage] = useState(() => {
		const fromData = window.blockishTemplateLibraryData?.defaultPackage;
		if (window.blockishTemplateLibraryData) {
			delete window.blockishTemplateLibraryData.defaultPackage;
		}
		return fromData || 'All';
	});
	
	const [designs, setDesigns] = useState([]);
	const [tags, setTags] = useState([]);
	const [categories, setCategories] = useState([]);
	const [packages, setPackages] = useState([]);
	
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	const token = window.blockishTemplateLibraryData?.token || '';
	const apiBase = window.blockishTemplateLibraryData?.url || '';

	const fetchOptions = {
		// Removed custom header to prevent CORS preflight blocking
	};

	const fetchJson = async (baseUrl) => {
		const url = new URL(baseUrl);
		url.searchParams.append('token', token);
		const res = await fetch(url.toString(), fetchOptions);
		if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
		return res.json();
	};

	useEffect(() => {
		fetchJson(`${apiBase}/tags`).then(setTags).catch(console.error);
		fetchJson(`${apiBase}/categories`).then(setCategories).catch(console.error);
		fetchJson(`${apiBase}/packages`).then(setPackages).catch(console.error);
	}, []);

	useEffect(() => {
		setIsLoading(true);
		
		const fetchDesigns = async () => {
			try {
				const typeSlug = activeTab.toLowerCase();
				let path = `${apiBase}/designs?paged=${page}&posts_per_page=20&type=${typeSlug}`;
				
				if (searchQuery) path += `&s=${encodeURIComponent(searchQuery)}`;
				if (selectedPackage && selectedPackage !== 'All') path += `&package_name=${encodeURIComponent(selectedPackage)}`;

				
				if (typeSlug === 'patterns' && selectedTag && selectedTag !== 'All') {
					path += `&tag=${encodeURIComponent(selectedTag)}`;
				}
				if (typeSlug === 'pages' && selectedTag && selectedTag !== 'All') {
					path += `&tag=${encodeURIComponent(selectedTag)}`;
				}
				if (typeSlug === 'pages' && selectedCategory && selectedCategory !== 'All') {
					path += `&category=${encodeURIComponent(selectedCategory)}`;
				}

				const response = await fetchJson(path);
				
				if (page === 1) {
					setDesigns(response.designs);
				} else {
					setDesigns(prev => {
						// Filter out duplicates in case of strict mode or race conditions
						const existingIds = new Set(prev.map(d => d.id));
						const newDesigns = response.designs.filter(d => !existingIds.has(d.id));
						return [...prev, ...newDesigns];
					});
				}
				
				setHasMore(page < response.total_pages);
			} catch (error) {
				console.error(error);
				setHasMore(false); // Stop loading if there's an error (e.g. 403 Forbidden)
			}
			setIsLoading(false);
		};

		const timeoutId = setTimeout(() => {
			fetchDesigns();
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [activeTab, searchQuery, selectedTag, selectedCategory, selectedPackage, page, refreshKey]);

	useEffect(() => {
		setPage(1);
	}, [activeTab, searchQuery, selectedTag, selectedCategory, selectedPackage]);

	const loadMore = useCallback(() => {
		if (!isLoading && hasMore) {
			setPage(prev => prev + 1);
		}
	}, [isLoading, hasMore]);

	const refresh = useCallback(() => {
		setPage(1);
		// Force trigger fetch if page is already 1 by clearing designs
		setDesigns([]);
		setRefreshKey(prev => prev + 1);
	}, []);

	const value = {
		activeTab, setActiveTab,
		searchQuery, setSearchQuery,
		selectedTag, setSelectedTag,
		selectedCategory, setSelectedCategory,
		selectedPackage, setSelectedPackage,
		designs, tags, categories, packages,
		isLoading, hasMore, loadMore, refresh
	};

	return (
		<TemplateLibraryContext.Provider value={value}>
			{children}
		</TemplateLibraryContext.Provider>
	);
};
