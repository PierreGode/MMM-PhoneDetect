const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-PhoneDetect helper started...");
    this.absenceCount = 0; // Counter for consecutive absences
  },

  // Handle the CONFIG notification from the module
  socketNotificationReceived: function (notification, payload) {
    if (notification === "CONFIG") {
      console.log("MMM-PhoneDetect config found");
      this.config = payload;
      this.scheduleCheck();
    }
  },

  // Schedule periodic checks for phone presence
  scheduleCheck: function () {
    const self = this;
    setInterval(() => {
      self.checkPhonePresence();
    }, this.config.checkInterval);
  },

  // Function to perform ARP scan
  performArpScan: function () {
    return new Promise((resolve, reject) => {
      exec('sudo arp-scan -q -l', (error, stdout, stderr) => {
        if (error) {
          console.error(`MMM-PhoneDetect Error performing ARP scan: ${error.message}`);
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  },

  // Check if any of the phones are present
  checkPhonePresence: function () {
    const self = this;
    this.performArpScan()
      .then(arpScanOutput => {
        const phoneDetected = self.config.phones.some(mac => 
          arpScanOutput.toLowerCase().includes(mac.toLowerCase())
        );

        if (phoneDetected) {
          self.absenceCount = 0; // Reset counter
          self.sendSocketNotification("PHONE_PRESENCE", true);
          console.log("MMM-PhoneDetect detect phone is there.");
          self.turnMirrorOn();
        } else {
          self.absenceCount++; // Increment counter
          if (self.absenceCount >= 5) {
            self.sendSocketNotification("PHONE_PRESENCE", false);
            console.log("MMM-PhoneDetect detect phone is not there.");
            self.turnMirrorOff();
          }
        }
      })
      .catch(error => {
        console.error("Error in performing ARP scan: ", error);
      });
  },

  // Turn on the mirror
  turnMirrorOn: function () {
    exec(this.config.turnOnCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`MMM-PhoneDetect Error turning on the mirror: ${error}`);
      } else {
        console.log("MMM-PhoneDetect Mirror turned on.");
      }
    });
  },

  // Turn off the mirror
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
