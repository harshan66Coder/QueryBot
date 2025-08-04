const btn = document.getElementById("togglebutton");
const themeImage = document.getElementById("themeImage");

const currentTheme = localStorage.getItem("theme") || "light-mode";
document.body.classList.add(currentTheme);
updateImage(currentTheme);

btn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  document.body.classList.toggle("dark-mode");

  const newTheme = document.body.classList.contains("dark-mode")
    ? "dark-mode"
    : "light-mode";

  localStorage.setItem("theme", newTheme);
  updateImage(newTheme);
});

function updateImage(theme) {
  if (theme === "dark-mode") {
    themeImage.src = "assets/dark.png";
  } else {
    themeImage.src = "assets/light.png";
  }
}

const GEMINI_API_KEY = ""; //please add the api key
const GEMINI_MODEL = "models/gemini-2.5-flash";
let SQL,
  db,
  dbReady = false,
  tableData = "";

async function geminiPrompt(promptText) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
      }),
    }
  );
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

initSqlJs({
  locateFile: (file) =>
    `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.5.0/${file}`,
}).then((SQLlib) => {
  SQL = SQLlib;
  db = new SQL.Database();
  dbReady = true;
});

document.getElementById("fileInput").onchange = async (e) => {
  if (!dbReady) return alert("SQL engine still loading...");
  const file = e.target.files[0];
  if (!file) return;

  const ext = file.name.split(".").pop().toLowerCase();
  if (!["csv", "sqlite", "db"].includes(ext)) {
    e.target.value = "";
    alert("Only CSV or SQLite files supported.");
    return;
  }

  if (ext === "sqlite" || ext === "db") {
    try {
      const buf = await file.arrayBuffer();
      db = new SQL.Database(new Uint8Array(buf));
      try {
        const tables = db.exec(
          "SELECT name FROM sqlite_master WHERE type='table'"
        );
        if (tables.length > 0) {
          const tableName = tables[0].values[0][0];
          const result = db.exec(`SELECT * FROM ${tableName}`);
          if (result.length > 0) {
            const headers = result[0].columns;
            const rows = result[0].values;
            tableData =
              `Columns: ${headers.join(", ")}\n` +
              rows.map((row) => JSON.stringify(row)).join("\n");
          }
        }
      } catch (e) {
        console.warn("Couldn't extract sample data:", e);
        tableData = "SQLite database loaded (couldn't extract sample data)";
      }
      alert("File uploaded and data inserted successfully!");
      document.getElementById("exampleLoader").style.display = "inline-block";
      document.getElementById("generatedField").style.display = "block";

      refreshTableInspector();
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file: " + error.message);
    }
  } else {
    const text = await file.text();
    const parsed = Papa.parse(text, { header: true });
    const headers = parsed.meta.fields;
    const rows = parsed.data.filter((row) =>
      Object.values(row).some((val) => val !== "")
    );
    tableData =
      `Columns: ${headers.join(", ")}\n` +
      rows
        .slice(0, 10)
        .map((r) => JSON.stringify(r))
        .join("\n");
    try {
      db.run(`DROP TABLE IF EXISTS data`);
      db.run(
        `CREATE TABLE data (${headers.map((c) => `"${c}" TEXT`).join(", ")})`
      );
      const stmt = db.prepare(
        `INSERT INTO data VALUES (${headers.map(() => "?").join(",")})`
      );
      rows.forEach((row) => {
        stmt.bind(headers.map((h) => row[h]));
        stmt.step();
        stmt.reset();
      });
      stmt.free();
      alert("File uploaded and data inserted successfully!");
      document.getElementById("exampleLoader").style.display = "inline-block";
      document.getElementById("generatedField").style.display = "block";
      refreshTableInspector();
    } catch (err) {
      console.error("Error during upload:", err);
      alert("Upload failed. Check console for details.");
    }
  }
  const desc = await geminiPrompt(
    `You are given the following table data:\n\n${tableData}\n\nDescribe what kind of data this table contains.`
  );
  const exampleQ = await geminiPrompt(
    `From the description below, please generate a minimum of 5 simple one line user-friendly questions:\n\n${desc}`
  );
  document.getElementById("exampleQ").value = exampleQ;

  const textValue = document.getElementById("exampleQ").value;

  if (textValue.length > 0) {
    document.getElementById("QuestionArea").style.display = "block";
    const questionArea = document.getElementById("QuestionArea");
    questionArea.scrollIntoView({ behavior: "smooth" });
  } else {
    document.getElementById("QuestionArea").style.display = "none";
  }

  document.getElementById("exampleLoader").style.display = "none";
};

