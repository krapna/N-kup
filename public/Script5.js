document.addEventListener('DOMContentLoaded', function() {
    var nameInput = document.getElementById('recipientName');
    var emailInput = document.getElementById('recipientEmail');
    var textArea = document.getElementById('messageBody');
    var orderNumberInput = document.getElementById('orderNumber');
    var confirmButton = document.getElementById('confirmBtn');
    var endButton = document.getElementById('endBtn');
    var displayFormsDiv = document.createElement('div'); // Div pro zobrazení formulářů

    var currentDocumentIndex = parseInt(localStorage.getItem('currentDocumentIndex'), 10);
    var documents = JSON.parse(localStorage.getItem('documents')) || [];
    var currentDocument = (currentDocumentIndex !== null && !isNaN(currentDocumentIndex)) ? documents[currentDocumentIndex] : null;

    // Automatické vyplnění čísla objednávky a e-mailu
    if (currentDocument) {
        orderNumberInput.value = currentDocument.number || '';
        
        // Automatické doplnění e-mailu při zadání jména
        nameInput.addEventListener('input', function() {
            var nameParts = nameInput.value.split(' ');
            if (nameParts.length > 1) {
                var lastName = nameParts[1].toLowerCase();
                emailInput.value = `${lastName}@mejzlik.eu`;
            } else {
                emailInput.value = '';
            }
        });
    }

    confirmButton.addEventListener('click', function(event) {
        event.preventDefault();

        var emailRecipient = emailInput.value;
        var emailSubject = orderNumberInput.value;
        var emailBody = textArea.value;

        // Připravení příloh
        var attachments = currentDocument.files ? currentDocument.files.map(file => {
            return {
                filename: file.name,
                content: file.content.split("base64,")[1],
                encoding: 'base64'
            };
        }) : [];

        var filledData = displayFormsDiv.innerText;

        fetch('http://localhost:3000/sendEmails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipientEmail: emailRecipient,
                orderNumber: emailSubject,
                messageText: emailBody,
                filledData: filledData,
                attachments: attachments // Přidání příloh k požadavku
            })
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            alert('E-maily byly úspěšně odeslány.');
        })
        .catch(error => {
            console.error('Chyba při odesílání e-mailů:', error);
            alert('Došlo k chybě při odesílání e-mailů.');
        });

        if (currentDocument) {
            currentDocument.borderColor = 'gray';
            currentDocument.hasStrana4 = false;
            localStorage.setItem('documents', JSON.stringify(documents));
        }

        window.location.href = 'Strana1.html';
    });

    endButton.addEventListener('click', function() {
        window.location.href = 'Strana1.html';
    });

    function displayFilledForms() {
        displayFormsDiv.innerHTML = '';

        if (currentDocument) {
            // Zobrazení dat ze Strana2
            var strana2Data = `
                <h3>Formulář ze Strany 2</h3>
                <p><strong>Číslo dokumentu:</strong> ${currentDocument.number || ''}</p>
                <p><strong>Dodavatel:</strong> ${currentDocument.supplier || ''}</p>
                <p><strong>Stav balení:</strong> ${currentDocument.packagingStatus || ''}</p>
                <p><strong>Označení balení:</strong> ${currentDocument.packageLabel || ''}</p>
                <p><strong>Dodávka odpovídá dokumentům:</strong> ${currentDocument.deliveryMatch || ''}</p>
                <p><strong>Dokumenty dodávky:</strong> ${(currentDocument.documents || []).join(', ')}</p>
                <p><strong>Poznámka:</strong> ${currentDocument.note || ''}</p>
                <p><strong>Kontroloval:</strong> ${currentDocument.controlBy || ''}</p>
                <p><strong>Datum:</strong> ${currentDocument.date || ''}</p>
                <p><strong>Výsledek:</strong> ${currentDocument.result || ''}</p>
            `;

            // Zobrazení dat ze Strana3 včetně nahraných souborů
            var strana3Data = `
                <h3>Formulář ze Strany 3</h3>
                <p><strong>Číslo objednávky:</strong> ${currentDocument.orderNumber || ''}</p>
                <p><strong>Potvrzené datum dodání:</strong> ${currentDocument.confirmedDeliveryDate || ''}</p>
                <p><strong>Datum dodání:</strong> ${currentDocument.deliveryDate || ''}</p>
                <p><strong>Cena:</strong> ${currentDocument.price || ''}</p>
                <p><strong>Včasnost dodávky:</strong> ${currentDocument.timeliness || ''}</p>
                <p><strong>Kontrola vůči systému:</strong> ${currentDocument.systemCheck || ''}</p>
                <p><strong>Komunikace s dodavatelem:</strong> ${currentDocument.communication || ''}</p>
                <p><strong>Druh zboží:</strong> ${(currentDocument.goodsType || []).join(', ')}</p>
                <p><strong>Poznámka:</strong> ${currentDocument.note || ''}</p>
                <p><strong>Vstupní kontrola:</strong> ${currentDocument.entryControl || ''}</p>
                <h4>Nahrané soubory:</h4>
                ${currentDocument.files ? currentDocument.files.map(file => `<a href="${file.content}" target="_blank">${file.name}</a>`).join('<br>') : 'Žádné soubory'}
            `;

            // Zobrazení dat ze Strana4 (pokud existují)
            var strana4Data = '';
            if (currentDocument.hasStrana4) {
                strana4Data = `
                    <h3>Formulář ze Strany 4</h3>
                    <p><strong>Fyzická kontrola:</strong> ${currentDocument.physical || ''}</p>
                    <p><strong>Chemická kontrola:</strong> ${currentDocument.chemical || ''}</p>
                    <p><strong>Materiálová kontrola:</strong> ${currentDocument.material || ''}</p>
                    <p><strong>Dokumentace:</strong> ${currentDocument.documentation || ''}</p>
                    <p><strong>Poznámka:</strong> ${currentDocument.note || ''}</p>
                    <p><strong>Kontroloval:</strong> ${currentDocument.controlBy || ''}</p>
                    <p><strong>Datum:</strong> ${currentDocument.date || ''}</p>
                    <p><strong>Výsledek:</strong> ${currentDocument.result || ''}</p>
                `;
            }

            displayFormsDiv.innerHTML = strana2Data + strana3Data + strana4Data;
        }
    }

    displayFilledForms();
    document.body.appendChild(displayFormsDiv); 
});
