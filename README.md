📊 DATASET QUERY & VISUALIZATION TOOL

    This tool allows users to upload datasets, explore their structure, and ask questions in plain English. It generates SQL queries, visualizations, and downloadable results automatically.

1📦 Setup & Usage

    # Clone the repository
    1.1 git clone https://github.com/harshan66Coder/QueryBot.git
    1.2 Open the main HTML file (index.html) in your browser.
        Example: double-click index.html or right-click → Open with → Your browser
    1.3 The tool will run locally — no server setup required.

 # How It Works:

 🤖OpenRouter LLM Integration

    We use OpenRouter to connect with multiple Large Language Models (LLMs) for natural language query processing.

    1.4 Go to OpenRouter and search for a model in the search bar.
    Example: "deepseek/deepseek-r1-0528:free"
    1.5 Generate an API key from your OpenRouter account.
    1.6 Enter:
        Model Name → In the “Model Name” input field
        API Key → In the “API Key” input field
    1.7 The system will then process queries only with the chosen OpenRouter model.

2.🚀 Features

2.1 Upload Your File
    Supports .csv, .sqlite3, and .db formats.

2.2 View Data Structure
    Automatically detects and displays:
        >> Table names
        >> Columns
        >> Columns

2.3 Get Smart Questions
    The system suggests relevant questions based on your uploaded data.

2.4 Ask Questions in Plain English
    Users can describe their dataset and ask questions in plain English.
    Example: "Show all data" → Generates relevant SQL query and output.

2.5 System Processes & Answers
    For each question, the system provides:

        >> Understanding of the query
        >> Steps to solve it
        >> Table relationships
        >> Generated SQLite query
        >> Chart visualization
        >> Chart.js code snippet

2.6 View & Download Results

       >>  Dynamic table view
       >>  Export as .csv
       >>  View generated SQL query

2.7 Visual Insights
    Auto-generated visualizations using Chart.js:

       >> Bar chart
       >> Line chart
       >> Pie chart
       >> Radar chart
       >> Polar Area chart


