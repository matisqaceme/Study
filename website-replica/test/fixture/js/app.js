document.getElementById('app').innerHTML = '<p id="rendered">Rendered by JS</p>';

// echo the user agent so tests can tell which device the crawler pretended to be
document.head.insertAdjacentHTML("beforeend", `<meta name="ua" content="${navigator.userAgent}">`);
