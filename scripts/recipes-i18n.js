(function initRecipesI18n(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KamadoRecipesI18n = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function recipesI18nFactory() {
  "use strict";

  const RECIPES_EN = {
    "cote-de-boeuf-reverse-sear": [
      "Reverse-Seared Ribeye Steak",
      "France · perfect two-stage cooking"
    ],
    "entrecote-grillee-maitre-d-hotel": [
      "Grilled Ribeye Steak Maître d'Hôtel",
      "France · express direct sear with herb butter"
    ],
    "brisket-fume-poitrine-de-boeuf": [
      "Texas Smoked Beef Brisket",
      "USA · Texas low & slow, the Holy Grail of BBQ"
    ],
    "rosbif-roti-a-l-anglaise": [
      "English-Style Roast Beef",
      "France/UK · Sunday roast classic"
    ],
    "bavette-a-l-echalote": [
      "Flank Steak with Shallots",
      "France · classic bistro steak"
    ],
    "burgers-smash-maison": [
      "Homemade Smash Burgers",
      "USA · ultra-crispy crust on cast iron plancha"
    ],
    "brochettes-de-boeuf-marine": [
      "Marinated Beef Skewers",
      "France · convivial charcoal skewers"
    ],
    "tomahawk-au-beurre-noisette": [
      "Tomahawk Steak with Brown Butter",
      "USA/France · showstopper bone-in ribeye"
    ],
    "onglet-grille-sauce-au-poivre": [
      "Grilled Hanger Steak with Peppercorn Sauce",
      "France · the butcher's best kept secret"
    ],
    "joue-de-boeuf-fumee-braisee": [
      "Smoked & Braised Beef Cheeks",
      "France · gelatin-rich slow braise in Dutch oven"
    ],
    "pastrami-fume-maison": [
      "Homemade Smoked Pastrami",
      "USA / Jewish Deli · spice-crusted, cured and smoked"
    ],
    "beef-short-ribs-dino-ribs": [
      "Beef Short Ribs (Dino Ribs)",
      "USA · Texas giant smoked beef ribs"
    ],
    "tri-tip-sauce-santa-maria": [
      "Santa Maria Tri-Tip Roast",
      "USA · California barbecue classic"
    ],
    "plat-de-cotes-braise-au-vin": [
      "Red Wine Braised Beef Short Ribs",
      "France · slow cooked Sunday comfort food"
    ],
    "picanha-entiere-facon-churrasco": [
      "Whole Picanha Churrasco Style",
      "Brazil · crispy fat cap and pink juicy center"
    ],
    "short-ribs-de-boeuf-facon-texas": [
      "Texas Style Smoked Beef Short Ribs",
      "USA · thick bark and melt-in-mouth beef"
    ],
    "dino-beef-ribs-travers-de-boeuf-geants-fumes-au-chene": [
      "Dino Beef Ribs (Oak-Smoked Giant Beef Plate Ribs)",
      "Texas · legendary 8-hour low & slow beef plate ribs"
    ],
    "onglet-yakitori-au-binchotan-maison": [
      "Binchotan Charcoal Beef Hanger Yakitori",
      "Japan / Fusion · skewered tender beef glazed with tare"
    ],
    "cote-de-boeuf-caveman-sur-braises": [
      "Caveman Style Ribeye Steak on Coals",
      "USA · primitive searing directly on hardwood embers"
    ],
    "burnt-ends-de-poitrine-de-boeuf": [
      "Smoked Beef Brisket Burnt Ends",
      "Kansas City · meat candy confit cubes tossed in BBQ sauce"
    ],
    "bistecca-alla-fiorentina-t-bone": [
      "Bistecca alla Fiorentina (Thick T-Bone)",
      "Tuscany, Italy · the queen of Florence grilled over embers"
    ],
    "picanha-au-sel-de-gros-churrasco": [
      "Coarse Sea Salt Picanha (Churrasco)",
      "Brazil · skewered rump cap seared over hot coals"
    ],
    "tomahawk-reverse-sear": [
      "Reverse-Seared Tomahawk Steak",
      "USA · 2-inch thick bone-in ribeye finished over roaring coals"
    ],
    "paleron-de-boeuf-fume-facon-brisket-smoked-chuck-roast": [
      "Poor Man's Brisket (Smoked Beef Chuck Roast)",
      "USA · smoked chuck roast tender as brisket with peppery bark"
    ],
    "boeuf-bourguignon-au-kamado": [
      "Kamado Beef Bourguignon in Dutch Oven",
      "France / Burgundy · slow-simmered beef, red wine, lardons and mushrooms"
    ],
    "pot-au-feu-bourgeois-au-kamado": [
      "Smoked French Pot-au-Feu in Dutch Oven",
      "France · traditional boiled beef and winter vegetables with marrow bones"
    ],
    "daube-provencale-au-kamado": [
      "Provencal Beef Daube in Dutch Oven",
      "France / Provence · slow-braised beef with red wine, orange peel and olives"
    ],
    "blanquette-de-veau-au-kamado": [
      "Kamado Veal Blanquette in Dutch Oven",
      "France · creamy tender veal stew with button mushrooms and pearl onions"
    ],
    "pulled-pork-echine-effilochee": [
      "Smoked Pulled Pork (Boston Butt)",
      "USA · Carolina barbecue low & slow"
    ],
    "travers-de-porc-glaces-ribs": [
      "Glazed BBQ Pork Spare Ribs",
      "USA · sweet and smoky sticky ribs glazed over applewood"
    ],
    "carre-de-porc-roti-aux-herbes": [
      "Herb-Roasted Rack of Pork",
      "France · juicy bone-in pork loin with crispy crackling and rosemary"
    ],
    "filet-mignon-fume-au-miel": [
      "Honey-Glazed Smoked Pork Tenderloin",
      "France · tender and subtly sweet fruitwood smoke"
    ],
    "poitrine-de-porc-croustillante": [
      "Crispy Pork Belly (Crackling Siu Yuk)",
      "Asia / France · blistered bubbly crunchy skin and melting meat"
    ],
    "echine-marinee-a-la-biere": [
      "Beer-Marinated Pork Collar Steaks",
      "France · convivial barbecue steaks steeped in ale and onions"
    ],
    "saucisses-chipolatas-grillees": [
      "Charcoal-Grilled French Sausages & Chipolatas",
      "France · artisanal sausages cooked over two-zone fire"
    ],
    "porchetta-roulee-aux-herbes": [
      "Italian Rolled Porchetta with Fresh Herbs",
      "Italy · crispy skin rolled pork belly with fennel, rosemary and garlic"
    ],
    "jambonneau-fume-glace": [
      "Smoked & Glazed Pork Shank",
      "France / Germany · cured ham hock with honey mustard glaze"
    ],
    "pork-belly-burnt-ends": [
      "Sweet & Smoky Pork Belly Burnt Ends",
      "USA · caramelized BBQ meat candy glazed in honey"
    ],
    "baby-back-ribs-facon-memphis": [
      "Memphis Style Dry-Rub Baby Back Ribs",
      "USA · paprika-rubbed ribs with cider mop"
    ],
    "carolina-pulled-pork-sauce-vinaigree": [
      "Carolina Pulled Pork with Cider Vinegar Sauce",
      "USA · tangy cider vinegar and pepper pulled pork"
    ],
    "travers-de-porc-laques-aigre-doux": [
      "Sweet & Sour Lacquered Pork Ribs",
      "China · char siu style glossy glazed ribs"
    ],
    "cote-de-porc-tomahawk-saumuree": [
      "Brined Tomahawk Pork Chop",
      "France / USA · thick-cut bone-in juicy chop"
    ],
    "ribs-asiatiques-au-cinq-epices": [
      "Five-Spice Asian Sticky Ribs",
      "China / USA · hoisin and ginger lacquered spare ribs"
    ],
    "banh-mi-de-porc-grille": [
      "Grilled Pork Bánh Mì",
      "Vietnam · baguette with lemongrass pork and pickled vegetables"
    ],
    "poitrine-de-porc-miso-erable-en-cubes": [
      "Maple-Miso Pork Belly Burnt Ends",
      "Japan / Canada · umami-packed crispy glazed cubes"
    ],
    "filet-mignon-farci-chorizo-manchego": [
      "Pork Tenderloin Stuffed with Chorizo & Manchego",
      "Spain · rolled and smoked tenderloin with melting cheese"
    ],
    "lechon-asado-porc-roti-cubain": [
      "Lechón Asado (Cuban Mojo Roast Pork)",
      "Cuba · citrus-garlic marinated crispy crackling roast pork"
    ],
    "porchetta-italienne-poitrine-roulee-24h": [
      "Italian Porchetta (24h Rolled Pork Belly)",
      "Italy / Lazio · rolled pork belly with rosemary, garlic and blistered crackling"
    ],
    "cassoulet-toulousain-au-kamado": [
      "Kamado Toulouse Cassoulet in Clay Baker",
      "France · white beans, duck confit and sausage with golden crust"
    ],
    "choucroute-garnie-alsacienne-au-kamado": [
      "Alsatian Choucroute Garnie in Dutch Oven",
      "France / Alsace · Riesling sauerkraut and smoked meats"
    ],
    "travers-de-porc-turbo-ribs": [
      "Turbo Smoked Pork Spare Ribs",
      "USA · 2-hour competition ribs wrapped with brown sugar and butter"
    ],
    "poulet-entier-a-la-cannette-beer-can": [
      "Beer Can Whole Roast Chicken",
      "USA · vertical whole chicken infused with steaming beer and spices"
    ],
    "poulet-crapaudine-spatchcock": [
      "Spatchcock Chicken with Herbs",
      "France/USA · cuisson rapide & homogène"
    ],
    "magret-de-canard-peau-croustillante": [
      "Crispy Skin Duck Breast",
      "France / South-West · scored skin crisped to perfection, served rare"
    ],
    "cuisses-de-poulet-marinees-citron-thym": [
      "Lemon & Thyme Marinated Chicken Thighs",
      "France · crispy skin chicken with Mediterranean herbs"
    ],
    "ailes-de-poulet-buffalo": [
      "Crispy Buffalo Chicken Wings",
      "USA · smoked and charred wings tossed in spicy cayenne butter"
    ],
    "pintade-rotie-aux-marrons": [
      "Roast Guinea Fowl with Chestnuts",
      "France · festive autumn roast with pan drippings"
    ],
    "chapon-dinde-roti-des-fetes": [
      "Holiday Roast Capon with Chestnut Stuffing",
      "France · festive slow-roasted poultry with rich herb butter"
    ],
    "coquelet-crapaudine-a-l-ail": [
      "Garlic Butter Spatchcock Poussin",
      "France · flattened young chicken roasted crispy over embers"
    ],
    "poulet-peri-peri": [
      "Portuguese Peri-Peri Grilled Chicken",
      "Portugal / Africa · fiery chili, garlic and lemon charred chicken"
    ],
    "shish-taouk-brochettes-libanaises": [
      "Lebanese Shish Taouk Chicken Skewers",
      "Lebanon · yogurt, lemon and garlic marinated chicken skewers"
    ],
    "cuisses-de-poulet-teriyaki": [
      "Glazed Teriyaki Chicken Thighs",
      "Japan · sweet soy and ginger lacquered chicken"
    ],
    "poulet-shawarma-au-kamado": [
      "Kamado Spiced Chicken Shawarma",
      "Middle East · warm aromatic spices, charred edges and flatbread"
    ],
    "poulet-jerk-jamaicain": [
      "Authentic Jamaican Jerk Chicken",
      "Jamaica · fiery Scotch bonnet and allspice smoked chicken"
    ],
    "brochettes-de-dinde-satay": [
      "Turkey Satay Skewers with Peanut Sauce",
      "Indonesia · coconut-turmeric marinated skewers with spicy dip"
    ],
    "canard-entier-laque-orange-soja": [
      "Orange & Soy Lacquered Whole Roast Duck",
      "France / Asia · crispy honey-citrus glazed whole duck"
    ],
    "yakitori-de-cuisses-de-poulet": [
      "Yakitori Chicken Thigh & Scallion Skewers",
      "Japan · classic Negima skewers glazed with tare"
    ],
    "magret-de-canard-fume-seche-charcuterie": [
      "Cold-Smoked & Cured Duck Prosciutto",
      "France · cured duck breast gently cold-smoked over beechwood"
    ],
    "coq-au-vin-au-kamado": [
      "Kamado Coq au Vin in Dutch Oven",
      "France / Burgundy · tender chicken braised in red wine, mushrooms and bacon"
    ],
    "confit-de-canard-au-kamado": [
      "Kamado Duck Leg Confit",
      "France / South-West · slow-poached in duck fat and crisped over coals"
    ],
    "poulet-basquaise-au-kamado": [
      "Basque Chicken (Poulet Basquaise) in Dutch Oven",
      "France / Basque · chicken braised with sweet bell peppers, tomatoes and Espelette"
    ],
    "gigot-d-agneau-roti-rose": [
      "Rose-Roasted Leg of Lamb with Garlic",
      "France · classic Easter leg of lamb roasted medium-rare with herbs"
    ],
    "carre-d-agneau-en-croute-d-herbes": [
      "Herb-Crusted Rack of Lamb",
      "France · pièce raffinée"
    ],
    "epaule-d-agneau-confite-7-heures": [
      "7-Hour Melting Lamb Shoulder in Dutch Oven",
      "France · spoon-tender slow-braised lamb with garlic and white wine"
    ],
    "cotelettes-d-agneau-grillees": [
      "Charcoal-Grilled Lamb Cutlets with Thyme",
      "France / Provence · flash-seared pink lamb cutlets over hot embers"
    ],
    "souris-d-agneau-braisees-au-miel": [
      "Honey & Rosemary Braised Lamb Shanks",
      "France · fork-tender shanks with caramelized sweet glaze"
    ],
    "filet-de-chevreuil-roti-sauce-grand-veneur": [
      "Roast Venison Loin with Grand Veneur Sauce",
      "France · tender wild game with rich currant pepper sauce"
    ],
    "cuissot-de-chevreuil-roti-sauce-poivrade": [
      "Roast Haunch of Venison with Poivrade Sauce",
      "France · noble roast with peppercorn game reduction"
    ],
    "civet-de-sanglier-fume-puis-braise": [
      "Smoked & Braised Wild Boar Stew",
      "France · wild boar slowly braised in full-bodied red wine"
    ],
    "pave-de-cerf-sauce-aux-airelles": [
      "Venison Steak with Lingonberry Sauce",
      "France / Terroir · seared venison medallions with tart berry reduction"
    ],
    "cailles-roties-au-raisin-lard": [
      "Bacon-Wrapped Roast Quail with Grapes",
      "France · autumn roasted quail with sweet white grapes"
    ],
    "filet-de-biche-en-croute-d-epices": [
      "Spice-Crusted Venison Tenderloin",
      "France / Terroir · rare venison loin coated with crushed juniper & pepper"
    ],
    "keftas-d-agneau-menthe-cumin": [
      "Spiced Lamb Keftas with Mint & Cumin",
      "North Africa / Middle East · juicy grilled skewers with fresh mint"
    ],
    "cotelettes-d-agneau-gochujang": [
      "Gochujang Glazed Korean Lamb Chops",
      "Korea / Fusion · spicy sweet fermented chili glazed grilled chops"
    ],
    "mechoui-d-epaule-d-agneau-effilochee": [
      "Pulled Lamb Mechoui with Cumin & Coriander",
      "North Africa · slow-smoked pulled lamb shoulder basted with spiced butter"
    ],
    "brochettes-d-agneau-zaatar-citron": [
      "Za'atar & Lemon Lamb Skewers",
      "Middle East · grilled lamb skewers tossed with wild thyme and sumac"
    ],
    "navarin-d-agneau-printanier-au-kamado": [
      "Spring Lamb Navarin in Dutch Oven",
      "France · tender lamb ragout with spring baby carrots, turnips and peas"
    ],
    "selle-d-agneau-a-la-broche-fumee-de-sarments": [
      "Rotisserie Saddle of Lamb with Vine Shoot Smoke",
      "France / Bordeaux · rolled saddle basted over grapevine cuttings"
    ],
    "travers-d-agneau-fumes-3-2-1": [
      "3-2-1 Smoked Lamb Ribs",
      "USA / Mediterranean · tender, richly flavored lamb ribs smoked over fruitwood"
    ],
    "epaule-d-agneau-pulled-fumee-mediterraneenne": [
      "Mediterranean Smoked Pulled Lamb",
      "Mediterranean · citrus, rosemary and garlic shredded lamb shoulder"
    ],
    "merguez-maison-fumees-au-bois-d-olivier": [
      "Homemade Merguez Sausages Smoked over Olive Wood",
      "North Africa / France · spicy beef and lamb sausages kissed with olive smoke"
    ],
    "kleftiko-d-agneau-en-papillote-au-kamado": [
      "Parchment-Wrapped Lamb Kleftiko",
      "Greece · slow-braised lamb with oregano, lemon and potatoes in parchment"
    ],
    "rogan-josh-d-agneau-au-dutch-oven": [
      "Kashmiri Lamb Rogan Josh in Dutch Oven",
      "India / Kashmir · aromatic lamb curry with Kashmiri chili and fennel"
    ],
    "adana-kebab-agneau-hache-epice-au-maras": [
      "Spicy Adana Lamb Kebab with Maraş Pepper",
      "Turkey / Adana · hand-minced spicy lamb skewers grilled over open embers"
    ],
    "rable-de-lapin-fume-au-thym-et-pommier": [
      "Applewood & Thyme Smoked Saddle of Rabbit",
      "France · delicate lean rabbit wrapped in bacon and gently smoked"
    ],
    "saumon-sur-planche-de-cedre": [
      "Cedar Plank Salmon Fillet",
      "USA/Canada · fumage délicat sur bois"
    ],
    "saumon-fume-a-chaud-sauce-aneth": [
      "Hot-Smoked Salmon with Dill Cream Sauce",
      "Scandinavia · succulent alder-smoked salmon with tangy dill cream"
    ],
    "bar-entier-grille-au-fenouil": [
      "Whole Grilled Sea Bass with Wild Fennel",
      "Mediterranean · whole fish charred directly over coals with lemon and herbs"
    ],
    "gambas-grillees-ail-piment": [
      "Garlic & Chili Plancha Jumbo Prawns",
      "Spain · flash-grilled whole prawns with sizzling garlic and chili oil"
    ],
    "pave-de-thon-mi-cuit-croute-de-sesame": [
      "Sesame-Crusted Seared Ahi Tuna Steak",
      "Japan / Fusion · rare-centered yellowfin tuna with toasted sesame"
    ],
    "truite-en-papillote-citron-amande": [
      "Parchment-Baked Mountain Trout with Lemon & Almonds",
      "France · tender whole trout steamed with butter, herbs and toasted almonds"
    ],
    "saint-jacques-grillees-au-beurre-noisette": [
      "Grilled Sea Scallops with Brown Butter Baste",
      "France / Brittany · flash-caramelized scallops on cast iron plancha"
    ],
    "homard-grille-au-beurre-d-estragon": [
      "Grilled Whole Lobster with Tarragon Butter",
      "France / USA · split lobster basted with herb butter over coals"
    ],
    "maquereaux-grilles-a-la-moutarde": [
      "Mustard-Glazed Whole Grilled Mackerel",
      "France / Brittany · rich oily fish with tangy Dijon crust charred over charcoal"
    ],
    "poulpe-grille-a-la-galicienne": [
      "Galician Grilled Octopus",
      "Espagne · pulpo a la brasa"
    ],
    "paella-au-kamado": [
      "Kamado Seafood & Chicken Paella with Socarrat",
      "Spain / Valencia · saffron rice with crispy socarrat bottom baked over wood"
    ],
    "moules-a-la-plancha-ail-persil": [
      "Plancha-Steamed Mussels with Garlic & Parsley",
      "France / Spain · opened on screaming plancha with white wine and butter"
    ],
    "sardines-grillees-en-direct": [
      "Direct Charcoal-Grilled Whole Sardines",
      "Portugal · coarse sea salt and fresh lemon on rustic coastal sardines"
    ],
    "dorade-en-croute-de-sel": [
      "Whole Sea Bream Baked in Sea Salt Crust",
      "Mediterranean · sealed in coarse salt crust for supremely moist and tender flesh"
    ],
    "huitres-chaudes-gratinees": [
      "Broiled Oysters with Herb & Champagne Butter",
      "France / Brittany · warm oysters baked in shell with shallot-herb crumb"
    ],
    "calamars-grilles-en-persillade": [
      "Charred Calamari with Parsley & Garlic Persillade",
      "Mediterranean · quick high-heat flash grilled squid tubes and tentacles"
    ],
    "saumon-laque-teriyaki": [
      "Teriyaki Glazed Charred Salmon Fillet",
      "Japan · sweet soy glaze caramelized over cedar or cast iron"
    ],
    "loup-de-mer-bar-entier-en-croute-de-sel-et-herbes-de-provence": [
      "Whole Salt-Crusted Sea Bass with Provencal Herbs",
      "Mediterranean · giant sea bass sealed in aromatic egg-white and herb salt crust"
    ],
    "espadon-grille-vierge-de-tomates": [
      "Grilled Swordfish Steak with Fresh Tomato Sauce Vierge",
      "Mediterranean · meaty swordfish steak with diced heirloom tomato vinaigrette"
    ],
    "moules-fumees-en-cocotte": [
      "Smoked Mussels in Dutch Oven with White Wine",
      "France · fresh mussels bathed in beechwood smoke with shallots and thyme"
    ],
    "tacos-de-poisson-croustillant-sur-plancha": [
      "Crispy Baja Fish Tacos on Plancha",
      "Mexico / Baja California · crisp golden fish fillets with lime slaw and chipotle crema"
    ],
    "huitres-gratinees-au-kamado": [
      "Kamado Wood-Broiled Oysters with Parmesan",
      "France / USA · smoky oysters topped with garlic butter and golden breadcrumbs"
    ],
    "salmon-tikka-pave-de-saumon-tandoori": [
      "Spiced Salmon Tikka Skewers",
      "India · yogurt, ginger and fenugreek marinated salmon charred on skewers"
    ],
    "saumon-gravlax-fume-a-froid": [
      "Cold-Smoked Scandinavian Salmon Gravlax",
      "Scandinavia · cured with dill, gin and juniper, then cold-smoked over beech"
    ],
    "legumes-grilles-mediterraneens": [
      "Platter of Grilled Mediterranean Vegetables",
      "Mediterranean · charred zucchini, bell peppers, eggplant and red onions"
    ],
    "aubergines-fumees-facon-baba-ganoush": [
      "Smoked Eggplant Baba Ganoush",
      "Middle East · coal-roasted eggplant mashed with tahini, garlic and olive oil"
    ],
    "pommes-de-terre-braisees-au-romarin": [
      "Rosemary & Duck Fat Braised Potatoes",
      "France · crispy golden potatoes slowly roasted under meat drippings"
    ],
    "mais-grille-beurre-epice": [
      "Grilled Sweet Corn with Spiced Herb Butter",
      "USA · sweet ears charred over open fire and slathered with smoked butter"
    ],
    "champignons-portobello-farcis": [
      "Stuffed Portobello Mushrooms with Herbs & Garlic",
      "Italy / France · meaty baked caps with parmesan herb breadcrumbs"
    ],
    "asperges-grillees-au-parmesan": [
      "Charred Green Asparagus with Shaved Parmesan",
      "Italy / France · tender crisp spears with lemon oil and aged cheese"
    ],
    "chou-fleur-entier-roti-tahini": [
      "Whole Roasted Spiced Cauliflower with Tahini",
      "Middle East · golden crust roasted head drizzled with pomegranate and sesame"
    ],
    "mont-d-or-camembert-fume": [
      "Smoked Whole Mont d'Or / Camembert in Wood Box",
      "France · bubbling molten cheese infused with fruitwood smoke and white wine"
    ],
    "pleurotes-facon-steak-balsamique": [
      "Balsamic Glazed King Oyster Mushroom Steaks",
      "Modern / Vegan · meaty scored mushroom caps seared with garlic and thyme"
    ],
    "ratatouille-fumee-au-kamado": [
      "Kamado Smoked Provencal Ratatouille",
      "France / Provence · layered summer vegetables slowly baked in Dutch oven"
    ],
    "halloumi-grille-au-miel-origan": [
      "Grilled Halloumi with Warm Honey & Oregano",
      "Cyprus · golden charred cheese finished with floral honey and wild herbs"
    ],
    "gratin-dauphinois-en-cocotte": [
      "Creamy Gratin Dauphinois in Dutch Oven",
      "France / Dauphiné · slow-baked layered potatoes with cream, garlic and nutmeg"
    ],
    "patate-douce-braisee-beurre-epice": [
      "Braised Whole Sweet Potato with Spiced Butter",
      "USA · tender caramelized flesh with cinnamon, nutmeg and brown sugar"
    ],
    "pommes-de-terre-hasselback": [
      "Crispy Hasselback Potatoes with Herb Butter",
      "Sweden · accordian-sliced roasted potatoes with crunchy ridges"
    ],
    "carottes-glacees-miso-miel": [
      "Miso & Honey Glazed Roasted Carrots",
      "Japan / Fusion · sweet baby carrots roasted with savory white miso glaze"
    ],
    "baked-beans-bbq": [
      "Smoked Barbecue Baked Beans in Cast Iron",
      "USA · navy beans simmered with bacon, molasses, brown sugar and mustard"
    ],
    "pain-a-l-ail-gratine": [
      "Cheesy Garlic Herb Crusty Bread",
      "USA / France · crusty loaf filled with garlic parsley butter and melted cheese"
    ],
    "coleslaw-maison": [
      "Crisp Homemade Creamy Slaw",
      "USA · thinly shredded cabbage and carrots with tangy cider dressing"
    ],
    "frites-de-patate-douce-au-four": [
      "Crispy Baked Sweet Potato Wedges",
      "USA · seasoned wedges roasted with smoked paprika and cornstarch crust"
    ],
    "courge-butternut-rotie-erable-piment": [
      "Maple & Chili Roasted Butternut Squash",
      "USA / Modern · caramelized sweet squash wedges with a hint of cayenne"
    ],
    "endives-braisees-au-kamado": [
      "Braised Endives with Brown Sugar in Dutch Oven",
      "France / Belgium · tender caramelized chicory braised in butter and lemon"
    ],
    "betteraves-roties-en-croute-de-sel": [
      "Salt-Crusted Roasted Whole Beets",
      "France · whole unpeeled beets roasted in salt to concentrate sweet earthy flavors"
    ],
    "tartiflette-savoyarde-au-kamado": [
      "Savoyard Tartiflette with Reblochon Cheese",
      "France / Alps · sliced potatoes, smoked lardons, white wine and melting Reblochon"
    ],
    "pizza-napolitaine": [
      "Classic Neapolitan Pizza Margherita",
      "Italy / Naples · blistered sourdough crust at 380 °C with buffalo mozzarella"
    ],
    "focaccia-romarin-gros-sel": [
      "Rosemary & Sea Salt Ligurian Focaccia",
      "Italy / Liguria · golden airy flatbread dimpled with olive oil and rosemary"
    ],
    "pain-de-campagne-en-cocotte": [
      "Dutch Oven Country Sourdough Loaf",
      "France · crackling crust and airy crumb baked in ceramic oven"
    ],
    "tarte-flambee-flammekueche": [
      "Classic Alsatian Tarte Flambée",
      "France / Alsace · thin crispy dough with crème fraîche, smoked bacon and onions"
    ],
    "naan-a-l-ail-au-beurre": [
      "Garlic Butter Stone-Baked Naan",
      "India · pillowy flatbread blistered on baking stone, brushed with garlic ghee"
    ],
    "fougasse-aux-olives": [
      "Provencal Black Olive Fougasse",
      "France / Provence · ladder-shaped crusty olive oil bread with Kalamata olives"
    ],
    "pains-pitas-gonfles-a-la-flamme-sur-pierre-refractaire": [
      "Stone-Puffed Fire-Baked Pita Bread",
      "Middle East · flash-baked hollow pockets puffed over raging refractory stone"
    ],
    "calzone-napolitain-souffle-a-la-ricotta-fior-di-latte-spianata": [
      "Puffed Neapolitan Calzone (Ricotta, Fior di Latte & Spianata)",
      "Italy / Naples · golden folded pizza stuffed with creamy ricotta and spicy salami"
    ],
    "pizza-blanche-poire-gorgonzola-noix": [
      "Pear, Gorgonzola & Toasted Walnut White Pizza",
      "Italy · sweet ripe pears, pungent blue cheese and crunchy walnuts"
    ],
    "lahmacun-agneau-epice": [
      "Spiced Minced Lamb Lahmacun (Turkish Pizza)",
      "Turkey · paper-thin crust topped with minced lamb, tomatoes, peppers and sumac"
    ],
    "pizza-al-taglio-romaine-72h": [
      "72-Hour Fermented Roman Pizza al Taglio",
      "Italy / Rome · high-hydration crispy airy slab pizza baked on cast iron tray"
    ],
    "flammekueche-alsacienne-traditionnelle": [
      "Traditional Wood-Fired Alsatian Flammekueche",
      "France / Alsace · razor-thin crust with farmhouse fromage blanc, lardons and onions"
    ],
    "ananas-roti-au-rhum-et-miel": [
      "Whole Roasted Pineapple with Dark Rum & Honey",
      "Caribbean · slowly caramelized on rotisserie or indirect heat with vanilla"
    ],
    "bananes-au-chocolat": [
      "Campfire Roasted Chocolate Stuffed Bananas",
      "USA / France · split bananas baked in skins with melting dark chocolate and marshmallows"
    ],
    "peches-grillees-mascarpone": [
      "Grilled Summer Peaches with Amaretto Mascarpone",
      "Summer · blistered sweet peach halves with sweet almond cream"
    ],
    "crumble-pommes-fruits-rouges-fume": [
      "Smoked Apple & Berry Crisp in Cast Iron",
      "France / USA · bubbling berries and apples under golden buttery oat streusel"
    ],
    "crepes-au-kamado-plaque": [
      "French Crêpes on Plancha",
      "France / Brittany · thin golden crêpes made outdoors on flat iron"
    ],
    "cheesecake-fume": [
      "Applewood-Smoked New York Cheesecake",
      "USA · creamy cheesecake with graham crust kissed by smoke"
    ],
    "pain-perdu-grille-caramelise": [
      "Caramelized French Toast (Pain Perdu) on Cast Iron",
      "France · golden brioche slices with crunchy caramelized sugar"
    ],
    "clafoutis-aux-cerises": [
      "Traditional French Cherry Clafoutis in Ceramic Baker",
      "France / Limousin · whole sweet cherries baked in custardy flan batter"
    ],
    "tarte-tatin-au-kamado": [
      "Kamado Skillet Tarte Tatin",
      "France · caramelized butter apples with flaky upside-down pastry"
    ],
    "brownie-fondant-en-cocotte": [
      "Fudgy Dutch Oven Brownie",
      "USA · gooey dark chocolate center baked over embers"
    ],
    "s-mores-au-barbecue": [
      "Cast-Iron Skillet S'mores Dip",
      "USA · melted chocolate and toasted marshmallows with graham crackers"
    ],
    "figues-roties-miel-chevre": [
      "Roasted Figs with Honey & Goat Cheese",
      "Mediterranean · fresh figs split and warmed with aromatic thyme honey"
    ],
    "cookie-geant-en-skillet": [
      "Giant Chocolate Chip Skillet Cookie",
      "USA · warm family cookie with molten center and crispy edges"
    ],
    "poires-roties-au-vin-epice": [
      "Mulled Wine Roasted Pears",
      "France · winter pears poached in spiced red wine over embers"
    ],
    "banana-bread-fume-aux-noix": [
      "Smoked Walnut Banana Bread",
      "USA · moist banana loaf baked in ceramic oven"
    ],
    "peches-roties-mascarpone": [
      "Grilled Peaches with Vanilla Mascarpone",
      "Summer · charred sweet fruit halves with sweet mascarpone cream"
    ],
    "brownie-skillet-noix-de-pecan": [
      "Pecan Skillet Brownie on Cast Iron",
      "USA · rich chocolate cake with toasted pecans baked on kamado"
    ],
    "abricots-rotis-romarin-amande": [
      "Roasted Apricots with Rosemary & Flaked Almonds",
      "Summer · sweet tart fruit halves blistered over fire"
    ],
    "cobbler-fruits-rouges-en-fonte": [
      "Skillet Berry Cobbler in Cast Iron",
      "USA · bubbling summer berries under golden sweet biscuit crust"
    ],
    "chimichurri-argentin": [
      "Authentic Argentine Chimichurri Verde",
      "Argentina · fresh parsley, garlic, oregano, vinegar and olive oil"
    ],
    "sauce-barbecue-maison-kansas-city": [
      "Homemade Kansas City Barbecue Sauce",
      "USA · thick, sweet, tangy and smoky BBQ sauce"
    ],
    "rub-barbecue-tout-usage-sec": [
      "All-Purpose Barbecue Dry Rub",
      "USA · balanced brown sugar, smoked paprika, garlic & pepper rub"
    ],
    "beurre-maitre-d-hotel": [
      "Classic Maître d'Hôtel Compound Butter",
      "France · softened butter beaten with parsley, lemon and sea salt"
    ],
    "sauce-au-poivre-vert": [
      "Creamy Green Peppercorn Sauce",
      "France · bistro classic steak sauce with cognac reduction"
    ],
    "marinade-tandoori-au-yaourt": [
      "Spiced Yogurt Tandoori Marinade",
      "India · Greek yogurt, ginger, garlic and aromatic garam masala"
    ],
    "chermoula-marinade-maghrebine": [
      "North African Cumin & Herb Chermoula",
      "Maghreb · fresh cilantro, parsley, garlic, cumin and lemon"
    ],
    "sauce-teriyaki-maison": [
      "Homemade Japanese Teriyaki Glaze",
      "Japan · sweet soy sauce, mirin and ginger lacquer"
    ],
    "marinade-coreenne-base-bulgogi": [
      "Korean Bulgogi Marinade (Pear & Sesame)",
      "Korea · soy sauce, Asian pear, sesame oil and scallions"
    ],
    "sauce-yaourt-ail-express-facon-toum": [
      "Creamy Garlic Yogurt Sauce (Toum-Inspired)",
      "Lebanon / Mediterranean · white garlic sauce for grilled meats"
    ],
    "mojo-aux-agrumes-marinade-sauce": [
      "Cuban Citrus Mojo Marinade",
      "Cuba / Caribbean · sour orange, lime, garlic and oregano"
    ],
    "chimichurri-rouge-rojo": [
      "Spicy Red Chimichurri (Chimichurri Rojo)",
      "Argentina · pimentón and crushed chili Argentine sauce"
    ],
    "marinade-jerk-jamaicaine": [
      "Jamaican Jerk Wet Marinade",
      "Jamaica · scallions, allspice berries, Scotch bonnet and thyme"
    ],
    "beurre-de-piment-fume-chipotle": [
      "Smoked Chipotle Chili Compound Butter",
      "Fusion · spicy smoky chipotle and lime butter"
    ],
    "sauce-bbq-moutarde-et-miel-carolina-gold": [
      "Carolina Gold Honey-Mustard BBQ Sauce",
      "USA · tangy mustard, honey and cider vinegar BBQ sauce"
    ],
    "sauce-tzatziki-authentique": [
      "Authentic Greek Tzatziki Sauce",
      "Greece · strained yogurt, cucumber, garlic and dill"
    ],
    "rub-lemon-herb-poisson-et-legumes": [
      "Zesty Lemon-Herb Dry Rub",
      "Fusion · lemon zest, dried thyme, coriander and sea salt"
    ],
    "sauce-alabama-white-bbq": [
      "Authentic Alabama White Barbecue Sauce",
      "USA / Alabama · mayonnaise, apple cider vinegar, horseradish and black pepper"
    ],
    "pesto-rosso-grille-au-kamado": [
      "Charred Red Pepper & Sun-Dried Tomato Pesto Rosso",
      "Italy / Sicily · roasted peppers, toasted pine nuts, garlic and parmesan"
    ],
    "marinade-teriyaki-epicee": [
      "Spicy Ginger & Chili Teriyaki Marinade",
      "Japan / Fusion · dark soy sauce, mirin, fresh ginger and red chili flakes"
    ],
    "laque-bbq-erable-et-bourbon": [
      "Bourbon & Pure Maple Barbecue Glaze",
      "USA · caramelized Kentucky bourbon, grade-A maple syrup and smoked paprika"
    ],
    "picanha-grillee-rumsteak-bresilien": [
      "Skewered Churrasco Picanha (Brazilian Rump Cap)",
      "Brazil · thick slices bent into C-shape on skewers and seared over coals"
    ],
    "yakitori-brochettes-japonaises": [
      "Authentic Japanese Chicken Yakitori Skewers",
      "Japan · tender chicken thigh and spring onion skewers with homemade tare sauce"
    ],
    "char-siu-porc-laque-chinois": [
      "Traditional Cantonese Char Siu Roast Pork",
      "China · sweet red marinated pork shoulder roasted until sticky and caramelized"
    ],
    "satay-de-poulet-sauce-cacahuete": [
      "Chicken Satay with Peanut Sauce",
      "Indonésie/Thaïlande · brochettes parfumées"
    ],
    "bulgogi-boeuf-marine-coreen": [
      "Korean Beef Bulgogi on Sizzling Plancha",
      "Korea · thinly sliced ribeye marinated with Asian pear, soy, sesame and scallions"
    ],
    "poulet-tandoori": [
      "Classic Clay-Oven Style Red Tandoori Chicken",
      "India · yogurt, lemon and aromatic tandoori spice-marinated chicken legs"
    ],
    "souvlaki-pita-porc-grec": [
      "Greek Pork Souvlaki Pitas with Tzatziki",
      "Greece · oregano marinated skewered pork wrapped in warm pita with tomatoes & onions"
    ],
    "tacos-al-pastor": [
      "Street Style Tacos al Pastor with Pineapple",
      "Mexico · achiote pork carved into corn tortillas with cilantro and fresh onion"
    ],
    "travers-bbq-kansas-city": [
      "Kansas City Style Sweet & Sticky Smoked Ribs",
      "USA / Kansas City · brown sugar rubbed pork ribs slathered in thick sweet BBQ sauce"
    ],
    "merguez-mechoui-d-agneau": [
      "Charcoal Grilled Merguez & Mechoui Lamb",
      "North Africa · fiery spiced sausages and melting slow-roasted lamb chunks"
    ],
    "jerk-chicken-jamaicain": [
      "Authentic Jamaican Pimento Jerk Chicken",
      "Jamaica · fiery Scotch bonnet, scallions, thyme and allspice marinated chicken"
    ],
    "asado-d-entrana-chimichurri": [
      "Argentine Asado Skirt Steak (Entraña) with Chimichurri",
      "Argentina · thin flavorful beef skirt grilled over wood fire with herb chimichurri"
    ],
    "kofte-epicees-boulettes-turques": [
      "Spiced Turkish Lamb Meatballs (Köfte)",
      "Turkey · grilled minced lamb patties seasoned with cumin, onion and parsley"
    ],
    "shawarma-de-poulet": [
      "Middle Eastern Spiced Chicken Shawarma",
      "Middle East · warm spice marinated chicken sliced thin and served with garlic sauce"
    ],
    "galbi-cotes-de-boeuf-coreennes": [
      "Korean Marinated Short Ribs (Galbi / LA Galbi)",
      "Korea · flanken-cut beef ribs marinated in sweet soy, pear and garlic"
    ],
    "birria-de-boeuf-tacos": [
      "Cheesy Beef Birria Tacos with Consommé",
      "Mexico / Jalisco · slow-braised chili beef dipped in broth and griddled with Oaxaca cheese"
    ],
    "kleftiko-agneau-grec-a-l-etouffee": [
      "Slow-Smothered Greek Lamb Kleftiko",
      "Greece · tender lamb baked with oregano, garlic, white wine and lemon"
    ],
    "tagine-d-agneau-aux-abricots": [
      "Clay Baker Lamb Tagine with Dried Apricots & Almonds",
      "Morocco · fragrant slow-simmered lamb with cinnamon, saffron and toasted nuts"
    ],
    "boerewors-facon-braai": [
      "South African Boerewors Sausage on the Braai",
      "South Africa · traditional beef and pork spiral sausage spiced with coriander seeds"
    ],
    "lahmacun-pizza-turque": [
      "Crisp Turkish Lahmacun Flatbread",
      "Turkey · ultra-thin crispy base with spiced minced lamb, parsley and fresh lemon"
    ],
    "gyros-de-porc-grec": [
      "Greek Pork Gyros with Homemade Tzatziki",
      "Greece · rotisserie seasoned pork wrapped in warm flatbread with fries and sauce"
    ],
    "carne-asada-tacos-mexicains": [
      "Charred Carne Asada Street Tacos",
      "Mexico / Sonora · citrus-marinated flank steak chopped over warm corn tortillas"
    ],
    "tsukune-boulettes-de-poulet-japonaises": [
      "Japanese Tsukune Chicken Meatball Skewers",
      "Japan · seasoned minced chicken skewers glazed with sweet tare and egg yolk dip"
    ],
    "pinchos-morunos-brochettes-espagnoles": [
      "Spanish Moorish Pork Skewers (Pinchos Morunos)",
      "Spain / Andalusia · pork cubes marinated in cumin, coriander, saffron and paprika"
    ],
    "thit-nuong-porc-citronnelle-vietnamien": [
      "Vietnamese Lemongrass Grilled Pork (Thịt Nướng)",
      "Vietnam · fragrant caramel lemongrass pork served over rice noodles"
    ],
    "pollo-a-la-brasa-poulet-peruvien": [
      "Peruvian Pollo a la Brasa (Roast Chicken)",
      "Peru · dark beer, soy, cumin and huacatay marinated whole rotisserie chicken"
    ],
    "chicken-tikka-inde": [
      "Smoky Boneless Chicken Tikka Bites",
      "India · yogurt, turmeric and chili marinated chicken breast bites charred on skewers"
    ],
    "samgyeopsal-poitrine-de-porc-coreenne": [
      "Korean Thick Pork Belly (Samgyeopsal) on Cast Iron",
      "Korea · thick unseasoned pork belly grilled at the table and dipped in sesame oil salt"
    ],
    "lomo-al-trapo-boeuf-au-torchon": [
      "Colombian Salt-Crust Cloth Beef (Lomo al Trapo)",
      "Colombia · beef tenderloin wrapped in wine-soaked cloth with salt thrown directly on coals"
    ],
    "chuan-r-d-agneau-au-cumin-piment": [
      "Beijing Street Style Lamb Skewers (Chuan'r)",
      "China / Xinjiang · fatty lamb skewers dusted with heavy toasted cumin and chili powder"
    ],
    "kabab-koobideh-brochettes-d-agneau-perses": [
      "Persian Saffron Lamb Kabab Koobideh",
      "Iran / Persia · tender minced lamb and onion skewers seasoned with saffron and sumac"
    ],
    "sosaties-d-agneau-au-curry-abricot": [
      "Cape Malay Lamb & Apricot Sosaties",
      "South Africa · skewered lamb marinated in sweet curry, tamarind and dried apricots"
    ],
    "suya-de-boeuf-nigerian-a-l-arachide": [
      "Nigerian Spicy Beef Suya Skewers",
      "Nigeria · thinly sliced beef coated in fiery kuli-kuli peanut spice mix (Yaji)"
    ],
    "espetada-de-boeuf-au-laurier-maderienne": [
      "Madeiran Beef Skewers on Bay Laurel Wood (Espetada)",
      "Portugal / Madeira · beef cubes skewered on green bay laurel branches over hot coals"
    ],
    "daeji-bulgogi-porc-epice-coreen": [
      "Spicy Korean Pork Bulgogi (Daeji Bulgogi)",
      "Korea · thin pork belly and shoulder marinated in hot gochujang and grilled crispy"
    ],
    "bo-la-lot-boeuf-en-feuilles-de-betel": [
      "Vietnamese Beef Wrapped in Betel Leaves (Bò Lá Lốt)",
      "Vietnam · aromatic minced beef rolls wrapped in piper sarmentosum leaves"
    ],
    "char-siu-cantonais-laque": [
      "Classic Cantonese Char Siu Barbecue Pork",
      "China / Canton · honey and fermented bean curd lacquered pork collar"
    ],
    "smoked-queso-dip-au-kamado": [
      "Kamado Smoked Cast-Iron Queso Dip",
      "USA / Tex-Mex · melted cheese, roasted peppers, chorizo and tomatoes in iron skillet"
    ],
    "burger-vegetarien-haricots-champignons": [
      "Smoky Black Bean & Mushroom Veggie Burger",
      "Modern / Vegan · hearty seasoned patty with caramelized onions and BBQ sauce"
    ],
    "brochettes-halloumi-legumes": [
      "Charred Halloumi & Mediterranean Vegetable Skewers",
      "Greece · firm squeaky cheese skewered with zucchini, cherry tomatoes and peppers"
    ],
    "aubergine-entiere-fumee-facon-steak": [
      "Thick Smoked Eggplant Steaks with Garlic Oil",
      "Mediterranean · whole smoked eggplant sliced and seared with lemon and parsley"
    ],
    "chou-pointu-roti-au-beurre-noisette": [
      "Charred Hispi / Pointed Cabbage with Brown Butter",
      "Modern · caramelized quarters with nutty brown butter and flaky sea salt"
    ],
    "tofu-marine-grille-teriyaki": [
      "Teriyaki Glazed Firm Tofu Steaks",
      "Japan / Fusion · crisp sesame crust and savory sweet glaze grilled on iron"
    ],
    "butternut-rotie-sauce-tahini": [
      "Roasted Butternut Squash Wedges with Lemon Tahini",
      "Middle East · caramelized orange squash drizzled with creamy sesame sauce"
    ],
    "poivrons-farcis-riz-feta": [
      "Greek Stuffed Bell Peppers with Rice, Herbs & Feta",
      "Greece · sweet peppers filled with fragrant rice and baked in Dutch oven"
    ],
    "parmigiana-d-aubergines-en-cocotte": [
      "Dutch Oven Eggplant Parmigiana (Parmigiana di Melanzane)",
      "Italy · layered fried eggplant, rich tomato sauce, basil and molten mozzarella"
    ],
    "shakshuka-en-cocotte": [
      "Cast Iron Spiced Tomato Shakshuka with Poached Eggs",
      "North Africa / Middle East · sweet peppers and cumin tomato sauce with runny eggs"
    ],
    "patatas-bravas-grillees": [
      "Charred Patatas Bravas with Spicy Tomato Sauce",
      "Spain · crispy potatoes with fiery pimentón sauce and garlic alioli"
    ],
    "tofu-fume-laque-miso-sesame": [
      "Miso-Sesame Lacquered Smoked Tofu Cubes",
      "Japan · sweet umami glaze crisped over lump hardwood charcoal"
    ],
    "steaks-de-chou-rouge-fumes": [
      "Smoked Red Cabbage Steaks with Balsamic Reduction",
      "Modern · thick purple rounds infused with fruitwood smoke and caramelized"
    ],
    "celeri-rave-entier-roti-comme-une-piece": [
      "Whole Roasted Celeriac 'Treated Like Prime Rib'",
      "Modern Bistro · slow-roasted whole root vegetable basted in thyme butter"
    ],
    "quesadillas-legumes-fumes": [
      "Smoked Vegetable & Pepper Jack Quesadillas",
      "Mexico / Tex-Mex · charred vegetables and molten cheese folded in crisp tortillas"
    ],
    "beer-can-cabbage-chou-a-la-biere": [
      "Beer Can Whole Cabbage on Indirect Heat",
      "USA / Modern · whole green cabbage roasted upright over a can of stout or IPA"
    ],
    "provoleta-grille-fromage-argentin": [
      "Cast Iron Grilled Argentine Provoleta Cheese",
      "Argentina · bubbling melted provolone with oregano, chili flakes and crusty bread"
    ],
    "tandoori-gobi-chou-fleur-tandoori": [
      "Tandoori Gobi (Whole Spiced Cauliflower)",
      "Inde · chou-fleur rôti entier aux épices"
    ],
    "pluma-iberique-a-la-plancha-fleur-de-sel-romarin": [
      "Plancha-Seared Ibérico Pork Pluma",
      "Spain · noble acorn-fed bellota cut with sea salt and rosemary"
    ],
    "presa-iberique-marinee-au-pimenton-de-la-vera-ail-doux": [
      "Marinated Ibérico Pork Presa with Pimentón",
      "Spain · heavily marbled bellota cut with sweet smoked paprika"
    ],
    "ris-de-veau-braises-au-foin-puis-dores-sur-fonte": [
      "Hay-Braised Veal Sweetbreads Crisped on Cast Iron",
      "France · haute gastronomy delicacy gently braised then seared in butter"
    ],
    "cote-de-veau-epaisse-aux-morilles-et-vin-jaune": [
      "Thick Cut Veal Chop with Morels & Vin Jaune",
      "France / Franche-Comté · generous bone-in chop seared with wild mushrooms and Jura wine"
    ],
    "canard-laque-croustillant-au-kamado-facon-pekin": [
      "Crispy Kamado Peking Duck",
      "China / Beijing · glassy crackling skin and carved roast duck"
    ],
    "supremes-de-pintade-fermiere-rotis-sous-peau-aux-morilles": [
      "Guinea Fowl Supremes Roasted with Morels under Skin",
      "France · farm-raised poultry gently roasted with wild mushrooms"
    ],
    "turbot-entier-grille-en-panier-sur-braises-vives-facon-getaria": [
      "Whole Grilled Turbot in Wire Basket (Getaria Style)",
      "Basque Country · master of marine fire with txakoli vinegar spray"
    ],
    "saint-pierre-roti-entier-au-thym-citron-et-fenouil-sauvage": [
      "Whole Roasted John Dory with Lemon Thyme & Wild Fennel",
      "Mediterranean · noble firm fish roasted on indirect heat"
    ],
    "tataki-de-thon-rouge-marine-au-yuzu-croute-de-sesame-noir": [
      "Yuzu-Marinated Bluefin Tuna Tataki with Black Sesame",
      "Japan · flash 300 °C sear with sashimi-grade center"
    ],
    "eclade-de-moules-aux-aiguilles-de-pin-facon-kamado": [
      "Pine-Needle Torched Mussels (Éclade de Moules)",
      "France / Charente · spectacular outdoor blaze with dried pine needles"
    ],
    "baingan-bharta-caviar-d-aubergines-brulees-fumees-a-l-indienne": [
      "Baingan Bharta (Indian Smoked Eggplant Caviar)",
      "India / Punjab · charred smoky eggplant with tomato and spices"
    ],
    "barigoule-d-artichauts-poivrade-au-lard-et-vin-blanc-en-cocotte": [
      "Provencal Artichoke Barigoule with Pancetta",
      "France / Provence · baby artichokes braised in white wine and herbs"
    ],
    "kofte-d-agneau-et-boeuf-au-sumac-menthe-sur-brochettes": [
      "Lamb & Beef Kofte Skewers with Mint & Sumac",
      "Turquie / Moyen-Orient · brochettes juteuses au goût de braise"
    ],
    "satay-de-boeuf-balinais-a-la-citronnelle-sauce-cacahuete": [
      "Balinese Beef Satay with Lemongrass & Peanut Sauce",
      "Indonésie / Bali · brochettes parfumées mariné minute"
    ],
    "tacos-de-birria-de-boeuf-fume-au-kamado-consomme-mijote": [
      "Smoked Beef Birria Tacos with Rich Dipping Consommé",
      "Mexique / Jalisco · bœuf fondant effiloché et tortillas trempées"
    ],
    "giant-skillet-cookie-aux-pepites-de-chocolat-en-poele-fonte": [
      "Giant Chocolate Chip Cookie in Cast Iron Skillet",
      "USA · sharing dessert with molten center and crispy crust"
    ],
    "poires-pochees-fumees-au-vin-chaud-et-epices-douces": [
      "Smoked Mulled Wine Poached Pears with Sweet Spices",
      "France / Terroir · comforting winter dessert infused with embers"
    ],
    "steak-de-chou-fleur-roti-au-kamado-chimichurri-frais": [
      "Roasted Cauliflower Steak with Fresh Chimichurri",
      "Argentine / Végétal contemporain · la tranche rôtie aux braises"
    ],
    "sauce-alabama-white-bbq-sauce-blanche-mayo-vinaigre": [
      "Alabama White BBQ Sauce",
      "USA / Alabama · l'iconique sauce de Big Bob Gibson"
    ],
    "sauce-carolina-gold-moutarde-bbq-de-caroline-du-sud": [
      "South Carolina Gold Mustard BBQ Sauce",
      "USA / South Carolina · la sauce acidulée et dorée des colons allemands"
    ]
  };

  const CULINARY_TERMS = {
    doneness: {
      "saignant": "rare (52–54 °C)",
      "bleu": "extra rare (48–50 °C)",
      "à point": "medium (56–58 °C)",
      "rosé": "medium-rare / pink (54–56 °C)",
      "bien cuit": "well-done (65+ °C)",
      "fondant": "melt-in-mouth tender",
      "effiloché": "pull-apart tender (93–96 °C)",
      "effilochage": "pull-apart tender (93–96 °C)",
      "cuit à cœur": "fully cooked to center",
      "nacré": "pearlescent / translucent",
      "croustillant": "crispy"
    },
    woods: {
      "Chêne": "Oak",
      "Hêtre": "Beech",
      "Pommier": "Applewood",
      "Cerisier": "Cherrywood",
      "Hickory": "Hickory",
      "Mesquite": "Mesquite",
      "Pécan": "Pecan",
      "Olivier": "Olive wood",
      "Aulne": "Alder",
      "Vigne": "Grapevine cuttings",
      "Chêne ou hêtre": "Oak or beech",
      "Pommier ou cerisier": "Applewood or cherrywood",
      "Hickory ou chêne": "Hickory or oak",
      "Foin": "Organic culinary hay"
    },
    vents: {
      "grand ouvert": "wide open",
      "ouvert grand": "wide open",
      "ouvert 1/2": "half open",
      "ouvert à 1/2": "half open",
      "ouvert 1/3": "1/3 open",
      "ouvert 1/4": "quarter open",
      "fente de 2 mm": "2 mm crack",
      "fente de 3 mm": "3 mm crack",
      "fente de 5 mm": "5 mm crack",
      "fente 2 mm": "2 mm crack",
      "fermé": "closed",
      "fermé presque": "almost closed",
      "ouvert à fond": "fully open"
    },
    equipment: {
      "déflecteur céramique": "ceramic heat deflector",
      "pierre céramique": "ceramic heat deflector",
      "pierre à pizza": "pizza stone",
      "panier à charbon inox": "stainless charcoal basket",
      "panier à charbon": "charcoal basket",
      "plancha fonte": "cast iron griddle / plancha",
      "plancha": "cast iron plancha",
      "cocotte en fonte": "cast iron Dutch oven",
      "thermomètre sonde": "probe thermometer",
      "sonde": "probe thermometer",
      "lèchefrite": "drip pan",
      "rehausseur de grille": "grate riser",
      "grille en fonte": "cast iron grate",
      "tournebroche": "rotisserie spit",
      "pelle à pizza": "pizza peel",
      "pince longue": "long grilling tongs",
      "gants anti-chaleur": "heat-resistant BBQ gloves",
      "papier boucher": "peach butcher paper",
      "feuille d'aluminium": "aluminum foil"
    }
  };

  function getRecipeName(recipe, lang = "fr") {
    if (!recipe) return "";
    if (lang === "en" && RECIPES_EN[recipe.id]) {
      return RECIPES_EN[recipe.id][0] || recipe.nom;
    }
    return recipe.nom;
  }

  function getRecipeOrigin(recipe, lang = "fr") {
    if (!recipe) return "";
    if (lang === "en" && RECIPES_EN[recipe.id]) {
      return RECIPES_EN[recipe.id][1] || recipe.ori;
    }
    return recipe.ori;
  }

  function translateDoneness(text, lang = "fr") {
    if (!text || lang !== "en") return text;
    let res = String(text);
    for (const [fr, en] of Object.entries(CULINARY_TERMS.doneness)) {
      res = res.replace(new RegExp(fr, "gi"), en);
    }
    return res;
  }

  function translateWood(text, lang = "fr") {
    if (!text || lang !== "en") return text;
    return CULINARY_TERMS.woods[text] || text;
  }

  function translateVentValue(val, lang = "fr") {
    if (!val || lang !== "en") return val;
    return CULINARY_TERMS.vents[val] || val;
  }

  function translateEquipmentItem(item, lang = "fr") {
    if (!item || lang !== "en") return item;
    const lower = item.toLowerCase();
    for (const [fr, en] of Object.entries(CULINARY_TERMS.equipment)) {
      if (lower.includes(fr)) return en;
    }
    return item;
  }

  function translateIngredientLine(line, lang = "fr") {
    if (!line || lang !== "en") return line;
    return line
      .replace(/c\.\s*à\s*s\./gi, "tbsp")
      .replace(/c\.\s*à\s*c\./gi, "tsp")
      .replace(/\bgros sel\b/gi, "coarse sea salt")
      .replace(/\bfleur de sel\b/gi, "flaky sea salt")
      .replace(/\bpoivre du moulin\b/gi, "freshly ground black pepper")
      .replace(/\bhuile d'olive\b/gi, "extra virgin olive oil")
      .replace(/\bhuile neutre\b/gi, "neutral high-heat oil")
      .replace(/\bgousse d'ail\b/gi, "garlic clove")
      .replace(/\bgousses d'ail\b/gi, "garlic cloves")
      .replace(/\bbeurre\b/gi, "butter")
      .replace(/\bcrème fraîche\b/gi, "crème fraîche")
      .replace(/\boignon\b/gi, "onion")
      .replace(/\boignons\b/gi, "onions")
      .replace(/\bpersil frais\b/gi, "fresh parsley")
      .replace(/\bpersil\b/gi, "parsley")
      .replace(/\bbrins? de thym\b/gi, "thyme sprigs")
      .replace(/\bbrins? de romarin\b/gi, "rosemary sprigs")
      .replace(/\bjus de citron\b/gi, "lemon juice")
      .replace(/\bzeste de citron\b/gi, "lemon zest")
      .replace(/\bpapier boucher\b/gi, "butcher paper")
      .replace(/\bfeuille de laurier\b/gi, "bay leaf")
      .replace(/\bpour servir\b/gi, "for serving");
  }

  function translateStepLine(line, lang = "fr") {
    if (!line || lang !== "en") return line;
    return line
      .replace(/\bSortez la viande 1 h avant\b/gi, "Take the meat out 1 hr ahead")
      .replace(/\bséchez-la bien\b/gi, "pat thoroughly dry")
      .replace(/\bsalez généreusement\b/gi, "season generously with salt")
      .replace(/\bConfig indirecte\b/gi, "Indirect setup")
      .replace(/\bpierre céramique en déflecteur\b/gi, "ceramic heat deflector plate")
      .replace(/\bplantez la sonde au cœur\b/gi, "insert probe into the thermal core")
      .replace(/\bLaissez reposer\b/gi, "Let rest")
      .replace(/\bavant de trancher\b/gi, "before slicing against the grain")
      .replace(/\bévents ouverts\b/gi, "vents fully open")
      .replace(/\bbraises vives\b/gi, "hot glowing embers")
      .replace(/\bSaisissez\b/gi, "Sear")
      .replace(/\bpar face\b/gi, "per side");
  }

  return {
    RECIPES_EN,
    CULINARY_TERMS,
    getRecipeName,
    getRecipeOrigin,
    translateDoneness,
    translateWood,
    translateVentValue,
    translateEquipmentItem,
    translateIngredientLine,
    translateStepLine
  };
});
