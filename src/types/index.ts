// User types with role-specific information
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'liga' | 'miembro' | 'club' | 'super_admin';
  phone?: string;
  country?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  
  // Polymorphic relation fields
  roleable_id?: number;
  roleable_type?: string;
  
  // Related entities
  leagueEntity?: League;
  clubEntity?: Club;
  memberEntity?: Member;
  parentClub?: Club;
  rubber_type?: string;
  parent_club?: Club;
}

// League types
export interface League {
  id: number;
  name: string;
  province: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
  clubs?: Club[];
  tournaments?: Tournament[];
  clubs_count?: number;
  status?: 'active' | 'inactive';
  region?: string;
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
  
  // Club statistics
  number_of_tables?: number;
  can_create_tournaments?: boolean;
  
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
  drive_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopspin';
  drive_rubber_color?: 'negro' | 'rojo' | 'verde' | 'azul' | 'amarillo' | 'morado' | 'fucsia';
  drive_rubber_sponge?: string;
  drive_rubber_hardness?: string;
  drive_rubber_custom_brand?: string;
  drive_rubber_custom_model?: string;
  
  // Backhand rubber information
  backhand_rubber_brand?: string;
  backhand_rubber_model?: string;
  backhand_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopspin';
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
  brand_id: number;
  name: string;
  type?: string;
  speed?: number;
  control?: number;
  weight?: number;
  is_active: boolean;
  brand?: RacketBrand;
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
  brand_id: number;
  name: string;
  type: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopspin';
  speed?: number;
  spin?: number;
  control?: number;
  available_colors?: string[];
  available_sponges?: string[];
  available_hardness?: string[];
  is_active: boolean;
  brand?: RubberBrand;
}

export interface EcuadorLocation {
  id: number;
  province: string;
  city: string;
  is_active: boolean;
}

export interface TTClubReference {
  id: number;
  name: string;
  city: string;
  province: string;
  federation?: string;
  is_active: boolean;
}

// Updated form types
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
  drive_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopspin';
  drive_rubber_color?: 'negro' | 'rojo' | 'verde' | 'azul' | 'amarillo' | 'morado' | 'fucsia';
  drive_rubber_sponge?: string;
  drive_rubber_hardness?: string;
  drive_rubber_custom_brand?: string;
  drive_rubber_custom_model?: string;
  
  // Backhand rubber information
  backhand_rubber_brand?: string;
  backhand_rubber_model?: string;
  backhand_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopspin';
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
}

// Constants for dropdown options
export const RUBBER_COLORS = [
  'negro', 'rojo', 'verde', 'azul', 'amarillo', 'morado', 'fucsia'
] as const;

export const RUBBER_TYPES = [
  'liso', 'pupo_largo', 'pupo_corto', 'antitopspin'
] as const;

export const SPONGE_THICKNESSES = [
  '0.5', '0.7', '1.5', '1.6', '1.8', '1.9', '2', '2.1', '2.2', 'sin esponja'
] as const;

export const HARDNESS_LEVELS = [
  'h42', 'h44', 'h46', 'h48', 'h50', 'n/a'
] as const;

export const POPULAR_BRANDS = [
  'Butterfly', 'DHS', 'Sanwei', 'Nittaku', 'Yasaka', 'Stiga', 
  'Victas', 'Joola', 'Xiom', 'Saviga', 'Friendship', 'Dr. Neubauer'
] as const;

// Sport types
export interface Sport {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
  parameters?: SportParameter[];
  tournaments?: Tournament[];
  parameters_count?: number;
}

export interface SportParameter {
  id: number;
  sport_id: number;
  parameter_name: string;
  parameter_value: string;
  parameter_type: 'string' | 'number' | 'boolean' | 'select';
  options?: string;
  created_at: string;
  updated_at: string;
  sport?: Sport;
  param_key: string;
  param_value: string;
  param_type: 'text' | 'number' | 'boolean' | 'select';
  description: string;
  unit: string;
  category: string;
  typed_value: string;
}

// Tournament types
export interface Tournament {
  id: number;
  name: string;
  description?: string;
  league_id: number;
  sport_id: number;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  prize_pool: number;
  tournament_format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss_system';
  location?: string;
  rules?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  matches_played: number;
  matches_total: number;
  created_at: string;
  updated_at: string;
  league?: League;
  sport?: Sport;
  participants?: TournamentParticipant[];
}

