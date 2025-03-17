(loadPage = () => {
    fetch("http://localhost:3000/items")
      .then((res) => res.json())
      .then((data) => {
        displayUser(data);
      });
  })();
  const userDisplay = document.querySelector(".table");
  displayUser = (data) => {
    userDisplay.innerHTML = `
      <thead>
      <tr>
        <th>Id</th>
        <th>Nimi</th>
        <th>Puhelin</th>
        <th>Poista</th>
        <th>Muokkaa</th>
      </tr>
      </thead>
       
      `;

    displayRow(data);
  };
  
  displayRow = (data) => {
    data.forEach((user) => {
      userDisplay.innerHTML += `
        <tbody>
          <tr id="row-${user.id}">
              <td>${user.id}</td>
              <td>${user.nimi}</td>
              <td>
                <span id="phone-${user.id}">${user.puhelin}</span>
                <input type="text" id="edit-phone-${user.id}" value="${user.puhelin}" class="form-control d-none" />
              </td>
              <td><button class="btn btn-danger" onClick="removeRow(${user.id})">X</button></td>
              <td>
                <button class="btn btn-primary" onClick="editPhone(${user.id})" id="edit-btn-${user.id}">Muokkaa</button>
                <button class="btn btn-success d-none mt-2" onClick="updatePhone(${user.id})" id="save-btn-${user.id}">Tallenna</button>
              </td>
          </tr>
        </tbody>
      `;
    });
  };
  
  removeRow = async (id) => {
    console.log(id);
    let polku = "http://localhost:3000/items/" + id;
  
    // Poistetaan tietue palvelimelta
    await fetch(polku, { method: "DELETE" })
      .then(() => {
        console.log("Poisto onnistui");
  
        // Haetaan taulukosta kyseinen rivi ja poistetaan se
        let row = document.getElementById(`row-${id}`);
        if (row) {
          row.remove();  // Poistetaan rivi DOM:sta
        }
      })
      .catch((err) => console.error("Virhe poistossa:", err));
  };

// Funktio muokkaustilaan siirtymiselle
editPhone = (id) => {
  let phoneSpan = document.getElementById(`phone-${id}`);
  let phoneInput = document.getElementById(`edit-phone-${id}`);
  let editBtn = document.getElementById(`edit-btn-${id}`);
  let saveBtn = document.getElementById(`save-btn-${id}`);

  // Piilotetaan numero ja muokkaa nappi, näytetään kenttä ja talenna nappi
  phoneSpan.classList.add("d-none");
  phoneInput.classList.remove("d-none");
  editBtn.classList.add("d-none");
  saveBtn.classList.remove("d-none");
};

// Funktio puhelinnumeron päivittämiseen
updatePhone = async (id) => {
    let newPhone = document.getElementById(`edit-phone-${id}`).value;
    let phoneSpan = document.getElementById(`phone-${id}`);
    let phoneInput = document.getElementById(`edit-phone-${id}`);
    let editBtn = document.getElementById(`edit-btn-${id}`);
    let saveBtn = document.getElementById(`save-btn-${id}`);
  
    if (!newPhone) {
      alert("Syötä uusi puhelinnumero!");
      return;
    }
  
    let polku = `http://localhost:3000/items/${id}`;
  
    let response = await fetch(polku);
    let userData = await response.json();
  
    let updatedData = {
      id: id,
      nimi: userData.nimi,
      puhelin: newPhone,
    };
  
    // Lähetetään päivitetyt tiedot PUT pyynnöllä
    await fetch(polku, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    })
      .then((res) => res.json())
      .then(() => {
        console.log("Päivitys onnistui");
  
      // Päivitetään muutettu tieto näkyviin
      phoneSpan.innerText = newPhone;
      phoneSpan.classList.remove("d-none");
      phoneInput.classList.add("d-none");
      editBtn.classList.remove("d-none");
      saveBtn.classList.add("d-none");

      })

      .catch((err) => console.error("Virhe päivityksessä:", err));
  };

  /**
   * Helper function for POSTing data as JSON with fetch.
   *
   * @param {Object} options
   * @param {string} options.url - URL to POST data to
   * @param {FormData} options.formData - `FormData` instance
   * @return {Object} - Response body from URL that was POSTed to
   */
  async function postFormDataAsJson({ url, formData }) {
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJsonString = JSON.stringify(plainFormData);
  
    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: formDataJsonString,
    };
  
    const response = await fetch(url, fetchOptions);
  
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
  
    return response.json();
  }
  
  /**
   * Event handler for a form submit event.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
   *
   * @param {SubmitEvent} event
   */
  
  async function handleFormSubmit(event) {
    event.preventDefault();
  
    const form = event.currentTarget;
    const url = form.action;
  
    try {
      const formData = new FormData(form);
  
      const responseData = await postFormDataAsJson({ url, formData });
      await loadPage(); //päivitetään taulukkoon
  
      console.log({ responseData });

      // Tyhjennetään lomakkeen kentät lisäämisen jälkeen
      document.getElementById("nimi").value = "";
      document.getElementById("puhelin").value = "";

    } catch (error) {
      console.error(error);
    }
  }

  const exampleForm = document.getElementById("puhelintieto_lomake");
  exampleForm.addEventListener("submit", handleFormSubmit);
  