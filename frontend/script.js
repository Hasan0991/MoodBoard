
const API_URL = "http://127.0.0.1:8000";

// Get HTML elements
const minimalismSlider = document.getElementById("minimalism");
const cosinessSlider = document.getElementById("cosiness");
const colourfulnessSlider = document.getElementById("colourfulness");

const minimalismValue = document.getElementById("minimalismValue");
const cosinessValue = document.getElementById("cosinessValue");
const colourfulnessValue = document.getElementById("colourfulnessValue");
const applySuggestionsButton =
    document.getElementById("applySuggestionsButton");
const generationLoading =
    document.getElementById("generationLoading");
const keepCurrentButton =
    document.getElementById("keepCurrentButton");
const interpretationElement = document.getElementById("interpretation");
const generateButton = document.getElementById("generateButton");
const statusElement = document.getElementById("status");
const analysisLoading = document.getElementById("analysisLoading");
const generatedImage = document.getElementById("generatedImage");
const placeholder = document.getElementById("placeholder");
const historyElement = document.getElementById("history");
const comparisonSection =
    document.getElementById("comparisonSection");

const previousImage =
    document.getElementById("previousImage");

const newImage =
    document.getElementById("newImage");

const previousPreferences =
    document.getElementById("previousPreferences");

const newPreferences =
    document.getElementById("newPreferences");

// Store generated designs during this browser session
let generationHistory = [];

let pendingSuggestedPreferences = null;
// Read current slider values
function getPreferences() {
    return {
        minimalism: Number(minimalismSlider.value),
        cosiness: Number(cosinessSlider.value),
        colourfulness: Number(colourfulnessSlider.value)
    };
}


// Calculate relative priorities
function calculateWeights(preferences) {
    const total =
        preferences.minimalism +
        preferences.cosiness +
        preferences.colourfulness;

    if (total === 0) {
        return null;
    }

    return {
        minimalism: preferences.minimalism / total * 100,
        cosiness: preferences.cosiness / total * 100,
        colourfulness: preferences.colourfulness / total * 100
    };
}


function compareDesigns() {
    console.log("Comparison history:", generationHistory);

    if (generationHistory.length < 2) {
        comparisonSection.hidden = true;
        console.log("Generate at least two designs to compare.");
        return;
    }

    const currentDesign = generationHistory[0];
    const previousDesign = generationHistory[1];

    console.log("Previous design:", previousDesign);
    console.log("Current design:", currentDesign);

    // Display images
    previousImage.src = previousDesign.imageUrl;
    newImage.src = currentDesign.imageUrl;

    // Display preference details
    function formatPreferences(design) {
        return `
            <p><strong>Minimalism:</strong> ${design.weights.minimalism.toFixed(1)}%</p>
            <p><strong>Cosiness:</strong> ${design.weights.cosiness.toFixed(1)}%</p>
            <p><strong>Colourfulness:</strong> ${design.weights.colourfulness.toFixed(1)}%</p>
            <p><strong>Style:</strong> ${design.style}</p>
        `;
    }

    previousPreferences.innerHTML = formatPreferences(previousDesign);
    newPreferences.innerHTML = formatPreferences(currentDesign);

    // Reveal comparison
    comparisonSection.hidden = false;

    console.log("Comparison section displayed.");
}

// Describe the relative priorities
function getInterpretation(weights) {
    if (!weights) {
        return "Please increase at least one preference above zero.";
    }

    const entries = Object.entries(weights);

    const highest = Math.max(...Object.values(weights));

    return entries.map(([name, value]) => {
        let level;

        if (value === highest) {
            level = "Main priority";
        } else if (value >= 25) {
            level = "Secondary priority";
        } else {
            level = "Lower priority";
        }

        const displayName =
            name.charAt(0).toUpperCase() + name.slice(1);

        return `
            <div class="interpretation-item">
                <strong>${displayName}</strong>
                <span>${value.toFixed(1)}% — ${level}</span>
            </div>
        `;
    }).join("");
}


// Update the interface when sliders change
function updatePreferences() {
    const preferences = getPreferences();

    minimalismValue.textContent = preferences.minimalism + "%";
    cosinessValue.textContent = preferences.cosiness + "%";
    colourfulnessValue.textContent = preferences.colourfulness + "%";

    const weights = calculateWeights(preferences);

    interpretationElement.innerHTML = getInterpretation(weights);
}


// Connect slider events
minimalismSlider.addEventListener("input", updatePreferences);
cosinessSlider.addEventListener("input", updatePreferences);
colourfulnessSlider.addEventListener("input", updatePreferences);





