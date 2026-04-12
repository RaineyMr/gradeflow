// Test Anthropic API directly
require('dotenv').config();

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const apiKey = process.env.ANTHROPIC_API_KEY;

console.log('Testing Anthropic API...');
console.log('API Key exists:', !!apiKey);
console.log('API Key length:', apiKey?.length);

async function testAnthropic() {
  try {
    const response = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: 'Say "Hello from Claude!"'
        }]
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response data:', data);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error details:', error);
  }
}

testAnthropic();
