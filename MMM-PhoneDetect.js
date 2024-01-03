Module.register("MMM-PhoneDetect", {
  // Default module config
  defaults: {
    phones: [], // List of phone MAC addresses to detect, to be defined in config.js
    turnOnCommand: "vcgencmd display_power 1 2", // Command to turn on the mirror
    turnOffCommand: "vcgencmd display_power 0 2", // Command to turn off the mirror
    checkInterval: 5000, // Check for phone presence every 5 seconds
  },

  // Start method
  start: function () {
    Log.info("Starting MMM-PhoneDetect module");
    this.sendSocketNotification("CONFIG", this.config);
  },

  // Notification handler
  notificationReceived: function (notification, payload, sender) {
    // Handle any specific notifications if needed
  },
});
