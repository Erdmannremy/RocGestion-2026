/* ==========================================================
   ROCGESTION V1.7 - MASTER SYNC (JURBISE_V1)
   ========================================================== */

let clientEnCoursDeModif = null; 
let idASupprimer = null;         

// 1. CALCULATEUR FISCAL (Normes Belges)
function mettreAJourChiffreAffaires() {
    const tableAnnu = document.getElementById('annuaire-table-body');
    let totalHT = 0;

    // Récupération du taux de taxe pour les charges depuis les paramètres
    const tauxTaxeParam = parseFloat(document.getElementById('param-taxe').value) / 100 || 0.45;

    for (let i = 0; i < tableAnnu.rows.length; i++) {
        const ligne = tableAnnu.rows[i];
        
        // --- LA CORRECTION EST ICI ---
        // Au lieu de lire le texte de la cellule index 2 qui contient "(21%) 1000 €",
        // on va chercher une span spécifique ou on nettoie le texte plus intelligemment.
        
        const celluleMontant = ligne.cells[2];
        // On récupère tout le texte et on ne garde que ce qui ressemble à un nombre (chiffres et point)
        const texteNettoye = celluleMontant.innerText.split('€')[0].replace(/[^\d.]/g, '');
        const montantNum = parseFloat(texteNettoye) || 0;
        
        totalHT += montantNum;
    }

    // Calcul des charges et du net
    const montantCharges = totalHT * tauxTaxeParam;
    const montantNet = totalHT - montantCharges;

    const format = (num) => num.toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

    // Mise à jour de l'affichage
    const elCA = document.getElementById('total-ca-display');
    const elCharges = document.getElementById('total-charges-display');
    const elNet = document.getElementById('total-net-display');

    if (elCA) elCA.innerText = format(totalHT);
    if (elCharges) elCharges.innerText = "-" + format(montantCharges);
    if (elNet) elNet.innerText = format(montantNet);
    
    // Mise à jour de la légende sous les charges
    const legende = document.querySelector('#total-charges-display + p');
    if (legende) legende.innerText = `Cotisations + Impôts (${(tauxTaxeParam*100).toFixed(0)}%)`;
}

// 2. NAVIGATION
function afficherSection(nom) {
    const sections = ['dashboard', 'clients', 'parametres'];
    sections.forEach(s => {
        const el = document.getElementById('section-' + s);
        if (el) el.style.display = 'none';
    });
    document.getElementById('section-' + nom).style.display = 'block';
}

// 3. GESTION DES MODALES
function ouvrirModale(id = null) {
    clientEnCoursDeModif = id; 
    const titre = document.querySelector('#modal-client h3');
    const inputTVA = document.getElementById('new-client-tva');
    
    // On récupère le taux par défaut des paramètres au cas où c'est un nouveau dossier
    const tvaDefaut = document.getElementById('param-tva').value || 21;

    if (id) {
        titre.innerText = "MODIFIER LE DOSSIER";
        const ligneAnnu = document.getElementById("annu-" + id);
        document.getElementById('new-client-name').value = ligneAnnu.cells[0].innerText;
        document.getElementById('new-client-sector').value = ligneAnnu.cells[1].innerText;
        document.getElementById('new-client-amount').value = parseFloat(ligneAnnu.cells[2].innerText);
        
        // On récupère le taux TVA qui était stocké dans un attribut "data" (voir étape suivante)
        inputTVA.value = ligneAnnu.getAttribute('data-tva') || tvaDefaut;
    } else {
        titre.innerText = "NOUVEAU DOSSIER";
        document.getElementById('new-client-name').value = "";
        document.getElementById('new-client-sector').value = "";
        document.getElementById('new-client-amount').value = "";
        inputTVA.value = tvaDefaut; // On remet le taux par défaut
    }
    document.getElementById('modal-client').style.display = 'flex';
}

function fermerModale() {
    document.getElementById('modal-client').style.display = 'none';
}

// 4. SUPPRESSION SÉCURISÉE
function supprimerClient(id) {
    idASupprimer = id; 
    document.getElementById('modal-confirm').style.display = 'flex';
}

function fermerModaleConfirm() {
    document.getElementById('modal-confirm').style.display = 'none';
    idASupprimer = null;
}

