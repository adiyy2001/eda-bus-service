# Installation and Project Structure

To set up Docusaurus for your Event Bus Library documentation, follow these steps:

## Prerequisites

- Node.js version 16.14 or above
- npm or yarn

## Installation Steps

1. **Create a new Docusaurus project**

```bash
npx create-docusaurus@latest event-bus-docs classic
cd event-bus-docs
```

2. **Copy configuration files**

Replace the default Docusaurus configuration with the ones provided:
- Replace `docusaurus.config.js` in the root folder
- Replace `sidebars.js` in the root folder

3. **Add documentation content**

Create the following directory structure in the `docs` folder:

```
docs/
├── intro.md
├── getting-started.md
├── core-concepts.md
├── api/
│   ├── event-bus-service.md
│   ├── strategies/
│   │   ├── overview.md
│   │   ├── stateless.md
│   │   ├── stateful.md
│   │   ├── debounce.md
│   │   └── ... (other strategy docs)
│   ├── middleware/
│   │   ├── overview.md
│   │   ├── error-handler.md
│   │   └── ... (other middleware docs)
│   └── models/
│       └── events.md
├── examples/
│   ├── basic-usage.md
│   └── advanced-patterns.md
└── migration.md
```

4. **Run the development server**

```bash
npm run start
```

This will start a local development server at http://localhost:3000 where you can preview your documentation.

## Building for Production

To build the static files for production deployment:

```bash
npm run build
```

This will generate optimized static files in the `build` directory, which you can deploy to any static hosting service like GitHub Pages, Netlify, Vercel, etc.

## Customizing the Documentation

### Adding New Pages

1. Create a new Markdown file in the appropriate folder under `docs/`
2. Add frontmatter at the top with at least the `sidebar_position` property:

```md
---
sidebar_position: 5
---

# Your Page Title

Content goes here...
```

3. Update `sidebars.js` if needed to include the new page

### Adding Images

1. Place images in the `static/img/` directory
2. Reference them in your Markdown files:

```md
![Alt text](/img/your-image.png)
```

### Custom Styling

To customize the appearance:

1. Edit the CSS in `src/css/custom.css`
2. For more extensive customization, refer to the [Docusaurus theming documentation](https://docusaurus.io/docs/styling-layout)

### Versioning

If you need to maintain documentation for multiple versions of your library, you can use Docusaurus versioning:

```bash
npm run docusaurus docs:version 1.0.0
```

This will create a snapshot of your current documentation as version 1.0.0.

## Deployment

Choose one of the following deployment methods:

### GitHub Pages

1. Update `docusaurus.config.js` with your GitHub repository information:

```js
organizationName: 'your-github-username',
projectName: 'event-bus-library',
```

2. Deploy using the command:

```bash
GIT_USER=your-github-username npm run deploy
```

### Netlify/Vercel

1. Push your repository to GitHub
2. Connect Netlify or Vercel to your GitHub repository
3. Configure the build command as `npm run build` and the publish directory as `build`

## Resources

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [Markdown Features in Docusaurus](https://docusaurus.io/docs/markdown-features)
- [Deployment Guide](https://docusaurus.io/docs/deployment)
