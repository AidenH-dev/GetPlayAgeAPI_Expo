const { withAndroidManifest } = require('@expo/config-plugins');

const withVibration = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }
    
    manifest['uses-permission'].push({
      $: { 'android:name': 'android.permission.VIBRATE' }
    });
    
    return config;
  });
};

module.exports = withVibration;