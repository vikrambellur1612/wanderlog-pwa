# WanderLog - Travel Planning PWA

## Overview
WanderLog is a modern Progressive Web Application for travel planning and logging, built with vanilla JavaScript and optimized for offline usage.

## Features
- 🗺️ **Interactive Trip Planning**: Create and manage trips with detailed itineraries
- 📱 **PWA Support**: Install as a native app on mobile and desktop
- 🌐 **Offline Mode**: Full functionality without internet connection
- ⭐ **Favorites System**: Save and organize favorite destinations
- 🏨 **Hotel Search**: Integrated hotel search for major Indian destinations
- 📖 **Travel Log**: Document your travel experiences
- 🎯 **Attraction Details**: Rich information about tourist attractions

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd wanderlog-pwa

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure
```
wanderlog-pwa/
├── css/                 # Stylesheets
├── js/                  # JavaScript modules
│   ├── app.js          # Main application logic
│   ├── trip-manager.js # Trip management
│   ├── trip-ui.js      # Trip user interface
│   ├── map-manager.js  # Map integration
│   └── ...
├── icons/              # App icons
├── dist/               # Production build
├── manifest.json       # PWA manifest
└── sw.js              # Service worker
```

## API Configuration
The app supports external APIs for dynamic content. See `js/api-config.js` for setup instructions.

## Technologies Used
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tool**: Vite
- **PWA**: Service Worker, Web App Manifest
- **Storage**: LocalStorage
- **Maps**: Leaflet (when API enabled)

## Development
- **Development Server**: `npm run dev`
- **Hot Reload**: Enabled during development
- **Production Build**: `npm run build`
- **Code Linting**: ESLint configuration available

## Deployment
The app is optimized for deployment on:
- Netlify (primary)
- Vercel
- GitHub Pages
- Any static hosting service

## Browser Support
- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers with PWA support

## License
MIT License - see LICENSE file for details

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## Support
For issues and feature requests, please use the GitHub issues page.
