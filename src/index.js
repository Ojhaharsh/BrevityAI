require('dotenv').config();
const express = require('express');
const summarizeText = require('./summarize.js'); // Import the summarizeText function
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies (as sent by API clients)
app.use(express.json());

// Serves static files from the 'public' directory
app.use(express.static('public'));

// Handle POST requests to the '/summarize' endpoint
app.post('/summarize', async (req, res) => {
  const text = req.body.text_to_summarize;

  if (!text) {
    return res.status(400).send({ error: 'No text_to_summarize provided' });
  }

  try {
    // Call summarizeText function, passing in the text from the request
    const summary = await summarizeText(text);
    res.send({ summary }); // Send the summary text as a response to the client
  } catch (error) {
    console.error('Error during summarization:', error.message);
    res.status(500).send({ error: 'Failed to summarize text' });
  }
});

// Start the server and handle potential port conflicts
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${server.address().port}`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setTimeout(() => {
      server.close();
      server.listen(0); // This will find an available port
    }, 1000);
  } else {
    console.error('Server error:', e);
  }
});
