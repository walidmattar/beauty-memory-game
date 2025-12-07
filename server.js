const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000; // Use environment port for cloud deployment

// --------------------------------------------------------
// CONFIGURATION - YOU MUST FILL THIS
// --------------------------------------------------------
const SPREADSHEET_ID = '1X0l2EQf5O9_cm2W2KCu3dy_roVIxjXBU6olIq2yYbCA'; // <--- PASTE YOUR GOOGLE SHEET ID HERE
const CREDENTIALS_FILE = path.join(__dirname, 'google-credentials.json');
// --------------------------------------------------------

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize Google Sheet Connection
async function getDoc() {
    if (!fs.existsSync(CREDENTIALS_FILE)) {
        throw new Error('Credentials file not found! Please create google-credentials.json');
    }

    const creds = require(CREDENTIALS_FILE);

    const serviceAccountAuth = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
        ],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
}

// Save player data endpoint
app.post('/save-player', async (req, res) => {
    console.log('\n========================================');
    console.log('📥 RECEIVED SAVE REQUEST');
    console.log('========================================');

    try {
        const { name, email, phone } = req.body;
        console.log('📝 Data received:', { name, email, phone });

        // Validate input
        if (!name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
            throw new Error('Please set the SPREADSHEET_ID in server.js');
        }

        // Connect to Google Sheet
        console.log('☁️ Connecting to Google Sheets...');
        const doc = await getDoc();
        console.log(`✓ Connected to sheet: ${doc.title}`);

        const sheet = doc.sheetsByIndex[0]; // Use the first sheet

        // Get current date and time
        const now = new Date();
        const date = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
        const time = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Add row
        await sheet.addRow({
            Name: name,
            Email: email,
            Phone: phone,
            Date: date,
            Time: time
        });

        console.log(`✓ Player saved to cloud: ${name}`);

        res.json({
            success: true,
            message: 'Player data saved successfully to cloud'
        });

    } catch (error) {
        console.error('❌ Error saving player data:', error);

        let userMessage = 'Error saving data to cloud';
        if (error.message.includes('SPREADSHEET_ID')) {
            userMessage = 'Server configuration error: Spreadsheet ID missing';
        } else if (error.message.includes('Credentials')) {
            userMessage = 'Server configuration error: Credentials missing';
        }

        res.status(500).json({
            success: false,
            message: userMessage,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🎮 Beauty Memory Game Server Running`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`☁️  Storage: Google Sheets`);
    if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
        console.log(`⚠️  WARNING: You need to set SPREADSHEET_ID in server.js`);
    }
});
