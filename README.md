# Interactive Product Tour

A full-stack web application that allows users to create and share interactive product demos with screenshots, annotations, and screen recordings.

## Features

- 🔐 **Authentication**: Secure user registration and login with JWT
- 🎨 **Interactive Editor**: Create tours with images and annotations
- 📹 **Screen Recording**: Built-in screen capture functionality
- 📊 **Dashboard**: View analytics and manage tours
- 🔗 **Sharing**: Publish tours with public/private links
- 📱 **Responsive**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd interactive-product-tour
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   MONGODB_URI=mongodb://localhost:27017/product-tour
   UPLOAD_DIR=uploads
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system. You can:
   - Use a local MongoDB instance
   - Use MongoDB Atlas (cloud)
   - Use Docker: `docker run -d -p 27017:27017 mongo`

## Running the Application

### Development Mode

1. **Start both frontend and backend simultaneously**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend on http://localhost:3000
   - Backend on http://localhost:5000

2. **Or start them separately**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

### Production Mode

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend**
   ```bash
   cd backend
   npm start
   ```

## Usage

1. **Sign Up**: Create a new account or sign in
2. **Create Tour**: Click "Create New Tour" from the dashboard
3. **Add Steps**: Upload images and add annotations
4. **Preview**: Use the preview mode to test your tour
5. **Publish**: Save and publish your tour
6. **Share**: Get a shareable link for your tour

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tours
- `GET /api/tours` - Get user's tours
- `POST /api/tours` - Create new tour
- `GET /api/tours/:id` - Get single tour
- `PUT /api/tours/:id` - Update tour
- `DELETE /api/tours/:id` - Delete tour
- `GET /api/tours/public/:shareUrl` - Get public tour

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard` - Get dashboard data

## Project Structure

```
interactive-product-tour/
├── frontend/                 # Next.js frontend
│   ├── app/                  # App Router pages
│   │   ├── page.tsx          # Landing page
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   ├── dashboard/        # Dashboard
│   │   └── create/           # Tour creator
│   ├── components/           # Reusable components
│   └── package.json
├── backend/                  # Express.js backend
│   ├── routes/               # API routes
│   ├── models/               # Database models
│   ├── middleware/           # Custom middleware
│   ├── config/               # Configuration
│   └── server.js             # Main server file
└── package.json              # Root package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/.next`
4. Deploy

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && npm start`
4. Add environment variables
5. Deploy

## Support

If you encounter any issues or have questions, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

Built with ❤️ using Next.js and Express.js

