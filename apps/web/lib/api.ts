export async function api<T>(path:string,method='GET',body?:unknown):Promise<T> {
  const response=await fetch('/api/v1'+path,{method,credentials:'same-origin',headers:{'Content-Type':'application/json','X-Nebula-Client':'web'},body:body===undefined?undefined:JSON.stringify(body)});
  if(!response.ok){const error=await response.json().catch(()=>({detail:'Service unavailable'}));throw new Error(typeof error.detail==='string'?error.detail:`Request rejected (${response.status})`)}
  return response.json() as Promise<T>;
}
export interface Learner {id:string;name:string;role:'student'|'admin';profile:Partial<Profile>}
export interface Profile {age_range:string;grade:number;curriculum:string;goals:string;subjects:string[];proficiency:string;intensity:string;reduced_motion:boolean}
export interface KnowledgeNode {id:string;name:string;subject:string;description:string;domain:string;estimate:number|null;observations:number;uncertainty:number;priority:number;state:string;reason:string;coverage:number}
export interface GraphData {nodes:KnowledgeNode[];edges:{source:string;target:string;kind:string}[];release:string;fixture:boolean}
export interface Stats {attempts:number;first_attempts:number;first_accuracy:number|null;overall_accuracy:number|null;independent:number;hint_assisted:number;repeats:number;seconds:number;difficulty_distribution:Record<string,number>;history:{date:string;correct:boolean;tier:number;node:string;first:boolean}[];by_subject:Record<string,{n:number;accuracy:number|null}>;improvement:{conclusion:string;reason:string};limitations:string[]}
export interface Dashboard {analytics:Stats;recommendations:KnowledgeNode[];sessions:{id:string;mode:string;subject:string;status:string;release:string}[];release:string}
export interface AssessmentItem {id:string;version_id:string;position:number;node_id:string;tier:number;stem:string;options:Record<string,string>;draft:string|null;flagged:boolean;submitted:boolean;feedback_available_at:string|null;feedback:{correct:boolean;answer:string;solution:string;error:string}|null}
export interface Session {id:string;subject:string;mode:string;release:string;status:string;calculator:boolean;tier:number;deadline:string|null;server_time:string;feedback_delay_seconds:number;items:AssessmentItem[];limit:number;report:KnowledgeNode[]|null}
export interface Note {id:string;title:string;body:string;formula:string;node_id:string|null;updated?:string}
export interface BankQuestion {id:string;state:string;content:{stem:string;options:Record<string,string>;answer:string;solution:string;node_id:string;tier:number;provenance:string};evidence:Record<string,unknown>[]}
export interface BankRelease {id:string;state:string;report:{valid?:boolean;errors?:string[];questions?:number;coverage_policy?:string};created:string}
export const percent=(n:number|null|undefined)=>n==null?'—':`${Math.round(n*100)}%`;
