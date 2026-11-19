import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateGate } from '../src/forge/gate.mjs';
import * as d from '../src/domain/permit.mjs';
const at='2026-11-19T18:00:00Z', policy={mode:'ENFORCE',failMode:'FAIL_CLOSED'};
function active(){
 let p=d.createPermit({id:'1',projectId:'10',crewId:'Crew A',workers:['a'],verifierIds:['a'],equipment:[{id:'EQ-1',isolationPoints:[{id:'V-3',energyType:'HYDRAULIC',highEnergy:false}]}]});
 p=d.beginLocking(p,'a',at);p=d.applyLock(p,{actorId:'a',pointId:'V-3',lockId:'A',name:'A',at,photoRef:'evidence:a'},policy);p=d.beginVerification(p,'a',at,policy);p=d.verifyPoint(p,{actorId:'a',pointId:'V-3',qrPointId:'V-3',confirmedAtEquipment:true,at});p=d.requestActivation(p,{actorId:'a',verifierId:'a',at});return d.confirmActivation(p,{activationId:p.activations[0].id,actorId:'a',qrEquipmentId:'EQ-1',confirmedAtEquipment:true,at},{policy});
}
const gate=(p,action='START',other=[])=>evaluateGate({data:{projects:{'10':{policy}},permits:Object.fromEntries([p,...other].map(x=>[x.id,x]))},issueId:'1',projectId:'10',action});
test('fresh install defaults advisory; enforce missing permit denies',()=>{
 assert.equal(evaluateGate({data:{projects:{},permits:{}},issueId:'1',projectId:'10',action:'START'}).result,true);
 assert.equal(evaluateGate({data:{projects:{'10':{policy}},permits:{}},issueId:'1',projectId:'10',action:'START'}).result,false);
});
test('start gate requires active named-human confirmation and current isolation',()=>{
 const p=active();assert.equal(gate(p).result,true);assert.equal(gate({...p,state:'VERIFY'}).result,false);assert.equal(gate({...p,activations:[]}).result,false);assert.equal(gate({...p,verifications:[]}).result,false);assert.equal(gate({...p,locks:[]}).result,false);
});
test('release gate checks other crews across project boundaries, never issue properties',()=>{
 let p=d.beginRelease(active(),'a',at);p=d.removePersonalLock(p,{actorId:'a',lockId:'A',at});assert.equal(gate(p,'RELEASE').result,true);
 const b={...active(),id:'2',projectId:'20',crewId:'Crew B'};assert.equal(gate(p,'RELEASE',[b]).result,false);
 assert.equal(gate({...p,state:'ACTIVE'},'RELEASE').result,false);
});
