# MUK Support Portal

A modern issue tracking system for Makerere University, built with React and Django.

## Features

- User-friendly interface for creating and managing support issues
- Real-time issue tracking and status updates
- File attachments support
- Comment system for issue discussions
- User profiles and notification preferences
- Responsive design for mobile and desktop
- Role-based access control

## Tech Stack

- Frontend:
  - React 18
  - Vite
  - Tailwind CSS
  - React Router
  - Axios
  - Heroicons

- Backend (coming soon):
  - Django
  - Django REST Framework
  - MySQL
  - JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/muk-support-portal.git
cd muk-support-portal
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following:
```env
VITE_API_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To create a production build:

```bash
npm run build
```

The build files will be in the `dist` directory.

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable components
├── context/         # React context providers
├── hooks/           # Custom React hooks
├── layouts/         # Layout components
├── pages/           # Page components
├── services/        # API services
├── styles/          # Global styles
├── utils/           # Utility functions
├── App.jsx          # Main App component
└── main.jsx         # Entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Makerere University
- React Team
- Tailwind CSS Team
- Django Team
