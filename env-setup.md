# Environment Variables Setup for Neon Database

## 🚀 Quick Setup

1. **Create a file called `.env.local` in your project root**
2. **Copy and paste the content below**
3. **Replace the placeholder values with your actual Neon credentials**

## 📝 .env.local Content

```env
# Neon Database Connection
DATABASE_URL="postgresql://username:password@ep-something.region.aws.neon.tech/database_name?sslmode=require"

# Next.js Configuration
NEXTAUTH_SECRET="your-super-secret-key-here-make-it-long-and-random-123456789"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Add other environment variables as needed
# API_KEYS, etc.
```

## 🔍 How to Get Your Neon Connection String

1. **Go to [Neon Console](https://console.neon.tech/)**
2. **Sign in to your account**
3. **Select your project** (or create a new one)
4. **Click "Connection Details"** in the left sidebar
5. **Copy the connection string** that looks like:
   ```
   postgresql://username:password@ep-something.region.aws.neon.tech/database_name?sslmode=require
   ```

## ⚠️ Important Notes

- **Keep the `?sslmode=require`** part - this is required for Neon
- **Use double quotes** around the entire DATABASE_URL
- **Don't commit `.env.local`** to git (it's already in .gitignore)
- **Restart your dev server** after creating this file

## 🎯 Example .env.local

```env
DATABASE_URL="postgresql://john_doe:mypassword123@ep-cool-name-123456.us-east-2.aws.neon.tech/taskdb?sslmode=require"
NEXTAUTH_SECRET="my-super-secret-key-123456789-abcdefghijklmnop"
NEXTAUTH_URL="http://localhost:3000"
```

## ✅ After Setup

1. **Restart your development server:**
   ```bash
   pnpm run dev
   ```

2. **You should see:**
   - ✅ No more "DATABASE_URL is not set" errors
   - ✅ Successful database connections
   - ✅ Login functionality working
   - ✅ User creation and authentication working

## 🆘 Troubleshooting

If you still get errors:
1. **Check that `.env.local` is in the project root**
2. **Verify your Neon connection string is correct**
3. **Make sure you restarted the dev server**
4. **Check that the file has no extra spaces or quotes** 