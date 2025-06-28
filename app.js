document.addEventListener('DOMContentLoaded', function() {
    // Element tanımları
    const elements = {
        osmanlicaKelime: document.getElementById('osmanlicaKelime'),
        transliteration: document.getElementById('transliteration'),
        meaning: document.getElementById('meaning'),
        kelimeSayaci: document.getElementById('kelimeSayaci'),
        oncekiKelimeBtn: document.getElementById('oncekiKelimeBtn'),
        sonrakiKelimeBtn: document.getElementById('sonrakiKelimeBtn'),
        rastgeleKelimeBtn: document.getElementById('rastgeleKelimeBtn'),
        bilmiyorumBtn: document.getElementById('bilmiyorumBtn'),
        biliyorumBtn: document.getElementById('biliyorumBtn'),
        listeButonlari: document.getElementById('listeButonlari'),
        yeniListeEkleBtn: document.getElementById('yeniListeEkleBtn'),
        listeyiSilBtn: document.getElementById('listeyiSilBtn'),
        jsonFileInput: document.getElementById('jsonFileInput'),
        mevcutListeyeEkleBtn: document.getElementById('mevcutListeyeEkleBtn'),
        yeniListeOlusturBtn: document.getElementById('yeniListeOlusturBtn')
    };

    // Tüm elementlerin varlığını kontrol et
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element bulunamadı: ${key}`);
            return;
        }
    }

    let kelimeListeleri = {};
    let aktifListeAdi = null;
    let suankiKelimeIndex = 0;
    let filtrelenmisKelimeler = [];

    // Kelime göster
    function kelimeGoster() {
        const kelimeler = aktifKelimeler();
        if (kelimeler.length === 0) {
            elements.osmanlicaKelime.textContent = "Kelime yok";
            elements.transliteration.textContent = "";
            elements.meaning.textContent = aktifListeAdi ? "Liste boş" : "Lütfen JSON yükleyin";
            return;
        }
        
        const kelime = kelimeler[suankiKelimeIndex];
        
        elements.osmanlicaKelime.style.opacity = 0;
        elements.transliteration.style.opacity = 0;
        elements.meaning.style.opacity = 0;
        
        setTimeout(() => {
            elements.osmanlicaKelime.textContent = kelime.word || "---";
            elements.transliteration.textContent = kelime.transliteration || "---";
            elements.meaning.textContent = kelime.meaning || "---";
            
            elements.osmanlicaKelime.style.opacity = 1;
            elements.transliteration.style.opacity = 1;
            elements.meaning.style.opacity = 1;
        }, 200);
    }

    // Aktif kelime listesini döndür
    function aktifKelimeler() {
        return filtrelenmisKelimeler.length > 0 ? filtrelenmisKelimeler : 
               (aktifListeAdi && kelimeListeleri[aktifListeAdi]) ? kelimeListeleri[aktifListeAdi] : [];
    }

    // Kelime sayacını güncelle
    function guncelleKelimeSayaci() {
        const kelimeler = aktifKelimeler();
        elements.kelimeSayaci.innerHTML = `<i class="bi bi-bar-chart"></i> Kelime sayısı: <strong>${kelimeler.length}</strong>`;
    }

    // Listeleri yükle
    function listeleriYukle() {
        const kayitliListeler = localStorage.getItem('osmanlicaKelimeListeleri');
        if (kayitliListeler) {
            try {
                kelimeListeleri = JSON.parse(kayitliListeler);
                listeButonlariniGuncelle();
                
                const kayitliAktifListe = localStorage.getItem('aktifOsmanlicaListe');
                if (kayitliAktifListe && kelimeListeleri[kayitliAktifListe]) {
                    aktifListeDegistir(kayitliAktifListe);
                } else if (Object.keys(kelimeListeleri).length > 0) {
                    aktifListeDegistir(Object.keys(kelimeListeleri)[0]);
                }
            } catch (error) {
                console.error("LocalStorage veri okuma hatası:", error);
                localStorage.removeItem('osmanlicaKelimeListeleri');
                localStorage.removeItem('aktifOsmanlicaListe');
            }
        }
    }

    // Listeleri kaydet
    function listeleriKaydet() {
        try {
            localStorage.setItem('osmanlicaKelimeListeleri', JSON.stringify(kelimeListeleri));
            if (aktifListeAdi) {
                localStorage.setItem('aktifOsmanlicaListe', aktifListeAdi);
            }
        } catch (error) {
            console.error("LocalStorage yazma hatası:", error);
            alert("Listeler kaydedilirken hata oluştu!");
        }
    }

    // Liste butonlarını güncelle
    function listeButonlariniGuncelle() {
        elements.listeButonlari.innerHTML = '';
        Object.keys(kelimeListeleri).forEach(listeAdi => {
            const btn = document.createElement('button');
            btn.className = `btn btn-sm liste-buton ${listeAdi === aktifListeAdi ? 'aktif-liste' : 'btn-outline-secondary'}`;
            btn.innerHTML = `<i class="bi ${listeAdi === aktifListeAdi ? 'bi-check-circle-fill' : 'bi-list-ul'}"></i> ${listeAdi}`;
            btn.onclick = () => aktifListeDegistir(listeAdi);
            btn.setAttribute('data-bs-toggle', 'tooltip');
            btn.setAttribute('title', `${listeAdi} listesini aç (${kelimeListeleri[listeAdi].length} kelime)`);
            new bootstrap.Tooltip(btn);
            elements.listeButonlari.appendChild(btn);
        });
        guncelleKelimeSayaci();
    }

    // Aktif listeyi değiştir
    function aktifListeDegistir(listeAdi) {
        aktifListeAdi = listeAdi;
        suankiKelimeIndex = 0;
        filtrelenmisKelimeler = [];
        listeButonlariniGuncelle();
        kelimeGoster();
        listeleriKaydet();
    }

    // Yeni liste ekle
    function yeniListeEkle() {
        const listeAdi = prompt("Yeni liste adı girin:");
        if (!listeAdi) return;
        
        if (kelimeListeleri[listeAdi]) {
            alert("Bu isimde bir liste zaten var!");
            return;
        }
        
        kelimeListeleri[listeAdi] = [];
        aktifListeDegistir(listeAdi);
    }

    // Aktif listeyi sil
    function aktifListeyiSil() {
        if (!aktifListeAdi) return;
        
        if (confirm(`"${aktifListeAdi}" listesini silmek istediğinize emin misiniz?`)) {
            delete kelimeListeleri[aktifListeAdi];
            aktifListeAdi = Object.keys(kelimeListeleri)[0] || null;
            listeleriKaydet();
            listeButonlariniGuncelle();
            kelimeGoster();
        }
    }

    // JSON dosyasını işle
    function jsonDosyasiniIsle(file, mevcutListeyeEkle) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const yeniKelimeler = JSON.parse(e.target.result);
                
                if (!Array.isArray(yeniKelimeler)) {
                    throw new Error("Geçersiz format: JSON bir dizi olmalı");
                }
                
                // Kelime nesnelerini kontrol et
                const gecerliKelimeler = yeniKelimeler.filter(kelime => 
                    kelime && typeof kelime === 'object' && 
                    'word' in kelime && 'meaning' in kelime
                );
                
                if (gecerliKelimeler.length === 0) {
                    throw new Error("JSON dosyasında uygun kelime bulunamadı");
                }
                
                if (gecerliKelimeler.length !== yeniKelimeler.length) {
                    console.warn(`${yeniKelimeler.length - gecerliKelimeler.length} geçersiz kelime çıkarıldı`);
                }
                
                if (!aktifListeAdi || !mevcutListeyeEkle) {
                    const listeAdi = file.name.replace('.json', '') || 'Yeni Liste';
                    aktifListeAdi = listeAdi;
                    kelimeListeleri[listeAdi] = gecerliKelimeler;
                } else {
                    kelimeListeleri[aktifListeAdi] = [
                        ...(kelimeListeleri[aktifListeAdi] || []),
                        ...gecerliKelimeler
                    ];
                }
                
                aktifListeDegistir(aktifListeAdi);
                alert(`${gecerliKelimeler.length} kelime başarıyla yüklendi! Toplam: ${kelimeListeleri[aktifListeAdi].length}`);
                
            } catch (error) {
                console.error("JSON işleme hatası:", error);
                alert(`Hata: ${error.message}\n\nLütfen geçerli bir JSON dosyası yükleyin. Örnek format:\n\n[{\n  "word": "سلام",\n  "transliteration": "selam",\n  "meaning": "selam, esenlik"\n}]`);
            }
        };
        
        reader.onerror = () => {
            alert("Dosya okunurken hata oluştu!");
        };
        
        reader.readAsText(file);
    }

    // Rastgele kelime göster
    function rastgeleKelimeGoster() {
        const kelimeler = aktifKelimeler();
        if (kelimeler.length === 0) return;
        
        let yeniIndex;
        do {
            yeniIndex = Math.floor(Math.random() * kelimeler.length);
        } while (kelimeler.length > 1 && yeniIndex === suankiKelimeIndex);
        
        suankiKelimeIndex = yeniIndex;
        kelimeGoster();
    }

    // Tema değiştirme
    function temaDegistir(theme) {
        document.body.className = `${theme}-theme`;
        localStorage.setItem('osmanlicaTheme', theme);
    }

    // Event listener'ları başlat
    function initEventListeners() {
        elements.oncekiKelimeBtn.addEventListener('click', () => {
            const kelimeler = aktifKelimeler();
            if (kelimeler.length === 0) return;
            suankiKelimeIndex = (suankiKelimeIndex - 1 + kelimeler.length) % kelimeler.length;
            kelimeGoster();
        });

        elements.sonrakiKelimeBtn.addEventListener('click', () => {
            const kelimeler = aktifKelimeler();
            if (kelimeler.length === 0) return;
            suankiKelimeIndex = (suankiKelimeIndex + 1) % kelimeler.length;
            kelimeGoster();
        });

        elements.rastgeleKelimeBtn.addEventListener('click', rastgeleKelimeGoster);

        elements.bilmiyorumBtn.addEventListener('click', () => {
            alert("Bu kelimeyi tekrar gözden geçirelim!");
            elements.sonrakiKelimeBtn.click();
        });

        elements.biliyorumBtn.addEventListener('click', () => {
            alert("Harika! Bu kelimeyi biliyorsunuz 🎉");
            elements.sonrakiKelimeBtn.click();
        });

        elements.yeniListeEkleBtn.addEventListener('click', yeniListeEkle);
        elements.listeyiSilBtn.addEventListener('click', aktifListeyiSil);

        elements.mevcutListeyeEkleBtn.addEventListener('click', () => {
            const file = elements.jsonFileInput.files[0];
            if (!file) {
                alert('Lütfen bir JSON dosyası seçin!');
                return;
            }
            if (!aktifListeAdi) {
                alert('Önce bir liste seçin veya yeni liste oluşturun!');
                return;
            }
            jsonDosyasiniIsle(file, true);
        });

        elements.yeniListeOlusturBtn.addEventListener('click', () => {
            const file = elements.jsonFileInput.files[0];
            if (!file) {
                alert('Lütfen bir JSON dosyası seçin!');
                return;
            }
            jsonDosyasiniIsle(file, false);
        });

        // Tema butonları
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                temaDegistir(this.dataset.theme);
            });
        });
    }

    // Uygulamayı başlat
    function initApp() {
        // Tema yükle
        const savedTheme = localStorage.getItem('osmanlicaTheme') || 'light';
        temaDegistir(savedTheme);
        document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`)?.classList.add('active');
        
        // Listeleri yükle
        listeleriYukle();
        kelimeGoster();
        
        // Tooltip'leri başlat
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Uygulamayı başlat
    initEventListeners();
    initApp();
});
