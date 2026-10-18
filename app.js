// ==========================================
// File: app.js
// Description: Frontend Logic & Firebase Base64 Uploader
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Encrypted Firebase Credentials
const _0x1a = ["QUl6YVN5QkNvM0Z3X1FtNU1Eb3VKMlBvR2NLQWFaY3hHVUtFRQ==", "bXVzbGltLTM0ODNhLmZpcmViYXNlYXBwLmNvbQ==", "bXVzbGltLTM0ODNh", "bXVzbGltLTM0ODNhLmZpcmViYXN0b3JhZ2UuYXBw", "NTQzNjI4MTQwNzYx", "MTo1NDM2MjgxNDA3NjE6d2ViOjE1YTYyMTY5MmI5OWFhOTQyMTVlYzg=", "Ry0wQ0VKV1FMSEQw"];
const firebaseConfig = {
  apiKey: atob(_0x1a[0]),
  authDomain: atob(_0x1a[1]),
  projectId: atob(_0x1a[2]),
  storageBucket: atob(_0x1a[3]),
  messagingSenderId: atob(_0x1a[4]),
  appId: atob(_0x1a[5]),
  measurementId: atob(_0x1a[6])
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Dark/Light Theme Switcher
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  lucide.createIcons();
});

// Modal Logic
const modal = document.getElementById('addModal');
document.getElementById('openModalBtn').onclick = () => modal.classList.remove('hidden');
document.getElementById('closeModalBtn').onclick = () => modal.classList.add('hidden');

document.getElementById('imageTypeSelect').addEventListener('change', (e) => {
  if(e.target.value === 'file') {
    document.getElementById('fileUploadContainer').classList.remove('hidden');
    document.getElementById('urlUploadContainer').classList.add('hidden');
  } else {
    document.getElementById('fileUploadContainer').classList.add('hidden');
    document.getElementById('urlUploadContainer').classList.remove('hidden');
  }
});

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
    };
  });
}

// Form Submission
document.getElementById('addPersonForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('personName').value;
  const imageType = document.getElementById('imageTypeSelect').value;
  let finalImg = '';

  if (imageType === 'file') {
    const file = document.getElementById('personFile').files[0];
    if (file) finalImg = await compressAndConvertImage(file);
  } else {
    finalImg = document.getElementById('personUrl').value;
  }

  const socials = {
    facebook: document.getElementById('facebookUrl').value,
    instagram: document.getElementById('instagramUrl').value,
    youtube: document.getElementById('youtubeUrl').value,
  };

  await push(ref(db, 'persons'), {
    name,
    image: finalImg,
    socials,
    status: 'pending'
  });

  alert("رسالة شكر: سيتم مراجعة بيانات الشخصية ورفعها في أسرع وقت في ميزان حسناتك.");
  modal.classList.add('hidden');
  e.target.reset();
});

// Realtime Rendering from Firebase
onValue(ref(db, 'persons'), (snapshot) => {
  const cardsGrid = document.getElementById('cardsGrid');
  cardsGrid.innerHTML = '';
  snapshot.forEach((child) => {
    const data = child.val();
    if (data.status === 'approved') {
      cardsGrid.innerHTML += `
        <div class="glass-card p-4 flex flex-col items-center gap-4 group">
          <div class="relative w-full h-60 rounded-lg overflow-hidden">
            <img src="${data.image}" alt="${data.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
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
  lucide.createIcons();
});
