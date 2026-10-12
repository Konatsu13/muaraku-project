import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Report, 
  Claim, 
  GlobalChatMessage, 
  Conversation, 
  PrivateMessage, 
  NotificationItem, 
  ModerationReport,
  User 
} from '../types';

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://inxqwzbptfcuqapzqmwh.supabase.co';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'sb_publishable_aFlXWG_Erv0bVeWpA6Zxpw_Snu4gfzF';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// ==========================================
// PURGE LEGACY DUMMY STORAGE
// ==========================================
try {
  // Clean up any old dummy mock data cached in localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const legacyKeys = [
      'muaraku_current_user',
      'muaraku_users',
      'muaraku_reports',
      'muaraku_claims',
      'muaraku_global_chat',
      'muaraku_conversations',
      'muaraku_private_messages',
      'muaraku_notifications',
      'muaraku_moderation'
    ];
    legacyKeys.forEach(k => {
      // Remove any data that was created with dummy usr- IDs
      const item = localStorage.getItem(k);
      if (item && (item.includes('usr-current') || item.includes('ahmad.fauzi@sekolah.id') || item.includes('rep-001'))) {
        localStorage.removeItem(k);
      }
    });
  }
} catch (e) {
  console.warn('Storage purge error:', e);
}

// ==========================================
// STORAGE / IMAGE UPLOAD HELPER
// ==========================================
export async function uploadReportImage(file: File): Promise<string> {
  if (!file) {
    throw new Error('Tidak ada berkas gambar yang dipilih.');
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Ukuran berkas gambar maksimal 5 MB.');
  }

  // Validate image MIME type
  if (!file.type.startsWith('image/')) {
    throw new Error('Format berkas harus berupa gambar (JPG, PNG, WebP).');
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('report-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!uploadError) {
        const { data } = supabase.storage.from('report-images').getPublicUrl(filePath);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload returned note, falling back to data URL:', uploadError.message);
      }
    } catch (err: any) {
      console.warn('Storage upload error, using Data URL fallback:', err?.message);
    }
  }

  // Resilient Base64 Data URL fallback so the user can always attach pictures
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal memproses berkas gambar.'));
    reader.readAsDataURL(file);
  });
}

// ==========================================
// REAL DATA REPOSITORY (SUPABASE FIRST)
// ==========================================

