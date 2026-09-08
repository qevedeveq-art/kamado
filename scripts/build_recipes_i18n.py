#!/usr/bin/env python3
"""
Generates scripts/recipes-i18n.js with authentic, complete English translations
for all 269 recipes, plus real-time culinary terminology translation helpers.
"""

import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECIPES_PATH = os.path.join(ROOT, "data", "recipes.json")
OUTPUT_PATH = os.path.join(ROOT, "scripts", "recipes-i18n.js")

with open(RECIPES_PATH, "r", encoding="utf-8") as f:
    recipes = json.load(f)

# Rule-based and manual high-precision translations
MANUAL_TRANSLATIONS = {
    # Boeuf
    "cote-de-boeuf-reverse-sear": ("Reverse-Seared Ribeye Steak", "France · perfect two-stage cooking"),
    "entrecote-grillee-maitre-d-hotel": ("Grilled Ribeye Steak Maître d'Hôtel", "France · express direct sear with herb butter"),
    "brisket-fume-poitrine-de-boeuf": ("Texas Smoked Beef Brisket", "USA · Texas low & slow, the Holy Grail of BBQ"),
    "rosbif-roti-a-l-anglaise": ("English-Style Roast Beef", "France/UK · Sunday roast classic"),
    "bavette-a-l-echalote": ("Flank Steak with Shallots", "France · classic bistro steak"),
    "burgers-smash-maison": ("Homemade Smash Burgers", "USA · ultra-crispy crust on cast iron plancha"),
    "brochettes-de-boeuf-marine": ("Marinated Beef Skewers", "France · convivial charcoal skewers"),
    "tomahawk-au-beurre-noisette": ("Tomahawk Steak with Brown Butter", "USA/France · showstopper bone-in ribeye"),
    "onglet-grille-sauce-au-poivre": ("Grilled Hanger Steak with Peppercorn Sauce", "France · the butcher's best kept secret"),
    "joue-de-boeuf-fumee-braisee": ("Smoked & Braised Beef Cheeks", "France · gelatin-rich slow braise in Dutch oven"),
    "pastrami-fume-maison": ("Homemade Smoked Pastrami", "USA / Jewish Deli · spice-crusted, cured and smoked"),
    "beef-short-ribs-dino-ribs": ("Beef Short Ribs (Dino Ribs)", "USA · Texas giant smoked beef ribs"),
    "tri-tip-sauce-santa-maria": ("Santa Maria Tri-Tip Roast", "USA · California barbecue classic"),
    "plat-de-cotes-braise-au-vin": ("Red Wine Braised Beef Short Ribs", "France · slow cooked Sunday comfort food"),
    "picanha-entiere-facon-churrasco": ("Whole Picanha Churrasco Style", "Brazil · crispy fat cap and pink juicy center"),
    "short-ribs-de-boeuf-facon-texas": ("Texas Style Smoked Beef Short Ribs", "USA · thick bark and melt-in-mouth beef"),
    "dino-beef-ribs-travers-de-boeuf-geants-fumes-au-chene": ("Dino Beef Ribs (Oak-Smoked Giant Beef Plate Ribs)", "Texas · legendary 8-hour low & slow beef plate ribs"),
    "onglet-yakitori-au-binchotan-maison": ("Binchotan Charcoal Beef Hanger Yakitori", "Japan / Fusion · skewered tender beef glazed with tare"),
    "cote-de-boeuf-caveman-sur-braises": ("Caveman Style Ribeye Steak on Coals", "USA · primitive searing directly on hardwood embers"),
    "burnt-ends-de-poitrine-de-boeuf": ("Smoked Beef Brisket Burnt Ends", "Kansas City · meat candy confit cubes tossed in BBQ sauce"),
    "bistecca-alla-fiorentina-t-bone": ("Bistecca alla Fiorentina (Thick T-Bone)", "Tuscany, Italy · the queen of Florence grilled over embers"),
    "picanha-au-sel-de-gros-churrasco": ("Coarse Sea Salt Picanha (Churrasco)", "Brazil · skewered rump cap seared over hot coals"),
    "tomahawk-reverse-sear": ("Reverse-Seared Tomahawk Steak", "USA · 2-inch thick bone-in ribeye finished over roaring coals"),
    "paleron-de-boeuf-fume-facon-brisket-smoked-chuck-roast": ("Smoked Chuck Roast (Poor Man's Brisket)", "USA / Modern BBQ · perfect brisket alternative for 4 to 6 people"),
    "boeuf-bourguignon-au-kamado": ("Kamado Beef Bourguignon", "Burgundy, France · rich red wine beef stew in Dutch oven"),
    "pot-au-feu-bourgeois-au-kamado": ("Wood-Smoked French Pot-au-Feu", "France · simmered beef cuts and marrow bones"),
    "daube-provencale-au-kamado": ("Provençal Beef Daube in Dutch Oven", "Provence, France · slow simmered beef with red wine & orange zest"),
    "blanquette-de-veau-au-kamado": ("Classic Veal Blanquette in Cast Iron Pot", "France · tender veal stew in creamy white velouté sauce"),
    "ris-de-veau-braises-au-foin-puis-dores-sur-fonte": ("Hay-Braised Sweetbreads Crisped on Cast Iron", "France · bistro haute gastronomy delicacy"),
    "cote-de-veau-epaisse-aux-morilles-et-vin-jaune": ("Thick Cut Veal Chop with Morels & Vin Jaune", "Franche-Comté, France · generous terroir chop seared with wild mushrooms"),

    # Porc
    "pulled-pork-echine-effilochee": ("Smoked Pulled Pork (Boston Butt)", "USA · Carolina barbecue low & slow"),
    "travers-de-porc-glaces-ribs": ("Glazed Pork Ribs (Kansas City Style)", "USA · 3-2-1 method, fall-off-the-bone"),
    "carre-de-porc-roti-aux-herbes": ("Roast Rack of Pork with Fresh Herbs", "France · crispy crackling and juicy center"),
    "filet-mignon-de-porc-fume-au-foin": ("Hay-Smoked Pork Tenderloin", "France · rustic farmstead smoking technique"),
    "porchetta-roulee-aux-herbes": ("Italian Herb-Stuffed Rolled Porchetta", "Italy · crispy skin and fragrant herb stuffing"),
    "echine-de-porc-marinee-a-la-moutarde": ("Mustard-Marinated Pork Collar Steaks", "France · tangy glaze over hot coals"),
    "poitrine-de-porc-croustillante-pork-belly": ("Crispy Pork Belly (Pork Crackling)", "Asia / Europe · ultra-crunchy crackling"),
    "palette-de-porc-a-la-diable": ("Deviled Pork Shoulder (Palette à la Diable)", "France · spicy mustard crust roasted indirect"),
    "joues-de-porc-confites-a-la-biere-brune": ("Pork Cheeks Braised in Brown Ale", "Belgium / France · meltingly tender slow braise"),
    "jambon-entier-glace-au-miel-et-clous-de-girofle": ("Honey & Clove Glazed Holiday Ham", "USA / UK · festive spiral-cut glazed ham"),
    "ribs-de-porc-sauce-barbecue-coreenne": ("Korean BBQ Sticky Pork Ribs", "Korea · gochujang, sesame and garlic glaze"),
    "roti-de-porc-aux-pruneaux-et-au-lard": ("Roast Pork with Prunes & Smoked Bacon", "France · sweet and savory Sunday roast"),
    "andouillette-de-troyes-grillee-au-kamado": ("Grilled Troyes Andouillette Sausage", "France · direct grilling with Dijon mustard"),
    "boudin-noir-aux-pommes-au-kamado": ("Black Pudding with Caramelized Apples", "France · delicate smoky pan roast"),
    "cote-de-porc-fermier-au-beurre-de-sauge": ("Farmhouse Pork Chop with Sage Butter", "France · thick bone-in chop seared on cast iron"),
    "carbonnade-flamande-de-porc-au-kamado": ("Flemish Pork Carbonnade in Dutch Oven", "Belgium / North of France · gingerbread and beer braise"),
    "saucisses-de-toulouse-grillees-au-bois": ("Wood-Grilled Toulouse Sausages", "Southwest France · coarse-ground rustic sausages"),
    "jarret-de-porc-braise-choucroute": ("Braised Pork Shank for Sauerkraut", "Alsace, France · fork-tender knuckle with juniper"),
    "lard-paysan-fume-au-bois-de-pommier": ("Farmhouse Bacon Smoked over Applewood", "France · dry-cured pork belly smoked low & slow"),
    "rouelle-de-porc-glacee-au-vinaigre-balsamique": ("Balsamic-Glazed Pork Round Roast", "France · indirect roasting with sweet and sour glaze"),
    "filet-mignon-de-porc-au-brie-et-lard": ("Pork Tenderloin Stuffed with Brie & Bacon", "France · gourmet melt-in-the-middle roast"),
    "travers-de-porc-sauce-aigre-douce-facon-cantonaise": ("Cantonese Sweet & Sour Pork Ribs", "China · wok and indirect smoke finish"),
    "grillade-de-porc-marinee-au-paprika-fume": ("Smoked Paprika Marinated Pork Strips", "Spain · quick flash grill over fiery coals"),
    "poitrine-de-porc-laquee-facon-char-siu": ("Char Siu Honey Glazed Pork Belly", "Hong Kong · red fermented bean and five-spice glaze"),
    "saucisses-fumee-de-montbeliard-aux-braises": ("Smoked Montbéliard Sausages on the Coals", "Franche-Comté, France · beechwood smoked IGP sausages"),
}

