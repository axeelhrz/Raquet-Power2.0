import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface ExistingClub {
  name: string;
  city: string | null;
  province: string | null;
  country: string;
  display_name: string;
  source: 'database' | 'predefined';
  is_existing: boolean;
}

export interface ExistingLeague {
  name: string;
  province: string | null;
  region: string | null;
  display_name: string;
  source: 'database' | 'predefined';
  is_existing: boolean;
}

interface UseExistingClubsOptions {
  search?: string;
  province?: string;
  city?: string;
  limit?: number;
}

interface UseExistingLeaguesOptions {
  search?: string;
  province?: string;
  limit?: number;
}

export const useExistingClubs = (options: UseExistingClubsOptions = {}) => {
  const [clubs, setClubs] = useState<ExistingClub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClubs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.search) params.append('search', options.search);
      if (options.province) params.append('province', options.province);
      if (options.city) params.append('city', options.city);
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await axios.get(`/api/registro-rapido/existing-clubs?${params.toString()}`);
      
      if (response.data.success) {
        setClubs(response.data.clubs);
      } else {
        setError('Error al obtener clubes existentes');
      }
    } catch (err) {
      console.error('Error fetching existing clubs:', err);
      setError('Error de conexión al obtener clubes');
      setClubs([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, [options.search, options.province, options.city, options.limit]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const searchClubs = useCallback((searchTerm: string) => {
    return fetchClubs();
  }, [fetchClubs]);

  return {
    clubs,
    loading,
    error,
    refetch: fetchClubs,
    searchClubs
  };
};

export const useExistingLeagues = (options: UseExistingLeaguesOptions = {}) => {
  const [leagues, setLeagues] = useState<ExistingLeague[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeagues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.search) params.append('search', options.search);
      if (options.province) params.append('province', options.province);
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await axios.get(`/api/registro-rapido/existing-leagues?${params.toString()}`);
      
      if (response.data.success) {
        setLeagues(response.data.leagues);
      } else {
        setError('Error al obtener ligas existentes');
      }
    } catch (err) {
      console.error('Error fetching existing leagues:', err);
      setError('Error de conexión al obtener ligas');
      setLeagues([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, [options.search, options.province, options.limit]);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  const searchLeagues = useCallback((searchTerm: string) => {
    return fetchLeagues();
  }, [fetchLeagues]);

  return {
    leagues,
    loading,
    error,
    refetch: fetchLeagues,
    searchLeagues
  };
};