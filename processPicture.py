import requests
import os

def processPicture(picURL: str) -> str:
    # TODO: return a list of indices to check.
    # download picture
    
    msg: str

    picURL = picURL.strip("\'\"")

    print(f"\n\n\t{picURL=}\n\n\n")
    
    response = requests.get(picURL)
    
    # check for HTTPError
    if response.status_code != 200:
        msg = f"An error occured downloading the picture. Response code: {response.status_code}"
        print(msg)
        return msg
    

    # make a folder if it's not there
    if not os.path.exists("./downloads"):
        os.mkdir("./downloads")
    
    # write the picture into the file
    with open("./downloads/CAPTCHA.jpg", "wb") as picFile:
        picFile.write(response.content)
        msg = "Picture downloaded successfully!"
    
    print(msg)

    return msg
    # TODO: feed the picture into LLM
    # get the LLM response about what to tick
    # return a list of what to tick