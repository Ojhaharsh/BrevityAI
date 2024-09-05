const axios = require('axios');

// Summarize text with retry logic for handling model loading
async function summarizeWithRetry(text, maxRetries = 5) {
  let data = JSON.stringify({
    "inputs": text,
    "parameters": {
      "max_length": 100,
      "min_length": 30
    }
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
    },
    data: data
  };

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.request(config);
      return response.data[0].summary_text;
    } catch (error) {
      if (error.response && error.response.status === 503) {
        const waitTime = error.response.data.estimated_time || 20;
        console.log(`Model is loading. Waiting ${waitTime} seconds before retrying...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      } else {
        console.error('Error summarizing text:', error);
        throw error;
      }
    }
  }
  throw new Error('Max retries reached. Unable to summarize text.');
}

// Allows for summarizeWithRetry() to be called outside of this file
module.exports = summarizeWithRetry;
