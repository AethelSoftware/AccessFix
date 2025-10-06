import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Scan {
  id: string;
  user_id: string;
  name: string;
  scan_type: 'url' | 'file';
  target_url?: string;
  file_name?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_issues: number;
  critical_count: number;
  warning_count: number;
  info_count: number;
  github_repo?: string;
  created_at: string;
  completed_at?: string;
}

export interface Issue {
  id: string;
  scan_id: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  selector?: string;
  line_number?: number;
  recommended_fix: string;
  code_snippet?: string;
  fixed_code?: string;
  wcag_criteria?: string;
  created_at: string;
}

export interface PullRequest {
  id: string;
  scan_id: string;
  user_id: string;
  github_repo: string;
  pr_number: number;
  pr_url: string;
  status: 'open' | 'merged' | 'closed';
  branch_name: string;
  created_at: string;
}
