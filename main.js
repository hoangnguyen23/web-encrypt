document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        // Ẩn tất cả sections
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.add('hidden');
            sec.classList.remove('active');
        });

        // Lấy id section từ data-target
        const targetId = item.dataset.target;
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }

        // Xoá active ở tất cả menu-item
        document.querySelectorAll('.menu-item').forEach(m => {
            m.classList.remove('active-menu');
        });

        // Thêm active cho menu-item được click
        item.classList.add('active-menu');
    });
});
// ẩn header
const header = document.querySelector('.header');
const overlay = document.querySelector('.overlay');
const barsIcon = document.querySelector('.bars-icon');

// Toggle menu khi click bars
barsIcon.addEventListener('click', () => {
    const isActive = header.classList.contains('active');
    if (isActive) {
        header.classList.remove('active');
        overlay.classList.remove('active');
    } else {
        header.classList.add('active');
        overlay.classList.add('active');
    }
});

// Click overlay để đóng menu
overlay.addEventListener('click', () => {
    header.classList.remove('active');
    overlay.classList.remove('active');
});

// Xử lý khi thay đổi kích thước màn hình
window.addEventListener('resize', handleResize);
window.addEventListener('load', handleResize); // đảm bảo chạy cả khi load trang

function handleResize() {
    if (window.innerWidth > 768) {
        // Desktop → hiển thị header, tắt overlay
        header.classList.remove('active');
        overlay.classList.remove('active');
        header.style.transform = ''; // xóa inline style nếu có
    } else {
        // Mobile → ẩn header
        header.classList.remove('active');
        overlay.classList.remove('active');
        header.style.transform = ''; // reset để CSS media query tự xử lý
    }
}

// Sao chép kết quả
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        // Lấy section cha đang active
        const section = e.target.closest('.section.active');
        if (!section) return; // không có section active, thoát

        const resultField = section.querySelector('.form-output-ciphertext');

        try {
            await navigator.clipboard.writeText(resultField.value);

            // Thay đổi nội dung nút
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Đã sao chép';

            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 2000);

        } catch (err) {
            console.error('Lỗi khi sao chép: ', err);
            alert('Trình duyệt của bạn không hỗ trợ sao chép tự động.');
        }
    });
});



// Caesar
function caesarEncrypt(text, key) {
    return text.split('').map(char => {
        if (/[a-z]/.test(char)) {
            return String.fromCharCode((char.charCodeAt(0) - 97 + key) % 26 + 97);
        }
        if (/[A-Z]/.test(char)) {
            return String.fromCharCode((char.charCodeAt(0) - 65 + key) % 26 + 65);
        }
        return char; // giữ nguyên nếu không phải chữ cái
    }).join('');
}

function caesarDecrypt(text, key) {
    return caesarEncrypt(text, (26 - key % 26) % 26);
}

// Vigenere
function vigenereEncrypt(text, key) {
    key = key.toLowerCase();
    let result = '';
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const isLower = /[a-z]/.test(char);
        const isUpper = /[A-Z]/.test(char);

        if (isLower || isUpper) {
            const base = isLower ? 97 : 65;
            const keyChar = key[keyIndex % key.length];
            const keyShift = keyChar.charCodeAt(0) - 97;

            const encryptedChar = String.fromCharCode(
                (char.charCodeAt(0) - base + keyShift) % 26 + base
            );

            result += encryptedChar;
            keyIndex++;
        } else {
            result += char; // giữ nguyên ký tự không phải chữ cái
        }
    }

    return result;
}

