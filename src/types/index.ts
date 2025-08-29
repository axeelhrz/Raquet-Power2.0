// User types with role-specific information
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'liga' | 'club' | 'miembro';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  phone?: string;
  country?: string;
  parent_league_id?: number;
  parent_club_id?: number;
}

// League types
export interface League {
  id: number;
  name: string;
  province: string;
  region: string;
  admin_email: string;
  admin_name: string;
  admin_phone: string;
  status: 'active' | 'inactive';
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
  clubs?: Club[];
  clubs_count?: number;
  members_count?: number;
}

// Club types - Updated with comprehensive fields
export interface Club {
  id: number;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  user_id: number;
  league_id?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  league?: League;
  members?: Member[];
  members_count?: number;
  
  // Additional comprehensive club fields
  ruc?: string;
  country?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  description?: string;
  founded_date?: string;
  
  // Representative information
  representative_name?: string;
  representative_phone?: string;
  representative_email?: string;
  
  // Administrator 1
  admin1_name?: string;
  admin1_phone?: string;
  admin1_email?: string;
  
  // Administrator 2
  admin2_name?: string;
  admin2_phone?: string;
  admin2_email?: string;
  
  // Administrator 3
  admin3_name?: string;
  admin3_phone?: string;
  admin3_email?: string;
  
  // Logo
  logo_path?: string;
}

// Member types - Updated with comprehensive table tennis information
export interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  status: 'active' | 'inactive';
  user_id: number;
  club_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
  club?: Club;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  doc_id?: string;
  
  // Location information
  country?: string;
  province?: string;
  city?: string;
  
  // Playing style information
  dominant_hand?: 'right' | 'left';
  playing_side?: 'derecho' | 'zurdo';
  playing_style?: 'clasico' | 'lapicero';
  
  // Racket information
  racket_brand?: string;
  racket_model?: string;
  racket_custom_brand?: string;
  racket_custom_model?: string;
  
  // Drive rubber information
  drive_rubber_brand?: string;
  drive_rubber_model?: string;
  drive_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopsping';
  drive_rubber_color?: 'negro' | 'rojo' | 'verde' | 'azul' | 'amarillo' | 'morado' | 'fucsia';
  drive_rubber_sponge?: string;
  drive_rubber_hardness?: string;
  drive_rubber_custom_brand?: string;
  drive_rubber_custom_model?: string;
  
  // Backhand rubber information
  backhand_rubber_brand?: string;
  backhand_rubber_model?: string;
  backhand_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopsping';
  backhand_rubber_color?: 'negro' | 'rojo' | 'verde' | 'azul' | 'amarillo' | 'morado' | 'fucsia';
  backhand_rubber_sponge?: string;
  backhand_rubber_hardness?: string;
  backhand_rubber_custom_brand?: string;
  backhand_rubber_custom_model?: string;
  
  // Additional information
  notes?: string;
  ranking_position?: number;
  ranking_last_updated?: string;
  photo_path?: string;
  
  // Computed attributes
  age?: number;
  equipment_summary?: EquipmentSummary;
  playing_style_summary?: PlayingStyleSummary;
  location_summary?: LocationSummary;
}

// Equipment related interfaces
export interface EquipmentSummary {
  racket: {
    brand?: string;
    model?: string;
  };
  drive_rubber: {
    brand?: string;
    model?: string;
    type?: string;
    color?: string;
    sponge?: string;
    hardness?: string;
  };
  backhand_rubber: {
    brand?: string;
    model?: string;
    type?: string;
    color?: string;
    sponge?: string;
    hardness?: string;
  };
}

export interface PlayingStyleSummary {
  dominant_hand?: string;
  playing_side?: string;
  playing_style?: string;
}

export interface LocationSummary {
  country?: string;
  province?: string;
  city?: string;
}

// Equipment reference interfaces
export interface RacketBrand {
  id: number;
  name: string;
  country?: string;
  is_active: boolean;
  models?: RacketModel[];
}

