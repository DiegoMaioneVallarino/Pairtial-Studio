export type Contract = Record<string,'string'|'number'|'boolean'|'object'>
export type ToolDefinition = {id:string;name:string;permission:string;input:Contract;output:Contract}
export type Handler = (args:Record<string,unknown>,signal:AbortSignal)=>Promise<Record<string,unknown>>
function validate(v:unknown,c:Contract): asserts v is Record<string,unknown> {
 if(!v||typeof v!=='object'||Array.isArray(v)) throw Error('Expected object')
 const a=v as Record<string,unknown>
 for(const [k,t] of Object.entries(c)) if(!Object.prototype.hasOwnProperty.call(a,k)||typeof a[k]!==t||(t==='number'&&!Number.isFinite(a[k]))||(t==='object'&&(!a[k]||Array.isArray(a[k])))) throw Error('Invalid field: '+k)
 for(const k of Object.keys(a)) if(!Object.prototype.hasOwnProperty.call(c,k)) throw Error('Unexpected field: '+k)
}
export class ToolRegistry {
 private entries=new Map<string,{definition:ToolDefinition;handler:Handler}>()
 register(definition:ToolDefinition,handler:Handler){if(this.entries.has(definition.id))throw Error('Duplicate tool');this.entries.set(definition.id,{definition:structuredClone(definition),handler})}
 list(){return [...this.entries.values()].map(e=>structuredClone(e.definition))}
 async invoke(id:string,args:unknown,signal:AbortSignal,permissions:readonly string[]){signal.throwIfAborted();const e=this.entries.get(id);if(!e)throw Error('Unknown tool: '+id);if(!permissions.includes(e.definition.permission))throw Error('Permission denied');validate(args,e.definition.input);const result=await e.handler(structuredClone(args),signal);signal.throwIfAborted();validate(result,e.definition.output);return structuredClone(result)}
}
export function createToolRegistry(){const r=new ToolRegistry();const add=(id:string,name:string,input:Contract,output:Contract,handler:Handler)=>r.register({id,name,input,output,permission:'mock.execute'},handler)
 add('sprite.analyze','Sprite Analyzer',{width:'number',height:'number',tileSize:'number'},{frames:'number',columns:'number',rows:'number'},async a=>{const w=Number(a.width),h=Number(a.height),s=Number(a.tileSize);if(![w,h,s].every(n=>Number.isSafeInteger(n)&&n>0)||w%s||h%s||!Number.isSafeInteger(w/s*h/s))throw Error('Invalid grid');return {frames:w/s*h/s,columns:w/s,rows:h/s}})
 add('image.generate','Image Generator',{prompt:'string'},{description:'string',simulated:'boolean'},async a=>({description:String(a.prompt),simulated:true}))
 add('code.compile','Code Compiler',{source:'string'},{characters:'number',simulated:'boolean'},async a=>({characters:String(a.source).length,simulated:true}))
 add('game.build','Game Builder',{name:'string',platform:'string'},{plan:'string',simulated:'boolean'},async a=>({plan:`Build ${a.name} for ${a.platform}`,simulated:true}))
 add('shader.generate','Shader Engine',{effect:'string'},{proposal:'string',simulated:'boolean'},async a=>({proposal:String(a.effect),simulated:true}))
 add('json.parse','JSON Parser',{text:'string'},{value:'object'},async a=>({value:JSON.parse(String(a.text))}))
 return r}