function confirmerSuppression() {
    if (idASupprimer) {
        const d = document.getElementById("dash-" + idASupprimer);
        const a = document.getElementById("annu-" + idASupprimer);
        if(d) d.remove();
        if(a) a.remove();
        
        // Refresh des chiffres
        mettreAJourChiffreAffaires();
        document.getElementById('total-partenaires').innerText = document.getElementById('annuaire-table-body').rows.length;
        
        fermerModaleConfirm();
    }
}

// 5. ENREGISTREMENT CENTRALISÉ
function validerAjoutClient() {
    const nom = document.getElementById('new-client-name').value;
    const secteur = document.getElementById('new-client-sector').value;
    const montantHT = parseFloat(document.getElementById('new-client-amount').value) || 0;
    const tauxTVA = parseFloat(document.getElementById('new-client-tva').value) || 0;

    if (nom.trim() === "") return;

    const tvaValeur = montantHT * (tauxTVA / 100);
    const ttc = (montantHT + tvaValeur).toFixed(2);
    const ht = montantHT.toFixed(2);
    const date = new Date().toLocaleDateString('fr-FR');

    // --- CONSTRUCTION HTML ANNUAIRE (6 Colonnes) ---
    const contenuHTML_Annu = (id) => `
        <td style="padding:1.2rem;font-weight:bold;color:#3b82f6;">${nom.toUpperCase()}</td>
        <td style="padding:1.2rem;"><span style="background:#1f2937;padding:4px 10px;border-radius:4px;font-size:0.75rem;color:#9ca3af;">${secteur}</span></td>
        <td style="padding:1.2rem;text-align:right;"><span class="classe-montant-ht">${ht}</span> €</td>
        <td style="padding:1.2rem;text-align:right;color:#9ca3af;">${tauxTVA} %</td>
        <td style="padding:1.2rem;text-align:right;font-weight:bold;color:white;">${ttc} €</td>
        <td style="padding:1.2rem;text-align:center;">
            <button onclick="ouvrirModale('${id}')" style="background:none;border:none;color:#3b82f6;cursor:pointer;"><i class="fas fa-edit"></i></button>
            <button onclick="supprimerClient('${id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;margin-left:10px;"><i class="fas fa-trash-alt"></i></button>
        </td>`;

    // --- CONSTRUCTION HTML DASHBOARD (5 Colonnes) ---
    const contenuHTML_Dash = `
        <td style="padding:1rem;"><i class="fas fa-bolt" style="color:#fbbf24;margin-right:10px;"></i> ${nom}</td>
        <td style="padding:1rem;color:#9ca3af;">${date}</td>
        <td style="padding:1rem;text-align:right;">${ht} €</td>
        <td style="padding:1rem;text-align:right;color:#9ca3af;">${tauxTVA}%</td>
        <td style="padding:1rem;text-align:right;font-weight:bold;color:#10b981;">${ttc} €</td>`;

    // --- LOGIQUE D'INSERTION ---
    if (clientEnCoursDeModif) {
        const id = clientEnCoursDeModif;
        const rAnnu = document.getElementById("annu-" + id);
        const rDash = document.getElementById("dash-" + id);
        if(rAnnu) {
            rAnnu.innerHTML = contenuHTML_Annu(id);
            rAnnu.setAttribute('data-tva', tauxTVA);
        }
        if(rDash) rDash.innerHTML = contenuHTML_Dash;
    } else {
        const id = "ID" + Date.now();
        const rowAnnu = document.createElement('tr');
        rowAnnu.id = "annu-" + id;
        rowAnnu.setAttribute('data-tva', tauxTVA);
        rowAnnu.style.borderBottom = "1px solid #1f2937";
        rowAnnu.innerHTML = contenuHTML_Annu(id);
        document.getElementById('annuaire-table-body').prepend(rowAnnu);

        const rowDash = document.createElement('tr');
        rowDash.id = "dash-" + id;
        rowDash.style.borderBottom = "1px solid #1f2937";
        rowDash.innerHTML = contenuHTML_Dash;
        document.getElementById('client-table-body').prepend(rowDash);
    }
    
    mettreAJourChiffreAffaires();
    document.getElementById('total-partenaires').innerText = document.getElementById('annuaire-table-body').rows.length;
    (id, nom, ttc);
    fermerModale();
}
// --- FONCTION DU POINT 1 & 2 : SAUVEGARDE RÉGLAGES ---
function sauvegarderParametres() {
    const nouveauNom = document.getElementById('param-entreprise').value;
    // Mise à jour du nom dans la barre latérale
    document.querySelector('h1').innerHTML = `<i class="fas fa-gem" style="color: #3b82f6; margin-right: 12px;"></i> ${nouveauNom.toUpperCase()}`;
    
    // On relance le calcul du CA avec les nouveaux taux (le calcul utilisera les valeurs des inputs)
    mettreAJourChiffreAffaires();
    alert("Paramètres mis à jour avec succès !");
}

