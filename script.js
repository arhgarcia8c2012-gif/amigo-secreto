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


/*
    ========================================================
    IMPORTANTE

    REEMPLAZA ESTOS DATOS POR LOS DE TU PROYECTO FIREBASE.

    Los encontrarás cuando registres tu aplicación web.
    ========================================================
*/

const firebaseConfig = {
    apiKey: "AIzaSyC5_bGgGEOQSsKudu2LpbKmKLSil7oVOYA",
    authDomain: "amigo-secreto-2026-bdb.firebaseapp.com",
    projectId: "amigo-secreto-2026-bdb",
    storageBucket: "amigo-secreto-2026-bdb.firebasestorage.app",
    messagingSenderId: "996033956741",
    appId: "1:996033956741:web:5a90633f84bc421fb452ec",
    measurementId: "G-5N1V15VZYH"
  };


/* Inicializar Firebase */

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);


/* =========================================================
   2. CONFIGURACIÓN DEL SORTEO
   =========================================================

   AQUÍ COLOCAS LAS 7 PERSONAS.

   IMPORTANTE:

   Cada "id" debe ser diferente.

   El campo "character" es el personaje que ESA PERSONA
   tendrá disponible para ser asignado.

   El campo "wish" es lo que ESA PERSONA quiere recibir.

   El programa se encargará de que no se repitan.

   =========================================================
*/

const participants = [

    {
        id: "persona1",
        name: "Groot",
        character: "Groot",
        wish: "Audífonos de cable entrada tipo C, Crema mantequilla Trendy, Rubor en crema lotso Trendy, iluminador Toy story Trendy, loción hidratante milagros o termo de miniso de agua o bebida caliente"
    },

    {
        id: "persona2",
        name: "Jengi",
        character: "Jengi",
        wish: "Colores alusivos blanco, negro, lila o celeste, querido amigo secreto puedes sorprende con, una penca de sábila para el cabello, una loción agú tapa verde, reloj, cualquier cosa alusiva a Sullivan de monster inc, una riñonera o canguro, un termoprotector para el cabello, una maléfica para cargar el Pc y el almuercito, una cartera de presupuestos o por último una medias de compresión pero bien lindas estampadas no esas de abuelita por favor, ya te di muchas opciones 🥷🏼."
    },

    {
        id: "persona3",
        name: "Sherk",
        character: "Sherk",
        wish: "1. Cachitos para el casco de la moto  2. Morral pequeño con diseño cute 3. Cera de tamaño pequeño líquida 4. Crema o mantequilla corporal con brillitos 5. Perfume sweet black exclusive "
    },

    {
        id: "persona4",
        name: "Agüebardo",
        character: "Agüebardo",
        wish: "Tratamiento de milagros blanco y perfume para cabello café , y skin para la cara  más importante que el maquillaje lol,bolso de hombro pequeño negro  o blanco,  short y top deportivo  maquillaje  "
    },

    {
        id: "persona5",
        name: "don ramon",
        character: "don ramon",
        wish: "espejo de maquillaje con luz led, mouse inalambrico para la oficina, una lamparita decorativa de muñequitos, soporte de gafas decorativo par la oficina."
    },

    {
        id: "persona6",
        name: "Dora la exploradora",
        character: "Dora la exploradora",
        wish: "Un reloj colocar gris o blanco, un termo protector para el cabello una sombrilla de mano"
    },

    {
        id: "persona7",
        name: "Gollum",
        character: "Gollum",
        wish: "Pantuflas tipo babucha talla 39, bolso de mano, reloj, kit de skinker para el rostro "
    }

];

const predefinedPasswords = {
  persona1: "Groot1",
  persona2: "Jengi2",
  persona3: "Sherk3",
  persona4: "Aguebardo4",
  persona5: "Ramon5",
  persona6: "Dora6",
  persona7: "Gollum7"
};


/* =========================================================
   3. ELEMENTOS HTML
   ========================================================= */

const personSelect =
    document.getElementById("personSelect");

const continueButton =
    document.getElementById("continueButton");

const loginSection =
    document.getElementById("loginSection");

const firstTimeSection =
    document.getElementById("firstTimeSection");

const passwordSection =
    document.getElementById("passwordSection");

const resultSection =
    document.getElementById("resultSection");

const revealButton =
    document.getElementById("revealButton");

const revealResult =
    document.getElementById("revealResult");

const secretName =
    document.getElementById("secretName");

const secretWish =
    document.getElementById("secretWish");

const generatedPassword =
    document.getElementById("generatedPassword");

const passwordInput =
    document.getElementById("passwordInput");

const passwordButton =
    document.getElementById("passwordButton");

const passwordError =
    document.getElementById("passwordError");

const finalSecretName =
    document.getElementById("finalSecretName");

const finalSecretWish =
    document.getElementById("finalSecretWish");

