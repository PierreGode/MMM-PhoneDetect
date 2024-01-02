Module.register("MMM-PhoneDetect", {
  // Default module config
  defaults: {
    phones: [], // List of phone MAC addresses to detect, to be defined in config.js
    turnOnCommand: "vcgencmd display_power 1 2", // Command to turn on the mirror
    turnOffCommand: "vcgencmd display_power 0 2", // Command to turn off the mirror
    checkInterval: 5000, // Check for phone presence every 5 seconds
  },

  nodeHelper: null, // Reference to the Node helper

  // Start method
  start: function () {
    Log.info("Starting MMM-PhoneDetect module");
    this.sendSocketNotification("CONFIG", this.config);
  },

  // Notification handler
  notificationReceived: function (notification, payload, sender) {
    // Handle any specific notifications if needed
  },

  // Socket notification handler
  socketNotificationReceived: function (notification, payload) {
    if (notification === "PHONE_PRESENCE") {
      if (payload === true) {
        Log.info("Phone presence detected. Turning on the mirror.");
        this.turnMirrorOn();
      } else {
        Log.info("No phone presence detected. Turning off the mirror.");
        this.turnMirrorOff();
      }
    }
  },

  // Turn on the mirror
  turnMirrorOn: function () {
    Log.info("Turning on the mirror.");
    // Execute the command to turn on the mirror
    this.sendNotification("REMOTE_ACTION", {
      action: "EXEC",
      command: this.config.turnOnCommand,
    });
  },

  // Turn off the mirror
  turnMirrorOff: function () {
    Log.info("Turning off the mirror.");
    // Execute the command to turn off the mirror
    this.sendNotification("REMOTE_ACTION", {
      action: "EXEC",
      command: this.config.turnOffCommand,
    });
  },
});
