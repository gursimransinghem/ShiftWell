export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          chronotype: 'early' | 'intermediate' | 'late';
          sleep_hours_preferred: number;
          caffeine_sensitivity: 'low' | 'medium' | 'high';
          caffeine_half_life: number;
          nap_preference: boolean;
          household_size: number;
          has_young_children: boolean;
          has_pets: boolean;
          commute_minutes: number;
          onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          chronotype?: 'early' | 'intermediate' | 'late';
          sleep_hours_preferred?: number;
          caffeine_sensitivity?: 'low' | 'medium' | 'high';
          caffeine_half_life?: number;
          nap_preference?: boolean;
          household_size?: number;
          has_young_children?: boolean;
          has_pets?: boolean;
          commute_minutes?: number;
          onboarding_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          chronotype?: 'early' | 'intermediate' | 'late';
          sleep_hours_preferred?: number;
          caffeine_sensitivity?: 'low' | 'medium' | 'high';
          caffeine_half_life?: number;
          nap_preference?: boolean;
          household_size?: number;
          has_young_children?: boolean;
          has_pets?: boolean;
          commute_minutes?: number;
          onboarding_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      shifts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          start_time: string;
          end_time: string;
          shift_type: 'day' | 'evening' | 'night' | 'extended';
          source: 'manual' | 'ics_import';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          start_time: string;
          end_time: string;
          shift_type: 'day' | 'evening' | 'night' | 'extended';
          source?: 'manual' | 'ics_import';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          start_time?: string;
          end_time?: string;
          shift_type?: 'day' | 'evening' | 'night' | 'extended';
          source?: 'manual' | 'ics_import';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'shifts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      personal_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          start_time: string;
          end_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          start_time?: string;
          end_time?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'personal_events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      sleep_plans: {
        Row: {
          id: string;
          user_id: string;
          plan_start_date: string;
          plan_end_date: string;
          plan_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_start_date: string;
          plan_end_date: string;
          plan_data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_start_date?: string;
          plan_end_date?: string;
          plan_data?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sleep_plans_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      health_data: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          actual_sleep_start: string | null;
          actual_sleep_end: string | null;
          actual_sleep_minutes: number | null;
          sleep_quality_score: number | null;
          in_bed_start: string | null;
          in_bed_end: string | null;
          heart_rate_avg_sleeping: number | null;
          source: 'healthkit' | 'manual';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          actual_sleep_start?: string | null;
          actual_sleep_end?: string | null;
          actual_sleep_minutes?: number | null;
          sleep_quality_score?: number | null;
          in_bed_start?: string | null;
          in_bed_end?: string | null;
          heart_rate_avg_sleeping?: number | null;
          source?: 'healthkit' | 'manual';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          actual_sleep_start?: string | null;
          actual_sleep_end?: string | null;
          actual_sleep_minutes?: number | null;
          sleep_quality_score?: number | null;
          in_bed_start?: string | null;
          in_bed_end?: string | null;
          heart_rate_avg_sleeping?: number | null;
          source?: 'healthkit' | 'manual';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'health_data_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: 'free' | 'premium';
          started_at: string;
          expires_at: string | null;
          revenue_cat_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: 'free' | 'premium';
          started_at?: string;
          expires_at?: string | null;
          revenue_cat_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: 'free' | 'premium';
          started_at?: string;
          expires_at?: string | null;
          revenue_cat_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;
