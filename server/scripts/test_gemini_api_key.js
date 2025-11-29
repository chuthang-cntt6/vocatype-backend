/**
 * Test Google Gemini API Key Script (no chalk)
 * Usage:
 *   node server/scripts/test_gemini_api_key.js <API_KEY> [model] [word] [meaning]
 */

const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)));

async function main() {
  const [,, apiKey, model = 'gemini-2.0-flash-exp', word = 'test', meaning = 'test'] = process.argv;

  if (!apiKey) {
    console.log('Usage: node server/scripts/test_gemini_api_key.js <API_KEY> [model] [word] [meaning]');
    process.exit(1);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  console.log(`🔑 Using key prefix: ${apiKey.slice(0, 10)}...`);
  console.log(`🧪 Model: ${model}`);
  console.log(`🌐 URL: ${url.replace(apiKey, '***')}`);

  const prompt = `Generate one short natural English sentence using the word "${word}" (meaning: ${meaning}).`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`\n🔄 Attempt ${attempt}/3 for "${word}"...`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error(`❌ Gemini API error (attempt ${attempt}): ${response.status} ${response.statusText}`);
        console.error('Error details:', JSON.stringify(errData, null, 2));

        if (response.status === 429) {
          const retryInfo = errData?.error?.details?.find(d => d['@type']?.includes('RetryInfo'));
          const delaySeconds = parseFloat(retryInfo?.retryDelay?.replace('s', '') || '10');
          console.log(`⏳ Waiting ${delaySeconds}s before retry...`);
          await new Promise(r => setTimeout(r, delaySeconds * 1000));
          continue;
        }

        process.exit(1);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '(no text returned)';
      console.log(`✅ Gemini response: ${text}`);
      return;
    } catch (err) {
      console.error(`⚠️ Fetch error (attempt ${attempt}): ${err.message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.error('❌ All attempts failed.');
}

main();
