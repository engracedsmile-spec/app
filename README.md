
# Your PWA Package from PWAer

You're one step away from making your website installable!

## Instructions

1.  **Unzip this Package:**
    *   You'll find all the generated files: `index.html`, `manifest.json`, `sw.js`, etc.

2.  **Host the Files:**
    *   Upload all of these files to any web hosting service or your own web server.
    *   The goal is to have a public URL that points to your new `index.html` file.

3.  **Install the App:**
    *   Visit your new hosted URL on an Android or desktop device using Chrome (or another supported browser).
    *   You should see an install icon in the address bar or a pop-up prompting you to "Add to Home Screen".
    *   Your website will now be installed as an app!

## ! Important Limitation !

This method wraps your website in an <iframe>. For this to work, your website's server must allow it to be embedded.

If your website sends an `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'` header, the app will install correctly but will show a blank screen when opened. This is a security feature of modern browsers that cannot be bypassed.

You can check your website's headers using your browser's developer tools (in the "Network" tab).
    