async function analyseDescription() {
    const description = document
        .getElementById("roomDescription")
        .value.trim();

    const analyseButton = document.getElementById("analyseButton");

    if (!description) {
        document.getElementById("analysisStatus").textContent =
            "Please enter a description to analyse.";
        return;
    }

    // Start loading state
    analyseButton.disabled = true;
    analyseButton.textContent = "Analysing...";
    analysisLoading.hidden = false;

    // Read the user's current slider values
    const currentPreferences = getPreferences();

    document.getElementById("analysisStatus").textContent =
        "AI is analysing your preferences...";

    try {
        const response = await fetch(`${API_URL}/interpret-description`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description: description,
                current_preferences: currentPreferences
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Analysis failed");
        }

        // Store AI suggestions without changing the sliders
        pendingSuggestedPreferences = data.preferences;
        applySuggestionsButton.hidden = false;
keepCurrentButton.hidden = false;

        // Display suggested values
        document.getElementById("suggestedPreferences").textContent =
            `Minimalism: ${data.preferences.minimalism} | ` +
            `Cosiness: ${data.preferences.cosiness} | ` +
            `Colourfulness: ${data.preferences.colourfulness}`;

        document.getElementById("aiExplanation").textContent =
            data.explanation;

        document.getElementById("detectedDetails").textContent =
            "Detected details: " + data.detected_details.join(", ");

        document.getElementById("preferencesSection").hidden = false;

        document.getElementById("analysisStatus").textContent =
            "AI suggestions are ready. Apply them or keep your current values.";

    } catch (error) {
        console.error("Analysis error:", error);

        document.getElementById("analysisStatus").textContent =
            "Something went wrong: " + error.message;

    } finally {
        // Stop loading state
        analyseButton.disabled = false;
        analyseButton.textContent = "Analyse my description";
        analysisLoading.hidden = true;
    }
}



// Generate a design
async function generateDesign() {

    const preferences = getPreferences();
    const weights = calculateWeights(preferences);

    if (!weights) {
        statusElement.textContent =
            "Please increase at least one preference.";
        return;
    }

    
const description = document
    .getElementById("roomDescription")
    .value
    .trim();

const requestData = {
    room_type: document.getElementById("roomType").value,
    style: document.getElementById("style").value,
    description: description || null,
    ...preferences
};


    // Loading feedback
    generateButton.disabled = true;
    generateButton.textContent = "Generating...";
    generationLoading.hidden = false;
    statusElement.textContent =
        "The AI is creating your interior design. Please wait...";

    try {

        const response = await fetch(`${API_URL}/generate-image`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        const result = await response.json();

        
        generatedImage.src = result.image_url;
        generatedImage.hidden = false;
        placeholder.hidden = true;
        document.getElementById("roomDescription").value = "";
document.getElementById("preferencesSection").hidden = true;
document.getElementById("aiExplanation").textContent = "";
document.getElementById("detectedDetails").textContent = "";
document.getElementById("analysisStatus").textContent = "";


        const design = {
    imageUrl: result.image_url,
    preferences: { ...preferences },
    weights: weights,
    style: requestData.style
};

        generationHistory.unshift(design);

        updateHistory();
compareDesigns();

        statusElement.textContent =
            "Your interior design has been generated successfully!";

    } catch (error) {

        console.error("Generation error:", error);

        statusElement.textContent =
            "Something went wrong: " + error.message;

    } finally {

        generateButton.disabled = false;
         generationLoading.hidden = true;
        generateButton.textContent = "Generate my design";
        
    }
}


// Display previous generations
function updateHistory() {

    historyElement.innerHTML = "";

    if (generationHistory.length === 0) {
        historyElement.innerHTML =
            '<p class="description">Your generated designs will appear here.</p>';
        return;
    }

    generationHistory.forEach((design, index) => {

        const item = document.createElement("div");
        item.className = "history-item";

        const image = document.createElement("img");
        image.src = design.imageUrl;
        image.alt = `Generated design ${index + 1}`;

        const label = document.createElement("p");
        label.textContent =
            index === 0 ? "Latest design" : `Previous design ${index}`;

        item.appendChild(image);
        item.appendChild(label);

        item.addEventListener("click", () => {
            generatedImage.src = design.imageUrl;
            generatedImage.hidden = false;
            placeholder.hidden = true;

            statusElement.textContent =
                "Viewing a previous design.";
        });

        historyElement.appendChild(item);
    });
}


// Generate button event
generateButton.addEventListener("click", generateDesign);
document.getElementById("analyseButton")
    .addEventListener("click", analyseDescription);



// Apply AI suggestions
applySuggestionsButton.addEventListener("click", () => {

    if (!pendingSuggestedPreferences) return;

    minimalismSlider.value =
        pendingSuggestedPreferences.minimalism;

    cosinessSlider.value =
        pendingSuggestedPreferences.cosiness;

    colourfulnessSlider.value =
        pendingSuggestedPreferences.colourfulness;

    updatePreferences();

    pendingSuggestedPreferences = null;

    applySuggestionsButton.hidden = true;
    keepCurrentButton.hidden = true;

    document.getElementById("analysisStatus").textContent =
        "AI suggestions applied. You can still adjust the sliders.";
});

// Keep current slider values
keepCurrentButton.addEventListener("click", () => {

    pendingSuggestedPreferences = null;

    applySuggestionsButton.hidden = true;
    keepCurrentButton.hidden = true;

    document.getElementById("analysisStatus").textContent =
        "Your current slider values have been kept.";
});

// Initial interface
updatePreferences();
updateHistory();
