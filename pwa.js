/******************************************************************************/
/* Constants                                                                  */
/******************************************************************************/
const INSTALL_BUTTON = document.getElementById("install_button");
const RELOAD_BUTTON = document.getElementById("reload_button");
const RECHERCHE = document.getElementById("recherche");
const EXO_INPUT = document.getElementById("exerce");
const RESULT = document.getElementById("resultats");
const TEST_API_BUTTON = document.getElementById("test_api");
const HISTO = document.getElementById("historique");
const PROGRAMME = document.getElementById("programme");
const BTN_CREE = document.getElementById("btn-cree");
const BTN_AFFICHE = document.getElementById("btn-affiche");
const AVANT = document.getElementById("avant");
const APRES = document.getElementById("apres");
const VILLE = document.getElementById("ville");
const RECHERCHEVILLE = document.getElementById("chercheville");

const NOMMOIS = ["janvier", "février", "mars", "avril", "mai", "juin","juillet", "août", "septembre", "octobre", "novembre", "décembre"]; // nom des mois rentrer en dur
const UPMONTH = "upmonth"; // constante mois d'après
const DOWNMONTH = "downmonth"; // constante mois d'avant 

/******************************************************************************/
/* Listeners                                                                  */
/******************************************************************************/

INSTALL_BUTTON.addEventListener("click", installPwa);
RELOAD_BUTTON.addEventListener("click", reloadPwa);

/***********************************************************************/
// Test si le bouton exite dans la page et ensuite si l'action clique est fait cela l'envoie à la fonction demander par le user
/***********************************************************************/
if (RECHERCHEVILLE){
  RECHERCHEVILLE.addEventListener("click", listesalle);
}
if (RECHERCHE) {
  RECHERCHE.addEventListener("click", listeexo);
}

if (TEST_API_BUTTON) {
  TEST_API_BUTTON.addEventListener("click", testApiExercises);
}

/******************************************************************************/
/* Global Variable                                                            */
/******************************************************************************/

let beforeInstallPromptEvent;

/******************************************************************************/
/* Main                                                                       */
/******************************************************************************/

main();// appelle principale de la fonction 

function main()
{
	console.debug("main()");
  registerServiceWorker();

	if(window.matchMedia("(display-mode: standalone)").matches)
	{
		console.log("Running as PWA");

	}
	else
	{
		console.log("Running as Web page");

		window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
		window.addEventListener("appinstalled", onAppInstalled);
	}
}

/******************************************************************************/
/* Install PWA                                                                */
/******************************************************************************/

function onBeforeInstallPrompt(event)
{
	console.debug("onBeforeInstallPrompt()");

	event.preventDefault();
	INSTALL_BUTTON.disabled = false;
	beforeInstallPromptEvent = event;
}

/**************************************/

async function installPwa()
{
	console.debug("installPwa()");

	
	if (!beforeInstallPromptEvent) {
		console.warn("Installation indisponible : beforeinstallprompt non reçu.");
		return;
	}

	
	beforeInstallPromptEvent.prompt();
	const CHOICE = await beforeInstallPromptEvent.userChoice;

	switch(CHOICE?.outcome)
	{
		case "accepted": console.log("PWA Install accepted"); break;
		case "dismissed": console.log("PWA Install dismissed"); break;
		default: console.log("PWA Install result:", CHOICE); break;
	}
// affiche le prompt d'installation 
	beforeInstallPromptEvent = null;
	if (INSTALL_BUTTON) INSTALL_BUTTON.disabled = true;
	window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
}
/**************************************/

function onAppInstalled()
{
	console.debug("onAppInstalled()");

	registerServiceWorker();
}

/******************************************************************************/
/* Register Service Worker                                                    */
/******************************************************************************/

async function registerServiceWorker()
{
	console.debug("registerServiceWorker()");

	if("serviceWorker" in navigator)
	{
		console.log("Register Service Worker…");

		try
		{
			const REGISTRATION = await navigator.serviceWorker.register("./service_worker.js");
			REGISTRATION.onupdatefound = onUpdateFound;

			console.log("Service Worker registration successful with scope:", REGISTRATION.scope);
		}
		catch(error)
		{
			console.error("Service Worker registration failed:", error);
		}
	}
	else
	{
		console.warn("Service Worker not supported…");
	}
}

/******************************************************************************/
/* Update Service Worker                                                    */
/******************************************************************************/

