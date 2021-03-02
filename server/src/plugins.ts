import { dirname, join, relative } from 'path';
import glob from 'glob';
import { promises } from 'fs';
import json from 'json5';
import { DepGraph } from 'dependency-graph';

const { readFile } = promises;

export interface PackageDetails {
	name: string;
	version: string;
	description: string;
	entry: string;
	directory: string;
	dependencies: string[];
}

function isPackageDetails(x: any): x is PackageDetails {
	if (x != null && typeof x === 'object') {
		if (x.hasOwnProperty('name') === false) return false;
		if (x.hasOwnProperty('version') === false) return false;
		if (x.hasOwnProperty('description') === false) return false;
		return true;
	}
	return false;
}

export async function discoverPlugins(pluginDirectory: string): Promise<PackageDetails[]> {
	return new Promise((resolve, reject) => {
		glob(
			'*/package.json',
			{
				cwd: pluginDirectory,
				realpath: true,
			},
			async (error, packageLocations) => {
				if (error) {
					reject(error);
				} else {
					const packagePromises: Array<Promise<PackageDetails>> = [];
					for (let i = 0; i < packageLocations.length; i++) {
						const packageLocation = packageLocations[i];
						packagePromises.push(discoverPlugin(pluginDirectory, packageLocation));
					}

					const plugins = await Promise.all(packagePromises);

					const pluginDirsToWatch: string[] = [];
					for (let i = 0; i < packageLocations.length; i++) {
						pluginDirsToWatch.push(dirname(packageLocations[i]));
					}

					// resolve dependency load order
					const pluginMap: { [key: string]: PackageDetails } = {};
					const depGraph = new DepGraph();
					for (let i = 0; i < plugins.length; i++) {
						const plugin = plugins[i];
						const { name } = plugin;
						pluginMap[name] = plugin;
						depGraph.addNode(name, plugin);
					}
					for (let i = 0; i < plugins.length; i++) {
						const plugin = plugins[i];
						const { name, dependencies } = plugin;
						for (let j = 0; j < dependencies.length; j++) {
							depGraph.addDependency(name, dependencies[j]);
						}
					}

					const pluginOrder = depGraph.overallOrder();

					resolve(pluginOrder.map(name => pluginMap[name]));
				}
			}
		);
	});
}

export async function discoverPlugin(pluginDirectory: string, packageLocation: string): Promise<PackageDetails> {
	return new Promise(async (resolve, reject) => {
		try {
			const packageDetails = json.parse(await readFile(packageLocation, 'utf8'));
			if (isPackageDetails(packageDetails) === false) {
				throw new Error(`File at ${packageLocation} is not valid json5`);
			}
			const { name, version, description, pluginDependencies } = packageDetails;
			const packageDirectory = dirname(packageLocation);

			// resolve entry if it points at a directory

			const entry = join('plugins', relative(pluginDirectory, join(packageDirectory, 'index.js'))).replace(/\\/g, '/');

			resolve({ name, version, description, entry, directory: packageDirectory, dependencies: Object.keys(pluginDependencies || {}) });
		} catch(e) {
			reject(e);
		}
	})
}
