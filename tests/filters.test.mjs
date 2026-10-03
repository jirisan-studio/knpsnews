import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseFilters,queryHref} from '../src/lib/news/filters.ts';
const now=new Date('2026-10-02T16:00:00Z');
test('date presets use Korean dates and inclusive seven-day boundaries',()=>{
 assert.equal(parseFilters({},now).from,'2026-10-03');
 assert.equal(parseFilters({period:'yesterday'},now).from,'2026-10-02');
 assert.equal(parseFilters({period:'week'},now).from,'2026-09-27');
 assert.equal(parseFilters({period:'month'},now).from,'2026-10-01');
 assert.equal(parseFilters({period:'date',date:'2026-09-15'},now).to,'2026-09-15');
});
test('rejects invalid dates and reversed ranges, preserves other criteria',()=>{
 for(const date of ['2026-02-30','2026-08-31','bad']) assert.throws(()=>parseFilters({period:'date',date},now));
 assert.throws(()=>parseFilters({period:'custom',from:'2026-10-03',to:'2026-09-01'},now));
 assert.equal(queryHref({area:'park',page:'3',from:'2026-09-01'}, {period:'today',page:undefined,from:undefined}),'/?period=today&area=park');
});
