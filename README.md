# FairShare - Expense Splitting App

A simple, fast expense-splitting app that helps groups settle expenses.

## Features

- ✨ Add people and track expenses
- 💰 Automatically calculate fair splits
- 🧮 Minimize settlement transactions
- 📊 See who owes whom
- 🚀 One-click Vercel deployment

## Tech Stack

- **Frontend**: React 18 + Next.js 14
- **Backend**: Next.js API Routes
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Prisma

## Quick Start

### Local Development

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Set `DATABASE_URL` environment variable (PostgreSQL connection string)
4. Deploy!

For local SQLite:
```bash
DATABASE_URL="file:./prisma/dev.db" npm run dev
```

For production PostgreSQL:
```
DATABASE_URL="postgresql://user:password@host:port/dbname"
```

## Project Structure

```
app/
  ├── api/              # API routes
  │   ├── people/
  │   ├── expenses/
  │   └── balances/
  ├── components/       # React components
  └── page.jsx         # Main page
prisma/
  └── schema.prisma    # Database schema
```

## How It Works

1. **Add People**: Create a list of group members
2. **Add Expenses**: Log who paid and who was involved
3. **View Settlements**: See optimal payment instructions
4. **Settle Up**: Make payments and clear balances

## Settlement Algorithm

Uses a greedy algorithm to minimize the number of transactions needed. For example, instead of A→B, A→C, D→B, D→C, it might suggest A→B, B→C, D→A.

## Future Features

- Payment history & receipts
- Recurring expenses
- Mobile app
- Export/share results
- Multi-group support
- Payment integration
