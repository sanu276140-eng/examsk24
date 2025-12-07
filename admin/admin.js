const firebaseConfig = {
  apiKey: "PASTE_HERE",
  authDomain: "PASTE_HERE",
  databaseURL: "PASTE_HERE",
  projectId: "PASTE_HERE",
  storageBucket: "PASTE_HERE",
  messagingSenderId: "PASTE_HERE",
  appId: "PASTE_HERE"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

const loginBox = document.getElementById("loginBox");
const panel = document.getElementById("panel");

loginBtn.onclick = async () => {
  try {
    await auth.signInWithEmailAndPassword(email.value, password.value);
  } catch (e) {
    alert(e.message);
  }
};

auth.onAuthStateChanged(user => {
  if (user) {
    loginBox.classList.add("hide");
    panel.classList.remove("hide");
    loadQuestions();
  }
});

logoutBtn.onclick = () => auth.signOut();

saveBtn.onclick = () => {
  const data = {
    q: q.value,
    o: [o1.value, o2.value, o3.value, o4.value],
    a: Number(ans.value)
  };

  db.ref("questions").push(data);

  q.value = o1.value = o2.value = o3.value = o4.value = "";
};

function loadQuestions() {
  db.ref("questions").on("value", snap => {
    list.innerHTML = "";
    const data = snap.val() || {};
    for (let id in data) {
      list.innerHTML += `
        <div class="item">
          ${data[id].q}
          <button onclick="editQ('${id}')">✏</button>
          <button onclick="delQ('${id}')">❌</button>
        </div>
      `;
    }
  });
}

function delQ(id) {
  if (confirm("Delete this question?")) {
    db.ref("questions/" + id).remove();
  }
}

function editQ(id) {
  db.ref("questions/" + id).once("value").then(snap => {
    const d = snap.val();
    q.value = d.q;
    o1.value = d.o[0];
    o2.value = d.o[1];
    o3.value = d.o[2];
    o4.value = d.o[3];
    ans.value = d.a;

    saveBtn.onclick = () => {
      db.ref("questions/" + id).set({
        q: q.value,
        o: [o1.value, o2.value, o3.value, o4.value],
        a: Number(ans.value)
      });
    };
  });
}
