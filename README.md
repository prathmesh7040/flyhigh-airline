# flyhigh-airline
An Summer Internship Project based on the MERN Stack an end-to-end project


⚙️ How to Run the Project
Follow these steps to get the application running on your local machine.

Prerequisites
Node.js: You must have Node.js installed. You can download it from nodejs.org. This will also install npm (Node Package Manager).

Step-by-Step Instructions
Create the Project Folder: Create a new folder on your computer named flyhigh-airlines.

Create the File Structure: Inside flyhigh-airlines, create the public sub-folder and the files database.js, package.json, and server.js as shown in the file structure diagram.

Add the Code: Copy and paste the code provided above into each corresponding file. Place your original HTML files (or the updated versions provided here) into the public folder.

Open in VS Code: Open the entire flyhigh-airlines folder in Visual Studio Code.

Open the Terminal: In VS Code, open a new terminal (you can use the shortcut Ctrl+`` or go to Terminal > New Terminal`).

Install Dependencies: In the terminal, run the following command. This will read package.json and download the necessary packages (express, sqlite3, etc.).

Bash

npm install
Start the Server: Once the installation is complete, start the application by running:

Bash

node server.js
You should see the messages "Connected to the FlyHigh database." and "Server is running on https://www.google.com/search?q=http://localhost:3000" in your terminal. This command also automatically creates the flyhigh.db database file.

View the Application: Open your web browser (like Chrome or Firefox) and navigate to:
http://localhost:3000

Testing the Application
Sign Up: Create a new user account.

Customer Login: Log in using the default customer credentials:

Email: priya.sharma@example.com

Password: priya123

Admin Login: Log in using the default admin credentials:

Email: admin@flyhigh.com

Password: admin123
