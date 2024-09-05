const axios = require('axios');

async function summarizeWithRetry(text, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
        { inputs: text },
        { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 503) {
        const waitTime = error.response.data.estimated_time || 20;
        console.log(`Model is loading. Waiting ${waitTime} seconds before retrying...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached. Unable to summarize text.');
}
