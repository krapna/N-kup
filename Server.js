const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 10000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const transporter = nodemailer.createTransport({
    host: "smtp.zoho.eu",
    port: 465,
    secure: true, // Používá SSL
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.post("/send-email", async (req, res) => {
    try {
        const { recipientEmail, messageText, orderNumber, filledData } = req.body;

        // První e-mail pro příjemce
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: recipientEmail,
            subject: `Objednávka č. ${orderNumber}`,
            text: messageText
        });

        // Druhý e-mail pro tebe (kvapil@mejzlik.eu)
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: "kvapil@mejzlik.eu",
            subject: `Kopie: Objednávka č. ${orderNumber}`,
            text: filledData
        });

        res.status(200).send("E-maily byly úspěšně odeslány!");
    } catch (error) {
        console.error("Chyba při odesílání e-mailu:", error);
        res.status(500).send("Nepodařilo se odeslat e-mail.");
    }
});

app.listen(port, () => {
    console.log(`Server běží na portu ${port}`);
});
