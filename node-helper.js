const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-PhoneDetect helper started...");
  },

  // Handle the CONFIG notification from the module
  socketNotificationReceived: function (notification, payload) {
    if (notification === "CONFIG") {
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

  // Check if any of the phones are present
  checkPhonePresence: function () {
    const self = this;
    const phoneDetected = this.config.phones.some((mac) => self.isPhonePresent(mac));

    if (phoneDetected) {
      self.sendSocketNotification("PHONE_PRESENCE", true);
      self.turnMirrorOn();
    } else {
      self.sendSocketNotification("PHONE_PRESENCE", false);
      self.turnMirrorOff();
    }
  },

  // Function to check if a phone is present on the network
  isPhonePresent: function (macAddress) {
    // Implement phone presence detection logic here
    // You can use methods like ARP ping or network scanning
    // Return true if the phone is present, false otherwise
  },

  // Turn on the mirror
  turnMirrorOn: function () {
    exec(this.config.turnOnCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error turning on the mirror: ${error}`);
      } else {
        console.log("Mirror turned on.");
      }
    });
  },

  // Turn off the mirror
  turnMirrorOff: function () {
    exec(this.config.turnOffCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error turning off the mirror: ${error}`);
      } else {
        console.log("Mirror turned off.");
      }
    });
  },
});
