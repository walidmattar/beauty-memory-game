const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------------------
// CONFIGURATION
// --------------------------------------------------------
const SPREADSHEET_ID = '1X0l2EQf5O9_cm2W2KCu3dy_roVIxjXBU6olIq2yYbCA';
// --------------------------------------------------------

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Root route to ensure index.html loads
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize Google Sheet Connection
async function getDoc() {
    let creds;

    // Try Environment Variable first (Vercel/Render)
    if (process.env.GOOGLE_CREDENTIALS) {
        try {
            creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        } catch (e) {
            console.error('Failed to parse GOOGLE_CREDENTIALS:', e);
            throw new Error('Server configuration error: Invalid Credentials format');
        }
    }
    // Try local file (Local Development)
    else if (fs.existsSync(path.join(__dirname, 'google-credentials.json'))) {
        creds = require('./google-credentials.json');
    }
    else {
        throw new Error('Credentials not found! Please set GOOGLE_CREDENTIALS env var.');
    }

    const serviceAccountAuth = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
}

// Save player data endpoint
app.post('/save-player', async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const doc = await getDoc();
        const sheet = doc.sheetsByIndex[0];

        const now = new Date();
        await sheet.addRow({
            Name: name,
            Email: email,
            Phone: phone,
            Date: now.toLocaleDateString('en-GB'),
            Time: now.toLocaleTimeString('en-GB')
        });

        res.json({ success: true, message: 'Saved successfully' });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: ' + error.message,
            details: error.toString()
        });
    }
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
