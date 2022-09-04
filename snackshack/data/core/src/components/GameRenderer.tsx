import React, { useRef, useEffect } from 'react';
import { css } from '@emotion/react';
import { PluginFunctions } from 'Plugin';
import { Scene, WebGLRenderer, OrthographicCamera, PlaneBufferGeometry, Mesh, MeshBasicMaterial, Quaternion } from 'three';

function createGround(scene: Scene) {
	const grass = new Mesh(
		new PlaneBufferGeometry(50, 50),
		new MeshBasicMaterial({ color: 0x00dd00 })
	);
	grass.quaternion.set(-1, 0, 0, 1).normalize();
	scene.add(grass);

	const road = new Mesh(
		new PlaneBufferGeometry(50, 10),
		new MeshBasicMaterial({ color: 0xbbbbdd, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: 1 })
	);
	road.position.z = 20;
	road.quaternion.set(-1, 0, 0, 1).normalize();
	scene.add(road);

	const sidewalk = new Mesh(
		new PlaneBufferGeometry(50, 4),
		new MeshBasicMaterial({ color: 0xddddff, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: 1 })
	);
	sidewalk.position.z = 13;
	sidewalk.quaternion.set(-1, 0, 0, 1).normalize();
	scene.add(sidewalk);

	const path = new Mesh(
		new PlaneBufferGeometry(3, 6),
		new MeshBasicMaterial({ color: 0xeedd55, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: 1 })
	);
	path.position.z = 8;
	path.quaternion.set(-1, 0, 0, 1).normalize();
	scene.add(path);
}

export default ({ getResource, plugin, getPlugin }: PluginFunctions<'core'>) => {
	return () => {
		const canvasRef = useRef<HTMLCanvasElement>(null);

		useEffect(() => {
			const renderer = new WebGLRenderer({ canvas: canvasRef.current! });
			renderer.setClearColor(0xffffff);
			renderer.setSize(window.innerWidth, window.innerHeight);

			getPlugin('screensize').onEvent('RESIZE', ({ width, height }) => {
				renderer.setSize(width, height);
			})

			const scene = new Scene();
			const camera = new OrthographicCamera(-20, 20, 20, -20, 0.1, 2000);

			createGround(scene);

			camera.position.set(50, 50, 50);
			camera.lookAt(scene.position);

			let lastRenderTime = performance.now();
			let rafId: number | undefined = undefined;

			function logicate(span: number) {
				const isPaused = getResource(plugin.game.isPaused);
				if (!isPaused) {

				}
			}

			function animate(span: number) {

			}

			function step(now: number) {
				const timeSinceLast = now - lastRenderTime;
				lastRenderTime = now;
				rafId = requestAnimationFrame(step)
				logicate(timeSinceLast);
				animate(timeSinceLast);
				renderer.render(scene, camera);
			}
			step(performance.now());

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
