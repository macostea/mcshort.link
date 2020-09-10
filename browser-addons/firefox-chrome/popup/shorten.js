var currentTab;

/*
 * Shorten the link and copy to clipboard
 */
function shortenUrl() {
    console.log(currentTab.url);

    fetch("https://mcshort.link/api/shorten", {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'path': currentTab.url
        })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to shorten url');
        }

        return response.json();
    }).then(data => {
        document.getElementById('shortened-url').innerText = data.short_path;
    }).catch(error => {
        console.error('Failed to shorten url: ', error);
        document.getElementById('shortened-url').innerText = "Could not shorten your url. Sorry :("
    })
}

/*
 * Switches currentTab and currentBookmark to reflect the currently active tab
 */
function updateActiveTab(tabs) {
    function updateTab(tabs) {
      if (tabs[0]) {
        currentTab = tabs[0];

        shortenUrl(currentTab.url);
      }
    }
  
    var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
    gettingActiveTab.then(updateTab);
}

function initClipboard() {
    new ClipboardJS('#clipboard');
}

updateActiveTab();
initClipboard();
