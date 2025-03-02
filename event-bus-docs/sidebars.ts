import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'getting-started',
    'core-concepts',
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        'api/event-bus-service',
        {
          type: 'category',
          label: 'Strategies',
          items: [
            'api/strategies/overview',
            'api/strategies/stateless',
            'api/strategies/stateful',
            'api/strategies/debounce',
            'api/strategies/throttle',
          ],
        },
        {
          type: 'category',
          label: 'Middleware',
          items: [
            'api/middleware/overview',
            'api/middleware/logging',
          ],
        },
      ],
    },
    'api/examples/basic-usage',
    'installation-and-project-structure',
  ],
};

export default sidebars;
