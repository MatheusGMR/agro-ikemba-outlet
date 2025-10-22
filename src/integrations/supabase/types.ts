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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      chatbot_analytics: {
        Row: {
          bot_response: string | null
          created_at: string
          id: string
          menu_option: string | null
          message_type: string
          phone_number: string
          response_time_ms: number | null
          session_id: string | null
          user_id: string | null
          user_message: string | null
        }
        Insert: {
          bot_response?: string | null
          created_at?: string
          id?: string
          menu_option?: string | null
          message_type: string
          phone_number: string
          response_time_ms?: number | null
          session_id?: string | null
          user_id?: string | null
          user_message?: string | null
        }
        Update: {
          bot_response?: string | null
          created_at?: string
          id?: string
          menu_option?: string | null
          message_type?: string
          phone_number?: string
          response_time_ms?: number | null
          session_id?: string | null
          user_id?: string | null
          user_message?: string | null
        }
        Relationships: []
      }
      checkout_funnel_logs: {
        Row: {
          action_type: string
          checkout_step: string
          created_at: string
          id: string
          session_id: string
          step_data: Json | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          checkout_step: string
          created_at?: string
          id?: string
          session_id: string
          step_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          checkout_step?: string
          created_at?: string
          id?: string
          session_id?: string
          step_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      city_coordinates: {
        Row: {
          city: string
          created_at: string | null
          id: string
          latitude: number
          longitude: number
          state: string
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: string
          latitude: number
          longitude: number
          state: string
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: string
          latitude?: number
          longitude?: number
          state?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          base_value: number
          commission_amount: number
          commission_percentage: number
          created_at: string
          due_date: string | null
          id: string
          order_id: string | null
          paid_date: string | null
          representative_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          base_value: number
          commission_amount: number
          commission_percentage: number
          created_at?: string
          due_date?: string | null
          id?: string
          order_id?: string | null
          paid_date?: string | null
          representative_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          base_value?: number
          commission_amount?: number
          commission_percentage?: number
          created_at?: string
          due_date?: string | null
          id?: string
          order_id?: string | null
          paid_date?: string | null
          representative_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_representative_id_fkey"
            columns: ["representative_id"]
            isOneToOne: false
            referencedRelation: "representatives"
            referencedColumns: ["id"]
          },
        ]
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
      inventory: {
        Row: {
          active_ingredient: string | null
          base_price: number
          city: string
          commission_unit: number | null
          created_at: string
          expiry_date: string
          id: string
          manufacturer: string
          mapa_number: string | null
          packaging: string
          preco_afiliado: number | null
          preco_banda_maior: number | null
          preco_banda_menor: number | null
          product_name: string
          product_sku: string
          state: string
          total_volume: number
          unit: string
          updated_at: string
        }
        Insert: {
          active_ingredient?: string | null
          base_price: number
          city: string
          commission_unit?: number | null
          created_at?: string
          expiry_date: string
          id?: string
          manufacturer: string
          mapa_number?: string | null
          packaging?: string
          preco_afiliado?: number | null
          preco_banda_maior?: number | null
          preco_banda_menor?: number | null
          product_name: string
          product_sku: string
          state: string
          total_volume: number
          unit?: string
          updated_at?: string
        }
        Update: {
          active_ingredient?: string | null
          base_price?: number
          city?: string
          commission_unit?: number | null
          created_at?: string
          expiry_date?: string
          id?: string
          manufacturer?: string
          mapa_number?: string | null
          packaging?: string
          preco_afiliado?: number | null
          preco_banda_maior?: number | null
          preco_banda_menor?: number | null
          product_name?: string
          product_sku?: string
          state?: string
          total_volume?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_reservations: {
        Row: {
          city: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          inventory_item_id: string | null
          notes: string | null
          opportunity_id: string | null
          product_sku: string
          proposal_id: string | null
          reserved_volume: number
          state: string
          status: string
          updated_at: string
        }
        Insert: {
          city: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          inventory_item_id?: string | null
          notes?: string | null
          opportunity_id?: string | null
          product_sku: string
          proposal_id?: string | null
          reserved_volume: number
          state: string
          status?: string
          updated_at?: string
        }
        Update: {
          city?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          inventory_item_id?: string | null
          notes?: string | null
          opportunity_id?: string | null
          product_sku?: string
          proposal_id?: string | null
          reserved_volume?: number
          state?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
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
      ofertas_compra: {
        Row: {
          cidade_entrega: string
          created_at: string
          estado_entrega: string
          id: string
          observacoes: string | null
          prazo_entrega_desejado: number | null
          preco_ofertado: number
          produto_nome: string
          produto_sku: string
          resposta_fornecedor: string | null
          revenda_id: string
          status: string
          updated_at: string
          validade_oferta: string
          volume_desejado: number
        }
        Insert: {
          cidade_entrega: string
          created_at?: string
          estado_entrega: string
          id?: string
          observacoes?: string | null
          prazo_entrega_desejado?: number | null
          preco_ofertado: number
          produto_nome: string
          produto_sku: string
          resposta_fornecedor?: string | null
          revenda_id: string
          status?: string
          updated_at?: string
          validade_oferta: string
          volume_desejado: number
        }
        Update: {
          cidade_entrega?: string
          created_at?: string
          estado_entrega?: string
          id?: string
          observacoes?: string | null
          prazo_entrega_desejado?: number | null
          preco_ofertado?: number
          produto_nome?: string
          produto_sku?: string
          resposta_fornecedor?: string | null
          revenda_id?: string
          status?: string
          updated_at?: string
          validade_oferta?: string
          volume_desejado?: number
        }
        Relationships: [
          {
            foreignKeyName: "ofertas_compra_revenda_id_fkey"
            columns: ["revenda_id"]
            isOneToOne: false
            referencedRelation: "revendas"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          estimated_commission: number | null
          estimated_value: number | null
          expected_close_date: string | null
          id: string
          next_action: string | null
          next_action_date: string | null
          probability: number | null
          representative_id: string
          stage: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          estimated_commission?: number | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          next_action?: string | null
          next_action_date?: string | null
          probability?: number | null
          representative_id: string
          stage?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          estimated_commission?: number | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          next_action?: string | null
          next_action_date?: string | null
          probability?: number | null
          representative_id?: string
          stage?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "rep_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_representative_id_fkey"
            columns: ["representative_id"]
            isOneToOne: false
            referencedRelation: "representatives"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_items: {
        Row: {
          commission_unit: number
          created_at: string
          id: string
          opportunity_id: string
          overprice_amount: number | null
          overprice_percentage: number | null
          product_name: string
          product_sku: string
          quantity: number
          total_commission: number
          total_price: number
          unit_price: number
        }
        Insert: {
          commission_unit: number
          created_at?: string
          id?: string
          opportunity_id: string
          overprice_amount?: number | null
          overprice_percentage?: number | null
          product_name: string
          product_sku: string
          quantity: number
          total_commission: number
          total_price: number
          unit_price: number
        }
        Update: {
          commission_unit?: number
          created_at?: string
          id?: string
          opportunity_id?: string
          overprice_amount?: number | null
          overprice_percentage?: number | null
          product_name?: string
          product_sku?: string
          quantity?: number
          total_commission?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_items_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      order_documents: {
        Row: {
          document_type: string
          document_url: string
          downloaded_at: string | null
          generated_at: string
          id: string
          order_id: string
          user_id: string | null
        }
        Insert: {
          document_type: string
          document_url: string
          downloaded_at?: string | null
          generated_at?: string
          id?: string
          order_id: string
          user_id?: string | null
        }
        Update: {
          document_type?: string
          document_url?: string
          downloaded_at?: string | null
          generated_at?: string
          id?: string
          order_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          boleto_barcode: string | null
          boleto_line: string | null
          boleto_url: string | null
          created_at: string
          external_id: string | null
          id: string
          items: Json
          logistics_option: string
          order_number: string
          payment_confirmed_at: string | null
          payment_method: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          boleto_barcode?: string | null
          boleto_line?: string | null
          boleto_url?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          items: Json
          logistics_option: string
          order_number?: string
          payment_confirmed_at?: string | null
          payment_method: string
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          boleto_barcode?: string | null
          boleto_line?: string | null
          boleto_url?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          items?: Json
          logistics_option?: string
          order_number?: string
          payment_confirmed_at?: string | null
          payment_method?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      product_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          document_url: string
          id: string
          product_sku: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          document_url: string
          id?: string
          product_sku: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          document_url?: string
          id?: string
          product_sku?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          image_type: string | null
          image_url: string
          product_sku: string
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_type?: string | null
          image_url: string
          product_sku: string
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_type?: string | null
          image_url?: string
          product_sku?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_data: Json | null
          interaction_type: string
          product_sku: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_data?: Json | null
          interaction_type: string
          product_sku: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interaction_data?: Json | null
          interaction_type?: string
          product_sku?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          client_approved_at: string | null
          client_comments: string | null
          created_at: string
          delivery_terms: string | null
          id: string
          observations: string | null
          opportunity_id: string
          payment_terms: string | null
          proposal_number: string
          public_link: string | null
          reservation_expires_at: string | null
          reservation_status: string | null
          responsible_cpf: string | null
          responsible_email: string | null
          responsible_name: string | null
          responsible_phone: string | null
          responsible_position: string | null
          shipping_cost: number | null
          status: string | null
          total_commission: number
          total_value: number
          updated_at: string
          validity_date: string
        }
        Insert: {
          client_approved_at?: string | null
          client_comments?: string | null
          created_at?: string
          delivery_terms?: string | null
          id?: string
          observations?: string | null
          opportunity_id: string
          payment_terms?: string | null
          proposal_number: string
          public_link?: string | null
          reservation_expires_at?: string | null
          reservation_status?: string | null
          responsible_cpf?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          responsible_position?: string | null
          shipping_cost?: number | null
          status?: string | null
          total_commission: number
          total_value: number
          updated_at?: string
          validity_date: string
        }
        Update: {
          client_approved_at?: string | null
          client_comments?: string | null
          created_at?: string
          delivery_terms?: string | null
          id?: string
          observations?: string | null
          opportunity_id?: string
          payment_terms?: string | null
          proposal_number?: string
          public_link?: string | null
          reservation_expires_at?: string | null
          reservation_status?: string | null
          responsible_cpf?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          responsible_position?: string | null
          shipping_cost?: number | null
          status?: string | null
          total_commission?: number
          total_value?: number
          updated_at?: string
          validity_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
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
      rep_activities: {
        Row: {
          activity_type: string
          client_id: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          opportunity_id: string | null
          representative_id: string
          title: string
        }
        Insert: {
          activity_type: string
          client_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          opportunity_id?: string | null
          representative_id: string
          title: string
        }
        Update: {
          activity_type?: string
          client_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          opportunity_id?: string | null
          representative_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rep_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "rep_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rep_activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rep_activities_representative_id_fkey"
            columns: ["representative_id"]
            isOneToOne: false
            referencedRelation: "representatives"
            referencedColumns: ["id"]
          },
        ]
      }
      rep_clients: {
        Row: {
          accountant_contact: string | null
          accountant_name: string | null
          address: string | null
          city: string | null
          cnae_codes: string[] | null
          cnpj_cpf: string | null
          company_name: string
          contact_function: string | null
          contact_name: string | null
          created_at: string
          credit_limit: number | null
          email: string | null
          id: string
          ie_numbers: string[] | null
          main_crops: string[] | null
          nirf: string | null
          partnership_details: string | null
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          property_size: number | null
          property_type: string | null
          representative_id: string
          secondary_crops: string[] | null
          state: string | null
          state_registration: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          accountant_contact?: string | null
          accountant_name?: string | null
          address?: string | null
          city?: string | null
          cnae_codes?: string[] | null
          cnpj_cpf?: string | null
          company_name: string
          contact_function?: string | null
          contact_name?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          id?: string
          ie_numbers?: string[] | null
          main_crops?: string[] | null
          nirf?: string | null
          partnership_details?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          property_size?: number | null
          property_type?: string | null
          representative_id: string
          secondary_crops?: string[] | null
          state?: string | null
          state_registration?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          accountant_contact?: string | null
          accountant_name?: string | null
          address?: string | null
          city?: string | null
          cnae_codes?: string[] | null
          cnpj_cpf?: string | null
          company_name?: string
          contact_function?: string | null
          contact_name?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          id?: string
          ie_numbers?: string[] | null
          main_crops?: string[] | null
          nirf?: string | null
          partnership_details?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          property_size?: number | null
          property_type?: string | null
          representative_id?: string
          secondary_crops?: string[] | null
          state?: string | null
          state_registration?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rep_clients_representative_id_fkey"
            columns: ["representative_id"]
            isOneToOne: false
            referencedRelation: "representatives"
            referencedColumns: ["id"]
          },
        ]
      }
      rep_notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean | null
          representative_id: string
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          representative_id: string
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          representative_id?: string
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rep_notifications_representative_id_fkey"
            columns: ["representative_id"]
            isOneToOne: false
            referencedRelation: "representatives"
            referencedColumns: ["id"]
          },
        ]
      }
      representative_applications: {
        Row: {
          canais: string[]
          cidade: string
          cnpj: string | null
          conflito_detalhe: string | null
          conflito_interesse: boolean | null
          created_at: string
          data_envio: string
          doc_urls: Json | null
          docs_ok: boolean | null
          email: string
          experiencia_anos: string
          forecast_data: Json | null
          id: string
          infra_celular: boolean | null
          infra_internet: boolean | null
          infra_veic_alugado: boolean | null
          infra_veic_proprio: boolean | null
          linkedin: string | null
          motivo_status: string | null
          nome: string
          possui_pj: boolean
          produtos_lista: string
          razao_social: string | null
          regioes: string[]
          segmentos: string[]
          status: string
          termos_aceitos: boolean
          uf: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          canais: string[]
          cidade: string
          cnpj?: string | null
          conflito_detalhe?: string | null
          conflito_interesse?: boolean | null
          created_at?: string
          data_envio?: string
          doc_urls?: Json | null
          docs_ok?: boolean | null
          email: string
          experiencia_anos: string
          forecast_data?: Json | null
          id?: string
          infra_celular?: boolean | null
          infra_internet?: boolean | null
          infra_veic_alugado?: boolean | null
          infra_veic_proprio?: boolean | null
          linkedin?: string | null
          motivo_status?: string | null
          nome: string
          possui_pj: boolean
          produtos_lista: string
          razao_social?: string | null
          regioes: string[]
          segmentos: string[]
          status?: string
          termos_aceitos?: boolean
          uf: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          canais?: string[]
          cidade?: string
          cnpj?: string | null
          conflito_detalhe?: string | null
          conflito_interesse?: boolean | null
          created_at?: string
          data_envio?: string
          doc_urls?: Json | null
          docs_ok?: boolean | null
          email?: string
          experiencia_anos?: string
          forecast_data?: Json | null
          id?: string
          infra_celular?: boolean | null
          infra_internet?: boolean | null
          infra_veic_alugado?: boolean | null
          infra_veic_proprio?: boolean | null
          linkedin?: string | null
          motivo_status?: string | null
          nome?: string
          possui_pj?: boolean
          produtos_lista?: string
          razao_social?: string | null
          regioes?: string[]
          segmentos?: string[]
          status?: string
          termos_aceitos?: boolean
          uf?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      representatives: {
        Row: {
          commission_percentage: number | null
          cpf: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          region: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          commission_percentage?: number | null
          cpf?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          region?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          commission_percentage?: number | null
          cpf?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          region?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      revenda_produtos: {
        Row: {
          categoria: string
          cidade_origem: string
          condicoes_armazenamento: string | null
          created_at: string
          data_validade: string
          estado_origem: string
          fabricante: string
          id: string
          ingrediente_ativo: string | null
          prazo_entrega_dias: number | null
          preco_minimo: number | null
          preco_unitario: number
          produto_nome: string
          produto_sku: string
          revenda_id: string
          status: string
          unidade: string
          updated_at: string
          volume_disponivel: number
        }
        Insert: {
          categoria: string
          cidade_origem: string
          condicoes_armazenamento?: string | null
          created_at?: string
          data_validade: string
          estado_origem: string
          fabricante: string
          id?: string
          ingrediente_ativo?: string | null
          prazo_entrega_dias?: number | null
          preco_minimo?: number | null
          preco_unitario: number
          produto_nome: string
          produto_sku: string
          revenda_id: string
          status?: string
          unidade?: string
          updated_at?: string
          volume_disponivel?: number
        }
        Update: {
          categoria?: string
          cidade_origem?: string
          condicoes_armazenamento?: string | null
          created_at?: string
          data_validade?: string
          estado_origem?: string
          fabricante?: string
          id?: string
          ingrediente_ativo?: string | null
          prazo_entrega_dias?: number | null
          preco_minimo?: number | null
          preco_unitario?: number
          produto_nome?: string
          produto_sku?: string
          revenda_id?: string
          status?: string
          unidade?: string
          updated_at?: string
          volume_disponivel?: number
        }
        Relationships: [
          {
            foreignKeyName: "revenda_produtos_revenda_id_fkey"
            columns: ["revenda_id"]
            isOneToOne: false
            referencedRelation: "revendas"
            referencedColumns: ["id"]
          },
        ]
      }
      revendas: {
        Row: {
          agencia: string | null
          banco: string | null
          cep: string
          chave_pix: string | null
          cidade: string
          cnpj: string
          conta: string | null
          created_at: string
          email_comercial: string | null
          endereco_completo: string
          estado: string
          id: string
          razao_social: string
          regioes_atuacao: string[] | null
          status: string
          telefone_comercial: string | null
          tipo_conta: string | null
          tipos_produto_interesse: string[] | null
          updated_at: string
          user_id: string
          volume_minimo_compra: number | null
          website: string | null
        }
        Insert: {
          agencia?: string | null
          banco?: string | null
          cep: string
          chave_pix?: string | null
          cidade: string
          cnpj: string
          conta?: string | null
          created_at?: string
          email_comercial?: string | null
          endereco_completo: string
          estado: string
          id?: string
          razao_social: string
          regioes_atuacao?: string[] | null
          status?: string
          telefone_comercial?: string | null
          tipo_conta?: string | null
          tipos_produto_interesse?: string[] | null
          updated_at?: string
          user_id: string
          volume_minimo_compra?: number | null
          website?: string | null
        }
        Update: {
          agencia?: string | null
          banco?: string | null
          cep?: string
          chave_pix?: string | null
          cidade?: string
          cnpj?: string
          conta?: string | null
          created_at?: string
          email_comercial?: string | null
          endereco_completo?: string
          estado?: string
          id?: string
          razao_social?: string
          regioes_atuacao?: string[] | null
          status?: string
          telefone_comercial?: string | null
          tipo_conta?: string | null
          tipos_produto_interesse?: string[] | null
          updated_at?: string
          user_id?: string
          volume_minimo_compra?: number | null
          website?: string | null
        }
        Relationships: []
      }
      sales_orders: {
        Row: {
          actual_delivery: string | null
          client_id: string
          created_at: string
          expected_delivery: string | null
          id: string
          invoice_date: string | null
          order_number: string
          proposal_id: string
          representative_id: string
          status: string | null
          total_commission: number
          total_value: number
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          actual_delivery?: string | null
          client_id: string
          created_at?: string
          expected_delivery?: string | null
          id?: string
          invoice_date?: string | null
          order_number: string
          proposal_id: string
          representative_id: string
          status?: string | null
          total_commission: number
          total_value: number
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          actual_delivery?: string | null
          client_id?: string
          created_at?: string
          expected_delivery?: string | null
          id?: string
          invoice_date?: string | null
          order_number?: string
          proposal_id?: string
          representative_id?: string
          status?: string | null
          total_commission?: number
          total_value?: number
          tracking_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "rep_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_representative_id_fkey"
            columns: ["representative_id"]
            isOneToOne: false
            referencedRelation: "representatives"
            referencedColumns: ["id"]
          },
        ]
      }
      user_navigation_logs: {
        Row: {
          browser_info: Json | null
          created_at: string
          id: string
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string
          time_on_page: number | null
          user_id: string | null
        }
        Insert: {
          browser_info?: Json | null
          created_at?: string
          id?: string
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id: string
          time_on_page?: number | null
          user_id?: string | null
        }
        Update: {
          browser_info?: Json | null
          created_at?: string
          id?: string
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string
          time_on_page?: number | null
          user_id?: string | null
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
          phone: string
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
          phone: string
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
          phone?: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      volume_analysis_logs: {
        Row: {
          created_at: string
          final_price: number | null
          final_volume: number | null
          id: string
          initial_price: number | null
          initial_volume: number | null
          product_sku: string
          reached_banda_menor: boolean | null
          savings_amount: number | null
          savings_percentage: number | null
          session_id: string
          time_spent: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          final_price?: number | null
          final_volume?: number | null
          id?: string
          initial_price?: number | null
          initial_volume?: number | null
          product_sku: string
          reached_banda_menor?: boolean | null
          savings_amount?: number | null
          savings_percentage?: number | null
          session_id: string
          time_spent?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          final_price?: number | null
          final_volume?: number | null
          id?: string
          initial_price?: number | null
          initial_volume?: number | null
          product_sku?: string
          reached_banda_menor?: boolean | null
          savings_amount?: number | null
          savings_percentage?: number | null
          session_id?: string
          time_spent?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          conversation_state: Json | null
          created_at: string
          current_menu: string | null
          id: string
          last_interaction: string | null
          phone_number: string
          session_active: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          conversation_state?: Json | null
          created_at?: string
          current_menu?: string | null
          id?: string
          last_interaction?: string | null
          phone_number: string
          session_active?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          conversation_state?: Json | null
          created_at?: string
          current_menu?: string | null
          id?: string
          last_interaction?: string | null
          phone_number?: string
          session_active?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      inventory_available: {
        Row: {
          active_ingredient: string | null
          available_volume: number | null
          base_price: number | null
          city: string | null
          commission_unit: number | null
          created_at: string | null
          expiry_date: string | null
          id: string | null
          manufacturer: string | null
          mapa_number: string | null
          packaging: string | null
          preco_afiliado: number | null
          preco_banda_maior: number | null
          preco_banda_menor: number | null
          product_name: string | null
          product_sku: string | null
          reserved_volume: number | null
          state: string | null
          total_volume: number | null
          unit: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      inventory_reservations_report: {
        Row: {
          active_reservations: number | null
          available_volume: number | null
          city: string | null
          next_expiry: string | null
          product_name: string | null
          product_sku: string | null
          reserved_volume: number | null
          state: string | null
          total_volume: number | null
        }
        Relationships: []
      }
      orders_with_user_info: {
        Row: {
          created_at: string | null
          id: string | null
          items: Json | null
          logistics_option: string | null
          order_number: string | null
          payment_method: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          user_company: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          user_phone: string | null
          user_type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_distance_km: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      cancel_inventory_reservation: {
        Args: { p_proposal_id: string }
        Returns: boolean
      }
      check_admin_access: { Args: never; Returns: boolean }
      confirm_inventory_reservation: {
        Args: { p_proposal_id: string }
        Returns: boolean
      }
      create_inventory_reservation: {
        Args: {
          p_city: string
          p_opportunity_id: string
          p_product_sku: string
          p_proposal_id: string
          p_state: string
          p_volume: number
        }
        Returns: string
      }
      expire_inventory_reservations: { Args: never; Returns: number }
      find_representative_by_identifier: {
        Args: { identifier_value: string }
        Returns: string
      }
      generate_order_number: { Args: never; Returns: string }
      generate_proposal_number: { Args: never; Returns: string }
      get_order_details: {
        Args: { order_id: string }
        Returns: {
          created_at: string
          id: string
          items: Json
          logistics_option: string
          order_number: string
          payment_method: string
          products_summary: string
          status: string
          total_amount: number
          updated_at: string
          user_company: string
          user_email: string
          user_id: string
          user_name: string
          user_phone: string
          user_type: string
        }[]
      }
      validate_cnpj: { Args: { cnpj_input: string }; Returns: boolean }
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
