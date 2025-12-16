
import { env } from './src/config/env';

async function main() {
    const apiKey = process.env.PANDASCORE_API_KEY;
    if (!apiKey) {
        console.error('No API Key found in process.env');
        return;
    }

    console.log('Testing raw fetch to https://api.pandascore.co/lol/teams...');
    
    try {
        const response = await fetch('https://api.pandascore.co/lol/teams?page[size]=5', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Fetch failed: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error('Body:', text);
            return;
        }

        const data = await response.json();
        console.log('Success! Teams found:', data.length);
        console.log('Sample Team:', data[0]?.name);
        
        // Also try CS2? /csgo/teams
        console.log('\nTesting /csgo/teams...');
        const resCS = await fetch('https://api.pandascore.co/csgo/teams?page[size]=5', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            }
        }); 
        
        if (resCS.ok) {
             const dataCS = await resCS.json();
             console.log('Success CSGO! Teams:', dataCS.length);
        } else {
             console.log('CSGO Endpoint failed:', resCS.status);
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

main();
