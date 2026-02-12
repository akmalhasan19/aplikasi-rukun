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
            profiles: {
                Row: {
                    id: string
                    phone: string | null
                    name: string
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    phone?: string | null
                    name: string
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    phone?: string | null
                    name?: string
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            // Add other tables as needed or generate automatically
        }
    }
}
