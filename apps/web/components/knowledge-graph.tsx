'use client';
import {useEffect,useRef} from 'react';
import cytoscape from 'cytoscape';
import type {KnowledgeNode,GraphData} from '@/lib/api';
export default function KnowledgeGraph({data,subject,onSelect,compact=false}:{data:GraphData;subject:string;onSelect:(n:KnowledgeNode)=>void;compact?:boolean}) {
  const container=useRef<HTMLDivElement>(null);
  const callback=useRef(onSelect);
  useEffect(()=>{callback.current=onSelect},[onSelect]);
  useEffect(()=>{
    if(!container.current)return;
    const nodes=data.nodes.filter(n=>n.subject===subject);
    const ids=new Set(nodes.map(n=>n.id));
    const width=container.current.clientWidth||600,height=compact?320:510;
    const elements=[...nodes.map((n,i)=>({data:{id:n.id,label:n.name,covered:n.coverage?'yes':'no',priority:n.priority},position:{x:width/2+Math.cos(i*2.4)*(i%2?width*.34:width*.20),y:height/2+Math.sin(i*2.4)*(i%2?height*.32:height*.23)}})),...data.edges.filter(e=>ids.has(e.source)&&ids.has(e.target)).map(e=>({data:{source:e.source,target:e.target,kind:e.kind}}))];
    const cy=cytoscape({container:container.current,elements,layout:{name:'preset'},minZoom:.45,maxZoom:2.2,style:[{selector:'node',style:{'background-color':subject==='math'?'#bdaaff':'#82d5db','border-color':'#c7b5ff','border-width':3,'border-opacity':.2,width:16,height:16,label:'data(label)',color:'#e0dcec','font-size':11,'text-valign':'bottom','text-margin-y':12,'text-background-color':'#111120','text-background-opacity':.65,'text-background-padding':'4px'}},{selector:'node[covered = "no"]',style:{'background-color':'#47445f','border-color':'#77728d','color':'#aaa5bb',width:11,height:11}},{selector:':selected',style:{'border-width':10,'border-opacity':.5,'background-color':'#e1d4ff'}},{selector:'edge',style:{width:1.2,'line-color':'#766492','opacity':.48,'curve-style':'bezier','target-arrow-color':'#766492','target-arrow-shape':'triangle','arrow-scale':.6}},{selector:'edge[kind = "related_concept"]',style:{'line-style':'dashed'}}]});
    cy.on('tap','node',event=>{const selected=nodes.find(n=>n.id===event.target.id());if(selected)callback.current(selected)});
    cy.fit(undefined,compact?32:55);
    const observer=new ResizeObserver(()=>{cy.resize();cy.fit(undefined,compact?32:55)});observer.observe(container.current);
    return()=>{observer.disconnect();cy.destroy()};
  },[data,subject,compact]);
  return <div className={'graph-canvas '+(compact?'compact':'')}><div ref={container} className="cytoscape" role="img" aria-label={`${subject} knowledge relationships. Use the accessible concept list below to select nodes.`}/><span className="graph-coordinate">{subject==='math'?'MATH':'PHYS'} / TAXONOMY 01</span><span className="graph-legend"><i/> Covered concept <i className="uncovered"/> Coverage gap</span></div>
}