function vigenereDecrypt(text, key) {
    key = key.toLowerCase();
    let result = '';
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const isLower = /[a-z]/.test(char);
        const isUpper = /[A-Z]/.test(char);

        if (isLower || isUpper) {
            const base = isLower ? 97 : 65;
            const keyChar = key[keyIndex % key.length];
            const keyShift = keyChar.charCodeAt(0) - 97;

            const decryptedChar = String.fromCharCode(
                (char.charCodeAt(0) - base - keyShift + 26) % 26 + base
            );

            result += decryptedChar;
            keyIndex++;
        } else {
            result += char;
        }
    }

    return result;
}
// Mã hóa - bỏ khoảng trắng, chuẩn hóa chữ hoa
function railEncrypt(plaintext, key) {
    if (!plaintext || key <= 1) return plaintext;

    // --- tiền xử lý ---
    const cleanText = plaintext.replace(/\s+/g, '').toUpperCase(); // bỏ khoảng trắng, chữ hoa

    const rails = Array.from({ length: key }, () => []);
    let row = 0, down = true;

    for (const ch of cleanText) {
        rails[row].push(ch);
        if (row === 0) down = true;
        else if (row === key - 1) down = false;
        row += down ? 1 : -1;
    }

    return rails.map(r => r.join('')).join('');
}

// Giải mã
function railDecrypt(ciphertext, key) {
    if (!ciphertext || key <= 1) return ciphertext;

    const n = ciphertext.length;
    const mark = Array.from({ length: key }, () => Array(n).fill(false));
    let row = 0, down = true;

    for (let col = 0; col < n; col++) {
        mark[row][col] = true;
        if (row === 0) down = true;
        else if (row === key - 1) down = false;
        row += down ? 1 : -1;
    }

    const grid = Array.from({ length: key }, () => Array(n).fill(null));
    let idx = 0;
    for (let r = 0; r < key; r++) {
        for (let c = 0; c < n; c++) {
            if (mark[r][c]) grid[r][c] = ciphertext[idx++];
        }
    }

    let plaintext = '';
    row = 0; down = true;
    for (let col = 0; col < n; col++) {
        plaintext += grid[row][col];
        if (row === 0) down = true;
        else if (row === key - 1) down = false;
        row += down ? 1 : -1;
    }

    return plaintext;
}
function generatePlayfairMatrix(key) {
    key = key.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    const seen = new Set();
    let matrix = [];

    // B1: thêm các chữ cái trong key
    for (let ch of key) {
        if (!seen.has(ch)) {
            matrix.push(ch);
            seen.add(ch);
        }
    }

    // B2: thêm các chữ còn lại
    for (let i = 0; i < 26; i++) {
        const ch = String.fromCharCode(65 + i);
        if (ch === 'J') continue; // bỏ J
        if (!seen.has(ch)) {
            matrix.push(ch);
            seen.add(ch);
        }
    }

    // B3: thành bảng 5x5
    const table = [];
    for (let i = 0; i < 25; i += 5) {
        table.push(matrix.slice(i, i + 5));
    }
    return table;
}

// === Helper: lấy vị trí chữ cái trong bảng ===
function findPosition(ch, table) {
    if (ch === 'J') ch = 'I';
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            if (table[row][col] === ch) return [row, col];
        }
    }
    return null;
}

// === Chia chuỗi thành cặp ===
function prepareText(text) {
    text = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += text[i];
        if (i + 1 < text.length && text[i] === text[i + 1]) {
            result += 'X'; // chèn X giữa cặp giống nhau
        }
    }
    if (result.length % 2 === 1) result += 'X'; // thêm X nếu lẻ
    return result;
}

function playEncrypt(plaintext, key) {
    const table = generatePlayfairMatrix(key);
    const text = prepareText(plaintext);
    let ciphertext = '';

    for (let i = 0; i < text.length; i += 2) {
        const a = text[i];
        const b = text[i + 1];
        const [r1, c1] = findPosition(a, table);
        const [r2, c2] = findPosition(b, table);

        if (r1 === r2) {
            // cùng hàng
            ciphertext += table[r1][(c1 + 1) % 5];
            ciphertext += table[r2][(c2 + 1) % 5];
        } else if (c1 === c2) {
            // cùng cột
            ciphertext += table[(r1 + 1) % 5][c1];
            ciphertext += table[(r2 + 1) % 5][c2];
        } else {
            // tạo hình chữ nhật
            ciphertext += table[r1][c2];
            ciphertext += table[r2][c1];
        }
    }

    return ciphertext;
}

