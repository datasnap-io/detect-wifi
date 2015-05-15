# detect-wifi
Detect distinct wifi signals on raspberry pi 

#Hardware dependencies
- 2 Wifi dongles (mapped to specific interfaces, see init_wifi.sh)

#Software Dependencies
-node
-python
-http://www.aircrack-ng.org/
-airodump-ng

#To run
On initial system boot you need to map dongles to interface names the following script does that assuming dongles are plugged in in the same configuration found on the prototype
```./init_wifi.sh

```sudo node scrape_wifi.js

Logs will show up in /logs
