# Gigwork - Short-term Labor Platform

## Introduction

Gigwork is a specialized online recruitment platform designed to connect workers (primarily students) with small businesses needing short-term staff in Vietnam's growing gig economy. The platform simplifies the hiring process for daily wage and seasonal work, providing a transparent, trust-based system through mutual reviews and streamlined job management.

## Problem & Solution

### The Challenge
- Existing platforms are too complex for small-scale businesses
- Limited focus on daily wage and seasonal work opportunities
- High fees and complicated processes
- Lack of adequate trust mechanisms between workers and employers

### Our Solution
Gigwork provides a simple, efficient platform that enables:
- Quick job posting in minutes
- Flexible job search by location and schedule
- Two-way rating system for building trust
- Transparent job tracking and notifications
- Streamlined workflow from posting to completion

## User Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Employee (Worker)** | Students and individuals seeking temporary work | Browse jobs, apply, receive notifications, review employers |
| **Employer** | Small business owners posting job opportunities | Post jobs, manage applications, accept workers, review employees |
| **Admin** | Platform administrator | User management, ban users, monitor platform activity |

## Key Features

### Authentication & Authorization
- Email/password registration
- JWT-based authentication (24-hour token expiration)
- Role-based access control
- Secure session management

### Job Management
- Create job postings with multiple sessions/shifts
- Define required skills for each position
- Set worker quotas
- Edit or delete job postings
- View and manage job applications

### Job Discovery & Application
- Search jobs by location
- Filter by date and required skills
- View detailed job information and sessions
- Submit applications with ease
- Track application status in real-time

### Application Workflow
The platform uses a clear status progression:
```
Pending → Accepted → Confirmed → Completed
```
- Employers accept workers within quota limits
- Workers confirm their acceptance
- Jobs can be marked as completed
- Applications can be cancelled when needed

### Review System
- Rate users on a 1-5 star scale
- Leave detailed text feedback
- One review per job per reviewer (ensures authenticity)
- View aggregated user ratings

### Notification System
- Job update alerts
- Application status change notifications
- New job match recommendations
- Review reminders

### Profile Management
- Update personal information
- Manage skills (for workers)
- Update company details (for employers)
- View complete application history

## Database Architecture

### Core Tables

#### Users Table
Central authentication and contact management with role flags:
- Unique email and phone number
- Encrypted password storage
- Dual role support (worker/employer)
- Account status tracking (active/banned)
- Last login timestamp

#### Employee Profiles
Role-specific data for workers:
- Bio and personal description
- Skills list (JSON format)
- Date of birth
- Gender information

#### Employer Profiles
Business information for employers:
- Company name
- Company address

#### Jobs Table
Job postings created by employers:
- Job title and description
- Location
- Start date and duration
- Number of workers needed
- Creation and update timestamps

#### Job Required Skills
Skills mapping for each job position (composite primary key: job_id + skill_name)

#### Job Sessions
Multiple work sessions/shifts for each job:
- Session date
- Start and end times
- Links to parent job

#### Job Applications
Application tracking with status management:
- Status: pending, accepted, confirmed, completed, cancelled
- Application timestamp
- Links to both job and worker

#### Reviews
Rating and feedback system:
- Rating (1-5 stars)
- Optional text comment
- Unique constraint: one review per job per reviewer
- Tracks both reviewer and reviewee

#### Notifications
User notification log:
- Notification type
- Title and content
- Creation timestamp

## Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + Shadcn/ui
- **State Management:** React Query (TanStack Query)
- **Deployment:** Vercel

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** Passport.js + JWT
- **Deployment:** Render
- **Containerization:** Docker

## API Response Format

### Success Response
```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": 400
}
```

## Installation Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Docker (optional)

### Backend Setup
```bash
# Clone the repository
git clone <repository-url>
cd gigwork-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run start:dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd gigwork-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API endpoint

# Start the development server
npm run dev
```

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## Usage Examples

### For Workers
```bash
# Search for jobs in your area
1. Navigate to Job Search
2. Enter your location
3. Filter by desired date range
4. Apply to suitable positions

# Track your applications
1. Go to My Applications
2. View status updates
3. Confirm accepted positions
4. Leave reviews after completion
```

### For Employers
```bash
# Post a new job
1. Click "Post Job"
2. Fill in job details
3. Add required skills
4. Create work sessions/shifts
5. Publish posting

# Manage applications
1. View received applications
2. Accept qualified workers (within quota)
3. Track worker confirmations
4. Mark job as completed
5. Leave reviews for workers
```

## Current Scope

### Included Features
✅ User registration and authentication  
✅ Job posting and management  
✅ Job search and application  
✅ Application workflow management  
✅ Two-way review system  
✅ Real-time notifications  
✅ User profile management  

### Future Enhancements
🔄 Integrated payment processing  
🔄 In-app messaging/chat  
🔄 Advanced matching algorithms  
🔄 Native mobile applications  
🔄 Background checks and verification  

## Contributing

We welcome contributions to improve Gigwork! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please contact the development team or open an issue in the repository.

---

**Built with ❤️ for Vietnam's gig economy**