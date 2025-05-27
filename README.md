# When To Visit

A smart and beautiful place-crowd tracker that lets users report and view real-time crowd levels of public spaces (e.g., gyms, cafés, clinics, markets, etc.).

## Overview

When To Visit helps people avoid overcrowded locations by checking crowd status before they leave home. The app features a clean, minimalistic, and professional white/blue aesthetic.

### Key Features

- **Real-time Crowd Tracking**: View and report crowd levels at various locations
- **Full Authentication System**: Secure login, registration, and password reset
- **User Dashboard**: Track your report history
- **Place Management**: Add new locations to the system
- **Mobile-first Responsive Design**: Works seamlessly on all devices

## Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore Database)
- **Hosting**: Firebase Hosting (optional)

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Firebase account

### Installation

1. Clone the repository
```
git clone <repository-url>
cd when-to-visit
```

2. Install dependencies
```
npm install
```

3. Configure Firebase

Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)

Update the Firebase configuration in `src/services/firebase.js` with your own Firebase project details:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

4. Set up Firestore Database

Create two collections in your Firestore database:
- `places`: For storing location information
- `reports`: For storing crowd reports

5. Deploy Firestore Security Rules

Copy the security rules from `firestore.rules` to your Firebase console.

### Running the Application

Start the development server:
```
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

```
npm run build
```

## Project Structure

- `/public`: Static assets
- `/src`: Source code
  - `/components`: Reusable UI components
  - `/contexts`: React context providers
  - `/pages`: Main application pages
  - `/services`: Firebase and API services
  - `/assets`: Images and other static assets

## License

This project is licensed under the MIT License.