async function getSchemaText() {
  const schemaRes = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table'"
  );
  const tables = schemaRes.map((r) => r.values.map((v) => v[0])).flat();
  let schemaText = "";
  tables.forEach((t) => {
    const tableInfo = db.exec(`PRAGMA table_info(${t})`);
    const columns = tableInfo[0].values
      .map((row) => row[1] + " (" + row[2] + ")")
      .join(", ");
    schemaText += `Table "${t}": ${columns}\n`;
  });
  return schemaText;
}

async function runLLMQuery(question, chartMode = false) {
  const btnText = document.getElementById("btnText");

  const btnLoader = document.getElementById("btnLoader");
  const btnChart = document.getElementById("chartQueryBtnText");
  const btnChartLoader = document.getElementById("chartLoader");

  if (chartMode) {
    btnChart.innerHTML = "Loading...";

    btnChartLoader.style.display = "inline-block";
  } else {
    btnText.innerHTML = "Loading...";
    btnLoader.style.display = "inline-block";
  }

  const schema = await getSchemaText();
  // this sql is for the db.exec(sql) for res
  const sqlPrompt = `You are an expert in SQLite. Given this schema:\n${schema}\n\nAnswer this question:\n"${question}"\n\nProvide a valid SQLite query only, no explanation.`;
  let sql = await geminiPrompt(sqlPrompt);
  sql = sql.replace(/```(?:sqlite)?|```/g, "").trim();

  // this is for the generated output in the div
  const finalPrompt = `
          You are an expert in SQLite.
          Given the following schema:
          ${schema}
          And the following table data:
          ${tableData}
          Based on this, answer the following question:
          "${question}"
          Your response should include the following:
          1) Objective Guess:
          - Provide a brief and direct answer to the question.
          2) Steps to Achieve This:
          - List the steps needed to achieve the objective using the given data.
          3) Tables and Relationships:
          - Describe the relationships between the tables (do not include actual data).
          4) SQLite Query:
          - Provide a valid SQLite query that answers the question.
          - Do not include any explanations—just the SQL query.
          Formatting Requirements:
          - Each topic should be numbered (1, 2, 3, etc.).
          - Each topic's content should be formatted as bullet points.
          - Add a new line at the end of each topic's section for proper innerHTML alignment in a div.
          `;
  let context = await geminiPrompt(finalPrompt);
  document.getElementById("generatedSQL").innerHTML = context;

  let res;
  try {
    res = db.exec(sql);

    if (res.length > 0) {
      document.getElementById("res").style.display = "block";
      document.getElementById("generatedOutput").style.display = "block";
      const autoScroll = document.getElementById("autoScroll-output");
      autoScroll.scrollIntoView({ behavior: "smooth" });
    }
  } catch (err) {
    document.getElementById(
      "result"
    ).innerHTML = `<b>Error:</b> ${err.message}<br><pre>${sql}</pre>`;
    const autoResScroll = document.getElementById("res");
    autoResScroll.scrollIntoView({ behavior: "smooth" });
    return;
  } finally {
    if (chartMode) {
      btnChart.innerHTML = "Generate Bar Chart";
      btnChartLoader.style.display = "none";
    } else {
      btnText.innerHTML = "Get Table";
      btnLoader.style.display = "none";
    }
  }

  if (!res || res.length === 0) {
    document.getElementById("result").textContent = "No results.";
    const autoResScroll = document.getElementById("res");
    autoResScroll.scrollIntoView({ behavior: "smooth" });
    return;
  }

  const cols = res[0].columns;
  const vals = res[0].values;
  const resultDiv = document.getElementById("result");
  const autoResScroll = document.getElementById("res");
  autoResScroll.scrollIntoView({ behavior: "smooth" });
  let html =
    "<table><tr>" + cols.map((h) => `<th>${h}</th>`).join("") + "</tr>";
  vals.forEach((row) => {
    html += "<tr>" + row.map((v) => `<td>${v}</td>`).join("") + "</tr>";
  });
  html += "</table>";
  resultDiv.innerHTML = html;

  const csv = [cols.join(","), ...vals.map((r) => r.join(","))].join("\n");
  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.style.display = "inline-block";
  downloadBtn.onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "query_result.csv";
    a.click();
  };

  if (!chartMode) return;

  const labelIndex = cols.findIndex((_, i) => typeof vals[0][i] === "string");
  const valueIndex = cols.findIndex(
    (_, i) => i !== labelIndex && !isNaN(parseFloat(vals[0][i]))
  );
  if (labelIndex === -1 || valueIndex === -1)
    return alert("Improper data for charting kindly try another question.");

  const labels = vals.map((r) => r[labelIndex]);
  const data = vals.map((r) => parseFloat(r[valueIndex]) || 0);
  resultDiv.innerHTML += '<canvas id="myChart"></canvas>';
  const ctx = document.getElementById("myChart").getContext("2d");

  const chartConfig = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: `${cols[valueIndex]} by ${cols[labelIndex]}`,
          data,
          backgroundColor: [
            "#4a90e2",
            "#50e3c2",
            "#b8e986",
            "#f5a623",
            "#e94e77",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  };

  new Chart(ctx, chartConfig);
  const jsCode = "const config = " + JSON.stringify(chartConfig, null, 2);
  document.getElementById("chartCode").innerText =
    "// Chart.js Code Generated by AI\n" + jsCode;

  const downloadLink = document.getElementById("downloadChartJs");
  downloadLink.onclick = () => {
    const blob = new Blob([jsCode], { type: "application/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chart-config.js";
    a.click();
  };
}

document.getElementById("askBtn").onclick = () => {
  const q = document.getElementById("question").value.trim();
  if (!q) return alert("Enter a valid question.");
  runLLMQuery(q, false);
};

document.getElementById("chartQueryBtn").onclick = () => {
  const q = document.getElementById("chartQuestion").value.trim();
  if (!q) return alert("Enter a chart prompt.");
  runLLMQuery(q, true);
};

document.getElementById("useExampleBtn").onclick = () => {
  const exampleQ = document.getElementById("exampleQ").value;
  document.getElementById("question").value = exampleQ;
};
async function refreshTableInspector() {
  const tableNameRes = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  );
  if (!tableNameRes.length)
    return (document.getElementById("tableInspectorSection").style.display =
      "none");

  const tables = tableNameRes[0].values.map((r) => r[0]);
  const sel = document.getElementById("tableList");
  sel.innerHTML = "";
  tables.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    sel.appendChild(opt);
  });
  document.getElementById("tableInspectorSection").style.display = "block";

  // Attach the event handler HERE, after populating
  sel.onchange = function () {
    showTableSchemaFor(this.value);
  };

  // Show the schema for the first (default) table
  showTableSchemaFor(tables[0]);
}

function showTableSchemaFor(table) {
  let createSQL = "";
  try {
    const createSQLArr = db.exec(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name=?`,
      [table]
    );
    createSQL = createSQLArr[0]?.values[0]?.[0] || "(not found)";
  } catch {
    createSQL = "(not found)";
  }
  document.getElementById("tableCreateSQL").textContent = createSQL;

  let tableInfo = [];
  try {
    const tiRes = db.exec(`PRAGMA table_info(${table})`);
    tableInfo = tiRes[0]?.values || [];
  } catch {
    tableInfo = [];
  }
  const tbl = document.getElementById("tableColsInfo");
  tbl.innerHTML =
    "<tr><th>Name</th><th>Type</th><th>Not Null</th><th>Default</th><th>Primary Key</th></tr>";
  tableInfo.forEach((row) => {
    tbl.innerHTML += `<tr>
      <td>${row[1]}</td>
      <td>${row[2]}</td>
      <td>${row[3] ? "Yes" : "No"}</td>
      <td>${row[4] === null ? "NULL" : row[4]}</td>
      <td>${row[5] ? "Yes" : "No"}</td>
    </tr>`;
  });
}

document.getElementById("tableList").onchange = function () {
  const table = this.value;
  showTableSchemaFor(table);
};
