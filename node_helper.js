const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-PhoneDetect helper started...");
    this.absenceCount = 0; // Counter for consecutive absences
    this.lastDetectedTime = Date.now(); // Initialize with current time
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CONFIG") {
      console.log("MMM-PhoneDetect config found");
      this.config = payload;
      this.scheduleCheck();
    }
  },

  scheduleCheck: function () {
    setInterval(() => {
      this.checkPhonePresence();
    }, this.config.checkInterval);
  },

  performArpScan: function () {
    return new Promise((resolve, reject) => {
      console.log("Executing ARP scan...");
      exec('sudo arp-scan -q -l', (error, stdout, stderr) => {
        if (error) {
          console.error(`MMM-PhoneDetect Error performing ARP scan: ${error.message}`);
          reject(error);
        } else {
          console.log("ARP scan completed.");
          resolve(stdout);
        }
      });
    });
  },

  performNmapScan: function () {
    return new Promise((resolve, reject) => {
      const networkRange = '192.168.1.0/24';
      exec(`sudo nmap -sn ${networkRange}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`MMM-PhoneDetect Error performing nmap scan: ${error.message}`);
          reject(error);
        } else {
          console.log("nmap scan completed.");
          resolve(stdout);
        }
      });
    });
  },

  checkPhonePresence: function () {
    this.performArpScan()
      .then(arpScanOutput => {
        let phoneStatuses = this.config.phones.map(mac => {
          const isPresent = arpScanOutput.toLowerCase().includes(mac.toLowerCase());
          console.log(`Phone ${mac} is ${isPresent ? 'present' : 'not present'}.`);
          return { mac: mac, isOnline: isPresent };
        });

        this.sendSocketNotification("PHONE_PRESENCE", phoneStatuses);
      })
      .catch(error => {
        console.error("MMM-PhoneDetect Error in performing ARP scan: ", error);
      });
  },

  handlePhoneDetected: function () {
    this.lastDetectedTime = Date.now();
    console.log("MMM-PhoneDetect detect phone is there.");
  },

  handlePhoneNotDetected: function () {
    const timeSinceLastDetected = Date.now() - this.lastDetectedTime;
    if (timeSinceLastDetected >= this.config.nonResponsiveDuration) {
      console.log("MMM-PhoneDetect detect phone is not there.");
      this.turnMirrorOff();
    }
  },

  turnMirrorOn: function () {
    exec(this.config.turnOnCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`MMM-PhoneDetect Error turning on the mirror: ${error}`);
      } else {
        console.log("MMM-PhoneDetect Mirror turned on.");
      }
    });
  },

  turnMirrorOff: function () {
    exec(this.config.turnOffCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`MMM-PhoneDetect Error turning off the mirror: ${error}`);
      } else {
        console.log("MMM-PhoneDetect Mirror turned off.");
      }
    });
  },
});
