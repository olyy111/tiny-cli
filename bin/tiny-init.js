#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const download = require('./lib/download')
const inquirer = require('inquirer')
const latestVersion = require('latest-version')
const generator = require('./lib/generator')
const chalk = require('chalk')
const logSymbols = require('log-symbols')

program.usage('<project-name>').parse(process.argv)

let projectName = program.args[0]


if (!projectName) {
  program.help() 
  return
}

const list = glob.sync('*')  
let next = undefined
let rootName = path.basename(process.cwd())

if (list.length) {
  if (list.filter(name => {
      const fileName = path.resolve(process.cwd(), path.join('.', name))
      const isDir = fs.statSync(fileName).isDirectory()
      return name.indexOf(projectName) !== -1 && isDir
    }).length !== 0) {
    console.log(`project${projectName} already exists`)
    return
  }
  next = Promise.resolve(projectName)
} else if (rootName === projectName) {
  next = inquirer.prompt([
    {
      name: 'buildInCurrent',
      message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
      type: 'confirm',
      default: true
    }
  ]).then(answer => {
    return Promise.resolve(answer.buildInCurrent ? '.' : projectName)
  })
} else {
  next = Promise.resolve(projectName)
}

next && go()

function go () {
  next.then(projectRoot => {
    if (projectRoot !== '.') {
      fs.mkdirSync(projectRoot)
    }
    
    const tempDir = './temp22331100__@@##'
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir) 
    }
    return download(tempDir).then(target => {
      return {
        name: projectRoot,
        root: projectRoot,
        downloadTemp: target
      }
    })
  }).then(context => {
    console.log('context', context)
    return inquirer.prompt([
      {
        name: 'projectName',
    	  message: '项目的名称',
        default: context.name
      }
    ]).then(answers => {
      return latestVersion('tiny-ui').then(version => {
        console.log('version', version)
        answers.supportUiVersion = version
        return {
          ...context,
          metadata: {
            ...answers
          }
        }
      }).catch(err => {
        return Promise.reject(err)
      })
    })
  }).then(context => {
    return generator(context.metadata, context.downloadTemp, context.root)
  }).then(() => {
    console.log(logSymbols.success, chalk.green('创建成功'))
    console.log(chalk.green(`cd ${context.root}`))
    console.log(chalk.green(`yarn`))
    console.log(chalk.green(`yarn dev`))
  }).catch(err => {
    console.error(logSymbols.error, chalk.red(`创建失败：${err}`))
  })
}
