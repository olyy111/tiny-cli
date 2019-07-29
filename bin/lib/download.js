const download = require('download-git-repo')
const ora = require('ora')
module.exports = function (target) {
  const url = 'https://github.com/olyy111/webpack-mvvm-structure'
  const spinner = ora(`downloading template...`)
  spinner.start()
  return new Promise(function (resolve, reject) {
    download(`direct:${url}#master`, target, { clone: true }, function (err) {
      if (err) {
        spinner.fail()
        reject(err)
      } else {
        spinner.succeed()
        resolve(target)
      }
    })
  })
}

