import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface StrategyRecord {
  id?: string;
  user_id: string;
  strategy_name: string;
  description?: string;
  generated_python_code?: string;
  backtest_metrics?: Record<string, unknown>;
}

export interface ChatSessionRecord {
  id?: string;
  user_id: string;
  strategy_id?: string;
  title?: string;
}

export interface ChatMessageRecord {
  id?: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
}

export const strategyQueries = {
  async createStrategy(strategy: StrategyRecord) {
    const { data, error } = await supabase
      .from("user_strategies")
      .insert([strategy])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getStrategies(userId: string) {
    const { data, error } = await supabase
      .from("user_strategies")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateStrategy(id: string, updates: Partial<StrategyRecord>) {
    const { data, error } = await supabase
      .from("user_strategies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteStrategy(id: string) {
    const { error } = await supabase
      .from("user_strategies")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  },
};

export const chatQueries = {
  async createSession(session: ChatSessionRecord) {
    const { data, error } = await supabase
      .from("strategy_chat_sessions")
      .insert([session])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getSessions(userId: string) {
    const { data, error } = await supabase
      .from("strategy_chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getMessages(sessionId: string) {
    const { data, error } = await supabase
      .from("strategy_chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data;
  },

  async addMessage(message: ChatMessageRecord) {
    const { data, error } = await supabase
      .from("strategy_chat_messages")
      .insert([message])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
