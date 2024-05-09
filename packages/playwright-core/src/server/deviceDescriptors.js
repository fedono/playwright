/**
 * @type {import('./types').Devices}
 */
// imp 所有设备对应的信息，可以在 CDP 中设置该信息进行设备模拟
// https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setUserAgentOverride
module.exports = require("./deviceDescriptorsSource.json")
