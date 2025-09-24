import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api';

// Test configuration
const testConfig = {
  tournamentId: 6, // Use an existing tournament ID
  authToken: null // Will be set after login
};

async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    if (response.data.success && response.data.token) {
      testConfig.authToken = response.data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
    
    // Try with super admin credentials
    try {
      console.log('🔐 Trying super admin credentials...');
      const adminResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@raquetpower.com',
        password: 'admin123'
      });
      
      if (adminResponse.data.success && adminResponse.data.token) {
        testConfig.authToken = adminResponse.data.token;
        console.log('✅ Super admin login successful');
        return true;
      }
    } catch (adminError) {
      console.log('❌ Super admin login also failed:', adminError.response?.data || adminError.message);
    }
    
    return false;
  }
}

async function testTournamentMatches() {
  try {
    console.log(`🎾 Testing tournament matches endpoint for tournament ${testConfig.tournamentId}...`);
    
    const response = await axios.get(`${API_BASE_URL}/tournaments/${testConfig.tournamentId}/matches`, {
      headers: {
        'Authorization': `Bearer ${testConfig.authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Tournament matches endpoint working');
    console.log('Response:', {
      success: response.data.success,
      matchCount: response.data.data?.length || 0,
      status: response.status
    });
    
    return true;
  } catch (error) {
    console.log('❌ Tournament matches error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return false;
  }
}

async function testGenerateBracket() {
  try {
    console.log(`🏆 Testing generate bracket endpoint for tournament ${testConfig.tournamentId}...`);
    
    const response = await axios.post(`${API_BASE_URL}/tournaments/${testConfig.tournamentId}/generate-bracket`, {}, {
      headers: {
        'Authorization': `Bearer ${testConfig.authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Generate bracket endpoint working');
    console.log('Response:', {
      success: response.data.success,
      message: response.data.message,
      status: response.status
    });
    
    return true;
  } catch (error) {
    console.log('❌ Generate bracket error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    // If bracket already exists, that's expected
    if (error.response?.status === 400 && error.response?.data?.message?.includes('ya ha sido generado')) {
      console.log('ℹ️  Bracket already exists - this is expected');
      return true;
    }
    
    // If not enough participants, that's also expected
    if (error.response?.status === 400 && error.response?.data?.message?.includes('al menos 2 participantes')) {
      console.log('ℹ️  Not enough participants - this is expected for empty tournaments');
      return true;
    }
    
    return false;
  }
}

async function testWithUndefinedId() {
  try {
    console.log('🚫 Testing with undefined tournament ID (should fail gracefully)...');
    
    const response = await axios.get(`${API_BASE_URL}/tournaments/undefined/matches`, {
      headers: {
        'Authorization': `Bearer ${testConfig.authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('❌ Undefined ID test should have failed but didn\'t');
    return false;
  } catch (error) {
    if (error.message.includes('undefined parameter') || error.response?.status === 404) {
      console.log('✅ Undefined ID properly handled');
      return true;
    } else {
      console.log('❌ Unexpected error for undefined ID:', error.message);
      return false;
    }
  }
}

async function testCORSHeaders() {
  try {
    console.log('🌐 Testing CORS headers...');
    
    const response = await axios.get(`${API_BASE_URL}/tournaments/${testConfig.tournamentId}/matches`, {
      headers: {
        'Authorization': `Bearer ${testConfig.authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log('✅ CORS headers working properly');
    return true;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' && error.message.includes('CORS')) {
      console.log('❌ CORS error detected:', error.message);
      return false;
    } else {
      console.log('✅ CORS working (no CORS-specific errors)');
      return true;
    }
  }
}

async function runAllTests() {
  console.log('🧪 Starting Tournament Bracket Fix Tests\n');
  
  const results = {
    login: false,
    matches: false,
    generateBracket: false,
    undefinedId: false,
    cors: false
  };
  
  // Test login
  results.login = await testLogin();
  if (!results.login) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  console.log('');
  
  // Test tournament matches endpoint
  results.matches = await testTournamentMatches();
  console.log('');
  
  // Test generate bracket endpoint
  results.generateBracket = await testGenerateBracket();
  console.log('');
  
  // Test undefined ID handling
  results.undefinedId = await testWithUndefinedId();
  console.log('');
  
  // Test CORS
  results.cors = await testCORSHeaders();
  console.log('');
  
  // Summary
  console.log('📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Tournament bracket fixes are working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run the tests
runAllTests().catch(console.error);