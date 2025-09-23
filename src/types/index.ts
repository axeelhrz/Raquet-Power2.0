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
  
  ruc?: string;
  country?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  description?: string;
  founded_date?: string;
  
  representative_name?: string;
  representative_phone?: string;
  representative_email?: string;
  
  admin1_name?: string;
  admin1_phone?: string;
  admin1_email?: string;
  
  admin2_name?: string;
  admin2_phone?: string;
  admin2_email?: string;
  
  admin3_name?: string;
  admin3_phone?: string;
  admin3_email?: string;
  
  logo_path?: string;
}

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
  
  country?: string;
  province?: string;
  city?: string;
  
  dominant_hand?: 'right' | 'left';
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
  ranking_position?: number;
  ranking_last_updated?: string;
  photo_path?: string;
  
  age?: number;
  equipment_summary?: EquipmentSummary;
  playing_style_summary?: PlayingStyleSummary;
  location_summary?: LocationSummary;
}

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
  
  param_key: string;
  param_value: string;
  param_type: 'text' | 'number' | 'select' | 'boolean';
  unit?: string;
  description?: string;
  category?: string;
  typed_value: string | number | boolean;
}

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
  
  ruc?: string;
  country?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  description?: string;
  founded_date?: string;
  
  representative_name?: string;
  representative_phone?: string;
  representative_email?: string;
  
  admin1_name?: string;
  admin1_phone?: string;
  admin1_email?: string;
  
  admin2_name?: string;
  admin2_phone?: string;
  admin2_email?: string;
  
  admin3_name?: string;
  admin3_phone?: string;
  admin3_email?: string;
}

export interface MemberForm {
  club_id: number;
  first_name: string;
  last_name: string;
  doc_id?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  status: 'active' | 'inactive';
  
  country?: string;
  province?: string;
  city?: string;
  
  dominant_hand?: 'right' | 'left';
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

export interface Tournament {
  id: number;
  name: string;
  description?: string;
  code?: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants?: number;
  entry_fee?: number;
  prize_pool?: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled' | 'draft' | 'open' | 'in_progress';
  
  tournament_type: 'individual' | 'team';
  
  tournament_format?: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss_system';
  
  club_id?: number;
  league_id?: number;
  sport_id?: number;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  club?: Club;
  league?: League;
  creator?: User;
  participants?: TournamentParticipant[];
  participants_count?: number;
  matches?: Match[];
  
  location?: string;
  rules?: string;
  current_participants?: number;
  matches_played?: number;
  matches_total?: number;
  
  country?: string;
  province?: string;
  city?: string;
  club_name?: string;
  club_address?: string;
  image?: string;
  
  modality?: 'singles' | 'doubles';
  match_type?: string;
  seeding_type?: string;
  ranking_filter?: boolean;
  min_ranking?: string;
  max_ranking?: string;
  age_filter?: boolean;
  min_age?: number;
  max_age?: number;
  gender?: 'male' | 'female' | 'mixed';
  affects_ranking?: boolean;
  draw_lottery?: boolean;
  system_invitation?: boolean;
  scheduled_reminder?: boolean;
  reminder_days?: number;
  
  team_modality?: string;
  team_match_type?: string;
  team_elimination_type?: string;
  players_per_team?: number;
  max_ranking_between_players?: number;
  categories?: string[];
  number_of_teams?: number;
  team_seeding_type?: string;
  team_ranking_filter?: boolean;
  team_min_ranking?: string;
  team_max_ranking?: string;
  team_age_filter?: boolean;
  team_min_age?: number;
  team_max_age?: number;
  team_gender?: 'male' | 'female' | 'mixed';
  team_affects_ranking?: boolean;
  team_draw_lottery?: boolean;
  team_system_invitation?: boolean;
  team_scheduled_reminder?: boolean;
  team_reminder_days?: number;
  gender_restriction?: 'male' | 'female' | 'mixed';
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  team_size?: number;
  
  first_prize?: string;
  second_prize?: string;
  third_prize?: string;
  fourth_prize?: string;
  fifth_prize?: string;
  
  contact?: string;
  phone?: string;
  ball_info?: string;
  contact_name?: string;
  contact_phone?: string;
}

export interface TournamentParticipant {
  id: number;
  tournament_id: number;
  member_id?: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  ranking?: string;
  seed?: number; // Added seed property for tournament seeding
  status: 'pending' | 'confirmed' | 'rejected' | 'waiting_list' | 'registered' | 'withdrawn' | 'disqualified';
  registration_date?: string;
  notes?: string;
  custom_fields?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  
  tournament?: Tournament;
  member?: Member;
}

export interface TournamentParticipantFormData {
  member_id?: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  ranking?: string;
  notes?: string;
  custom_fields?: Record<string, unknown>;
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

export interface SetData {
  set_number: number;
  participant1_score: number;
  participant2_score: number;
}

export interface Match {
  id: number;
  tournament_id: number;
  round: number;
  match_number: number;
  participant1_id?: number;
  participant2_id?: number;
  winner_id?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'bye';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  score?: string;
  notes?: string;
  court_number?: number;
  referee?: string;
  match_format?: string;
  sets_data?: SetData[];
  duration_minutes?: number;
  bracket_position?: number;
  next_match_id?: number;
  is_bye: boolean;
  created_at: string;
  updated_at: string;
  
  tournament?: Tournament;
  participant1?: TournamentParticipant;
  participant2?: TournamentParticipant;
  winner?: TournamentParticipant;
  next_match?: Match;
  
  display_name?: string;
  participant_names?: {
    participant1: string;
    participant2: string;
    winner?: string;
  };
  status_color?: string;
  status_label?: string;
}

export interface InvitationFilters {
  type: 'all' | 'sent' | 'received';
  status: 'all' | 'pending' | 'accepted' | 'rejected' | 'cancelled';
  search: string;
}

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
  
  league_id?: number;
  club_id?: number;
  league?: League;
  club?: Club;
  
  invitation_data?: {
    league_name?: string;
    club_name?: string;
    message?: string;
  };
  
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

export interface SendInvitationForm {
  message: string;
  expires_at: string;
  league_id?: number;
  league_name?: string;
}

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

export interface AvailableEntitiesResponse {
  data: PaginatedResponse<League | Club>;
}