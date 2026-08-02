import type { ReactElement } from 'react'

declare module '*.mdx' {
	let MDXComponent: (props: any) => ReactElement
	export default MDXComponent
}
