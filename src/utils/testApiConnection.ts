import api from '@/lib/axios';

// Función para probar la conexión con la API
export const testApiConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    
    // Test 1: Health check
    const healthResponse = await api.get('/api/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test 2: Test endpoint
    const testResponse = await api.get('/api/test');
    console.log('✅ Test endpoint:', testResponse.data);
    
    // Test 3: Test registration endpoint (POST)
    const testRegisterResponse = await api.post('/api/test-register', {
      test: 'data',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Test register endpoint:', testRegisterResponse.data);
    
    return {
      success: true,
      results: {
        health: healthResponse.data,
        test: testResponse.data,
        testRegister: testRegisterResponse.data
      }
    };
    
  } catch (error: unknown) {
    console.error('❌ API connection test failed:', error);

    if (error && typeof error === 'object') {
      return {
        success: false,
        error: {
          message: (error as unknown & { message?: string }).message,
          status: (error as unknown & { response?: { status?: number } }).response?.status,
          data: (error as unknown & { response?: { data?: unknown } }).response?.data,
          url: (error as unknown & { config?: { url?: string } }).config?.url
        }
      };
    }

    return {
      success: false,
      error: {
        message: String(error),
        status: undefined,
        data: undefined,
        url: undefined
      }
    };
  }
};

// Función para probar específicamente el endpoint de registro rápido
export const testRegistroRapido = async () => {
  try {
    console.log('🔍 Testing registro-rapido endpoint...');
    
    const testData = new FormData();
    testData.append('first_name', 'Test');
    testData.append('last_name', 'User');
    testData.append('email', `test-${Date.now()}@example.com`);
    testData.append('phone', '1234567890');
    testData.append('province', 'Guayas');
  } catch (error: unknown) {
    console.error('❌ Registro rapido test failed:', error);

    if (error && typeof error === 'object') {
      return {
        success: false,
        error: {
          message: (error as unknown & { message?: string }).message,
          status: (error as unknown & { response?: { status?: number } }).response?.status,
          data: (error as unknown & { response?: { data?: unknown } }).response?.data,
          url: (error as unknown & { config?: { url?: string } }).config?.url
        }
      };
    }

    return {
      success: false,
      error: {
        message: String(error),
        status: undefined,
        data: undefined,
        url: undefined
      }
    };
  }
};