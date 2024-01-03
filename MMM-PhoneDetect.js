Module.register('MMM-PhoneDetect', {
  // Default module config is not needed for phones as it's provided in config.js

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
