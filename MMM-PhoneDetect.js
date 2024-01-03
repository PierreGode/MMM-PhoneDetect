Module.register('MMM-PhoneDetect', {
  // Default module config
  defaults: {
    phones: [], // List of phone MAC addresses to detect
    checkInterval: 5000, // Check for phone presence every 5 seconds
  },

  start: function () {
    console.log("Starting MMM-PhoneDetect module");
    this.sendSocketNotification("CONFIG", this.config);
    this.onlineDevices = new Set(); // Track online devices
  },

  getDom: function() {
    var wrapper = document.createElement("div");

    this.config.phones.forEach(phone => {
      var dot = document.createElement("span");
      dot.className = "phone-dot " + (this.onlineDevices.has(phone) ? "online" : "offline");
      wrapper.appendChild(dot);
    });

    return wrapper;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "PHONE_PRESENCE") {
      // Update onlineDevices based on payload
      // Assuming payload contains the status of each phone
      payload.forEach(phone => {
        if (phone.isOnline) {
          this.onlineDevices.add(phone.mac);
        } else {
          this.onlineDevices.delete(phone.mac);
        }
      });

      this.updateDom();
    }
  },
});
