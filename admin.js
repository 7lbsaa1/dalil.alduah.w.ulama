// ==========================================
// File: admin.js
// Description: Admin Panel Logic (Full CRUD with Advanced Edit Modal)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const auth = getAuth(app);
const db = getDatabase(app);

// Admin Login Form
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    signInWithEmailAndPassword(auth, email, password)
      .catch((err) => {
        alert("خطأ في تسجيل الدخول: " + err.message);
      });
  });
}

// Admin Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.onclick = () => signOut(auth);
}

// Authentication State Listener
onAuthStateChanged(auth, (user) => {
  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');

  if (user) {
    if (loginView) loginView.classList.add('hidden');
    if (dashboardView) dashboardView.classList.remove('hidden');
    loadAdminData();
  } else {
    if (loginView) loginView.classList.remove('hidden');
    if (dashboardView) dashboardView.classList.add('hidden');
  }
});

// Load Realtime Data for Admin
function loadAdminData() {
  onValue(ref(db, 'persons'), (snapshot) => {
    const pendingContainer = document.getElementById('pendingContainer');
    const publishedContainer = document.getElementById('publishedContainer');
    
    if (pendingContainer) pendingContainer.innerHTML = '';
    if (publishedContainer) publishedContainer.innerHTML = '';

    snapshot.forEach((child) => {
      const key = child.key;
      const data = child.val();

      const cardHTML = `
        <div class="glass-card p-4 space-y-3 rounded-2xl flex flex-col justify-between">
          <div class="space-y-2">
            <img src="${data.image || 'logo.WebP'}" class="w-full h-40 object-cover rounded-xl border border-brandGold/30">
            <h3 class="font-bold text-lg text-[#C49A4A]">${data.name}</h3>
            <div class="flex gap-2 text-xs text-gray-300">
              ${data.socials?.facebook ? '<span>فيسبوك</span>' : ''}
              ${data.socials?.instagram ? '<span>انستجرام</span>' : ''}
              ${data.socials?.youtube ? '<span>يوتيوب</span>' : ''}
            </div>
          </div>
          <div class="flex gap-2 pt-2 border-t border-white/10">
            ${data.status === 'pending' ? `<button onclick="approvePerson('${key}')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex-1">نشر</button>` : ''}
            <button onclick="openEditModal('${key}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex-1">تعديل الشامل</button>
            <button onclick="deletePerson('${key}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex-1">حذف</button>
          </div>
        </div>
      `;

      if (data.status === 'pending' && pendingContainer) {
        pendingContainer.innerHTML += cardHTML;
      } else if (publishedContainer) {
        publishedContainer.innerHTML += cardHTML;
      }
    });

    if (window.lucide) lucide.createIcons();
  });
}

// Global Actions: Approve & Delete
window.approvePerson = (id) => update(ref(db, `persons/${id}`), { status: 'approved' });
window.deletePerson = (id) => {
  if (confirm("هل أنت تأكد من حذف هذه الشخصية نهائياً؟")) {
    remove(ref(db, `persons/${id}`));
  }
};

// Helper: Compress Image File to Base64
function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
    };
  });
}

