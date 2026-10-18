// ==========================================
// File: admin.js
// Description: Admin Panel Logic (Firebase Auth & CRUD Operations - Optimized)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Admin Logout Button
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
        <div class="glass-card p-4 space-y-2">
          <img src="${data.image || 'logo.WebP'}" class="w-full h-40 object-cover rounded">
          <h3 class="font-bold text-lg text-[#C49A4A]">${data.name}</h3>
          <div class="flex gap-2 text-xs text-gray-300">
            ${data.socials?.facebook ? '<span>فيسبوك</span>' : ''}
            ${data.socials?.instagram ? '<span>انستجرام</span>' : ''}
            ${data.socials?.youtube ? '<span>يوتيوب</span>' : ''}
          </div>
          <div class="flex gap-2 pt-2">
            ${data.status === 'pending' ? `<button onclick="approvePerson('${key}')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">نشر</button>` : ''}
            <button onclick="editPerson('${key}', '${data.name}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">تعديل</button>
            <button onclick="deletePerson('${key}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">حذف</button>
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

// Global CRUD Functions
window.approvePerson = (id) => update(ref(db, `persons/${id}`), { status: 'approved' });
window.deletePerson = (id) => {
  if (confirm("هل أنت تأكد من حذف هذه الشخصية؟")) {
    remove(ref(db, `persons/${id}`));
  }
};
window.editPerson = (id, currentName) => {
  const newName = prompt("تعديل اسم الشخصية:", currentName);
  if (newName) update(ref(db, `persons/${id}`), { name: newName });
};
