// Fixes a compatibility issue between the react-native-maps library and web environments, 
// as that library is not specifically designed to run on web without previous modifications
import chalk from 'chalk';
import { promises as fs } from 'fs';
console.log(chalk.green('here'));
function log(...args) {
  console.log(chalk.yellow('[react-native-maps]'), ...args);
}
async function reactNativeMaps() {
  log('📦 Creating web compatibility of react-native-maps using an empty module loaded on web builds');
  const modulePath = 'node_modules/react-native-maps';
  await fs.writeFile(`${modulePath}/lib/index.web.js`, 'module.exports = {}', 'utf-8');
  await fs.copyFile(`${modulePath}/lib/index.d.ts`, `${modulePath}/lib/index.web.d.ts`);
  const pkg = JSON.parse(await fs.readFile(`${modulePath}/package.json`));
  pkg['react-native'] = 'lib/index.js';
  pkg['main'] = 'lib/index.web.js';
  await fs.writeFile(`${modulePath}/package.json`, JSON.stringify(pkg, null, 2), 'utf-8');
  log('✅ script ran successfully');
}
reactNativeMaps();