#!/usr/bin/env node

/**
 * Seed Admin User Script
 *
 * This script creates the initial super admin user for the Genkō Healthcare Admin Backend.
 * It creates both the Supabase Auth user and the corresponding database record.
 *
 * Usage:
 *   pnpm run seed-admin
 *
 * Environment Variables Required:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - ADMIN_EMAIL (optional, defaults to admin@genkohealth.com)
 *   - ADMIN_PASSWORD (optional, defaults to a secure generated password)
 */

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function seedAdminUser() {
  console.log('🚀 Starting admin user seeding process...')

  // Validate required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    console.error('\nPlease check your .env.local file.')
    process.exit(1)
  }

  // Admin user details (can be overridden with env vars)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@genkohealth.com'
  const adminPassword = process.env.ADMIN_PASSWORD || generateSecurePassword()

  console.log(`📧 Admin Email: ${adminEmail}`)
  console.log(`🔐 Admin Password: ${adminPassword}`)
  console.log('')

  // Initialize Supabase admin client
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Step 1: Create user in Supabase Auth
    console.log('1️⃣ Creating user in Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email for admin user
      user_metadata: {
        first_name: 'Super',
        last_name: 'Admin',
        role: 'super_admin'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists in Supabase Auth. Checking database record...')
      } else {
        throw new Error(`Failed to create auth user: ${authError.message}`)
      }
    } else {
      console.log('✅ Auth user created successfully')
    }

    const userId = authData?.user?.id
    if (!userId) {
      // Try to get existing user
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(adminEmail)
      if (!existingUser.user) {
        throw new Error('Could not get user ID')
      }
      console.log('✅ Found existing auth user')
    }

    // Step 2: Create/update user record in database
    console.log('2️⃣ Creating/updating user record in database...')

    const userData = {
      id: userId,
      email: adminEmail,
      first_name: 'Super',
      last_name: 'Admin',
      role: 'super_admin',
      status: 'active',
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          security: true,
          system: true
        }
      }
    }

    const { data: dbData, error: dbError } = await supabase
      .from('users')
      .upsert(userData, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()

    if (dbError) {
      throw new Error(`Failed to create database user: ${dbError.message}`)
    }

    console.log('✅ Database user record created/updated successfully')

    // Step 3: Verify the user was created correctly
    console.log('3️⃣ Verifying admin user setup...')

    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('id, email, role, status, created_at')
      .eq('id', userId)
      .single()

    if (verifyError) {
      throw new Error(`Failed to verify user: ${verifyError.message}`)
    }

    console.log('✅ Admin user verification successful!')
    console.log('')
    console.log('🎉 Super Admin User Created Successfully!')
    console.log('=====================================')
    console.log(`Email: ${verifyData.email}`)
    console.log(`Role: ${verifyData.role}`)
    console.log(`Status: ${verifyData.status}`)
    console.log(`Created: ${new Date(verifyData.created_at).toLocaleString()}`)
    console.log('')
    console.log('🔑 Login Credentials:')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('')
    console.log('⚠️  IMPORTANT: Save these credentials securely!')
    console.log('   This is the only super admin account with full platform access.')
    console.log('')
    console.log('🚀 You can now start the application and log in at /login')

  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message)
    process.exit(1)
  }
}

function generateSecurePassword() {
  // Generate a secure 16-character password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Run the script
if (require.main === module) {
  seedAdminUser()
}

module.exports = { seedAdminUser }