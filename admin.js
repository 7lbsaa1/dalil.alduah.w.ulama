// ==========================================
// File: admin.js
// Description: Admin Panel Logic (Firebase Auth & Realtime CRUD)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const auth = getAuth(app);
const db = getDatabase(app);

document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  signInWithEmailAndPassword(auth, document.getElementById('adminEmail').value, document.getElementById('adminPassword').value)
    .catch(err => alert("خطأ في تسجيل الدخول: " + err.message));
});

document.getElementById('logoutBtn').onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('dashboardView').classList.remove('hidden');
    loadData();
  } else {
    document.getElementById('loginView').classList.remove('hidden');
    document.getElementById('dashboardView').classList.add('hidden');
  }
});

function loadData() {
  onValue(ref(db, 'persons'), (snapshot) => {
    const pending = document.getElementById('pendingContainer');
    const published = document.getElementById('publishedContainer');
    pending.innerHTML = '';
    published.innerHTML = '';

    snapshot.forEach((child) => {
      const key = child.key;
      const data = child.val();
      const cardHTML = `
        <div class="glass-card p-4 space-y-2">
          <img src="${data.image}" class="w-full h-40 object-cover rounded">
          <h3 class="font-bold text-lg">${data.name}</h3>
          <div class="flex gap-2 text-xs">
            ${data.socials?.facebook ? '<span>فيسبوك</span>' : ''}
            ${data.socials?.instagram ? '<span>انستجرام</span>' : ''}
            ${data.socials?.youtube ? '<span>يوتيوب</span>' : ''}
          </div>
          <div class="flex gap-2 pt-2">
            ${data.status === 'pending' ? `<button onclick="approvePerson('${key}')" class="bg-green-600 px-3 py-1 rounded text-sm">نشر</button>` : ''}
            <button onclick="editPerson('${key}', '${data.name}')" class="bg-blue-600 px-3 py-1 rounded text-sm">تعديل</button>
            <button onclick="deletePerson('${key}')" class="bg-red-600 px-3 py-1 rounded text-sm">حذف</button>
          </div>
        </div>
      `;

      if (data.status === 'pending') pending.innerHTML += cardHTML;
      else published.innerHTML += cardHTML;
    });
  });
}

window.approvePerson = (id) => update(ref(db, `persons/${id}`), { status: 'approved' });
window.deletePerson = (id) => remove(ref(db, `persons/${id}`));
window.editPerson = (id, currentName) => {
  const newName = prompt("تعديل اسم الشخصية:", currentName);
  if (newName) update(ref(db, `persons/${id}`), { name: newName });
};
