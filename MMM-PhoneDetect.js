Module.register('MMM-PhoneDetect', {
  defaults: {
    phones: [], // List of phone MAC addresses to detect
    checkInterval: 5000, // Check for phone presence every 5 seconds
  },

  start: function () {
    console.log("Starting MMM-PhoneDetect module");
    this.sendSocketNotification("CONFIG", this.config);
    this.onlineDevices = new Set(); // Initialize a set to track online devices
  },

  getDom: function() {
    var wrapper = document.createElement("div");
    wrapper.className = "phone-dots-container";

    this.config.phones.forEach(phone => {
      var dot = document.createElement("span");
      dot.className = "phone-dot " + (this.onlineDevices.has(phone) ? "online" : "offline");
      dot.id = "dot-" + phone; // Assign an ID for easier DOM manipulation
      wrapper.appendChild(dot);
    });

    return wrapper;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "PHONE_PRESENCE") {
      payload.forEach(phone => {
        let dot = document.getElementById("dot-" + phone.mac);
        if (dot) {
          if (phone.isOnline) {
            this.onlineDevices.add(phone.mac);
            dot.className = "phone-dot online";
          } else {
            this.onlineDevices.delete(phone.mac);
            dot.className = "phone-dot offline";
          }
        }
      });
    }
  },

  getStyles: function() {
    return ["MMM-PhoneDetect.css"];
  },
});
