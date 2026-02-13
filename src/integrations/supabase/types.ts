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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_role: {
        Row: {
          code: string
          description: string | null
          name: string
        }
        Insert: {
          code: string
          description?: string | null
          name: string
        }
        Update: {
          code?: string
          description?: string | null
          name?: string
        }
        Relationships: []
      }
      app_user: {
        Row: {
          auth_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          auth_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          auth_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_event: {
        Row: {
          actor_role_code: string | null
          actor_user_id: string | null
          entity_id: string
          entity_type: string
          event_payload: Json | null
          event_type: string
          id: string
          occurred_at: string | null
        }
        Insert: {
          actor_role_code?: string | null
          actor_user_id?: string | null
          entity_id: string
          entity_type: string
          event_payload?: Json | null
          event_type: string
          id?: string
          occurred_at?: string | null
        }
        Update: {
          actor_role_code?: string | null
          actor_user_id?: string | null
          entity_id?: string
          entity_type?: string
          event_payload?: Json | null
          event_type?: string
          id?: string
          occurred_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_event_actor_role_code_fkey"
            columns: ["actor_role_code"]
            isOneToOne: false
            referencedRelation: "app_role"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "audit_event_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
        ]
      }
      missive_keyword: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          label: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          label: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
        }
        Relationships: []
      }
      rvm_agenda_item: {
        Row: {
          agenda_number: number
          created_at: string | null
          dossier_id: string
          id: string
          meeting_id: string
          notes: string | null
          status: Database["public"]["Enums"]["agenda_item_status"] | null
          title_override: string | null
        }
        Insert: {
          agenda_number: number
          created_at?: string | null
          dossier_id: string
          id?: string
          meeting_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["agenda_item_status"] | null
          title_override?: string | null
        }
        Update: {
          agenda_number?: number
          created_at?: string | null
          dossier_id?: string
          id?: string
          meeting_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["agenda_item_status"] | null
          title_override?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rvm_agenda_item_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "rvm_dossier"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvm_agenda_item_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "rvm_meeting"
            referencedColumns: ["id"]
          },
        ]
      }
      rvm_decision: {
        Row: {
          agenda_item_id: string
          chair_approved_at: string | null
          chair_approved_by: string | null
          created_at: string | null
          decision_status: Database["public"]["Enums"]["decision_status"] | null
          decision_text: string
          id: string
          is_final: boolean | null
          updated_at: string | null
        }
        Insert: {
          agenda_item_id: string
          chair_approved_at?: string | null
          chair_approved_by?: string | null
          created_at?: string | null
          decision_status?:
            | Database["public"]["Enums"]["decision_status"]
            | null
          decision_text: string
          id?: string
          is_final?: boolean | null
          updated_at?: string | null
        }
        Update: {
          agenda_item_id?: string
          chair_approved_at?: string | null
          chair_approved_by?: string | null
          created_at?: string | null
          decision_status?:
            | Database["public"]["Enums"]["decision_status"]
            | null
          decision_text?: string
          id?: string
          is_final?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rvm_decision_agenda_item_id_fkey"
            columns: ["agenda_item_id"]
            isOneToOne: true
            referencedRelation: "rvm_agenda_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvm_decision_chair_approved_by_fkey"
            columns: ["chair_approved_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
        ]
      }
      rvm_document: {
        Row: {
          agenda_item_id: string | null
          confidentiality_level:
            | Database["public"]["Enums"]["confidentiality_level"]
            | null
          created_at: string | null
          created_by: string | null
          current_version_id: string | null
          decision_id: string | null
          doc_type: Database["public"]["Enums"]["document_type"]
          dossier_id: string
          id: string
          title: string
        }
        Insert: {
          agenda_item_id?: string | null
          confidentiality_level?:
            | Database["public"]["Enums"]["confidentiality_level"]
            | null
          created_at?: string | null
          created_by?: string | null
          current_version_id?: string | null
          decision_id?: string | null
          doc_type: Database["public"]["Enums"]["document_type"]
          dossier_id: string
          id?: string
          title: string
        }
        Update: {
          agenda_item_id?: string | null
          confidentiality_level?:
            | Database["public"]["Enums"]["confidentiality_level"]
            | null
          created_at?: string | null
          created_by?: string | null
          current_version_id?: string | null
          decision_id?: string | null
          doc_type?: Database["public"]["Enums"]["document_type"]
          dossier_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_current_version"
            columns: ["current_version_id"]
            isOneToOne: false
            referencedRelation: "rvm_document_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvm_document_agenda_item_id_fkey"
            columns: ["agenda_item_id"]
            isOneToOne: false
            referencedRelation: "rvm_agenda_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvm_document_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvm_document_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "rvm_decision"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvm_document_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "rvm_dossier"
            referencedColumns: ["id"]
          },
        ]
      }
      rvm_document_version: {
        Row: {
          checksum: string | null
          document_id: string
          file_name: string
          file_size: number
          id: string
          mime_type: string
          storage_path: string
          uploaded_at: string | null
          uploaded_by: string | null
          version_number: number
        }
        Insert: {
          checksum?: string | null
          document_id: string
          file_name: string
          file_size: number
          id?: string
          mime_type: string
          storage_path: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          version_number: number
        }
        Update: {
          checksum?: string | null
          document_id?: string
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string
          storage_path?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "rvm_document_version_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "rvm_document"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvm_document_version_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
        ]
      }
      rvm_dossier: {
        Row: {
          confidentiality_level:
            | Database["public"]["Enums"]["confidentiality_level"]
            | null
          created_at: string | null
          created_by: string | null
          dossier_number: string
          id: string
          missive_keyword_id: string | null
          proposal_subtype:
            | Database["public"]["Enums"]["proposal_subtype"]
            | null
          sender_ministry: string
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["dossier_status"] | null
          summary: string | null
          title: string
          updated_at: string | null
          urgency: Database["public"]["Enums"]["urgency_level"] | null
        }
        Insert: {
          confidentiality_level?:
            | Database["public"]["Enums"]["confidentiality_level"]
            | null
          created_at?: string | null
          created_by?: string | null
          dossier_number: string
          id?: string
          missive_keyword_id?: string | null
          proposal_subtype?:
            | Database["public"]["Enums"]["proposal_subtype"]
            | null
          sender_ministry: string
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["dossier_status"] | null
          summary?: string | null
          title: string
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Update: {
          confidentiality_level?:
            | Database["public"]["Enums"]["confidentiality_level"]
            | null
          created_at?: string | null
          created_by?: string | null
          dossier_number?: string
          id?: string
          missive_keyword_id?: string | null
          proposal_subtype?:
            | Database["public"]["Enums"]["proposal_subtype"]
            | null
          sender_ministry?: string
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["dossier_status"] | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Relationships: [
          {
            foreignKeyName: "rvm_dossier_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvm_dossier_missive_keyword_id_fkey"
            columns: ["missive_keyword_id"]
            isOneToOne: false
            referencedRelation: "missive_keyword"
            referencedColumns: ["id"]
          },
        ]
      }
      rvm_item: {
        Row: {
          attachments_expected: boolean | null
          created_at: string | null
          description: string | null
          dossier_id: string
          id: string
          item_type: Database["public"]["Enums"]["service_type"]
          received_date: string | null
          reference_code: string | null
        }
        Insert: {
          attachments_expected?: boolean | null
          created_at?: string | null
          description?: string | null
          dossier_id: string
          id?: string
          item_type: Database["public"]["Enums"]["service_type"]
          received_date?: string | null
          reference_code?: string | null
        }
        Update: {
          attachments_expected?: boolean | null
          created_at?: string | null
          description?: string | null
          dossier_id?: string
          id?: string
          item_type?: Database["public"]["Enums"]["service_type"]
          received_date?: string | null
          reference_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rvm_item_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: true
            referencedRelation: "rvm_dossier"
            referencedColumns: ["id"]
          },
        ]
      }
      rvm_meeting: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          location: string | null
          meeting_date: string
          meeting_type: Database["public"]["Enums"]["meeting_type"] | null
          status: Database["public"]["Enums"]["meeting_status"] | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          location?: string | null
          meeting_date: string
          meeting_type?: Database["public"]["Enums"]["meeting_type"] | null
          status?: Database["public"]["Enums"]["meeting_status"] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          location?: string | null
          meeting_date?: string
          meeting_type?: Database["public"]["Enums"]["meeting_type"] | null
          status?: Database["public"]["Enums"]["meeting_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "rvm_meeting_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
        ]
      }
      rvm_task: {
        Row: {
          assigned_role_code: string
          assigned_user_id: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          dossier_id: string
          due_at: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_role_code: string
          assigned_user_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dossier_id: string
          due_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_role_code?: string
          assigned_user_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dossier_id?: string
          due_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rvm_task_assigned_role_code_fkey"
            columns: ["assigned_role_code"]
            isOneToOne: false
            referencedRelation: "app_role"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "rvm_task_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvm_task_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvm_task_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "rvm_dossier"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admin_bootstrap: {
        Row: {
          auth_id: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          purpose: string | null
        }
        Insert: {
          auth_id?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          purpose?: string | null
        }
        Update: {
          auth_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          purpose?: string | null
        }
        Relationships: []
      }
      user_role: {
        Row: {
          assigned_at: string | null
          role_code: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          role_code: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          role_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "app_role"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "user_role_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_id: { Args: never; Returns: string }
      get_user_directory: {
        Args: never
        Returns: {
          email: string
          full_name: string
          id: string
        }[]
      }
      get_user_roles: { Args: never; Returns: string[] }
      has_any_role: { Args: { required_roles: string[] }; Returns: boolean }
      has_role: { Args: { required_role: string }; Returns: boolean }
      is_decision_draft: { Args: { p_decision_id: string }; Returns: boolean }
      is_dossier_editable: { Args: { p_dossier_id: string }; Returns: boolean }
      is_meeting_editable: { Args: { p_meeting_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      is_task_assignee: { Args: { p_task_id: string }; Returns: boolean }
    }
    Enums: {
      agenda_item_status: "scheduled" | "presented" | "withdrawn" | "moved"
      confidentiality_level:
        | "standard_confidential"
        | "restricted"
        | "highly_restricted"
      decision_status: "approved" | "deferred" | "rejected" | "pending"
      document_type:
        | "proposal"
        | "missive"
        | "attachment"
        | "decision_list"
        | "minutes"
        | "other"
      dossier_status:
        | "draft"
        | "registered"
        | "in_preparation"
        | "scheduled"
        | "decided"
        | "archived"
        | "cancelled"
      meeting_status: "draft" | "published" | "closed"
      meeting_type: "regular" | "urgent" | "special"
      proposal_subtype: "OPA" | "ORAG"
      service_type: "proposal" | "missive"
      task_priority: "normal" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "blocked" | "done" | "cancelled"
      task_type:
        | "intake"
        | "dossier_management"
        | "agenda_prep"
        | "reporting"
        | "review"
        | "distribution"
        | "other"
      urgency_level: "regular" | "urgent" | "special"
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
      agenda_item_status: ["scheduled", "presented", "withdrawn", "moved"],
      confidentiality_level: [
        "standard_confidential",
        "restricted",
        "highly_restricted",
      ],
      decision_status: ["approved", "deferred", "rejected", "pending"],
      document_type: [
        "proposal",
        "missive",
        "attachment",
        "decision_list",
        "minutes",
        "other",
      ],
      dossier_status: [
        "draft",
        "registered",
        "in_preparation",
        "scheduled",
        "decided",
        "archived",
        "cancelled",
      ],
      meeting_status: ["draft", "published", "closed"],
      meeting_type: ["regular", "urgent", "special"],
      proposal_subtype: ["OPA", "ORAG"],
      service_type: ["proposal", "missive"],
      task_priority: ["normal", "high", "urgent"],
      task_status: ["todo", "in_progress", "blocked", "done", "cancelled"],
      task_type: [
        "intake",
        "dossier_management",
        "agenda_prep",
        "reporting",
        "review",
        "distribution",
        "other",
      ],
      urgency_level: ["regular", "urgent", "special"],
    },
  },
} as const
