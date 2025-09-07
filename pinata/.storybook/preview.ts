// Replace your-framework with the framework you are using, e.g. react-vite, nextjs, vue3-vite, etc.
import type {Preview} from '@stencil/storybook-plugin';

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        light: {name: 'Lyst', value: '#fff'},
        dark: {name: 'Mørk', value: '#000'},
      },
    },
    layout: "centered",
  },
};

export default preview;
