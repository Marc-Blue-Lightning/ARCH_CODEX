// --- ANIMATION D'INTRO ---
window.addEventListener('load', () => {
    const loadingText = document.getElementById('loading-text');
    const texts = ["Accès serveur...", "Bypass Pare-feu...", "Décryptage noyau...", "BIENVENUE."];
    let i = 0;

    const interval = setInterval(() => {
        loadingText.innerText = texts[i];
        i++;
        if (i >= texts.length) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('intro-screen').classList.add('hidden');
                document.getElementById('main-content').classList.remove('hidden');
            }, 1000);
        }
    }, 800);
});

// --- CORE CRYPTO ENGINE ---

function execute(isCipher) {
    const msg = document.getElementById('message').value.toUpperCase();
    const key = document.getElementById('key').value.toUpperCase();
    const algo = document.getElementById('algo-select').value;
    let out = "";

    try {
        switch(algo) {
            case "cesar": out = algoCesar(msg, parseInt(key), isCipher); break;
            case "vigenere": out = algoVigenere(msg, key, isCipher); break;
            case "affine": out = algoAffine(msg, key, isCipher); break;
            case "autokey": out = algoAutoKey(msg, key, isCipher); break;
            case "playfair": out = algoPlayfair(msg, key, isCipher); break;
        }
        document.getElementById('result').innerText = out;
    } catch(e) {
        document.getElementById('result').innerText = "ERREUR: Paramètres invalides.";
    }
}

// 1. CESAR
function algoCesar(t, k, cipher) {
    if (!cipher) k = 26 - (k % 26);
    return t.replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - 65 + k) % 26 + 65));
}

// 2. VIGENERE
function algoVigenere(t, k, cipher) {
    t = t.replace(/[^A-Z]/g, '');
    k = k.replace(/[^A-Z]/g, '');
    return t.split('').map((c, i) => {
        let shift = k.charCodeAt(i % k.length) - 65;
        if (!cipher) shift = 26 - shift;
        return String.fromCharCode((c.charCodeAt(0) - 65 + shift) % 26 + 65);
    }).join('');
}

// 3. AFFINE (Format clé: "a,b")
function algoAffine(t, k, cipher) {
    let [a, b] = k.split(',').map(Number);
    const modInverse = (a) => {
        for (let x = 1; x < 26; x++) if ((a * x) % 26 == 1) return x;
        return 1;
    };
    return t.replace(/[A-Z]/g, c => {
        let x = c.charCodeAt(0) - 65;
        if (cipher) return String.fromCharCode(((a * x + b) % 26) + 65);
        else return String.fromCharCode((modInverse(a) * (x - b + 26) % 26) + 65);
    });
}

// 4. AUTOKEY
function algoAutoKey(t, k, cipher) {
    t = t.replace(/[^A-Z]/g, '');
    let res = "";
    if (cipher) {
        let fullKey = (k + t).substring(0, t.length);
        for (let i = 0; i < t.length; i++) {
            res += String.fromCharCode(((t.charCodeAt(i) - 65 + (fullKey.charCodeAt(i) - 65)) % 26) + 65);
        }
    } else {
        let currentKey = k;
        for (let i = 0; i < t.length; i++) {
            let p = (t.charCodeAt(i) - 65 - (currentKey.charCodeAt(i) - 65) + 26) % 26;
            let charP = String.fromCharCode(p + 65);
            res += charP;
            currentKey += charP;
        }
    }
    return res;
}

// 5. PLAYFAIR (Simplifié: I=J)
function algoPlayfair(t, k, cipher) {
    t = t.replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    k = [...new Set((k + "ABCDEFGHIKLMNOPQRSTUVWXYZ").replace(/J/g, 'I').replace(/[^A-Z]/g, ''))];
    let matrix = [];
    while(k.length) matrix.push(k.splice(0, 5));

    const find = (c) => {
        for(let r=0; r<5; r++) {
            let col = matrix[r].indexOf(c);
            if(col !== -1) return [r, col];
        }
    };

    if (t.length % 2 !== 0) t += "X";
    let res = "";
    for(let i=0; i<t.length; i+=2) {
        let [r1, c1] = find(t[i]), [r2, c2] = find(t[i+1]);
        if(r1 === r2) {
            c1 = (c1 + (cipher ? 1 : 4)) % 5;
            c2 = (c2 + (cipher ? 1 : 4)) % 5;
        } else if(c1 === c2) {
            r1 = (r1 + (cipher ? 1 : 4)) % 5;
            r2 = (r2 + (cipher ? 1 : 4)) % 5;
        } else {
            [c1, c2] = [c2, c1];
        }
        res += matrix[r1][c1] + matrix[r2][c2];
    }
    return res;
}
