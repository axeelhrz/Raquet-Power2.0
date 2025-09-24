// Simple test script to verify tournament API
const axios = require('axios');

const testTournamentCreation = async () => {
  try {
    console.log('🧪 Testing tournament creation API...');
    
    // Minimal tournament data
    const tournamentData = {
      name: 'Test Tournament',
      description: 'Test tournament description',
      start_date: '2025-02-01T10:00:00',
      end_date: '2025-02-01T18:00:00',
      registration_deadline: '2025-01-30T23:59:59',
      max_participants: 16,
      tournament_type: 'individual',
      tournament_format: 'single_elimination',
      status: 'upcoming',
      code: '123456',
      country: 'Ecuador',
      province: 'Pichincha',
      city: 'Quito',
      club_name: 'Test Club',
      modality: 'singles',
      match_type: 'best_of_3',
      seeding_type: 'random',
      gender: 'mixed',
      affects_ranking: true,
      draw_lottery: true,
      system_invitation: true,
      scheduled_reminder: false
    };

    console.log('📤 Sending tournament data:', JSON.stringify(tournamentData, null, 2));

    const response = await axios.post('https://web-production-40b3.up.railway.app/api/tournaments', tournamentData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // You'll need to add your auth token here
        'Authorization': 'Bearer YOUR_AUTH_TOKEN_HERE'
      }
    });

    console.log('✅ Tournament created successfully!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error creating tournament:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run the test
testTournamentCreation();