function onUpdateFound(event)
{
	console.debug("onUpdateFound()");

	const REGISTRATION = event.target;
	const SERVICE_WORKER = REGISTRATION.installing;
	SERVICE_WORKER.addEventListener("statechange", onStateChange);
}

/**************************************/

function onStateChange(event)
{
	const SERVICE_WORKER = event.target;

	console.debug("onStateChange", SERVICE_WORKER.state);

	if(SERVICE_WORKER.state == "installed" && navigator.serviceWorker.controller)
	{
		console.log("PWA Updated");
		RELOAD_BUTTON.disabled = false;
	}
}

/**************************************/

function reloadPwa()
{
	console.debug("reloadPwa()");

	window.location.reload();
}

 /*************** HISTORIQUE ****************/
let historySearch = loadHistory(); // récupération de l'historique de recherche sous forme de tableau

// exercice par jour
let jourSelectionne = null; // Le jour sélectionné vaut null
let exercicesParJour = chargerExercicesParJour(); // contient les exercices de chaque jours, pour l'instant il vaut null

function saveHistory() {
  localStorage.setItem("history", JSON.stringify(historySearch)); // transforme le tableau en text JSON, stock la donnée 
}

function loadHistory() {
  const SAVED = localStorage.getItem("history");// on lie clé history qui va contenir : les parties du corps ex : chest, back ect... 
  if (SAVED === null) {
    return [];  // on retourne un tableau vide 
  }
  return JSON.parse(SAVED); // convertit en text
}

function sauvegarderExercicesParJour() { // je recup la clé exercicesparjour
    localStorage.setItem("exercicesParJour", JSON.stringify(exercicesParJour));// si je trouve une recheche je parse en json sinon j'envoie le tableau vide
}

function chargerExercicesParJour() {
    const SAVED2 = localStorage.getItem("exercicesParJour");// on lie clé history qui va contenir : les parties du corps ex : chest, back ect... 
  if (SAVED2 === null) {
    return [];  // on retourne un tableau vide 
  }
  return JSON.parse(SAVED2); // convertit en text
}



 /*************** EXERCICE ****************/
async function getExercises(url) { // fonction get pour exercice
  try {
    const RESPONSE = await fetch(url, {
      method: "GET", // requête http GET
      headers: {
        "X-RapidAPI-Key": "58d6fe6fcbmshb7dde4d9a431fd3p12df26jsn755448a8c9b5",
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
      }
    });

    console.log("Requête terminée et réponse prête");

    if (!RESPONSE.ok) { // si requête code 400, on envoie une erreur 
      throw new Error("Erreur HTTP : " + RESPONSE.status);
    }
    // convertir la réponse en json 
    const DATA = await RESPONSE.json();
    console.log("Traitement local de la réponse");
    console.log(DATA);//affiche dans la console les données au format json
    afficheexo(DATA); // appel de la fonction afficheexo avec en paramètre DATA
  } catch (error) {
    console.error("Erreur lors de la requête :", error);
    RESULT.textContent = "Erreur : " + error; // affiche dans le html une erreur et son code ex:404
  }
}

function listeexo() { // envoie une requête avec la partie du corps entrer dans le input
	const BODYPART = EXO_INPUT.value.trim().toLocaleLowerCase(); // formate le texte entrer dans le input en le mettant en minuscule, et en enlevant les espaces
    if (historySearch[historySearch.length - 1] !== BODYPART) {
        historySearch.push(BODYPART); // on met dans le tableau historySearch la partie du corp, qu'on a rentrer dans le input
        // on garde seulement les 10 dernière recherche 
        if (historySearch.length > 10) { // si historySearch > 10 alors 
            historySearch.shift();// eneleve le premier élément du tableau history 
        }
        saveHistory(); // sauvegarde dans le local storage
        afficheHistorique(); // met à jours l'affichage de l'historique 
    }
    // appel de l'api exercicedb
    const url = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${BODYPART}`;
    getExercises(url); // appel de la fonction getExercices avec comme paramètre l'url avec la partie du corps rentré dans le input, vue que c'est une fonction await le code continue de s'exécuter en attendant la requête envoyer
}

function afficheexo(data) { // Affiche dans la page html le résultat de l'api avec les exo
	console.log(data);
	let str = "";
	str += "<ul>";
	for (const EX of data) { // parcours le tableau des datas avec la constante EX
		str += "<li>";
		str += "<strong>" + EX.name + "</strong>"+"<br>";
		str += `<button type="button" onclick="toggleDesc(this)"> Plus d'informations</button>`
		str += `<div style="display:none; margin-top:4px;">`
		str += "Partie du corps :"+EX.bodyPart + "<br>";
		str += "<strong>"+"Description"+"</strong>"+"<br>";
		str += "<ol>" + EX.description + "</ol>"+"<br>";
		str += "</div>";
		str += "</li>";
	}
	str += "</ul>";

	RESULT.innerHTML = str; // affiche dans la page html dans la div "résultats"
}
function toggleDesc(button) { // affiche et cache le bloque de description d'un exo 
    const DESC = button.nextElementSibling; // le <div> juste après le bouton
    if (!DESC) return;
    DESC.style.display = (DESC.style.display === "none" || DESC.style.display === "")
        ? "block" // si caché on affiche
        : "none"; // sinon on re cache
}

