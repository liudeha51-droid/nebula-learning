import {afterEach,describe,it,expect,vi} from 'vitest';
import {api,percent} from './api';
afterEach(()=>vi.unstubAllGlobals());
describe('data presentation',()=>{
 it('distinguishes missing evidence from zero accuracy',()=>{expect(percent(null)).toBe('—');expect(percent(0)).toBe('0%');expect(percent(.75)).toBe('75%')});
 it('uses same-origin and CSRF custom header',async()=>{const fetch=vi.fn().mockResolvedValue({ok:true,json:async()=>({saved:true})});vi.stubGlobal('fetch',fetch);expect(await api('/notes/a','PUT',{body:'test'})).toEqual({saved:true});expect(fetch).toHaveBeenCalledWith('/api/v1/notes/a',expect.objectContaining({credentials:'same-origin',method:'PUT',headers:expect.objectContaining({'X-Nebula-Client':'web'})}))});
 it('reports backend errors rather than fake success',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:403,json:async()=>({detail:'Administrator role required'})}));await expect(api('/admin/overview')).rejects.toThrow('Administrator role required')});
});