function playDecrypt(ciphertext, key) {
    const table = generatePlayfairMatrix(key);
    ciphertext = ciphertext.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    let plaintext = '';

    for (let i = 0; i < ciphertext.length; i += 2) {
        const a = ciphertext[i];
        const b = ciphertext[i + 1];
        const [r1, c1] = findPosition(a, table);
        const [r2, c2] = findPosition(b, table);

        if (r1 === r2) {
            // cùng hàng
            plaintext += table[r1][(c1 + 4) % 5]; // dịch trái
            plaintext += table[r2][(c2 + 4) % 5];
        } else if (c1 === c2) {
            // cùng cột
            plaintext += table[(r1 + 4) % 5][c1]; // dịch lên
            plaintext += table[(r2 + 4) % 5][c2];
        } else {
            // tạo hình chữ nhật
            plaintext += table[r1][c2];
            plaintext += table[r2][c1];
        }
    }

    return plaintext;
}
// Transposition
function transEncrypt(plaintext, key) {
    const keyLength = key.length;
    const numRows = Math.ceil(plaintext.length / keyLength);
    const sortedKey = [...key].map((ch, i) => ({ ch, i }))
        .sort((a, b) => a.ch.localeCompare(b.ch));

    // tạo ma trận theo hàng
    const matrix = [];
    for (let i = 0; i < numRows; i++) {
        const start = i * keyLength;
        matrix.push(plaintext.slice(start, start + keyLength).padEnd(keyLength, 'X'));
    }

    // đọc theo cột theo thứ tự key
    let ciphertext = '';
    for (let { i } of sortedKey) {
        for (let row of matrix) ciphertext += row[i];
    }
    return ciphertext;
}

function transDecrypt(ciphertext, key) {
    const keyLength = key.length;
    const numRows = Math.ceil(ciphertext.length / keyLength);
    const sortedKey = [...key].map((ch, i) => ({ ch, i }))
        .sort((a, b) => a.ch.localeCompare(b.ch));

    const cols = Array(keyLength).fill('');
    let index = 0;

    // chia cipher theo cột
    for (let { i } of sortedKey) {
        cols[i] = ciphertext.slice(index, index + numRows);
        index += numRows;
    }

    // đọc theo hàng
    let plaintext = '';
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < keyLength; c++) {
            plaintext += cols[c][r] || '';
        }
    }

    return plaintext.replace(/X+$/g, '');
}

function autoEncrypt(plaintext, key) {
    plaintext = plaintext.toUpperCase().replace(/[^A-Z]/g, '');
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    let fullKey = (key + plaintext).slice(0, plaintext.length);
    let ciphertext = '';

    for (let i = 0; i < plaintext.length; i++) {
        const p = plaintext.charCodeAt(i) - 65;
        const k = fullKey.charCodeAt(i) - 65;
        const c = (p + k) % 26;
        ciphertext += String.fromCharCode(c + 65);
    }
    return ciphertext;
}

function autoDecrypt(ciphertext, key) {
    ciphertext = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    let plaintext = '';

    for (let i = 0; i < ciphertext.length; i++) {
        const c = ciphertext.charCodeAt(i) - 65;
        const k = (i < key.length)
            ? key.charCodeAt(i) - 65
            : plaintext.charCodeAt(i - key.length) - 65;
        const p = (c - k + 26) % 26;
        plaintext += String.fromCharCode(p + 65);
    }
    return plaintext;
}

// ======================= DES =======================

