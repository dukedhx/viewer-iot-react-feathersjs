process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// prevent `react-scripts` from checking for the existence of `public/index.html`
const checkRequiredFilesPath = 'react-dev-utils/checkRequiredFiles';
require(checkRequiredFilesPath);
require.cache[require.resolve(checkRequiredFilesPath)].exports = () => true;
// run original script
if(process.argv[2]=='build'){
const fs = require('fs');
!fs.existsSync('./public') && fs.mkdirSync('./public');
require('react-app-rewired/scripts/build');
}
else require('react-app-rewired/scripts/start');
