chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.local.set({
      firstRun: true,
      api: ""
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
   if (message.command === "CHECK_API_KEY") {
      (async () => {
         try {
            const result = await askGemini("This is a test message; reply with 'YES'");
            if (result.success && result.data && result.data.includes("YES")) {
               sendResponse({checked: true});
            } else {
               sendResponse({checked: false, error: result.error});
            }
         } catch (error) {
            console.error("API check failed:", error);
            sendResponse({checked: false, error: "Connection failed"});
         }
      })();
      return true;
   }
   else if(message.name==="allSpans") {
      (async () => {
         const tabId=sender.tab.id;
         let spans=message.array;
         spans = spans.map(arr =>
            arr.filter(text =>
               text !== "Clear selection" &&
               text !== "Required" &&
               text !== "*"
            )
         );
         spans = spans.filter(arr => arr.length > 0);
         let short_ans = spans.filter(arr => arr.length === 1);
         spans = spans.filter(arr => arr.length !== 1);
         short_ans = short_ans.filter(i =>
            !spans.some(j => j.includes(i[0]))
         );

         let checkboxes = [];
         let multiple = [];

         for (const arr of spans) {
            const text = arr.slice(2).join("\n");
            if (text === arr[1]) {
               // multiple choice
               multiple.push([...arr.slice(0, 1), ...arr.slice(2)]);
            } else {
               // checkbox
               checkboxes.push(arr);
            }
         }

         spans.length=0;
         spans=null;

         multiple = multiple.map(arr =>
         arr.filter(opt => !opt.includes("\n"))
         );


         
         (()=>{
            let questions =[];
            const l=short_ans.length;
            const m=checkboxes.length;
            const n=multiple.length;

            for(let i=0;i<l;i++){
               short_ans[i].push(i+1);
               questions.push([i+1,"SA",short_ans[i][0]]);
            }
            for(let i=0;i<m;i++){
               checkboxes[i].push(l+i+1);
               questions.push([l+i+1,"CB",checkboxes[i][0]]);
            }
            for(let i=0;i<n;i++){
               multiple[i].push(l+m+i+1);
               questions.push([l+m+i+1,"MC",multiple[i][0]]);
            }
            chrome.tabs.sendMessage(tabId,{
               thing : "QUESTION_LIST",
               payload: questions
            });
         })();

         let SA="";
         let MC="";
         let CB="";

         if (short_ans.length>0){
            SA+=`
               You are given short-answer questions.
               Answer each question briefly and accurately.

               Rules:
               - Keep answers concise
               - Do NOT repeat the question
               - Follow the output format exactly
               - Output one answer per line
               - No extra text
               - No markdown
               - No numbering

               Output format:
               ID:<ID> Answer:<answer>

               Questions:
               \n`; 

            for (const item of short_ans){
               SA+=`ID:${item[1]} Question:${item[0]}\n`
            }
         }


         if (checkboxes.length>0){
            CB += `
            You are given checkbox questions.
            Each question may have one or more correct answers.

            Rules:
            - Choose ALL correct options
            - Use the option text exactly as given
            - Separate multiple answers using commas
            - Do NOT repeat the question
            - Follow the output format exactly
            - Output one answer per line
            - No extra text
            - No markdown
            - No numbering

            Output format:
            ID:<ID> Answer:<option1, option2>

            Questions:
            \n`; 

            for (const item of checkboxes) {
               const id = item[item.length - 1];
               const question = item[0];
               const options = item.slice(1, -1);

               CB += `ID:${id} Question:${question}\n`;
               CB += `Options:\n`;
               for (const opt of options) {
                  CB += `- ${opt}\n`;
               }
            }
         }


         if (multiple.length > 0) {
            MC += `
         You are given multiple-choice questions.
         Each question has exactly ONE correct answer.

         Rules:
         - Choose only ONE option
         - Use the option text exactly as given
         - Do NOT repeat the question
         - Follow the output format exactly
         - Output one answer per line
         - No extra text
         - No markdown
         - No numbering

         Output format:
         ID:<ID> Answer:<option>

         Questions:
         `;

            for (const item of multiple) {
               const id = item[item.length - 1];
               const question = item[0];
               const options = item.slice(1, -1);

               MC += `ID:${id} Question:${question}\n`;
               MC += `Options:\n`;
               for (const opt of options) {
                  MC += `- ${opt}\n`;
               }
            }
         };

         let aSA=[];
         let aCB=[];
         let aMC=[];

         const pattern="^ID\\s?:\\s?(\\d+)\\s+Answer\\s?:\\s?(.+)$";
         const regex= new RegExp(pattern);

         try {
            if(SA!=""){
               const result = await askGemini(SA);
               if (result.success) {
                  let rSA = result.data?.split("\n") ?? [];
                  for(const item of rSA){
                     const match=item.match(regex);
                     if (!match) continue;
                     aSA.push([match[1],match[2]]);
                  }
               } else {
                  console.error("SA API error:", result.error);
                  chrome.tabs.sendMessage(tabId, {response: "error", message: result.error});
                  return;
               }
            }
            
            if(CB!=""){
               const result = await askGemini(CB);
               if (result.success) {
                  let rCB = result.data?.split("\n") ?? [];
                  for(const item of rCB){
                     const match=item.match(regex);
                     if (!match) continue;
                     const temp=match[2].split(",").map(a=>a.trim()).filter(Boolean);
                     aCB.push([match[1],temp]);
                  }
               } else {
                  console.error("CB API error:", result.error);
                  chrome.tabs.sendMessage(tabId, {response: "error", message: result.error});
                  return;
               }
            }

            if(MC!=""){
               const result = await askGemini(MC);
               if (result.success) {
                  let rMC = result.data?.split("\n") ?? [];
                  for(const item of rMC){
                     const match=item.match(regex);
                     if (!match) continue;
                     aMC.push([match[1],match[2]]);
                  }
               } else {
                  console.error("MC API error:", result.error);
                  chrome.tabs.sendMessage(tabId, {response: "error", message: result.error});
                  return;
               }
            }
         } catch (error) {
            console.error("Quiz processing error:", error);
            chrome.tabs.sendMessage(tabId, {response: "error", message: "Processing failed"});
            return;
         }

         chrome.tabs.sendMessage(tabId,{
            response : "allThree",
            payload: [aSA,aCB,aMC]
         });
         
         chrome.storage.local.set({scanning: false});
      })();
      return true;
   } 
});



async function askGemini(everything) {
   const result = await chrome.storage.local.get("api");
   const API_KEY = result.api;
   const modelResult = await chrome.storage.local.get("model");
   const model = modelResult.model || "gemini-2.5-flash";
   
   try {
      const response = await fetch(
         `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({
               contents: [{
                  parts: [{ text: everything }]
               }]
            })
         }
      );

      if (!response.ok) {
         const errText = await response.text();
         let errorMessage;
         
         if (response.status === 429) {
            errorMessage = "API rate limit reached. Please wait and try again later.";
         } else if (response.status === 403) {
            errorMessage = "Invalid API key or access denied.";
         } else if (response.status >= 500) {
            errorMessage = "Server error. Please try again later.";
         } else {
            errorMessage = `API error (${response.status}). Please check your settings.`;
         }
         
         return { success: false, error: errorMessage };
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      
      if (!text) {
         return { success: false, error: "No response from AI. Please try again." };
      }
      
      return { success: true, data: text };

   } catch (error) {
      console.error("Gemini API error:", error);
      return { success: false, error: "Connection failed. Check your internet connection." };
   }
}