function afficheHistorique() { //affiche de l'historique sous forme de liste cliquable
    if (!HISTO) return; // si la zone n'existe pas on fait rien et on sort 
    if (historySearch.length === 0) { // si aucun historique on vide et on sort 
        HISTO.innerHTML = "";
        return;
    }

    let str = "<p><strong>Historique des recherches :</strong></p><ul>";
    for (const item of historySearch.slice().reverse()) { // on inverse le résultat plus récent en haut et plus ancien en bas
        // clic sur un élément pour relancer la recherche
        str += `<li><button type="button" onclick="relancerRecherche('${item}')">${item}</button></li>`; // on relance la recherche à chaque fois qu'on clique dessus
    }
    str += "</ul>";
    HISTO.innerHTML = str;
}

function relancerRecherche(term) { // on remet dans le champ des recherches une partie du corp qu'on à dans l'historique et ça relance la recheche
    EXO_INPUT.value = term;
    listeexo();
}
/**********************************************/
// TEST DE L'API (pas à prendre en compte)
/**********************************************/
function testApiExercises() {
	fetch("https://exercisedb.p.rapidapi.com/exercises", {
		method: "GET",
		headers: {
			"X-RapidAPI-Key": "58d6fe6fcbmshb7dde4d9a431fd3p12df26jsn755448a8c9b5",
			"X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
		}
	})
	.then(function (res) {
		if (!res.ok) {
			throw new Error("Erreur HTTP : " + res.status);
		}
		return res.json();
	})
	.then(function (data) {
		console.log("Données ExerciseDB (test) :", data); // on vérifie que l'api répond bien 
	})
	.catch(function (err) {
		console.error("Erreur API ExerciseDB (test) :", err);
	});
}
afficheHistorique();


// Planning "tout fait" 5 jours, rentrer en dur
let PROGRAMME_CREE = [
  { jour: "Jour 1", muscle: "chest",      label: "Pectoraux" },
  { jour: "Jour 2", muscle: "upper arms", label: "Triceps / Biceps" },
  { jour: "Jour 3", muscle: "shoulders",  label: "Épaules" },
  { jour: "Jour 4", muscle: "waist",      label: "Abdos " },
  { jour: "Jour 5", muscle: "upper legs", label: "Jambes" }
];

/***************************/
// EXEMPLE DE PROGRAMME TOUT FAIT
/***************************/
const PROGRAMME_1 = [
  "Jour 1 : Pectoraux, Triceps",
  "Jour 2 : Dos, Biceps",
  "Jour 3 : Épaules, Abdos",
  "Jour 4 : Cardio",
  "Jour 5 : Jambes"
];

const PROGRAMME_2 = [
  "Jour 1 : Dos, Biceps",
  "Jour 2 : Pectoraux, Triceps",
  "Jour 3 : Jambes",
  "Jour 4 : Épaules, Abdos",
  "Jour 5 : Cardio"
];

// Bouton qui permet de crée son programme sur 5 jours avec des suggestion d'exos
if (BTN_CREE && PROGRAMME) { // vérifie que les 2 constantes existent pour exec le code
  BTN_CREE.addEventListener("click", function () { // ajoute un écouteur d'évènement sur ce bouton et la fonction exécute ensuite le code à l'intérieur
    let html = "<h3>Mon programme sur 5 jours</h3><ul>"; // affiche dans le html le programme sur 5 jours 

    for (let i = 0; i < PROGRAMME_CREE.length; i++) { // boucle for pour liste les exos du programme
      let jourinfo = PROGRAMME_CREE[i]; // jourinfo prend comme valeur chaque exo
      html += "<li>";
      html += "<strong>" + jourinfo.jour + " :</strong> " + jourinfo.label + "<br>"; // ajout des info sur le jours et les parties à travailler dans la balise html

      html += "<button type=\"button\" onclick=\"proposerExosPourJour('" + jourinfo.muscle + "', this)\">Proposer des exercices</button>"; // bouton qui permet de proposer des exercices en fonctions des jours

      html += "<div class=\"exos-jour\" style=\"margin-top:4px;\"></div>";

      html += "</li>";
    }

    html += "</ul>";
    PROGRAMME.innerHTML = html;
  });
}

