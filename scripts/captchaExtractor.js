/* 
This script is intended to be run in the inner context (the CAPTCHA iframe).
It recognizes the type of CAPTCHA on the page (dynamic / static tiles), 
and then gets the list of all the images in the iframe, and extracts the needed ones.
*/

(() => {
    console.log("Starting CAPTCHA Image Extractor...");

    // פונקציית עזר להורדת קבצים למחשב
    const sendToServer = async (url, fileName) => {
        // fileName parameter is deprecated and should be removed

        console.log(`CAPTCHA image URL: ${url}`);

        const encoded_url = encodeURICom(url); // encode the URL so there will be no symbols like & = ?
        const response = await fetch(`http://localhost:5000/submit_picture?picURL=${encoded_url}`);
        if (!response.ok) {
            throw new Error(`Request failed! Response status code: ${response.status}`);
        }
        alert("Success sending data to the server!");
        const data = await response.json();
        console.log(data);
        /* 
        The following part is not-so-working, since the CAPTCHA iframe is sandboxed,
        and it doesn't allow downloading files to the computer.
        Also, it would be quite difficult for a local script to detect a file downloading,
        since that doesn't respect user privacy. So, a beter solution is to send the
        picture URL to the server, which will then process it and send it back.
        TODO: delete it if I am sure that it's useless.
        */
        /*
        const a = document.createElement('a');
        console.log(`Saving locally: ${url} as ${fileName}`)
        a.href = url;
        a.download = fileName;
        a.innerText = "CAPTCHAs are weak!";
        document.body.prepend(a);
        a.click();
        document.body.removeChild(a);
        */
    };

    // 1. חילוץ פרטי האתגר והתמונה הראשית [cite: 258-265]
    const descriptionsContainer = document.querySelector('div.rc-imageselect-desc, div.rc-imageselect-desc-no-canonical');
    const instructionText = descriptionsContainer ? descriptionsContainer.innerText.replace(/\s+/g, '_') : "captcha_image";
    
    // השגת ה-URL של תמונת האתגר הראשית (ה-Sprite) [cite: 264]
    const mainImageUrl = document.getElementsByTagName('img')[0].src;
    
    console.log("Main Challenge Image Found. Downloading...");
    sendToServer(mainImageUrl, `${instructionText}_main.png`);
    console.log(`${instructionText}_main.png`); // EDITED BY ME

    // 2. זיהוי האם מדובר באתגר עם תמונות מתחלפות (Fading) [cite: 268-274]
    const isSpecial3x3 = descriptionsContainer && descriptionsContainer.childNodes.length === 3; 
    if (isSpecial3x3) {
        console.log("Detected: Special 3x3 with fading tiles. Monitoring for changes..."); 
        // [cite: 356]
        
        // 3. מנגנון מעקב אחרי תמונות מתחלפות [cite: 388-389]
        // הקוד מאזין לשינויים ב-src של כל תגיות ה-img ב-iframe
        const images = document.querySelectorAll('.rc-image-tile-wrapper img');
        
        images.forEach((img, index) => {
            let lastSrc = img.src;
            
            // שימוש ב-MutationObserver כדי לזהות שינוי ב-Attribute של ה-src
            const observer = new MutationObserver(() => {
                if (img.src !== lastSrc) {
                    console.log(`Tile ${index} changed! Downloading new tile...`); 
                    // [cite: 372]
                    lastSrc = img.src;
                    sendToServer(img.src, `${instructionText}_tile_${index}_replaced_${Date.now()}.png`);
                }
            });

            observer.observe(img, { attributes: true, attributeFilter: ['src'] });
        });
    } else {
        console.log("Detected: Static grid (No fading expected)."); 
        // [cite: 327]
    }
}) ();