Bitespeed Identity Reconciliation Backend
This project implements the Bitespeed Backend Task for identity reconciliation. It is a Node.js/Express application using Sequelize ORM and MySQL. The service exposes a /identify endpoint to manage and consolidate customer identities based on email and phone number.

Features
POST /identify endpoint for identity reconciliation

SQL database integration (MySQL, via Sequelize)

Handles merging of customer records using email and/or phone number

Returns consolidated contact information according to assignment requirements

Easy to run locally or deploy

Tech Stack
-->Node.js
-->Express.js
-->Sequelize ORM
-->MySQL (can be adapted for PostgreSQL)
-->dotenv for environment variable management

Getting Started
1. Clone the Repository
git clone https://github.com/yourusername/bitespeed-backend.git
cd bitespeed-backend

2. Install Dependencies
npm install

3. Configure Environment Variables
Create a .env file in the project root (see .env.example):

DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=bitespeed_db
DB_DIALECT=mysql

4. Create the Database
Log into MySQL and run:
CREATE DATABASE bitespeed_db;

5. Start the Server
node app.js
The server will run at http://localhost:3000.
![1](https://github.com/user-attachments/assets/640c1da5-ad0b-4bd6-b762-14d947a88f82)
![2](https://github.com/user-attachments/assets/67634609-4d1e-49bd-8b3e-154a1795e348)
![3](https://github.com/user-attachments/assets/801f1dc7-927a-478f-af12-73107884b498)
![4](https://github.com/user-attachments/assets/75009a02-8c67-478c-b658-3fd6ae5e93a5)
![5](https://github.com/user-attachments/assets/15b8d6c7-e79b-4528-9cb8-a29918effb65)

