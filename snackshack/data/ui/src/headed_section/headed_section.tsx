import React, { createContext, useContext } from 'react';
const HeadingContext = createContext<null | 'h1' | 'h2' | 'h3' | 'h4'| 'h5' | 'h6'>(null);

const fontSizeMap = {
	h1: '1.7rem',
	h2: '1.6rem',
	h3: '1.5rem',
	h4: '1.4rem',
	h5: '1.3rem',
	h6: '1.2rem',
}

export default () => {
	const HeadedSection: App.Plugins['ui']['headedSection'] = ({ title, children, ...rest }) => {
		const parentLevel = useContext(HeadingContext);
		const Level = parentLevel === null ? 'h1'
			: parentLevel === 'h1' ? 'h2'
			: parentLevel === 'h2' ? 'h3'
			: parentLevel === 'h3' ? 'h4'
			: parentLevel === 'h4' ? 'h5'
			: 'h6';

		return (
			<HeadingContext.Provider value={Level}>
				<section>
					<Level {...rest} css={{ marginBottom: '25px', fontSize: fontSizeMap[Level] }}>{title}</Level>
					{children}
				</section>
			</HeadingContext.Provider>
		);
	};
	return HeadedSection;
}
