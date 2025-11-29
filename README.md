# superCars - Used Car Marketplace

A modern web application for buying and selling used cars, similar to avto.net and mobile.de. This platform provides a forum-style marketplace where users can browse, search, and list their vehicles for sale.

## 🚗 Features

- **User Authentication & Profiles**: Secure user registration and login system
- **Car Listings**: Create, edit, and manage car listings with detailed information
- **Advanced Search & Filtering**: Search cars by make, model, price range, year, mileage, and more
- **Image Gallery**: Upload and manage multiple photos for each listing
- **Messaging System**: Direct communication between buyers and sellers
- **Favorites/Watchlist**: Save favorite listings for later viewing
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Backend
- **C#** - Primary programming language
- **ASP.NET Web API** - RESTful API framework
- **Entity Framework Core** - ORM for database operations
- **SQL Server** - Database management system

### Frontend
- **Next.js** - React framework for server-side rendering and static site generation
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **Tailwind CSS** (recommended) - Utility-first CSS framework

## 📁 Project Structure

```
superCars/
├── backend/
│   ├── SuperCars.API/          # ASP.NET Web API project
│   ├── SuperCars.Core/         # Domain models and business logic
│   ├── SuperCars.Infrastructure/ # Data access layer
│   └── SuperCars.Tests/        # Unit tests
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js app directory
│   │   ├── components/          # React components
│   │   ├── lib/                 # Utilities and helpers
│   │   └── types/               # TypeScript type definitions
│   ├── public/                  # Static assets
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **.NET SDK** 
- **Node.js** 
- **npm** / **yarn**
- **SQL Server** 

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Cars
- `GET /api/cars` - Get all car listings (with pagination and filters)
- `GET /api/cars/{id}` - Get car details by ID
- `POST /api/cars` - Create a new car listing (authenticated)
- `PUT /api/cars/{id}` - Update car listing (authenticated, owner only)
- `DELETE /api/cars/{id}` - Delete car listing (authenticated, owner only)

### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile (authenticated)


## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - *Initial work*

## 🙏 Acknowledgments

- Inspired by avto.net and mobile.de
- Built with modern web technologies for optimal performance and user experience
