const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const verifyCurrency = async () => {
  try {
    console.log('Fetching currency rates...');
    const response = await axios.get(`${API_URL}/currency/rates`);
    
    if (response.status === 200 && response.data.rates) {
      console.log('Successfully fetched rates!');
      console.log('USD Rate:', response.data.rates.USD);
      console.log('EUR Rate:', response.data.rates.EUR);
      console.log('PKR Rate:', response.data.rates.PKR);
    } else {
      console.error('Failed to fetch rates. Status:', response.status);
    }
  } catch (error) {
    console.error('Error fetching rates:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

verifyCurrency();
