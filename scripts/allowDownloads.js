/*
This script is intended to be run in the outer context (the main page).
It looks for the CAPTCHA iframe and adds an "allow-downloads" flag to it.
This is done to allow another script to download the CAPTCHA image from
inside the iframe.
*/

(function () {
    const neededTitle = 'recaptcha challenge expires in two minutes';
    const iframes = document.getElementsByTagName('iframe');
    
    for(let i = 0; i < iframes.length; i++){
        if(iframes[i].title == neededTitle) {
            iframes[i].sandbox.add("allow-downloads");
            console.log(iframes[i]);
            return "Success allowing downloads from an iframe";
        }
    }
    return "Failed to find a matching iframe!";
}) ();