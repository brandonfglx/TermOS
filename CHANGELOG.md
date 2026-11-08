# Release v0.0.12
 - `loc` now permits fetching using any name using OpenStreetMap's Nominatim API - shows all available locations that match description
 - The `Weather` app now allows the user to input any location by its name. Zip codes are still proccessed through [zippopotam.us], but you are prompted to select a specific location if a name matches multiple locations
 - Information inside Dialogs now do not overflow, rather they will scroll in the x and y direction if needed
 - `Header` finally implemented - control the basics of the terminal (shows information about the current session - including save/load) and application specific functions

Known Issues:
 - N/A

# Release v0.0.11
What's new:
 - New dialog: ConfirmDialog - prompts user to confirm or deny an action (returns a `Promise<boolean>`)
 - Added suppport for intermediary directory creation in `touch`, `mkdir`, and `text` commands
 - Fixed `help files [action]` to show arguments for each option
 - Files app can now delete files by using Ctrl+RMB
 - Aliases can now be used when using `help` - call `help [alias]` will call `help [expanded alias]`
 - `loc` command now shows the formatted date + time of fetch
 - **Weather App now has a GUI**: check your weather and search the weather using a zip code
 - Zip codes can be added to the weather sidebar (currently only saved if page is not reloaded)
 - Weather App shows important information about the current weather and forecasted weather
 - Number of days shown in weather app is set at app launch using `weather -d [days]`

Known Issues:
 - Header unimplemented

# Release v0.0.10
What's new:
 - Music app can now load music and playlists using a space-seperated input when launching using Terminal
 - Browser app now has a default/home page that loads on start and can be returned to using the home icon - can be changed using `browser -d [URL]`
 - Added dialogs to all remaining applications

Known Issues:
 - File manipulation commands may still have some issues (not detecting file collisions in certain cases)
 - WeatherApp and Header remain unimplemented
 - Light mode not tested (but should look ok)
 - Text does not create intermediary directories

# Release v0.0.9
What's new:
 - Dialogs are now present to show the user when an application encounters an error instead of failing silently
 - Fixed previous dialogs's CSS and made it non-modal
 - Fixed errors in "mv" especially when renaming files
 - Added reload button in Files app (in the minor case where contents aren't updated)
 - Browser address bar should show the URL the user inputs (does not track the current webpage URL since iframe's privacy limitations)

Known Issues:
 - File manipulation commands may still have some issues (not detecting file collisions in certain cases)
 - WeatherApp and Header remain unimplemented
 - Light mode not tested (but should look ok)

# Release v0.0.8
Implemented the logic for the Music app:
 - Add YouTube videos to a playlist using video ID or URL
 - Batch add videos using a playlist URL (https://www.youtube.com/playlist?list=...)
 - Shuffle videos using the Fisher-Yates algorithm
 - Video titles scroll like a marquee
 - Delete videos with the x button
 - Videos remain intact when exiting the app (but not the TermOS tab)

Some known issues:
 - Titles do not generate for videos (this is caused by a limitation with the YT embed API - accessing titles would require an API key & cost credits)
 - Random errors inside console (depends on browser, but Firfox + uBlock Origin may throw CORS errors that don't impact playback)

# Release v0.0.1 - v0.0.7a
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