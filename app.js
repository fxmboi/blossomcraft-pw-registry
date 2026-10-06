// ==========================================
// 1. LIQUID WAVE BACKGROUND SIMULATION
// ==========================================
const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const LIQUID_COLOR = '#bc2dff'; 
let waveTime = 0;

function animateFluid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2b051a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.filter = 'blur(4px)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (let x = 0; x <= canvas.width; x += 5) {
        const wave1 = Math.sin(x * 0.003 + waveTime) * 90;
        const wave2 = Math.cos(x * 0.007 - waveTime * 0.8) * 45;
        const wave3 = Math.sin(x * 0.015 + waveTime * 1.2) * 20;
        const baseLiquidHeight = canvas.height * 0.55; 
        const y = baseLiquidHeight + wave1 + wave2 + wave3;
        ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fillStyle = LIQUID_COLOR;
    ctx.fill();
    ctx.restore();

    waveTime += 0.006; 
    requestAnimationFrame(animateFluid);
}
animateFluid();

// ==========================================
// 2. AUTOMATED TYPING TEXT WRITER ENGINE (SLOWER & EXPANDED)
// ==========================================
// Expanded phrase registry list - feel free to add, remove, or edit these lines!
const phrases = [
    "What shop are we visiting?",
    "What items do you need?",
    "Looking for a public farm?",
    "≽(•⩊ •マ≼ Welcome mrow..",
    "Found what you need?",
    "BlossomCraft is the best!",
    "Looking for bulk building blocks?",
    "Mueheheheheh >:3c"
];

let phraseIndex = 0;
let characterIndex = 0;
let isDeleting = false;
const textElement = document.getElementById('typedText');

function typeMachine() {
    if (!textElement) return;
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
        textElement.textContent = currentPhrase.substring(0, characterIndex + 1);
        characterIndex++;

        if (characterIndex === currentPhrase.length) {
            isDeleting = true;
            // SLOWER: Changed from 2000 to 3500 (Waits 3.5 seconds before starting to erase)
            setTimeout(typeMachine, 3500); 
            return;
        }
        // SLOWER: Changed from 80 to 140 (Letters tick out much more calmly and slowly)
        setTimeout(typeMachine, 140); 
    } else {
        textElement.textContent = currentPhrase.substring(0, characterIndex - 1);
        characterIndex--;

        if (characterIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            // SLOWER: Changed from 400 to 800 (Waits longer after fully erasing before typing the next line)
            setTimeout(typeMachine, 800); 
            return;
        }
        // SLOWER: Changed from 40 to 70 (Erases letters backward more smoothly and deliberately)
        setTimeout(typeMachine, 70); 
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(typeMachine, 500);
});

// ==========================================
// 3. CLOUD SHEET ENDPOINT DATABASE CONTROLLER
// ==========================================
// YOUR LIVE GOOGLE SCRIPT URL ENDPOINT DEPLOYMENT LINK POSITIONED HERE
const GOOGLE_DATABASE_API_URL = "https://script.google.com/macros/s/AKfycbyNNr75PGcTEAW-Af8L8lRjuPXaJD-3TrR2tYfGzL00o6UVQIMq0FhVXkFoxhU5H3GX/exec";

// The hardcoded backup variable is dropped; website starts with a clean virtual registry array
let warpRegistryData = [];

// Automatic Data Downloader: Downloads all player warps from Google Sheet on start
async function fetchLiveCloudDatabase() {
    try {
        const response = await fetch(GOOGLE_DATABASE_API_URL);
        const data = await response.json();
        if (Array.isArray(data)) {
            warpRegistryData = data;
            console.log("Successfully synchronised with permanent Google Sheet registry rows!");
        }
    } catch (error) {
        console.error("Cloud synchronisation fallback halt:", error);
    }
}
fetchLiveCloudDatabase(); // Fires automatically on load parameters

const searchInput = document.getElementById('mainSearch');
const masterView = document.getElementById('masterView');
const resultsView = document.getElementById('resultsView');
const resultsGrid = document.getElementById('resultsGrid');
const closeResultsBtn = document.getElementById('closeResultsBtn');

const shopDetailsView = document.getElementById('shopDetailsView');
const detCategory = document.getElementById('detCategory');
const detTitle = document.getElementById('detTitle');
const detDesc = document.getElementById('detDesc');
const detPricingList = document.getElementById('detPricingList');
const detCopyBtn = document.getElementById('detCopyBtn');

let activeShopTarget = null; 

searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const query = this.value.trim().toLowerCase();
        if (query !== "") {
            executeSearch(query);
        }
    }
});

