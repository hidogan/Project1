# Swimming Training Plan Generator

A full-stack web application that generates personalized swimming training plans using AI. The application features a React frontend with a modern UI and a Node.js/Express backend integrated with the Google Gemini AI API.

## Features

- 🏊‍♂️ Personalized swimming training plan generation
- 📊 Multi-step form for detailed customization
- 🎯 Goal-based training recommendations
- 💾 Save and manage training plans
- 🎨 Modern, responsive UI with Tailwind CSS
- 🤖 AI-powered workout generation using Google Gemini

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript
- Google Gemini AI API
- Winston for logging

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key (Get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd swimming-trainer
```

2. Install dependencies:

For the backend:
```bash
cd backend
npm install
```

For the frontend:
```bash
cd frontend
npm install
```

3. Configure environment variables:

Copy the example environment file and update it with your values:
```bash
cd backend
cp .env.example .env
```

Update the `.env` file with your actual values:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

Note: The `.env` file is included in `.gitignore` to prevent sensitive information from being committed to the repository.

4. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`
The backend will be running at `http://localhost:3001`

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Server entry point
│   ├── logs/               # Application logs
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/          # Page components
    │   ├── components/     # Reusable components
    │   ├── api/           # API integration
    │   └── main.tsx       # App entry point
    └── package.json
```

## Environment Variables

The following environment variables are required:

### Backend
- `PORT` - Server port (default: 3001)
- `GEMINI_API_KEY` - Your Google Gemini API key
- `NODE_ENV` - Environment mode (development/production)

All environment variables are documented in `.env.example`

## API Endpoints

### Training Plans

- `POST /api/trainings` - Generate a new training plan
- `GET /api/trainings` - Get all saved training plans
- `GET /api/trainings/:id` - Get a specific training plan
- `POST /api/trainings/save` - Save a training plan
- `DELETE /api/trainings/:id` - Delete a training plan

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for powering the training plan generation
- The swimming community for inspiration and feedback 