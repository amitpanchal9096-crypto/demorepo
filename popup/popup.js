function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

document.addEventListener("DOMContentLoaded", async () => {
    const [tab]= await chrome.tabs.query({
    active: true,
    currentWindow: true
    });

    const btn = document.getElementById("startScanBtn");
    const label = document.getElementById("errorLbl");
    if (!tab.url || !tab.url.includes("docs.google.com/forms")) {
    btn.disabled = true;
    document.getElementById("modelSelect").hidden=true;
    document.querySelector('label[for="modelSelect"]').hidden = true;
    label.textContent = "Open a Google Form to start scanning !";
    label.hidden = false;
    return;
    }
    const loadingBar=document.getElementById("loadingBar");
    const {done} = await chrome.storage.local.get("done");
    if (done){
        await chrome.storage.local.set({scanning: false});
        loadingBar.hidden=true;
        btn.innerHTML = `<i class="fas fa-check-circle"></i> Answers Found !`;
        btn.disabled=false;
        await delay(500);
        btn.innerHTML = `<i class="fas fa-check-circle"></i> Find Answers`;
    };

    chrome.storage.local.get("scanning", ({ scanning }) => {
        if (scanning) {
            loadingBar.hidden = false;
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Looking for answers...`;
            
            const checkCompletion = setInterval(async () => {
                const {done, scanning: currentScanning} = await chrome.storage.local.get(["done", "scanning"]);
                if (done || !currentScanning) {
                    clearInterval(checkCompletion);
                    loadingBar.hidden = true;
                    btn.innerHTML = `<i class="fas fa-check-circle"></i> Answers Found !`;
                    btn.disabled = false;
                    chrome.storage.local.set({scanning: false});
                    delay(500);
                    btn.innerHTML = `<i class="fas fa-check-circle"></i> Find Answers`;
                }
            }, 500);
        }
    });

    chrome.storage.local.get("firstRun", async ({firstRun})=>{
        if (firstRun){
            document.getElementById("api-section").hidden=false;
            document.getElementById("dashboard-section").hidden=true;
            document.getElementById("apiSubmitForm").addEventListener("submit",(event)=>{
                event.preventDefault();
                loadingBar.hidden = false;
                chrome.storage.local.set({api: document.getElementById('apiKeyInput').value});
                chrome.runtime.sendMessage({
                    command: "CHECK_API_KEY"
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Runtime error:", chrome.runtime.lastError);
                        loadingBar.hidden = true;
                        const errorMsg = document.getElementById("apiStatusLabel");
                        errorMsg.textContent = "Connection error. Please try again.";
                        errorMsg.hidden = false;
                        chrome.storage.local.set({api: ""});
                        return;
                    }
                    if (!response || !response.checked) {
                        loadingBar.hidden = true;
                        const errorMsg = document.getElementById("apiStatusLabel");
                        errorMsg.textContent = response?.error || "Invalid API Key. Please check and try again.";
                        errorMsg.hidden = false;
                        chrome.storage.local.set({api: ""});
                    } else {
                        chrome.storage.local.set({firstRun: false}, () => {
                            loadingBar.hidden = true;
                            window.location.reload();
                        });
                    }
                });
            })
        }
        else{
            document.getElementById("api-section").hidden=true;
            document.getElementById("dashboard-section").hidden=false; 
            document.getElementById("changeApiKeyBtn").addEventListener('click',()=>{
                chrome.storage.local.set({firstRun: true}, () => {
                    loadingBar.hidden=true;
                    window.location.reload();
                });
            });

            document.getElementById('startScanningForm').addEventListener("submit", async (event) => {
                event.preventDefault();
                await chrome.storage.local.set({scanning: true, done: false});
                loadingBar.hidden = false;
                btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Looking For Answers ...`;
                btn.disabled=true;
                const model=document.getElementById("modelSelect").value;
                if (model==="gemini-2.5-flash-lite"){
                    await chrome.storage.local.set({model: "gemini-2.5-flash-lite"});
                }
                else {
                    await chrome.storage.local.set({model: "gemini-2.5-flash"});
                }
                chrome.tabs.sendMessage(tab.id, {
                    indication: "START_READING"
                }).then(() => {
                    console.log("Message sent to content script");
                    const checkCompletion = setInterval(async () => {
                        const {done, scanning: currentScanning} = await chrome.storage.local.get(["done", "scanning"]);
                        if (done || !currentScanning) {
                            clearInterval(checkCompletion);
                            loadingBar.hidden = true;
                            btn.innerHTML = `<i class="fas fa-check-circle"></i> Answers Found !`;
                            btn.disabled = false;
                            chrome.storage.local.set({scanning: false});
                            delay(500);
                            btn.innerHTML = `<i class="fas fa-check-circle"></i> Find Answers`;
                        }
                    }, 500);
                }).catch((error) => {
                    console.error("Failed to send message to content script:", error);
                    loadingBar.hidden = true;
                    btn.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error: Reload page and try again`;
                    btn.disabled = false;
                    chrome.storage.local.set({scanning: false});
                });
            })
        }
    })
})

