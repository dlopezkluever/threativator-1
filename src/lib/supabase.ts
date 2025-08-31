import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types (based on our schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          stripe_customer_id: string | null;
          holding_cell_balance: number;
          twitter_access_token: string | null;
          twitter_refresh_token: string | null;
          twitter_username: string | null;
          onboarding_completed: boolean;
          avatar_type: string;
          display_name: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          stripe_customer_id?: string | null;
          holding_cell_balance?: number;
          twitter_access_token?: string | null;
          twitter_refresh_token?: string | null;
          twitter_username?: string | null;
          onboarding_completed?: boolean;
          avatar_type?: string;
          display_name?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          stripe_customer_id?: string | null;
          holding_cell_balance?: number;
          twitter_access_token?: string | null;
          twitter_refresh_token?: string | null;
          twitter_username?: string | null;
          onboarding_completed?: boolean;
          avatar_type?: string;
          display_name?: string | null;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          final_deadline: string;
          grading_rubric: string;
          referee_type: 'ai' | 'human_witness';
          witness_contact_id: string | null;
          monetary_stake: number;
          charity_destination: 'doctors_without_borders' | 'red_cross' | 'unicef';
          minor_kompromat_id: string | null;
          major_kompromat_id: string | null;
          status: 'active' | 'completed' | 'failed' | 'paused';
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          final_deadline: string;
          grading_rubric: string;
          referee_type?: 'ai' | 'human_witness';
          witness_contact_id?: string | null;
          monetary_stake: number;
          charity_destination: 'doctors_without_borders' | 'red_cross' | 'unicef';
          minor_kompromat_id?: string | null;
          major_kompromat_id?: string | null;
          status?: 'active' | 'completed' | 'failed' | 'paused';
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          final_deadline?: string;
          grading_rubric?: string;
          referee_type?: 'ai' | 'human_witness';
          witness_contact_id?: string | null;
          monetary_stake?: number;
          charity_destination?: 'doctors_without_borders' | 'red_cross' | 'unicef';
          minor_kompromat_id?: string | null;
          major_kompromat_id?: string | null;
          status?: 'active' | 'completed' | 'failed' | 'paused';
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      grading_type: 'ai' | 'human_witness';
      goal_status: 'active' | 'completed' | 'failed' | 'paused';
      charity_enum: 'doctors_without_borders' | 'red_cross' | 'unicef';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];