// Global Action: Open Full Edit Modal & Pre-fill Data
window.openEditModal = async (id) => {
  const snapshot = await get(ref(db, `persons/${id}`));
  if (!snapshot.exists()) return;
  const data = snapshot.val();

  // إنشاء النافذة المنبثقة للتعديل إن لم تكن موجودة
  let editModal = document.getElementById('editPersonModal');
  if (!editModal) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="editPersonModal" class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl relative text-right max-h-[90vh] overflow-y-auto border border-brandGold/30">
          <button id="closeEditModalBtn" class="absolute top-5 left-5 text-gray-400 hover:text-brandGold">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
          <h2 class="text-2xl font-extrabold text-[#C49A4A] mb-6">تعديل بيانات الشخصية</h2>
          
          <form id="editPersonForm" class="space-y-4">
            <input type="hidden" id="editPersonId">
            
            <div>
              <label class="block mb-2 text-sm font-bold">اسم الشخصية *</label>
              <input type="text" id="editPersonName" required class="w-full p-3 rounded-xl bg-white/10 border border-gray-500 focus:outline-none focus:border-[#C49A4A]">
            </div>

            <div>
              <label class="block mb-2 text-sm font-bold">طريقة تعديل الصورة</label>
              <select id="editImageTypeSelect" class="w-full p-3 rounded-xl bg-white/10 border border-gray-500 focus:outline-none focus:border-[#C49A4A]">
                <option value="keep" class="text-black">الاحتفاظ بالصورة الحالية</option>
                <option value="file" class="text-black">رفع صورة جديدة من الجهاز</option>
                <option value="url" class="text-black">رابط صورة جديد (URL)</option>
              </select>
            </div>

            <div id="editFileUploadContainer" class="hidden">
              <label class="block mb-2 text-sm font-bold">اختر الصورة الجديدة</label>
              <input type="file" id="editPersonFile" accept="image/*" class="w-full p-2.5 rounded-xl bg-white/10 border border-gray-500">
            </div>

            <div id="editUrlUploadContainer" class="hidden">
              <label class="block mb-2 text-sm font-bold">رابط الصورة الجديد (URL)</label>
              <input type="url" id="editPersonUrl" class="w-full p-3 rounded-xl bg-white/10 border border-gray-500 focus:outline-none focus:border-[#C49A4A]">
            </div>

            <div class="space-y-3 pt-3 border-t border-white/10">
              <label class="block text-sm font-bold text-[#C49A4A]">روابط التواصل الاجتماعي</label>
              <input type="url" id="editFacebookUrl" placeholder="رابط فيسبوك" class="w-full p-2.5 rounded-xl bg-white/10 border border-gray-500 text-sm">
              <input type="url" id="editInstagramUrl" placeholder="رابط انستجرام" class="w-full p-2.5 rounded-xl bg-white/10 border border-gray-500 text-sm">
              <input type="url" id="editYoutubeUrl" placeholder="رابط يوتيوب" class="w-full p-2.5 rounded-xl bg-white/10 border border-gray-500 text-sm">
            </div>

            <button type="submit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C49A4A] to-amber-600 text-white font-bold text-lg shadow-xl hover:opacity-95 transition-all mt-4">
              حفظ التعديلات
            </button>
          </form>
        </div>
      </div>
    `);

    editModal = document.getElementById('editPersonModal');
    document.getElementById('closeEditModalBtn').onclick = () => editModal.classList.add('hidden');
    
    document.getElementById('editImageTypeSelect').onchange = (e) => {
      const type = e.target.value;
      document.getElementById('editFileUploadContainer').classList.toggle('hidden', type !== 'file');
      document.getElementById('editUrlUploadContainer').classList.toggle('hidden', type !== 'url');
    };

    document.getElementById('editPersonForm').onsubmit = async (e) => {
      e.preventDefault();
      const personId = document.getElementById('editPersonId').value;
      const newName = document.getElementById('editPersonName').value;
      const imageType = document.getElementById('editImageTypeSelect').value;

      const updates = {
        name: newName,
        socials: {
          facebook: document.getElementById('editFacebookUrl').value.trim(),
          instagram: document.getElementById('editInstagramUrl').value.trim(),
          youtube: document.getElementById('editYoutubeUrl').value.trim()
        }
      };

      if (imageType === 'file') {
        const file = document.getElementById('editPersonFile').files[0];
        if (file) updates.image = await compressImage(file);
      } else if (imageType === 'url') {
        const url = document.getElementById('editPersonUrl').value.trim();
        if (url) updates.image = url;
      }

      await update(ref(db, `persons/${personId}`), updates);
      alert("تم حفظ جميع التعديلات بنجاح!");
      editModal.classList.add('hidden');
    };
  }

  // تعبئة الحقول بالبيانات الحالية
  document.getElementById('editPersonId').value = id;
  document.getElementById('editPersonName').value = data.name || '';
  document.getElementById('editFacebookUrl').value = data.socials?.facebook || '';
  document.getElementById('editInstagramUrl').value = data.socials?.instagram || '';
  document.getElementById('editYoutubeUrl').value = data.socials?.youtube || '';
  
  document.getElementById('editImageTypeSelect').value = 'keep';
  document.getElementById('editFileUploadContainer').classList.add('hidden');
  document.getElementById('editUrlUploadContainer').classList.add('hidden');

  editModal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
};
