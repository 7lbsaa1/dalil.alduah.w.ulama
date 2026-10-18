// ==========================================
// File: app.js
// Description: Frontend Logic & Firebase Base64 Uploader (Optimized)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase Configuration Direct
const firebaseConfig = {
  apiKey: "AIzaSyBCo3Fw_Qm5MD9ouJ02PoGcKAaZcxGUK2E",
  authDomain: "muslim-3483a.firebaseapp.com",
  projectId: "muslim-3483a",
  storageBucket: "muslim-3483a.firebasestorage.app",
  messagingSenderId: "543628140761",
  appId: "1:543628140761:web:15a6b1692b99aa94215ec8",
  measurementId: "G-0CEJWQLHD0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Dark/Light Theme Switcher
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    if (window.lucide) lucide.createIcons();
  });
}

// Modal Toggle Logic
const modal = document.getElementById('addModal');
const openBtn = document.getElementById('openModalBtn');
const closeBtn = document.getElementById('closeModalBtn');

if (openBtn && modal) openBtn.onclick = () => modal.classList.remove('hidden');
if (closeBtn && modal) closeBtn.onclick = () => modal.classList.add('hidden');

const imageTypeSelect = document.getElementById('imageTypeSelect');
if (imageTypeSelect) {
  imageTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'file') {
      document.getElementById('fileUploadContainer')?.classList.remove('hidden');
      document.getElementById('urlUploadContainer')?.classList.add('hidden');
    } else {
      document.getElementById('fileUploadContainer')?.classList.add('hidden');
      document.getElementById('urlUploadContainer')?.classList.remove('hidden');
    }
  });
}

// Image Compressor & Base64 Converter
function compressAndConvertImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scaleFactor = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleFactor;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// Form Submission Handling
const addPersonForm = document.getElementById('addPersonForm');
if (addPersonForm) {
  addPersonForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const name = document.getElementById('personName').value;
      const imageType = document.getElementById('imageTypeSelect').value;
      let finalImg = '';

      if (imageType === 'file') {
        const fileInput = document.getElementById('personFile');
        if (fileInput && fileInput.files[0]) {
          finalImg = await compressAndConvertImage(fileInput.files[0]);
        }
      } else {
        finalImg = document.getElementById('personUrl').value;
      }

      const socials = {
        facebook: document.getElementById('facebookUrl')?.value || '',
        instagram: document.getElementById('instagramUrl')?.value || '',
        youtube: document.getElementById('youtubeUrl')?.value || '',
      };

      await push(ref(db, 'persons'), {
        name,
        image: finalImg,
        socials,
        status: 'pending',
        createdAt: Date.now()
      });

      alert("رسالة شكر: سيتم مراجعة بيانات الشخصية ورفعها في أسرع وقت في ميزان حسناتك.");
      if (modal) modal.classList.add('hidden');
      addPersonForm.reset();
    } catch (error) {
      alert("حدث خطأ أثناء رفع البيانات: " + error.message);
    }
  });
}

// Realtime Rendering for Main Page Cards
const cardsGrid = document.getElementById('cardsGrid');
if (cardsGrid) {
  onValue(ref(db, 'persons'), (snapshot) => {
    cardsGrid.innerHTML = '';
    snapshot.forEach((child) => {
      const data = child.val();
      if (data.status === 'approved') {
        cardsGrid.innerHTML += `
          <div class="glass-card p-4 flex flex-col items-center gap-4 group">
            <div class="relative w-full h-60 rounded-lg overflow-hidden">
              <img src="${data.image || 'logo.WebP'}" alt="${data.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              <div class="absolute bottom-2 right-2 flex gap-2 bg-black/60 p-2 rounded-lg backdrop-blur-md">
                ${data.socials?.facebook ? `<a href="${data.socials.facebook}" target="_blank"><i data-lucide="facebook" class="text-blue-400 w-5 h-5"></i></a>` : ''}
                ${data.socials?.instagram ? `<a href="${data.socials.instagram}" target="_blank"><i data-lucide="instagram" class="text-pink-400 w-5 h-5"></i></a>` : ''}
                ${data.socials?.youtube ? `<a href="${data.socials.youtube}" target="_blank"><i data-lucide="youtube" class="text-red-500 w-5 h-5"></i></a>` : ''}
              </div>
            </div>
            <h3 class="text-xl font-bold text-[#C49A4A]">${data.name}</h3>
          </div>
        `;
      }
    });
    if (window.lucide) lucide.createIcons();
  });
}
