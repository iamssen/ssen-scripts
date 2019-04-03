/** @type {optimist.Parser} */
const optimist = require('optimist');
const fs = require('fs');
const path = require('path');
const {exec, cd} = require('shelljs');

const usage = `Basic:
  clone github_repository
  clone github_id/repository
  clone https://github.com/id/repository.git
  clone git@github.com/id/repository.git
  
Upstream Clone:
  clone -u project github_id/repository
`

const argv = optimist
  .usage(usage)
  .alias('r', 'remote')
  .default('r', 'origin')
  .describe('r', 'Remote name')
  .alias('d', 'directory')
  .describe('d', 'Working directory name')
  .alias('b', 'branch')
  .default('b', 'master')
  .describe('b', 'Branch name')
  .default('depth', 1)
  .describe('depth', 'History depth to import')
  .alias('i', 'include')
  .describe('i', 'Include file or directory (ex: -i dir1 -i dir2 -i dir3)')
  .alias('x', 'exclude')
  .describe('x', 'Exclude file or directory (ex: -x dir1 -x dir2 -x dir3)')
  .alias('u', 'upstream')
  .alias('seed', 'upstream')
  .describe('upstream', 'Upstream clone')
  .argv;

if (argv.help || argv._.length === 0) {
  optimist.showHelp();
  process.exit(0);
}

/** @type {string} */
const repository = argv._.pop();
let repositoryUrl, repositoryName;

if (/^http/.test(repository) || /^git@/.test(repository)) {
  repositoryUrl = repository;
  repositoryName = /\/([a-zA-Z0-9\-.]+)\.git$/.exec(repository)[1];
} else if (/([a-zA-Z0-9\-.]+)\/([a-zA-Z0-9\-.]+)/.test(repository)) {
  const [id, repo] = repository.split('/');
  repositoryUrl = `https://github.com/${id}/${repo}.git`
  repositoryName = repo;
} else {
  repositoryUrl = `git@github.com:iamssen/${repository}.git`
  repositoryName = repository;
}

/** @namespace argv.directory */
/** @namespace argv.include */
/** @namespace argv.exclude */

const directory = argv.directory ? argv.directory : repositoryName;
const include = Array.isArray(argv.include)
                      ? argv.include
                      : argv.include
                        ? [argv.include]
                        : null;
const exclude = Array.isArray(argv.exclude)
                      ? argv.exclude
                      : argv.exclude
                        ? [argv.exclude]
                        : null;
const {remote, branch, depth, upstream} = argv;
const baseDirectory = process.cwd();

if (typeof upstream === 'string') {
  // language=sh
  exec(`
    mkdir -p ${baseDirectory}/${upstream};
    cd ${baseDirectory}/${upstream};
    
    git init;
    git remote add -f origin ${repositoryUrl};
    
    git pull --depth=1 origin ${branch};
    
    rm -rf .git;
    git init;
  `);
} else {
  const sparse = () => {
    const config = (include && include.length > 0)
      ? include.map(x => x + '\n').join('')
      : (exclude && exclude.length > 0)
        ? ['/*'].concat(exclude.map(x => '!' + x)).map(x => x + '\n').join('')
        : null;
    
    if (config) {
      const from = path.join(baseDirectory, 'sparse-checkout');
      
      fs.writeFileSync(from, config);
      
      // language=sh
      return `
        git config core.sparseCheckout true;
        mv ${path.join(baseDirectory, 'sparse-checkout')} ${path.join(baseDirectory, directory, '.git', 'info')};
        micro ${path.join(baseDirectory, directory, '.git', 'info', 'sparse-checkout')};
      `
    }
    
    return '';
  }
  
  // language=sh
  exec(`
    mkdir -p ${baseDirectory}/${directory};
    cd ${baseDirectory}/${directory};
    
    git init;
    git remote add -f ${remote} ${repositoryUrl};
    
    ${sparse()}
    
    git pull --depth=${depth} ${remote} ${branch};
  `);
}