function executeSearch(query) {
    if (shopDetailsView) {
        shopDetailsView.classList.remove('active');
        setTimeout(() => { shopDetailsView.style.display = 'none'; }, 200);
    }
    if (resultsView) {
        resultsView.classList.remove('hidden-for-details');
    }

    masterView.classList.add('searching-active');
    resultsGrid.innerHTML = '';

    const matches = warpRegistryData.filter(warp => {
        const normalizedQuery = query.trim().toLowerCase();
        const normalizedName = warp.name.toLowerCase();
        const normalizedDesc = warp.desc.toLowerCase();
        
        const individualCategories = warp.category.toLowerCase().split(' / ').map(c => c.trim());
        const hasMatchingItem = warp.prices ? warp.prices.some(itemObj => itemObj.name.toLowerCase().includes(normalizedQuery)) : false;

        return normalizedName.includes(normalizedQuery) || 
               normalizedDesc.includes(normalizedQuery) ||
               individualCategories.some(cat => cat.includes(normalizedQuery)) ||
               hasMatchingItem;
    });

    if (matches.length === 0) {
        resultsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; opacity: 0.6; padding-top: 40px; color: #ffffff;">No matching /pw player shops found for that query.</p>`;
    } else {
        matches.forEach(warp => {
            const card = document.createElement('div');
            card.className = 'warp-result-card';
            card.innerHTML = `
                <div class="card-top">
                    <span class="card-category">${warp.category}</span>
                    <h3 class="card-title">/pw ${warp.name}</h3>
                    <p class="card-desc">${warp.desc}</p>
                </div>
            `;
            card.addEventListener('click', () => { loadShopDetailsPage(warp); });
            resultsGrid.appendChild(card);
        });
    }

    resultsView.style.display = 'block';
    setTimeout(() => {
        resultsView.classList.add('reveal-results');
        const generatedCards = document.querySelectorAll('.warp-result-card');
        generatedCards.forEach((card, index) => {
            setTimeout(() => { card.classList.add('reveal-card'); }, (index + 1) * 60);
        });
    }, 200);
}
function loadShopDetailsPage(warp) {
    activeShopTarget = warp.name;
    resultsView.classList.add('hidden-for-details');
    
    const buyList = document.getElementById('buyMarketList');
    const sellList = document.getElementById('sellMarketList');
    buyList.innerHTML = '';
    sellList.innerHTML = '';
    
    detCategory.innerHTML = '';
    const categoriesArray = warp.category.split(" / ");
    categoriesArray.forEach(cat => {
        const badge = document.createElement('span');
        badge.className = 'badge-box';
        badge.textContent = cat;
        detCategory.appendChild(badge);
    });

    detTitle.textContent = `/pw ${warp.name}`;
    detDesc.textContent = warp.desc;
    
    let totalBuyItems = 0;
    let totalSellItems = 0;

    if (warp.prices && warp.prices.length > 0) {
        warp.prices.forEach(p => {
            const row = document.createElement('div');
            row.innerHTML = `<span class="market-item-name">${p.name}</span><span class="market-item-price">${p.cost}</span>`;

            if (p.type === 'buy') {
                row.className = 'market-row buy-row';
                buyList.appendChild(row);
                totalBuyItems++;
            } else if (p.type === 'sell') {
                row.className = 'market-row sell-row';
                sellList.appendChild(row);
                totalSellItems++;
            }
        });
    }

    if (totalBuyItems === 0) buyList.innerHTML = '<p style="opacity:0.4; text-align:center; font-size:0.9rem; margin:15px 0;">Not buying anything.</p>';
    if (totalSellItems === 0) sellList.innerHTML = '<p style="opacity:0.4; text-align:center; font-size:0.9rem; margin:15px 0;">Not selling anything.</p>';
    
    detCopyBtn.innerHTML = "Copy /pw Command";
    detCopyBtn.style.backgroundColor = "";

    setTimeout(() => {
        resultsView.style.display = 'none';
        shopDetailsView.style.display = 'block';
        setTimeout(() => { shopDetailsView.classList.add('active'); }, 50);
    }, 300);
}

if (detCopyBtn) {
    detCopyBtn.addEventListener('click', function() {
        if (!activeShopTarget) return;
        navigator.clipboard.writeText(`/pw ${activeShopTarget}`).then(() => {
            detCopyBtn.innerHTML = "Command Copied!";
            detCopyBtn.style.backgroundColor = "#28a745";
        });
    });
}

// ==========================================
// SHOP CREATION FORM SYSTEM (CLOUD DATA UPLOAD)
// ==========================================
const creationView = document.getElementById('creationView');
const openFormBtn = document.getElementById('openFormBtn');
const warpCreationForm = document.getElementById('warpCreationForm');
const descriptionTextarea = document.getElementById('newWarpDesc');
const charCounter = document.getElementById('charCounter');

openFormBtn.addEventListener('click', () => {
    titleArea.style.opacity = '0';
    openFormBtn.style.opacity = '0';
    titleArea.style.pointerEvents = 'none';
    openFormBtn.style.pointerEvents = 'none';
    masterView.classList.add('searching-active');
    
    searchInput.disabled = true;
    searchInput.placeholder = "Creation In Progress...";
    
    document.getElementById('formBuyList').innerHTML = '';
    document.getElementById('formSellList').innerHTML = '';
    addNewMarketInputRow('buy');
    addNewMarketInputRow('sell');

    creationView.scrollTop = 0;

    setTimeout(() => {
        creationView.style.display = 'block';
        creationView.scrollTop = 0;
        setTimeout(() => { 
            creationView.classList.add('active'); 
            creationView.scrollTop = 0;
        }, 50);
    }, 200);
});

