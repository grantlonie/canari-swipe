import { CSSProperties } from 'react'

export enum FontSize {
	xs = '0.79rem',
	sm = '0.889rem',
	md = '1rem',
	lg = '1.125rem',
	xl = '1.266rem',
	xxl = '1.424rem',
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
	fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', sans-serif",
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

export function convertSx(sx?: SxProp): any {
	if (!sx) return

	const { m, mx, my, ml, mr, mt, mb, p, px, py, pl, pr, pt, pb, ...vanillaCss } = sx

	let gap = applySpacing(sx.gap)
	let margin = sx.margin || applySpacing(m)
	let marginTop = sx.marginTop || applySpacing(mt) || applySpacing(my)
	let marginBottom = sx.marginBottom || applySpacing(mb) || applySpacing(my)
	let marginLeft = sx.marginLeft || applySpacing(ml) || applySpacing(mx)
	let marginRight = sx.marginRight || applySpacing(mr) || applySpacing(mx)
	let padding = sx.padding || applySpacing(p)
	let paddingTop = sx.paddingTop || applySpacing(pt) || applySpacing(py)
	let paddingBottom = sx.paddingBottom || applySpacing(pb) || applySpacing(py)
	let paddingLeft = sx.paddingLeft || applySpacing(pl) || applySpacing(px)
	let paddingRight = sx.paddingRight || applySpacing(pr) || applySpacing(px)

	return {
		...vanillaCss,
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