// --- MODIFICATION DE LA FONCTION DE CALCUL POUR UTILISER LES PARAMÈTRES ---
function mettreAJourChiffreAffaires() {
    // On va chercher toutes nos petites boîtes de montants
    const tousLesMontants = document.querySelectorAll('.classe-montant-ht');
    let totalHT = 0;

    tousLesMontants.forEach(span => {
        // On récupère la valeur, on remplace la virgule par un point si besoin
        const valeur = parseFloat(span.innerText.replace(',', '.')) || 0;
        totalHT += valeur;
    });

    // Récupération du taux de taxe pour les charges (Dashboard)
    const tauxTaxeParam = parseFloat(document.getElementById('param-taxe').value) / 100 || 0.45;
    const montantCharges = totalHT * tauxTaxeParam;
    const montantNet = totalHT - montantCharges;

    const format = (num) => num.toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

    // Mise à jour de l'affichage
    document.getElementById('total-ca-display').innerText = format(totalHT);
    document.getElementById('total-charges-display').innerText = "-" + format(montantCharges);
    document.getElementById('total-net-display').innerText = format(montantNet);
    
    const legende = document.querySelector('#total-charges-display + p');
    if (legende) legende.innerText = `Cotisations + Impôts (${(tauxTaxeParam*100).toFixed(0)}%)`;
}
// --- POINT 3 : EXPORT CSV AMÉLIORÉ (AVEC DÉTAILS TVA) ---
function exportCSV() {
    // Récupération des taux actuels définis dans tes paramètres
    const tauxTVA = parseFloat(document.getElementById('param-tva').value) || 21;
    const ratioTVA = tauxTVA / 100;

    // En-têtes du CSV (avec séparateur point-virgule pour Excel)
    let csv = "Client;Secteur;Montant HT;% TVA;Montant TVA;Montant TVAC\n";
    
    const rows = document.querySelectorAll("#annuaire-table-body tr");
    
    let totalHT = 0;
    let totalTVA = 0;
    let totalTVAC = 0;

    rows.forEach(row => {
        const nom = row.cells[0].innerText;
        const secteur = row.cells[1].innerText;
        // On récupère le montant HT et on nettoie le texte pour n'avoir que le nombre
        const montantHT = parseFloat(row.cells[2].innerText) || 0;
        
        // Calculs pour la ligne
        const montantTVA = montantHT * ratioTVA;
        const montantTVAC = montantHT + montantTVA;

        // Cumul pour le total final
        totalHT += montantHT;
        totalTVA += montantTVA;
        totalTVAC += montantTVAC;

        // Ajout de la ligne au CSV (formatage avec virgule pour les décimales si besoin)
        csv += `${nom};${secteur};${montantHT.toFixed(2)};${tauxTVA}%;${montantTVA.toFixed(2)};${montantTVAC.toFixed(2)}\n`;
    });

    // Ajout d'une ligne vide pour la lisibilité
    csv += "\n";
    
    // Ajout de la ligne des TOTAUX
    csv += `TOTAL GLOBAL;;${totalHT.toFixed(2)};;${totalTVA.toFixed(2)};${totalTVAC.toFixed(2)}\n`;

    // Création et téléchargement du fichier
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' }); // \ufeff pour forcer l'UTF-8 sur Excel
    const link = document.createElement("a");
    const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
    
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `RocGestion_Export_${date}.csv`);
    link.click();
    
    console.log("Export CSV généré avec succès.");
}

function effacerTout() {
    if(confirm("Rémy, attention : voulez-vous vraiment effacer TOUS les clients pour la nouvelle année ?")) {
        document.getElementById('annuaire-table-body').innerHTML = "";
        document.getElementById('client-table-body').innerHTML = "";
        mettreAJourChiffreAffaires();
        document.getElementById('total-partenaires').innerText = "0";
    }
}

