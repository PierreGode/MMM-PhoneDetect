const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-PhoneDetect helper started...");
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

  // Check if any of the phones are present
checkPhonePresence: function () {
  const self = this;
  const phoneDetected = this.config.phones.some((mac) => self.isPhonePresent(mac));

  if (phoneDetected) {
    self.sendSocketNotification("PHONE_PRESENCE", true);
    console.log("MMM-PhoneDetect detect phone is there.");
    self.turnMirrorOn();
  } else {
    self.sendSocketNotification("PHONE_PRESENCE", false);
    console.log("MMM-PhoneDetect detect phone is not there.");
    self.turnMirrorOff(); // Turn off the mirror when no phones are detected
  }
},

// Function to check if a phone is present on the network using ARP scanning
isPhonePresent: function (macAddress) {
  return new Promise((resolve, reject) => {
    exec(`arp-scan -q -l | grep -i ${macAddress}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`MMM-PhoneDetect Error scanning ARP cache: ${error}`);
        resolve(false); // Assume phone is not present in case of error
      } else {
        // Check if the MAC address is found in the ARP cache (case-insensitive)
        const isPresent = stdout.toLowerCase().includes(macAddress.toLowerCase());
        if (isPresent) {
          console.log(`MMM-PhoneDetect Phone ${macAddress} is present.`);
          console.log("MMM-PhoneDetect arp phone is there.");
          resolve(true);
        } else {
          console.log(`MMM-PhoneDetect Phone ${macAddress} is not present.`);
          console.log("MMM-PhoneDetect arp phone is not there.");
          resolve(false);
        }
      }
    });
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
