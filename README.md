# WanderLog PWA

A Progressive Web App for travel logging and exploration.

## Features

- 🌍 **Explore Places**: Discover new locations and attractions
- 📝 **Log Journeys**: Record your travel experiences with notes and ratings
- ⭐ **Favorites**: Save and organize your favorite places
- 📱 **PWA Ready**: Install on any device, works offline
- 🎨 **Modern Design**: Beautiful, responsive interface following Material Design principles

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Build Tool**: Vite
- **PWA**: Service Worker, Web App Manifest
- **Hosting**: Netlify
- **Version**: 1.0.0

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vikrambellur1612/wanderlog-pwa.git
   cd wanderlog-pwa
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## PWA Features

- ✅ **Service Worker**: Caches resources for offline access
- ✅ **Web App Manifest**: Enables installation on devices
- ✅ **Responsive Design**: Works on mobile, tablet, and desktop
- ✅ **Offline Support**: Core functionality works without internet
- ✅ **Install Prompts**: Encourages users to install the app
- ✅ **Update Notifications**: Alerts users when new versions are available

## Project Structure

```
wanderlog-pwa/
├── index.html              # Main app entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── netlify.toml            # Netlify configuration
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── css/
│   └── styles.css          # Main styles
├── js/
│   ├── app.js              # Main application logic
│   └── sw-register.js      # Service worker registration
└── icons/                  # PWA icons
    ├── favicon.svg
    ├── favicon.png
    ├── icon-192x192.png
    ├── icon-512x512.png
    └── apple-touch-icon.png
```

## Development Guidelines

### Version Management
- Version format: `X.Y.Z` (Major.Minor.Patch)
- Auto-increment minor versions unless major changes
- Update version in: `package.json`, `manifest.json`, service worker

### Workflow
1. Make changes locally
2. Test with `npm run dev`
3. Verify PWA features work
4. Build and test production version
5. Commit and push to GitHub
6. Netlify auto-deploys

### Testing Checklist
- [ ] App loads correctly
- [ ] Navigation works on all views
- [ ] Forms submit properly
- [ ] PWA install prompt appears
- [ ] Service worker caches resources
- [ ] App works offline
- [ ] Responsive on mobile/tablet/desktop

## Deployment

The app is automatically deployed to Netlify when changes are pushed to the main branch.

**Live URL**: [Will be provided after deployment]

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Version History

- **v1.0.0** - Initial release with core PWA features

---

**Built with ❤️ for travelers everywhere**
