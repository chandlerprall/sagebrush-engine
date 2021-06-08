import React, { useRef, useEffect } from 'react';
import { css } from '@emotion/react';
import { PluginFunctions } from 'Plugin';
import { Scene } from 'three';

export default ({ useResource, getResource, plugin }: PluginFunctions<'core'>) => {
	return () => {
		const canvasRef = useRef<HTMLCanvasElement>(null);

		useEffect(() => {
			const scene = new Scene();

			let lastRenderTime = performance.now();
			let rafId: number | undefined = undefined;
			function render(now: number) {
				const timeSinceLast = now - lastRenderTime;
				lastRenderTime = now;

				const isPaused = getResource(plugin.game.isPaused);
				if (!isPaused) {
					rafId = requestAnimationFrame(render)
				}
			}
			render(performance.now());

			return () => {
				rafId != null && cancelAnimationFrame(rafId);
			}
		}, []);

		return (
			<canvas ref={canvasRef} css={css`
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
			`} />
		);
	}
}