const copyPasswordButton =
    document.getElementById("copyPasswordButton");

const finishButton =
    document.getElementById("finishButton");

const logoutButton =
    document.getElementById("logoutButton");

const errorMessage =
    document.getElementById("errorMessage");


/* =========================================================
   4. VARIABLES
   ========================================================= */

let selectedPerson = null;

let currentData = null;


/* =========================================================
   5. CARGAR PERSONAS
   ========================================================= */

function loadParticipants() {

    personSelect.innerHTML = `
        <option value="">
            Selecciona tu nombre...
        </option>
    `;

    participants.forEach(person => {

        const option =
            document.createElement("option");

        option.value = person.id;

        option.textContent = person.name;

        personSelect.appendChild(option);

    });

}


/* =========================================================
   6. GENERAR CONTRASEÑA
   ========================================================= */

function generatePassword() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let password = "";

    for (let i = 0; i < 8; i++) {

        const random =
            Math.floor(
                Math.random() * characters.length
            );

        password += characters[random];

    }

    return password;

}


/* =========================================================
   7. HASH DE CONTRASEÑA
   =========================================================

   No guardamos la contraseña directamente.

   Guardamos un hash.

   =========================================================
*/

async function hashPassword(password) {

    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(password);

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    const hashArray =
        Array.from(
            new Uint8Array(hashBuffer)
        );

    return hashArray
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");

}


/* =========================================================
   8. BUSCAR DATOS DEL SORTEO
   ========================================================= */

async function getGameData() {

    const gameReference =
        ref(database, "secretGame");

    const snapshot =
        await get(gameReference);

    if (!snapshot.exists()) {

        return null;

    }

    return snapshot.val();

}


/* =========================================================
   9. CREAR EL SORTEO
   =========================================================

   El primer participante que entre genera el sorteo.
   Después todos utilizan el mismo resultado.
   =========================================================
*/

async function createGameIfNeeded() {

    const existingGame = await getGameData();

    if (existingGame) {
        return existingGame;
    }

    // Crear lista de personajes
    const characters = participants.map(person => person.character);

    // Verificar que no existan personajes repetidos
    const uniqueCharacters = new Set(characters);
    if (uniqueCharacters.size !== participants.length) {
        throw new Error("Hay personajes repetidos. Cada personaje debe ser diferente.");
    }

    // Hacer una copia para mezclar
    const shuffled = [...participants];

    // Mezclar personajes (Fisher-Yates)
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Evitar que una persona se tenga a sí misma
    let valid = false;
    let attempts = 0;
    while (!valid && attempts < 1000) {
        valid = true;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].id === shuffled[i].id) {
                valid = false;
                break;
            }
        }
        if (!valid) {
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
        }
        attempts++;
    }

    if (!valid) {
        throw new Error("No fue posible generar un sorteo válido.");
    }

    // Crear resultados
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

    const newGame = {
        createdAt: Date.now(),
        results
    };

    // Guardar solamente si todavía no existe
    const gameReference = ref(database, "secretGame");

    console.log("Iniciando transacción en Firebase...");

    await runTransaction(gameReference, current => {
        if (current !== null) {
            return;
        }
        console.log("Creando nuevo sorteo...");
        return newGame;
    });

    // 🔄 Leer el nodo actualizado después de la transacción
    const updatedSnapshot = await get(gameReference);
    const updatedGame = updatedSnapshot.val();

    if (!updatedGame || !updatedGame.results) {
        console.error("⚠️ El sorteo no se cargó correctamente:", updatedGame);
        throw new Error("No se pudo cargar el sorteo desde Firebase.");
    }

    console.log("✅ Sorteo cargado correctamente:", updatedGame);
    return updatedGame;
}


/* =========================================================
   10. SELECCIONAR PERSONA
   ========================================================= */

continueButton.addEventListener(
    "click",
    async () => {

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

            // 🧩 Verificación para evitar error de lectura nula o vacía
            if (!game || !game.results || Object.keys(game.results).length === 0) {
                showError("No se pudo cargar el sorteo. Intenta nuevamente.");
                continueButton.disabled = false;
                continueButton.textContent = "🎁 Continuar";
                return;
            }

            selectedPerson = participants.find(
                person => person.id === selectedId
            );

            currentData = game.results[selectedId];

            if (!currentData) {
                throw new Error("No se encontró la información de esta persona.");
            }

            loginSection.classList.add("hidden");

            /*
                Si todavía no ha revelado su resultado,
                mostramos el botón de primera consulta.
            */
            if (!currentData.revealed) {
                firstTimeSection.classList.remove("hidden");
            } else {
                /*
                    Si ya lo había visto,
                    pedimos contraseña.
                */
                passwordSection.classList.remove("hidden");
            }

        } catch (error) {
            console.error(error);
            showError(error.message || "Ocurrió un error.");
        } finally {
            continueButton.disabled = false;
            continueButton.textContent = "🎁 Continuar";
        }
    }
);

