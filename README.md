# MMM-PhoneDetect
Detect if phones are in the network and turn on and off the mirror.
<p></p>



ow to install:
```
cd MagicMirror/modules
```
```
git clone https://github.com/PierreGode/MMM-PhoneDetect.git
```
In MagicMirror/config/config.js
```
{
  module: "MMM-PhoneDetect",
  position: "top_left", // Change the position as needed
  config: {
    phones: ["XX:XX:XX:XX:XX:XX", "YY:YY:YY:YY:YY:YY"], // List of phone MAC addresses to detect
    turnOnCommand: "vcgencmd display_power 1 2", // Command to turn on the mirror
    turnOffCommand: "vcgencmd display_power 0 2", // Command to turn off the mirror
    checkInterval: 5000, // Check for phone presence every 5 seconds
    nonResponsiveDuration: 3600000, // Duration in milliseconds (1 hour by default)
  },
},
```
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/J3J2EARPK)
