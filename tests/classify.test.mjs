import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyNews, ancestors, descendants } from '../src/lib/news/classify.ts';

const areas = [
 {id:'park',name:'지리산',parent_id:null,aliases:['노고단'],sort_order:1,type:'park'},
 {id:'child',name:'지리산경남',parent_id:'park',aliases:['중산리'],sort_order:2,type:'park'},
 {id:'institute',name:'야생생물보전원',parent_id:null,aliases:['반달가슴곰'],sort_order:3,type:'institute'},
];
test('classifies multiple areas using aliases, summary and the collecting keyword',()=>{
 const ids=classifyNews({title:'중산리 소식',summary:'반달 가슴곰 복원'}, {id:'k',keyword:'지리산경남',news_area_id:'child'},areas);
 assert.deepEqual(new Set(ids),new Set(['park','child','institute']));
 assert.deepEqual(classifyNews({title:'무관한 기사',summary:''},{id:'k',keyword:'국립공원',news_area_id:null},areas),[]);
});
test('includes descendants for parent filtering and terminates malformed cycles',()=>{
 assert.deepEqual(descendants('park',areas),['park','child']);
 const cycle=[{...areas[0],parent_id:'child'},areas[1]];
 assert.deepEqual(new Set(ancestors(['child'],cycle)),new Set(['child','park']));
 assert.deepEqual(new Set(descendants('park',cycle)),new Set(['park','child']));
});

test('North Korean product origin cannot force a Bukhansan park label',()=>{
 const park={id:'b',name:'북한산국립공원',parent_id:null,aliases:['북한산'],sort_order:1,type:'park'};
 const keyword={id:'k',keyword:'북한산',news_area_id:'b'};
 assert.deepEqual(classifyNews({title:'북한산 농산물',summary:'송이버섯 원산지'},keyword,[park]),[]);
 assert.deepEqual(classifyNews({title:'북한산국립공원 탐방',summary:'농산물 장터'},keyword,[park]),['b']);
});
