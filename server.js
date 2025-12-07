const express = require('express');
// const { GoogleSpreadsheet } = require('google-spreadsheet');
// const { JWT } = require('google-auth-library');
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
// app.use(express.static(path.join(__dirname, 'public'))); // Handled by Vercel now

// Root route - Not needed for API, but good for health check
app.get('/', (req, res) => {
    if (!name || !email || !phone) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // DEBUG: Google Sheets logic disabled to test deployment
    /*
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
    */
    console.log('Mock save:', { name, email, phone });

    res.json({ success: true, message: 'Saved successfully (Mock)' });

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
