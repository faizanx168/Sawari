# Sawari - Smart Carpooling Platform


## Overview

Sawari is a modern carpooling platform that connects commuters for efficient and sustainable ride-sharing. The platform aims to reduce traffic congestion, lower commuting costs, and create a more sustainable transportation ecosystem.

## 🚀 Features

### Core Features
- **Smart Ride Matching**
  - Advanced search with distance radius, seat availability, and time filters
  - Real-time distance and duration calculations
  - Flexible scheduling (one-time, daily, weekly, monthly rides)
  - Price and distance-based sorting

- **Interactive Map Interface**
  - Real-time ride visualization on Google Maps
  - Dynamic route preview with pickup/dropoff locations
  - Adjustable search radius
  - Interactive ride markers with instant information
  - Smooth animations and transitions

- **Location Intelligence**
  - Current location detection
  - Google Places address autocomplete
  - Distance-based filtering
  - Real-time route visualization

- **User Management**
  - Secure authentication
  - Profile management
  - Ride history tracking
  - Booking management

### Coming Soon
- Real-time ride tracking
- In-app messaging
- Rating and review system
- In-app payments
- Enhanced safety features

## 🛠️ Tech Stack

- **Frontend**
  - Next.js 13 (App Router)
  - TypeScript
  - Tailwind CSS
  - React Hooks

- **APIs & Services**
  - Google Maps JavaScript API
  - Google Places API
  - Google Distance Matrix API
  - Google Geocoding API

- **Authentication**
  - NextAuth.js
  - JWT tokens

- **Development Tools**
  - ESLint
  - Prettier
  - Husky (Git hooks)
  - TypeScript compiler



### Google Maps API
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Distance Matrix API
   - Geocoding API
4. Create credentials (API key)
5. Add the API key to your `.env.local` file

## 📱 Usage

### Finding a Ride
1. Enter your pickup and dropoff locations
2. Select your preferred date and time
3. Adjust the search radius if needed
4. Click "Find Available Rides"
5. View available rides on the map and in the list
6. Click "View Route" to see the journey preview
7. Click "Book Now" to reserve your seat

### Offering a Ride
1. Click "Offer Ride" in the navigation
2. Enter ride details (route, date, time, seats, price)
3. Set recurring schedule if applicable
4. Review and publish your ride

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

## 📝 Code Style

- Use TypeScript for all new code
- Follow the existing code structure
- Add appropriate comments and documentation
- Ensure all tests pass before submitting PR
- Follow the ESLint and Prettier configurations



## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
