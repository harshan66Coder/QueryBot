console.log("script file connected ");

// file upload
document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    const message = document.getElementById("message");

    if (!file) {
      message.textContent = "No file selected.";
      message.style.color = "red";
      return;
    }

    const supportedExtensions = [".csv", ".sqlite", ".db"];
    const fileName = file.name.toLowerCase();

    const isSupported = supportedExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!isSupported) {
      message.textContent = "Only .csv, .sqlite, and .db files are supported.";
      message.style.color = "red";
      alert(message.textContent);
      event.target.value = "";
    } else {
      message.style.color = "green";
      message.textContent = `Selected file: ${file.name}`;
      console.log("Selected file:", file.name);
    }
  });
