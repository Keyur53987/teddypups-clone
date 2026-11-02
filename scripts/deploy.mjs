// Deploy prebuilt static files to GitHub Pages without requesting workflow scope.
import { mkdir, cp } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const deploy=path.join(root,'.deploy');
function run(program,args,cwd=root,env=process.env){
  const result=spawnSync(program,args,{cwd,env,stdio:'inherit'});
  if(result.status!==0) process.exit(result.status||1);
}
run(process.execPath,['--test','tests/build.test.mjs','tests/logic.test.mjs']);
run(process.execPath,['scripts/build.mjs'],root,{...process.env,BASE_PATH:'/teddypups-clone',SITE_URL:'https://keyur53987.github.io'});
await mkdir(deploy,{recursive:true});
await cp(path.join(root,'dist'),deploy,{recursive:true});
run('git',['init','-b','gh-pages'],deploy);
run('git',['add','.'],deploy);
// Every invocation makes a deployment commit, including repeated source states.
run('git',['commit','--allow-empty','-m','Deploy verified static website'],deploy);
run('git',['push','https://github.com/Keyur53987/teddypups-clone.git','HEAD:gh-pages'],deploy);
