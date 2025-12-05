const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const verifySettings = async () => {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('Login successful, token received.');

    // 2. Update Settings
    console.log('Updating settings...');
    const newSiteName = 'Verified Shop ' + Date.now();
    await axios.put(
      `${API_URL}/settings`,
      {
        general: {
          siteName: newSiteName
        }
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log(`Settings updated. Site Name set to: ${newSiteName}`);

    // 3. Verify Public Settings
    console.log('Fetching public settings...');
    const publicSettingsRes = await axios.get(`${API_URL}/settings/public`);
    const fetchedSiteName = publicSettingsRes.data.siteName;

    if (fetchedSiteName === newSiteName) {
      console.log('SUCCESS: Public settings reflect the change!');
    } else {
      console.error(`FAILURE: Expected ${newSiteName}, got ${fetchedSiteName}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('Error details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
};

verifySettings();
