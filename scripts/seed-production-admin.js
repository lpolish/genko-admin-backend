#!/usr/bin/env node

/**
 * Production Admin Seeder
 *
 * This script directly seeds the super admin user into the production Supabase database.
 * Run this locally with production credentials to avoid running database operations in Vercel.
 *
 * Usage:
 *   node scripts/seed-production-admin.js <supabase-url> <service-role-key> [admin-email] [admin-password]
 *
 * Or set environment variables:
 *   PRODUCTION_SUPABASE_URL=<url>
 *   PRODUCTION_SUPABASE_SERVICE_KEY=<key>
 *   ADMIN_EMAIL=<email> (optional, defaults to admin@genkohealth.com)
 *   ADMIN_PASSWORD=<password> (optional, defaults to &vFBEGCz5sVwZRt@)
 *
 * Example:
 *   node scripts/seed-production-admin.js https://your-project.supabase.co eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... admin@genkohealth.com &vFBEGCz5sVwZRt@
 */

const { createClient } = require('@supabase/supabase-js')

async function seedProductionAdmin() {
  console.log('🚀 Starting production admin seeding process...')
  console.log('⚠️  WARNING: This will modify the PRODUCTION database!')
  console.log('')

  // Get credentials from command line args or environment variables
  const supabaseUrl = process.argv[2] || process.env.PRODUCTION_SUPABASE_URL
  const serviceRoleKey = process.argv[3] || process.env.PRODUCTION_SUPABASE_SERVICE_KEY
  const adminEmail = process.argv[4] || process.env.ADMIN_EMAIL || 'admin@genkohealth.com'
  const adminPassword = process.argv[5] || process.env.ADMIN_PASSWORD || '&vFBEGCz5sVwZRt@'

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required credentials!')
    console.error('')
    console.error('Usage:')
    console.error('  node scripts/seed-production-admin.js <supabase-url> <service-role-key> [admin-email] [admin-password]')
    console.error('')
    console.error('Or set environment variables:')
    console.error('  PRODUCTION_SUPABASE_URL=<url>')
    console.error('  PRODUCTION_SUPABASE_SERVICE_KEY=<key>')
    console.error('  ADMIN_EMAIL=<email> (optional)')
    console.error('  ADMIN_PASSWORD=<password> (optional)')
    console.error('')
    console.error('Get these values from your Supabase project dashboard:')
    console.error('1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api')
    console.error('2. Copy the "Project URL" and "service_role" key')
    process.exit(1)
  }

  console.log(`📧 Admin Email: ${adminEmail}`)
  console.log(`🔐 Admin Password: ${adminPassword}`)
  console.log(`🌐 Supabase URL: ${supabaseUrl}`)
  console.log('')

  // Initialize Supabase admin client
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Step 1: Create platform organization for admin users
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
      status: 'active'
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
      .select('id, email, role, status, created_at')
      .eq('id', userId)
      .single()

    if (verifyError) {
      throw new Error(`Failed to verify user: ${verifyError.message}`)
    }

    console.log('✅ Admin user verification successful!')
    console.log('')
    console.log('🎉 PRODUCTION SUPER ADMIN USER CREATED SUCCESSFULLY!')
    console.log('====================================================')
    console.log(`Email: ${verifyData.email}`)
    console.log(`Role: ${verifyData.role}`)
    console.log(`Status: ${verifyData.status}`)
    console.log(`Created: ${new Date(verifyData.created_at).toLocaleString()}`)
    console.log('')
    console.log('🔑 PRODUCTION LOGIN CREDENTIALS:')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('')
    console.log('⚠️  IMPORTANT SECURITY NOTES:')
    console.log('   - This is the ONLY super admin account with full platform access')
    console.log('   - Platform admins can see ALL client data across the entire Genkō platform')
    console.log('   - Organization admins can only see their own organization\'s data')
    console.log('   - SAVE THESE CREDENTIALS SECURELY!')
    console.log('   - Change the password immediately after first login')
    console.log('')
    console.log('🚀 Your Vercel deployment should now be able to connect to production!')

  } catch (error) {
    console.error('❌ Error seeding production admin user:', error.message)
    console.error('')
    console.error('Troubleshooting:')
    console.error('1. Verify your Supabase credentials are correct')
    console.error('2. Ensure your Supabase project has the required tables (users, organizations)')
    console.error('3. Check that your service role key has admin permissions')
    console.error('4. Make sure you\'re not running this in a CI/CD environment')
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  seedProductionAdmin()
}

module.exports = { seedProductionAdmin }