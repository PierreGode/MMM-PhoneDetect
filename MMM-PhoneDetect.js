Module.register('MMM-PhoneDetect', {
  // Default module configuration
  defaults: {
    phones: [], // List of phone MAC addresses to detect
    checkInterval: 5000, // Check for phone presence every 5 seconds
  },

  start: function () {
    console.log("Starting MMM-PhoneDetect module");
    this.sendSocketNotification("CONFIG", this.config);
    this.onlineDevices = new Set(); // Initialize a set to track online devices
  },

  // Override dom generator
  getDom: function() {
    var wrapper = document.createElement("div");
    wrapper.className = "phone-dots-container"; // Added class for potential styling

    this.config.phones.forEach(phone => {
      var dot = document.createElement("span");
      dot.className = "phone-dot " + (this.onlineDevices.has(phone) ? "online" : "offline");
      wrapper.appendChild(dot);
    });

    return wrapper;
  },

  // Handling socket notifications
  socketNotificationReceived: function(notification, payload) {
    if (notification === "PHONE_PRESENCE") {
      // Update onlineDevices based on payload
      this.onlineDevices.clear(); // Clear and update the set based on the latest payload
      payload.forEach(phone => {
        if (phone.isOnline) {
          this.onlineDevices.add(phone.mac);
        }
      });

      this.updateDom(); // Update the DOM whenever the online status changes
    }
  },

  // Load external CSS file
  getStyles: function() {
    return ["MMM-PhoneDetect.css"];
  },
});
