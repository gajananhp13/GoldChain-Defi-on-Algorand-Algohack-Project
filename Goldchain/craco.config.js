module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const traverseAndExclude = (rules) => {
        if (!Array.isArray(rules)) return;
        for (const rule of rules) {
          if (rule && typeof rule === 'object') {
            if (
              rule.enforce === 'pre' &&
              rule.use &&
              (Array.isArray(rule.use)
                ? rule.use.some((u) => u && u.loader && u.loader.includes('source-map-loader'))
                : (rule.use.loader && rule.use.loader.includes && rule.use.loader.includes('source-map-loader')))
            ) {
              const existingExclude = rule.exclude || [];
              const walletconnectExclude = [/node_modules[\\/](?:@walletconnect)[\\/]/];
              rule.exclude = Array.isArray(existingExclude)
                ? [...existingExclude, ...walletconnectExclude]
                : [existingExclude, ...walletconnectExclude].filter(Boolean);
            }
            if (rule.oneOf) traverseAndExclude(rule.oneOf);
            if (rule.rules) traverseAndExclude(rule.rules);
          }
        }
      };

      if (webpackConfig && webpackConfig.module && webpackConfig.module.rules) {
        traverseAndExclude(webpackConfig.module.rules);
      }

      return webpackConfig;
    },
  },
}; 