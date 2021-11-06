const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const mascotaForm = document.getElementById("mascotas-form");
const mascotasContainer = document.getElementById("mascotas-container");

let editStatus=false;
let id='';


const loginCheck = (user) => {
  if (user) {
    loggedInLinks.forEach((link) => (link.style.display = "block"));
    loggedOutLinks.forEach((link) => (link.style.display = "none"));
  } else {
    loggedInLinks.forEach((link) => (link.style.display = "none"));
    loggedOutLinks.forEach((link) => (link.style.display = "block"));
  }
};

// SignUp
const signUpForm = document.querySelector("#signup-form");
signUpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signUpForm["signup-email"].value;
  const password = signUpForm["signup-password"].value;

  // Authenticate the User
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // clear the form
      signUpForm.reset();
      // close the modal
      $("#signupModal").modal("hide");
    });
});

// Logout
const logout = document.querySelector("#logout");

logout.addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
    console.log("signup out");
  });
});

// SingIn
const signInForm = document.querySelector("#login-form");

signInForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signInForm["login-email"].value;
  const password = signInForm["login-password"].value;

  // Authenticate the User
  auth.signInWithEmailAndPassword(email, password).then((userCredential) => {
    // clear the form
    signInForm.reset();
    // close the modal
    $("#signinModal").modal("hide");
  });
});

// Posts
// const postList = document.querySelector(".mascotas");
// const setupPosts = (data) => {
//   if (data.length) {
//     let html = "";
//     data.forEach((doc) => {
//       const post = doc.data();
//       const li = `
//       <li class="list-group-item list-group-item-action">
//         <h5>Nombre de Mascota: ${post.nombre}</h5>
//         <p>Dueño: ${post.dueño}</p>
//         <p>Peso: ${post.peso}</p>
//         <p>Edad: ${post.edad}</p>
//       </li>
//     `;
//       html += li;
//     });
//     postList.innerHTML = html;
//   } else {
//     postList.innerHTML = '<h4 class="text-white">Login to See Posts</h4>';
//   }
// };


/**
 * Save a New Task in Firestore
 * @param {string} nombre the title of the Task
 * @param {string} edad the title of the Task
 * @param {string} peso the title of the Task
 * @param {string} dueño the description of the Task
 */
 const saveTask = (nombre, dueño,peso,edad) =>
 fs.collection("mascotas").doc().set({
   nombre,
   dueño,
   peso,
   edad,
 });

 const getMascotas = () => fs.collection("mascotas").get();

const onGetMascota = (callback) => fs.collection("mascotas").onSnapshot(callback);

const deleteMascota = (id) => fs.collection("mascotas").doc(id).delete();

const getMascota = (id) => fs.collection("mascotas").doc(id).get();

const updateMascota = (id, updateMascota) => fs.collection('mascotas').doc(id).update(updateMascota);

window.addEventListener("DOMContentLoaded", async (e) => {
  onGetMascota((querySnapshot) => {
    mascotasContainer.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const post = doc.data();

      mascotasContainer.innerHTML += `<div class="card card-body mt-2 border-primary">
    
    <h5>Nombre de Mascota: ${post.nombre}</h5>
         <p>Dueño: ${post.dueño}</p>
         <p>Peso: ${post.peso}</p>
         <p>Edad: ${post.edad}</p>
    <div>
      <button class="btn btn-primary btn-delete" data-id="${doc.id}">
        🗑 Delete
      </button>
      <button class="btn btn-secondary btn-edit" data-id="${doc.id}">
        🖉 Edit
      </button>
    </div>
  </div>`;
    });

    const btnsDelete = mascotasContainer.querySelectorAll(".btn-delete");
    btnsDelete.forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        console.log(e.target.dataset.id);
        try {
          await deleteMascota(e.target.dataset.id);
        } catch (error) {
          console.log(error);
        }
      })
    );

    const btnsEdit = mascotasContainer.querySelectorAll(".btn-edit");
    btnsEdit.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        try {
          const doc = await getMascota(e.target.dataset.id);
          const task = doc.data();
          mascotaForm["task-nombre"].value = task.nombre;
          mascotaForm["task-dueño"].value = task.dueño;
          mascotaForm["task-peso"].value = task.peso;
          mascotaForm["task-edad"].value = task.edad;

          editStatus = true;
          id = doc.id;
          mascotaForm["btn-task-form"].innerText = "Update";

        } catch (error) {
          console.log(error);
        }
      });
    });
  });
});

mascotaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = mascotaForm["task-nombre"];
  const dueño = mascotaForm["task-dueño"];
  const peso = mascotaForm["task-peso"];
  const edad = mascotaForm["task-edad"];

  try {
    if (!editStatus) {
      await saveTask(nombre.value, dueño.value,peso.value,edad.value);
    } else {
      await updateMascota(id, {
        nombre: nombre.value,
        dueño: dueño.value,
        peso: peso.value,
        edad: edad.value,

      })
      editStatus = false;
      id = '';
      mascotaForm['btn-task-form'].innerText = 'Save';
    }

    mascotaForm.reset();
    title.focus();
  } catch (error) {
    console.log(error);
  }
});



// events
// list for auth state changes
// auth.onAuthStateChanged((user) => {
//   if (user) {
//     console.log("signin");
//     fs.collection("mascotas")
//       .get()
//       .then((snapshot) => {
//         console.log(snapshot.docs)
//         setupPosts(snapshot.docs);
//         loginCheck(user);
//       });
//   } else {
//     console.log("signout");
//     setupPosts([]);
//     loginCheck(user);
//   }
// });

// Login with Google
const googleButton = document.querySelector("#googleLogin");

googleButton.addEventListener("click", (e) => {
  e.preventDefault();
  signInForm.reset();
  $("#signinModal").modal("hide");

  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then((result) => {
    console.log(result);
    console.log("google sign in");
  })
  .catch(err => {
    console.log(err);
    console.log("error aca");
  })
});

// Login with twtitter
// const twitterButton = document.querySelector("#twitterLogin");

// twitterButton.addEventListener("click", (e) => {
//   e.preventDefault();
//   signInForm.reset();
//   $("#signinModal").modal("hide");

//   const provider = new firebase.auth.TwitterAuthProvider();
//   auth.signInWithPopup(provider).then((result) => {
//     console.log(result);
//     console.log("twitter sign in");
//   })
//   .catch(err => {
//     console.log(err);
//   })
// });

// Login with Facebook
const facebookButton = document.querySelector('#facebookLogin');

facebookButton.addEventListener('click', e => {
  e.preventDefault();
  signInForm.reset();
  $("#signinModal").modal("hide");

  const provider = new firebase.auth.FacebookAuthProvider();
  auth.signInWithPopup(provider).then((result) => {
    console.log(result);
    console.log("facebook sign in");
  })
  .catch(err => {
    console.log(err);
  })

})