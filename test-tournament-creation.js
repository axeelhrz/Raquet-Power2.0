// Simple test script to verify tournament creation
import axios from 'axios';

const testTournamentCreation = async () => {
  try {
    // Test data for tournament creation
    const tournamentData = {
      name: "Test Tournament",
      description: "Test tournament description",
      tournament_type: "individual",
      start_date: "2025-02-01T10:00:00",
      end_date: "2025-02-01T18:00:00",
      registration_deadline: "2025-01-25T23:59:59",
      max_participants: 16,
      entry_fee: 0,
      status: "upcoming",
      code: "123456",
      country: "Ecuador",
      province: "Pichincha",
      city: "Quito",
      club_name: "Test Club",
      club_address: "Test Address",
      modality: "singles"
    };

    console.log('🧪 Testing tournament creation...');
    console.log('📤 Sending data:', JSON.stringify(tournamentData, null, 2));

    const response = await axios.post('http://localhost:8001/api/tournaments', tournamentData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('✅ Success! Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.data?.errors) {
      console.error('🔍 Validation errors:', error.response.data.errors);
    }
  }
};

// Run the test
testTournamentCreation();