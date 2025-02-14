const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Nastavení transportéru pro Zoho
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.eu',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS
    }
});

// Endpoint pro odesílání emailů
app.post('/sendEmails', (req, res) => {
    const recipientEmail = req.body.recipientEmail;
    const orderNumber = req.body.orderNumber;
    const messageText = req.body.messageText;
    const filledData = req.body.filledData;

    // První email pro příjemce
    transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipientEmail,
        subject: `Objednávka č. ${orderNumber}`,
        text: messageText
    }, (error, info) => {
        if (error) {
            return res.status(500).send(`Chyba při odesílání e-mailu: ${error}`);
        }
        console.log('Email pro příjemce byl odeslán:', info.response);

        // Druhý email pro kvapil@mejzlik.eu
        transporter.sendMail({
            from: process.env.SMTP_USER,
            to: 'kvapil@mejzlik.eu',
            subject: `Kopie: Objednávka č. ${orderNumber}`,
            text: filledData
        }, (error, info) => {
            if (error) {
                return res.status(500).send(`Chyba při odesílání e-mailu: ${error}`);
            }
            console.log('Email pro kvapil@mejzlik.eu byl odeslán:', info.response);
            res.status(200).send('Oba emaily byly úspěšně odeslány!');
        });
    });
});

// Statické soubory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server běží na http://localhost:${PORT}`);
});
