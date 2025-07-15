export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string
          email: string | null
          national_id: string | null
          phone: string
          role: string
          branch_id: string | null
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          full_name: string
          email?: string | null
          national_id?: string | null
          phone: string
          role?: string
          branch_id?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          email?: string | null
          national_id?: string | null
          phone?: string
          role?: string
          branch_id?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      members: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          national_id: string
          phone: string
          gender: string
          birth_date: string | null
          city: string
          address: string | null
          email: string | null
          status: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
          age: number | null
          disability_type: string | null
          disability_details: string | null
          disability_card_number: string | null
          education_level: string | null
          employment_status: string | null
          job_title: string | null
          employer: string | null
          monthly_income: number | null
          building_number: string | null
          street_name: string | null
          district: string | null
          postal_code: string | null
          additional_number: string | null
          alternative_phone: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          preferred_branch_id: string | null
          registration_status: string | null
          reviewed_by_employee: string | null
          reviewed_by_manager: string | null
          employee_review_date: string | null
          manager_review_date: string | null
          employee_notes: string | null
          manager_notes: string | null
          rejection_reason: string | null
          profile_completion_percentage: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          national_id: string
          phone: string
          gender: string
          birth_date?: string | null
          city: string
          address?: string | null
          email?: string | null
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          age?: number | null
          disability_type?: string | null
          disability_details?: string | null
          disability_card_number?: string | null
          education_level?: string | null
          employment_status?: string | null
          job_title?: string | null
          employer?: string | null
          monthly_income?: number | null
          building_number?: string | null
          street_name?: string | null
          district?: string | null
          postal_code?: string | null
          additional_number?: string | null
          alternative_phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          preferred_branch_id?: string | null
          registration_status?: string | null
          reviewed_by_employee?: string | null
          reviewed_by_manager?: string | null
          employee_review_date?: string | null
          manager_review_date?: string | null
          employee_notes?: string | null
          manager_notes?: string | null
          rejection_reason?: string | null
          profile_completion_percentage?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          national_id?: string
          phone?: string
          gender?: string
          birth_date?: string | null
          city?: string
          address?: string | null
          email?: string | null
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          age?: number | null
          disability_type?: string | null
          disability_details?: string | null
          disability_card_number?: string | null
          education_level?: string | null
          employment_status?: string | null
          job_title?: string | null
          employer?: string | null
          monthly_income?: number | null
          building_number?: string | null
          street_name?: string | null
          district?: string | null
          postal_code?: string | null
          additional_number?: string | null
          alternative_phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          preferred_branch_id?: string | null
          registration_status?: string | null
          reviewed_by_employee?: string | null
          reviewed_by_manager?: string | null
          employee_review_date?: string | null
          manager_review_date?: string | null
          employee_notes?: string | null
          manager_notes?: string | null
          rejection_reason?: string | null
          profile_completion_percentage?: number | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
