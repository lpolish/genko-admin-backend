export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          website: string | null
          address: string | null
          phone: string | null
          email: string | null
          subscription_tier: 'starter' | 'professional' | 'enterprise'
          subscription_status: 'active' | 'inactive' | 'suspended' | 'cancelled'
          user_limit: number
          storage_limit_gb: number
          created_at: string
          updated_at: string
          stripe_customer_id: string | null
          trial_ends_at: string | null
          settings: Record<string, unknown>
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          subscription_tier?: 'starter' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'suspended' | 'cancelled'
          user_limit?: number
          storage_limit_gb?: number
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          trial_ends_at?: string | null
          settings?: Record<string, unknown>
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          subscription_tier?: 'starter' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'suspended' | 'cancelled'
          user_limit?: number
          storage_limit_gb?: number
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          trial_ends_at?: string | null
          settings?: Record<string, unknown>
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          avatar_url: string | null
          role: 'super_admin' | 'org_admin' | 'admin' | 'provider' | 'staff' | 'patient'
          organization_id: string | null
          status: 'active' | 'inactive' | 'suspended'
          last_login_at: string | null
          created_at: string
          updated_at: string
          phone: string | null
          title: string | null
          department: string | null
          license_number: string | null
          emergency_contact: Record<string, unknown> | null
          preferences: Record<string, unknown>
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          avatar_url?: string | null
          role?: 'super_admin' | 'org_admin' | 'admin' | 'provider' | 'staff' | 'patient'
          organization_id?: string | null
          status?: 'active' | 'inactive' | 'suspended'
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          title?: string | null
          department?: string | null
          license_number?: string | null
          emergency_contact?: Record<string, unknown> | null
          preferences?: Record<string, unknown>
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          avatar_url?: string | null
          role?: 'super_admin' | 'org_admin' | 'admin' | 'provider' | 'staff' | 'patient'
          organization_id?: string | null
          status?: 'active' | 'inactive' | 'suspended'
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          title?: string | null
          department?: string | null
          license_number?: string | null
          emergency_contact?: Record<string, unknown> | null
          preferences?: Record<string, unknown>
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          details: Record<string, unknown>
          ip_address: string | null
          user_agent: string | null
          created_at: string
          severity: 'low' | 'medium' | 'high' | 'critical'
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          details?: Record<string, unknown>
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          details?: Record<string, unknown>
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
        }
      }
      organization_plans: {
        Row: {
          id: string
          organization_id: string
          plan_name: string
          plan_type: 'starter' | 'professional' | 'enterprise'
          price_monthly: number
          price_yearly: number
          features: Record<string, unknown>
          limits: Record<string, unknown>
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          plan_name: string
          plan_type?: 'starter' | 'professional' | 'enterprise'
          price_monthly?: number
          price_yearly?: number
          features?: Record<string, unknown>
          limits?: Record<string, unknown>
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          plan_name?: string
          plan_type?: 'starter' | 'professional' | 'enterprise'
          price_monthly?: number
          price_yearly?: number
          features?: Record<string, unknown>
          limits?: Record<string, unknown>
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          organization_id: string
          stripe_invoice_id: string
          amount: number
          currency: string
          status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          billing_reason: string
          period_start: string
          period_end: string
          due_date: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          stripe_invoice_id: string
          amount?: number
          currency?: string
          status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          billing_reason?: string
          period_start?: string
          period_end?: string
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          stripe_invoice_id?: string
          amount?: number
          currency?: string
          status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          billing_reason?: string
          period_start?: string
          period_end?: string
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          organization_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: 'male' | 'female' | 'other'
          email: string | null
          phone: string | null
          address: Record<string, unknown> | null
          emergency_contact: Record<string, unknown> | null
          insurance_info: Record<string, unknown> | null
          medical_history: Record<string, unknown> | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender?: 'male' | 'female' | 'other'
          email?: string | null
          phone?: string | null
          address?: Record<string, unknown> | null
          emergency_contact?: Record<string, unknown> | null
          insurance_info?: Record<string, unknown> | null
          medical_history?: Record<string, unknown> | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          gender?: 'male' | 'female' | 'other'
          email?: string | null
          phone?: string | null
          address?: Record<string, unknown> | null
          emergency_contact?: Record<string, unknown> | null
          insurance_info?: Record<string, unknown> | null
          medical_history?: Record<string, unknown> | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          organization_id: string
          patient_id: string
          provider_id: string
          appointment_type: string
          scheduled_at: string
          duration_minutes: number
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          patient_id: string
          provider_id: string
          appointment_type: string
          scheduled_at: string
          duration_minutes?: number
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          patient_id?: string
          provider_id?: string
          appointment_type?: string
          scheduled_at?: string
          duration_minutes?: number
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      insurance_claims: {
        Row: {
          id: string
          organization_id: string
          patient_id: string
          appointment_id: string | null
          claim_number: string
          provider_name: string
          service_date: string
          diagnosis_codes: string[]
          procedure_codes: string[]
          billed_amount: number
          allowed_amount: number
          paid_amount: number
          status: 'submitted' | 'approved' | 'denied' | 'pending' | 'paid'
          payer_name: string
          payer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          patient_id: string
          appointment_id?: string | null
          claim_number: string
          provider_name: string
          service_date: string
          diagnosis_codes?: string[]
          procedure_codes?: string[]
          billed_amount?: number
          allowed_amount?: number
          paid_amount?: number
          status?: 'submitted' | 'approved' | 'denied' | 'pending' | 'paid'
          payer_name: string
          payer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          patient_id?: string
          appointment_id?: string | null
          claim_number?: string
          provider_name?: string
          service_date?: string
          diagnosis_codes?: string[]
          procedure_codes?: string[]
          billed_amount?: number
          allowed_amount?: number
          paid_amount?: number
          status?: 'submitted' | 'approved' | 'denied' | 'pending' | 'paid'
          payer_name?: string
          payer_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      financial_reports: {
        Row: {
          id: string
          organization_id: string
          report_type: 'monthly' | 'quarterly' | 'annual'
          period_start: string
          period_end: string
          revenue: number
          expenses: number
          profit: number
          metrics: Record<string, unknown>
          generated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          report_type?: 'monthly' | 'quarterly' | 'annual'
          period_start: string
          period_end: string
          revenue?: number
          expenses?: number
          profit?: number
          metrics?: Record<string, unknown>
          generated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          report_type?: 'monthly' | 'quarterly' | 'annual'
          period_start?: string
          period_end?: string
          revenue?: number
          expenses?: number
          profit?: number
          metrics?: Record<string, unknown>
          generated_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Common types
export type Organization = Tables<'organizations'>
export type User = Tables<'users'>
export type AuditLog = Tables<'audit_logs'>
export type OrganizationPlan = Tables<'organization_plans'>
export type Invoice = Tables<'invoices'>
export type Patient = Tables<'patients'>
export type Appointment = Tables<'appointments'>
export type InsuranceClaim = Tables<'insurance_claims'>
export type FinancialReport = Tables<'financial_reports'>

// Extended types with relations
export interface UserWithOrganization extends User {
  organization?: Organization
}

export interface OrganizationWithStats extends Organization {
  user_count?: number
  patient_count?: number
  revenue_this_month?: number
  active_users?: number
}

// Analytics types
export interface PlatformMetrics {
  total_users: number
  total_organizations: number
  total_revenue: number
  monthly_recurring_revenue: number
  annual_recurring_revenue: number
  active_users_today: number
  new_users_this_month: number
  churn_rate: number
  conversion_rate: number
}

export interface RevenueAnalytics {
  period: string
  revenue: number
  subscriptions: number
  refunds: number
  growth_percentage: number
}

export interface UserAnalytics {
  date: string
  new_users: number
  active_users: number
  churned_users: number
  retention_rate: number
}