// --- POINT 4 : PERSONNALISATION COULEUR ---
function changerCouleur(code) {
    const elements = document.querySelectorAll('.fa-gem, .fa-chart-line, #total-ca-display');
    elements.forEach(el => el.style.color = code);
    document.querySelector('button[onclick="validerAjoutClient()"]').style.background = code;
}
//--- POINT 4: Verification retard facture ---
function verifierRetards() {
    const aujourdhui = new Date();
    // On parcourt les dossiers stockés
    mesDossiers.forEach(dossier => {
        const dateFacture = new Date(dossier.date);
        const differenceJours = (aujourdhui - dateFacture) / (1000 * 60 * 60 * 24);

        if (differenceJours > 30 && dossier.statut !== 'Payé') {
            envoyerRappelAuto(dossier);
        }
    });
}
//--- Facturation XML PEPPOL ---
function genererXMLPeppol(client, montantHT, tva) {
    const xml = `
    <Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
        <ID>FACT-2026-001</ID>
        <IssueDate>${new Date().toISOString().split('T')[0]}</IssueDate>
        <AccountingSupplierParty>...</AccountingSupplierParty>
        <AccountingCustomerParty>...</AccountingCustomerParty>
        <LegalMonetaryTotal>
            <LineExtensionAmount currencyID="EUR">${montantHT}</LineExtensionAmount>
            <TaxExclusiveAmount currencyID="EUR">${montantHT}</TaxExclusiveAmount>
            <PayableAmount currencyID="EUR">${(montantHT * 1.21).toFixed(2)}</PayableAmount>
        </LegalMonetaryTotal>
    </Invoice>`;
    return xml;
}
// --- FONCTION POUR CHANGER LE STATUT DE PAIEMENT ---
function changerStatutPaiement(id) {
    const btn = document.getElementById("status-btn-" + id);
    if (btn.innerText === "EN ATTENTE") {
        btn.innerText = "PAYÉ";
        btn.style.background = "#065f46";
        btn.style.color = "#10b981";
    } else {
        btn.innerText = "EN ATTENTE";
        btn.style.background = "#451a03";
        btn.style.color = "#f59e0b";
    }
}

// --- SIMULATION GÉNÉRATION FACTURE 2026 (PDF + XML) ---
function emettreFacture(id, nom, montant) {
    alert(`Génération Facture pour ${nom}\n1. Fichier PDF créé.\n2. Fichier XML Peppol 2026 généré pour le portail fiscal.`);
    console.log("Transmission Peppol via Access Point...");
}

// --- MISE À JOUR DE LA SECTION FACTURATION ---
// Appelle cette partie dans ta fonction validerAjoutClient
function ajouterLigneFacture(id, nom, ttc) {
    const tableFact = document.getElementById('factures-table-body');
    const dateEcheance = new Date();
    dateEcheance.setDate(dateEcheance.getDate() + 30); // Echéance standard 30 jours
    
    const row = document.createElement('tr');
    row.id = "fact-row-" + id;
    row.style.borderBottom = "1px solid #1f2937";
    row.innerHTML = `
        <td style="padding:1.2rem; font-family: monospace; color:#3b82f6;">INV-26-${id.substring(2,6)}</td>
        <td style="padding:1.2rem; font-weight:bold;">${nom.toUpperCase()}</td>
        <td style="padding:1.2rem; text-align:right;">${ttc} €</td>
        <td style="padding:1.2rem; text-align:center; font-size:0.8rem; color:#9ca3af;">${dateEcheance.toLocaleDateString('fr-BE')}</td>
        <td style="padding:1.2rem; text-align:center;">
            <button id="status-btn-${id}" onclick="changerStatutPaiement('${id}')" style="background:#451a03; color:#f59e0b; border:none; padding:5px 10px; border-radius:4px; font-size:0.7rem; font-weight:bold; cursor:pointer; width:100px;">
                EN ATTENTE
            </button>
        </td>
        <td style="padding:1.2rem; text-align:right;">
            <button onclick="emettreFacture('${id}', '${nom}', '${ttc}')" style="background:#3b82f6; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;">
                <i class="fas fa-file-export"></i> ÉMETTRE
            </button>
        </td>
    `;
    tableFact.prepend(row);
}