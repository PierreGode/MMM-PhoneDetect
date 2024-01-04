const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-PhoneDetect helper started...");
    this.lastDetectedTime = Date.now(); // Initialize with current time
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CONFIG") {
      console.log("MMM-PhoneDetect: Config found");
      this.config = payload;
      this.scheduleCheck();
    }
  },

  scheduleCheck: function () {
    console.log("MMM-PhoneDetect: Scheduling phone presence checks");
    setInterval(() => {
      this.checkPhonePresence();
    }, this.config.checkInterval);
  },

  performArpScan: function () {
    console.log("MMM-PhoneDetect: Executing ARP scan...");
    return new Promise((resolve, reject) => {
      exec('sudo arp-scan -q -l', (error, stdout) => {
        if (error) {
          console.error(`MMM-PhoneDetect: Error performing ARP scan: ${error.message}`);
          reject(error);
        } else {
          console.log("MMM-PhoneDetect: ARP scan completed");
          resolve(stdout);
        }
      });
    });
  },

performNmapScan: function () {
  console.log("MMM-PhoneDetect: Executing nmap scan...");
  return new Promise((resolve, reject) => {
    const networkRange = '192.168.1.0/24';
    exec(`sudo nmap -sn ${networkRange}`, (error, stdout) => {
      if (error) {
        console.error(`MMM-PhoneDetect: Error performing nmap scan: ${error.message}`);
        reject(error);
      } else {
        console.log("MMM-PhoneDetect: nmap scan completed. Raw output:", stdout);
        resolve(stdout);
      }
    });
  });
},

checkPhonePresence: function () {
  console.log("MMM-PhoneDetect: Checking phone presence...");

  this.performArpScan()
    .then(arpScanOutput => {
      let arpPhoneStatuses = this.config.phones.map(mac => {
        return { mac: mac, isOnline: arpScanOutput.toLowerCase().includes(mac.toLowerCase()) };
      });

      this.performNmapScan().then(nmapScanOutput => {
        console.log("MMM-PhoneDetect: Raw nmap output: \n" + nmapScanOutput);

        let nmapLines = nmapScanOutput.split('\n').filter(line => line.includes('MAC Address:'));
        let nmapPhoneStatuses = this.config.phones.map(mac => {
          const isOnline = nmapLines.some(line => line.toLowerCase().includes(mac.toLowerCase()));
          return { mac: mac, isOnline: isOnline };
        });

        let combinedPhoneStatuses = arpPhoneStatuses.map(arpStatus => {
          let nmapStatus = nmapPhoneStatuses.find(nmapStatus => nmapStatus.mac === arpStatus.mac);
          return { mac: arpStatus.mac, isOnline: arpStatus.isOnline || (nmapStatus ? nmapStatus.isOnline : false) };
        });

        // Check if any device is online
        const anyDeviceOnline = combinedPhoneStatuses.some(status => status.isOnline);
        if (!anyDeviceOnline) {
          console.log("MMM-PhoneDetect: No devices online.");
        } else {
          console.log("MMM-PhoneDetect: Some devices are online.");
        }

        console.log("MMM-PhoneDetect: Sending phone presence status to module");
        this.sendSocketNotification("PHONE_PRESENCE", combinedPhoneStatuses);
      });
    })
    .catch(error => {
      console.error("MMM-PhoneDetect: Error in performing ARP scan: ", error);
    });
},



  // Remaining turn on/off functions...
  turnMirrorOn: function () {
    console.log("MMM-PhoneDetect: Turning on the mirror...");
    exec(this.config.turnOnCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`MMM-PhoneDetect: Error turning on the mirror: ${error}`);
      } else {
        console.log("MMM-PhoneDetect: Mirror turned on.");
      }
    });
  },

  turnMirrorOff: function () {
    console.log("MMM-PhoneDetect: Turning off the mirror...");
    exec(this.config.turnOffCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`MMM-PhoneDetect: Error turning off the mirror: ${error}`);
      } else {
        console.log("MMM-PhoneDetect: Mirror turned off.");
      }
    });
  },
});