export const db = {
  // --- REPORTS ---
  async getReports(params?: {
    type?: 'all' | 'lost' | 'found';
    category?: string;
    query?: string;
    status?: string;
  }): Promise<Report[]> {
    if (!isSupabaseConfigured || !supabase) {
      console.info('Supabase belum terkonfigurasi. Tidak ada data laporan.');
      return [];
    }

    try {
      let query = supabase.from('reports').select('*').order('created_at', { ascending: false });

      if (params?.type && params.type !== 'all') {
        query = query.eq('report_type', params.type);
      }
      if (params?.category && params.category !== 'Semua') {
        query = query.eq('category', params.category);
      }
      if (params?.status && params.status !== 'Semua') {
        query = query.eq('status', params.status);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching reports from Supabase:', error);
        return [];
      }

      let results = (data || []) as Report[];

      if (params?.query && params.query.trim()) {
        const q = params.query.toLowerCase().trim();
        results = results.filter(r => 
          r.title?.toLowerCase().includes(q) ||
          r.public_description?.toLowerCase().includes(q) ||
          r.facility_location?.toLowerCase().includes(q) ||
          r.report_code?.toLowerCase().includes(q) ||
          r.category?.toLowerCase().includes(q)
        );
      }

      return results;
    } catch (err) {
      console.error('Supabase getReports exception:', err);
      return [];
    }
  },

  async getReportById(id: string): Promise<Report | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase.from('reports').select('*').eq('id', id).maybeSingle();
      if (error) {
        console.error('Error fetching report by ID from Supabase:', error);
        return null;
      }
      return (data as Report) || null;
    } catch (err) {
      console.error('Supabase getReportById exception:', err);
      return null;
    }
  },

  async createReport(reportData: Omit<Report, 'id' | 'report_code' | 'created_at'>): Promise<Report> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Koneksi Supabase belum terkonfigurasi. Harap isi file .env terlebih dahulu.');
    }

    const newId = 'rep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const prefix = reportData.report_type === 'lost' ? '#HIL-' : '#TEM-';
    const reportCode = prefix + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    
    const newReport: Report = {
      ...reportData,
      id: newId,
      report_code: reportCode,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('reports').insert([newReport]).select().single();
    if (error) {
      console.error('Error inserting report to Supabase:', error);
      throw new Error(`Gagal menyimpan laporan ke Supabase: ${error.message}`);
    }

    return data as Report;
  },

  async updateReport(id: string, updates: Partial<Report>): Promise<Report | null> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Koneksi Supabase belum terkonfigurasi.');
    }

    const { data, error } = await supabase
      .from('reports')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating report in Supabase:', error);
      throw new Error(`Gagal memperbarui laporan di Supabase: ${error.message}`);
    }

    return (data as Report) || null;
  },

  async deleteReport(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Koneksi Supabase belum terkonfigurasi.');
    }

    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) {
      console.error('Error deleting report from Supabase:', error);
      throw new Error(`Gagal menghapus laporan dari Supabase: ${error.message}`);
    }

    return true;
  },

  // --- CLAIMS ---
  async getClaimsForReport(reportId: string): Promise<Claim[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching claims for report:', error);
        return [];
      }
      return (data || []) as Claim[];
    } catch (err) {
      console.error('Supabase getClaimsForReport exception:', err);
      return [];
    }
  },

  async getClaimsForUser(userId: string): Promise<Claim[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('claimant_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching claims for user:', error);
        return [];
      }
      return (data || []) as Claim[];
    } catch (err) {
      console.error('Supabase getClaimsForUser exception:', err);
      return [];
    }
  },

  async submitClaim(claimData: Omit<Claim, 'id' | 'created_at' | 'status'>): Promise<Claim> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Koneksi Supabase belum terkonfigurasi.');
    }

    const newClaim: Claim = {
      ...claimData,
      id: 'clm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      status: 'Pending Review',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('claims').insert([newClaim]).select().single();
    if (error) {
      console.error('Error submitting claim to Supabase:', error);
      throw new Error(`Gagal mengajukan klaim ke Supabase: ${error.message}`);
    }

    // Automatically update report status to Claim in Progress
    await this.updateReport(claimData.report_id, { status: 'Claim in Progress' }).catch(err => {
      console.warn('Note on updating report status:', err);
    });

    return data as Claim;
  },

  async updateClaimStatus(claimId: string, status: Claim['status'], reviewNotes?: string): Promise<Claim | null> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Koneksi Supabase belum terkonfigurasi.');
    }

    const { data, error } = await supabase
      .from('claims')
      .update({
        status,
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating claim status:', error);
      throw new Error(`Gagal memperbarui status klaim: ${error.message}`);
    }

    const updatedClaim = data as Claim;
    if (updatedClaim && status === 'Completed') {
      await this.updateReport(updatedClaim.report_id, { status: 'Returned' }).catch(e => {
        console.warn('Note on updating report status to Returned:', e);
      });
    }

    return updatedClaim || null;
  },

  // --- GLOBAL CHAT ---
  async getGlobalChatMessages(channel: GlobalChatMessage['channel']): Promise<GlobalChatMessage[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('global_chat_messages')
        .select('*')
        .eq('channel', channel)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching global chat messages:', error);
        return [];
      }
      return (data || []) as GlobalChatMessage[];
    } catch (err) {
      console.error('Supabase getGlobalChatMessages exception:', err);
      return [];
    }
  },

  async sendGlobalChatMessage(message: Omit<GlobalChatMessage, 'id' | 'timestamp'>): Promise<GlobalChatMessage> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Koneksi Supabase belum terkonfigurasi.');
    }

    const newMsg: GlobalChatMessage = {
      ...message,
      id: 'gmsg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const { data, error } = await supabase.from('global_chat_messages').insert([newMsg]).select().single();
    if (error) {
      console.error('Error sending global chat message:', error);
      throw new Error(`Gagal mengirim pesan chat: ${error.message}`);
    }

    return data as GlobalChatMessage;
  },

  // --- PRIVATE CONVERSATIONS & MESSAGES ---
  async getConversations(userId?: string): Promise<Conversation[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      let query = supabase.from('conversations').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.or(`other_user_id.eq.${userId}`);
      }
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }
      return (data || []) as Conversation[];
    } catch (err) {
      console.error('Supabase getConversations exception:', err);
      return [];
    }
  },

  async getPrivateMessages(conversationId: string): Promise<PrivateMessage[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching private messages:', error);
        return [];
      }
      return (data || []) as PrivateMessage[];
    } catch (err) {
      console.error('Supabase getPrivateMessages exception:', err);
      return [];
    }
  },

  async sendPrivateMessage(conversationId: string, content: string, sender: User): Promise<PrivateMessage> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Koneksi Supabase belum terkonfigurasi.');
    }

    const newMsg: PrivateMessage = {
      id: 'pmsg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      conversation_id: conversationId,
      sender_id: sender.id,
      sender_name: sender.name,
      sender_avatar: sender.avatar_url,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      is_read: false
    };

    const { data, error } = await supabase.from('private_messages').insert([newMsg]).select().single();
    if (error) {
      console.error('Error sending private message:', error);
      throw new Error(`Gagal mengirim pesan pribadi: ${error.message}`);
    }

    // Update conversation last message preview
    await supabase.from('conversations').update({
      last_message: content,
      last_message_time: newMsg.timestamp
    }).eq('id', conversationId);

    return data as PrivateMessage;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      return (data || []) as NotificationItem[];
    } catch (err) {
      console.error('Supabase getNotifications exception:', err);
      return [];
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } catch (err) {
      console.error('Supabase markNotificationRead exception:', err);
    }
  },

  async markAllNotificationsRead(userId?: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      let query = supabase.from('notifications').update({ is_read: true });
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.neq('id', '');
      }
      await query;
    } catch (err) {
      console.error('Supabase markAllNotificationsRead exception:', err);
    }
  },

  // --- MODERATION ---
  async submitModerationReport(report: Omit<ModerationReport, 'id' | 'created_at' | 'status'>): Promise<ModerationReport> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Koneksi Supabase belum terkonfigurasi.');
    }

    const newMod: ModerationReport = {
      ...report,
      id: 'mod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('moderation_reports').insert([newMod]).select().single();
    if (error) {
      console.error('Error submitting moderation report:', error);
      throw new Error(`Gagal mengirim laporan moderasi: ${error.message}`);
    }

    return data as ModerationReport;
  },

  async getModerationReports(): Promise<ModerationReport[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('moderation_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching moderation reports:', error);
        return [];
      }
      return (data || []) as ModerationReport[];
    } catch (err) {
      console.error('Supabase getModerationReports exception:', err);
      return [];
    }
  },

  async updateModerationStatus(id: string, status: ModerationReport['status']): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase.from('moderation_reports').update({ status }).eq('id', id);
    } catch (err) {
      console.error('Supabase updateModerationStatus exception:', err);
    }
  },

  // --- USERS (PROFILES) ---
  async getUsers(): Promise<User[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching users from Supabase profiles:', error);
        return [];
      }
      return (data || []) as User[];
    } catch (err) {
      console.error('Supabase getUsers exception:', err);
      return [];
    }
  }
};