/* =========================================================
   11. REVELAR RESULTADO
   ========================================================= */

revealButton.addEventListener("click", async () => {
    errorMessage.classList.add("hidden");
    revealButton.disabled = true;
    revealButton.textContent = "Generando...";

    try {
        const gameReference = ref(database, "secretGame");

        // 🧩 Usar las contraseñas predeterminadas globales
        const password = predefinedPasswords[selectedPerson.id];

        // 🧩 Generar hash SHA-256 antes de la transacción
        const passwordHash = await hashPassword(password);
        console.log("Hash generado:", passwordHash);

        const transactionResult = await runTransaction(gameReference, currentData => {
            if (!currentData || !currentData.results) return currentData;

            const personData = currentData.results[selectedPerson.id];
            if (!personData) return currentData;

            // 🧩 Solo si aún no ha sido revelado
            if (!personData.revealed) {
                personData.revealed = true;
                personData.passwordHash = passwordHash;
                currentData.results[selectedPerson.id] = personData;
            }

            return { ...currentData };
        });

        console.log("Resultado actualizado:", transactionResult.snapshot.val());

        const updatedData = transactionResult.snapshot.val().results[selectedPerson.id];

        // 🧩 Mostrar contraseña SOLO la primera vez
        if (!currentData.revealed) {
            generatedPassword.textContent = password;
            secretName.textContent = updatedData.targetCharacter;
            secretWish.textContent = updatedData.targetWish;

            firstTimeSection.classList.remove("hidden");
            resultSection.classList.add("hidden");
        } else {
            // Si ya estaba revelado, no mostrar contraseña
            resultText.textContent = `🎁 Te tocó: ${updatedData.targetCharacter} (${updatedData.targetWish})`;
            firstTimeSection.classList.add("hidden");
            resultSection.classList.remove("hidden");
        }

    } catch (error) {
        console.error(error);
        showError(error.message || "Ocurrió un error al revelar el resultado.");
    } finally {
        revealButton.disabled = false;
        revealButton.textContent = "🎁 Generar";
    }
});

/* =========================================================
   12. COPIAR CONTRASEÑA
   ========================================================= */

copyPasswordButton.addEventListener(
    "click",
    async () => {

        const password =
            generatedPassword.textContent;

        try {

            await navigator.clipboard.writeText(
                password
            );

            copyPasswordButton.textContent =
                "✅ Contraseña copiada";

            setTimeout(() => {

                copyPasswordButton.textContent =
                    "📋 Copiar contraseña";

            }, 2000);

        } catch {

            alert(
                "No fue posible copiar automáticamente. Guarda la contraseña manualmente."
            );

        }

    }
);


/* =========================================================
   13. FINALIZAR PRIMERA CONSULTA
   ========================================================= */

finishButton.addEventListener(
    "click",
    () => {

        firstTimeSection.classList.add("hidden");

        loginSection.classList.remove("hidden");

        personSelect.value = "";

        selectedPerson = null;

        currentData = null;

    }
);


/* =========================================================
   14. COMPROBAR CONTRASEÑA
   ========================================================= */

passwordButton.addEventListener(
    "click",
    async () => {

        passwordError.classList.add("hidden");


        const password =
            passwordInput.value.trim();


        if (!password) {

            passwordError.textContent =
                "Escribe tu contraseña.";

            passwordError.classList.remove(
                "hidden"
            );

            return;

        }


        try {

            const hash =
                await hashPassword(password);


            if (
                hash !== currentData.passwordHash
            ) {

                passwordError.textContent =
                    "❌ Contraseña incorrecta.";

                passwordError.classList.remove(
                    "hidden"
                );

                passwordInput.value = "";

                return;

            }


            /*
                Contraseña correcta.
            */

            finalSecretName.textContent =
                currentData.targetCharacter;

            finalSecretWish.textContent =
                currentData.targetWish;


            passwordSection.classList.add(
                "hidden"
            );

            resultSection.classList.remove(
                "hidden"
            );


            passwordInput.value = "";


        } catch (error) {

            console.error(error);

            passwordError.textContent =
                "Ocurrió un error al comprobar la contraseña.";

            passwordError.classList.remove(
                "hidden"
            );

        }

    }
);


/* =========================================================
   15. SALIR
   ========================================================= */

logoutButton.addEventListener(
    "click",
    () => {

        resultSection.classList.add("hidden");

        loginSection.classList.remove("hidden");

        personSelect.value = "";

        selectedPerson = null;

        currentData = null;

    }
);


/* =========================================================
   16. MOSTRAR ERROR
   ========================================================= */

function showError(message) {

    errorMessage.textContent =
        "⚠️ " + message;

    errorMessage.classList.remove(
        "hidden"
    );

}


/* =========================================================
   17. INICIAR
   ========================================================= */

loadParticipants();