export interface RacketModel {
  id: number;
  racket_brand_id: number;
  name: string;
  type?: string;
  weight?: number;
  plies?: number;
  is_active: boolean;
}

export interface RubberBrand {
  id: number;
  name: string;
  country?: string;
  is_active: boolean;
  models?: RubberModel[];
}

export interface RubberModel {
  id: number;
  rubber_brand_id: number;
  name: string;
  type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopsping';
  speed?: number;
  spin?: number;
  control?: number;
  is_active: boolean;
}

// Sport types
export interface Sport {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  parameters?: SportParameter[];
  parameters_count?: number;
}

export interface SportParameter {
  id: number;
  sport_id: number;
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string;
  is_required: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  sport?: Sport;
  
  // Additional properties used in the sports management
  param_key: string;
  param_value: string;
  param_type: 'text' | 'number' | 'select' | 'boolean';
  unit?: string;
  description?: string;
  category?: string;
  typed_value: string | number | boolean;
}

// Form types
export interface LeagueForm {
  name: string;
  province: string;
  region?: string;
  admin_email?: string;
  admin_name?: string;
  admin_phone?: string;
  status?: 'active' | 'inactive';
}

export interface ClubForm {
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  league_id?: number;
  
  // Additional comprehensive club fields
  ruc?: string;
  country?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  description?: string;
  founded_date?: string;
  
  // Representative information
  representative_name?: string;
  representative_phone?: string;
  representative_email?: string;
  
  // Administrator 1
  admin1_name?: string;
  admin1_phone?: string;
  admin1_email?: string;
  
  // Administrator 2
  admin2_name?: string;
  admin2_phone?: string;
  admin2_email?: string;
  
  // Administrator 3
  admin3_name?: string;
  admin3_phone?: string;
  admin3_email?: string;
}

export interface MemberForm {
  // Basic information
  club_id: number;
  first_name: string;
  last_name: string;
  doc_id?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  status: 'active' | 'inactive';
  
  // Location information
  country?: string;
  province?: string;
  city?: string;
  
  // Playing style information
  dominant_hand?: 'right' | 'left';
  playing_side?: 'derecho' | 'zurdo';
  playing_style?: 'clasico' | 'lapicero';
  
  // Racket information
  racket_brand?: string;
  racket_model?: string;
  racket_custom_brand?: string;
  racket_custom_model?: string;
  
  // Drive rubber information
  drive_rubber_brand?: string;
  drive_rubber_model?: string;
  drive_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopsping';
  drive_rubber_color?: 'negro' | 'rojo' | 'verde' | 'azul' | 'amarillo' | 'morado' | 'fucsia';
  drive_rubber_sponge?: string;
  drive_rubber_hardness?: string;
  drive_rubber_custom_brand?: string;
  drive_rubber_custom_model?: string;
  
  // Backhand rubber information
  backhand_rubber_brand?: string;
  backhand_rubber_model?: string;
  backhand_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopsping';
  backhand_rubber_color?: 'negro' | 'rojo' | 'verde' | 'azul' | 'amarillo' | 'morado' | 'fucsia';
  backhand_rubber_sponge?: string;
  backhand_rubber_hardness?: string;
  backhand_rubber_custom_brand?: string;
  backhand_rubber_custom_model?: string;
  
  // Additional information
  notes?: string;
  ranking_position?: number;
  ranking_last_updated?: string;
}

