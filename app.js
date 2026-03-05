// --- VARIABLES GLOBALES ---
let clientEnCoursDeModif = null; 
let idASupprimer = null;         

// --- 1. NAVIGATION ---
function afficherSection(nom) {
    const sections = ['dashboard', 'clients', 'parametres', 'factures'];
    sections.forEach(s => {
        const el = document.getElementById('section-' + s);
        if (el) el.style.display = 'none';
    });
    const sectionCible = document.getElementById('section-' + nom);
    if (sectionCible) sectionCible.style.display = 'block';
}

// --- 2. CALCULATEUR FISCAL ---
function mettreAJourChiffreAffaires() {
    const tousLesMontants = document.querySelectorAll('.classe-montant-ht');
    let totalHT = 0;

    tousLesMontants.forEach(span => {
        const valeur = parseFloat(span.innerText.replace(',', '.')) || 0;
        totalHT += valeur;
    });

    const inputTaxe = document.getElementById('param-taxe');
    const tauxTaxeParam = inputTaxe ? (parseFloat(inputTaxe.value) / 100) : 0.45;
    
    const montantCharges = totalHT * tauxTaxeParam;
    const montantNet = totalHT - montantCharges;

    const format = (num) => num.toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

    if (document.getElementById('total-ca-display')) document.getElementById('total-ca-display').innerText = format(totalHT);
    if (document.getElementById('total-charges-display')) document.getElementById('total-charges-display').innerText = "-" + format(montantCharges);
    if (document.getElementById('total-net-display')) document.getElementById('total-net-display').innerText = format(montantNet);
    
    const legende = document.querySelector('#total-charges-display + p');
    if (legende) legende.innerText = `Cotisations + Impôts (${(tauxTaxeParam*100).toFixed(0)}%)`;
}

// --- 3. GESTION DES MODALES ---
function ouvrirModale(id = null) {
    clientEnCoursDeModif = id; 
    const titre = document.querySelector('#modal-client h3');
    const tvaDefaut = document.getElementById('param-tva') ? document.getElementById('param-tva').value : 21;

    if (id) {
        titre.innerText = "MODIFIER LE DOSSIER";
        const ligneAnnu = document.getElementById("annu-" + id);
        document.getElementById('new-client-name').value = ligneAnnu.cells[0].innerText;
        document.getElementById('new-client-sector').value = ligneAnnu.cells[1].querySelector('span').innerText;
        document.getElementById('new-client-amount').value = parseFloat(ligneAnnu.querySelector('.classe-montant-ht').innerText);
        document.getElementById('new-client-tva').value = ligneAnnu.getAttribute('data-tva') || tvaDefaut;
    } else {
        titre.innerText = "NOUVEAU DOSSIER";
        document.getElementById('new-client-name').value = "";
        document.getElementById('new-client-sector').value = "";
        document.getElementById('new-client-amount').value = "";
        if(document.getElementById('new-client-tva')) document.getElementById('new-client-tva').value = tvaDefaut;
    }
    document.getElementById('modal-client').style.display = 'flex';
}

function fermerModale() {
    document.getElementById('modal-client').style.display = 'none';
}

// --- 4. ENREGISTREMENT ---
function validerAjoutClient() {
    const nom = document.getElementById('new-client-name').value;
    const secteur = document.getElementById('new-client-sector').value;
    const montantHT = parseFloat(document.getElementById('new-client-amount').value) || 0;
    const tauxTVA = parseFloat(document.getElementById('new-client-tva').value) || 0;

    if (nom.trim() === "") {
        alert("Le nom est obligatoire");
        return;
    }

    const tvaValeur = montantHT * (tauxTVA / 100);
    const ttc = (montantHT + tvaValeur).toFixed(2);
    const ht = montantHT.toFixed(2);
    const date = new Date().toLocaleDateString('fr-FR');

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

    const contenuHTML_Dash = `
        <td style="padding:1rem;"><i class="fas fa-bolt" style="color:#fbbf24;margin-right:10px;"></i> ${nom}</td>
        <td style="padding:1rem;color:#9ca3af;">${date}</td>
        <td style="padding:1rem;text-align:right;">${ht} €</td>
        <td style="padding:1rem;text-align:right;color:#9ca3af;">${tauxTVA}%</td>
        <td style="padding:1rem;text-align:right;font-weight:bold;color:#10b981;">${ttc} €</td>`;

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
        
        ajouterLigneFacture(id, nom, ttc);
    }
    
    mettreAJourChiffreAffaires();
    const count = document.getElementById('annuaire-table-body').rows.length;
    if(document.getElementById('total-partenaires')) document.getElementById('total-partenaires').innerText = count;
    
    fermerModale();
}

// --- 5. FACTURATION ---
function ajouterLigneFacture(id, nom, ttc) {
    const tableFact = document.getElementById('factures-table-body');
    if(!tableFact) return;
    const dateEcheance = new Date();
    dateEcheance.setDate(dateEcheance.getDate() + 30);
    
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
        </td>`;
    tableFact.prepend(row);
}

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

function emettreFacture(id, nom, montant) {
    alert(`Facture émise pour ${nom}\nMontant : ${montant}€\nXML Peppol prêt.`);
}

// --- 6. SUPPRESSION ---
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
        const f = document.getElementById("fact-row-" + idASupprimer);
        if(d) d.remove();
        if(a) a.remove();
        if(f) f.remove();
        mettreAJourChiffreAffaires();
        fermerModaleConfirm();
    }
}
let historiqueFactures = JSON.parse(localStorage.getItem('roc_historique')) || [];

function genererNouvelleFacture(client) {
    const nouvelleFacture = {
        id: "INV-" + Date.now(), // Identifiant unique basé sur le temps
        date: new Date().toLocaleDateString('fr-BE'),
        nomClient: client.nom,
        montantHT: client.montantHT,
        tva: client.tva,
        totalTVAC: (client.montantHT * (1 + client.tva / 100)).toFixed(2)
    };

    historiqueFactures.push(nouvelleFacture);
    localStorage.setItem('roc_historique', JSON.stringify(historiqueFactures));
    
    afficherHistorique();
    console.log("📄 Nouvelle facture archivée. L'ancienne est conservée.");
}