// permet d'afficher quand on clique sur voir le programme proposé
if (BTN_AFFICHE && PROGRAMME) {
  BTN_AFFICHE.addEventListener("click", function () { // met un eventlistener et si clique, le code de la fonction est exécuter
    let html = "<h3>Programmes proposés</h3>";

    html += "<h4>Programme 1</h4><ul>"; // affichage du programme 1
    for (let i = 0; i < PROGRAMME_1.length; i++) {
      html += "<li>" + PROGRAMME_1[i] + "</li>";
    }
    html += "</ul>";

    html += "<h4>Programme 2</h4><ul>";// affichage du programme 2
    for (let j = 0; j < PROGRAMME_2.length; j++) {
      html += "<li>" + PROGRAMME_2[j] + "</li>";
    }
    html += "</ul>";

    PROGRAMME.innerHTML = html;
  });
}

// fonction pour exo proposer
function proposerExosPourJour(bodyPart, bouton) {
  let li = bouton.parentElement;
  let conteneur = li.querySelector(".exos-jour"); // div où on affichera les exos
  if (!conteneur) return;

  conteneur.innerHTML = "Chargement des exercices pour " + bodyPart + "…";
/*************************/
// REQUETE A L'API
/*************************/
  let url = "https://exercisedb.p.rapidapi.com/exercises/bodyPart/" + bodyPart;

  fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "58d6fe6fcbmshb7dde4d9a431fd3p12df26jsn755448a8c9b5",
      "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
    }
  })
  .then(function (res) {
    if (!res.ok) {
      throw new Error("Erreur HTTP : " + res.status);
    }
    return res.json();
  })
  .then(function (data) {
    let html = "<ul>";
    for (let i = 0; i < data.length && i < 3; i++) { // on affiche seulement les 3 premiers exo reçu par l'api
      let ex = data[i];
      html += "<li><strong>" + ex.name + "</strong> (" + ex.bodyPart + ")</li>";
    }
    html += "</ul>";
    conteneur.innerHTML = html;
  })
  .catch(function (err) {
    console.error("Erreur API ExerciseDB :", err);
    conteneur.innerHTML = "Erreur lors du chargement des exercices.";
  });
}

/************************/

/************ CALENDRIER ************/
let date = new Date(); // date prend la date d'aujourd'hui 
// variable pour l'année, le mois, le jour
let year = date.getFullYear(); // année (2026)
let month = date.getMonth(); // mois actuel
let day = date.getDate();// jours du mois

function CALENDRIER_REDUC(action) {
    switch (action) { 
      case UPMONTH:// si on clique sur la flèche de droite 
          if (month < 11) { // si on est en dessous du mois 11 donc décembre on augmente le mois 
              month++; // passe au mois suivant
          } else {
              year++; // on augment de 1 l'année
              month = 0; // on réinitialise à 0 le mois 
          }
          break;

      case DOWNMONTH: // si on clique sur la flèche de gauche 
        if (month > 0) { // si on est pas encore en janvier car le mois de janvier est 0
            month--; // on décrémente de 1 au mois 
        } else {
            year--; // sinon on réduit l'année ex : 2026 --> 2025
            month = 11; // et le mois commence à 11 c'est à dire décembre
        }
        break;

      default:
          break;
    }
    calendrier(year, month); // génère le calendirer avec la bonne date 
}

if (AVANT) { // si on clique sur la flèche de gauche on réduit d'un mois 
    AVANT.onclick = function () {
        CALENDRIER_REDUC(DOWNMONTH);
    };
}

