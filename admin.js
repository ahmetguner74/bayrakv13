// DOM elementleri
const flagsList = document.getElementById('flags-list');
const addFlagForm = document.getElementById('add-flag-form');
const countryCodeInput = document.getElementById('country-code');
const countryNameTrInput = document.getElementById('country-name-tr');
const countryNameEnInput = document.getElementById('country-name-en');
const difficultySelect = document.getElementById('difficulty');
const csvUpload = document.getElementById('csv-upload');
const uploadBtn = document.getElementById('upload-btn');

// Ülke verileri
let countries = [];

// Bayrak verilerini yükle
async function loadFlags() {
    try {
        const response = await fetch('flags.json');
        if (!response.ok) {
            throw new Error('Bayrak verileri yüklenemedi');
        }
        countries = await response.json();
        updateFlagsList();
        console.log(`${countries.length} bayrak yüklendi`);
    } catch (error) {
        console.error('Bayraklar yüklenirken hata oluştu:', error);
        alert('Bayrak verileri yüklenirken bir hata oluştu!');
    }
}

// Bayrak verilerini kaydet
function saveFlags() {
    // JSON dosyasını oluştur
    const jsonContent = JSON.stringify(countries, null, 4);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // İndirme bağlantısı oluştur
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flags.json';
    
    // Dosyayı indir
    document.body.appendChild(link);
    link.click();
    
    // Temizlik
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Bayrak listesini güncelle
function updateFlagsList() {
    flagsList.innerHTML = '';
    countries.sort((a, b) => a.name_tr.localeCompare(b.name_tr)).forEach(country => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${country.code.toUpperCase()}</td>
            <td>${country.name_tr}</td>
            <td>${country.name_en}</td>
            <td>${country.difficulty || 'MEDIUM'}</td>
            <td>
                <img src="public/flags/${country.code}.svg" 
                     alt="${country.name_tr} bayrağı" 
                     style="width: 60px; height: 40px; object-fit: contain;">
            </td>
            <td>
                <button class="btn btn-danger" 
                        onclick="deleteFlag('${country.code}')">
                    Sil
                </button>
            </td>
        `;
        flagsList.appendChild(row);
    });
}

// Yeni bayrak ekle
function addFlag(code, name_tr, name_en = '', difficulty = 'MEDIUM') {
    // Ülke kodu zaten var mı kontrol et
    if (countries.some(country => country.code === code)) {
        alert('Bu ülke kodu zaten mevcut!');
        return false;
    }
    
    countries.push({
        code: code,
        name_tr: name_tr,
        name_en: name_en || name_tr,
        difficulty: difficulty
    });

    updateFlagsList();
    saveFlags();
    return true;
}

// Bayrak sil
function deleteFlag(code) {
    if (confirm('Bu bayrağı silmek istediğinizden emin misiniz?')) {
        countries = countries.filter(country => country.code !== code);
        updateFlagsList();
        saveFlags();
    }
}

// CSV dosyasını işle
function processCSV(csv) {
    const lines = csv.split('\n');
    let addedCount = 0;
    let errorCount = 0;
    
    lines.forEach(line => {
        const [code, name_tr, name_en] = line.trim().split(',');
        if (code && name_tr) {
            if (addFlag(code.toLowerCase(), name_tr, name_en)) {
                addedCount++;
            } else {
                errorCount++;
            }
        }
    });
    
    alert(`${addedCount} bayrak eklendi, ${errorCount} hata oluştu.`);
}

// Form gönderimi
addFlagForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = countryCodeInput.value.toLowerCase();
    const name_tr = countryNameTrInput.value;
    const name_en = countryNameEnInput.value;
    const difficulty = difficultySelect.value;
    
    if (addFlag(code, name_tr, name_en, difficulty)) {
        countryCodeInput.value = '';
        countryNameTrInput.value = '';
        countryNameEnInput.value = '';
        difficultySelect.value = 'MEDIUM';
    }
});

// CSV dosyası yükleme
uploadBtn.addEventListener('click', () => {
    const file = csvUpload.files[0];
    if (!file) {
        alert('Lütfen bir CSV dosyası seçin!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => processCSV(e.target.result);
    reader.readAsText(file);
});

// Sayfa yüklendiğinde bayrakları yükle
loadFlags(); 