import React, { ButtonHTMLAttributes, FunctionComponent } from 'react';

const Button: FunctionComponent<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
	return (
		<button {...props} />
	);
};
export default () => Button;
