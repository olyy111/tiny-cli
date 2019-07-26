const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const rm = require('rimraf').sync
const path = require('path')
const fs = require('fs')
const minimatch = require('minimatch')

module.exports = function (metadata = {}, src, dest) {
  if (!src) {
    return Promise.reject(new Error(`无效的source：${src}`))
  }
  return new Promise((resolve, reject) => {
    //   .destination(dest)
    // console.log('metalsmish', metadata)
    const ignoreFile = path.join(src, '.templateignore')
    // console.log(ignoreFile)
    // console.log('是否存在', fs.existsSync(ignoreFile))
    Metalsmith(process.cwd())
      .metadata(metadata)
      .clean(false)
      .source(src)
      .destination(dest)
      .use((files, metalsmish, done) => {
        if (fs.existsSync(ignoreFile)) {
          const meta = metalsmish.metadata()
          const ignores = Handlebars.compile(fs.readFileSync(ignoreFile).toString())(meta)
            .split('\n').filter(item => !!item.length)
          console.log('ignoresFiles', ignores)
          Object.keys(files).forEach(fileName => {

            ignores.forEach(ignorePattern => {
              if (minimatch(fileName, ignorePattern)) {
                delete files[fileName]
                console.log('delete fileName', files[fileName])
              }
            })
          })
        }
        done()
      })
      .use((files, metalsmith, done) => {
        const meta = metalsmith.metadata()
        Object.keys(files).forEach(fileName => {
          const t = files[fileName].contents.toString()
          files[fileName].contents = new Buffer(Handlebars.compile(t)(meta))
        })
        done()
      }).build(err => {
        rm(src)
        err ? reject(err) : resolve()
      })
  })
}