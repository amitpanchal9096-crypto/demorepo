let questions=[];
chrome.runtime.onMessage.addListener((message,sender,sendResponse)=> {

   if(message.indication=="START_READING") {
    const allSpans = [...document.querySelectorAll('div[role="listitem"]')]
    .map(box =>
        [...box.querySelectorAll("span")].map(span => span.innerText)
    );

    chrome.runtime.sendMessage({
        name:"allSpans",
        array: allSpansa
    });
   }

   else if (message.thing=="QUESTION_LIST") {
    questions=message.payload;
   }

   else if(message.response=="error"){
    console.error("API Error:", message.message);
    alert("Error: " + message.message);
   }

   else if(message.response=="allThree"){
    const oSA= message.payload[0];
    const oCB= message.payload[1];
    const oMC= message.payload[2];

    for (const question of questions){
        try {
            const textToFind = question[2];
            const matchedDiv = [...document.querySelectorAll('div[role="listitem"]')]
            .find(div =>
                [...div.querySelectorAll('span')]
                .some(span => span.textContent.trim() === textToFind)
            );
    
            let answer="";
            switch (question[1]){
                case "SA":
                    answer= oSA.filter(inner=> Number(inner[0])===question[0])[0];
                    if (!answer) {
                        console.log("No answer found for SA question", question[0]);
                        break;
                    }

                    answer=answer[1];
                    let tempDiv=[...matchedDiv.querySelectorAll('*')].find(div=>div.textContent.trim()==="Your answer");
                    const newDiv=document.createElement('div');
                    newDiv.innerText="Answer: "+answer;
                    newDiv.style.color="green";
                    tempDiv.insertAdjacentElement("afterend",newDiv);
                    break;       
            
                case "CB":
                    answer=oCB.filter(inner=> Number(inner[0])===question[0])[0];                   
                    if (!answer) {
                        break;
                    }
                    answer=answer[1];
                    for (const ans of answer){
                        const span=[...matchedDiv.querySelectorAll('span')]
                        .find(span=>span.textContent.trim()===ans);
                        if (span) span.style.color="green";
                    }
                    break;
                
                case "MC":
                    answer=oMC.filter(inner=> Number(inner[0])===question[0])[0];
                    if (!answer) {
                        break;
                    }
                    answer=answer[1];
                    const span=[...matchedDiv.querySelectorAll('span')]
                    .find(span=>span.innerText.trim()===answer);
                    if (span) span.style.color="green";
                    break;
            }
        } catch(e){
            console.error("Error processing question:", question, e);
            continue;
        }
    }
    chrome.storage.local.set({done: true, scanning: false});
   }

});
