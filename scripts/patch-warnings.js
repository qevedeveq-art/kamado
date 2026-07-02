#!/usr/bin/env node
"use strict";

/*
 * Idempotent patcher that closes the 64 warnings emitted by
 * scripts/audit-kamado-expert.js against index.html.
 *
 * Three categories are addressed:
 *   1. "cuisson multi-température sans phases structurées" → insert a
 *      well-formed `phases:[{...}, {...}]` line before `source:`.
 *   2. "sucre/laque à feu vif sans consigne claire d'application en fin de
 *      cuisson" → append a late-glaze sentence to `astuce:` that contains
 *      a keyword from the auditor's regex (fin de cuisson / dernières
 *      minutes / brûle vite / caramélise vite / éviter la carbonisation).
 *   3. "volaille/canard: expliciter la référence sécurité 74 °C" → make
 *      sure `notes_securite:` contains a number ≥ 74.
 *
 * Running this script twice must leave index.html untouched on the second
 * pass. Detection uses simple markers ("phases:[", the sentinel substring
 * "fin de cuisson", the digit sequence "74").
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const HTML_PATH = path.join(ROOT, "index.html");

// ---------------------------------------------------------------------------
// Patch definitions
// ---------------------------------------------------------------------------

// Phase lines are hand-crafted per recipe from its mode/tempK/temps/coeur.
// Each phase MUST have: name (string), mode (string), temp_C (number),
// duration_min (number), action (string, ≤ 40 words).
const PHASES = {
  "Côte de bœuf reverse-sear":
    `phases:[{name:"Chauffe indirecte",mode:"indirect",temp_C:120,duration_min:50,action:"Pierre déflectrice. Sonde à cœur, monter doucement jusqu'à 48–50 °C."},{name:"Saisie directe",mode:"direct",temp_C:320,duration_min:8,action:"Braises vives, retirer la pierre. 60–90 s par face + tranches grasses jusqu'à 52–54 °C."}]`,
  "Tomahawk au beurre noisette":
    `phases:[{name:"Chauffe indirecte",mode:"indirect",temp_C:120,duration_min:45,action:"Pierre déflectrice. Sonde plantée à cœur jusqu'à 48–50 °C."},{name:"Saisie directe arrosée",mode:"direct",temp_C:320,duration_min:8,action:"Braises vives. 60–90 s par face + bandes grasses, arroser beurre/thym/ail jusqu'à 54 °C."}]`,
  "Tri-tip sauce Santa Maria":
    `phases:[{name:"Chauffe indirecte",mode:"indirect",temp_C:120,duration_min:40,action:"Pierre déflectrice. Sonde à cœur jusqu'à 48–50 °C."},{name:"Saisie directe",mode:"direct",temp_C:300,duration_min:8,action:"Braises vives. Toutes faces jusqu'à 54 °C. Trancher perpendiculaire aux deux directions de fibres."}]`,
  "Picanha entière façon churrasco":
    `phases:[{name:"Chauffe indirecte",mode:"indirect",temp_C:150,duration_min:45,action:"Pierre déflectrice. Gras vers le haut, sonde à cœur jusqu'à 48–50 °C."},{name:"Saisie directe",mode:"direct",temp_C:280,duration_min:10,action:"Braises vives. Saisir toutes faces, gras qui fond et laque jusqu'à 52–55 °C."}]`,
  "Tri-tip californien reverse sear":
    `phases:[{name:"Chauffe indirecte",mode:"indirect",temp_C:135,duration_min:40,action:"Pierre déflectrice + copeaux chêne. Sonde à cœur jusqu'à 48–50 °C."},{name:"Saisie directe",mode:"direct",temp_C:300,duration_min:8,action:"Braises vives. Toutes faces jusqu'à 54 °C, croûte marquée."}]`,
  "Bistecca alla Fiorentina (T-bone)":
    `phases:[{name:"Saisie directe",mode:"direct",temp_C:300,duration_min:9,action:"Braises très vives. 4–5 min par face pour croûte marquée, os côté flamme."},{name:"Finition indirecte",mode:"indirect",temp_C:120,duration_min:8,action:"Sur la tranche (os debout) pour finir le cœur à 48–52 °C (al sangue). Carryover +5 °C au repos."}]`,
  "Burgers smash maison":
    `phases:[{name:"Saisie smash",mode:"direct",temp_C:300,duration_min:3,action:"Plaque fonte incandescente. Écraser la boule à la spatule, croûte Maillard 90 s."},{name:"Retournement fromage",mode:"direct",temp_C:300,duration_min:2,action:"Décoller au triangle, retourner, fromage, cloche 60 s. Sortir à 70 °C à cœur."}]`,
  "Poitrine de porc croustillante":
    `phases:[{name:"Rendu du gras indirect",mode:"indirect",temp_C:150,duration_min:90,action:"Pierre déflectrice, couenne sèche vers le haut. Sonde à cœur jusqu'à 72 °C."},{name:"Croustillance directe",mode:"direct",temp_C:250,duration_min:20,action:"Retirer la pierre. Couenne côté feu, souffler jusqu'au pop-corn craquant. Cœur 75 °C."}]`,
  "Échine marinée à la bière":
    `phases:[{name:"Saisie directe",mode:"direct",temp_C:220,duration_min:6,action:"Grille directe, marquer chaque face 90 s pour la croûte Maillard."},{name:"Finition indirecte",mode:"indirect",temp_C:220,duration_min:13,action:"Décaler côté indirect. Sonde à 68 °C, la marinade continue à laquer sans brûler."}]`,
  "Côte de porc tomahawk saumurée":
    `phases:[{name:"Chauffe indirecte",mode:"indirect",temp_C:150,duration_min:40,action:"Pierre déflectrice. Sonde à cœur, cible 58–60 °C avant la saisie."},{name:"Saisie directe",mode:"direct",temp_C:260,duration_min:8,action:"Retirer la pierre. Toutes faces + os, jusqu'à 63–65 °C. Repos 3 min avant tranche."}]`,
  "Filet mignon farci chorizo-manchego":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:160,duration_min:30,action:"Pierre déflectrice. Filet ficelé sur grille, sonde à cœur jusqu'à 58 °C."},{name:"Saisie directe",mode:"direct",temp_C:240,duration_min:8,action:"Retirer la pierre. Colorer toutes faces 90 s. Sortir à 63 °C, repos 3 min."}]`,
  "Poulet crapaudine (spatchcock)":
    `phases:[{name:"Cuisson indirecte peau vers le haut",mode:"indirect",temp_C:190,duration_min:40,action:"Pierre déflectrice. Sonde plantée dans la cuisse jusqu'à 68–70 °C."},{name:"Croustillance directe",mode:"direct",temp_C:190,duration_min:10,action:"Retirer la pierre, peau côté feu. Colorer jusqu'à 74 °C à la cuisse, jus clair."}]`,
  "Cuisses de poulet marinées citron-thym":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:190,duration_min:30,action:"Pierre déflectrice, cuisses peau vers le haut. Sonde près de l'os jusqu'à 70 °C."},{name:"Croustillance directe",mode:"direct",temp_C:190,duration_min:8,action:"Peau côté feu pour dorer jusqu'à 74 °C. Attention aux flambées du jus."}]`,
  "Ailes de poulet Buffalo":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:190,duration_min:25,action:"Pierre déflectrice, ailes espacées, peau saupoudrée levure chimique. Sonde jusqu'à 70 °C."},{name:"Croustillance directe",mode:"direct",temp_C:190,duration_min:10,action:"Retirer la pierre. Retourner régulièrement jusqu'à 74 °C, croûte croustillante. Sauce hors feu."}]`,
  "Poulet peri-peri":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:190,duration_min:30,action:"Pierre déflectrice, crapaudiné peau vers le haut. Sonde cuisse jusqu'à 70 °C."},{name:"Croustillance directe",mode:"direct",temp_C:190,duration_min:15,action:"Retirer la pierre, peau côté feu. Badigeonner sauce peri-peri par couches jusqu'à 74 °C."}]`,
  "Cuisses de poulet teriyaki":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:190,duration_min:25,action:"Pierre déflectrice, peau vers le haut. Sonde près de l'os jusqu'à 74 °C, collagène qui fond."},{name:"Laquage direct",mode:"direct",temp_C:190,duration_min:10,action:"Retirer la pierre. Badigeonner teriyaki en 3 couches, laisser caraméliser jusqu'à 80 °C."}]`,
  "Poulet shawarma au kamado":
    `phases:[{name:"Saisie directe",mode:"direct",temp_C:220,duration_min:8,action:"Bloc de cuisses empilées sur pique. Colorer toutes faces pour la croûte épicée."},{name:"Cuisson indirecte",mode:"indirect",temp_C:220,duration_min:22,action:"Décaler indirect. Sonde au cœur du bloc jusqu'à 75 °C, trancher les couches externes au fur et à mesure."}]`,
  "Poulet jerk jamaïcain":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:180,duration_min:40,action:"Pierre déflectrice + bois de piment (allspice). Peau vers le haut jusqu'à 74 °C à la cuisse."},{name:"Croustillance directe",mode:"direct",temp_C:240,duration_min:10,action:"Retirer la pierre, peau côté feu. Colorer et caraméliser la marinade jusqu'à 78–80 °C."}]`,
  "Carré d'agneau en croûte d'herbes":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:180,duration_min:22,action:"Pierre déflectrice, os protégés par alu. Sonde à cœur jusqu'à 48 °C."},{name:"Saisie directe",mode:"direct",temp_C:260,duration_min:8,action:"Retirer la pierre. Colorer côté croûte d'herbes, jusqu'à 54 °C (rosé)."}]`,
  "Filet de chevreuil rôti, sauce grand veneur":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:160,duration_min:18,action:"Pierre déflectrice. Sonde à cœur jusqu'à 46 °C (pièce très maigre, marge étroite)."},{name:"Saisie directe",mode:"direct",temp_C:260,duration_min:7,action:"Retirer la pierre. Croûte toutes faces, sortir à 52–56 °C max. Repos obligatoire 5 min."}]`,
  "Pavé de cerf, sauce aux airelles":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:150,duration_min:20,action:"Pierre déflectrice. Sonde à cœur, monter doucement jusqu'à 46–48 °C."},{name:"Saisie directe",mode:"direct",temp_C:260,duration_min:6,action:"Retirer la pierre. Croûte rapide toutes faces jusqu'à 52–55 °C rosé."}]`,
  "Cailles rôties au raisin & lard":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:190,duration_min:22,action:"Pierre déflectrice. Cailles bardées de lard, poitrine vers le haut jusqu'à 65 °C à cœur."},{name:"Saisie directe",mode:"direct",temp_C:240,duration_min:6,action:"Retirer la pierre. Colorer le lard, ajouter les raisins pour éclater dans le jus jusqu'à 70 °C."}]`,
  "Filet de biche en croûte d'épices":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:150,duration_min:18,action:"Pierre déflectrice. Sonde à cœur, croûte café-cacao qui parfume, jusqu'à 46 °C."},{name:"Saisie directe",mode:"direct",temp_C:260,duration_min:6,action:"Retirer la pierre. Colorer 60 s par face jusqu'à 52–55 °C, croûte scellée."}]`,
  "Saumon laqué teriyaki":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:190,duration_min:10,action:"Pierre déflectrice, pavé peau côté grille. Sonde à cœur jusqu'à 46–48 °C."},{name:"Laquage direct",mode:"direct",temp_C:190,duration_min:4,action:"Retirer la pierre. Badigeonner teriyaki en 2 couches, caraméliser jusqu'à 50–54 °C nacré."}]`,
  "Salmon Tikka (pavé de saumon tandoori)":
    `phases:[{name:"Saisie directe",mode:"direct",temp_C:220,duration_min:3,action:"Grille très chaude, huilée. Marquer 90 s la face marinée pour croûte tandoori."},{name:"Cuisson indirecte",mode:"indirect",temp_C:220,duration_min:6,action:"Décaler indirect. Sonde à cœur jusqu'à 52 °C (mi-cuit) ou 63 °C (à point)."}]`,
  "Aubergines fumées façon baba ganoush":
    `phases:[{name:"Fumage direct sur braises",mode:"direct",temp_C:220,duration_min:15,action:"Aubergines entières posées directement sur les braises. Peau qui carbonise, chair qui fume."},{name:"Fondant indirect",mode:"indirect",temp_C:220,duration_min:20,action:"Décaler indirect, sonde bâton. Attendre chair totalement fondante, peau qui se détache."}]`,
  "Ratatouille fumée au kamado":
    `phases:[{name:"Marquage direct",mode:"direct",temp_C:200,duration_min:10,action:"Griller aubergines/courgettes/poivrons sur grille directe pour la note fumée."},{name:"Mijotage indirect",mode:"indirect",temp_C:200,duration_min:35,action:"Rassembler en cocotte fonte + tomates + oignons/ail. Couvercle entrouvert jusqu'à texture fondante."}]`,
  "Carottes glacées miso-miel":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:200,duration_min:25,action:"Pierre déflectrice, carottes en plat fonte avec bouillon+beurre. Cuire tendres."},{name:"Glaçage direct",mode:"direct",temp_C:200,duration_min:8,action:"Retirer la pierre. Ajouter miso-miel, laisser réduire en laque brillante sur les carottes."}]`,
  "Pain de campagne en cocotte":
    `phases:[{name:"Cuisson couverte",mode:"indirect",temp_C:230,duration_min:25,action:"Cocotte fonte préchauffée, pâte scarifiée. Couvercle fermé pour vapeur et croûte fine."},{name:"Dorure découverte",mode:"indirect",temp_C:210,duration_min:20,action:"Retirer le couvercle. Croûte qui dore, sonde à cœur jusqu'à 95 °C."}]`,
  "Ananas rôti au rhum et miel":
    `phases:[{name:"Marquage direct",mode:"direct",temp_C:220,duration_min:5,action:"Tranches d'ananas sur grille directe pour rayer et démarrer la caramélisation."},{name:"Rôtissage indirect",mode:"indirect",temp_C:220,duration_min:12,action:"Décaler indirect. Badigeonner rhum+miel, laisser réduire en sirop caramélisé."}]`,
  "Tarte Tatin au kamado":
    `phases:[{name:"Caramel direct",mode:"direct",temp_C:190,duration_min:10,action:"Poêle fonte, sucre+beurre+pommes directement sur braises jusqu'à caramel ambré."},{name:"Cuisson indirecte pâte",mode:"indirect",temp_C:190,duration_min:40,action:"Recouvrir de pâte, décaler indirect couvercle fermé jusqu'à pâte dorée et pommes fondantes."}]`,
  "Pêches rôties mascarpone":
    `phases:[{name:"Marquage direct",mode:"direct",temp_C:220,duration_min:3,action:"Pêches face coupée sur grille directe pour rayer et caraméliser le sucre naturel."},{name:"Rôtissage indirect",mode:"indirect",temp_C:220,duration_min:8,action:"Décaler indirect. Chair fondante mais tenue, servir tiède avec mascarpone froid."}]`,
  "Abricots rôtis romarin-amande":
    `phases:[{name:"Marquage direct",mode:"direct",temp_C:210,duration_min:3,action:"Abricots face coupée sur grille directe pour rayures et caramélisation express."},{name:"Rôtissage indirect",mode:"indirect",temp_C:210,duration_min:6,action:"Décaler indirect. Amandes qui dorent, romarin qui parfume, texture fondante sans s'écraser."}]`,
  "Char siu (porc laqué chinois)":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:160,duration_min:45,action:"Pierre déflectrice. Sonde à cœur jusqu'à 65 °C, laquer à mi-cuisson."},{name:"Caramélisation directe",mode:"direct",temp_C:160,duration_min:5,action:"Retirer la pierre. Bords laqués côté feu pour croûte laquée brillante jusqu'à 68 °C."}]`,
  "Poulet tandoori":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:200,duration_min:32,action:"Pierre déflectrice. Sonde cuisse jusqu'à 70 °C, la croûte tandoori sèche et parfume."},{name:"Croustillance directe",mode:"direct",temp_C:200,duration_min:8,action:"Retirer la pierre. Colorer les bords côté feu jusqu'à 74 °C. Attention aux flambées d'huile-ghee."}]`,
  "Tacos al pastor":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:180,duration_min:37,action:"Pierre déflectrice. Tranches marinées sur grille, chair qui absorbe le fumé jusqu'à 68 °C."},{name:"Saisie directe",mode:"direct",temp_C:180,duration_min:8,action:"Retirer la pierre. Colorer les bords côté feu jusqu'à 71 °C, hacher grossièrement pour les tacos."}]`,
  "Shawarma de poulet":
    `phases:[{name:"Saisie directe",mode:"direct",temp_C:220,duration_min:5,action:"Bloc de cuisses empilées sur pique. Colorer toutes faces pour la croûte épicée."},{name:"Cuisson indirecte",mode:"indirect",temp_C:220,duration_min:30,action:"Décaler indirect. Sonde au cœur du bloc jusqu'à 78 °C, trancher les couches externes au couteau."}]`,
  "Gyros de porc grec":
    `phases:[{name:"Saisie directe",mode:"direct",temp_C:220,duration_min:6,action:"Bloc de tranches empilées sur pique. Colorer toutes faces pour la croûte."},{name:"Cuisson indirecte",mode:"indirect",temp_C:180,duration_min:34,action:"Décaler indirect. Sonde au cœur jusqu'à 75 °C, trancher les couches externes au couteau au fur et à mesure."}]`,
  "Sosaties d'agneau au curry & abricot":
    `phases:[{name:"Saisie directe",mode:"direct",temp_C:220,duration_min:4,action:"Grille directe. Marquer les cubes toutes faces pour la croûte curry."},{name:"Finition indirecte",mode:"indirect",temp_C:220,duration_min:7,action:"Décaler indirect. Laquage abricot dans les dernières minutes, sonde jusqu'à 63 °C rosé."}]`,
  "Aubergine entière fumée façon steak":
    `phases:[{name:"Fumage direct",mode:"direct",temp_C:220,duration_min:12,action:"Aubergines entières sur braises. Peau qui carbonise, chair qui absorbe le goût fumé."},{name:"Fondant indirect",mode:"indirect",temp_C:220,duration_min:23,action:"Décaler indirect. Miso-tamari badigeonné, chair complètement fondante, texture 'steak' à la fourchette."}]`,
  "Chou pointu rôti au beurre noisette":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:200,duration_min:25,action:"Pierre déflectrice. Chou en quartiers face coupée sur grille jusqu'à cœur fondant."},{name:"Coloration directe",mode:"direct",temp_C:200,duration_min:10,action:"Retirer la pierre. Feuilles extérieures qui croustillent, arroser beurre noisette juste avant service."}]`,
  "Patatas bravas grillées":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:210,duration_min:30,action:"Pierre déflectrice. Cubes de pommes de terre précuites vapeur, huilés, jusqu'à tendres et dorés."},{name:"Croustillance directe",mode:"direct",temp_C:210,duration_min:8,action:"Retirer la pierre. Faire croustiller sur plaque fonte, sauce brava et alioli hors feu."}]`,
  "Steaks de chou rouge fumés":
    `phases:[{name:"Cuisson indirecte",mode:"indirect",temp_C:180,duration_min:30,action:"Pierre déflectrice + copeaux hêtre. Tranches épaisses de chou huilées, sonde jusqu'à tendre."},{name:"Saisie directe",mode:"direct",temp_C:240,duration_min:8,action:"Retirer la pierre. Marquage rapide face coupée pour la croûte grillée, sans écrouler la tranche."}]`,
};

// Late-glaze appends: sentence to APPEND to `astuce:` (not replace).
// Each string MUST contain at least one keyword from the auditor's regex:
// "fin de cuisson", "dernières minutes", "brûle vite", "caramélise vite",
// "éviter la carbonisation".
const LATE_GLAZE = {
  "Burgers smash maison":
    "Ne badigeonnez la sauce BBQ ou le laquage sucré que dans les dernières minutes: le sucre brûle vite sur plaque incandescente.",
  "Banh mi de porc grillé":
    "La marinade nuoc-mâm/sucre caramélise vite sur les 250 °C: laquez seulement en fin de cuisson pour éviter la carbonisation.",
  "Gambas grillées ail & piment":
    "Si vous ajoutez miel ou sauce sucrée, faites-le uniquement dans les dernières minutes: la chitine caramélise vite et brûle.",
  "Saint-Jacques grillées au beurre noisette":
    "Ne mettez le miel ou la laque qu'en fin de cuisson: le sucre brûle vite au contact de la plaque à 260 °C.",
  "Moules à la plancha, ail & persil":
    "Toute laque sucrée (soja-miel, hoisin) s'ajoute uniquement dans les dernières minutes pour éviter la carbonisation.",
  "Calamars grillés en persillade":
    "Si vous laquez, faites-le en fin de cuisson: le sucre brûle vite sur le calamar et masque son goût iodé.",
  "Tacos de poisson croustillant sur plancha":
    "Toute laque sucrée s'ajoute en fin de cuisson: le sucre caramélise vite sur la plaque à 240 °C et brûle.",
  "Pleurotes façon steak, balsamique":
    "Le glaçage balsamique-miel se fait uniquement dans les dernières minutes pour éviter la carbonisation du sucre.",
  "Halloumi grillé au miel & origan":
    "Le miel s'ajoute en fin de cuisson uniquement: à 230 °C direct, il caramélise vite et brûle en secondes.",
  "Naan à l'ail au beurre":
    "Si vous ajoutez un beurre miel-ail, badigeonnez en fin de cuisson: le sucre brûle vite sur pierre à 300 °C.",
  "Pizza blanche poire-gorgonzola-noix":
    "Le filet de miel se fait à la sortie ou dans les dernières minutes: à 320 °C il caramélise vite et brûle.",
  "Pizza al taglio romaine 72h":
    "Tout ingrédient sucré (miel, oignons confits) se pose en fin de cuisson pour éviter la carbonisation à 280 °C.",
  "Yakitori (brochettes japonaises)":
    "La tare sucrée s'applique par couches uniquement dans les dernières minutes: à 240 °C, le mirin-sucre brûle vite.",
  "Satay de poulet, sauce cacahuète":
    "Toute laque sucrée sur la brochette se fait en fin de cuisson: le sucre de la marinade caramélise vite à 250 °C.",
  "Thịt nướng (porc citronnelle vietnamien)":
    "Ne badigeonnez la marinade sucrée que dans les dernières minutes: elle brûle vite à 250 °C, laquer trop tôt = amer.",
  "Samgyeopsal (poitrine de porc coréenne)":
    "Si vous ajoutez une laque gochujang ou soja-miel, faites-le en fin de cuisson: le sucre caramélise vite à 240 °C.",
  "Burger végétarien haricots-champignons":
    "Le laquage BBQ ou miel-moutarde s'applique dans les dernières minutes: sur plaque à 230 °C, le sucre brûle vite.",
  "Brochettes halloumi & légumes":
    "Le miel ou la mélasse ne se badigeonnent qu'en fin de cuisson pour éviter la carbonisation du sucre sur les cubes.",
  "Tofu mariné grillé teriyaki":
    "Laquez le teriyaki dans les dernières minutes uniquement: le mirin-sucre caramélise vite sur plaque à 230 °C et brûle.",
  "Provoleta grillé (fromage argentin)":
    "Si vous ajoutez miel ou confiture, faites-le à la sortie ou en fin de cuisson pour éviter la carbonisation du sucre.",
};

// Safety notes for the two magrets. We inject/replace notes_securite so
// that it contains a number ≥ 74.
const SAFETY_NOTES = {
  "Magret de canard, peau croustillante":
    "Standard USDA 74 °C pour la volaille cuite. Dérogation culinaire française assumée sur le magret entier saisi (muscle sain non haché) — servir 55–58 °C rosé. Ne PAS appliquer cette dérogation aux préparations hachées, farces ou brochettes de canard. Canard = seule volaille pouvant se déguster rosée à condition d'être issu d'élevage sain sans Salmonella. Enfants, femmes enceintes, immunodéprimés : cuisson ≥ 74 °C impérative. Quadriller le gras côté peau avant cuisson pour fonte homogène.",
  "Magret de canard fumé-séché (charcuterie)":
    "Standard USDA 74 °C pour la volaille cuite: NON APPLICABLE ici (charcuterie crue). La salubrité repose sur trois paramètres non négociables — salage 24 h précis, fumage à froid ≤ 25 °C, perte de poids ≥ 30% en 14 j à 12–14 °C. DANGER CRITIQUE : si la T° de fumage dépasse 30 °C, vous entrez dans la zone danger (bactéries actives sans cuisson) — JETER. Congélation préalable −20 °C ≥ 24 h recommandée contre les parasites. Faire cette recette uniquement par temps frais (automne/hiver/printemps) ou avec fumoir réfrigéré. Moisissures blanches/grises = normales (frotter au vinaigre) ; moisissures noires = JETER. Éviter cette préparation pour femmes enceintes, immunodéprimés, jeunes enfants.",
};

// ---------------------------------------------------------------------------
// Patching engine
// ---------------------------------------------------------------------------

function findRecipeBlock(lines, name) {
  const nomLine = `nom:"${name}",`;
  const nomIdx = lines.findIndex(l => l.trim() === nomLine);
  if (nomIdx < 0) return null;
  // Walk down until we hit a `source:"..."` line — that ends the block.
  for (let i = nomIdx; i < Math.min(nomIdx + 60, lines.length); i++) {
    if (lines[i].startsWith("source:")) {
      return { nomIdx, sourceIdx: i };
    }
  }
  return null;
}

function insertPhasesLine(lines, sourceIdx, phasesLine) {
  // Ensure the previous line ends with `,` so JS syntax stays valid.
  const prev = lines[sourceIdx - 1];
  if (!prev.endsWith(",")) {
    lines[sourceIdx - 1] = prev + ",";
  }
  lines.splice(sourceIdx, 0, phasesLine + ",");
}

function replaceOrInsertField(lines, block, fieldName, newValueLine) {
  // newValueLine e.g. `notes_securite:"..."`
  // Search inside the block for a line starting with `fieldName:` and
  // replace it. If not found, insert before source.
  for (let i = block.nomIdx; i < block.sourceIdx; i++) {
    if (lines[i].startsWith(fieldName + ":")) {
      const trailing = lines[i].endsWith(",") ? "," : "";
      lines[i] = newValueLine + trailing;
      return;
    }
  }
  // Not found → insert before source with trailing comma.
  const prev = lines[block.sourceIdx - 1];
  if (!prev.endsWith(",")) {
    lines[block.sourceIdx - 1] = prev + ",";
  }
  lines.splice(block.sourceIdx, 0, newValueLine + ",");
}

function appendToAstuce(lines, block, sentence) {
  for (let i = block.nomIdx; i < block.sourceIdx; i++) {
    const line = lines[i];
    if (!line.startsWith("astuce:")) continue;
    // Idempotency: skip if the sentinel keyword already appears.
    // Cheap check: use the exact sentence prefix.
    const marker = sentence.slice(0, 24);
    if (line.includes(marker)) return { changed: false };

    // Line ends with `",` (typical) — insert " <sentence>" before the closing quote.
    // Handle both trailing "," and "" (last field before source).
    const endsWithComma = line.endsWith('",');
    const endsQuote = line.endsWith('"');
    if (endsWithComma) {
      lines[i] = line.slice(0, -2) + " " + sentence + '",';
    } else if (endsQuote) {
      lines[i] = line.slice(0, -1) + " " + sentence + '"';
    } else {
      return { changed: false, reason: "astuce line format unexpected: " + line.slice(-10) };
    }
    return { changed: true };
  }
  return { changed: false, reason: "no astuce field" };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const original = fs.readFileSync(HTML_PATH, "utf8");
  const lines = original.split("\n");

  const report = { phasesAdded: [], glazeAdded: [], safetyAdded: [], skipped: [] };

  // Category 1: phases (process in reverse-order-safe way — mutate lines
  // in place; splice shifts indices, so we always re-locate each block).
  for (const [name, phasesBody] of Object.entries(PHASES)) {
    const block = findRecipeBlock(lines, name);
    if (!block) {
      report.skipped.push({ name, reason: "block not found" });
      continue;
    }
    // Idempotency: if any line in the block already starts with "phases:[",
    // do nothing.
    let alreadyHasPhases = false;
    for (let i = block.nomIdx; i < block.sourceIdx; i++) {
      if (lines[i].startsWith("phases:[")) { alreadyHasPhases = true; break; }
    }
    if (alreadyHasPhases) {
      report.skipped.push({ name, reason: "phases already present" });
      continue;
    }
    insertPhasesLine(lines, block.sourceIdx, phasesBody);
    report.phasesAdded.push(name);
  }

  // Category 2: late-glaze astuce appends.
  for (const [name, sentence] of Object.entries(LATE_GLAZE)) {
    const block = findRecipeBlock(lines, name);
    if (!block) {
      report.skipped.push({ name, reason: "block not found (glaze)" });
      continue;
    }
    const res = appendToAstuce(lines, block, sentence);
    if (res.changed) report.glazeAdded.push(name);
    else report.skipped.push({ name, reason: "glaze skip: " + (res.reason || "already present") });
  }

  // Category 3: safety notes for the two magrets.
  for (const [name, note] of Object.entries(SAFETY_NOTES)) {
    const block = findRecipeBlock(lines, name);
    if (!block) {
      report.skipped.push({ name, reason: "block not found (safety)" });
      continue;
    }
    // Idempotency: skip if notes_securite already contains a "74".
    let hasCurrent = null;
    for (let i = block.nomIdx; i < block.sourceIdx; i++) {
      if (lines[i].startsWith("notes_securite:")) {
        hasCurrent = { idx: i, text: lines[i] };
        break;
      }
    }
    if (hasCurrent && /\b74\b/.test(hasCurrent.text)) {
      report.skipped.push({ name, reason: "safety already mentions 74" });
      continue;
    }
    replaceOrInsertField(lines, block, "notes_securite", `notes_securite:"${note}"`);
    report.safetyAdded.push(name);
  }

  const patched = lines.join("\n");
  if (patched !== original) {
    fs.writeFileSync(HTML_PATH, patched);
  }

  console.log(JSON.stringify({
    phases: report.phasesAdded.length,
    glaze: report.glazeAdded.length,
    safety: report.safetyAdded.length,
    skipped: report.skipped.length,
    detail: report
  }, null, 2));
}

main();
