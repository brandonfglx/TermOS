# Release v0.0.1 - v0.0.7a (Prep Week 2 - Week 1)
Implemented the following:
 - alias: toggles aliases to commands; aliases are used if a command doesn't exist
 - browser: barebones browser
 - clear: clears the terminal
 - echo: outputs characters to stdout
 - eval: evaluates the command during runtime
 - files: access files in a virtual file system and save it in LocalStorage
 - goto: go to a website on the world wide web
 - help: shows the help menu
 - info: get info about the current device or a file's metadata
 - loc: prints info about the user's location or about the zip code
 - music: barebones music app
 - quit: quits the current program
 - search: search the web with any search engine
 - term: core terminal for TermOS
 - text: a basic text editor
 - weather: shows the weather

Some caveats:
 - As of v0.0.7a, the music app does not function. The UI is visible for preview
 - Files app may have issues with file parsing, etc.
 - Browser app cannot load most websites due to iframe rendering being blocked (and CORS proxy being restricted)

For commits during this period, please see the alpha branch.