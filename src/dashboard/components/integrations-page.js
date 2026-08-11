import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import {
	Button,
	Flex,
	FlexBlock,
	SearchControl,
	Spinner,
	Notice,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import IntegrationSetupModal from './integration-setup-modal';

const FILTERS = [
	{ key: 'all', label: __( 'All', 'blockish' ) },
	{ key: 'marketing', label: __( 'Marketing', 'blockish' ) },
	{ key: 'crm', label: __( 'CRM', 'blockish' ) },
	{ key: 'payments', label: __( 'Payments', 'blockish' ) },
	{ key: 'communication', label: __( 'Communication', 'blockish' ) },
	{ key: 'automation', label: __( 'Automation', 'blockish' ) },
	{ key: 'productivity', label: __( 'Productivity', 'blockish' ) },
	{ key: 'analytics', label: __( 'Analytics', 'blockish' ) },
	{ key: 'developer', label: __( 'Developer', 'blockish' ) },
];

function categoryLabel( key ) {
	return FILTERS.find( ( f ) => f.key === key )?.label || key;
}

function formatRelativeUpdated( iso ) {
	if ( ! iso ) {
		return '';
	}
	const then = Date.parse( iso );
	if ( Number.isNaN( then ) ) {
		return '';
	}
	const diffSec = Math.round( ( Date.now() - then ) / 1000 );
	if ( diffSec < 60 ) {
		return __( 'Updated just now', 'blockish' );
	}
	if ( diffSec < 3600 ) {
		return sprintf(
			/* translators: %d: minutes */
			__( 'Updated %d min ago', 'blockish' ),
			Math.floor( diffSec / 60 )
		);
	}
	if ( diffSec < 86400 ) {
		return sprintf(
			/* translators: %d: hours */
			__( 'Updated %d h ago', 'blockish' ),
			Math.floor( diffSec / 3600 )
		);
	}
	return sprintf(
		/* translators: %d: days */
		__( 'Updated %d d ago', 'blockish' ),
		Math.floor( diffSec / 86400 )
	);
}

export default function IntegrationsPage() {
	const [ items, setItems ] = useState( [] );
	const [ connectedCount, setConnectedCount ] = useState( 0 );
	const [ activeFilter, setActiveFilter ] = useState( 'all' );
	const [ search, setSearch ] = useState( '' );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ loadError, setLoadError ] = useState( null );
	const [ activeItem, setActiveItem ] = useState( null );

	const apiPath =
		window.blockishDashboardData?.integrationsApiPath ||
		'/blockish/v1/integrations';
	const docsUrl =
		window.blockishDashboardData?.plugin?.links?.documentation || '';
	const supportUrl =
		window.blockishDashboardData?.plugin?.links?.support || '';

	const load = useCallback( () => {
		setIsLoading( true );
		setLoadError( null );
		apiFetch( { path: apiPath } )
			.then( ( response ) => {
				setItems( Array.isArray( response?.items ) ? response.items : [] );
				setConnectedCount(
					Number( response?.connected_count ) || 0
				);
			} )
			.catch( () => {
				setLoadError(
					__(
						'Could not load integrations. Refresh and try again.',
						'blockish'
					)
				);
			} )
			.finally( () => setIsLoading( false ) );
	}, [ apiPath ] );

	useEffect( () => {
		load();
	}, [ load ] );

	const filterCounts = useMemo( () => {
		const counts = { all: items.length };
		items.forEach( ( item ) => {
			counts[ item.category ] = ( counts[ item.category ] || 0 ) + 1;
		} );
		return counts;
	}, [ items ] );

	const visibleFilters = useMemo(
		() =>
			FILTERS.filter(
				( filter ) =>
					filter.key === 'all' || ( filterCounts[ filter.key ] || 0 ) > 0
			),
		[ filterCounts ]
	);

	const filteredItems = useMemo( () => {
		const q = search.trim().toLowerCase();
		return items.filter( ( item ) => {
			if ( activeFilter !== 'all' && item.category !== activeFilter ) {
				return false;
			}
			if ( ! q ) {
				return true;
			}
			return (
				item.name.toLowerCase().includes( q ) ||
				String( item.description || '' )
					.toLowerCase()
					.includes( q ) ||
				String( item.category || '' )
					.toLowerCase()
					.includes( q )
			);
		} );
	}, [ items, activeFilter, search ] );

	const applyItem = ( nextItem ) => {
		setItems( ( prev ) => {
			const mapped = prev.map( ( item ) =>
				item.key === nextItem.key ? nextItem : item
			);
			setConnectedCount(
				mapped.filter( ( i ) => i.status === 'connected' ).length
			);
			return mapped;
		} );
		setActiveItem( nextItem );
	};

	const handleSaved = ( nextItem ) => {
		applyItem( nextItem );
	};

	const handleDisconnected = ( nextItem ) => {
		setItems( ( prev ) => {
			const mapped = prev.map( ( item ) =>
				item.key === nextItem.key ? nextItem : item
			);
			setConnectedCount(
				mapped.filter( ( i ) => i.status === 'connected' ).length
			);
			return mapped;
		} );
		setActiveItem( null );
	};

	return (
		<VStack className="blockish-integrations-page" spacing={ 5 }>
			<header className="blockish-page-header blockish-integrations-header">
				<div>
					<Heading className="blockish-heading-primary" level={ 1 }>
						{ __( 'Integrations', 'blockish' ) }
					</Heading>
					<Text className="blockish-text-muted">
						{ __(
							'Connect CRM, email, payments, and automation once — Forms and future addons reuse these connections.',
							'blockish'
						) }
					</Text>
				</div>
				{ connectedCount > 0 ? (
					<div
						className="blockish-integrations-stat"
						aria-live="polite"
					>
						<span className="blockish-integrations-stat__value">
							{ connectedCount }
						</span>
						<span className="blockish-integrations-stat__label">
							{ connectedCount === 1
								? __( 'connected', 'blockish' )
								: __( 'connected', 'blockish' ) }
						</span>
					</div>
				) : null }
			</header>

			<section className="blockish-panel blockish-block-controls">
				<Flex
					className="blockish-block-controls-top"
					justify="space-between"
					align="center"
				>
					<FlexBlock className="blockish-block-search-wrap">
						<SearchControl
							placeholder={ __(
								'Search integrations…',
								'blockish'
							) }
							value={ search }
							onChange={ setSearch }
						/>
					</FlexBlock>
				</Flex>

				<HStack
					className="blockish-category-filter"
					justify="flex-start"
				>
					{ visibleFilters.map( ( filter ) => (
						<Button
							key={ filter.key }
							className={ `blockish-filter-button blockish-button-base ${
								activeFilter === filter.key ? 'is-active' : ''
							}` }
							variant="tertiary"
							onClick={ () => setActiveFilter( filter.key ) }
						>
							{ filter.label }
						</Button>
					) ) }
				</HStack>
			</section>

			{ loadError ? (
				<Notice status="error" isDismissible={ false }>
					{ loadError }{ ' ' }
					<Button variant="link" onClick={ load }>
						{ __( 'Retry', 'blockish' ) }
					</Button>
				</Notice>
			) : null }

			{ isLoading ? (
				<div className="blockish-integrations-loading">
					<Spinner />
					<Text>{ __( 'Loading integrations…', 'blockish' ) }</Text>
				</div>
			) : filteredItems.length === 0 ? (
				<section className="blockish-integrations-empty">
					<Heading level={ 3 }>
						{ __( 'No integrations match', 'blockish' ) }
					</Heading>
					<Text className="blockish-text-muted">
						{ __(
							'Try another filter or clear your search.',
							'blockish'
						) }
					</Text>
					<Button
						variant="secondary"
						onClick={ () => {
							setSearch( '' );
							setActiveFilter( 'all' );
						} }
					>
						{ __( 'Reset filters', 'blockish' ) }
					</Button>
				</section>
			) : (
				<div className="blockish-integrations-grid">
					{ filteredItems.map( ( item ) => {
						const isConnected = item.status === 'connected';
						const updated = formatRelativeUpdated(
							item.updated_at || item.connected_at
						);
						return (
							<section
								key={ item.key }
								className={ `blockish-integration-card ${
									isConnected ? 'is-connected' : ''
								}` }
							>
								<div className="blockish-integration-head">
									<span
										className="blockish-integration-icon"
										aria-hidden="true"
									>
										{ item.icon || item.initials || '🔌' }
									</span>
									<div className="blockish-integration-head__copy">
										<Heading
											className="blockish-heading-secondary blockish-integration-title"
											level={ 3 }
										>
											{ item.name }
										</Heading>
										<Text className="blockish-text-muted blockish-integration-category">
											{ categoryLabel( item.category ) }
										</Text>
									</div>
									{ isConnected ? (
										<span className="blockish-integration-badge">
											{ __( 'Connected', 'blockish' ) }
										</span>
									) : null }
								</div>

								<Text className="blockish-text-muted blockish-integration-description">
									{ item.description }
								</Text>

								{ updated ? (
									<Text className="blockish-integration-meta">
										{ updated }
									</Text>
								) : null }

								<div className="blockish-integration-actions">
									<Button
										className={ `blockish-action-button blockish-button-base ${
											isConnected
												? 'is-secondary blockish-button-secondary'
												: 'is-primary blockish-button-primary'
										}` }
										variant={
											isConnected
												? 'secondary'
												: 'primary'
										}
										onClick={ () => setActiveItem( item ) }
									>
										{ isConnected
											? __( 'Configure', 'blockish' )
											: __( 'Connect', 'blockish' ) }
									</Button>
								</div>
							</section>
						);
					} ) }
				</div>
			) }

			<section className="blockish-integrations-help">
				<Heading className="blockish-heading-secondary" level={ 3 }>
					{ __( 'How this works', 'blockish' ) }
				</Heading>
				<Text className="blockish-text-muted">
					{ __(
						'Save provider keys here once. Enable each service per form from Form settings when you are ready to sync submissions.',
						'blockish'
					) }
				</Text>
				{ docsUrl || supportUrl ? (
					<div className="blockish-integrations-help-links">
						{ docsUrl ? (
							<a
								href={ docsUrl }
								className="blockish-integrations-help-link"
								target="_blank"
								rel="noopener noreferrer"
							>
								{ __( 'Documentation', 'blockish' ) }
							</a>
						) : null }
					</div>
				) : null }
			</section>

			{ activeItem ? (
				<IntegrationSetupModal
					item={ activeItem }
					onClose={ () => setActiveItem( null ) }
					onSaved={ handleSaved }
					onDisconnected={ handleDisconnected }
				/>
			) : null }
		</VStack>
	);
}
