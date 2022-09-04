/// <reference types="@emotion/react/types/css-prop" />
/// <reference types="@sagebrush/engine-client/types/insula" />
/// <reference types="@sagebrush/engine-client/types/app" />
/// <reference types="@sagebrush/plugin-ui/dist/plugin" />

import * as Three from 'three';

window.Three = Three;

window.registerPlugin('threejs', function initPlugin() {});
