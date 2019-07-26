const download = require('download-git-repo')
const ora = require('ora')
module.exports = function (target) {
  const url = 'https://github.com/olyy111/webpack-mvvm-structure'
  const spinner = ora(`正在下载项目模板，源地址：${url}`)
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
