import type {
  Tenant,
  UserProfile,
  UserRole,
  Account,
  AccountStatus,
  Loan,
  Payment,
  Notification,
  Earnings,
  CashoutRequest,
  Transaction,
  TransactionType,
  Penalty
} from './database'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: Tenant
        Insert: Omit<Tenant, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Tenant, 'id'>>
        Relationships: []
      }
      users_profile: {
        Row: UserProfile
        Insert: {
          id: string
          tenant_id?: string | null
          email: string
          role: UserRole
          full_name: string
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          tenant_id?: string | null
          email?: string
          role?: UserRole
          full_name?: string
          avatar_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      accounts: {
        Row: Account
        Insert: {
          id?: string
          assigned_agent_id: string
          name: string
          contact_info: string
          address: string
          id_proof_url?: string | null
          status?: AccountStatus
          created_at?: string
          updated_at?: string
          created_by: string
          contact_number?: string
        }
        Update: {
          assigned_agent_id?: string
          name?: string
          contact_info?: string
          address?: string
          id_proof_url?: string | null
          status?: AccountStatus
          updated_at?: string
          contact_number?: string
        }
        Relationships: []
      }
      loans: {
        Row: Loan
        Insert: Omit<Loan, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Loan, 'id'>>
        Relationships: []
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Payment, 'id'>>
        Relationships: []
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at' | 'timestamp'> & { id?: string; created_at?: string; timestamp?: string }
        Update: Partial<Omit<Notification, 'id'>>
        Relationships: []
      }
      earnings: {
        Row: Earnings
        Insert: Omit<Earnings, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Earnings, 'id'>>
        Relationships: []
      }
      cashout_requests: {
        Row: CashoutRequest
        Insert: Omit<CashoutRequest, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<CashoutRequest, 'id'>>
        Relationships: []
      }
      transactions: {
        Row: Transaction
        Insert: {
          id?: string
          type: TransactionType
          user_id: string
          account_id?: string | null
          loan_id?: string | null
          payment_id?: string | null
          details?: Record<string, any>
          timestamp?: string
          created_at?: string
        }
        Update: Partial<Omit<Transaction, 'id'>>
        Relationships: []
      }
      penalties: {
        Row: Penalty
        Insert: Omit<Penalty, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Penalty, 'id'>>
        Relationships: []
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