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
    // Step 1.5: Create platform organization for admin users
    console.log('1️⃣ Checking/Creating platform organization...')
    
    let platformOrgId
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'platform-admin')
      .single()
    
    if (existingOrg) {
      platformOrgId = existingOrg.id
      console.log('✅ Found existing platform organization')
    } else {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: 'Platform Administration',
          slug: 'platform-admin',
          subscription_tier: 'enterprise',
          subscription_status: 'active',
          user_limit: 10
        })
        .select('id')
        .single()
      
      if (orgError) {
        throw new Error(`Failed to create platform organization: ${orgError.message}`)
      }
      
      platformOrgId = orgData.id
      console.log('✅ Platform organization created successfully')
    }

    // Step 2: Check if user already exists, if not create them
    console.log('2️⃣ Checking/Creating user in Supabase Auth...')
    
    // First check if user exists
    const { data: usersList, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`)
    }
    
    const existingUser = usersList.users.find(user => user.email === adminEmail)
    let userId
    
    if (existingUser) {
      userId = existingUser.id
      console.log('✅ Found existing auth user')
    } else {
      // Create new user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Auto-confirm email for admin user
        user_metadata: {
          first_name: 'Super',
          last_name: 'Admin',
          role: 'admin'
        }
      })

      if (authError) {
        throw new Error(`Failed to create auth user: ${authError.message}`)
      }

      userId = authData.user.id
      console.log('✅ Auth user created successfully')
    }

    // Step 3: Create/update user record in database
    console.log('3️⃣ Creating/updating user record in database...')

    const userData = {
      id: userId,
      organization_id: platformOrgId,
      email: adminEmail,
      first_name: 'Super',
      last_name: 'Admin',
      role: 'admin',
      is_active: true
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

    // Step 4: Verify the user was created correctly
    console.log('4️⃣ Verifying admin user setup...')

    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('id, email, role, is_active, created_at')
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
    console.log(`Status: ${verifyData.is_active ? 'active' : 'inactive'}`)
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