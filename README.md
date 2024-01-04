# MMM-PhoneDetect
![image](https://github.com/PierreGode/MMM-PhoneDetect/assets/8579922/b68340ae-3dad-49ec-abe0-71635c4c403c)
<p>
For raspberry pi <p>
Detect if phones are online in the network and turn on and off the mirror depending on the status.
Configured devices in config.js are represented as dots and will show them as green when the device is responding to ARP or nmap.

How to install:
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
  position: "bottom_right", // Change the position as needed
  config: {
    phones: ["XX:XX:XX:XX:XX:XX", "YY:YY:YY:YY:YY:YY"], // List of phone MAC addresses to detect
    turnOnCommand: "vcgencmd display_power 1 2", // Command to turn on the mirror
    turnOffCommand: "vcgencmd display_power 0 2", // Command to turn off the mirror
    startignoreHour: 23, // Begin ignore period at 23:00, this will prevent the Command to turn off/on the mirror specific hours
    endignoreHour: 6,   // End ignore period at 6:00
    checkInterval: 5000, // Check for phone presence every 5 seconds
    nonResponsiveDuration: 1800000, // Duration in milliseconds (30 min by default)
  },
},
```

Default is turn off mirror after 30 minutes if no device is detected, which can be adjusted in config.js<p>
phones go to sleep mode when not used and stop responding to ARP so recommended is to have 30 minutes for one device of inactivity ( nonResponsiveDuration ) before turning off the mirror.
also best if you add multiple devices ( people ) for better stability/redundancy. 1 device 30 min, 2 devices, 15 min, 3 devices, 7 min and so on.

the module is designed for raspberry pi and requires apt programs

```
sudo apt-get install arp-scan -y
sudo apt-get install nmap -y
```
test that the commands for turning on and off the mirror works in terminal

```
vcgencmd display_power 1 2 # Command to turn on the mirror
vcgencmd display_power 0 2 # Command to turn off the mirror
```

If they do not work you might need to change the drivers in /boot/config.txt
```
sudo nano /boot/config.txt
```
change dtoverlay=vc4-kms-v3d to

```
dtoverlay=vc4-fkms-v3d
```
 and reboot


[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/J3J2EARPK)
