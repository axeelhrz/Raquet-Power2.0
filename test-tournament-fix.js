// Test script to verify the tournament creation fix
import axios from 'axios';

const testTournamentCreation = async () => {
  try {
    // Test data similar to what the frontend sends
    const tournamentData = {
      name: "Test Tournament Fix",
      description: "Torneo Individual - groups",
      tournament_type: "individual",
      start_date: "2025-02-01T10:00:00",
      end_date: "2025-02-01T23:59:59",
      registration_deadline: "2025-01-25T23:59:59",
      max_participants: 32,
      entry_fee: 0,
      status: "upcoming",
      code: "TEST123",
      country: "Ecuador",
      province: "Pichincha",
      city: "Quito",
      club_name: "Test Club",
      club_address: "Test Address",
      modality: "singles"
      // Note: No league_id provided - this should work now
    };

    console.log('🧪 Testing tournament creation fix...');
    console.log('📤 Sending data:', JSON.stringify(tournamentData, null, 2));

    const response = await axios.post('http://localhost:8001/api/tournaments', tournamentData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('✅ Success! Tournament created:', response.data);
    
    if (response.data.success) {
      console.log('🎉 Tournament ID:', response.data.data.id);
      console.log('🏆 Tournament Name:', response.data.data.name);
      console.log('🔗 League ID:', response.data.data.league_id || 'null (as expected)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.data?.errors) {
      console.error('🔍 Validation errors:', error.response.data.errors);
    }
  }
};

// Run the test
testTournamentCreation();