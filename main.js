
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        // Ẩn tất cả sections
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.add('hidden');
            sec.classList.remove('active');
        });

        // Xác định section cần hiển thị
        const sectionId = item.textContent.trim().toLowerCase();
        const target = document.getElementById(sectionId);
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

function isNumeric(str) {
    str = str.trim();
    if (str === "") return false;

    let num = parseFloat(str);
    return !isNaN(num) && num.toString() === str;
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
                alert('Khoá phải là số');
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
            result = action === "encrypt"
                ? railEncrypt(text, key)
                : railDecrypt(text, key);
            break;
        default:
            alert("Thuật toán không được hỗ trợ!");
            return;
    }

    console.log(`${action === "encrypt" ? "Ciphertext" : "Plaintext"}:`, result);

    // Nếu là mã hoá thì gửi lên server
    if (action === "encrypt" || action === "decrypt") {
        fetch("http://localhost:3000/save-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                plaintext: text,
                ciphertext: result,
                key,
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
    btn.addEventListener("click", (e) => {
        // e.preventDefault(); // Ngăn reload
        handleCrypto("encrypt");
    })
);
document.querySelectorAll(".decrypt-btn").forEach(btn =>
    btn.addEventListener("click", (e) => {
        // e.preventDefault(); // Ngăn reload
        handleCrypto("decrypt");
    })
);
