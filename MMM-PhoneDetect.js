Module.register('MMM-PhoneDetect', {
  // Default module config
  defaults: {
    phones: [], // List of phone MAC addresses to detect, to be defined in config.js
    checkInterval: 5000, // Check for phone presence every 5 seconds
  },

  // Start method
  start: function () {
    console.log("Starting MMM-PhoneDetect module");
    this.sendSocketNotification("CONFIG", this.config);
  },

  // Notification handler
  notificationReceived: function (notification, payload, sender) {
    // Handle any specific notifications if needed
  },
});
