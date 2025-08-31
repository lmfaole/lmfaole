import {Config} from '@stencil/core';

export const config: Config = {
  namespace: 'pinata',
  globalStyle: 'src/global/global.css',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        {src: 'favicon.png', dest: 'favicon.ico'},
      ]
    },

  ],
  testing: {
    browserHeadless: "shell",
  },
};
