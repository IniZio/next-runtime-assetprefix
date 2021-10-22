/** @type {import('next').NextConfig} */

const withPlugins = require("next-compose-plugins");
const optimizedImages = require('next-optimized-images');

module.exports = withPlugins([
  [optimizedImages, {
    inlineImageLimit: -1,
    optimizeImages: false,
  }]
],{
  reactStrictMode: true,
  assetPrefix: 'NEXT_ASSET_PREFIX_CDN_URL_REPLACE_ME',
  images: {
    // To avoid collision between next-optimized-images and nextjs's own implementation
    disableStaticImages: true,
  },
  webpack: (config, { isServer }) => {
    // FIXME: Fixes images imported in scss not loaded
    // https://github.com/cyrilwanner/next-optimized-images/issues/177
    // https://github.com/cyrilwanner/next-optimized-images/pull/247
    if (!isServer) {
      config.module.rules.forEach((rule) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((subRule) => {
            if (
              subRule.issuer && !subRule.test && !subRule.include && subRule.exclude
              && subRule.use && subRule.use.options && subRule.use.options.name
            ) {
              if (
                (
                  String(subRule.issuer.test) === '/\\.(css|scss|sass)$/' ||
                  String(subRule.issuer) === '/\\.(css|scss|sass)$/' ||
                  String(subRule.issuer) === '/\\.(css|scss|sass)(\\.webpack\\[javascript\\/auto\\])?$/'
                ) && subRule.use.options.name.startsWith('static/media/')
              ) {
                subRule.exclude.push(/\.(jpg|jpeg|png|svg|webp|gif|ico)$/);
              }
            }
          });
        }
      });
    }

    return config
  }
})
