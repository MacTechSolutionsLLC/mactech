# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration (for production)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@mactechsolutions.com
SMTP_TO=contact@mactechsolutions.com

# OpenAI API (for AI Chatbot)
OPENAI_API_KEY=your-openai-api-key-here

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Notes

- In development mode, emails are logged to the console instead of being sent
- For production, configure real SMTP credentials
- The `DATABASE_URL` for SQLite is relative to the `prisma/` directory
- For PostgreSQL, use: `DATABASE_URL="postgresql://user:password@localhost:5432/mactech"`
- The OpenAI API key is required for the AI chatbot feature. Get your key from https://platform.openai.com/api-keys

