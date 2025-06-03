// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static('../public')); // Stellt Frontend-Dateien bereit
// --- Zustände und Daten für den Kalkulator ---
const conversationStates = {}; // Speichert den Zustand jeder Konversation (für jeden Client)

// Beispielpreise (können natürlich angepasst werden)
const prices = {
    // Haushaltsauflösung (pro m² und Stockwerk)
    haushaltsaufloesung: {
        pro_m2: {
            "bis 50m²": 25,
            "51-100m²": 20,
            "über 100m²": 15
        },
        stockwerk_zuschlag: {
            "EG/Aufzug": 0,
            "1. OG": 5,
            "2. OG": 8,
            "3. OG oder höher": 12
        }
    },
    // Entrümpelung (Pauschale + pro m²)
    entruempelung: {
        pauschale: 150, // Grundpauschale für Entrümpelung
        pro_m2: {
            "bis 20m²": 30, // z.B. Keller/Dachboden
            "21-50m²": 25,
            "über 50m²": 20
        }
    },
    // Umzug (Pauschale + pro km)
    umzug: {
        pauschale: 300,
        pro_km: 1.5 // Preis pro Kilometer
    }
};

// --- Helferfunktion zur Preisberechnung ---
function calculatePrice(service, details) {
    let basePrice = 0;
    let finalPrice = 0;
    let explanation = "";

    switch (service) {
        case "haushaltsaufloesung":
            const m2Price = prices.haushaltsaufloesung.pro_m2[details.size];
            const stockwerkZuschlag = prices.haushaltsaufloesung.stockwerk_zuschlag[details.floor];

            if (!m2Price || !stockwerkZuschlag) {
                return { price: "N/A", explanation: "Fehlende Details für Haushaltsauflösung." };
            }
            basePrice = parseFloat(details.size.replace(/[^0-9.]/g, '')); // Extrahiert Zahl aus "bis 50m²"
            if (details.size === "bis 50m²") basePrice = 50; // Maxwert für Kalkulation
            else if (details.size === "51-100m²") basePrice = 75; // Mittelwert
            else if (details.size === "über 100m²") basePrice = 120; // Beispielwert

            finalPrice = (basePrice * m2Price) + (basePrice * stockwerkZuschlag); // Einfache Kalkulation
            explanation = `Für Ihre ${details.size} Wohnung in einem ${details.floor} Stockwerk beträgt der geschätzte Preis für eine Haushaltsauflösung ca. `;
            break;

        case "entruempelung":
            const entruempelungM2Price = prices.entruempelung.pro_m2[details.size];
            if (!entruempelungM2Price) {
                 return { price: "N/A", explanation: "Fehlende Details für Entrümpelung." };
            }
            basePrice = parseFloat(details.size.replace(/[^0-9.]/g, '')); // Extrahiert Zahl aus "bis 20m²"
            if (details.size === "bis 20m²") basePrice = 20;
            else if (details.size === "21-50m²") basePrice = 35;
            else if (details.size === "über 50m²") basePrice = 60;

            finalPrice = prices.entruempelung.pauschale + (basePrice * entruempelungM2Price);
            explanation = `Für die Entrümpelung Ihrer ca. ${details.size} Fläche beträgt der geschätzte Preis ca. `;
            break;

        case "umzug":
            if (!details.distance) {
                return { price: "N/A", explanation: "Fehlende Distanz für Umzug." };
            }
            finalPrice = prices.umzug.pauschale + (details.distance * prices.umzug.pro_km);
            explanation = `Für Ihren Umzug über ca. ${details.distance} km beträgt der geschätzte Preis ca. `;
            break;
    }

    return { price: finalPrice.toFixed(2), explanation: explanation };
}


