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
      ai_recommendations: {
        Row: {
          created_at: string | null
          date: string
          entity_id: string | null
          entity_type: string | null
          issue: string | null
          rec_id: string
          score: number | null
          suggestion: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          entity_id?: string | null
          entity_type?: string | null
          issue?: string | null
          rec_id: string
          score?: number | null
          suggestion?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          entity_id?: string | null
          entity_type?: string | null
          issue?: string | null
          rec_id?: string
          score?: number | null
          suggestion?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      barangays: {
        Row: {
          barangay_id: string
          barangay_name: string
          city_id: string
          created_at: string | null
          latitude: number | null
          longitude: number | null
          updated_at: string | null
        }
        Insert: {
          barangay_id: string
          barangay_name: string
          city_id: string
          created_at?: string | null
          latitude?: number | null
          longitude?: number | null
          updated_at?: string | null
        }
        Update: {
          barangay_id?: string
          barangay_name?: string
          city_id?: string
          created_at?: string | null
          latitude?: number | null
          longitude?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barangays_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["city_id"]
          },
        ]
      }
      brands: {
        Row: {
          brand_id: string
          brand_name: string
          category: string | null
          created_at: string | null
          parent_company: string | null
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          brand_name: string
          category?: string | null
          created_at?: string | null
          parent_company?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          brand_name?: string
          category?: string | null
          created_at?: string | null
          parent_company?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          city_id: string
          city_name: string
          created_at: string | null
          province_id: string
          updated_at: string | null
        }
        Insert: {
          city_id: string
          city_name: string
          created_at?: string | null
          province_id: string
          updated_at?: string | null
        }
        Update: {
          city_id?: string
          city_name?: string
          created_at?: string | null
          province_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["province_id"]
          },
        ]
      }
      customers: {
        Row: {
          age: number | null
          barangay_id: string | null
          created_at: string | null
          customer_id: string
          device_id: string | null
          gender: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          barangay_id?: string | null
          created_at?: string | null
          customer_id: string
          device_id?: string | null
          gender?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          barangay_id?: string | null
          created_at?: string | null
          customer_id?: string
          device_id?: string | null
          gender?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["barangay_id"]
          },
        ]
      }
      provinces: {
        Row: {
          created_at: string | null
          province_id: string
          province_name: string
          region_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          province_id: string
          province_name: string
          region_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          province_id?: string
          province_name?: string
          region_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provinces_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["region_id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string | null
          region_id: string
          region_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          region_id: string
          region_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          region_id?: string
          region_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      request_events: {
        Row: {
          brand_id: string | null
          created_at: string | null
          request_event_id: string
          request_type: string | null
          sku_id: string | null
          timestamp: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          request_event_id: string
          request_type?: string | null
          sku_id?: string | null
          timestamp?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          request_event_id?: string
          request_type?: string | null
          sku_id?: string | null
          timestamp?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_events_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "request_events_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["sku_id"]
          },
          {
            foreignKeyName: "request_events_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["transaction_id"]
          },
        ]
      }
      skus: {
        Row: {
          brand_id: string
          category: string | null
          created_at: string | null
          package_type: string | null
          sku_id: string
          sku_name: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          category?: string | null
          created_at?: string | null
          package_type?: string | null
          sku_id: string
          sku_name: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          category?: string | null
          created_at?: string | null
          package_type?: string | null
          sku_id?: string
          sku_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skus_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["brand_id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          barangay_id: string
          created_at: string | null
          latitude: number | null
          longitude: number | null
          size: string | null
          store_id: string
          store_name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          barangay_id: string
          created_at?: string | null
          latitude?: number | null
          longitude?: number | null
          size?: string | null
          store_id: string
          store_name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          barangay_id?: string
          created_at?: string | null
          latitude?: number | null
          longitude?: number | null
          size?: string | null
          store_id?: string
          store_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["barangay_id"]
          },
        ]
      }
      substitution_events: {
        Row: {
          count: number | null
          created_at: string | null
          original_sku_id: string
          reason: string | null
          substitute_sku_id: string
          substitution_id: string
          timestamp: string | null
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          original_sku_id: string
          reason?: string | null
          substitute_sku_id: string
          substitution_id: string
          timestamp?: string | null
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          original_sku_id?: string
          reason?: string | null
          substitute_sku_id?: string
          substitution_id?: string
          timestamp?: string | null
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "substitution_events_original_sku_id_fkey"
            columns: ["original_sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["sku_id"]
          },
          {
            foreignKeyName: "substitution_events_substitute_sku_id_fkey"
            columns: ["substitute_sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["sku_id"]
          },
          {
            foreignKeyName: "substitution_events_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["transaction_id"]
          },
        ]
      }
      transaction_items: {
        Row: {
          created_at: string | null
          is_promo: boolean | null
          price: number
          quantity: number
          sku_id: string
          transaction_id: string
          transaction_item_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          is_promo?: boolean | null
          price: number
          quantity?: number
          sku_id: string
          transaction_id: string
          transaction_item_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          is_promo?: boolean | null
          price?: number
          quantity?: number
          sku_id?: string
          transaction_id?: string
          transaction_item_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["sku_id"]
          },
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["transaction_id"]
          },
        ]
      }
      transactions: {
        Row: {
          basket_size: number | null
          created_at: string | null
          customer_id: string | null
          store_id: string
          total_value: number | null
          transaction_date: string
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          basket_size?: number | null
          created_at?: string | null
          customer_id?: string | null
          store_id: string
          total_value?: number | null
          transaction_date: string
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          basket_size?: number | null
          created_at?: string | null
          customer_id?: string | null
          store_id?: string
          total_value?: number | null
          transaction_date?: string
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "transactions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