export interface TournamentParticipant {
  id: number;
  tournament_id: number;
  participant_type: 'member' | 'club';
  participant_id: number;
  registration_date: string;
  status: 'registered' | 'confirmed' | 'withdrawn';
  created_at: string;
  updated_at: string;
  tournament?: Tournament;
}

// Invitation types
export interface Invitation {
  id: number;
  sender_id: number;
  sender_type: string;
  receiver_id: number;
  receiver_type: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  type: 'league_to_club' | 'club_to_league' | 'club_to_member' | 'member_to_club';
  metadata?: Record<string, unknown>;
  expires_at?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  
  // Populated relations
  sender?: League | Club | Member;
  receiver?: League | Club | Member;
  
  // Additional computed fields
  is_sender?: boolean;
  sender_name?: string;
  receiver_name?: string;
  sender_details?: {
    id: number;
    name: string;
    type: string;
    province?: string;
    city?: string;
  };
  receiver_details?: {
    id: number;
    name: string;
    type: string;
    province?: string;
    city?: string;
  };
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

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'liga' | 'club' | 'miembro';
  phone?: string;
  country?: string;
  
  // Role-specific fields
  province?: string; // For liga
  city?: string; // For club
  address?: string; // For club
  birth_date?: string; // For miembro
  gender?: 'male' | 'female' | 'other'; // For miembro
}

export interface LeagueForm {
  name: string;
  province: string;
}

export interface ClubForm {
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  league_id?: number;
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
  drive_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopspin';
  drive_rubber_color?: 'negro' | 'rojo' | 'verde' | 'azul' | 'amarillo' | 'morado' | 'fucsia';
  drive_rubber_sponge?: string;
  drive_rubber_hardness?: string;
  drive_rubber_custom_brand?: string;
  drive_rubber_custom_model?: string;
  
  // Backhand rubber information
  backhand_rubber_brand?: string;
  backhand_rubber_model?: string;
  backhand_rubber_type?: 'liso' | 'pupo_largo' | 'pupo_corto' | 'antitopspin';
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
}

export interface SportForm {
  name: string;
  code: string;
}

export interface SportParameterForm {
  sport_id: number;
  parameter_name: string;
  parameter_value: string;
  parameter_type: 'string' | 'number' | 'boolean' | 'select';
  options?: string;
}

export interface TournamentForm {
  name: string;
  description?: string;
  league_id: number;
  sport_id: number;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants: number;
  entry_fee: number;
  prize_pool: number;
  tournament_format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss_system';
  location?: string;
  rules?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

// Invitation form types
export interface InvitationForm {
  receiver_id: number;
  receiver_type: 'App\\Models\\Club' | 'App\\Models\\League';
  message?: string;
  type: 'league_to_club' | 'club_to_league';
  expires_at?: string;
}

export interface SendInvitationForm {
  club_id?: number;
  club_name?: string;
  league_id?: number;
  league_name?: string;
  message: string;
  expires_at?: string;
}

// Available entities response
export interface AvailableEntitiesResponse {
  data: PaginatedResponse<Club | League>;
  entity_type: 'clubs' | 'leagues';
}

// Statistics types
export interface LeagueStats {
  totalClubs: number;
  activeClubs: number;
  inactiveClubs: number;
  totalMembers: number;
  averageMembersPerClub: number;
  totalTournaments: number;
  upcomingTournaments: number;
  activeTournaments: number;
  completedTournaments: number;
  totalParticipants: number;
  totalPrizePool: number;
}

export interface ClubStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  maleMembers: number;
  femaleMembers: number;
  averageAge: number;
  tournamentsParticipated: number;
  wins: number;
  losses: number;
}

// Filter and search types
export interface FilterOptions {
  search?: string;
  status?: string;
  sport?: string;
  city?: string;
  league?: string;
  club?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface InvitationFilters {
  type?: 'sent' | 'received' | 'all';
  status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'all';
  search?: string;
}

// Modal and UI types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  count?: number;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: ValidationError[];
  status?: number;
}