export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string
          employer_last_read_at: string
          id: string
          job_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          worker_id: string
          worker_last_read_at: string
        }
        Insert: {
          applied_at?: string
          employer_last_read_at?: string
          id?: string
          job_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          worker_id: string
          worker_last_read_at?: string
        }
        Update: {
          applied_at?: string
          employer_last_read_at?: string
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          worker_id?: string
          worker_last_read_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_worker_id_profiles_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          icon: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          icon: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          icon?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      cities: {
        Row: {
          id: string
          name: string
          slug: string
          state: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          state: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          state?: string
        }
        Relationships: []
      }
      employers: {
        Row: {
          city: string | null
          company_name: string
          contact_person: string | null
          created_at: string
          email: string | null
          gst: string | null
          id: string
          industry: string | null
          logo_url: string | null
          phone: string | null
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          city?: string | null
          company_name: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gst?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          city?: string | null
          company_name?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gst?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      jobs: {
        Row: {
          area: string | null
          category: string
          city: string
          created_at: string
          description: string
          employer_id: string
          experience_required: number
          gender_preference: string | null
          id: string
          openings: number
          salary_max: number
          salary_min: number
          shift_type: Database["public"]["Enums"]["shift_type"]
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          urgent: boolean
          views: number
        }
        Insert: {
          area?: string | null
          category: string
          city: string
          created_at?: string
          description: string
          employer_id: string
          experience_required?: number
          gender_preference?: string | null
          id?: string
          openings?: number
          salary_max: number
          salary_min: number
          shift_type?: Database["public"]["Enums"]["shift_type"]
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          urgent?: boolean
          views?: number
        }
        Update: {
          area?: string | null
          category?: string
          city?: string
          created_at?: string
          description?: string
          employer_id?: string
          experience_required?: number
          gender_preference?: string | null
          id?: string
          openings?: number
          salary_max?: number
          salary_min?: number
          shift_type?: Database["public"]["Enums"]["shift_type"]
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          urgent?: boolean
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          application_id: string
          body: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          application_id: string
          body: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          application_id?: string
          body?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aadhaar_last4: string | null
          age: number | null
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          experience_years: number | null
          gender: string | null
          id: string
          languages: string[] | null
          name: string | null
          phone: string | null
          preferred_category: string | null
          resume_url: string | null
          salary_expectation: number | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          aadhaar_last4?: string | null
          age?: number | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          gender?: string | null
          id: string
          languages?: string[] | null
          name?: string | null
          phone?: string | null
          preferred_category?: string | null
          resume_url?: string | null
          salary_expectation?: number | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          aadhaar_last4?: string | null
          age?: number | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          gender?: string | null
          id?: string
          languages?: string[] | null
          name?: string | null
          phone?: string | null
          preferred_category?: string | null
          resume_url?: string | null
          salary_expectation?: number | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          worker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_application_participant: {
        Args: { _application_id: string; _user_id: string }
        Returns: boolean
      }
      mark_application_read: {
        Args: { _application_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "worker" | "employer" | "admin"
      application_status:
        | "applied"
        | "viewed"
        | "shortlisted"
        | "interview"
        | "hired"
        | "rejected"
      job_status: "draft" | "live" | "paused" | "closed"
      shift_type: "day" | "night" | "flexible" | "full_time" | "part_time"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["worker", "employer", "admin"],
      application_status: [
        "applied",
        "viewed",
        "shortlisted",
        "interview",
        "hired",
        "rejected",
      ],
      job_status: ["draft", "live", "paused", "closed"],
      shift_type: ["day", "night", "flexible", "full_time", "part_time"],
    },
  },
} as const
