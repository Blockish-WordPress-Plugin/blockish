export default function SubmenuIndicator( props ) {
	return (
		<svg
			className="blockish-navmenu-submenu-arrow"
			width="10"
			height="10"
			viewBox="0 0 32 32"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
			{ ...props }
		>
			<path d="M0 9.6c0-0.205 0.078-0.409 0.234-0.566 0.312-0.312 0.819-0.312 1.131 0l13.834 13.834 13.834-13.834c0.312-0.312 0.819-0.312 1.131 0s0.312 0.819 0 1.131l-14.4 14.4c-0.312 0.312-0.819 0.312-1.131 0l-14.4-14.4c-0.156-0.156-0.234-0.361-0.234-0.566z" />
		</svg>
	);
}
