import { dirname, join, relative } from 'path';
import glob from 'glob';
import { promises } from 'fs';
import json from 'json5';
import { PLUGIN_PATH } from './index';

const { readFile, stat } = promises;

interface PackageDetails {
	name: string;
	version: string;
	description: string;
	entry: string;
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

export async function discoverPlugins(): Promise<PackageDetails[]> {
	return new Promise((resolve, reject) => {
		glob(
			'*/package.json',
			{
				cwd: PLUGIN_PATH,
				realpath: true,
			},
			async (error, packageLocations) => {
				if (error) {
					reject(error);
				} else {
					const packagePromises: Array<Promise<PackageDetails>> = [];
					for (let i = 0; i < packageLocations.length; i++) {
						const packageLocation = packageLocations[i];
						packagePromises.push(discoverPlugin(packageLocation));
					}

					const plugins = await Promise.all(packagePromises);

					const pluginDirsToWatch: string[] = [];
					for (let i = 0; i < packageLocations.length; i++) {
						pluginDirsToWatch.push(dirname(packageLocations[i]));
					}

					resolve(plugins);
				}
			}
		);
	});
}

export async function discoverPlugin(packageLocation: string): Promise<PackageDetails> {
	return new Promise(async (resolve, reject) => {
		try {
			const packageDetails = json.parse(await readFile(packageLocation, 'utf8'));
			if (isPackageDetails(packageDetails) === false) {
				throw new Error(`File at ${packageLocation} is not valid json5`);
			}
			const { name, version, description, main = 'index.js' } = packageDetails;
			const packageDirectory = dirname(packageLocation);
			let entry = join(packageDirectory, main);

			// resolve entry if it points at a directory
			const stats = await stat(entry);
			if (stats.isDirectory()) entry = join(entry, 'index.js');

			const relativeEntry = join('plugins', relative(PLUGIN_PATH, entry)).replace(/\\/g, '/');

			resolve({ name, version, description, entry: relativeEntry });
		} catch(e) {
			reject(e);
		}
	})
}
