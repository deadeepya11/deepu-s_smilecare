export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string;
          appointment_time: string;
          appointment_type: string;
          code: string;
          created_at: string;
          doctor_id: string;
          id: string;
          patient_id: string;
          reason: string;
          service: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          appointment_date?: string;
          appointment_time: string;
          appointment_type?: string;
          code: string;
          created_at?: string;
          doctor_id: string;
          id?: string;
          patient_id: string;
          reason?: string;
          service?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          appointment_date?: string;
          appointment_time?: string;
          appointment_type?: string;
          code?: string;
          created_at?: string;
          doctor_id?: string;
          id?: string;
          patient_id?: string;
          reason?: string;
          service?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      doctor_availability: {
        Row: {
          created_at: string;
          day_of_week: number;
          doctor_id: string;
          end_time: string;
          id: string;
          start_time: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          day_of_week: number;
          doctor_id: string;
          end_time: string;
          id?: string;
          start_time: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          day_of_week?: number;
          doctor_id?: string;
          end_time?: string;
          id?: string;
          start_time?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "doctor_availability_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
        ];
      };
      consultations: {
        Row: {
          affected_area: string;
          appointment_id: string;
          clinical_observation: string;
          created_at: string;
          diagnosis: string;
          doctor_id: string;
          doctor_notes: string;
          id: string;
          pain_level: number | null;
          patient_id: string;
          problem: string;
          status: string;
          symptoms: string;
          tooth_number: string;
          updated_at: string;
        };
        Insert: {
          affected_area?: string;
          appointment_id: string;
          clinical_observation?: string;
          created_at?: string;
          diagnosis?: string;
          doctor_id: string;
          doctor_notes?: string;
          id?: string;
          pain_level?: number | null;
          patient_id: string;
          problem?: string;
          status?: string;
          symptoms?: string;
          tooth_number?: string;
          updated_at?: string;
        };
        Update: {
          affected_area?: string;
          appointment_id?: string;
          clinical_observation?: string;
          created_at?: string;
          diagnosis?: string;
          doctor_id?: string;
          doctor_notes?: string;
          id?: string;
          pain_level?: number | null;
          patient_id?: string;
          problem?: string;
          status?: string;
          symptoms?: string;
          tooth_number?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consultations_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consultations_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      doctors: {
        Row: {
          availability: string;
          bio: string;
          created_at: string;
          email: string;
          experience_years: number;
          id: string;
          name: string;
          phone: string;
          profile_image: string | null;
          qualification: string;
          registration_number: string;
          specialization: string;
          status: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          availability?: string;
          bio?: string;
          created_at?: string;
          email: string;
          experience_years?: number;
          id?: string;
          name: string;
          phone?: string;
          profile_image?: string | null;
          qualification?: string;
          registration_number?: string;
          specialization?: string;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          availability?: string;
          bio?: string;
          created_at?: string;
          email?: string;
          experience_years?: number;
          id?: string;
          name?: string;
          phone?: string;
          profile_image?: string | null;
          qualification?: string;
          registration_number?: string;
          specialization?: string;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      medicines: {
        Row: {
          created_at: string;
          default_dosage: string;
          default_duration: string;
          default_frequency: string;
          default_instructions: string;
          form: string;
          generic_name: string;
          id: string;
          name: string;
          status: string;
          strength: string;
        };
        Insert: {
          created_at?: string;
          default_dosage?: string;
          default_duration?: string;
          default_frequency?: string;
          default_instructions?: string;
          form?: string;
          generic_name?: string;
          id?: string;
          name: string;
          status?: string;
          strength?: string;
        };
        Update: {
          created_at?: string;
          default_dosage?: string;
          default_duration?: string;
          default_frequency?: string;
          default_instructions?: string;
          form?: string;
          generic_name?: string;
          id?: string;
          name?: string;
          status?: string;
          strength?: string;
        };
        Relationships: [];
      };
      patients: {
        Row: {
          age: number | null;
          code: string;
          created_at: string;
          email: string | null;
          gender: string | null;
          id: string;
          name: string;
          phone: string;
          updated_at: string;
        };
        Insert: {
          age?: number | null;
          code: string;
          created_at?: string;
          email?: string | null;
          gender?: string | null;
          id?: string;
          name: string;
          phone: string;
          updated_at?: string;
        };
        Update: {
          age?: number | null;
          code?: string;
          created_at?: string;
          email?: string | null;
          gender?: string | null;
          id?: string;
          name?: string;
          phone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      prescription_items: {
        Row: {
          created_at: string;
          dosage: string;
          duration: string;
          frequency: string;
          id: string;
          instructions: string;
          medicine_id: string | null;
          medicine_name: string;
          prescription_id: string;
          strength: string;
        };
        Insert: {
          created_at?: string;
          dosage?: string;
          duration?: string;
          frequency?: string;
          id?: string;
          instructions?: string;
          medicine_id?: string | null;
          medicine_name: string;
          prescription_id: string;
          strength?: string;
        };
        Update: {
          created_at?: string;
          dosage?: string;
          duration?: string;
          frequency?: string;
          id?: string;
          instructions?: string;
          medicine_id?: string | null;
          medicine_name?: string;
          prescription_id?: string;
          strength?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prescription_items_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prescription_items_prescription_id_fkey";
            columns: ["prescription_id"];
            isOneToOne: false;
            referencedRelation: "prescriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      prescriptions: {
        Row: {
          appointment_id: string;
          code: string;
          consultation_id: string;
          created_at: string;
          diagnosis: string;
          doctor_id: string;
          doctor_notes: string;
          follow_up_date: string | null;
          id: string;
          patient_id: string;
          problem: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          appointment_id: string;
          code?: string;
          consultation_id: string;
          created_at?: string;
          diagnosis?: string;
          doctor_id: string;
          doctor_notes?: string;
          follow_up_date?: string | null;
          id?: string;
          patient_id: string;
          problem?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          appointment_id?: string;
          code?: string;
          consultation_id?: string;
          created_at?: string;
          diagnosis?: string;
          doctor_id?: string;
          doctor_notes?: string;
          follow_up_date?: string | null;
          id?: string;
          patient_id?: string;
          problem?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prescriptions_consultation_id_fkey";
            columns: ["consultation_id"];
            isOneToOne: false;
            referencedRelation: "consultations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      problem_medicines: {
        Row: {
          id: string;
          medicine_id: string;
          note: string;
          problem_id: string;
        };
        Insert: {
          id?: string;
          medicine_id: string;
          note?: string;
          problem_id: string;
        };
        Update: {
          id?: string;
          medicine_id?: string;
          note?: string;
          problem_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "problem_medicines_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "problem_medicines_problem_id_fkey";
            columns: ["problem_id"];
            isOneToOne: false;
            referencedRelation: "problems";
            referencedColumns: ["id"];
          },
        ];
      };
      problems: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      book_appointment: {
        Args: {
          p_age: number;
          p_date: string;
          p_doctor_id: string;
          p_email: string;
          p_gender: string;
          p_name: string;
          p_phone: string;
          p_reason: string;
          p_service: string;
          p_time: string;
          p_type: string;
        };
        Returns: {
          appointment_code: string;
          patient_code: string;
        }[];
      };
      current_doctor_id: { Args: never; Returns: string };
      link_doctor_account: { Args: never; Returns: string };
      is_doctor_available: {
        Args: {
          p_date: string;
          p_doctor_id: string;
          p_time: string;
        };
        Returns: boolean;
      };
      get_available_slots: {
        Args: {
          p_date: string;
          p_doctor_id: string;
        };
        Returns: { slot: string; available: boolean }[];
      };
      register_doctor_profile: {
        Args: {
          p_bio: string;
          p_experience_years: number;
          p_name: string;
          p_phone: string;
          p_qualification: string;
          p_registration_number: string;
          p_specialization: string;
        };
        Returns: { email: string; id: string }[];
      };
      get_patient_prescription: {
        Args: {
          p_patient_code: string;
          p_appointment_code: string;
        };
        Returns: any;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