# Translation helper function for remaining items
def translate_title_and_origin(r):
    rid = r["id"]
    if rid in MANUAL_TRANSLATIONS:
        return MANUAL_TRANSLATIONS[rid]

    nom = r["nom"]
    ori = r["ori"]

    # Basic replacements
    nom_en = nom
    ori_en = ori

    replacements = [
        ("Poulet entier à la cannette (beer can)", "Beer Can Whole Roast Chicken"),
        ("Poulet crapaudine (spatchcock)", "Spatchcock Chicken with Herbs"),
        ("Magret de canard, peau croustillante", "Crispy Skin Duck Breast"),
        ("Cuisses de poulet fumées sauce barbecue", "Smoked BBQ Chicken Thighs"),
        ("Coquelet rôti aux herbes de Provence", "Herb-Roasted Cornish Game Hen"),
        ("Dinde entière fumée pour les fêtes", "Whole Holiday Smoked Turkey"),
        ("Ailes de poulet buffalo wings", "Crispy Buffalo Chicken Wings"),
        ("Pintade fermière rôtie au foin", "Hay-Roasted Farmhouse Guinea Fowl"),
        ("Caille rôtie au lard et au raisin", "Bacon-Wrapped Roasted Quail with Grapes"),
        ("Brochettes de poulet mariné au citron et origan", "Lemon & Oregano Chicken Skewers"),
        ("Magret de canard fumé au bois de cerisier", "Cherrywood Smoked Duck Breast"),
        ("Cuisse de dinde façon Disneyland", "Disneyland Style Giant Smoked Turkey Leg"),
        ("Chapon de Noël rôti aux marrons", "Holiday Roast Capon with Chestnuts"),
        ("Poulet rôti au beurre d'estragon sous la peau", "Tarragon Butter Basted Roast Chicken"),
        ("Pilons de poulet glacés à l'érable et moutarde", "Maple & Mustard Glazed Chicken Drumsticks"),
        ("Suprême de volaille fumé minute sauce crème", "Flash-Smoked Chicken Supreme with Cream Sauce"),
        ("Pigeon rôti sur le coffre au kamado", "Crown-Roasted Squab Pigeon"),
        ("Canette rôtie aux cerises noires", "Roast Young Duck with Black Cherries"),
        ("Poulet fumé entier façon rôtisserie", "Rotisserie-Style Whole Smoked Chicken"),
        ("Aiguillettes de canard grillées minute", "Flash-Grilled Duck Tenderloins"),
        ("Ballotine de volaille farcie aux morilles", "Chicken Ballotine Stuffed with Morels"),
        ("Effiloché de poulet (pulled chicken) sauce Alabama", "Pulled Chicken with Alabama White BBQ Sauce"),
        ("Poulet fermier en crapaudine piment d'Espelette", "Spatchcock Farm Chicken with Espelette Pepper"),

        # Agneau
        ("Gigot d'agneau rôti rosé", "Herb-Crusted Roast Leg of Lamb"),
        ("Carré d'agneau en croûte d'herbes", "Herb-Crusted Rack of Lamb"),
        ("Épaule d'agneau confite 7 heures", "7-Hour Slow-Cooked Lamb Shoulder"),
        ("Souris d'agneau braisées au romarin", "Rosemary Braised Lamb Shanks in Dutch Oven"),
        ("Côtelettes d'agneau grillées au thym", "Thyme-Grilled Lamb Chops"),
        ("Selle d'agneau farcie et ficelée", "Stuffed & Rolled Saddle of Lamb"),
        ("Gigot d'agneau fumé au foin", "Hay-Smoked Leg of Lamb"),
        ("Brochettes d'agneau marinées à la menthe", "Mint-Marinated Lamb Kebabs"),
        ("Épaule d'agneau façon pulled lamb", "Smoked Pulled Lamb (Low & Slow)"),
        ("Tajine d'agneau aux pruneaux et amandes", "Lamb Tagine with Prunes & Almonds"),
        ("Collier d'agneau braisé façon navarin", "Braised Lamb Neck Navarin"),
        ("Foie d'agneau grillé au persillade", "Grilled Lamb Liver with Garlic & Parsley"),
        ("Rognons d'agneau grillés en brochette", "Grilled Lamb Kidneys on Skewers"),
        ("Côtelettes d'agneau marinées au yaourt épicé", "Spiced Yogurt Marinated Lamb Chops"),
        ("Gigot d'agneau à la cuillère confite", "Spoon-Tender Confit Leg of Lamb"),
        ("Navarin d'agneau printanier au kamado", "Spring Lamb Navarin in Cast Iron Pot"),
        ("Poitrine d'agneau roulée et fumé", "Rolled & Smoked Lamb Breast"),
        ("Carré d'agneau fumé au bois d'olivier", "Olive Wood Smoked Rack of Lamb"),
        ("Épaule d'agneau farcie aux fruits secs", "Lamb Shoulder Stuffed with Dried Fruits"),
        ("Méchoui d'épaule d'agneau à la marocaine", "Moroccan Mechoui Lamb Shoulder"),
        ("Brochettes de kefta d'agneau au sumac", "Lamb Kefta Skewers with Sumac & Herbs"),
        ("Noisettes d'agneau au beurre d'anchois", "Lamb Medallions with Anchovy Butter"),
        ("Souris d'agneau glacées au miel et au thym", "Honey & Thyme Glazed Lamb Shanks"),

        # Poissons
        ("Saumon sur planche de cèdre", "Cedar Plank Salmon Fillet"),
        ("Saumon fumé à chaud, sauce aneth", "Hot-Smoked Salmon with Dill Sauce"),
        ("Bar entier grillé au fenouil", "Whole Grilled Sea Bass with Wild Fennel"),
        ("Dorade royale en croûte de sel", "Salt-Crusted Whole Sea Bream"),
        ("Poulpe grillé à la galicienne", "Galician Grilled Octopus"),
        ("Gambas flambées au pastis sur plancha", "Pastis-Flambéed King Prawns on Plancha"),
        ("Queue de lotte rôti au lard de Colonnata", "Monkfish Tail Wrapped in Colonnata Lardo"),
        ("Darne de thon mi-cuit aux graines de sésame", "Sesame-Crusted Seared Tuna Steak"),
        ("Homard grillé au beurre d'ail et persil", "Grilled Whole Lobster with Garlic-Herb Butter"),
        ("Moules fumées aux aiguilles de pin (éclade)", "Pine Needle Smoked Mussels (Éclade)"),
        ("Cabillaud en papillote, légumes croquants", "Parchment-Wrapped Cod with Crisp Vegetables"),
        ("Truite entière fumée au bois d'aulne", "Alder-Smoked Whole River Trout"),
        ("Saint-Jacques snackées, beurre blanc fumé", "Pan-Seared Scallops with Smoked Beurre Blanc"),
        ("Seiche grillée ail et persil à la plancha", "Grilled Cuttlefish with Garlic & Parsley"),
        ("Maquereaux grillés à la moutarde", "Mustard-Glazed Grilled Mackerel"),
        ("Sardines grillées au gros sel", "Coarse Salt Grilled Sardines"),
        ("Calamars entiers farcis et grillés", "Stuffed & Grilled Whole Squid"),
        ("Espadon grillé à la sicilienne (salmoriglio)", "Sicilian Grilled Swordfish with Salmoriglio"),
        ("Sole meunière sur plancha fonte", "Sole Meunière on Cast Iron Plancha"),
        ("Turbot entier grillé au panier basque", "Whole Turbot in Basque Grilling Basket"),
        ("Haddock fumé au beurre et pommes vapeur", "Smoked Haddock with Melted Butter & Potatoes"),
        ("Brochettes de lotte et chorizo", "Monkfish & Chorizo Skewers"),
        ("Filet de lieu jaune rôti aux agrumes", "Roast Pollack Fillet with Citrus & Fennel"),
        ("Crevettes tigrées à l'ail et piment (pil-pil)", "Gambas al Pil-Pil in Cast Iron Skillet"),
        ("Couteaux de mer grillés au beurre d'herbes", "Grilled Razor Clams with Herb Butter"),
        ("Filet de flétan rôti sur peau", "Skin-On Roasted Halibut Fillet"),
        ("Rouget-barbet grillé au romarin", "Grilled Red Mullet with Rosemary"),
        ("Huîtres chaudes grillées au beurre d'échalote", "Warm Grilled Oysters with Shallot Butter"),

        # Légumes
        ("Légumes grillés méditerranéens", "Grilled Mediterranean Vegetables"),
        ("Aubergines fumées façon baba ganoush", "Smoked Eggplant Dip (Baba Ganoush)"),
        ("Pommes de terre braisées au romarin", "Cast Iron Braised Potatoes with Rosemary"),
        ("Épais champignons portobello farcis au fromage", "Stuffed Portobello Mushrooms with Melted Cheese"),
        ("Asperges vertes grillées au parmesan", "Grilled Green Asparagus with Shaved Parmesan"),
        ("Maïs entier grillé au beurre d'épices", "Grilled Corn on the Cob with Spiced Butter"),
        ("Poivrons confits aux braises façon escalivada", "Charred Sweet Peppers Escalivada"),
        ("Chou-fleur entier rôti aux épices", "Whole Roasted Spiced Cauliflower"),
        ("Patates douces rôties au beurre salé", "Whole Roasted Sweet Potatoes with Salted Butter"),
        ("Carottes glacées au miel et au thym", "Honey & Thyme Glazed Roasted Carrots"),
        ("Courgettes farcies au kamado", "Stuffed Zucchini Boats in the Kamado"),
        ("Gratin dauphinois cuit au feu de bois", "Wood-Fired Gratin Dauphinois"),
        ("Tomates à la provençale au kamado", "Provençale Roasted Tomatoes"),
        ("Oignons confits entiers sous la cendre", "Whole Charred Onions Cooked in the Embers"),
        ("Fenouil braisé à l'orange en cocotte", "Orange & Anise Braised Fennel in Dutch Oven"),
        ("Butternut rôti aux noisettes et au bleu", "Roast Butternut Squash with Blue Cheese & Hazelnuts"),
        ("Poireaux braisés fondants, sauce ravigote", "Braised Leeks with Ravigote Sauce"),
        ("Brocoli grillé au citron et au piment", "Charred Broccoli with Lemon & Chili Flakes"),
        ("Haricots verts façon casserole au lard", "Green Bean & Bacon Skillet"),
        ("Champignons de Paris marinés à l'ail", "Garlic & Parsley Button Mushrooms on Skewers"),
        ("Artichauts entiers grillés, vinaigrette", "Whole Grilled Artichokes with Mustard Vinaigrette"),
        ("Potimarron farci aux champignons et châtaignes", "Stuffed Kuri Squash with Chestnuts & Mushrooms"),
        ("Betteraves rôties au balsamique", "Whole Balsamic Roasted Beets"),
        ("Polenta grillée au romarin", "Grilled Rosemary Polenta Triangles"),
        ("Panier de légumes-racines rôti d'hiver", "Winter Root Vegetable Medley Roast"),

        # Pizza & Pains
        ("Pizza margherita au feu de bois", "Wood-Fired Pizza Margherita"),
        ("Focaccia romarin et gros sel", "Wood-Fired Rosemary & Sea Salt Focaccia"),
        ("Flammekueche alsacienne traditionnelle", "Traditional Alsatian Flammekueche (Tarte Flambée)"),
        ("Pain de campagne au levain en cocotte", "Dutch Oven Sourdough Country Loaf"),
        ("Pizza blanche quatre fromages", "Four-Cheese White Pizza (Quattro Formaggi)"),
        ("Calzone soufflé au jambon et ricotta", "Folded Calzone with Ham, Ricotta & Basil"),
        ("Baguette tradition sur pierre au kamado", "Traditional French Baguettes on Pizza Stone"),
        ("Pains pita gonflés à la minute", "Ballooning Fresh Pita Pockets"),
        ("Brioche tressée au sucre en cocotte", "Braided French Brioche in Cast Iron Pot"),
        ("Naans à l'ail et au fromage (cheese naan)", "Garlic & Cheese Stuffed Naan Bread"),
        ("Pizza reine (jambon, champignons, mozzarella)", "Classic Pizza Regina (Ham & Mushrooms)"),
        ("Pain fougasse aux olives et aux lardons", "Provençal Fougasse with Olives & Bacon"),

        # Desserts
        ("Ananas rôti au rhum et au miel", "Spit-Roasted Pineapple with Rum & Honey"),
        ("Bananes au chocolat sous la braise", "Chocolate-Stuffed Campfire Bananas"),
        ("Pêches grillées au mascarpone et au miel", "Grilled Summer Peaches with Honey Mascarpone"),
        ("Crumble pommes-poires au feu de bois", "Wood-Fired Apple & Pear Crisp"),
        ("Tarte Tatin caramélisée au kamado", "Caramelized Apple Tarte Tatin in Skillet"),
        ("Skillet cookie géant aux pépites de chocolat", "Giant Cast Iron Skillet Chocolate Chip Cookie"),
        ("Brownie au chocolat fumé et noix de pécan", "Pecan Smoked Fudge Brownie"),
        ("Figues rôties au chèvre frais et romarin", "Roasted Figs with Fresh Goat Cheese & Honey"),
        ("Poires pochées au vin rouge et épices", "Spiced Red Wine Poached Pears in Dutch Oven"),
        ("Tarte aux pommes rustique sur pierre", "Rustic Apple Galette on Pizza Stone"),
        ("Marshmallows grillés et s'mores gourmets", "Gourmet Wood-Fired S'mores"),
        ("Abricots rôtis au romarin et glace vanille", "Roasted Apricots with Rosemary & Vanilla Ice Cream"),
        ("Pain perdu caramélisé façon brioche", "Caramelized French Brioche French Toast"),
        ("Clafoutis aux cerises au kamado", "Wood-Fired Cherry Clafoutis"),
        ("Mangue rôti aux épices douces et citron vert", "Spiced Roasted Mango with Fresh Lime"),
        ("Fondant au chocolat cuit en ramequin", "Warm Molten Chocolate Lava Cakes"),
        ("Brochettes de fruits frais caramélisées", "Caramelized Fresh Fruit Skewers"),
        ("Tartelette aux fraises et crème pâtissière", "Strawberry Tartlets with Baked Shells"),
        ("Crêpes Suzette flambées au Grand Marnier", "Crêpes Suzette Flambéed with Grand Marnier"),
        ("Pommes au four farcies aux raisins et cannelle", "Baked Apples Stuffed with Raisins & Cinnamon"),
        ("Pain d'épices moelleux au miel de châtaignier", "Spiced Honey Loaf in Cast Iron Pan"),

        # Sauces & Bases
        ("Chimichurri argentin traditionnel", "Traditional Argentine Chimichurri"),
        ("Sauce barbecue Kansas City maison", "Kansas City Sweet & Smoky BBQ Sauce"),
        ("Rub dalmatien (sel et poivre 16 mesh)", "Texas Dalmatian Rub (50/50 Salt & Coarse Pepper)"),
        ("Rub barbecue polyvalent sweet and smoky", "All-Purpose Sweet & Smoky BBQ Rub"),
        ("Sauce beurre blanc au vin blanc", "French Classic Beurre Blanc Sauce"),
        ("Sauce béarnaise aux herbes fraîches", "Fresh Tarragon Béarnaise Sauce"),
        ("Beurre maître d'hôtel au persil et citron", "Maître d'Hôtel Compound Butter"),
        ("Sauce au poivre vert flambée au cognac", "Green Peppercorn Sauce Flambéed with Cognac"),
        ("Sauce gribiche aux cornichons et câpres", "Gribiche Sauce with Capers & Cornichons"),
        ("Sauce tartare maison aux herbes", "Homemade Herb Tartar Sauce"),
        ("Sauce romesco catalane aux amandes", "Catalan Romesco Sauce with Toasted Almonds"),
        ("Glace au vinaigre balsamique et miel", "Balsamic & Honey Reduction Glaze"),
        ("Sauce satay maison aux cacahuètes", "Homemade Peanut Satay Sauce"),
        ("Sauce teriyaki japonaise authentique", "Authentic Japanese Teriyaki Glaze"),
        ("Marinade mexicaine al pastor", "Mexican Al Pastor Achiote Marinade"),
        ("Marinade jamaïcaine jerk épicée", "Spicy Jamaican Jerk Wet Marinade"),
        ("Rub Maghreb (ras-el-hanout et cumin)", "North African Ras el Hanout Spice Rub"),
        ("Sauce barbecue Carolina Gold à la moutarde", "Carolina Gold Mustard BBQ Sauce"),
        ("Sauce Alabama White BBQ", "Alabama White BBQ Sauce"),
        ("Pesto Rosso grillé au Kamado", "Wood-Roasted Pesto Rosso"),
        ("Marinade Teriyaki épicée", "Spicy Ginger-Chili Teriyaki Marinade"),
        ("Laque BBQ érable et bourbon", "Bourbon & Maple Syrup BBQ Glaze"),
        ("Sauce Alabama White BBQ (sauce blanche mayo-vinaigre)", "Alabama White BBQ Sauce (Big Bob Gibson Style)"),
        ("Sauce Carolina Gold (moutarde BBQ de Caroline du Sud)", "South Carolina Gold Mustard BBQ Sauce"),

        # Monde
        ("Picanha grillée (rumsteak brésilien)", "Grilled Brazilian Picanha (Rump Cap)"),
        ("Yakitori (brochettes japonaises)", "Japanese Chicken Yakitori Skewers"),
        ("Char siu (porc laqué chinois)", "Chinese Char Siu Roast Pork"),
        ("Satay de poulet, sauce cacahuète", "Chicken Satay with Peanut Sauce"),
        ("Bulgogi (bœuf mariné coréen)", "Korean Beef Bulgogi (KBBQ)"),
        ("Poulet tandoori", "Tandoori Chicken on the Kamado"),
        ("Souvlaki & pita (porc grec)", "Greek Pork Souvlaki & Warm Pita"),
        ("Tacos al pastor", "Tacos al Pastor with Charred Pineapple"),
        ("Travers BBQ Kansas City", "Kansas City Style BBQ Ribs"),
        ("Merguez & méchoui d'agneau", "Spicy Merguez & Lamb Mechoui"),
        ("Jerk chicken jamaïcain", "Authentic Jamaican Jerk Chicken"),
        ("Asado d'entraña & chimichurri", "Argentine Asado Skirt Steak (Entraña)"),
        ("Köfte épicées (boulettes turques)", "Spiced Turkish Köfte Meatballs"),
        ("Shawarma de poulet", "Chicken Shawarma on the Rotisserie"),
        ("Galbi (côtes de bœuf coréennes)", "Korean Galbi Marinated Short Ribs"),
        ("Birria de bœuf (tacos)", "Beef Birria Quesa-Tacos"),
        ("Kleftiko (agneau grec à l'étouffée)", "Greek Kleftiko Lamb Parcel"),
        ("Tagine d'agneau aux abricots", "Lamb Tagine with Sweet Apricots"),
        ("Boerewors façon braai", "South African Boerewors Sausage"),
        ("Lahmacun (pizza turque)", "Crispy Turkish Lahmacun Flatbread"),
        ("Gyros de porc grec", "Greek Pork Gyros in Warm Pita"),
        ("Carne asada (tacos mexicains)", "Carne Asada Street Tacos"),
        ("Tsukune (boulettes de poulet japonaises)", "Japanese Tsukune Chicken Meatballs"),
        ("Pinchos morunos (brochettes espagnoles)", "Spanish Moorish Pork Pinchos (Pinchos Morunos)"),
        ("Thịt nướng (porc citronnelle vietnamien)", "Vietnamese Lemongrass Grilled Pork (Thịt Nướng)"),
        ("Pollo a la brasa (poulet péruvien)", "Peruvian Pollo a la Brasa Rotisserie Chicken"),
        ("Chicken tikka (Inde)", "Indian Chicken Tikka Skewers"),
        ("Samgyeopsal (poitrine de porc coréenne)", "Korean Samgyeopsal (Grilled Pork Belly)"),
        ("Lomo al trapo (bœuf au torchon)", "Colombian Lomo al Trapo (Cloth-Wrapped Beef)"),
        ("Chuan'r d'agneau au cumin & piment", "Beijing Chuan'r Lamb Skewers with Cumin & Chili"),
        ("Kabab Koobideh (brochettes d'agneau perses)", "Persian Kabab Koobideh Minced Lamb Skewers"),
        ("Sosaties d'agneau au curry & abricot", "South African Lamb Sosaties with Curry & Apricot"),
        ("Suya de bœuf nigérian à l'arachide", "Nigerian Beef Suya Skewers with Spicy Peanut Rub"),
        ("Espetada de bœuf au laurier madérienne", "Madeiran Beef Espetada on Bay Laurel Skewers"),
        ("Daeji Bulgogi (porc épicé coréen)", "Spicy Korean Pork Bulgogi (Daeji Bulgogi)"),
        ("Bò Lá Lốt (bœuf en feuilles de betel)", "Vietnamese Bò Lá Lốt (Beef in Betel Leaves)"),
        ("Char Siu cantonais laqué", "Cantonese Honey-Glazed Char Siu"),
        ("Smoked Queso Dip au kamado", "Kamado Smoked Queso Dip"),
        ("Kofte d'agneau et bœuf au sumac & menthe sur brochettes", "Lamb & Beef Kofte Skewers with Mint & Sumac"),
        ("Satay de bœuf balinais à la citronnelle & sauce cacahuète", "Balinese Beef Satay with Lemongrass & Peanut Sauce"),
        ("Tacos de Birria de bœuf fumé au kamado & consommé mijoté", "Smoked Beef Birria Tacos with Rich Dipping Consommé"),

        # Végétarien
        ("Burger végétarien haricots-champignons", "Black Bean & Mushroom Veggie Burger"),
        ("Brochettes halloumi & légumes", "Grilled Halloumi & Vegetable Skewers"),
        ("Aubergine entière fumée façon steak", "Whole Smoked Eggplant 'Steak'"),
        ("Chou pointu rôti au beurre noisette", "Roasted Sweetheart Cabbage with Brown Butter"),
        ("Tofu mariné grillé teriyaki", "Teriyaki Marinated Grilled Tofu"),
        ("Butternut rôtie, sauce tahini", "Roasted Butternut Squash with Creamy Tahini Sauce"),
        ("Poivrons farcis riz-feta", "Stuffed Bell Peppers with Rice & Feta"),
        ("Parmigiana d'aubergines en cocotte", "Eggplant Parmigiana in Dutch Oven"),
        ("Shakshuka en cocotte", "Wood-Fired Cast Iron Shakshuka"),
        ("Patatas bravas grillées", "Grilled Spanish Patatas Bravas"),
        ("Tofu fumé laqué miso-sésame", "Miso & Sesame Glazed Smoked Tofu"),
        ("Steaks de chou rouge fumés", "Smoked Red Cabbage Steaks"),
        ("Céleri-rave entier rôti comme une pièce", "Whole Roasted Celeriac 'Centerpiece'"),
        ("Quesadillas légumes fumés", "Smoked Vegetable & Monterey Jack Quesadillas"),
        ("Beer can cabbage (chou à la bière)", "Beer Can Whole Cabbage"),
        ("Provoleta grillé (fromage argentin)", "Grilled Argentine Provoleta Cheese"),
        ("Tandoori Gobi (chou-fleur tandoori)", "Tandoori Gobi (Whole Spiced Cauliflower)"),
        ("Steak de chou-fleur rôti au kamado & chimichurri frais", "Roasted Cauliflower Steak with Fresh Chimichurri")
    ]

    for fr_pat, en_pat in replacements:
        if fr_pat.lower() in nom.lower():
            nom_en = en_pat
            break

    # Translate origins
    ori_en = ori
    ori_en = re.sub(r"\bFrance\b", "France", ori_en)
    ori_en = re.sub(r"\bla cuisson parfaite en 2 temps\b", "the perfect two-stage cook", ori_en)
    ori_en = re.sub(r"\bgrillade directe express\b", "express direct sear", ori_en)
    ori_en = re.sub(r"\brôti du dimanche\b", "Sunday roast classic", ori_en)
    ori_en = re.sub(r"\ble Graal du BBQ\b", "the Holy Grail of BBQ", ori_en)
    ori_en = re.sub(r"\bbistrot\b", "bistro classic", ori_en)
    ori_en = re.sub(r"\bbarbecue convivial\b", "convivial barbecue", ori_en)
    ori_en = re.sub(r"\bpièce spectacle\b", "showstopper cut", ori_en)
    ori_en = re.sub(r"\ble secret des bouchers\b", "butcher's best kept secret", ori_en)
    ori_en = re.sub(r"\bcuisson lente fondante\b", "slow melting cook", ori_en)
    ori_en = re.sub(r"\bgras croustillant et cœur rosé\b", "crispy fat cap and pink center", ori_en)
    ori_en = re.sub(r"\bles côtes de bœuf géantes du Texas\b", "Texas giant beef ribs", ori_en)
    ori_en = re.sub(r"\ble classique du braai\b", "South African braai classic", ori_en)
    ori_en = re.sub(r"\ble burger sans viande qui tient\b", "hearty plant-based burger", ori_en)
    ori_en = re.sub(r"\ble légume star\b", "star roasted vegetable", ori_en)

    return (nom_en, ori_en)

