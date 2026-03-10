// Banners
export const banner = `

░▒▓███████▓▒░       ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓███████▓▒░    ░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓███████▓▒░       ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░    ░▒▓██████▓▒░  
░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░     
░▒▓█▓▒░░▒▓█▓▒░▒▓██▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓██▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓██▓▒░▒▓█▓▒░     
░▒▓█▓▒░░▒▓█▓▒░▒▓██▓▒░░▒▓██████▓▒░░▒▓██▓▒░▒▓███████▓▒░░▒▓██▓▒░▒▓█▓▒░     
                                                                   
`

export const sub_banner = `

░█▀█░█▀▄░█▀▀░░░█░█░█▀█░█░█░░░█▀▄░█▀▀░█▀█░█▀▄░░░█░█░█▀▀░▀█▀░▀▀█
░█▀█░█▀▄░█▀▀░░░░█░░█░█░█░█░░░█░█░█▀▀░█▀█░█░█░░░░█░░█▀▀░░█░░░▀░
░▀░▀░▀░▀░▀▀▀░░░░▀░░▀▀▀░▀▀▀░░░▀▀░░▀▀▀░▀░▀░▀▀░░░░░▀░░▀▀▀░░▀░░░▀░

`


export const helpmsg = `

    /‾‾\    
    |  |    
    @  @    
    || |/   
    || ||   
    |\\_/|   
    \\___/   
      /\\    
    /‾  ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\\  
    | It looks like you are trying to break something |  
    | Would you like some help with that?             |  
    \\________________________________________________/  

================================================================================
 RUDY | basic HTTP Fuzzer & Crawler
================================================================================

Usage: 
  rudy -u=<url> -m=<mode> -p=<payload>=[OPTIONS] (-wl<path> | (-pl<path> -ul<path>)

Required Arguments:
  -u, --url=<url>           Target URL and port (e.g., http://test.com:80)
  -m, --mode=<mode>          Attack mode: [sniper | ram | spyder]
  -p, --payload=<path>       Path to the raw HTTP payload file to inject into
  -ul, --userlist=<path> *   Path to username wordlist, * if using ram mode 
  -pl, --passlist=<path> *   Path to password wordlist, * if using ram mode
  -wl, --wordlist=<path> *   Path to wordlist, * if using sniper mode

Mode Definitions:
  sniper                     Fuzzes a single parameter using a wordlist.
  ram                        Nested attack: iterates --passlist for every 
                             entry in --userlist.
  spyder                     Recursively crawls the target domain to map 
                             endpoints.

Wordlists & Inputs:
  -wl, --wordlist <path>     [SNIPER] Path to wordlist for single-parameter 
                             fuzzing.
  -ul, --userlist <path>     [RAM] Path to username wordlist.
  -pl, --passlist <path>     [RAM] Path to password wordlist.

Execution Control:
  -w, --workers <num>        Number of concurrent workers, in ram mode: 

                             DON'T USE MORE THAN THE AMOUNT OF USERNAMES IN THE USERLIST
                             Applies to: SNIPER, RAM.
  -d, --delay <ms>           Sets a delay (ms) between requests per worker.
  -j, --jitter               Adds random intervals (delay to delay * 8) to 
                             disrupt patterns. Requires --delay.
  -s, --stealth              Limits fuzzer to 1 request/second to reduce noise. Can be used in conjuction with jitter
  -o, --output <path>        Path to save results as a CSV file.
                             Applies to: SNIPER, RAM.

Miscellaneous:
  -v, --verbose              Increase output detail (verbosity).
  -h, --help                 Display this help message.

--------------------------------------------------------------------------------
   Note on Stealth: 
   High worker counts with long delays still create "burst" patterns. 
   Use --stealth or low worker counts for sensitive targets.
================================================================================

`

export const ram_banner = `

⠀⠀⠀⠀⠀⠀⠀⠠⠴⠶⠾⠿⠿⠿⢶⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⢿⣿⣆⠐⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠿⠿⠆⠹⠦⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣤⣤⣤⣀⠐⣶⣶⣶⣶⣶⣶⡀⢀⣀⣀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠻⢿⣿⡆⢹⡿⠻⢿⣿⣿⣷⠈⠿⠛⠁⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⣴⣾⣷⣤⣉⣠⣾⣷⣦⣼⣿⣿⣿⣧⠀⠀⠀⠀⠀
⠀⣶⣶⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀
⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀
⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣛⠻⢧⣘⡷⠀⠀⠀
⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠀⠀⣉⠛⠿⣷⣦⣌⠁⠀⠀⠀
⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⣠⠘⠀⠀⢹⣿⣶⣶⠀⠀⠀⠀⠀⠀
⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠀⢺⣿⠀⠀⠀⠘⣿⣿⡟⠀⠀⠀⠀⠀⠀
⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀⠀⠁⠀⠀⠀⠀⠻⡟⠃⠀⠀⠀⠀⠀⠀
⠀⠛⠛⠛⠛⠛⠛⠛⠛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

`

export const sniper_banner = `

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣶⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣤⡤⣤⠤⣾⣿⣽⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢀⣀⣠⣤⣤⣀⠀⣀⣼⣿⣿⣿⣶⣶⣶⣶⣶⣶⣶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶⠆
⣼⣿⣿⣿⣿⣧⣤⣿⠿⠉⠿⠿⠿⠛⠛⠛⠛⠛⢹⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠿⠿⠛⠛⠛⠛⠛⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢈⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

`

export const spyder_banner = `

⠀⠀⢀⡟⢀⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣧⠈⣧⠀⠀
⠀⠀⣼⠀⣼⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡆⢸⡆⠀
⠀⢰⣿⠀⠻⠧⣤⡴⣦⣤⣤⣤⣠⡶⣤⣤⠾⠗⠈⣿⠀
⠀⠺⣷⡶⠖⠛⣩⣭⣿⣿⣿⣿⣿⣯⣭⡙⠛⠶⣶⡿⠃
⠀⠀⠀⢀⣤⠾⢋⣴⠟⣿⣿⣿⡟⢷⣬⠙⢷⣄⠀⠀⠀
⢀⣠⡴⠟⠁⠀⣾⡇⠀⣿⣿⣿⡇⠀⣿⡇⠀⠙⠳⣦⣀
⢸⡏⠀⠀⠀⠀⢿⡇⠀⢸⣿⣿⠁⠀⣿⡇⠀⠀⠀⠈⣿
⠀⣷⠀⠀⠀⠀⢸⡇⠀⠀⢻⠇⠀⠀⣿⠇⠀⠀⠀⠀⣿
⠀⢿⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⢸⡏
⠀⠘⡇⠀⠀⠀⠈⣷⠀⠀⠀⠀⠀⢀⡟⠀⠀⠀⠀⡾⠀
⠀⠀⠹⠀⠀⠀⠀⢻⠀⠀⠀⠀⠀⢸⠇⠀⠀⠀⢰⠁⠀
⠀⠀⠀⠁⠀⠀⠀⠈⢇⠀⠀⠀⠀⡞⠀⠀⠀⠀⠁⠀⠀

`