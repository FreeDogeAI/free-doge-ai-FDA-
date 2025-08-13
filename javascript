const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Kayıtları saklamak için basit bir JSON dosyası kullanıyoruz
const DATA_FILE = path.join(__dirname, 'registrations.json');

// API endpoint'i
app.post('/submit', (req, res) => {
    const formData = req.body;
    
    // Dosyadan mevcut kayıtları oku
    fs.readFile(DATA_FILE, (err, data) => {
        let registrations = [];
        
        if (!err) {
            try {
                registrations = JSON.parse(data);
            } catch (e) {
                console.error('Dosya okuma hatası:', e);
            }
        }
        
        // Yeni kaydı ekle
        registrations.push(formData);
        
        // Dosyaya yaz
        fs.writeFile(DATA_FILE, JSON.stringify(registrations, null, 2), (err) => {
            if (err) {
                console.error('Dosya yazma hatası:', err);
                return res.status(500).json({ success: false, message: 'Kayıt sırasında hata oluştu' });
            }
            
            res.json({ success: true, message: 'Kayıt başarıyla alındı' });
        });
    });
});

// Kayıtları görüntüleme endpoint'i (sadece admin için)
app.get('/registrations', (req, res) => {
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Kayıtlar okunamadı' });
        }
        
        try {
            const registrations = JSON.parse(data);
            res.json(registrations);
        } catch (e) {
            res.status(500).json({ error: 'Veri işlenirken hata oluştu' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
