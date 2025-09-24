import axios from 'axios';

// Test the tournaments API endpoint
async function testTournamentsAPI() {
    const baseURL = 'https://web-production-40b3.up.railway.app/api';
    
    console.log('🧪 Testing Tournaments API...');
    
    try {
        // Test basic API connectivity
        console.log('1. Testing basic API connectivity...');
        const testResponse = await axios.get(`${baseURL}/test`);
        console.log('✅ Basic API test:', testResponse.data);
        
        // Test database connectivity
        console.log('2. Testing database connectivity...');
        const dbTestResponse = await axios.get(`${baseURL}/test-db`);
        console.log('✅ Database test:', dbTestResponse.data);
        
        // Test tournaments endpoint without authentication (should get 401)
        console.log('3. Testing tournaments endpoint without auth...');
        try {
            const tournamentsResponse = await axios.get(`${baseURL}/tournaments`);
            console.log('❌ Unexpected success - should require authentication');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Correctly requires authentication (401)');
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        
        // Test with a dummy auth token (should get proper error handling)
        console.log('4. Testing tournaments endpoint with dummy auth...');
        try {
            const tournamentsResponse = await axios.get(`${baseURL}/tournaments`, {
                headers: {
                    'Authorization': 'Bearer dummy-token',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            console.log('❌ Unexpected success with dummy token');
        } catch (error) {
            if (error.response) {
                console.log(`✅ Proper error handling: ${error.response.status} - ${error.response.data.message || 'No message'}`);
                
                // If we get a 500 error, that's the issue we're trying to fix
                if (error.response.status === 500) {
                    console.log('❌ Still getting 500 error - database structure issue persists');
                    console.log('Error details:', error.response.data);
                } else if (error.response.status === 401) {
                    console.log('✅ Authentication working properly');
                }
            } else {
                console.log('❌ Network error:', error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testTournamentsAPI();