/* =========================================================
   AMIGO SECRETO
   HTML + CSS + JavaScript + Firebase
   ========================================================= */

/* =========================================================
   1. FIREBASE
   ========================================================= */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    set,
    runTransaction
} from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyC5_bGgGEOQSsKudu2LpbKmKLSil7oVOYA",
    authDomain: "amigo-secreto-2026-bdb.firebaseapp.com",
    databaseURL: "https://amigo-secreto-2026-bdb-default-rtdb.firebaseio.com",
    projectId: "amigo-secreto-2026-bdb",
    storageBucket: "amigo-secreto-2026-bdb.firebasestorage.app",
    messagingSenderId: "996033956741",
    appId: "1:996033956741:web:5a90633f84bc421fb452ec",
    measurementId: "G-5N1V15VZYH"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/* =========================================================
   2. CONFIGURACIÓN DEL SORTEO
   ========================================================= */

const participants = [
    { id: "persona1", name: "Groot", character: "Groot", wish: "Audífonos..." },
    { id: "persona2", name: "Jengi", character: "Jengi", wish: "Colores..." },
    { id: "persona3", name: "Sherk", character: "Sherk", wish: "Cachitos..." },
    { id: "persona4", name: "Agüebardo", character: "Agüebardo", wish: "Tratamiento..." },
    { id: "persona5", name: "don ramon", character: "don ramon", wish: "Espejo..." },
    { id: "persona6", name: "Dora la exploradora", character: "Dora la exploradora", wish: "Un reloj..." },
    { id: "persona7", name: "Gollum", character: "Gollum", wish: "Pantuflas..." }
];

/* =========================================================
   3. ELEMENTOS HTML
   ========================================================= */

const personSelect = document.getElementById("personSelect");
const continueButton = document.getElementById("continueButton");
const loginSection = document.getElementById("loginSection");
const firstTimeSection = document.getElementById("firstTimeSection");
const passwordSection = document.getElementById("passwordSection");
const resultSection = document.getElementById("resultSection");
const revealButton = document.getElementById("revealButton");
const revealResult = document.getElementById("revealResult");
const secretName = document.getElementById("secretName");
const secretWish = document.getElementById("secretWish");
const generatedPassword = document.getElementById("generatedPassword");
const passwordInput = document.getElementById("passwordInput");
const passwordButton = document.getElementById("passwordButton");
const passwordError = document.getElementById("passwordError");
const finalSecretName = document.getElementById("finalSecretName");
const finalSecretWish = document.getElementById("finalSecretWish");
const copyPasswordButton = document.getElementById("copyPasswordButton");
const finishButton = document.getElementById("finishButton");
const logoutButton = document.getElementById("logoutButton");
const errorMessage = document.getElementById("errorMessage");

/* =========================================================
   4. VARIABLES
   ========================================================= */

let selectedPerson = null;
let currentData = null;

/* =========================================================
   5. CARGAR PERSONAS
   ========================================================= */

function loadParticipants() {
    personSelect.innerHTML = `<option value="">Selecciona tu nombre...</option>`;
    participants.forEach(person => {
        const option = document.createElement("option");
        option.value = person.id;
        option.textContent = person.name;
        personSelect.appendChild(option);
    });
}

/* =========================================================
   6. GENERAR CONTRASEÑA
   ========================================================= */

function generatePassword() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
        const random = Math.floor(Math.random() * characters.length);
        password += characters[random];
    }
    return password;
}

/* =========================================================
   7. HASH DE CONTRASEÑA
   ========================================================= */

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
}

/* =========================================================
   8. BUSCAR DATOS DEL SORTEO
   ========================================================= */

async function getGameData() {
    const gameReference = ref(database, "secretGame");
    const snapshot = await get(gameReference);
    if (!snapshot.exists()) return null;
    return snapshot.val();
}

/* =========================================================
   9. CREAR EL SORTEO
   ========================================================= */

async function createGameIfNeeded() {
    const existingGame = await getGameData();
    if (existingGame) return existingGame;

    const characters = participants.map(p => p.character);
    const uniqueCharacters = new Set(characters);
    if (uniqueCharacters.size !== participants.length) {
        throw new Error("Hay personajes repetidos.");
    }

    const shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const results = {};
    participants.forEach((person, index) => {
        results[person.id] = {
            name: person.name,
            targetId: shuffled[index].id,
            targetCharacter: shuffled[index].character,
            targetWish: shuffled[index].wish,
            revealed: false,
            passwordHash: null
        };
    });

    const newGame = { createdAt: Date.now(), results };
    const gameReference = ref(database, "secretGame");

    const transactionResult = await runTransaction(gameReference, current => {
        if (current !== null) return;
        return newGame;
    });

    return transactionResult.snapshot.val();
}

/* =========================================================
   10. SELECCIONAR PERSONA
   ========================================================= */

continueButton.addEventListener("click", async () => {
    errorMessage.classList.add("hidden");
    const selectedId = personSelect.value;
    if (!selectedId) {
        showError("Por favor selecciona tu nombre.");
        return;
    }

    continueButton.disabled = true;
    continueButton.textContent = "Cargando...";

    try {
        const game = await createGameIfNeeded();
        selectedPerson = participants.find(p => p.id === selectedId);
        currentData = game.results[selectedId];
        if (!currentData) throw new Error("No se encontró la información.");

        loginSection.classList.add("hidden");
        if (!currentData.revealed) {
            firstTimeSection.classList.remove("hidden");
        } else {
            passwordSection.classList.remove("hidden");
        }
    } catch (error) {
        console.error(error);
        showError(error.message || "Ocurrió un error.");
    } finally {
        continueButton.disabled = false;
        continueButton.textContent = "🎁 Continuar";
    }
});

/* =========================================================
   11. REVELAR RESULTADO POR PRIMERA VEZ
   ========================================================= */

revealButton.addEventListener("click", async () => {
    revealButton.disabled = true;
    revealButton.textContent = "🎁 Generando...";

    try {
        const password = generatePassword();
        const passwordHash = await hashPassword(password);

        const gameReference = ref(database, "secretGame");

        const transactionResult = await runTransaction(gameReference, game => {
            if (!game) return;
            const personData = game.results[selectedPerson.id];
            if (!personData) return;
            if (personData.revealed === true) return;

            personData.revealed = true;
            personData.passwordHash = passwordHash;
            return game;
        });

        const updatedGame = transactionResult.snapshot.val();
        currentData = updatedGame.results[selectedPerson.id];

        secretName.textContent = currentData.targetCharacter;
        secretWish.textContent = currentData.targetWish;
        generatedPassword.textContent = password;

        revealResult.classList.remove("hidden");
        revealButton.classList.add("hidden");
    } catch (error) {
        console.error(error);
        showError("No fue posible generar el resultado.");
    } finally {
        revealButton.disabled = false;
    }
});

/* =========================================================
   12. COPIAR CONTRASEÑA
   ========================================================= */

copyPasswordButton.addEventListener("click