function desEncrypt(plaintext, key) {
    const encrypted = CryptoJS.DES.encrypt(plaintext, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

function desDecrypt(ciphertext, key) {
    const decrypted = CryptoJS.DES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

// ======================= 3DES =======================

function tripleDesEncrypt(plaintext, key) {
    const encrypted = CryptoJS.TripleDES.encrypt(plaintext, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

function tripleDesDecrypt(ciphertext, key) {
    const decrypted = CryptoJS.TripleDES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

// ======================= AES =======================

function aesEncrypt(plaintext, key) {
    const encrypted = CryptoJS.AES.encrypt(plaintext, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

function aesDecrypt(ciphertext, key) {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}


function isNumeric(str) {
    str = str.trim();
    if (str === "") return false;

    let num = parseFloat(str);
    return !isNaN(num) && num.toString() === str;
}
function validateKey(algo, keyStr) {
    const len = keyStr.length; // số byte
    switch (algo) {
        case "des":
            return len === 8;
        case "3des":
            return len === 16 || len === 24;
        case "aes":
            return len === 16 || len === 24 || len === 32;
        default:
            return false;
    }
}

function handleCrypto(action) { // action = "encrypt" hoặc "decrypt"
    const activeSection = document.querySelector("section.section.active");
    const algorithm = activeSection.id;
    const text = activeSection.querySelector(".form-input-plaintext").value.trim();
    const key = activeSection.querySelector(".form-input-key").value.trim();

    if (!text || !key) {
        alert("Vui lòng nhập dữ liệu và khóa!");
        return;
    }

    let result = "";

    switch (algorithm) {
        case "caesar":
            if (!isNumeric(key)) {
                alert('Vui lòng nhập khoá là số');
                return;
            }
            result = action === "encrypt"
                ? caesarEncrypt(text, parseInt(key, 10))
                : caesarDecrypt(text, parseInt(key, 10));
            break;
        case "vigenere":
            result = action === "encrypt"
                ? vigenereEncrypt(text, key)
                : vigenereDecrypt(text, key);
            break;
        case "railfence":
            if (!isNumeric(key)) {
                alert('Vui lòng nhập khoá là số');
                return;
            }
            result = action === "encrypt"
                ? railEncrypt(text, key)
                : railDecrypt(text, key);
            break;
        case "playfair":
            result = action === "encrypt"
                ? playEncrypt(text, key)
                : playDecrypt(text, key);
            break;
        case "transposition":
            result = action === "encrypt"
                ? transEncrypt(text, key)
                : transDecrypt(text, key);
            break;
        case "autokey":
            result = action === "encrypt"
                ? autoEncrypt(text, key)
                : autoDecrypt(text, key);
            break;
        case "des":
            if (!validateKey(algorithm, key)) {
                alert('Vui lòng nhập độ dài khoá 8 ký tự');
                return;
            }
            result = action === "encrypt"
                ? desEncrypt(text, key)
                : desDecrypt(text, key);
            break;
        case "3des":
            if (!validateKey(algorithm, key)) {
                alert('Vui lòng nhập độ dài khoá 16 hoặc 24 ký tự');
                return;
            }
            result = action === "encrypt"
                ? tripleDesEncrypt(text, key)
                : tripleDesDecrypt(text, key);
            break;

        case "aes":
            if (!validateKey(algorithm, key)) {
                alert('Vui lòng nhập độ dài khoá 16, 24 hoặc 32 ký tự');
                return;
            }
            result = action === "encrypt"
                ? aesEncrypt(text, key)
                : aesDecrypt(text, key);
            break;
        default:
            return;
    }

    console.log(`${action === "encrypt" ? "Ciphertext" : "Plaintext"}:`, result);

    // Nếu là mã hoá / giải mã thì gửi lên server
    if (action === "encrypt" || action === "decrypt") {
        fetch("https://web-encrypt-backend.onrender.com/save-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ciphertext: result,
                algorithm
            })
        })
            .then(res => res.json())
            .then(data => console.log("Server:", data))
            .catch(err => console.error(err));
    }
    activeSection.querySelector(".form-output-ciphertext").value = result;
}

// --- 2. Gắn event cho cả 2 nút --- //
document.querySelectorAll(".encrypt-btn").forEach(btn =>
    btn.addEventListener("click", () => {
        handleCrypto("encrypt");
    })
);
document.querySelectorAll(".decrypt-btn").forEach(btn =>
    btn.addEventListener("click", () => {
        handleCrypto("decrypt");
    })
);
