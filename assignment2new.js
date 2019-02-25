const Gpio = require('onoff').Gpio // #A
const sensorPir = new Gpio(17, 'in', 'both')

// Initialize all LEDs
const blueLED = new Gpio(3, 'out') // #B
const greenLED = new Gpio(5, 'out')
const yellowLED = new Gpio(11, 'out')
const redLED = new Gpio(22, 'out')
const sensorLib = require('node-dht-sensor')
sensorLib.initialize(11, 12) // Pin and sensor type.
sensorLib.initialize(22, 12) // Pin and sensor type

const interval = setInterval(() => { // #C
  read()
}, 2000)

function read () {
  yellowLED.writeSync(1) // Ensure yellow LED is lighting
  let value = (blueLED.readSync() + 1) % 2
  let readout = sensorLib.read() // #C
  console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' + // #D
    'humidity: ' + readout.humidity.toFixed(2) + '%')
  if (readout.temperature.toFixed(2) < 20) {
    blueLED.writeSync(value)
    console.log('Temperature has been registered as below 20.')
    if (readout.temperature.toFixed(2) < 15) {
      let value = (blueLED.readSync() + 1) % 2 // #D
      console.log('Temperature has been registered as below 15.')
      blueLED.write(value, () => {
        console.log('LED state changed to: ' + value)
      })
    }
  }
  if (readout.humidity.toFixed(2) > 60) {
    greenLED.writeSync(1)
    console.log('Humidity has been registered as above 60.')
  } else {
    greenLED.writesync(0)
    console.log('Humidity has been registered as below 60.')
  }
}

sensorPir.watch((err, value) => {
  if (err) exit(err)
  if (value === 1) {
    redblink()
    console.log(value ? 'there is someone!' : 'not anymore!')
  }
})

function redblink () {
  let sum = 0
  const interval = setInterval(() => {
    let value = (redLED.readSync() + 1) % 2
    redLED.readSync(value)
    sum++
    if (sum === 6) {
      clearInterval(interval)
    }
  }, 500)
}

function exit (err) {
  if (err) console.log('Warning! An error has occurred! Note down the following error code: ' + err)
  sensorPir.unexport()
  yellowLED.writeSync(0)
  redLED.unexport()
  process.exit()
}

process.on('SIGINT', () => { // #F
  clearInterval(interval)
  redLED.writeSync(0) // #G
  yellowLED.writeSync(0)
  redLED.unexport()
  console.log('Bye, bye!')
  process.exit()
})

// #A Import the onoff Gpio library
// #B Initialize pin 4 to be an output pin
// #C This interval will be called every 2 seconds
// #D Synchronously read the value of pin 4 and transform 1 to 0 or 0 to 1
// #E Asynchronously write the new value to pin 4
// #F Listen to the event triggered on CTRL+C
// #G Cleanly close the GPIO pin before exiting