if (APRES) { // si on clique sur la flèche de droite on augmente d'un mois 
    APRES.onclick = function () {
        CALENDRIER_REDUC(UPMONTH);
    };
}
/************* CALCULE / CALENDRIER *************/
function calendrier(y, m) {
    const MONTHNB = m + 12 * (y - 2020); // nb de mois écouler depuis janvier 2025, c'est un repère pour le reste du calendrier on part de ce point 

    let cld = [{ dayStart: 2, length: 31, year: 2020, month: "janvier" }]; // initialisation du calendrier

    for (let i = 0; i < MONTHNB; i++) {
        let yearSimule = 2020 + Math.floor(i / 12); // ajoute à 2020, le nombre de mois écouler, même si l'année est pas complète 

        const MONTHSIMULELONGUEUR = [31, getFevrierlength(yearSimule), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // numéro de chaque fin de mois et calcule de février en divisant / 4 si année bissextile

        let monthSimuleIndex = (i + 1) - (yearSimule - 2020) * 12; // index du mois 

        cld[i+1] = { // calcul les info du mois suivant
            dayStart: (cld[i].dayStart + MONTHSIMULELONGUEUR[monthSimuleIndex - 1]) % 7, // détermine le jour de la semaine où commence le nouveau mois,  et additionne le jour de départ du mois précedent à la longueur du mois précédent, ensuite modulo %7 pour les jours de la semaine
            length: MONTHSIMULELONGUEUR[monthSimuleIndex], // met le nombre de jours dans le mois
            year: 2020 + Math.floor((i + 1) / 12), // calcule du mois +1
            month: NOMMOIS[monthSimuleIndex] // récupère le nom du mois 
        };

        // si le mois +1 est undefined
        if (cld[i+1].month === undefined) {
            cld[i+1].month = "janvier";
            cld[i+1].length = 31;
        }
    }

    let current = cld[cld.length - 1]; // info du mois demander

    // titre mois/année
    const TITRE = document.getElementById("titre-mois");
    if (TITRE) {
        TITRE.innerHTML = NOMMOIS[m] + " " + y;
    }

    // conteneur calendrier
    const CONTAINER = document.getElementById("calendrier");
    if (!CONTAINER) {
        console.error("Aucun élément avec id='calendrier'");
        return;
    }
    CONTAINER.innerHTML = ""; // on vide le contenu du mois précédent


let totalCases = 6 * 7; // création du tableau avec 6 cerreau vertical et 7 horizontale
for (let i = 0; i < totalCases; i++) {
    const DIV = document.createElement("div"); // création de la div case pour le calendrier
    DIV.className = "case"; // DIV à la classe "case"
    CONTAINER.appendChild(DIV); // ajoute une div enfant en dessous de la div créer au dessus 
}

const CASES = CONTAINER.getElementsByClassName("case");

// remplissage des cases
for (let i = 1; i <= current.length; i++) {
    const INDEX = i - 1 + current.dayStart; // position de la case pour le jour 1 (mardi, mercredi...)
    if (INDEX >= 0 && INDEX < CASES.length) { // si index est supérieur à 0 mais inférieur au nombre de case 
        const JOUR = i; 
        CASES[INDEX].innerHTML = JOUR; // écrit le numéro du jour
        
        // clé unique pour ce jour exemple 2026-11-7 
        const CLEJOUR = y + "-" + m + "-" + JOUR;
        
        
        if (exercicesParJour[CLEJOUR] && exercicesParJour[CLEJOUR].length > 0) { // si la case comporte un exercice
            CASES[INDEX].style.backgroundColor = "#cc0000"; // la case devient rouge 
            CASES[INDEX].style.fontWeight = "bold"; // apparait en gras
        }
        
        
        CASES[INDEX].addEventListener("click", function () { // permet que si on clique sur une case cela séléctionne le jour clique et ouvre le menu pour ajouter un exo 
            selectionnerJour(y, m, JOUR, CASES[INDEX]);
        });
    }
}
}

function getFevrierlength(y) {
    if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) { // savoir si c'est une année bisextile
        return 29;
    }
    return 28;
}


/********* Remplissage Calendrier **********/



function selectionnerJour(annee, mois, jour, caseElement) {
    jourSelectionne = {
        annee: annee, // selectionne l'année 
        mois: mois, // selectionne le mois, si Janvier, mois = 0 et décembre, mois = 11
        jour: jour, // selectionne le jour 
        cle: annee + "-" + mois + "-" + jour // les ajoutes à la suite pour que ça sorte ex : 2026-2-7
    };
    
    console.log("Jour sélectionné :", jourSelectionne.cle); // Affiche dans la console 
    console.log(caseElement)
    // Afficher un menu pour gérer les exercices de ce jour
    afficherMenuJour(caseElement); // appelle de la fonction avec en paramètre caseElement qui contient la <div class="case">jour séléctionner</div>
}