// --- POST /chat Endpunkt ---
app.post('/chat', (req, res) => {
    const userMessage = req.body.message;
    const clientId = req.body.clientId || 'default'; // Verwenden einer Client-ID für Konversationszustand

    // Initialisiere Zustand, falls nicht vorhanden
    if (!conversationStates[clientId]) {
        conversationStates[clientId] = {
            state: 'initial',
            service: null,
            details: {}
        };
    }

    let currentState = conversationStates[clientId];
    let botReply = "";
    let options = []; // Für Auswahlbuttons
    let endConversation = false; // Flag, um Chat-Eingabe wieder freizugeben

    console.log(`Client ${clientId} - Current State: ${currentState.state}, Message: ${userMessage}`);

    // --- Konversationslogik basierend auf dem Zustand ---
    switch (currentState.state) {
        case 'initial':
            if (userMessage.toLowerCase().includes("hallo") || userMessage.toLowerCase().includes("hi")) {
                botReply = "Hallo! Wie kann ich Ihnen heute helfen? Wählen Sie eine Option:";
                options = [
                    { text: "Preis für Haushaltsauflösung berechnen", value: "haushaltsaufloesung" },
                    { text: "Preis für Entrümpelung berechnen", value: "entruempelung" },
                    { text: "Preis für Umzug berechnen", value: "umzug" },
                    { text: "Allgemeine Frage", value: "allgemeine_frage" }
                ];
                currentState.state = 'waiting_for_service_selection';
            } else if (userMessage.toLowerCase().includes("preis") || userMessage.toLowerCase().includes("kalkulator")) {
                botReply = "Für welchen Service möchten Sie einen Preis berechnen?";
                options = [
                    { text: "Haushaltsauflösung", value: "haushaltsaufloesung" },
                    { text: "Entrümpelung", value: "entruempelung" },
                    { text: "Umzug", value: "umzug" }
                ];
                currentState.state = 'waiting_for_service_selection';
            } else {
                botReply = "Hallo! Ich bin der reset. Bot. Ich kann Ihnen bei Fragen zu Haushaltsauflösungen, Entrümpelungen und Umzügen helfen oder Ihnen einen Preis kalkulieren. Wie kann ich behilflich sein?";
                options = [
                    { text: "Preis kalkulieren", value: "preis_kalkulieren" },
                    { text: "Über reset.", value: "ueber_reset" },
                    { text: "Kontakt", value: "kontakt_bot" }
                ];
            }
            break;

        case 'waiting_for_service_selection':
            currentState.service = userMessage; // Speichert den ausgewählten Service (z.B. "haushaltsaufloesung")
            currentState.details = {}; // Details zurücksetzen
            if (userMessage === "haushaltsaufloesung") {
                botReply = "Okay, Haushaltsauflösung. Wie groß ist die Fläche in m²?";
                options = [
                    { text: "bis 50m²", value: "bis 50m²" },
                    { text: "51-100m²", value: "51-100m²" },
                    { text: "über 100m²", value: "über 100m²" }
                ];
                currentState.state = 'waiting_for_haushaltsaufloesung_size';
            } else if (userMessage === "entruempelung") {
                botReply = "Alles klar, Entrümpelung. Um welche Art von Fläche handelt es sich und wie groß ist diese ungefähr in m²?";
                 options = [
                    { text: "Keller/Dachboden (bis 20m²)", value: "bis 20m²" },
                    { text: "Wohnung (21-50m²)", value: "21-50m²" },
                    { text: "Große Fläche (über 50m²)", value: "über 50m²" }
                ];
                currentState.state = 'waiting_for_entruempelung_size';
            } else if (userMessage === "umzug") {
                botReply = "Gerne, Umzug. Wie viele Kilometer beträgt die geschätzte Distanz?";
                currentState.state = 'waiting_for_umzug_distance';
            } else if (userMessage === "allgemeine_frage" || userMessage === "ueber_reset" || userMessage === "kontakt_bot" || userMessage === "preis_kalkulieren") {
                 if (userMessage === "allgemeine_frage" || userMessage === "ueber_reset") {
                    botReply = "reset. steht für professionelle Haushaltsauflösungen, Entrümpelungen und Umzüge mit Herz und Verstand. Wir legen Wert auf Diskretion und einen reibungslosen Ablauf.";
                } else if (userMessage === "kontakt_bot") {
                    botReply = "Am besten erreichen Sie uns über unser Kontaktformular oder telefonisch unter XXXX-XXXXXX. Wir freuen uns auf Ihre Anfrage!";
                } else if (userMessage === "preis_kalkulieren") {
                    botReply = "Für welchen Service möchten Sie einen Preis berechnen?";
                    options = [
                        { text: "Haushaltsauflösung", value: "haushaltsaufloesung" },
                        { text: "Entrümpelung", value: "entruempelung" },
                        { text: "Umzug", value: "umzug" }
                    ];
                    currentState.state = 'waiting_for_service_selection'; // Zurück zum Serviceauswahl-Zustand
                }
                endConversation = true; // Konversation "beenden" (Eingabe wieder freigeben)
                // Zustandsreset, damit der Bot beim nächsten "Hallo" wieder bei Null anfängt
                setTimeout(() => { conversationStates[clientId] = { state: 'initial', service: null, details: {} }; }, 5000); // Nach 5s Reset
            } else {
                botReply = "Das habe ich nicht verstanden. Bitte wählen Sie einen der angebotenen Services:";
                options = [
                    { text: "Haushaltsauflösung", value: "haushaltsaufloesung" },
                    { text: "Entrümpelung", value: "entruempelung" },
                    { text: "Umzug", value: "umzug" }
                ];
            }
            break;

        case 'waiting_for_haushaltsaufloesung_size':
            currentState.details.size = userMessage;
            botReply = "Verstanden. In welchem Stockwerk befindet sich die Wohnung (inkl. Keller/Dachboden) oder gibt es einen Aufzug?";
            options = [
                { text: "EG/Aufzug vorhanden", value: "EG/Aufzug" },
                { text: "1. OG", value: "1. OG" },
                { text: "2. OG", value: "2. OG" },
                { text: "3. OG oder höher", value: "3. OG oder höher" }
            ];
            currentState.state = 'waiting_for_haushaltsaufloesung_floor';
            break;

        case 'waiting_for_haushaltsaufloesung_floor':
            currentState.details.floor = userMessage;
            const haushaltsaufloesungResult = calculatePrice("haushaltsaufloesung", currentState.details);
            botReply = `${haushaltsaufloesungResult.explanation} **${haushaltsaufloesungResult.price} €** (inkl. MwSt.). Dies ist ein Richtwert und kann je nach Aufwand variieren. Möchten Sie ein echtes Angebot?`;
            options = [
                { text: "Ja, bitte ein konkretes Angebot", value: "konkretes_angebot_haushalt" },
                { text: "Nein, danke", value: "nein_danke" }
            ];
            currentState.state = 'finished_calculation';
            break;

        case 'waiting_for_entruempelung_size':
            currentState.details.size = userMessage;
            const entruempelungResult = calculatePrice("entruempelung", currentState.details);
            botReply = `${entruempelungResult.explanation} **${entruempelungResult.price} €** (inkl. MwSt.). Dies ist ein Richtwert und kann je nach Aufwand variieren. Möchten Sie ein echtes Angebot?`;
            options = [
                { text: "Ja, bitte ein konkretes Angebot", value: "konkretes_angebot_entruempelung" },
                { text: "Nein, danke", value: "nein_danke" }
            ];
            currentState.state = 'finished_calculation';
            break;

        case 'waiting_for_umzug_distance':
            const distance = parseInt(userMessage.replace(/[^0-9]/g, '')); // Nur Zahlen extrahieren
            if (isNaN(distance) || distance <= 0) {
                botReply = "Das war keine gültige Distanz. Bitte geben Sie die geschätzte Distanz in Kilometern als Zahl ein.";
                // Bleibt im selben Zustand, um die Eingabe zu wiederholen
            } else {
                currentState.details.distance = distance;
                const umzugResult = calculatePrice("umzug", currentState.details);
                botReply = `${umzugResult.explanation} **${umzugResult.price} €** (inkl. MwSt.). Dies ist ein Richtwert und kann je nach Aufwand variieren. Möchten Sie ein echtes Angebot?`;
                options = [
                    { text: "Ja, bitte ein konkretes Angebot", value: "konkretes_angebot_umzug" },
                    { text: "Nein, danke", value: "nein_danke" }
                ];
                currentState.state = 'finished_calculation';
            }
            break;

        case 'finished_calculation':
            if (userMessage.includes("konkretes_angebot")) {
                botReply = "Perfekt! Bitte nutzen Sie unser detailliertes Kontaktformular, um uns weitere Informationen zukommen zu lassen. Wir melden uns dann umgehend bei Ihnen.";
            } else {
                botReply = "Alles klar! Wenn Sie weitere Fragen haben oder ein anderes Anliegen, stehe ich Ihnen gerne zur Verfügung. Sie können jederzeit wieder 'Hallo' sagen, um neu zu starten.";
            }
            endConversation = true; // Konversation beenden
            // Zustandsreset nach Abschluss
            setTimeout(() => { conversationStates[clientId] = { state: 'initial', service: null, details: {} }; }, 5000); // Nach 5s Reset
            break;

        default:
            botReply = "Entschuldigen Sie, ich bin durcheinander. Lassen Sie uns neu starten. Wie kann ich Ihnen helfen?";
            options = [
                { text: "Preis kalkulieren", value: "preis_kalkulieren" },
                { text: "Allgemeine Frage", value: "allgemeine_frage" }
            ];
            currentState.state = 'initial'; // Reset bei unbekanntem Zustand
            break;
    }

    res.json({
        reply: botReply,
        options: options, // Die neuen Optionen für den Frontend
        endConversation: endConversation // Signal an das Frontend, die Eingabe zu sperren
    });
});

app.listen(port, () => {
    console.log(`Bot-Backend läuft auf http://localhost:${port}`);
});