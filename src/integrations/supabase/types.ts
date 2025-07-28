export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agricultural_inputs: {
        Row: {
          active_ingredient: string | null
          category: string
          concentration: string | null
          created_at: string
          description: string | null
          id: string
          manufacturer: string | null
          name: string
          unit: string
          updated_at: string
        }
        Insert: {
          active_ingredient?: string | null
          category: string
          concentration?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manufacturer?: string | null
          name: string
          unit?: string
          updated_at?: string
        }
        Update: {
          active_ingredient?: string | null
          category?: string
          concentration?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manufacturer?: string | null
          name?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          excerpt: string
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          published_at: string
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author?: string
          category: string
          content: string
          created_at?: string
          excerpt: string
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      commodity_prices: {
        Row: {
          commodity_name: string
          created_at: string
          currency: string
          date: string
          id: string
          price: number
          region: string | null
          source: string
          unit: string
          updated_at: string
        }
        Insert: {
          commodity_name: string
          created_at?: string
          currency?: string
          date?: string
          id?: string
          price: number
          region?: string | null
          source: string
          unit?: string
          updated_at?: string
        }
        Update: {
          commodity_name?: string
          created_at?: string
          currency?: string
          date?: string
          id?: string
          price?: number
          region?: string | null
          source?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          created_at: string
          currency: string
          date: string
          id: string
          input_id: string | null
          price: number
          region: string
          source: string
          source_name: string
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          date?: string
          id?: string
          input_id?: string | null
          price: number
          region: string
          source: string
          source_name: string
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          date?: string
          id?: string
          input_id?: string | null
          price?: number
          region?: string
          source?: string
          source_name?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_prices_input_id_fkey"
            columns: ["input_id"]
            isOneToOne: false
            referencedRelation: "agricultural_inputs"
            referencedColumns: ["id"]
          },
        ]
      }
      market_sources: {
        Row: {
          api_endpoint: string | null
          created_at: string
          credentials_required: boolean | null
          id: string
          is_active: boolean | null
          source_name: string
          source_type: string
          update_frequency: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string
          credentials_required?: boolean | null
          id?: string
          is_active?: boolean | null
          source_name: string
          source_type: string
          update_frequency?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string
          credentials_required?: boolean | null
          id?: string
          is_active?: boolean | null
          source_name?: string
          source_type?: string
          update_frequency?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          apetite_peso: string | null
          comportamento_psicomotor: string | null
          consultant_type: string | null
          consultation_date: string
          created_at: string
          estado_humor_afeto: string | null
          eventos_vida_relevantes: string | null
          evolucao_quadro_clinico: string | null
          exame_estado_mental: string | null
          funcionamento_cognitivo: string | null
          funcionamento_social_ocupacional: string | null
          historia_medica_psiquiatrica: string | null
          historia_molestia_atual: string | null
          historia_pessoal_social_familiar: string | null
          id: string
          identificacao_paciente: string | null
          insight_critica_doenca: string | null
          medicacao_aderencia: string | null
          observacoes_estado_mental: string | null
          padrao_pensamento: string | null
          patient_id: string | null
          patient_name: string
          plano_terapeutico_proximos_passos: string | null
          qualidade_sono: string | null
          queixa_principal: string | null
          resumo_sessao_intervencoes: string | null
          risco_impulsividade: string | null
          sintomas_fisicos: string | null
          template_type: string | null
          transcription: string | null
          updated_at: string
        }
        Insert: {
          apetite_peso?: string | null
          comportamento_psicomotor?: string | null
          consultant_type?: string | null
          consultation_date?: string
          created_at?: string
          estado_humor_afeto?: string | null
          eventos_vida_relevantes?: string | null
          evolucao_quadro_clinico?: string | null
          exame_estado_mental?: string | null
          funcionamento_cognitivo?: string | null
          funcionamento_social_ocupacional?: string | null
          historia_medica_psiquiatrica?: string | null
          historia_molestia_atual?: string | null
          historia_pessoal_social_familiar?: string | null
          id?: string
          identificacao_paciente?: string | null
          insight_critica_doenca?: string | null
          medicacao_aderencia?: string | null
          observacoes_estado_mental?: string | null
          padrao_pensamento?: string | null
          patient_id?: string | null
          patient_name: string
          plano_terapeutico_proximos_passos?: string | null
          qualidade_sono?: string | null
          queixa_principal?: string | null
          resumo_sessao_intervencoes?: string | null
          risco_impulsividade?: string | null
          sintomas_fisicos?: string | null
          template_type?: string | null
          transcription?: string | null
          updated_at?: string
        }
        Update: {
          apetite_peso?: string | null
          comportamento_psicomotor?: string | null
          consultant_type?: string | null
          consultation_date?: string
          created_at?: string
          estado_humor_afeto?: string | null
          eventos_vida_relevantes?: string | null
          evolucao_quadro_clinico?: string | null
          exame_estado_mental?: string | null
          funcionamento_cognitivo?: string | null
          funcionamento_social_ocupacional?: string | null
          historia_medica_psiquiatrica?: string | null
          historia_molestia_atual?: string | null
          historia_pessoal_social_familiar?: string | null
          id?: string
          identificacao_paciente?: string | null
          insight_critica_doenca?: string | null
          medicacao_aderencia?: string | null
          observacoes_estado_mental?: string | null
          padrao_pensamento?: string | null
          patient_id?: string | null
          patient_name?: string
          plano_terapeutico_proximos_passos?: string | null
          qualidade_sono?: string | null
          queixa_principal?: string | null
          resumo_sessao_intervencoes?: string | null
          risco_impulsividade?: string | null
          sintomas_fisicos?: string | null
          template_type?: string | null
          transcription?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string
          email: string | null
          gender: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      price_simulations: {
        Row: {
          calculated_price: number
          commissions_percentage: number | null
          commodity_name: string | null
          commodity_price: number | null
          competitive_difference: number | null
          created_at: string
          historical_average_price: number | null
          id: string
          input_id: string | null
          market_margin_percentage: number | null
          market_positioning_percentage: number | null
          notes: string | null
          operational_expenses: number | null
          purchase_cost: number
          quotation_price: number | null
          region: string
          regional_market_price: number | null
          simulation_name: string
          target_margin_percentage: number
          taxes_percentage: number | null
          trade_relation_market: number | null
          trade_relation_simulated: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          calculated_price: number
          commissions_percentage?: number | null
          commodity_name?: string | null
          commodity_price?: number | null
          competitive_difference?: number | null
          created_at?: string
          historical_average_price?: number | null
          id?: string
          input_id?: string | null
          market_margin_percentage?: number | null
          market_positioning_percentage?: number | null
          notes?: string | null
          operational_expenses?: number | null
          purchase_cost: number
          quotation_price?: number | null
          region: string
          regional_market_price?: number | null
          simulation_name: string
          target_margin_percentage: number
          taxes_percentage?: number | null
          trade_relation_market?: number | null
          trade_relation_simulated?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          calculated_price?: number
          commissions_percentage?: number | null
          commodity_name?: string | null
          commodity_price?: number | null
          competitive_difference?: number | null
          created_at?: string
          historical_average_price?: number | null
          id?: string
          input_id?: string | null
          market_margin_percentage?: number | null
          market_positioning_percentage?: number | null
          notes?: string | null
          operational_expenses?: number | null
          purchase_cost?: number
          quotation_price?: number | null
          region?: string
          regional_market_price?: number | null
          simulation_name?: string
          target_margin_percentage?: number
          taxes_percentage?: number | null
          trade_relation_market?: number | null
          trade_relation_simulated?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_simulations_input_id_fkey"
            columns: ["input_id"]
            isOneToOne: false
            referencedRelation: "agricultural_inputs"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_data: {
        Row: {
          created_at: string
          economic_indicators: Json | null
          id: string
          main_commodities: string[] | null
          region_code: string
          region_name: string
          state: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          economic_indicators?: Json | null
          id?: string
          main_commodities?: string[] | null
          region_code: string
          region_name: string
          state: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          economic_indicators?: Json | null
          id?: string
          main_commodities?: string[] | null
          region_code?: string
          region_name?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          cnpj: string | null
          company: string | null
          conheceu: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          company?: string | null
          conheceu?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          status?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          company?: string | null
          conheceu?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
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
    Enums: {},
  },
} as const
