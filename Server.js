require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Obsluha statických souborů (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Výchozí route pro načtení hlavní stránky
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Nastavení Nodemailer SMTP pro Zoho Mail
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.eu', // SMTP server Zoho Mail
    port: 587,
    secure: false, // STARTTLS musí být povolen
    auth: {
        user: process.env.SMTP_USER, // E-mail pro odesílání
        pass: process.env.SMTP_PASS  // Heslo k e-mailu
    },
    tls: {
        rejectUnauthorized: false
    }
});

// API endpoint pro odeslání emailu
app.post('/sendEmail', async (req, res) => {
    const { recipientEmail, orderNumber, messageText, filledData } = req.body;

    try {
        // První email pro příjemce
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: recipientEmail,
            subject: `Objednávka č. ${orderNumber}`,
            text: messageText
        });

        // Druhý email jako kopie pro tvůj e-mail
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: 'kvapil@mejzlik.eu',  // Tvůj e-mail kam se posílá kopie
            subject: `Kopie: Objednávka č. ${orderNumber}`,
            text: filledData
        });

        res.status(200).json({ message: 'E-maily byly úspěšně odeslány.' });
    } catch (error) {
        console.error('Chyba při odesílání emailu:', error);
        res.status(500).json({ error: 'Chyba při odesílání emailu.' });
    }
});

// Spuštění serveru
app.listen(PORT, () => {
    console.log(`Server běží na portu ${PORT}`);
});
