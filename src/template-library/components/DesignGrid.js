import { useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { parse } from '@wordpress/blocks';
import { useDispatch } from '@wordpress/data';
import { useTemplateLibrary } from '../context';

const insertDesign = (design, insertBlocks, onClose) => {
	if (!design.content) return;
	
	const blocks = parse(design.content);
	if (blocks && blocks.length > 0) {
		insertBlocks(blocks);
		if (onClose) onClose();
	}
};

const PatternCard = ({ design, insertBlocks, onClose }) => (
	<div className="blockish-template-library-card">
		<div className="card-image-area">
			<div className="card-overlay">
				<button className="insert-button" onClick={() => insertDesign(design, insertBlocks, onClose)}>
					{__('Insert', 'blockish')}
				</button>
			</div>
			{design.featured_image ? (
				<img src={design.featured_image} alt={design.title || 'Design'} className="pattern-image" />
			) : (
				<div className="no-image">
					{__('No Image', 'blockish')}
				</div>
			)}
			{design.package_name && (
				<span className="badge">
					{design.package_name}
				</span>
			)}
		</div>
		<div className="card-content">
			<h4>
				{design.title || __('Untitled', 'blockish')}
			</h4>
		</div>
	</div>
);

const PageCard = ({ design, insertBlocks, onClose }) => (
	<div className="blockish-template-library-card is-page-card">
		<div className="card-image-area">

			<div className="mac-window-frame">
				<div className="mac-window-header">
					<span className="dot close"></span>
					<span className="dot minimize"></span>
					<span className="dot expand"></span>
				</div>
				<div className="mac-window-content">
					{design.featured_image ? (
						<img src={design.featured_image} alt={design.title || 'Design'} />
					) : (
						<div className="no-image">
							{__('No Image', 'blockish')}
						</div>
					)}
				</div>
			</div>
			{design.package_name && (
				<span className="badge">
					{design.package_name}
				</span>
			)}
		</div>
		<div className="card-content page-card-content">
			<h4>
				{design.title || __('Untitled', 'blockish')}
			</h4>
			<button className="insert-button inline" onClick={() => insertDesign(design, insertBlocks, onClose)}>
				{__('Insert', 'blockish')}
			</button>
		</div>
	</div>
);

const DesignCard = ({ design, activeTab, insertBlocks, onClose }) => {
	if (activeTab === 'Pages') {
		return <PageCard design={design} insertBlocks={insertBlocks} onClose={onClose} />;
	}
	return <PatternCard design={design} insertBlocks={insertBlocks} onClose={onClose} />;
};

const SkeletonCard = () => (
	<div className="blockish-template-library-card skeleton-card">
		<div className="card-image-area skeleton-bg"></div>
		<div className="card-content" style={{ display: 'flex', justifyContent: 'center' }}>
			<div className="skeleton-text skeleton-bg" style={{ width: '60%', height: '16px', borderRadius: '4px' }}></div>
		</div>
	</div>
);

const DesignGrid = ({ onClose }) => {
	const { designs, isLoading, hasMore, loadMore, activeTab } = useTemplateLibrary();
	
	// Get the insertBlocks action from the core/block-editor store
	const { insertBlocks } = useDispatch('core/block-editor');
	const loaderRef = useRef(null);

	// Infinite scroll implementation using IntersectionObserver
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoading) {
					loadMore();
				}
			},
			{ threshold: 1.0 }
		);

		if (loaderRef.current) {
			observer.observe(loaderRef.current);
		}

		return () => {
			if (loaderRef.current) {
				observer.unobserve(loaderRef.current);
			}
		};
	}, [hasMore, isLoading, loadMore]);

	return (
		<div className="blockish-template-library-grid-container">
			{designs.length === 0 && !isLoading ? (
				<div className="empty-state">
					<p>{__('No designs found.', 'blockish')}</p>
				</div>
			) : (
				<div className="grid">
					{designs.map(design => (
						<DesignCard key={design.id} design={design} activeTab={activeTab} insertBlocks={insertBlocks} onClose={onClose} />
					))}
					{isLoading && (
						<>
							<SkeletonCard />
							<SkeletonCard />
							<SkeletonCard />
							<SkeletonCard />
							<SkeletonCard />
							<SkeletonCard />
						</>
					)}
				</div>
			)}
			
			{/* Intersection Observer Target for Infinite Scroll */}
			<div ref={loaderRef} style={{ height: '20px', width: '100%' }}></div>
		</div>
	);
};

export default DesignGrid;