window.addNewMarketInputRow = function(type) {
    const targetList = type === 'buy' ? document.getElementById('formBuyList') : document.getElementById('formSellList');
    const placeholderName = type === 'buy' ? 'e.g., Diamond x1' : 'e.g., Oak Logs x64';
    
    const row = document.createElement('div');
    row.className = 'creation-input-row';
    row.innerHTML = `
        <input type="text" class="creation-item-name-input" placeholder="${placeholderName}" required>
        <input type="text" class="creation-item-price-input" placeholder="100" required
               oninput="this.value = this.value.replace(/[^0-9]/g, '')">
        <button type="button" class="remove-row-btn" onclick="this.parentElement.remove()">✕</button>
    `;
    targetList.appendChild(row);
};

if (descriptionTextarea && charCounter) {
    descriptionTextarea.addEventListener('input', function() {
        const currentLength = this.value.length;
        charCounter.textContent = `${currentLength} / 150`;
        if (currentLength >= 150) {
            charCounter.style.color = '#ff2d75';
        } else {
            charCounter.style.color = '';
        }
    });
}

// UPLOAD CONTROLLER: Submits form input variables directly into the permanent cloud database sheet via fetch POST
warpCreationForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nameValue = document.getElementById('newWarpName').value.replace(/\s+/g, '');
    const descValue = document.getElementById('newWarpDesc').value;
    const submitButton = warpCreationForm.querySelector('button[type="submit"]');
    
    const selectedCategories = [];
    document.querySelectorAll('input[name="warpCategory"]:checked').forEach(box => {
        selectedCategories.push(box.value);
    });

    if (selectedCategories.length === 0) {
        alert("Please pick at least one category tag selection!");
        return;
    }

    const collectedPrices = [];
    document.querySelectorAll('#formBuyList .creation-input-row').forEach(row => {
        const item = row.querySelector('.creation-item-name-input').value;
        const price = row.querySelector('.creation-item-price-input').value;
        if(item && price) collectedPrices.push({ type: "buy", name: item, cost: `$${price}` });
    });

    document.querySelectorAll('#formSellList .creation-input-row').forEach(row => {
        const item = row.querySelector('.creation-item-name-input').value;
        const price = row.querySelector('.creation-item-price-input').value;
        if(item && price) collectedPrices.push({ type: "sell", name: item, cost: `$${price}` });
    });

    const payload = {
        name: nameValue,
        category: selectedCategories.join(" / "),
        desc: descValue,
        prices: collectedPrices
    };

    try {
        // Visual loading feedback tracker state
        submitButton.innerHTML = "Uploading to the database.. :3";
        submitButton.style.backgroundColor = "#ffb86c";
        submitButton.disabled = true;

        // Push data variables straight to your live Google macro script link
        const response = await fetch(GOOGLE_DATABASE_API_URL, {
            method: "POST",
            mode: "no-cors", // Bypasses browser cross-origin policy blockers seamlessly
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        alert(`🌸 /pw ${nameValue} has been permanently saved to the Google Sheets Cloud Database!`);
        
        // Re-download the live sheets data list instantly so the new shop is available on search without page refresh
        await fetchLiveCloudDatabase();
        returnToHomeFromForm();
        
    } catch (error) {
        alert("Cloud upload connection dropped. Check your network console logs.");
        console.error(error);
    } finally {
        submitButton.innerHTML = "Publish Shop";
        submitButton.style.backgroundColor = "#bc2dff";
        submitButton.disabled = false;
    }
});

function returnToHomeFromForm() {
    creationView.classList.remove('active');
    masterView.classList.remove('searching-active');
    
    setTimeout(() => {
        creationView.style.display = 'none';
        searchInput.disabled = false;
        searchInput.placeholder = "Search by warp name, item, category...";
        
        titleArea.style.opacity = '1';
        openFormBtn.style.opacity = '1';
        titleArea.style.pointerEvents = 'auto';
        openFormBtn.style.pointerEvents = 'auto';
        if (charCounter) charCounter.textContent = "0 / 150";
        warpCreationForm.reset();
    }, 650);
}

closeResultsBtn.addEventListener('click', () => {
    if (shopDetailsView.classList.contains('active')) {
        shopDetailsView.classList.remove('active');
        setTimeout(() => {
            shopDetailsView.style.display = 'none';
            resultsView.style.display = 'block';
            setTimeout(() => {
                resultsView.classList.remove('hidden-for-details');
                activeShopTarget = null;
            }, 50);
        }, 400);
    } 
    else if (creationView.classList.contains('active')) {
        returnToHomeFromForm();
    }
    else {
        resultsView.classList.remove('reveal-results');
        masterView.classList.remove('searching-active');
        
        setTimeout(() => {
            resultsView.style.display = 'none';
            resultsGrid.innerHTML = '';
            searchInput.value = '';
            activeShopTarget = null;
            
            titleArea.style.opacity = '1';
            openFormBtn.style.opacity = '1';
            titleArea.style.pointerEvents = 'auto';
            openFormBtn.style.pointerEvents = 'auto';
        }, 650);
    }
});