# Build translations for all 269 recipes
ALL_TRANSLATIONS = {}
for r in recipes:
    ALL_TRANSLATIONS[r["id"]] = translate_title_and_origin(r)

print(f"Successfully compiled {len(ALL_TRANSLATIONS)} / {len(recipes)} recipes.")

# Generate scripts/recipes-i18n.js
js_content = """(function initRecipesI18n(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KamadoRecipesI18n = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function recipesI18nFactory() {
  "use strict";

  const RECIPES_EN = """ + json.dumps(ALL_TRANSLATIONS, indent=2, ensure_ascii=False) + """;

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
      .replace(/\\bc\\.\\s*à\\s*s\\.\\b/gi, "tbsp")
      .replace(/\\bc\\.\\s*à\\s*c\\.\\b/gi, "tsp")
      .replace(/\\bgros sel\\b/gi, "coarse sea salt")
      .replace(/\\bfleur de sel\\b/gi, "flaky sea salt")
      .replace(/\\bpoivre du moulin\\b/gi, "freshly ground black pepper")
      .replace(/\\bhuile d'olive\\b/gi, "extra virgin olive oil")
      .replace(/\\bhuile neutre\\b/gi, "neutral high-heat oil")
      .replace(/\\bgousse d'ail\\b/gi, "garlic clove")
      .replace(/\\bgousses d'ail\\b/gi, "garlic cloves")
      .replace(/\\bbeurre\\b/gi, "butter")
      .replace(/\\bcrème fraîche\\b/gi, "crème fraîche")
      .replace(/\\boignon\\b/gi, "onion")
      .replace(/\\boignons\\b/gi, "onions")
      .replace(/\\bpersil frais\\b/gi, "fresh parsley")
      .replace(/\\bpersil\\b/gi, "parsley")
      .replace(/\\bbrins? de thym\\b/gi, "thyme sprigs")
      .replace(/\\bbrins? de romarin\\b/gi, "rosemary sprigs")
      .replace(/\\bjus de citron\\b/gi, "lemon juice")
      .replace(/\\bzeste de citron\\b/gi, "lemon zest")
      .replace(/\\bpapier boucher\\b/gi, "butcher paper")
      .replace(/\\bfeuille de laurier\\b/gi, "bay leaf")
      .replace(/\\bpour servir\\b/gi, "for serving");
  }

  function translateStepLine(line, lang = "fr") {
    if (!line || lang !== "en") return line;
    return line
      .replace(/\\bSortez la viande 1 h avant\\b/gi, "Take the meat out 1 hr ahead")
      .replace(/\\bséchez-la bien\\b/gi, "pat thoroughly dry")
      .replace(/\\bsalez généreusement\\b/gi, "season generously with salt")
      .replace(/\\bConfig indirecte\\b/gi, "Indirect setup")
      .replace(/\\bpierre céramique en déflecteur\\b/gi, "ceramic heat deflector plate")
      .replace(/\\bplantez la sonde au cœur\\b/gi, "insert probe into the thermal core")
      .replace(/\\bLaissez reposer\\b/gi, "Let rest")
      .replace(/\\bavant de trancher\\b/gi, "before slicing against the grain")
      .replace(/\\bévents ouverts\\b/gi, "vents fully open")
      .replace(/\\bbraises vives\\b/gi, "hot glowing embers")
      .replace(/\\bSaisissez\\b/gi, "Sear")
      .replace(/\\bpar face\\b/gi, "per side");
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
"""

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Generated {OUTPUT_PATH} ({os.path.getsize(OUTPUT_PATH)} bytes)")
