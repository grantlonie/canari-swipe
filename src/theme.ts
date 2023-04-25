import { CSSProperties } from 'react'

export const fontSizes = {
	xsmall: '0.79rem',
	small: '0.889rem',
	medium: '1rem',
	large: '1.125rem',
	xlarge: '1.266rem',
	xxlarge: '1.424rem',
}

const white = '#fff'
const black = '#111'

const palette = {
	common: {
		black,
		white,
	},
	primary: {
		main: '#0070F3',
		light: '#146DD6',
		contrastText: white,
	},
	error: {
		main: '#A51C30',
		light: '#A7333F',
		contrastText: white,
	},
	grey: {
		100: '#EAEAEA',
		200: '#C9C5C5',
		300: '#888',
		400: '#666',
	},
}

const shadows = {
	0: 'none',
	1: '0px 5px 10px rgba(0, 0, 0, 0.12)',
	2: '0px 8px 30px rgba(0, 0, 0, 0.24)',
}

const typography = {
	fontFamily:
		"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', sans-serif",
}

const shape = {
	borderRadius: applySpacing(0.5),
}

export const theme = {
	palette,
	shadows,
	typography,
	shape,
}

/** Return value in px with spacing applied */
export function applySpacing(spacing: number | string | undefined) {
	if (spacing == null) return
	if (typeof spacing === 'string') return spacing
	return `${spacing * 8}px`
}

export interface SxProp extends CSSProperties {
	gap?: number | string
	m?: number | string
	mx?: number | string
	my?: number | string
	ml?: number | string
	mr?: number | string
	mt?: number | string
	mb?: number | string
	p?: number | string
	px?: number | string
	py?: number | string
	pl?: number | string
	pr?: number | string
	pt?: number | string
	pb?: number | string
}

export function convertSx(sxProp: SxProp): any {
	let gap = applySpacing(sxProp.gap)
	let margin = sxProp.margin || applySpacing(sxProp.m)
	let marginTop =
		sxProp.marginTop || applySpacing(sxProp.mt) || applySpacing(sxProp.my)
	let marginBottom =
		sxProp.marginBottom ||
		applySpacing(sxProp.mb) ||
		applySpacing(sxProp.my)
	let marginLeft =
		sxProp.marginLeft || applySpacing(sxProp.ml) || applySpacing(sxProp.mx)
	let marginRight =
		sxProp.marginRight || applySpacing(sxProp.mr) || applySpacing(sxProp.mx)
	let padding = sxProp.padding || applySpacing(sxProp.p)
	let paddingTop =
		sxProp.paddingTop || applySpacing(sxProp.pt) || applySpacing(sxProp.py)
	let paddingBottom =
		sxProp.paddingBottom ||
		applySpacing(sxProp.pb) ||
		applySpacing(sxProp.py)
	let paddingLeft =
		sxProp.paddingLeft || applySpacing(sxProp.pl) || applySpacing(sxProp.px)
	let paddingRight =
		sxProp.paddingRight ||
		applySpacing(sxProp.pr) ||
		applySpacing(sxProp.px)

	return {
		...sxProp,
		...(gap && { gap }),
		...(margin && { margin }),
		...(marginTop && { marginTop }),
		...(marginBottom && { marginBottom }),
		...(marginLeft && { marginLeft }),
		...(marginRight && { marginRight }),
		...(padding && { padding }),
		...(paddingTop && { paddingTop }),
		...(paddingBottom && { paddingBottom }),
		...(paddingLeft && { paddingLeft }),
		...(paddingRight && { paddingRight }),
	}
}
