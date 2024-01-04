// PhoneDetect by Pierre Gode
const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-PhoneDetect helper started...");
    this.lastOnlineTime = Date.now(); // Initialize with current time
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CONFIG") {
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
      exec('sudo arp-scan -q -l', (error, stdout) => {
        if (error) {
          console.error(`MMM-PhoneDetect: Error performing ARP scan: ${error.message}`);
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  },

  performNmapScan: function () {
    return new Promise((resolve, reject) => {
      const networkRange = '192.168.1.0/24';
      exec(`sudo nmap -sn ${networkRange}`, (error, stdout) => {
        if (error) {
          console.error(`MMM-PhoneDetect: Error performing nmap scan: ${error.message}`);
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  },

  checkPhonePresence: function () {
    this.performArpScan()
      .then(arpScanOutput => {
        let arpPhoneStatuses = this.config.phones.map(mac => {
          return { mac: mac, isOnline: arpScanOutput.toLowerCase().includes(mac.toLowerCase()) };
        });

        this.performNmapScan().then(nmapScanOutput => {

          let nmapLines = nmapScanOutput.split('\n').filter(line => line.includes('MAC Address:'));
          let nmapPhoneStatuses = this.config.phones.map(mac => {
            const isOnline = nmapLines.some(line => line.toLowerCase().includes(mac.toLowerCase()));
            return { mac: mac, isOnline: isOnline };
          });

          let combinedPhoneStatuses = arpPhoneStatuses.map(arpStatus => {
            let nmapStatus = nmapPhoneStatuses.find(nmapStatus => nmapStatus.mac === arpStatus.mac);
            return { mac: arpStatus.mac, isOnline: arpStatus.isOnline || (nmapStatus ? nmapStatus.isOnline : false) };
          });

          const anyDeviceOnline = combinedPhoneStatuses.some(status => status.isOnline);
          if (anyDeviceOnline) {
            this.turnMirrorOn();
            this.lastOnlineTime = Date.now();
          } else {
            this.checkAndTurnOffMirror();
          }
          this.sendSocketNotification("PHONE_PRESENCE", combinedPhoneStatuses);
        });
      })
      .catch(error => {
      });
  },

  checkAndTurnOffMirror: function () {
    if (Date.now() - this.lastOnlineTime >= this.config.nonResponsiveDuration && !this.isWithinIgnoreHours()) {
      this.turnMirrorOff();
    }
  },

  turnMirrorOn: function () {
    if (!this.isWithinIgnoreHours()) {
      console.log("MMM-PhoneDetect: Turning on the mirror...");
      exec(this.config.turnOnCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`MMM-PhoneDetect: Error turning on the mirror: ${error}`);
        } else {
          console.log("MMM-PhoneDetect: Mirror turned on.");
        }
      });
    } else {
      console.log("MMM-PhoneDetect: Ignoring turn on command due to ignore hours.");
    }
  },

  turnMirrorOff: function () {
    if (!this.isWithinIgnoreHours()) {
      console.log("MMM-PhoneDetect: Turning off the mirror...");
      exec(this.config.turnOffCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`MMM-PhoneDetect: Error turning off the mirror: ${error}`);
        } else {
          console.log("MMM-PhoneDetect: Mirror turned off.");
        }
      });
    } else {
      console.log("MMM-PhoneDetect: Ignoring turn off command due to ignore hours.");
    }
  },

  isWithinIgnoreHours: function() {
    const currentHour = new Date().getHours();
    const { startignoreHour, endignoreHour } = this.config;

    if (startignoreHour < endignoreHour) {
      return currentHour >= startignoreHour && currentHour < endignoreHour;
    } else {
      return currentHour >= startignoreHour || currentHour < endignoreHour;
    }
  },
});
