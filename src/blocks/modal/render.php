<?php
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound

defined( 'ABSPATH' ) || exit;

use Blockish\Core\Utilities;

$show_trigger          = $attributes['showTrigger'] ?? true;
$trigger_text          = $attributes['triggerText'] ?? __( 'Open Modal', 'blockish' );
$trigger_icon_svg      = Utilities::render_icon( $attributes['triggerIcon'] ?? array() );
$trigger_icon_position = ( isset( $attributes['triggerIconPosition'] ) && 'right' === $attributes['triggerIconPosition'] ) ? 'right' : 'left';
$trigger_align         = $attributes['triggerAlign'] ?? 'left';
$trigger_selector      = trim( (string) ( $attributes['triggerSelector'] ?? '' ) );

$show_header       = $attributes['showHeader'] ?? true;
$modal_title       = $attributes['modalTitle'] ?? __( 'Modal Title', 'blockish' );
$show_close        = $attributes['showCloseButton'] ?? true;
$modal_position    = $attributes['modalPosition'] ?? 'center';
$modal_animation   = $attributes['modalAnimation'] ?? 'scale';
$close_on_overlay  = $attributes['closeOnOverlay'] ?? true;
$close_on_esc      = $attributes['closeOnEsc'] ?? true;
$lock_scroll       = $attributes['lockScroll'] ?? true;

$dialog_id = 'blockish-modal-dialog-' . wp_unique_id();
$title_id  = $dialog_id . '-title';

$wrapper_classes = array(
	'blockish-modal',
	'modal-pos-' . sanitize_html_class( $modal_position ),
	'modal-anim-' . sanitize_html_class( $modal_animation ),
	'trigger-align-' . sanitize_html_class( $trigger_align ),
);

$wrapper_args = array(
	'class'                 => implode( ' ', $wrapper_classes ),
	'data-close-on-overlay' => $close_on_overlay ? 'true' : 'false',
	'data-close-on-esc'     => $close_on_esc ? 'true' : 'false',
	'data-lock-scroll'      => $lock_scroll ? 'true' : 'false',
);

if ( '' !== $trigger_selector ) {
	$wrapper_args['data-trigger-selector'] = $trigger_selector;
}

$wrapper_attrs = get_block_wrapper_attributes( $wrapper_args );
$icon_html     = $trigger_icon_svg
	? '<span class="blockish-modal-trigger-icon" aria-hidden="true">' . $trigger_icon_svg . '</span>'
	: '';
?>
<div <?php echo $wrapper_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php if ( $show_trigger ) : ?>
		<div class="blockish-modal-trigger-wrap">
			<button
				type="button"
				class="blockish-modal-trigger"
				aria-haspopup="dialog"
				aria-expanded="false"
				aria-controls="<?php echo esc_attr( $dialog_id ); ?>"
			>
				<?php if ( 'right' !== $trigger_icon_position ) : ?>
					<?php echo $icon_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized in render_icon ?>
				<?php endif; ?>
				<span class="blockish-modal-trigger-label"><?php echo esc_html( $trigger_text ); ?></span>
				<?php if ( 'right' === $trigger_icon_position ) : ?>
					<?php echo $icon_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized in render_icon ?>
				<?php endif; ?>
			</button>
		</div>
	<?php endif; ?>

	<div class="blockish-modal-backdrop" hidden>
		<div class="blockish-modal-overlay" aria-hidden="true"></div>
		<div
			id="<?php echo esc_attr( $dialog_id ); ?>"
			class="blockish-modal-dialog"
			role="dialog"
			aria-modal="true"
			<?php if ( $show_header && '' !== trim( (string) $modal_title ) ) : ?>
				aria-labelledby="<?php echo esc_attr( $title_id ); ?>"
			<?php else : ?>
				aria-label="<?php echo esc_attr( '' !== trim( (string) $modal_title ) ? $modal_title : __( 'Modal dialog', 'blockish' ) ); ?>"
			<?php endif; ?>
			tabindex="-1"
		>
			<?php if ( $show_header || $show_close ) : ?>
				<div class="blockish-modal-header">
					<?php if ( $show_header ) : ?>
						<h2 id="<?php echo esc_attr( $title_id ); ?>" class="blockish-modal-title">
							<?php echo esc_html( $modal_title ); ?>
						</h2>
					<?php else : ?>
						<span></span>
					<?php endif; ?>
					<?php if ( $show_close ) : ?>
						<button
							type="button"
							class="blockish-modal-close"
							aria-label="<?php esc_attr_e( 'Close modal', 'blockish' ); ?>"
						>
							&times;
						</button>
					<?php endif; ?>
				</div>
			<?php endif; ?>

			<div class="blockish-modal-body">
				<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		</div>
	</div>
</div>

