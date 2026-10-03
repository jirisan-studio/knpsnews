import nextEnv from '@next/env';
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
nextEnv.loadEnvConfig(process.cwd());
const names=['SUPABASE_SECRET_KEY','NAVER_CLIENT_ID','NAVER_CLIENT_SECRET','CRON_SECRET'];
const values=names.map(name=>process.env[name]).filter(value=>value && value.length>=12);
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
function walk(path) {return existsSync(path)?readdirSync(path).flatMap(name=>{const file=join(path,name);return statSync(file).isDirectory()?walk(file):[file];}):[];}
const files=[...tracked,...walk('.next/static')];
let leaks=0;
for(const file of files) {const data=readFileSync(file);if(values.some(value=>data.includes(Buffer.from(value)))) leaks++;}
if(tracked.includes('.env.local') || leaks) {console.error('Secret exclusion verification failed. Sensitive values not printed.');process.exitCode=1;}
else console.log(`Secret exclusion verified: ${tracked.length} tracked files and browser bundles checked; no server credentials found.`);
