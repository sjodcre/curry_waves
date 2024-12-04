// import styled from 'styled-components';


// export const STYLING = {
// 	cutoffs: {
// 		desktop: '1200px',
// 		initial: '1024px',
// 		max: '1440px',
// 		tablet: '840px',
// 		tabletSecondary: '768px',
// 		secondary: '540px',
// 	},
// 	dimensions: {
// 		button: {
// 			height: '32.5px',
// 			width: 'fit-content',
// 		},
// 		borderRadiusField: '5px',
// 		borderRadiusWrapper: '10px',
// 		form: {
// 			small: '45px',
// 			max: '47.5px',
// 		},
// 		nav: {
// 			height: '75px',
// 		},
// 		radius: {
// 			primary: '10px',
// 			alt1: '15px',
// 			alt2: '5px',
// 			alt3: '2.5px',
// 		},
// 	},
// };

// export const Wrapper = styled.div``;

// export const Header = styled.div`
// 	display: flex;
// 	justify-content: space-between;
// 	flex-wrap: wrap;
// 	gap: 15px;
// 	h4 {
// 		color: ${(props) => props.theme.colors.font.primary};
// 		font-size: clamp(18px, 3.25vw, 24px);
// 		font-weight: ${(props) => props.theme.typography.weight.xBold};
// 		line-height: 1.5;
// 	}
// `;

// export const Body = styled.div`
// 	display: flex;
// 	justify-content: center;
// 	flex-wrap: wrap;
// 	gap: 10px;
// 	padding: 20px;
// `;

// export const Form = styled.div`
// 	height: fit-content;
// 	width: 100%;
// 	textarea {
// 		height: 280px !important;
// 	}
// 	@media (max-width: calc(${STYLING.cutoffs.initial} + 105px)) {
// 		min-width: 0;
// 		width: 100%;
// 		flex: none;
// 	}
// `;

// export const TForm = styled.div`
// 	margin: 20px 0 30px 0;
// 	> * {
// 		&:last-child {
// 			margin: 20px 0 0 0;
// 		}
// 	}
// `;

// export const PWrapper = styled.div`
// 	height: fit-content;
// 	min-width: 500px;
// 	width: calc(50% - 20px);
// 	flex: 1;
// 	input {
// 		display: none;
// 	}
// 	@media (max-width: ${STYLING.cutoffs.initial}) {
// 		min-width: 0;
// 		width: 100%;
// 		flex: none;
// 	}
// `;

// export const CWrapper = styled.div`
// 	display: flex;
// 	align-items: center;
// 	span {
// 		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
// 		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
// 		display: block;
// 		max-width: 75%;
// 		white-space: nowrap;
// 		overflow: hidden;
// 		text-overflow: ellipsis;
// 	}

// 	.c-wrapper-checkbox {
// 		margin: 4.5px 0 0 7.5px;
// 	}
// `;

// export const BWrapper = styled.div`
// 	width: 100%;
// 	position: relative;
// `;

// export const BInput = styled.button<{ hasBanner: boolean }>`
// 	height: 200px;
// 	width: 100%;
// 	background: ${(props) => props.theme.colors.container.primary.active};
// 	border: ${(props) => (props.hasBanner ? `none` : `1px dashed ${props.theme.colors.border.alt2}`)};
// 	border-radius: ${STYLING.dimensions.radius.primary};
// 	overflow: hidden;
// 	span {
// 		color: ${(props) => props.theme.colors.font.alt1};
// 		font-size: ${(props) => props.theme.typography.size.xSmall};
// 		font-weight: ${(props) => props.theme.typography.weight.bold};
// 	}
// 	svg {
// 		height: 35px;
// 		width: 35px;
// 		margin: 0 0 10px 0;
// 		stroke: ${(props) => props.theme.colors.font.alt1};
// 	}
// 	img {
// 		height: 200px;
// 		width: 100%;
// 		object-fit: cover;
// 	}
// 	&:hover {
// 		border: 1px dashed ${(props) => props.theme.colors.border.alt2};
// 		background: ${(props) => props.theme.colors.container.alt1.background};
// 		span {
// 			color: ${(props) => props.theme.colors.font.primary};
// 		}
// 		svg {
// 			stroke: ${(props) => props.theme.colors.font.primary};
// 		}
// 	}
// 	&:focus {
// 		opacity: 1;
// 	}
// 	&:disabled {
// 		background: ${(props) => props.theme.colors.button.primary.disabled.background};
// 		border: 1px dashed ${(props) => props.theme.colors.button.primary.disabled.border};
// 		span {
// 			color: ${(props) => props.theme.colors.button.primary.disabled.color};
// 		}
// 		svg {
// 			stroke: ${(props) => props.theme.colors.button.primary.disabled.color};
// 			g {
// 				.svg-primary-fill {
// 					fill: ${(props) => props.theme.colors.button.primary.disabled.color};
// 				}
// 			}
// 		}
// 	}
// 	${(props) =>
// 		props.hasBanner && !props.disabled
// 			? `
//         pointer-events: all;
//         ::after {
//             content: "";
//             position: absolute;
//             height: 200px;
//             width: 100%;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             background-color: ${props.theme.colors.overlay.alt1};
// 			border-radius: ${STYLING.dimensions.radius.primary};
//             opacity: 0;
//             transition: all 100ms;
//         }
        
