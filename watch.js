const sane = require('sane')
const { execSafe, exec, log } = require('helpers-fn')

const DIRECTORY = __dirname
const WATCH_DIRECTORY = `${__dirname}`
const start = ({ directory, command, extensions }) => {
  const globsArr = extensions.map(x => `**/*.${ x }`)
  const watcher = sane(directory, {
    dot      : false,
    poll     : true,
    watchman : false,
    glob     : globsArr,
  })

  watcher.on('ready', () => {
    console.log(`watching ${ directory } has started`)
  })

  let processing = false

  watcher.on('change', filePath => {
    if (processing){
      return console.log(filePath,
        'currently processing previous file change!')
    }
    processing = true
    command(filePath).then(() => {
      processing = false
    })
  })
}

async function onRust(filePath){
  try {
    const runRust = {
      onLog   : console.log,
      cwd     : DIRECTORY,
      command : `cargo run --release -- ${ filePath }`,
    }
    await exec(runRust)
    log('sep')
  } catch (error){
    console.log(error.message, 'handled')
  }
}

start({
  command    : onRust,
  directory  : WATCH_DIRECTORY,
  extensions : [ 'rs' ],
})
