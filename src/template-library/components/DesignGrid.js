import { useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { parse } from '@wordpress/blocks';
import { useDispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { useTemplateLibrary } from '../context';
import { fetchDesignWithDependencies, installDependenciesAndRemap } from '../resolve-design';

/**
 * Resolve package gate for a design.
 *
 * @param {object} design
 * @return {{ locked: boolean, reason?: string, packageKey?: string }}
 */
function getPackageGate(design) {
	const packages = window.blockishTemplateLibraryData?.packages || {};
	const raw = String(design?.package_name || '')
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-');

	if (!raw || raw === 'blockish' || raw === 'core' || raw === 'free') {
		return { locked: false };
	}

	const entries = Object.entries(packages);
	const match = entries.find(([key, pkg]) => {
		const aliases = [key, ...(pkg.aliases || [])].map((a) =>
			String(a)
				.toLowerCase()
				.replace(/\s+/g, '-')
		);
		return aliases.includes(raw) || raw.includes(key) || key.includes(raw);
	});

	if (!match) {
		// Unknown package — allow insert (core-compatible).
		return { locked: false };
	}

	const [packageKey, pkg] = match;
	if (!pkg.installed) {
		return {
			locked: true,
			packageKey,
			reason: 'missing',
			label: pkg.label || packageKey,
		};
	}
	if (pkg.requires_license && !pkg.licensed) {
		return {
			locked: true,
			packageKey,
			reason: 'unlicensed',
			label: pkg.label || packageKey,
		};
	}

	return { locked: false, packageKey };
}

function goToAddons() {
	const url = window.blockishTemplateLibraryData?.addonsUrl;
	if (url) {
		window.open(url, '_blank', 'noopener,noreferrer');
	}
}

const insertDesign = async (design, insertBlocks, onClose, setBusyId, setError) => {
	const gate = getPackageGate(design);
	if (gate.locked) {
		goToAddons();
		setError(
			sprintf(
				/* translators: %s: addon name */
				__('Activate %s from the Addons page to use this template.', 'blockish'),
				gate.label || gate.packageKey
			)
		);
		return;
	}

	setBusyId(design.id);
	setError(null);

	try {
		const full = await fetchDesignWithDependencies(design.id);
		const remappedContent = await installDependenciesAndRemap(full, { apiFetch });
		const blocks = parse(remappedContent);
		if (blocks && blocks.length > 0) {
			insertBlocks(blocks);
			if (onClose) {
				onClose();
			}
		}
	} catch (error) {
		if (error?.code === 'FORMS_REQUIRED' || error?.message === 'FORMS_REQUIRED') {
			goToAddons();
			setError(
				__('Blockish Forms is required for this template. Open Addons to install or activate it.', 'blockish')
			);
		} else {
			console.error(error);
			setError(error?.message || __('Failed to insert template.', 'blockish'));
		}
	} finally {
		setBusyId(null);
	}
};

const PatternCard = ({ design, insertBlocks, onClose, busyId, setBusyId, setError }) => {
	const gate = getPackageGate(design);
	const isBusy = busyId === design.id;

	return (
		<div className={`blockish-template-library-card ${gate.locked ? 'is-locked' : ''}`}>
			<div className="card-image-area">
				<div className="card-overlay">
					<button
						className="insert-button"
						disabled={Boolean(busyId)}
						onClick={() => insertDesign(design, insertBlocks, onClose, setBusyId, setError)}
					>
						{isBusy
							? __('Inserting…', 'blockish')
							: gate.locked
								? __('Get Addon', 'blockish')
								: __('Insert', 'blockish')}
					</button>
				</div>
				{design.featured_image ? (
					<img src={design.featured_image} alt={design.title || 'Design'} className="pattern-image" />
				) : (
					<div className="no-image">{__('No Image', 'blockish')}</div>
				)}
				{design.package_name && <span className="badge">{design.package_name}</span>}
				{gate.locked && <span className="lock-badge">{__('Pro', 'blockish')}</span>}
			</div>
			<div className="card-content">
				<h4>{design.title || __('Untitled', 'blockish')}</h4>
			</div>
		</div>
	);
};

const PageCard = ({ design, insertBlocks, onClose, busyId, setBusyId, setError }) => {
	const gate = getPackageGate(design);
	const isBusy = busyId === design.id;

	return (
		<div className={`blockish-template-library-card is-page-card ${gate.locked ? 'is-locked' : ''}`}>
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
							<div className="no-image">{__('No Image', 'blockish')}</div>
						)}
					</div>
				</div>
				{design.package_name && <span className="badge">{design.package_name}</span>}
				{gate.locked && <span className="lock-badge">{__('Pro', 'blockish')}</span>}
			</div>
			<div className="card-content page-card-content">
				<h4>{design.title || __('Untitled', 'blockish')}</h4>
				<button
					className="insert-button inline"
					disabled={Boolean(busyId)}
					onClick={() => insertDesign(design, insertBlocks, onClose, setBusyId, setError)}
				>
					{isBusy
						? __('Inserting…', 'blockish')
						: gate.locked
							? __('Get Addon', 'blockish')
							: __('Insert', 'blockish')}
				</button>
			</div>
		</div>
	);
};

const DesignCard = (props) => {
	if (props.activeTab === 'Pages') {
		return <PageCard {...props} />;
	}
	return <PatternCard {...props} />;
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
	const { insertBlocks } = useDispatch('core/block-editor');
	const loaderRef = useRef(null);
	const [busyId, setBusyId] = useState(null);
	const [error, setError] = useState(null);

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
			{error && (
				<div className="blockish-template-library-error" role="alert">
					<span>{error}</span>
					<button type="button" onClick={() => setError(null)}>
						{__('Dismiss', 'blockish')}
					</button>
				</div>
			)}
			{designs.length === 0 && !isLoading ? (
				<div className="empty-state">
					<p>{__('No designs found.', 'blockish')}</p>
				</div>
			) : (
				<div className="grid">
					{designs.map((design) => (
						<DesignCard
							key={design.id}
							design={design}
							activeTab={activeTab}
							insertBlocks={insertBlocks}
							onClose={onClose}
							busyId={busyId}
							setBusyId={setBusyId}
							setError={setError}
						/>
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

			<div ref={loaderRef} style={{ height: '20px', width: '100%' }}></div>
		</div>
	);
};

export default DesignGrid;