function afficherMenuJour(caseElement) {// supprime si y'a un menu ourvert pour éviter d'avoir plusieurs pop-up
    const MENUEXISTANT = document.getElementById("menu-jour-popup");
    if (MENUEXISTANT) {
        MENUEXISTANT.remove();
    }
    
   // création d'un pop up 
    const MENU = document.createElement("div"); //créer un élément, div
    MENU.id = "menu-jour-popup"; // cette div prend l'id menu-jour-popup
    MENU.className = "menu-jour-popup"; // et la class menu-jour-popup

    // construction du pop up 
    let html = "<div class='menu-jour-headrer'>"; // ajout d'une div class="menu-jour-header"
    html += "<h3> " + jourSelectionne.jour + " " + NOMMOIS[jourSelectionne.mois] + " " + jourSelectionne.annee + "</h3>"; // titre avec le jour, le mois et l'année séléctionner
    html += "<button class='btn-fermer-menu' onclick='fermerMenuJour()'>✖ Fermer</button>"; // permet de fermer le pop up
    html += "</div>";
    
    // affiche les exercices déjà ajoutés
    const EXERCICEDUJOUR = exercicesParJour[jourSelectionne.cle] || []; // ajout de si y'a un exercice déjà ou rien 
    if (EXERCICEDUJOUR.length > 0) {
        html += "<h4 class='titre-exercices-programmes'> Exercices programmés :</h4><ul class='liste-exercices-jour'>"; // titre du pop quand on clique sur un jour avec exo 
        for (let i = 0; i < EXERCICEDUJOUR.length; i++) { // création d'un bouton pour supprimer l'exercice 
            html += "<li class='exercice-jour-item'>";
            html += "<strong>" + EXERCICEDUJOUR[i].name + "</strong> <span class='exercice-bodypart'>(" + EXERCICEDUJOUR[i].bodyPart + ")</span>";
            html += " <button class='retire-exo' onclick='retirerExercice(" + i + ")'>✖</button>";
            html += "</li>";
        }
        html += "</ul>";
    } else {
        html += "<p class='aucun-exo-jour'>Aucun exercice pour ce jour.</p>"; // si aucun exo enregister du jour selectionner
    }
    
    // ajout d'un exercice ou plusieurs
    html += "<hr class='separateur-menu' ><h4 class='ajout-exo'> Ajouter des exercices :</h4>";
    html += "<div class='recherche-exo'>";
    html += "<input class='type-de-muscle' type='text' id='muscle-recherche' placeholder='Ex: chest, legs, back...' >";
    html += "<button onclick='rechercherExercicesPourJour()'>Rechercher</button>";
    html += "</div>";
    html += "<div id='resultats-exercices-jour'></div>";
    
    MENU.innerHTML = html;
    
    // ajout un overlay sombre pour focus le pop up 
    const OVERLAY = document.createElement("div");
    OVERLAY.id = "overlay-menu-jour";
    OVERLAY.className="overlay-menu-jour";
    OVERLAY.onclick = fermerMenuJour; 
    
    document.body.appendChild(OVERLAY);
    document.body.appendChild(MENU);
}

// ferme le menu est enleve l'overlay
function fermerMenuJour() {
    const MENU_JOUR_POPUP = document.getElementById("menu-jour-popup");
    const OVERLAY_MENU_JOUR = document.getElementById("overlay-menu-jour");
    if (MENU_JOUR_POPUP){
      MENU_JOUR_POPUP.remove();
    } 
    if (OVERLAY_MENU_JOUR){
      OVERLAY_MENU_JOUR.remove();
    }
}

// recherche des exercices pour le jour sélectionné
function rechercherExercicesPourJour() {
    const INPUT_MUSCLE_RECHERCHE = document.getElementById("muscle-recherche");
    const MUSCLE = INPUT_MUSCLE_RECHERCHE.value.trim().toLowerCase();
    
    if (!MUSCLE) {
        alert("Entrez un muscle (ex: chest, legs, back)");
        return;
    }
    
    const RESULTATS_DIV = document.getElementById("resultats-exercices-jour");
    
    const URL = "https://exercisedb.p.rapidapi.com/exercises/bodyPart/" + MUSCLE;
    
    fetch(URL, {
        method: "GET",
        headers: {
            "X-RapidAPI-Key": "58d6fe6fcbmshb7dde4d9a431fd3p12df26jsn755448a8c9b5",
            "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
        }
    })
    .then(function(RES) {
        if (!RES.ok) throw new Error("Erreur API");
        return RES.json();
    })
    .then(function(DATA) {
        afficherResultatsExercices(DATA);
    })
    .catch(function(ERR) {
        console.error(ERR);
        RESULTATS_DIV.innerHTML = " Erreur lors de la recherche";
    });
}


