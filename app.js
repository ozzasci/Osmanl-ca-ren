let kelimeler = [];
let suankiKelimeIndex = 0;

// Elementler
const osmanlicaKelimeEl = document.getElementById('osmanlicaKelime');
const transliterationEl = document.getElementById('transliteration');
const meaningEl = document.getElementById('meaning');
const kelimeDegistirBtn = document.getElementById('kelimeDegistir');
const jsonFileInput = document.getElementById('jsonFileInput');
const yukleButton = document.getElementById('yukleButton');
const kelimeSayaciEl = document.getElementById('kelimeSayaci');

// Kelime göster
function kelimeGoster() {
    if (kelimeler.length === 0) {
        osmanlicaKelimeEl.textContent = "Kelime yok";
        transliterationEl.textContent = "";
        meaningEl.textContent = "";
        return;
    }
    
    const kelime = kelimeler[suankiKelimeIndex];
    osmanlicaKelimeEl.textContent = kelime.word;
    transliterationEl.textContent = kelime.transliteration;
    meaningEl.textContent = kelime.meaning;
}

// Kelime sayacını güncelle
function guncelleKelimeSayaci() {
    kelimeSayaciEl.innerHTML = `📊 Yüklenen kelime: <strong>${kelimeler.length}</strong>`;
}

// Sonraki kelime
kelimeDegistirBtn.addEventListener('click', () => {
    if (kelimeler.length === 0) return;
    suankiKelimeIndex = (suankiKelimeIndex + 1) % kelimeler.length;
    kelimeGoster();
});

// JSON dosyasını yükle
yukleButton.addEventListener('click', () => {
    const file = jsonFileInput.files[0];
    if (!file) {
        alert('Lütfen bir JSON dosyası seçin!');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            kelimeler = JSON.parse(e.target.result);
            suankiKelimeIndex = 0;
            localStorage.setItem('osmanlicaKelimeler', JSON.stringify(kelimeler));
            kelimeGoster();
            guncelleKelimeSayaci();
            alert(`${kelimeler.length} kelime başarıyla yüklendi!`);
        } catch (error) {
            alert('Geçersiz JSON formatı!');
            console.error(error);
        }
    };
    reader.readAsText(file);
});

// Sayfa yüklendiğinde localStorage'den kelimeleri çek
window.addEventListener('load', () => {
    const savedKelimeler = localStorage.getItem('osmanlicaKelimeler');
    if (savedKelimeler) {
        kelimeler = JSON.parse(savedKelimeler);
        kelimeGoster();
        guncelleKelimeSayaci();
    } else {
        kelimeGoster(); // Boş durum için
    }
});