#!/usr/bin/env node
const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// --------------------- Utilitaires ---------------------
function createDirIfNotExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
		console.log(`Dossier créé : ${dirPath}`);
	} else {
		console.log(`Le dossier existe déjà : ${dirPath}`);
	}
}

function writeFileIfNotExists(filePath, content) {
	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, content.trimStart());
		console.log(`Fichier créé : ${filePath}`);
	} else {
		console.log(`Fichier déjà existant : ${filePath}`);
	}
}

function createDirs(baseDir, dirs) {
	dirs.forEach((dir) => createDirIfNotExists(path.join(baseDir, dir)));
}

// --------------------- Contenus Frontend ---------------------
const gitignoreContent = `
node_modules
.env
dist
`;

const frontendEnvContent = `
# Variables d'environnement frontend
VITE_API_URL=http://localhost:5000
VITE_API_URL_PROD=https://tempoback-3.onrender.com
`;

const frontendReadmeContent = `
# Frontend React avec Vite
Structure frontend React avec Vite et dossiers organisés.
`;

const frontendIndexHtmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mon Projet React</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;

const frontendMainJsxContent = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
`;

const frontendAppJsxContent = `
import React from 'react';
import { Routes, Route } from 'react-router-dom';

function Home() { return <h2>Accueil</h2>; }
function About() { return <h2>À propos</h2>; }

function App() {
  return (
    <div>
      <h1>Bienvenue dans mon projet React ! 🚀</h1>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
`;

const frontendApiJsContent = `
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Dev
});

export const setProd = () => {
  API.defaults.baseURL = import.meta.env.VITE_API_URL_PROD;
};

export default API;
`;

// --------------------- Contenus Backend ---------------------
const backendEnvContent = `
# Variables d'environnement backend
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=password
FRONTEND_URL=http://localhost:5173
`;

const backendReadmeContent = `
# Backend
Serveur Express avec middlewares cors et morgan.
`;

const appJsContent = `
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/ProfileRoutes');
const activityRoutes = require('./routes/ActivityRoutes');

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/activities', activityRoutes);

module.exports = app;
`;

const serverJsContent = `
const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

// --------------------- Commande CLI ---------------------
program
	.command("create <projectName>")
	.description("Créer un projet React + Vite avec backend Express complet")
	.action((projectName) => {
		const targetDir = path.join(process.cwd(), projectName);
		createDirIfNotExists(targetDir);

		// ---------- FRONTEND ----------
		const frontendDir = path.join(targetDir, "frontend");
		createDirIfNotExists(frontendDir);
		console.log("Initialisation frontend avec Vite + React...");
		execSync("npm create vite@latest . -- --template react --force", {
			cwd: frontendDir,
			stdio: "inherit",
		});
		execSync("npm install", { cwd: frontendDir, stdio: "inherit" });
		execSync("npm install sass react-router-dom axios", {
			cwd: frontendDir,
			stdio: "inherit",
		});

		createDirIfNotExists(path.join(frontendDir, "public"));
		createDirIfNotExists(path.join(frontendDir, "public", "assets"));
		const frontendSrcDir = path.join(frontendDir, "src");
		createDirs(frontendSrcDir, [
			"assets",
			"components",
			"pages",
			"hooks",
			"styles",
			"animations",
		]);

		writeFileIfNotExists(
			path.join(frontendDir, ".gitignore"),
			gitignoreContent
		);
		writeFileIfNotExists(
			path.join(frontendDir, ".env"),
			frontendEnvContent
		);
		writeFileIfNotExists(
			path.join(frontendDir, "README.md"),
			frontendReadmeContent
		);
		writeFileIfNotExists(
			path.join(frontendDir, "public", "index.html"),
			frontendIndexHtmlContent
		);
		writeFileIfNotExists(
			path.join(frontendSrcDir, "main.jsx"),
			frontendMainJsxContent
		);
		writeFileIfNotExists(
			path.join(frontendSrcDir, "App.jsx"),
			frontendAppJsxContent
		);
		writeFileIfNotExists(
			path.join(frontendSrcDir, "api/index.js"),
			frontendApiJsContent
		);

		// ---------- BACKEND ----------
		const backendDir = path.join(targetDir, "backend");
		createDirIfNotExists(backendDir);
		const backendDirs = [
			"config",
			"controllers",
			"middleware",
			"models",
			"routes",
			"auth",
			"utils",
			"tests",
		];
		createDirs(backendDir, backendDirs);

		writeFileIfNotExists(
			path.join(backendDir, ".gitignore"),
			gitignoreContent
		);
		writeFileIfNotExists(path.join(backendDir, ".env"), backendEnvContent);
		writeFileIfNotExists(
			path.join(backendDir, "README.md"),
			backendReadmeContent
		);
		writeFileIfNotExists(path.join(backendDir, "app.js"), appJsContent);
		writeFileIfNotExists(
			path.join(backendDir, "server.js"),
			serverJsContent
		);

		console.log(`\nProjet "${projectName}" créé avec succès ! 🚀`);
	});

program.parse(process.argv);
