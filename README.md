# MacTech Solutions Website

A professional, government-contracting-ready website for MacTech Solutions LLC, a Veteran-Owned / SDVOSB (pending) consulting firm specializing in DoD Cybersecurity, Infrastructure Engineering, and Compliance.

## Project Overview

This is a forward-facing website designed to establish credibility, communicate capabilities, and convert visitors into qualified leads. The site includes:

- **Home Page**: Value proposition, problem statements, service overview, and differentiation
- **Services Page**: Detailed, procurement-ready service offerings
- **Readiness Assessment**: Interactive multi-step form that converts visitors into leads
- **Leadership Page**: Key personnel profiles
- **Contact Page**: Secure contact form

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Validation**: Zod
- **Email**: Nodemailer (configurable SMTP)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional) PostgreSQL if you want to use it instead of SQLite

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL`: Database connection string (default: SQLite)
   - Email settings (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO)
   - `NEXT_PUBLIC_SITE_URL`: Your site URL (for production)

4. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
mactech/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── contact/          # Contact form endpoint
│   │   └── readiness/       # Readiness assessment endpoint
│   ├── contact/              # Contact page
│   ├── leadership/           # Leadership page
│   ├── readiness/            # Readiness assessment page
│   ├── services/             # Services page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── Footer.tsx
│   └── Navigation.tsx
├── lib/                      # Utility libraries
│   ├── email.ts             # Email service
│   ├── prisma.ts            # Prisma client
│   ├── readiness-scoring.ts # Readiness score calculation
│   └── validation.ts        # Zod schemas
├── prisma/
│   └── schema.prisma        # Database schema
└── public/                   # Static assets (if any)
```

## Key Features

### Readiness Assessment

The interactive readiness assessment:
- Multi-step form (6 steps)
- Calculates readiness score based on responses
- Identifies gaps and provides recommendations
- Stores submissions in database
- Sends email notifications to both user and MacTech

### Contact Form

- Secure form with validation
- Honeypot spam protection
- Stores submissions in database
- Email notifications

### Database Models

- `ReadinessAssessment`: Stores assessment submissions
- `ContactSubmission`: Stores contact form submissions

## Email Configuration

In development, emails are logged to the console. For production:

1. Configure SMTP settings in `.env`
2. The email service will automatically use SMTP in production mode

Example SMTP providers:
- SendGrid
- AWS SES
- Mailgun
- Your organization's SMTP server

## Production Deployment

### Build

```bash
npm run build
npm start
```

### Database

For production, consider using PostgreSQL:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env` with PostgreSQL connection string

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Environment Variables

Ensure all production environment variables are set:
- `DATABASE_URL`
- `SMTP_*` variables
- `NEXT_PUBLIC_SITE_URL`

## Future-Proofing Architecture

The codebase is designed to support future enhancements:

### Authentication

The architecture can easily support:
- NextAuth.js integration
- Role-based access control
- User sessions

**Where to extend:**
- Add authentication middleware in `app/api/` routes
- Create user model in Prisma schema
- Add protected routes/pages

### Evidence Tracking

Ready for:
- Evidence upload functionality
- Evidence linking to controls
- Evidence versioning

**Where to extend:**
- Add `Evidence` model to Prisma schema
- Create evidence upload API endpoints
- Build evidence management UI

### Readiness Scoring Over Time

The scoring system can track:
- Historical assessments
- Trend analysis
- Progress tracking

**Where to extend:**
- Add assessment history to user accounts
- Create dashboard for tracking progress
- Build analytics/visualization components

### Role-Based Access

Structure supports:
- Admin, user, viewer roles
- Permission-based access
- Audit logging

**Where to extend:**
- Add `User` and `Role` models to Prisma
- Implement role-based middleware
- Create admin dashboard

## Customization

### Colors

Edit `tailwind.config.ts` to customize the color palette. The current design uses:
- Primary blues (`primary-*`)
- Neutral grays (`neutral-*`)

### Content

All content is in the page components:
- `app/page.tsx` - Home page content
- `app/services/page.tsx` - Services content
- `app/leadership/page.tsx` - Leadership profiles
- `app/readiness/page.tsx` - Assessment questions

### Styling

Global styles and utilities are in:
- `app/globals.css` - Tailwind directives and custom classes
- `tailwind.config.ts` - Tailwind configuration

## Security Considerations

- **Input Validation**: All forms use Zod schemas for validation
- **Spam Protection**: Honeypot fields in forms
- **SQL Injection**: Prisma ORM prevents SQL injection
- **XSS Protection**: React automatically escapes content
- **CSRF**: Next.js provides CSRF protection for API routes

For production, consider:
- Rate limiting on API endpoints
- CAPTCHA for forms
- HTTPS enforcement
- Security headers (via Next.js config)

## Development

### Database Management

View database:
```bash
npx prisma studio
```

Reset database:
```bash
npx prisma db push --force-reset
```

### Linting

```bash
npm run lint
```

## Support

For questions or issues, contact the development team.

## License

Proprietary - MacTech Solutions LLC


