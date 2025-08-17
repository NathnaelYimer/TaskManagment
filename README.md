# Task Management Application

A modern, full-stack task management application built with Next.js 15, React 19, Tailwind CSS, and TypeScript.

## 🚀 Features

- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Authentication**: User login and registration system
- **Task Management**: Create, edit, delete, and track tasks
- **Dashboard**: Real-time statistics and progress tracking
- **Reports**: Comprehensive analytics and reporting
- **Real-time Updates**: Live notifications and updates
- **Dark Mode**: Built-in theme switching
- **Mobile Responsive**: Works perfectly on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, CSS Variables
- **UI Components**: Radix UI, Lucide Icons
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Database**: PostgreSQL (Neon)
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database (or Neon account)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Task_managment
pnpm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp env.example .env.local
```

Edit `.env.local` with your database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/task_management"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup

If using a local PostgreSQL database:

```bash
# Create database
createdb task_management

# Run setup scripts
psql -d task_management -f scripts/01-create-tables.sql
psql -d task_management -f scripts/02-setup-admin-user.sql
```

### 4. Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
Task_managment/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── tasks/            # Tasks page
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── tasks/            # Task-related components
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
├── scripts/              # Database setup scripts
└── public/               # Static assets
```

## 🎨 Available Pages

- **Home** (`/`): Landing page with overview
- **Login** (`/login`): User authentication
- **Dashboard** (`/dashboard`): Main dashboard with stats
- **Tasks** (`/tasks`): Task management interface
- **Reports** (`/reports`): Analytics and reporting
- **Settings** (`/settings`): User preferences
- **Profile** (`/profile`): User profile management
- **Admin** (`/admin/users`): User management (admin only)

## 🔧 Development Commands

```bash
# Development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start

# Lint code
pnpm run lint

# Type checking
pnpm run type-check
```

## 🐛 Troubleshooting

### Common Issues

1. **Tailwind CSS not working**: Ensure PostCSS is configured correctly
2. **Database connection errors**: Check your `DATABASE_URL` in `.env.local`
3. **Port conflicts**: The app will automatically try the next available port

### Reset and Clean

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Reset database (if needed)
psql -d task_management -f scripts/01-create-tables.sql
```

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all environment variables are set correctly
4. Verify database connectivity

---

**Happy coding! 🎉** 