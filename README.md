# QueryBot: Dataset Query & Visualization Tool

An intuitive, client-side tool that allows you to upload datasets, ask questions in plain English, and receive SQL queries, visualizations, and downloadable results automatically.

---

## About The Project

QueryBot is a powerful, browser-based utility designed for rapid data exploration and analysis. It bridges the gap between complex database queries and simple, natural language questions. By integrating with Large Language Models (LLMs) through OpenRouter, it can understand user intent, generate the appropriate SQL queries, and present the results in both tabular and graphical formats.

Since the tool runs entirely in your browser, there is no need for complex server setup or installation.

---

## Features

* **Versatile File Upload**: Supports common data formats including `.csv`, `.sqlite3`, and `.db`.
* **Automatic Data Schema Discovery**: Instantly detects and displays table names and column structures from your uploaded file.
* **AI-Powered Question Suggestions**: Generates relevant, insightful questions based on the schema of your dataset to kickstart your analysis.
* **Natural Language Querying**: Ask questions about your data in plain English. For example, "Show me the total sales for each region" will be translated into a valid SQL query.
* **Comprehensive Analysis Output**: For each query, the system provides:
    * An interpretation of your question.
    * The step-by-step logic used to arrive at the answer.
    * An analysis of required table relationships.
    * The generated SQLite query.
    * A corresponding `Chart.js` code snippet for the visualization.
* **Interactive Results & Exporting**:
    * View results in a dynamic, sortable table.
    * Download the query results as a `.csv` file.
    * Inspect the generated SQL query directly.
* **Rich Data Visualization**: Automatically generates charts to provide visual insights using `Chart.js`, including:
    * Bar Chart
    * Line Chart
    * Pie Chart
    * Radar Chart
    * Polar Area Chart

---

## Getting Started

Follow these simple steps to get the tool up and running on your local machine.

### Prerequisites

* A modern web browser (e.g., Chrome, Firefox, Safari, Edge).
* `git` installed on your system to clone the repository.

### Installation & Setup

1.  **Clone the Repository**
    Open your terminal or command prompt and run the following command:
    ```sh
    git clone https://github.com/harshan66Coder/QueryBot.git
    ```

2.  **Navigate to the Directory**
    ```sh
    cd QueryBot
    ```

3.  **Open the Application**
    Open the `index.html` file in your web browser. You can typically do this by double-clicking the file or right-clicking and selecting "Open with" your preferred browser.

### Configuration: OpenRouter LLM Integration

To enable natural language processing, you need to configure the tool with an API key from OpenRouter.

1.  **Select a Model**
    Go to the [OpenRouter](https://openrouter.ai/models) website and find a model suitable for your needs.
    *Example Model Name:* `deepseek/deepseek-r1-0528:free`

2.  **Generate an API Key**
    Log in to your OpenRouter account and generate a new API key.

3.  **Enter Credentials in the Tool**
    In the QueryBot interface, locate the input fields for the LLM configuration:
    * In the **Model Name** field, enter the name of the model you chose.
    * In the **API Key** field, paste your generated OpenRouter API key.

The system is now configured and will use your selected LLM to process all subsequent queries.


---

## Using the Sample Files

To help you get started quickly, this repository includes a `sampleTestFiles` directory containing a sample CSV file and an SQLite database.

### 1. Using the CSV File (`sampleTestFile`)

1.  Launch the QueryBot application in your browser.
2.  Click the file upload button and navigate to the `sampleTestFiles` folder.
3.  Select the `sampleTestFile` (which is a CSV file).
4.  Once the file is loaded, try asking some simple questions like:
    * "Show all data"
   

### 2. Using the SQLite Database (`sampleSQLite`)

1.  Launch the QueryBot application in your browser.
2.  Click the file upload button and navigate to the `sampleTestFiles` folder.
3.  Select the `sampleSQLite` file.
4.  Once the database is loaded, you can explore its contents by asking:
    * "Show all data"