//         &:hover::after {
//             opacity: 1;
//         }
//         &:focus::after {
//             opacity: 1;
//         }
//         &:hover {
//             cursor: pointer;
//             border: none;
//         }
//     `
// 			: ''}
// `;

// export const AInput = styled.button<{ hasAvatar: boolean }>`
// 	height: 115px;
// 	width: 115px;
// 	background: ${(props) => props.theme.colors.container.primary.active};
// 	border: ${(props) => (props.hasAvatar ? `none` : `1px dashed ${props.theme.colors.border.alt2}`)};
// 	border-radius: 50%;
// 	position: absolute;
// 	bottom: -55px;
// 	left: 20px;
// 	z-index: 1;
// 	overflow: hidden;
// 	span {
// 		color: ${(props) => props.theme.colors.font.alt1};
// 		font-size: ${(props) => props.theme.typography.size.xxxSmall};
// 		font-weight: ${(props) => props.theme.typography.weight.bold};
// 	}
// 	svg {
// 		height: 25px;
// 		width: 25px;
// 		margin: 0 0 5px 0;
// 		color: ${(props) => props.theme.colors.font.alt1};
// 	}
// 	img {
// 		height: 100%;
// 		width: 100%;
// 		border-radius: 50%;
// 		object-fit: cover;
// 	}
// 	&:hover {
// 		border: 1px dashed ${(props) => props.theme.colors.border.alt2};
// 		background: ${(props) => props.theme.colors.container.alt1.background};
// 		span {
// 			color: ${(props) => props.theme.colors.font.primary};
// 		}
// 		svg {
// 			color: ${(props) => props.theme.colors.font.primary};
// 		}
// 	}
// 	&:focus {
// 		opacity: 1;
// 	}
// 	&:disabled {
// 		background: ${(props) => props.theme.colors.button.primary.disabled.background};
// 		border: 1px dashed ${(props) => props.theme.colors.button.primary.disabled.border};
// 		span {
// 			color: ${(props) => props.theme.colors.button.primary.disabled.color};
// 		}
// 		svg {
// 			color: ${(props) => props.theme.colors.button.primary.disabled.color};
// 		}
// 	}
// 	${(props) =>
// 		props.hasAvatar && !props.disabled
// 			? `
//         pointer-events: all;
//         ::after {
//             content: "";
//             position: absolute;
//             height: 100%;
//             width: 100%;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             background-color: ${props.theme.colors.overlay.alt1};
// 			border-radius: ${STYLING.dimensions.radius.primary};
//             opacity: 0;
//             transition: all 100ms;
//         }
//         &:hover::after {
//             opacity: 1;
//         }
//         &:focus::after {
//             opacity: 1;
//         }
//         &:hover {
//             cursor: pointer;
//             border: none;
//         }
//     `
// 			: ''}
// `;

// export const PActions = styled.div`
// 	margin: 20px 0 0 0;
// 	display: flex;
// 	justify-content: flex-end;
// 	flex-wrap: wrap;
// 	gap: 15px;
// 	@media (max-width: ${STYLING.cutoffs.secondary}) {
// 		margin: 80px 0 0 0;
// 	}
// `;

// export const PInfoMessage = styled.div`
// 	margin: 15px 0 0 0;
// 	display: flex;
// 	justify-content: flex-end;
// 	span {
// 		color: ${(props) => props.theme.colors.font.alt1};
// 		font-size: ${(props) => props.theme.typography.size.xSmall};
// 		font-weight: ${(props) => props.theme.typography.weight.medium};
// 		line-height: 1.5;
// 	}
// `;

// export const SAction = styled.div`
// 	width: 100%;
// 	display: flex;
// 	justify-content: flex-end;
// 	align-items: center;
// 	flex-wrap: wrap;
// 	gap: 15px;
// 	position: relative;
// `;

// export const Message = styled.div`
// 	position: absolute;
// 	left: 0;
// 	span {
// 		color: ${(props) => props.theme.colors.font.primary};
// 		font-family: ${(props) => props.theme.typography.family.alt1};
// 		font-size: ${(props) => props.theme.typography.size.small};
// 		font-weight: ${(props) => props.theme.typography.weight.bold};
// 		line-height: 1.5;
// 	}
// `;

// export const MWrapper = styled.div`
// 	padding: 0 20px 20px 20px;
// `;

// export const MInfo = styled.div`
// 	margin: 0 0 20px 0;
// 	span {
// 		color: ${(props) => props.theme.colors.font.primary};
// 		font-size: ${(props) => props.theme.typography.size.small};
// 		font-weight: ${(props) => props.theme.typography.weight.medium};
// 		line-height: 1.5;
// 	}
// `;

// export const MActions = styled.div`
// 	margin: 10px 0 0 0;
// 	display: flex;
// 	justify-content: flex-end;
// 	flex-wrap: wrap;
// 	gap: 15px;
// `;

// export const MInfoWrapper = styled.div`
// 	width: fit-content;
// 	margin: 20px 0 0 auto;
// 	span {
// 		background: ${(props) => props.theme.colors.warning.primary};
// 		color: ${(props) => props.theme.colors.font.light1};
// 		font-size: ${(props) => props.theme.typography.size.xxSmall};
// 		font-weight: ${(props) => props.theme.typography.weight.bold};
// 		border-radius: ${STYLING.dimensions.radius.alt2};
// 		text-align: center;
// 		display: block;
// 		padding: 2.5px 12.5px;
// 		margin: 0 0 7.5px 0;
// 	}
// `;
