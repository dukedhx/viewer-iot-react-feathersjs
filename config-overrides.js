const HtmlWebpackPlugin = require('html-webpack-plugin')

const replacePlugin = (plugins, nameMatcher, newPlugin) => {
  const pluginIndex = plugins.findIndex((plugin) => {
    return plugin.constructor && plugin.constructor.name && nameMatcher(plugin.constructor.name);
  });

  if (pluginIndex === -1) {
    return plugins;
  }

  const nextPlugins = plugins.slice(0, pluginIndex).concat(newPlugin).concat(plugins.slice(pluginIndex + 1));
  return nextPlugins;
};
module.exports = function override(config, env) {
  //do stuff with the webpack config...
 config.plugins= replacePlugin(config.plugins, (name) => /HtmlWebpackPlugin/i.test(name), new HtmlWebpackPlugin({
    inject: false,
  templateContent: ({htmlWebpackPlugin}) => `
    <html>
    <head>
        ${htmlWebpackPlugin.tags.headTags}
      </head>
      <body>
      <div id='root'></div>
      <div id='root2'></div>
        ${htmlWebpackPlugin.tags.bodyTags}
      </body>
    </html>
  `
}));
  return config;
}
