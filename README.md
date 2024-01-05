# MMM-PhoneDetect

<H2>Automatically controls the screen's power based on the presence of specified phones or devices within the network.</H2>

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
Phones go to sleep mode when not used and stop responding to ARP so recommended is to have 30 minutes for one device of inactivity ( nonResponsiveDuration ) configured before the module turns off the mirror.
also best if you add multiple devices ( people ) for better stability/redundancy. 1 device 30 min, 2 devices, 15 min, 3 devices, 7 min and so on.

the module is designed for raspberry pi and requires apt programs

```
sudo apt-get install arp-scan -y
sudo apt-get install nmap -y
```


"Dual-Scan Technology" in the context of the MMM-PhoneDetect module for MagicMirror refers to the combined use of ARP (Address Resolution Protocol) and nmap (Network Mapper) scans to detect the presence of specific devices (like mobile phones) on a network. Here's a breakdown of how each technology contributes to the dual-scan approach:
<p>
ARP Scan:
<p>
Purpose: ARP is used for mapping IP network addresses to the hardware addresses (MAC addresses) used by a data link protocol.
Operation: The ARP scan sends requests to each IP address in the subnet and listens for responses. Each responding device provides its MAC address.
Use in MMM-PhoneDetect: ARP scanning is a fast and efficient way to discover devices that are directly reachable in the local network. In the context of MMM-PhoneDetect, it's used to quickly check if the phones (identified by their MAC addresses) are currently active on the local network.
nmap Scan:
<p>
Purpose: nmap is a network scanning tool used for network discovery and security auditing.
Operation: nmap can be used to discover devices on a network and determine various characteristics about them, such as open ports, operating systems, device types, and more.
Use in MMM-PhoneDetect: In this module, nmap is used in a more passive mode (-sn flag) to perform a network sweep without port scanning. It helps in identifying devices that might not respond to ARP but are still present on the network.
How Dual-Scan Works Together:<p>
Complementary Methods: While ARP scan is quick and works well within the local subnet, nmap provides a more comprehensive network sweep.
Enhanced Reliability: By combining both methods, MMM-PhoneDetect increases the reliability of detecting whether the specified phones are present on the network. If a device doesn't respond to an ARP request (possibly due to being in a power-saving mode or other reasons), the nmap scan might still detect its presence.<p>
Decision Making for Screen Control: The module uses the results from both scans to decide whether to turn the MagicMirror screen on or off. If any of the specified devices are detected by either ARP or nmap scan, the screen is turned on; if all devices are absent according to both scans, and the specified time conditions are met, the screen is turned off.
<p>

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

/Created by Pierre Gode


[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/J3J2EARPK)

development status = WIP
