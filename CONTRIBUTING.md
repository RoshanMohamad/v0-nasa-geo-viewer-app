# Contributing to NASA GeoViewer

Thank you for your interest in contributing to the NASA GeoViewer app! This document provides guidelines and information for contributors.

## 🌟 How to Contribute

### Reporting Bugs
- Check if the bug has already been reported in the Issues section
- Provide detailed steps to reproduce the issue
- Include your browser version and operating system

### Suggesting Enhancements
- Open an issue describing the enhancement
- Explain why this enhancement would be useful
- Provide examples if possible

### Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Local Development
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your NASA API key (get one at https://api.nasa.gov/)

# Run development server
pnpm dev

# Open http://localhost:3000
```

### NASA API Key
Get your free API key at https://api.nasa.gov/
- DEMO_KEY: 30 requests/hour, 50 requests/day (limited)
- Personal Key: 1,000 requests/hour (recommended)

## 📝 Code Style

- Use TypeScript for all new code
- Follow the existing code structure
- Add JSDoc comments for functions
- Use meaningful variable names
- Keep functions focused and small

## 🧪 Testing

- Test your changes in different browsers
- Verify the 3D simulation performs well
- Check NASA API integration works correctly
- Ensure all sliders and controls function properly

## 🎯 Areas for Contribution

We welcome contributions in these areas:
- **Physics Accuracy**: Improve impact calculations
- **Visualizations**: Enhanced 3D graphics and effects
- **UI/UX**: Better user interface and experience
- **Performance**: Optimization for smoother animations
- **Documentation**: Improve code comments and guides
- **Accessibility**: Make the app more accessible
- **Testing**: Add automated tests

## 📚 Resources

- [NASA NEO API Documentation](https://api.nasa.gov/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Impact Physics Reference](https://impact.ese.ic.ac.uk/ImpactEarth/)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help create a positive community

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## 💬 Questions?

Feel free to open an issue for any questions or concerns!
