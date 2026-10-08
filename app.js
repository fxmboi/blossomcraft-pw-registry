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
            setTimeout(typeMachine, 3500); 
            return;
        }
        setTimeout(typeMachine, 140); 
    } else {
        textElement.textContent = currentPhrase.substring(0, characterIndex - 1);
        characterIndex--;

        if (characterIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(typeMachine, 800); 
            return;
        }
        setTimeout(typeMachine, 70); 
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(typeMachine, 500);
});

let warpRegistryData = [];

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
fetchLiveCloudDatabase(); 

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
        const normalizedOwner = warp.owner ? warp.owner.toLowerCase() : '';
        
        const individualCategories = warp.category.toLowerCase().split(' / ').map(c => c.trim());
        const hasMatchingItem = warp.prices ? warp.prices.some(itemObj => itemObj.name.toLowerCase().includes(normalizedQuery)) : false;

        return normalizedName.includes(normalizedQuery) || 
               normalizedDesc.includes(normalizedQuery) ||
               normalizedOwner.includes(normalizedQuery) ||
               individualCategories.some(cat => cat.includes(normalizedQuery)) ||
               hasMatchingItem;
    });

    if (matches.length === 0) {
        resultsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; opacity: 0.6; padding-top: 40px; color: #ffffff;">No matching player warps found for that query.</p>`;
    } else {
        matches.forEach(warp => {
            const serverName = warp.server || "Tulip";
            let serverColorClass = "server-tulip";
            
            if (serverName.toLowerCase() === "lotus") serverColorClass = "server-lotus";
            else if (serverName.toLowerCase() === "spirit") serverColorClass = "server-spirit";
            else if (serverName.toLowerCase() === "cherry") serverColorClass = "server-cherry";

            const card = document.createElement('div');
            card.className = 'warp-result-card';
            card.innerHTML = `
                <div class="card-top">
                    <span class="card-category">${warp.category}</span>
                    <h3 class="card-title">/pw ${warp.name}</h3>
                    <p class="card-desc">${warp.desc}</p>
                    <span class="card-server-badge ${serverColorClass}">${serverName}</span>
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
    
    const serverBadge = document.createElement('span');
    serverBadge.className = 'badge-box';
    
    const sName = warp.server || "Tulip";
    if (sName.toLowerCase() === "lotus") { serverBadge.style.borderColor = "#52fa7c"; serverBadge.style.color = "#52fa7c"; }
    else if (sName.toLowerCase() === "spirit") { serverBadge.style.borderColor = "#8be9fd"; serverBadge.style.color = "#8be9fd"; }
    else if (sName.toLowerCase() === "cherry") { serverBadge.style.borderColor = "#ff79c6"; serverBadge.style.color = "#ff79c6"; }
    else { serverBadge.style.borderColor = "#ffb86c"; serverBadge.style.color = "#ffb86c"; }
    
    serverBadge.textContent = sName;
    detCategory.appendChild(serverBadge);

    const categoriesArray = warp.category.split(" / ");
    categoriesArray.forEach(cat => {
        const badge = document.createElement('span');
        badge.className = 'badge-box';
        badge.textContent = cat;
        detCategory.appendChild(badge);
    });

    const ownerText = warp.owner ? `<span class="details-owner-badge">by ${warp.owner}</span>` : '';
    detTitle.innerHTML = `/pw ${warp.name} ${ownerText}`;
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

async function loadItemPresetsFromJSON() {
    try {
        const response = await fetch("data.json");
        const itemPresetsArray = await response.json();
        
        if (Array.isArray(itemPresetsArray)) {
            let datalist = document.getElementById("mcItemPresets");
            if (!datalist) {
                datalist = document.createElement("datalist");
                datalist.id = "mcItemPresets";
                document.body.appendChild(datalist);
            }
            
            let optionsHTML = "";
            itemPresetsArray.forEach(item => {
                optionsHTML += `<option value="${item}">${item}</option>`;
            });
            datalist.innerHTML = optionsHTML;
            console.log("Successfully loaded presets from data.json into master datalist!");
        }
    } catch (error) {
        console.error("Failed to read items from data.json file:", error);
    }
}
loadItemPresetsFromJSON();

window.addNewMarketInputRow = function(type) {
    const targetList = type === 'buy' ? document.getElementById('formBuyList') : document.getElementById('formSellList');
    const placeholderName = type === 'buy' ? 'e.g., Diamond x1' : 'e.g., Oak Logs x64';
    
    const row = document.createElement('div');
    row.className = 'creation-input-row';
    row.innerHTML = `
        <input type="text" class="creation-item-name-input" placeholder="${placeholderName}" list="mcItemPresets" required>
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

const realPublishBtn = document.getElementById('realPublishBtn');

if (realPublishBtn) {
    // Intercept clicks on the independent bar and fire the validation engine safely
    realPublishBtn.addEventListener('click', () => {
        document.getElementById('hiddenFormSubmit').click();
    });
}

warpCreationForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nameValue = document.getElementById('newWarpName').value.replace(/\s+/g, '');
    const ownerValue = document.getElementById('newWarpOwner').value.replace(/\s+/g, ''); 
    const serverValue = document.getElementById('newWarpServer').value;
    const descValue = document.getElementById('newWarpDesc').value;
    
    // FIXED: Maps tracking feedback text directly to our unified header submit button
    const submitButton = document.getElementById('realPublishBtn');
    
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
        owner: ownerValue, 
        server: serverValue, 
        category: selectedCategories.join(" / "),
        desc: descValue,
        prices: collectedPrices
    };

    try {
        submitButton.innerHTML = "⏳ Uploading...";
        submitButton.style.backgroundColor = "#ffb86c";
        submitButton.disabled = true;

        await fetch(GOOGLE_DATABASE_API_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        alert(`🌸 /pw ${nameValue} has been permanently saved to the Google Sheets Cloud Database!`);
        await fetchLiveCloudDatabase();
        returnToHomeFromForm();
        
    } catch (error) {
        alert("Cloud upload connection dropped. Check your network console logs.");
        console.error(error);
    } finally {
        submitButton.innerHTML = "Publish Warp Live";
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
