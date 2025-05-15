# Support Ticketing System

A complete customer support ticketing system built with Ember.js frontend and GraphQL API backend.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [GraphQL API Reference](#graphql-api-reference)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

This support ticketing system allows customers to create and track support tickets while enabling support agents to manage and resolve customer issues efficiently. The application has separate interfaces for customers and support agents.

## Features

### Customer Features
- Create new support tickets with detailed descriptions
- Upload file attachments to tickets
- View all submitted tickets and their statuses
- Add comments to existing tickets
- Receive email notifications on ticket updates

### Agent Features
- View a dashboard of assigned and unassigned tickets
- Assign tickets to themselves
- Update ticket status (Open, In Progress, Resolved, Closed)
- Add comments to tickets
- Export ticket data to CSV format
- Receive daily email reminders about open tickets

## Technology Stack

- **Frontend**: Ember.js 4.x
- **API**: GraphQL
- **Backend**: Ruby on Rails API (separate repository)
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Custom CSS

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16.x or later)
- npm (v8.x or later)
- Git

For the backend service (separate repository):
- Ruby 3.2.x
- Rails 7.x
- PostgreSQL

## Installation

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Davidosky007/support-ticketing-frontend.git
   cd support-ticketing-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Backend Setup

1. Clone the backend repository:
   ```bash
   git clone https://github.com/Davidosky007/support-ticketing-backend.git
   cd support-ticketing-backend
   ```

2. Install dependencies:
   ```bash
   bundle install
   ```

3. Set up the database:
   ```bash
   rails db:create
   rails db:migrate
   rails db:seed  # Optional: adds sample data
   ```

## Configuration

### Frontend Configuration

The frontend is configured to connect to the backend API at `https://support-ticketing-backend.onrender.com/graphql` by default. 

If you need to connect to a local backend or different deployment, modify the `baseUrl` in the Apollo service:

```javascript
// app/services/apollo.js
export default class ApolloService extends Service {
  // ...
  baseUrl = 'https://your-backend-url/graphql';
  // ...
}
```

Additionally, update the Content Security Policy in `config/environment.js` to allow connections to your backend:

```javascript
// config/environment.js
contentSecurityPolicy: {
  'connect-src': "'self' https://your-backend-url"
},
```

### Backend Configuration

For the backend, you'll need to set up environment variables:

1. Create a `.env` file in the backend project root:
   ```
   DATABASE_URL=postgres://username:password@localhost/support_ticketing_dev
   JWT_SECRET=your_secure_jwt_secret
   SMTP_SERVER=smtp.example.com
   SMTP_PORT=587
   SMTP_USERNAME=your_email@example.com
   SMTP_PASSWORD=your_email_password
   MAIL_FROM=support@yourdomain.com
   ```

2. Adjust CORS settings in `config/initializers/cors.rb` if needed.

## Running the Application

### Frontend Development Server

Start the Ember development server:

```bash
npm start
```

This will run the application at `http://localhost:4200`.

### Backend Development Server

Start the Rails server:

```bash
rails server
```

The API will be available at `http://localhost:3000/graphql`.

## Testing

### Frontend Tests

Run the test suite with:

```bash
npm test
```

For linting:

```bash
npm run lint
```

### Backend Tests

Run the backend test suite with:

```bash
rspec
```

## GraphQL API Reference

The application uses a GraphQL API for all data operations. For detailed API documentation, see [graphql-api-ember-guide.md](./graphql-api-ember-guide.md) in this repository.

Key API operations include:

- Authentication (login/register)
- Creating and retrieving tickets
- Adding comments
- Uploading attachments
- Assigning tickets to agents
- Updating ticket status
- Generating reports

## Deployment

### Frontend Deployment

The frontend can be deployed to any static hosting service:

1. Build the production assets:
   ```bash
   npm run build --environment=production
   ```

2. Deploy the contents of the `dist` directory to your hosting service.

Popular hosting options include:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

### Backend Deployment

Alright, so you've got your shiny frontend ready - now let's talk about getting that backend up and running in production! 

You'll need a hosting service that can handle Ruby on Rails. Here's what you need to do:

1. Set up those environment variables - trust me, you don't want to forget this step 🙃
2. Deploy your Rails app (fingers crossed for a smooth deploy!)
3. Run those database migrations - because nobody likes a schema mismatch error at 2 AM

We've had good experiences with these hosting services:
- Heroku (classic choice, though the free tier is sadly gone)
- Render (pretty solid and developer-friendly)
- Fly.io (super fast if you configure it right)
- Railway (surprisingly easy to use)

## Troubleshooting

Let's be honest - things will break. Here's how to fix them when they do!

### Common Issues

#### Authentication Issues

- **Problem**: You're 100% sure you typed your password right, but you're still getting "Invalid login credentials" 
  **Solution**: First, take a deep breath! Then check if your backend API is actually running. Double-check your JWT secret - this one has bitten us more times than we'd like to admit.

- **Problem**: You're working away and suddenly... you're logged out. Again. 😤
  **Solution**: Your JWT token is probably expiring too quickly. We've all been there! Check the token expiration time in your backend. Maybe don't set it to 5 minutes during development (lesson learned the hard way).

#### API Connection Issues

- **Problem**: GraphQL queries fail with network errors
  **Solution**: 
  1. Verify the backend URL in `app/services/apollo.js`
  2. Check CORS settings on the backend
  3. Ensure your backend server is running

#### CSV Export Issues

- **Problem**: CSV export button doesn't download anything
  **Solution**: 
  1. Check that the date range is valid (not in the future)
  2. Verify the browser console for errors
  3. Ensure the backend has permission to create and serve files

- **Problem**: "No download URL was returned" error
  **Solution**: This may indicate a server-side issue. Check the backend logs.

#### File Upload Issues

- **Problem**: File attachments fail to upload
  **Solution**:
  1. Check file size limits in both frontend and backend
  2. Verify the correct encoding is being used (Base64)
  3. Ensure proper CORS headers are set for file uploads

### Getting Help

If you encounter issues not covered here, please:

1. Open an issue in the GitHub repository
2. Include detailed error messages and steps to reproduce
3. Check the browser console and backend logs for error details

## License

This project is licensed under the MIT License - see the LICENSE file for details.