function afficherResultatsExercices(EXERCICES) { //affiche les exercices trouver avec la recherche dans le pop up 
    const RESULTATS_DIV = document.getElementById("resultats-exercices-jour");
    
    if (!EXERCICES || EXERCICES.length === 0) {
        RESULTATS_DIV.innerHTML = "Aucun exercice trouvé.";
        return;
    }
    
    let HTML = "<ul>";
    for (let I = 0; I < Math.min(EXERCICES.length, 5); I++) { // affiche seulement les 5 premiers exercices
        const EX = EXERCICES[I];
        HTML += "<li>";
        HTML += "<strong>" + EX.name + "</strong> (" + EX.bodyPart + ") ";
        HTML += "<button onclick='ajouterExerciceAuJour(" + 
                JSON.stringify(EX).replace(/"/g, "&quot;") + 
                ")'>✚ Ajouter</button>";
        HTML += "</li>";
    }
    HTML += "</ul>";
    
    RESULTATS_DIV.innerHTML = HTML;
}

//ajoute un exercice au jour séléctionner
function ajouterExerciceAuJour(EXERCICE) {
    if (!jourSelectionne) {
        alert("Sélectionnez d'abord un jour dans le calendrier");
        return;
    }
    
    // si aucun tableau existe pour ce jour on le crée 
    if (!exercicesParJour[jourSelectionne.cle]) {
        exercicesParJour[jourSelectionne.cle] = [];
    }
    
    // on ajoute le nom, la party du corp et l'équipement
    exercicesParJour[jourSelectionne.cle].push({
        name: EXERCICE.name,
        bodyPart: EXERCICE.bodyPart,
        equipment: EXERCICE.equipment
    });
    
    // stocker en localStorage
    sauvegarderExercicesParJour();
    
    // mise à jour de la coloration des cases
    calendrier(jourSelectionne.annee, jourSelectionne.mois);
    
    // reload du menu
    const CASE_ELEMENT = document.querySelector(".case");
    afficherMenuJour(CASE_ELEMENT);
    
    console.log("Exercice ajouté :", EXERCICE.name);
}

function retirerExercice(INDEX) {// retire un exercice
    if (!jourSelectionne){
        return;
      }
    exercicesParJour[jourSelectionne.cle].splice(INDEX, 1); // supprime l'exercice à l'index dans le tableau au niveau du jour séléctionner
    
    
    if (exercicesParJour[jourSelectionne.cle].length === 0) { // si plus aucun jour on supprime la clé, et ça enlève tout 
        delete exercicesParJour[jourSelectionne.cle];
    }
    
    sauvegarderExercicesParJour(); // sauvegarde du calendrier
    calendrier(jourSelectionne.annee, jourSelectionne.mois);
    
    // re affiche le menu
    const CASE_ELEMENT = document.querySelector(".case");
    afficherMenuJour(CASE_ELEMENT);
}


/*********** FIN ***********/

/************* FONCTION GET **********/
async function get(url, options) {
  try {
    let response = await fetch(url, options);// lancement de la requête http
    console.log("Requête terminée et réponse prête");

    if (!response.ok) { // si répond 400, 500
      throw new Error("Erreur HTTP : " + response.status); // erreur + code de l'erreur 
    }

    let data = await response.json(); // on convertit la data en json
    console.log("Traitement local de la réponse");
    console.log(data);

    return data; // on retourn les données
  } catch (error) {
    console.error("Erreur lors de la requête :", error);
    throw error; // on renvoie l'erreur
  }
}

/************ RECHERCHE SALLE **************/
async function listesalle() {
  let ville = VILLE.value.trim(); // permet d'enlever les espaces 
  try {
    let geoData = await get( 
      "https://nominatim.openstreetmap.org/search?" +
      new URLSearchParams({ // crée automatiquement l'url en l'encodant
        q: ville, //q prend la valeur de la ville par exemple
        format: "json", // renvoyer au format
        limit: 1 // 1 seul résultat
      }),
      { method: "GET" } // méthode d'envoie 
    );

    if (!geoData || geoData.length === 0) {
      console.warn("Ville non trouvée :", ville); // affiche un message en jaune dans la console 
      return; // permet de sortir de la fonction
    }

    let lat = parseFloat(geoData[0].lat); // coordonnées latitude
    let lon = parseFloat(geoData[0].lon); // coordonnées longitude
    console.log("Ville géocodée :", ville, lat, lon); 

    // centre la map sur la ville tapée
    if (map) {
      map.setView([lat, lon], 13);
    }

    // recherche de salle 
    let url = "https://equipements.sports.gouv.fr/api/records/1.0/search/?" +
      new URLSearchParams({
        dataset: "data-es", // recherche les équipements de sports
        rows: 20, // affiche maximum 20 salles
        q: "fitness", //q prend la valeur de fitness et le recherche comme mot clé
        "geofilter.distance": lat + "," + lon + ",5000" // permet d'avoir un rayon de 5km pour afficher les salles que comporte la ville dans un rayon de 5km
      });

    await getEquipements(url); // envoie cette url à la fonction getEquipements qui va permettre d'afficher les salles
  } catch (e) {
    console.error("Erreur dans listesalle() :", e);
  }
}

// affichage des markers des salles
async function getEquipements(url) {
  try {
    console.log("URL appelée :", url);

    let data = await get(url); //récupère les données plus haut avec dedans la ville, le format et le nb de résultat

    if (!data.records) { // si aucune salle trouvé 
      console.warn("Pas de records dans la réponse."); // affiche en jaune aucune salle trouver donc tableau car pas de salle
      return; 
    }

    data.records.forEach(function (rec) { // pour chaque salle trouvé 
      let f = rec.fields; // f contient tout les info qui ce trouve dans fields ex: aca_nom, aps_name, dep_nom, dep_code...
      console.log("on affiche f", f);
      let coords = f.equip_coordonnees; // affiche les coordonnées de chaque salle 
      console.log("on affiche coords",coords); // affiche les coordonnées
      console.log("nom de l'enseigne", f.inst_nom); // affiche le nom de l'enseigne

      if (map && coords && coords.length === 2) { // si la map existe et que les coordonnées existe et que la longueur du tableau vaut 2 c'est à dire longitude + latitude 
        let latSalle = coords[0];// latitude pour chaque salle trouver
        console.log("latitude de la salle", latSalle);
        let lonSalle = coords[1];// longitude pour chaque salle trouver
        console.log("longitude de la salle", lonSalle);
        if (L != undefined) { // si L (objet princiapl) est différent de undefined alors 
          L.marker([latSalle, lonSalle]) // on place un marker au niveau de la longitude et de latitude
            .addTo(map) // ajoute le marker sur la page 
            .bindPopup(f.inst_nom ); // pop up 
        }
      }
    });
  } catch (error) {
    console.error("Erreur dans getEquipements() :", error); // affichage de l'erreur 
  }
}


let map = null; // map prend la valeur nul 
document.addEventListener("DOMContentLoaded", function () {
  if (L != undefined) { // vérifie si la variable gloable L est différente de undefined
    map = L.map("laMap"); // crée la carte dans la div "la"
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map); // fond de carte crée et ajouter à la map 

    /*********** GEOLOCALISATION *************/
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        const CRD = pos.coords; // prendre les coordonnées de ma position
        console.log("affiche du CDR", CRD); // affichage CDR
  
        if (CRD) {
          console.log("Latitude :", CRD.latitude);
          console.log("Longitude :", CRD.longitude);
          console.log("Précision :", CRD.accuracy, "m");
  
          map.setView([CRD.latitude, CRD.longitude], 16); // centre avec zoom 16
          L.marker([CRD.latitude, CRD.longitude]) // ajout d'un marker sur ma position
            .addTo(map) // ajoute dans la map 
            .bindPopup("Tu es ici") // pop up sur le point 
            .openPopup(); // ouvre automatiquement
        } else {
          console.warn("Impossible de lire les coordonnées."); // affiche en jaune un message d'erreur dans la console 
          map.setView([46.603354, 1.888334], 6);// centre sur la France si coordonnées sont pas trouvé, et en zoom x6
        }
      },
      function (err) { 
        if (err) {// si erreur de localisation
          console.warn("ERREUR (" + err.code + "): " + err.message); // code de l'erreur + message de l'erreur
        } else {
          console.warn("Erreur inconnue de géolocalisation.");
        }
        map.setView([46.603354, 1.888334], 6);// centre sur la France si coordonnées sont pas trouvé, et en zoom x6
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }
});