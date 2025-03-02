// Zaktualizuj plik docusaurus.config.ts dodając konfigurację dla GitHub Pages

import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';

// Pobierz nazwę organizacji i repozytorium z package.json lub ustaw ręcznie
const organizationName = 'adiyy2001'; // Nazwa użytkownika lub organizacji GitHub
const projectName = 'EDA-event-bus'; // Nazwa repozytorium

const config: Config = {
  title: 'Event Bus Library',
  tagline: 'A flexible event bus implementation for Angular applications',
  favicon: 'img/favicon.ico',

  // GitHub Pages wymaga poprawnego URL-a bazowego
  url: `https://${organizationName}.github.io`,
  baseUrl: `/${projectName}/`,

  // Konfiguracja dla GitHub Pages
  organizationName,
  projectName,
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/projects/event-bus-docs`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/event-bus-social-card.jpg',
    navbar: {
      title: 'Event Bus Library',
      logo: {
        alt: 'Event Bus Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: `https://github.com/${organizationName}/${projectName}`,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
            {
              label: 'Getting Started',
              to: '/docs/getting-started',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/event-bus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: `https://github.com/${organizationName}/${projectName}`,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Event Bus Library. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['typescript'],
    },
  },
};

export default config;