export interface SportForm {
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface SportParameterForm {
  sport_id: number;
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string;
  is_required: boolean;
  order: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Tournament types
export interface Tournament {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants?: number;
  entry_fee?: number;
  prize_pool?: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled' | 'draft' | 'open' | 'in_progress';
  tournament_type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  tournament_format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss_system';
  club_id?: number;
  league_id?: number;
  sport_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  club?: Club;
  league?: League;
  creator?: User;
  participants?: TournamentParticipant[];
  participants_count?: number;
  
  // Additional properties used in tournament management
  location?: string;
  rules?: string;
  current_participants: number;
  matches_played: number;
  matches_total: number;
}

export interface TournamentParticipant {
  id: number;
  tournament_id: number;
  member_id: number;
  registration_date: string;
  status: 'registered' | 'confirmed' | 'withdrawn' | 'disqualified';
  seed?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  tournament?: Tournament;
  member?: Member;
}

export interface TournamentForm {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants?: number;
  entry_fee?: number;
  prize_pool?: number;
  tournament_type?: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  tournament_format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss_system';
  club_id?: number;
  league_id?: number;
  sport_id: number;
  location?: string;
  rules?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled' | 'draft' | 'open' | 'in_progress';
}

// Invitation filter types
export interface InvitationFilters {
  type: 'all' | 'sent' | 'received';
  status: 'all' | 'pending' | 'accepted' | 'rejected' | 'cancelled';
  search: string;
}

// Invitation types
export interface Invitation {
  id: number;
  email: string;
  role: 'liga' | 'club' | 'miembro';
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  invited_by: number;
  expires_at: string;
  accepted_at?: string;
  rejected_at?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  inviter?: User;
  
  // Role-specific data
  league_id?: number;
  club_id?: number;
  league?: League;
  club?: Club;
  
  // Additional invitation data
  invitation_data?: {
    league_name?: string;
    club_name?: string;
    message?: string;
  };
  
  // Extended properties for invitation management
  is_sender?: boolean;
  sender_name?: string;
  receiver_name?: string;
  sender_details?: {
    type?: string;
    city?: string;
    province?: string;
  };
  receiver_details?: {
    type?: string;
    city?: string;
    province?: string;
  };
  message?: string;
}

export interface InvitationForm {
  receiver_id: number;
  receiver_type: string;
  message: string;
  type: string;
  expires_at?: string;
}

// Form type for sending invitations (used in UI components)
export interface SendInvitationForm {
  message: string;
  expires_at: string;
  league_id?: number;
  league_name?: string;
}

// Quick Registration types (for censo)
export interface QuickRegistration {
  id: number;
  registration_code: string;
  first_name: string;
  last_name: string;
  doc_id?: string;
  email: string;
  phone: string;
  birth_date?: string;
  gender?: 'masculino' | 'femenino';
  country: string;
  province: string;
  city: string;
  club_name?: string;
  playing_side?: 'derecho' | 'zurdo';
  playing_style?: 'clasico' | 'lapicero';
  racket_brand?: string;
  racket_model?: string;
  racket_custom_brand?: string;
  racket_custom_model?: string;
  drive_rubber_brand?: string;
  drive_rubber_model?: string;
  drive_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopsping';
  drive_rubber_color?: 'negro' | 'rojo' | 'verde' | 'azul' | 'amarillo' | 'morado' | 'fucsia';
  drive_rubber_sponge?: string;
  drive_rubber_hardness?: string;
  drive_rubber_custom_brand?: string;
  drive_rubber_custom_model?: string;
  backhand_rubber_brand?: string;
  backhand_rubber_model?: string;
  backhand_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopsping';
  backhand_rubber_color?: 'negro' | 'rojo' | 'verde' | 'azul' | 'amarillo' | 'morado' | 'fucsia';
  backhand_rubber_sponge?: string;
  backhand_rubber_hardness?: string;
  backhand_rubber_custom_brand?: string;
  backhand_rubber_custom_model?: string;
  notes?: string;
  photo_path?: string;
  status: 'pending' | 'contacted' | 'approved' | 'rejected';
  contacted_at?: string;
  approved_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  full_name?: string;
  age?: number;
  days_waiting?: number;
}

// Available entities response type (for invitation endpoints)
export interface AvailableEntitiesResponse {
  data: PaginatedResponse<League | Club>;
}